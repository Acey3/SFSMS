import express from "express";
import { pool } from "../db/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
      id,
      name,
      quantity, 
      unit, 
      min_quantity,
     
     CASE
        WHEN quantity <= min_quantity THEN 'LOW STOCK ⚠️'
          ELSE 'OK ✅'
        END AS status
      FROM ingredients

    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error while fetching notifications" });
  }
});

export default router;
