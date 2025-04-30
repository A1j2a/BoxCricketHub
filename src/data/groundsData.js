const { query } = require('../config/database.js');

// Get all grounds
const getAllGrounds = async () => {
  const result = await query(
    'SELECT g.*, u.username as owner_name FROM grounds g LEFT JOIN users u ON g.owner_id = u.id WHERE g.is_active = true ORDER BY g.created_at DESC'
  );
  return result.rows;
};

// Get grounds by owner ID
const getGroundsByOwnerId = async (ownerId) => {
  const result = await query(
    'SELECT * FROM grounds WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId]
  );
  return result.rows;
};

// Get a ground by ID
const getGroundById = async (groundId) => {
  const result = await query('SELECT * FROM grounds WHERE id = $1', [groundId]);
  return result.rows[0];
};

// Create a new ground
const createGround = async (groundData) => {
  const {
    name,
    address,
    description,
    hourly_rate,
    image_url,
    owner_id,
    facilities,
    turf_type,
    size,
  } = groundData;

  const result = await query(
    `INSERT INTO grounds 
    (name, address, description, hourly_rate, image_url, owner_id, facilities, turf_type, size) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [name, address, description, hourly_rate, image_url, owner_id, facilities, turf_type, size]
  );

  return result.rows[0];
};

// Update a ground
const updateGround = async (groundId, groundData) => {
  const {
    name,
    address,
    description,
    hourly_rate,
    image_url,
    facilities,
    turf_type,
    size,
    is_active,
  } = groundData;

  const result = await query(
    `UPDATE grounds SET 
    name = $1, 
    address = $2, 
    description = $3, 
    hourly_rate = $4, 
    image_url = $5, 
    facilities = $6, 
    turf_type = $7, 
    size = $8, 
    is_active = $9, 
    updated_at = CURRENT_TIMESTAMP 
    WHERE id = $10 RETURNING *`,
    [name, address, description, hourly_rate, image_url, facilities, turf_type, size, is_active, groundId]
  );

  return result.rows[0];
};

// Filter grounds by criteria
const filterGrounds = async (filters) => {
  let queryText = 'SELECT g.*, u.username as owner_name FROM grounds g LEFT JOIN users u ON g.owner_id = u.id WHERE g.is_active = true';
  const queryParams = [];
  let paramCount = 1;

  // Add filters conditionally
  if (filters.turf_type) {
    queryText += ` AND g.turf_type = $${paramCount}`;
    queryParams.push(filters.turf_type);
    paramCount++;
  }

  // Add price range filter if provided
  if (filters.min_price !== undefined) {
    queryText += ` AND g.hourly_rate >= $${paramCount}`;
    queryParams.push(filters.min_price);
    paramCount++;
  }

  if (filters.max_price !== undefined) {
    queryText += ` AND g.hourly_rate <= $${paramCount}`;
    queryParams.push(filters.max_price);
    paramCount++;
  }

  // Add search term filter if provided
  if (filters.search) {
    queryText += ` AND (g.name ILIKE $${paramCount} OR g.address ILIKE $${paramCount} OR g.description ILIKE $${paramCount})`;
    queryParams.push(`%${filters.search}%`);
    paramCount++;
  }

  // Sorting
  if (filters.sort_by === 'price_low') {
    queryText += ' ORDER BY g.hourly_rate ASC';
  } else if (filters.sort_by === 'price_high') {
    queryText += ' ORDER BY g.hourly_rate DESC';
  } else {
    queryText += ' ORDER BY g.created_at DESC';
  }

  const result = await query(queryText, queryParams);
  return result.rows;
};

module.exports = {
  getAllGrounds,
  getGroundsByOwnerId,
  getGroundById,
  createGround,
  updateGround,
  filterGrounds
};
