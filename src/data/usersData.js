// Mock users data for development
let users = [
  {
    id: 1,
    email: 'admin@boxcrickethub.com',
    password_hash: '$2b$10$8K1p/a0dclxKOkAyX9EQ5uKM.NKXb7.QzV4gq1Bp2J7dPJQT8mP0m', // password: admin123
    username: 'admin',
    full_name: 'Box Cricket Admin',
    phone_number: '+91-9876543210',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'user@example.com',
    password_hash: '$2b$10$8K1p/a0dclxKOkAyX9EQ5uKM.NKXb7.QzV4gq1Bp2J7dPJQT8mP0m', // password: user123
    username: 'testuser',
    full_name: 'Test User',
    phone_number: '+91-9876543211',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextUserId = 3;

export default {
  // Get all users
  getAllUsers: async () => {
    return users.map(({ password_hash, ...user }) => user);
  },

  // Get user by ID
  getUserById: async (id) => {
    return users.find(user => user.id === parseInt(id));
  },

  // Get user by email
  getUserByEmail: async (email) => {
    return users.find(user => user.email === email);
  },

  // Create new user
  createUser: async (userData) => {
    const newUser = {
      id: nextUserId++,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  // Update user
  updateUser: async (id, userData) => {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };

    return users[userIndex];
  },

  // Delete user
  deleteUser: async (id) => {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    return deletedUser;
  }
};