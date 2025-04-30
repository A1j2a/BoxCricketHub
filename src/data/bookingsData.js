const { query, pool } = require('../config/database.js');

// Get bookings by user ID
const getBookingsByUserId = async (userId) => {
  const result = await query(
    `SELECT b.*, 
      s.date, s.start_time, s.end_time, 
      g.name as ground_name, g.address as ground_address, g.image_url
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    JOIN grounds g ON s.ground_id = g.id
    WHERE b.user_id = $1
    ORDER BY s.date DESC, s.start_time DESC`,
    [userId]
  );
  return result.rows;
};

// Get bookings by ground ID
const getBookingsByGroundId = async (groundId) => {
  const result = await query(
    `SELECT b.*, 
      s.date, s.start_time, s.end_time, 
      u.username, u.full_name, u.phone_number
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    JOIN users u ON b.user_id = u.id
    WHERE s.ground_id = $1
    ORDER BY s.date DESC, s.start_time DESC`,
    [groundId]
  );
  return result.rows;
};

// Get a booking by ID
const getBookingById = async (bookingId) => {
  const result = await query(
    `SELECT b.*, 
      s.date, s.start_time, s.end_time, s.ground_id,
      g.name as ground_name, g.address as ground_address, g.image_url,
      u.username, u.full_name, u.phone_number
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    JOIN grounds g ON s.ground_id = g.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = $1`,
    [bookingId]
  );
  return result.rows[0];
};

// Create a new booking
const createBooking = async (bookingData) => {
  const { user_id, slot_id, payment_amount, notes } = bookingData;

  // First, check if the slot is already booked
  const slotCheck = await query('SELECT is_booked FROM slots WHERE id = $1', [slot_id]);
  
  if (slotCheck.rows.length === 0) {
    throw new Error('Slot not found');
  }
  
  if (slotCheck.rows[0].is_booked) {
    throw new Error('This slot is already booked');
  }

  // Begin a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update slot to booked status
    await client.query('UPDATE slots SET is_booked = true WHERE id = $1', [slot_id]);
    
    // Create booking
    const result = await client.query(
      `INSERT INTO bookings 
      (user_id, slot_id, payment_amount, notes) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [user_id, slot_id, payment_amount, notes]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Update a booking status
const updateBookingStatus = async (bookingId, status) => {
  const result = await query(
    'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, bookingId]
  );
  return result.rows[0];
};

// Update booking payment status
const updatePaymentStatus = async (bookingId, paymentStatus) => {
  const result = await query(
    'UPDATE bookings SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [paymentStatus, bookingId]
  );
  return result.rows[0];
};

// Cancel a booking
const cancelBooking = async (bookingId) => {
  // Begin a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get slot_id for this booking
    const bookingResult = await client.query('SELECT slot_id FROM bookings WHERE id = $1', [bookingId]);
    
    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }
    
    const { slot_id } = bookingResult.rows[0];
    
    // Update slot to available status
    await client.query('UPDATE slots SET is_booked = false WHERE id = $1', [slot_id]);
    
    // Update booking to cancelled status
    const result = await client.query(
      `UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *`,
      [bookingId]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get all bookings (admin function)
const getAllBookings = async () => {
  const result = await query(
    `SELECT b.*, 
      s.date, s.start_time, s.end_time, s.ground_id,
      g.name as ground_name,
      u.username, u.full_name
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    JOIN grounds g ON s.ground_id = g.id
    JOIN users u ON b.user_id = u.id
    ORDER BY s.date DESC, s.start_time DESC`
  );
  return result.rows;
};

module.exports = {
  getBookingsByUserId,
  getBookingsByGroundId,
  getBookingById,
  createBooking,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking,
  getAllBookings
};
