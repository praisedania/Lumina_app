import models from '../models/index.js';
import { validate as isUuid } from 'uuid';


/**
 * @desc    Get chat history for a specific conversation
 * @route   GET /api/chat/history/:conversationId
 * @access  Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // 1. Check if conversation exists
    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: 'error', message: 'Conversation not found' });
    }

    // 2. Check access
    if (conversation.type === 'room') {
      const isEnrolled = await models.Enrollment.findOne({
        where: { user_id: userId, course_id: conversation.course_id }
      });
      const isInstructor = await models.Course.findOne({
        where: { id: conversation.course_id, instructor_id: userId }
      });

      if (!isEnrolled && !isInstructor) {
        return res.status(403).json({ status: 'error', message: 'Not authorized to view this room history' });
      }
    } else if (conversation.type === 'dm') {
      if (!conversation.participants.includes(userId)) {
        return res.status(403).json({ status: 'error', message: 'Not authorized for this DM' });
      }
    }

    // 3. Fetch messages (paginated)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const messages = await models.Message.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages: messages.rows.reverse(), // Return in chronological order
        total: messages.count,
        pages: Math.ceil(messages.count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get user's conversations (rooms and DMs)
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Course Rooms (enrolled or instructing)
    const enrollments = await models.Enrollment.findAll({
      where: { user_id: userId },
      attributes: ['course_id']
    });
    const courseIds = enrollments.map(e => e.course_id);

    const instructedCourses = await models.Course.findAll({
      where: { instructor_id: userId },
      attributes: ['id']
    });
    const instructedIds = instructedCourses.map(c => c.id);

    const allCourseIds = [...new Set([...courseIds, ...instructedIds])];

    const courseRooms = await models.Conversation.findAll({
      where: { 
        type: 'room',
        course_id: allCourseIds
      },
      include: [{ model: models.Course, as: 'course', attributes: ['id', 'title', 'thumbnail_url'] }]
    });

    // 2. Get DMs
    const dmsRaw = await models.Conversation.findAll({
      where: {
        type: 'dm',
        participants: {
          [models.Sequelize.Op.contains]: [userId]
        }
      }
    });

    // Enrich DMs with other participant details and last message
    const dms = await Promise.all(
      dmsRaw.map(async (dm) => {
        const dmObj = dm.toJSON();
        const otherUserId = (dm.participants || []).find((id) => id !== userId);
        if (otherUserId) {
          const otherUser = await models.User.findByPk(otherUserId, {
            attributes: ['id', 'name', 'email', 'role', 'avatar_url']
          });
          dmObj.recipient = otherUser;
        }

        const lastMsg = await models.Message.findOne({
          where: { conversation_id: dm.id },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'text', 'sender_id', 'createdAt']
        });
        dmObj.lastMessage = lastMsg;

        return dmObj;
      })
    );

    // Also enrich courseRooms with last message
    const enrichedRooms = await Promise.all(
      courseRooms.map(async (room) => {
        const roomObj = room.toJSON();
        const lastMsg = await models.Message.findOne({
          where: { conversation_id: room.id },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'text', 'sender_id', 'createdAt']
        });
        roomObj.lastMessage = lastMsg;
        return roomObj;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        courseRooms: enrichedRooms,
        dms
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Start or get a DM conversation
 * @route   POST /api/chat/conversation
 * @access  Private
 */
