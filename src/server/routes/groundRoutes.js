const express = require('express');
const groundsData = require('../../data/groundsData.js');
const { verifyToken, isAdmin } = require('./userRoutes.js');

const router = express.Router();

// Get all grounds (public route)
router.get('/', async (req, res) => {
  try {
    // Check if filters are provided in query params
    if (Object.keys(req.query).length > 0) {
      const filters = {
        turf_type: req.query.turf_type,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        search: req.query.search,
        sort_by: req.query.sort_by
      };
      
      const grounds = await groundsData.filterGrounds(filters);
      return res.status(200).json({
        error: false,
        grounds
      });
    }
    
    // If no filters, return all grounds
    const grounds = await groundsData.getAllGrounds();
    res.status(200).json({
      error: false,
      grounds
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get a ground by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const ground = await groundsData.getGroundById(req.params.id);
    if (!ground) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }
    
    res.status(200).json({
      error: false,
      ground
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get grounds by owner ID (admin only)
router.get('/owner/:ownerId', verifyToken, isAdmin, async (req, res) => {
  try {
    const grounds = await groundsData.getGroundsByOwnerId(req.params.ownerId);
    res.status(200).json({
      error: false,
      grounds
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Create a new ground (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const groundData = {
      ...req.body,
      owner_id: req.user.id // Set current user as owner
    };
    
    const newGround = await groundsData.createGround(groundData);
    res.status(201).json({
      error: false,
      message: 'Ground created successfully',
      ground: newGround
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update a ground (admin only, and must be the owner)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Check if ground exists and user is the owner
    const existingGround = await groundsData.getGroundById(req.params.id);
    
    if (!existingGround) {
      return res.status(404).json({ error: true, message: 'Ground not found' });
    }
    
    // Allow admin to update any ground
    if (req.user.role !== 'admin' && existingGround.owner_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'You are not authorized to update this ground' });
    }
    
    const updatedGround = await groundsData.updateGround(req.params.id, req.body);
    res.status(200).json({
      error: false,
      message: 'Ground updated successfully',
      ground: updatedGround
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
