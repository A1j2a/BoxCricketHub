import express from 'express';
import { verifyToken, isAdmin } from './userRoutes.js';

const router = express.Router();

// Mock grounds data
let grounds = [
  {
    id: 1,
    name: 'Mumbai Cricket Arena',
    location: 'Andheri West, Mumbai',
    price_per_hour: 1500,
    turf_type: 'astro',
    description: 'Premium astro turf ground with floodlights and modern facilities',
    facilities: ['Parking', 'Washroom', 'Drinking Water', 'Lighting', 'Seating Area'],
    images: [],
    videos: [],
    owner_id: 1,
    is_featured: true,
    featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Champions Box Cricket',
    location: 'Bandra East, Mumbai',
    price_per_hour: 1200,
    turf_type: 'mat',
    description: 'Well-maintained mat turf with professional setup',
    facilities: ['Parking', 'Washroom', 'Drinking Water', 'Equipment Rental'],
    images: [],
    videos: [],
    owner_id: 1,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextGroundId = 3;

// Get all grounds
router.get('/', async (req, res) => {
  try {
    const { owner_id } = req.query;
    let filteredGrounds = grounds;

    if (owner_id) {
      filteredGrounds = grounds.filter(ground => ground.owner_id === parseInt(owner_id));
    }

    res.json({
      error: false,
      grounds: filteredGrounds
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get ground by ID
router.get('/:id', async (req, res) => {
  try {
    const ground = grounds.find(g => g.id === parseInt(req.params.id));
    if (!ground) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }

    res.json({
      error: false,
      ground
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create new ground
router.post('/', verifyToken, async (req, res) => {
  try {
    const groundData = {
      id: nextGroundId++,
      ...req.body,
      owner_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    grounds.push(groundData);

    res.status(201).json({
      error: false,
      message: 'Ground created successfully',
      ground: groundData
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update ground
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const groundIndex = grounds.findIndex(g => g.id === parseInt(req.params.id));
    if (groundIndex === -1) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }

    // Check if user owns the ground or is admin
    if (grounds[groundIndex].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    grounds[groundIndex] = {
      ...grounds[groundIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };

    res.json({
      error: false,
      message: 'Ground updated successfully',
      ground: grounds[groundIndex]
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete ground
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const groundIndex = grounds.findIndex(g => g.id === parseInt(req.params.id));
    if (groundIndex === -1) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }

    // Check if user owns the ground or is admin
    if (grounds[groundIndex].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    grounds.splice(groundIndex, 1);

    res.json({
      error: false,
      message: 'Ground deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;