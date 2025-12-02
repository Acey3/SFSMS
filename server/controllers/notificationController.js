// controllers/notificationController.js
import { pool } from "../db/db.js";

// ✅ Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ error: "Server error while fetching notifications." });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Notification not found." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Mark Notification Error:", err);
    res.status(500).json({ error: "Server error while marking as read." });
  }
};

// ✅ Helper function to create a notification
export const createNotification = async (message) => {
  try {
    await pool.query("INSERT INTO notifications (message) VALUES ($1)", [message]);
  } catch (err) {
    console.error("Create Notification Error:", err);
  }
};
