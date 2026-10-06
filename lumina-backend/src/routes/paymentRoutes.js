import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { initializeCheckout, handleWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payments/checkout
router.post('/checkout', protect, initializeCheckout);

// POST /api/payments/webhook (unprotected)
router.post('/webhook', handleWebhook);

export default router;
