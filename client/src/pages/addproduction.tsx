import React, { useEffect, useState } from "react"; // Added React import for the Event type
import { useLocation } from "wouter";
import api from "../services/api";
import "../style.css";

// 1. Define the Recipe interface
interface Recipe {
  id: string | number;
  name: string;
}

const AddProduction = () => {
  const [_, setLocation] = useLocation();
  
  // 2. Properly type the recipes state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeId, setRecipeId] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // UI State
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch Recipes on load
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get("/recipes");
        setRecipes(res.data);
      } catch (err) {
        setError("Failed to load recipes. Please check connection.");
      } finally {
        setLoadingRecipes(false);
      }
    };
    fetchRecipes();
  }, []);

  // 3. Handle Form Submission with typed event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!recipeId || !quantity) {
      setError("Please select a recipe and enter a quantity.");
      return;
    }
    if (Number(quantity) <= 0) {
        setError("Quantity must be greater than zero.");
        return;
    }

    try {
      setSubmitting(true);
      
      // Send data to backend
      await api.post("/production", {
        recipe_id: recipeId,
        quantity_produced: Number(quantity),
      });

      alert("Production recorded successfully!");
      setLocation("/production");

    } catch (err) {
      console.error(err);
      setError("Failed to record production. Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container-page">
      <button className="back-btn" onClick={() => setLocation("/production")}>
        ← Back to List
      </button>

      <div className="form-card">
        <h2>Record New Production</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Recipe</label>
            {loadingRecipes ? (
              <p>Loading recipes...</p>
            ) : (
              <select 
                value={recipeId} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRecipeId(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose a Recipe --</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Quantity (kg/bags)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
              placeholder="e.g., 500"
              className="form-input"
              min="1"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || loadingRecipes}
          >
            {submitting ? "Recording..." : "Save Production"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduction;