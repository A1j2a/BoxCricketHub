const { query } = require('../config/database.js');

// Get a user by ID
const getUserById = async (userId) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
};

// Get a user by email
const getUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Create a new user
const createUser = async (userData) => {
  const { email, password_hash, username, full_name, phone_number, role = 'user' } = userData;
  
  const result = await query(
    'INSERT INTO users (email, password_hash, username, full_name, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [email, password_hash, username, full_name, phone_number, role]
  );
  
  return result.rows[0];
};

// Update a user
const updateUser = async (userId, userData) => {
  const { username, full_name, phone_number } = userData;
  
  const result = await query(
    'UPDATE users SET username = $1, full_name = $2, phone_number = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [username, full_name, phone_number, userId]
  );
  
  return result.rows[0];
};

// Get all users (admin function)
const getAllUsers = async () => {
  const result = await query('SELECT id, email, username, full_name, phone_number, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  getAllUsers
};
