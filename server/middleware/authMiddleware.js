// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const authenticateToken = (req, res, next) => {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user; // { id, email, role }
    next();
  });
};

// Optional role check helper
export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated." });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
};
