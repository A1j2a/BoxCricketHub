import express from 'express';
import * as bookingsData from '../../data/bookingsData.js';
import * as slotsData from '../../data/slotsData.js';
import * as groundsData from '../../data/groundsData.js';
import { verifyToken, isAdmin } from './userRoutes.js';

const router = express.Router();

// Get bookings for the current user
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await bookingsData.getBookingsByUserId(req.user.id);
    res.status(200).json({
      error: false,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { slot_id, notes } = req.body;
    
    // Get the slot details
    const slot = await slotsData.getSlotById(slot_id);
    
    if (!slot) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }
    
    if (slot.is_booked) {
      return res.status(400).json({ error: true, message: 'This slot is already booked' });
    }
    
    // Get the ground details to calculate payment amount
    const ground = await groundsData.getGroundById(slot.ground_id);
    
    // Calculate payment amount based on slot duration and ground hourly rate
    // This is a simple calculation, you might want to adjust based on your business logic
    const payment_amount = parseFloat(slot.price);
    
    const newBooking = await bookingsData.createBooking({
      user_id: req.user.id,
      slot_id,
      payment_amount,
      notes
    });
    
    res.status(201).json({
      error: false,
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get a specific booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await bookingsData.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: true, message: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    // Regular users can only view their own bookings, admins can view all
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to view this booking' });
    }
    
    res.status(200).json({
      error: false,
      booking
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Cancel a booking
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await bookingsData.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: true, message: 'Booking not found' });
    }
    
    // Check if user is authorized to cancel this booking
    // Regular users can only cancel their own bookings, admins can cancel all
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to cancel this booking' });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: true, message: 'This booking is already cancelled' });
    }
    
    const cancelledBooking = await bookingsData.cancelBooking(req.params.id);
    
    res.status(200).json({
      error: false,
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update booking status (admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status value' });
    }
    
    const booking = await bookingsData.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: true, message: 'Booking not found' });
    }
    
    const updatedBooking = await bookingsData.updateBookingStatus(req.params.id, status);
    
    res.status(200).json({
      error: false,
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get all bookings for a ground (admin only)
router.get('/ground/:groundId', verifyToken, isAdmin, async (req, res) => {
  try {
    // Check if the ground exists
    const ground = await groundsData.getGroundById(req.params.groundId);
    
    if (!ground) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }
    
    // Check if the admin is the owner of this ground
    if (req.user.role !== 'admin' && ground.owner_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to view bookings for this ground' });
    }
    
    const bookings = await bookingsData.getBookingsByGroundId(req.params.groundId);
    
    res.status(200).json({
      error: false,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await bookingsData.getAllBookings();
    
    res.status(200).json({
      error: false,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
