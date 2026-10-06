import express from 'express';
import {
  getChatHistory,
  getMyConversations,
  startConversation,
  sendMessage,
  getCourseConversation,
  searchUsers,
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/users', searchUsers);
router.get('/history/:conversationId', getChatHistory);
router.get('/conversations', getMyConversations);
router.get('/course/:courseId', getCourseConversation);
router.post('/conversation', startConversation);
router.post('/message', sendMessage);

export default router;

