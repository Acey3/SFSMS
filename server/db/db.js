// db/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create a connection pool using Neon PostgreSQL URL from .env
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // important for Neon SSL connections
  },
});

// Optional: test connection when the app starts
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Neon PostgreSQL at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();
