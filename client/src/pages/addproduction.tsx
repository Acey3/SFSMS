import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import api from "../services/api";
import "../style.css";

const AddProduction = () => {
  const [_, setLocation] = useLocation();
  
  // Form State
  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // UI State
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Recipes on load so the user can select one
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

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
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
        // usually the backend handles the 'date' automatically
      });

      // Success! Go back to the list
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
      {/* Simple Navbar reuse or Back Button */}
      <button className="back-btn" onClick={() => setLocation("/production")}>
        ← Back to List
      </button>

      <div className="form-card">
        <h2>Record New Production</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Recipe Selector */}
          <div className="form-group">
            <label>Select Recipe</label>
            {loadingRecipes ? (
              <p>Loading recipes...</p>
            ) : (
              <select 
                value={recipeId} 
                onChange={(e) => setRecipeId(e.target.value)}
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

          {/* Quantity Input */}
          <div className="form-group">
            <label>Quantity (kg/bags)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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