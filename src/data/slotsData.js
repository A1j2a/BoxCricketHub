const { query } = require('../config/database.js');

// Get slots by ground ID and date
const getSlotsByGroundAndDate = async (groundId, date) => {
  const result = await query(
    'SELECT * FROM slots WHERE ground_id = $1 AND date = $2 ORDER BY start_time',
    [groundId, date]
  );
  return result.rows;
};

// Get a slot by ID
const getSlotById = async (slotId) => {
  const result = await query('SELECT * FROM slots WHERE id = $1', [slotId]);
  return result.rows[0];
};

// Create a new slot
const createSlot = async (slotData) => {
  const { ground_id, date, start_time, end_time, price } = slotData;

  // First check if there's a conflict with existing slots
  const conflicts = await query(
    `SELECT * FROM slots 
    WHERE ground_id = $1 AND date = $2 AND 
    ((start_time <= $3 AND end_time > $3) OR 
     (start_time < $4 AND end_time >= $4) OR 
     (start_time >= $3 AND end_time <= $4))`,
    [ground_id, date, start_time, end_time]
  );

  if (conflicts.rows.length > 0) {
    throw new Error('This time slot overlaps with an existing slot');
  }

  const result = await query(
    'INSERT INTO slots (ground_id, date, start_time, end_time, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [ground_id, date, start_time, end_time, price]
  );

  return result.rows[0];
};

// Update a slot
const updateSlot = async (slotId, slotData) => {
  const { start_time, end_time, price, is_booked } = slotData;

  const result = await query(
    `UPDATE slots SET 
    start_time = $1, 
    end_time = $2, 
    price = $3, 
    is_booked = $4, 
    updated_at = CURRENT_TIMESTAMP 
    WHERE id = $5 RETURNING *`,
    [start_time, end_time, price, is_booked, slotId]
  );

  return result.rows[0];
};

// Delete a slot
const deleteSlot = async (slotId) => {
  // First check if the slot is already booked
  const slot = await getSlotById(slotId);
  if (slot && slot.is_booked) {
    throw new Error('Cannot delete a slot that is already booked');
  }

  await query('DELETE FROM slots WHERE id = $1', [slotId]);
  return { success: true };
};

// Get available slots by ground ID for the next N days
const getAvailableSlotsByGround = async (groundId, daysAhead = 7) => {
  // Calculate the date range
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + daysAhead);

  const result = await query(
    `SELECT * FROM slots 
    WHERE ground_id = $1 
    AND date >= $2 
    AND date <= $3 
    AND is_booked = false 
    ORDER BY date, start_time`,
    [groundId, today.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
  );

  return result.rows;
};

module.exports = {
  getSlotsByGroundAndDate,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  getAvailableSlotsByGround
};
