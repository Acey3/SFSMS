import { pool } from "../db/db.js";

// Record a new feed production and deduct stock
export const createProduction = async (req, res) => {
  const client = await pool.connect();

  try {
    const { recipe_id, quantity_produced } = req.body;

    if (!recipe_id || !quantity_produced) {
      return res.status(400).json({ error: "recipe_id and quantity_produced are required." });
    }

    // Begin transaction
    await client.query("BEGIN");

    // 1️⃣ Get recipe ingredients and their required quantities
    const recipeQuery = `
      SELECT ri.ingredient_id, ri.quantity_required, i.name, i.quantity AS current_quantity
      FROM recipe_items ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = $1
    `;
    const recipeResult = await client.query(recipeQuery, [recipe_id]);

    if (recipeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Recipe not found or has no ingredients." });
    }

    // Deduct stock
    const deductions = [];
    for (const item of recipeResult.rows) {
      const requiredQty = Number(item.quantity_required) * Number(quantity_produced);
      const newQty = Number(item.current_quantity) - requiredQty;

      if (newQty < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Not enough stock for ${item.name}.` });
      }

      await client.query(`UPDATE ingredients SET quantity = $1 WHERE id = $2`, [newQty, item.ingredient_id]);
      deductions.push({
        ingredient: item.name,
        used: requiredQty,
        remaining: newQty,
      });
    }

    // 3️⃣ Record production
    const productionQuery = `
      INSERT INTO productions (recipe_id, quantity_produced, deductions)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const productionResult = await client.query(productionQuery, [recipe_id, quantity_produced, JSON.stringify(deductions)]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Production recorded and stock updated successfully.",
      production: productionResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Production Error:", err);
    res.status(500).json({ error: "Server error during production." });
  } finally {
    client.release();
  }
};

export const getProductions = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, recipe_id, produced_on, quantity_produced, deductions FROM productions ORDER BY produced_on DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching productions:", err);
    res.status(500).json({ error: "Failed to fetch production history." });
  }
};
