// controllers/ingredientController.js
import { pool } from "../db/db.js";
import { createNotification } from "./notificationController.js";

//helper function to check and notify low stock
const isLowStock = (quantity, minQuantity) => {
  return Number(quantity) <= Number(minQuantity);
};

// ✅ Add new ingredient
export const addIngredient = async (req, res) => {
  try {
    const { name, quantity, unit, min_quantity } = req.body;
    if (!name) return res.status(400).json({ error: "Ingredient name is required." });

    const insertQuery = `
      INSERT INTO ingredients (name, quantity, unit, min_quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, quantity || 0, unit || "kg", min_quantity || 0];
    const result = await pool.query(insertQuery, values);
    const ingredient = result.rows[0];

    // ⚠️ Check stock and notify
    if (isLowStock(ingredient.quantity, ingredient.min_quantity)) {
      await createNotification(`⚠️ ${ingredient.name} stock is low (${ingredient.quantity} ${ingredient.unit}).`);
    }

    return res.status(201).json(ingredient);
  } catch (err) {
    console.error("Add Ingredient Error:", err);
    console.error("full error:", err.stack);
    res.status(500).json({ error: "Server error while adding ingredient." });
  }
};

// ✅ Get all ingredients
export const getIngredients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ingredients ORDER BY id ASC");
    const ingredients = result.rows.map((item) => ({
      ...item,
      low_stock: isLowStock(item.quantity, item.min_quantity),
    }));
    res.json(ingredients);
  } catch (err) {
    console.error("Get Ingredients Error:", err);
    res.status(500).json({ error: "Server error while fetching ingredients." });
  }
};

// ✅ Update ingredient
export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unit, min_quantity } = req.body;

    const updateQuery = `
      UPDATE ingredients
      SET quantity = COALESCE($1, quantity),
          unit = COALESCE($2, unit),
          min_quantity = COALESCE($3, min_quantity)
      WHERE id = $4
      RETURNING *;
    `;
    const values = [quantity, unit, min_quantity, id];
    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) return res.status(404).json({ error: "Ingredient not found." });

    const updated = result.rows[0];

    // ⚠️ Notify if stock is low
    if (isLowStock(updated.quantity, updated.min_quantity)) {
      await createNotification(`⚠️ ${updated.name} stock is low (${updated.quantity} ${updated.unit}).`);
    }

    res.json(updated);
  } catch (err) {
    console.error("Update Ingredient Error:", err);
    res.status(500).json({ error: "Server error while updating ingredient." });
  }
};

// ✅ Delete ingredient
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM ingredients WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Ingredient not found." });

    res.json({ message: "Ingredient deleted successfully." });
  } catch (err) {
    console.error("Delete Ingredient Error:", err);
    res.status(500).json({ error: "Server error while deleting ingredient." });
  }
};
