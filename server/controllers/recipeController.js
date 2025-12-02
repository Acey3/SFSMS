import { pool } from "../db/db.js";

// ✅ Create a recipe (with optional ingredient items)
export const createRecipe = async (req, res) => {
  const { name, items } = req.body; 
  // items = [ { ingredient_id, quantity_required }, ... ]

  if (!name) {
    return res.status(400).json({ error: "Recipe name is required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const recipeResult = await client.query(
      "INSERT INTO recipes (name) VALUES ($1) RETURNING *",
      [name]
    );

    const recipe = recipeResult.rows[0];

    // Insert items if provided
    if (items && items.length > 0) {
      const insertPromises = items.map(i =>
        client.query(
          "INSERT INTO recipe_items (recipe_id, ingredient_id, quantity_required) VALUES ($1, $2, $3)",
          [recipe.id, i.ingredient_id, i.quantity_required]
        )
      );
      await Promise.all(insertPromises);
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create recipe error:", err);
    res.status(500).json({ error: "Server error while creating recipe." });
  } finally {
    client.release();
  }
};

// ✅ Get all recipes
export const getAllRecipes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get recipes error:", err);
    res.status(500).json({ error: "Server error while fetching recipes." });
  }
};

// ✅ Get single recipe (with items)
export const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const recipeResult = await pool.query("SELECT * FROM recipes WHERE id = $1", [id]);
    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    const itemsResult = await pool.query(
      `SELECT ri.id, ri.quantity_required, i.name AS ingredient_name
       FROM recipe_items ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = $1`,
      [id]
    );

    res.json({
      ...recipeResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error("Get recipe error:", err);
    res.status(500).json({ error: "Server error while fetching recipe." });
  }
};

// ✅ Update recipe
export const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { name, items } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update recipe name
    if (name) {
      await client.query("UPDATE recipes SET name = $1 WHERE id = $2", [name, id]);
    }

    // Update items if provided
    if (items && items.length > 0) {
      // Remove old items and insert new ones
      await client.query("DELETE FROM recipe_items WHERE recipe_id = $1", [id]);

      const insertPromises = items.map(i =>
        client.query(
          "INSERT INTO recipe_items (recipe_id, ingredient_id, quantity_required) VALUES ($1, $2, $3)",
          [id, i.ingredient_id, i.quantity_required]
        )
      );
      await Promise.all(insertPromises);
    }

    await client.query("COMMIT");
    res.json({ message: "Recipe updated successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update recipe error:", err);
    res.status(500).json({ error: "Server error while updating recipe." });
  } finally {
    client.release();
  }
};

// ✅ Delete recipe
export const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM recipes WHERE id = $1", [id]);
    res.json({ message: "Recipe deleted successfully." });
  } catch (err) {
    console.error("Delete recipe error:", err);
    res.status(500).json({ error: "Server error while deleting recipe." });
  }
};
