import express from 'express';
import * as slotsData from '../../data/slotsData.js';
import * as groundsData from '../../data/groundsData.js';
import { verifyToken, isAdmin } from './userRoutes.js';

const router = express.Router();

// Get slots by ground ID and date (public route)
router.get('/ground/:groundId', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: true, message: 'Date parameter is required' });
    }
    
    const slots = await slotsData.getSlotsByGroundAndDate(req.params.groundId, date);
    res.status(200).json({
      error: false,
      slots
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get available slots for a ground for the next N days (public route)
router.get('/available/:groundId', async (req, res) => {
  try {
    const daysAhead = req.query.days ? parseInt(req.query.days) : 7;
    
    const slots = await slotsData.getAvailableSlotsByGround(req.params.groundId, daysAhead);
    res.status(200).json({
      error: false,
      slots
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get a slot by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const slot = await slotsData.getSlotById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }
    
    res.status(200).json({
      error: false,
      slot
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create a new slot (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ground_id, date, start_time, end_time, price } = req.body;
    
    // Verify the ground exists and user has permissions
    const ground = await groundsData.getGroundById(ground_id);
    
    if (!ground) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }
    
    // Only admin or the ground owner can add slots
    if (req.user.role !== 'admin' && ground.owner_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to add slots to this ground' });
    }
    
    const newSlot = await slotsData.createSlot({
      ground_id,
      date,
      start_time,
      end_time,
      price
    });
    
    res.status(201).json({
      error: false,
      message: 'Slot created successfully',
      slot: newSlot
    });
  } catch (error) {
    if (error.message.includes('overlaps')) {
      return res.status(400).json({ error: true, message: error.message });
    }
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update a slot (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { start_time, end_time, price, is_booked } = req.body;
    
    // Check if slot exists
    const existingSlot = await slotsData.getSlotById(req.params.id);
    
    if (!existingSlot) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }
    
    // Get the ground to check ownership
    const ground = await groundsData.getGroundById(existingSlot.ground_id);
    
    // Only admin or the ground owner can update slots
    if (req.user.role !== 'admin' && ground.owner_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to update slots for this ground' });
    }
    
    const updatedSlot = await slotsData.updateSlot(req.params.id, {
      start_time,
      end_time,
      price,
      is_booked
    });
    
    res.status(200).json({
      error: false,
      message: 'Slot updated successfully',
      slot: updatedSlot
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete a slot (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Check if slot exists
    const existingSlot = await slotsData.getSlotById(req.params.id);
    
    if (!existingSlot) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }
    
    // Get the ground to check ownership
    const ground = await groundsData.getGroundById(existingSlot.ground_id);
    
    // Only admin or the ground owner can delete slots
    if (req.user.role !== 'admin' && ground.owner_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to delete slots for this ground' });
    }
    
    // Check if the slot is already booked
    if (existingSlot.is_booked) {
      return res.status(400).json({ error: true, message: 'Cannot delete a slot that is already booked' });
    }
    
    await slotsData.deleteSlot(req.params.id);
    
    res.status(200).json({
      error: false,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
