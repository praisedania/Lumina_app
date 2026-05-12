import jwt from 'jsonwebtoken';
import models from '../models/index.js';

export const chatHandler = (io, socket) => {
  console.log(`User connected to chat: ${socket.id}`);

  // 1. Join a Conversation (Room or DM)
  socket.on('join_room', async (conversationId) => {
    try {
      const userId = socket.user.id; // From middleware

      // Fetch the conversation to check access
      const conversation = await models.Conversation.findByPk(conversationId);
      if (!conversation) {
        return socket.emit('error', { message: 'Conversation not found' });
      }

      // If it's a course room, check enrollment
      if (conversation.type === 'room') {
        const isEnrolled = await models.Enrollment.findOne({
          where: { user_id: userId, course_id: conversation.course_id }
        });

        // Instructors can join rooms of courses they created
        const isInstructor = await models.Course.findOne({
          where: { id: conversation.course_id, instructor_id: userId }
        });

        if (!isEnrolled && !isInstructor) {
          return socket.emit('error', { message: 'Not authorized to join this room' });
        }
      }

      // If it's a DM, check if user is a participant
      if (conversation.type === 'dm') {
        if (!conversation.participants.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized for this DM' });
        }
      }

      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
      socket.emit('joined', { conversationId });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // 2. Send Message to existing conversation
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, text } = data;
      const userId = socket.user.id;

      if (!text || text.trim() === '') return;

      // 1. Fetch conversation to check access
      const conversation = await models.Conversation.findByPk(conversationId);
      if (!conversation) {
        return socket.emit('error', { message: 'Conversation not found' });
      }

      // 2. Security Check (DM vs Room)
      if (conversation.type === 'room') {
        const isEnrolled = await models.Enrollment.findOne({ where: { user_id: userId, course_id: conversation.course_id } });
        const isInstructor = await models.Course.findOne({ where: { id: conversation.course_id, instructor_id: userId } });
        if (!isEnrolled && !isInstructor) {
          return socket.emit('error', { message: 'Not authorized for this course room' });
        }
      } else {
        if (!conversation.participants.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized for this DM' });
        }
      }

      // 3. Auto-join if not in room
      if (!socket.rooms.has(conversationId)) {
        socket.join(conversationId);
      }

      // 4. Save and Broadcast
      const message = await models.Message.create({
        conversation_id: conversationId,
        sender_id: userId,
        text: text
      });

      const messageWithDetails = await models.Message.findByPk(message.id, {
        include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'avatar_url'] }]
      });

      io.to(conversationId).emit('receive_message', messageWithDetails);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // 3. Send Direct Message by Recipient ID or Username
  socket.on('send_dm', async (data) => {
    try {
      const { recipientId, recipientUsername, text } = data;
      const userId = socket.user.id;

      if (!text || text.trim() === '') return;

      // 1. Find recipient
      let recipient;
      if (recipientId) {
        recipient = await models.User.findByPk(recipientId);
      } else if (recipientUsername) {
        recipient = await models.User.findOne({ where: { username: recipientUsername } });
      } else {
        return socket.emit('error', { message: 'recipientId or recipientUsername required' });
      }

      if (!recipient) {
        return socket.emit('error', { message: 'Recipient not found' });
      }

      if (recipient.id === userId) {
        return socket.emit('error', { message: 'Cannot DM yourself' });
      }

      // 2. Find/Create DM Conversation
      let conversation = await models.Conversation.findOne({
        where: {
          type: 'dm',
          participants: { [models.Sequelize.Op.contains]: [userId, recipient.id] }
        }
      });

      if (!conversation) {
        conversation = await models.Conversation.create({
          type: 'dm',
          participants: [userId, recipient.id]
        });
      }

      // 3. Auto-join
      socket.join(conversation.id);

      // 4. Save and Broadcast
      const message = await models.Message.create({
        conversation_id: conversation.id,
        sender_id: userId,
        text: text
      });

      const messageWithDetails = await models.Message.findByPk(message.id, {
        include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'avatar_url'] }]
      });

      io.to(conversation.id).emit('receive_message', messageWithDetails);
      socket.emit('dm_sent', { conversationId: conversation.id, message: messageWithDetails });
      
    } catch (error) {
      console.error('Error sending DM:', error);
      socket.emit('error', { message: 'Failed to send DM' });
    }
  });

  // 3. Typing Indicator
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(conversationId).emit('user_typing', {
      userId: socket.user.id,
      userName: socket.user.name,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

// Socket Authentication Middleware
export const socketAuth = async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers.authorization;
    const token = socket.handshake.auth.token || (authHeader && authHeader.split(' ')[1]);

    if (!token) {
      return next(new Error('No token provided'));
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return next(new Error('Token expired or invalid'));
    }

    const user = await models.User.findByPk(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket auth internal error:', err);
    next(new Error('Internal server error during authentication'));
  }
};