export const startConversation = async (req, res) => {
  try {
    const { recipientId, recipientUsername, recipientEmail, email, name, text } = req.body;
    const userId = req.user.id;

    // 1. Find recipient
    let recipient;
    if (recipientId) {
      if (!isUuid(recipientId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid recipientId format (must be a UUID)' });
      }
      recipient = await models.User.findByPk(recipientId);
    } else if (recipientEmail || email) {
      const targetEmail = (recipientEmail || email).trim().toLowerCase();
      recipient = await models.User.findOne({ where: { email: targetEmail } });
    } else if (recipientUsername || name) {
      const query = (recipientUsername || name).trim();
      recipient = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: [
            { name: { [models.Sequelize.Op.iLike]: query } },
            { email: { [models.Sequelize.Op.iLike]: query } }
          ]
        }
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'recipientId, recipientEmail, or recipientUsername is required' });
    }

    if (!recipient) {
      return res.status(404).json({ status: 'error', message: 'Recipient not found' });
    }

    const resolvedRecipientId = recipient.id;

    if (userId === resolvedRecipientId) {
      return res.status(400).json({ status: 'error', message: 'You cannot start a DM with yourself' });
    }

    // 2. Check if DM already exists between these two
    let conversation = await models.Conversation.findOne({
      where: {
        type: 'dm',
        participants: {
          [models.Sequelize.Op.contains]: [userId, resolvedRecipientId]
        }
      }
    });

    // 3. Create new DM if it doesn't exist
    if (!conversation) {
      conversation = await models.Conversation.create({
        type: 'dm',
        participants: [userId, resolvedRecipientId]
      });
    }

    // 4. Create initial message if text is provided
    let initialMessage = null;
    if (text && text.trim() !== '') {
      initialMessage = await models.Message.create({
        conversation_id: conversation.id,
        sender_id: userId,
        text
      });

      // Emit via Socket.io if possible
      const io = req.app.get('socketio');
      if (io) {
        const messageWithDetails = await models.Message.findByPk(initialMessage.id, {
          include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'avatar_url'] }]
        });
        io.to(conversation.id).emit('receive_message', messageWithDetails);
      }
    }

    res.status(201).json({ 
      status: 'success', 
      data: {
        conversation,
        message: initialMessage
      }
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Send a message via REST (fallback for WebSockets)
 * @route   POST /api/chat/message
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const userId = req.user.id;

    if (!conversationId || !text) {
      return res.status(400).json({ status: 'error', message: 'conversationId and text are required' });
    }

    if (!isUuid(conversationId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid conversationId format (must be a UUID)' });
    }

    // 1. Check access
    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: 'error', message: 'Conversation not found' });
    }

    if (conversation.type === 'room') {
      const isEnrolled = await models.Enrollment.findOne({ where: { user_id: userId, course_id: conversation.course_id } });
      const isInstructor = await models.Course.findOne({ where: { id: conversation.course_id, instructor_id: userId } });
      if (!isEnrolled && !isInstructor) return res.status(403).json({ status: 'error', message: 'Not authorized' });
    } else {
      if (!conversation.participants.includes(userId)) return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    // 2. Create message
    const message = await models.Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      text
    });

    // 3. Emit via Socket.io if possible
    const io = req.app.get('socketio');
    if (io) {
      const messageWithDetails = await models.Message.findByPk(message.id, {
        include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'avatar_url'] }]
      });
      io.to(conversationId).emit('receive_message', messageWithDetails);
    }

    res.status(201).json({ status: 'success', data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get the conversation ID for a specific course room
 * @route   GET /api/chat/course/:courseId
 * @access  Private
 */
export const getCourseConversation = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1. Check if user is enrolled or instructor
    const isEnrolled = await models.Enrollment.findOne({ where: { user_id: userId, course_id: courseId } });
    const isInstructor = await models.Course.findOne({ where: { id: courseId, instructor_id: userId } });

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({ status: 'error', message: 'You must be enrolled to access the course chat' });
    }

    // 2. Find the room
    let conversation = await models.Conversation.findOne({
      where: { type: 'room', course_id: courseId }
    });

    // 3. Lazy Initialization: Create the room if it's missing (for older courses)
    if (!conversation) {
      conversation = await models.Conversation.create({
        type: 'room',
        course_id: courseId,
        participants: []
      });
    }

    res.status(200).json({ status: 'success', data: conversation });
  } catch (error) {
    console.error('Error fetching course conversation:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Search / list users for direct messaging
 * @route   GET /api/chat/users
 * @access  Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { query = '' } = req.query;
    const currentUserId = req.user.id;

    const whereClause = {
      id: { [models.Sequelize.Op.ne]: currentUserId },
      isVerified: true
    };

    if (query && query.trim()) {
      whereClause[models.Sequelize.Op.or] = [
        { name: { [models.Sequelize.Op.iLike]: `%${query.trim()}%` } },
        { email: { [models.Sequelize.Op.iLike]: `%${query.trim()}%` } }
      ];
    }

    const users = await models.User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'avatar_url'],
      limit: 25,
      order: [['name', 'ASC']]
    });

    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

