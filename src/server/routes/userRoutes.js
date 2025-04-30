const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersData = require("../../data/usersData.js");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "boxcrickethub-secret-key";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: true, message: "Invalid token." });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: true,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// User registration
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      full_name,
      phone_number,
      role = "user",
    } = req.body;

    // Basic validation
    if (!email || !password || !username || !full_name || !phone_number) {
      return res
        .status(400)
        .json({ error: true, message: "All fields are required." });
    }

    const existingUser = await usersData.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await usersData.createUser({
      email,
      password_hash,
      username,
      full_name,
      phone_number,
      role,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password_hash: _, ...userData } = newUser;
    res.status(201).json({
      error: false,
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "Email and password are required." });
    }

    const user = await usersData.getUserByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password_hash: _, ...userData } = user;
    res.status(200).json({
      error: false,
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await usersData.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const { password_hash: _, ...userData } = user;
    res.status(200).json({
      error: false,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update user profile
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { username, full_name, phone_number } = req.body;

    const updatedUser = await usersData.updateUser(req.user.id, {
      username,
      full_name,
      phone_number,
    });

    const { password_hash: _, ...userData } = updatedUser;
    res.status(200).json({
      error: false,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Admin route - Get all users
router.get("/admin/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await usersData.getAllUsers();
    res.status(200).json({
      error: false,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Exports
module.exports = {
  router,
  verifyToken,
  isAdmin,
};
