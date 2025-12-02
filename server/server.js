import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { pool } from "./db/db.js"; // import correctly from your db.js
import authRoutes from "./routes/authRoutes.js"; // import auth routes
import ingredientsRoutes from "./routes/ingredientRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import recipeRoutes from "./routes/recipesRoutes.js";
import authRouter from "./controllers/authcontroller.js";

dotenv.config();
const port = process.env.PORT || 8080;

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
// Enable pre-flight for all routes
app.options(/.*/, cors()); 



app.use(express.json());

//Mount auth routes
app.use("/api/auth", authRoutes);
app.use("/api", authRouter); // Mount at /api
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/recipes", recipeRoutes);

// Base route
app.get("/api", (req, res) => {
  res.send("Smart Feed Manager API is running");
});

// Test DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
