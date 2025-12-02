// routes/ingredientRoutes.js
import express from "express";
import {
  addIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController.js";

const router = express.Router();

router.post("/", addIngredient);
router.get("/", getIngredients);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;
