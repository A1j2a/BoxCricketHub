import express from 'express';
import { verifyToken } from './userRoutes.js';

const router = express.Router();

// Mock bookings data
let bookings = [];
let nextBookingId = 1;

// Get user's bookings
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userBookings = bookings.filter(booking => booking.user_id === req.user.id);
    
    res.json({
      error: false,
      bookings: userBookings
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    res.json({
      error: false,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const bookingData = {
      id: nextBookingId++,
      user_id: req.user.id,
      ...req.body,
      status: 'confirmed',
      booking_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    bookings.push(bookingData);

    res.status(201).json({
      error: false,
      message: 'Booking created successfully',
      booking: bookingData
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const bookingIndex = bookings.findIndex(b => b.id === parseInt(req.params.id));
    if (bookingIndex === -1) {
      return res.status(404).json({ error: true, message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (bookings[bookingIndex].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    bookings[bookingIndex].status = 'cancelled';
    bookings[bookingIndex].updated_at = new Date().toISOString();

    res.json({
      error: false,
      message: 'Booking cancelled successfully',
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;