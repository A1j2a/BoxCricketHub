import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyToken } from './userRoutes.js';

const router = express.Router();

// Initialize Razorpay instance
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({
        error: true,
        message: 'Razorpay not configured. Please contact support.'
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: receipt || `order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      error: false,
      order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create order'
    });
  }
});

// Verify payment
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({
        error: true,
        message: 'Razorpay not configured. Please contact support.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        error: false,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        error: true,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: true,
      message: 'Payment verification failed'
    });
  }
});

// Get payment details
router.get('/payment/:paymentId', verifyToken, async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({
        error: true,
        message: 'Razorpay not configured. Please contact support.'
      });
    }

    const payment = await razorpayInstance.payments.fetch(req.params.paymentId);

    res.json({
      error: false,
      payment
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch payment details'
    });
  }
});

export default router;