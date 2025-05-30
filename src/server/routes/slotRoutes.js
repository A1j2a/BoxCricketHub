import express from 'express';
import { verifyToken } from './userRoutes.js';

const router = express.Router();

// Mock slots data
let slots = [
  {
    id: 1,
    ground_id: 1,
    date: '2025-05-31',
    start_time: '09:00',
    end_time: '10:00',
    is_booked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    ground_id: 1,
    date: '2025-05-31',
    start_time: '10:00',
    end_time: '11:00',
    is_booked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextSlotId = 3;

// Get slots for a ground
router.get('/ground/:groundId', async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date } = req.query;

    let filteredSlots = slots.filter(slot => slot.ground_id === parseInt(groundId));

    if (date) {
      filteredSlots = filteredSlots.filter(slot => slot.date === date);
    }

    res.json({
      error: false,
      slots: filteredSlots
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create new slot
router.post('/', verifyToken, async (req, res) => {
  try {
    const slotData = {
      id: nextSlotId++,
      ...req.body,
      is_booked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    slots.push(slotData);

    res.status(201).json({
      error: false,
      message: 'Slot created successfully',
      slot: slotData
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update slot
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const slotIndex = slots.findIndex(s => s.id === parseInt(req.params.id));
    if (slotIndex === -1) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }

    slots[slotIndex] = {
      ...slots[slotIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };

    res.json({
      error: false,
      message: 'Slot updated successfully',
      slot: slots[slotIndex]
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete slot
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const slotIndex = slots.findIndex(s => s.id === parseInt(req.params.id));
    if (slotIndex === -1) {
      return res.status(404).json({ error: true, message: 'Slot not found' });
    }

    slots.splice(slotIndex, 1);

    res.json({
      error: false,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;