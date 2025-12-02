// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/db.js";
import dotenv from "dotenv";
import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();
dotenv.config();

const MAX_USERS = Number(process.env.MAX_USERS || 7);
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

//Get all users 
router.get("/users", async (req, res) => {
  try {
    const usersResult = await pool.query("SELECT id, name, email, role, created_at FROM users");
    res.json({ users: usersResult.rows });
  } catch (err) {
    console.error("Fetch users error:", err);
    return res.status(500).json({ error: "Server error fetching users." });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Error deleting user." });
  }
});

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    // 1) Check user count limit
    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const userCount = Number(countResult.rows[0].count);
    if (userCount >= MAX_USERS) {
      return res.status(403).json({ error: `User limit reached (${MAX_USERS}).` });
    }

    // 2) Check if email exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // 3) Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 4) Insert user
    const insertQuery = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;
    const values = [name, email, hashed, role || "user"];
    const result = await pool.query(insertQuery, values);

    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const userQuery = "SELECT id, name, email, password, role FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate token (payload: id, email, role)
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    // Don't return password
    delete user.password;

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};

export default router;