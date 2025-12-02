import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController.js";
import {authenticateToken, requireAdmin} from "../middleware/authMiddleware.js";

const router = express.Router();


//public routes
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

//protected routes
router.post("/",authenticateToken,requireAdmin, createRecipe);
router.put("/:id",authenticateToken,requireAdmin, updateRecipe);
router.delete("/:id",authenticateToken,requireAdmin, deleteRecipe);

export default router;
