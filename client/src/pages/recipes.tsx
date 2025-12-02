import { useEffect, useState } from "react";
import api from "./../services/api";
import { useLocation } from "wouter";
import "../style.css";

interface Recipe {
  id: number;
  name: string;
  description?: string;
  batch_size?: number;
}

const RecipesPage = () => {
  const [location, setLocation] = useLocation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", description: "", batch_size: "" });
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    try {
      const res = await api.get("/recipes");
      setRecipes(res.data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.name) return alert("Enter recipe name");
    try {
      setLoading(true);
      await api.post("/recipes", {
        name: newRecipe.name,
        description: newRecipe.description,
        batch_size: Number(newRecipe.batch_size),
      });
      setNewRecipe({ name: "", description: "", batch_size: "" });
      setShowForm(false);
      fetchRecipes();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error creating recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return; 
    try {
      await api.delete(`/recipes/${id}`);
      fetchRecipes();
    } catch (err) {
      alert("Error deleting recipe");
    }
  };  


  return (
    <div>
      {/* Navbar */}
      <nav className="dashboard-nav">
        <button className={`nav-btn${location === "/" ? " active" : ""}`} onClick={() => setLocation("/dashboard")}>Dashboard</button>
        <button className={`nav-btn${location === "/ingredients" ? " active" : ""}`} onClick={() => setLocation("/ingredients")}>Ingredients</button>
        <button className={`nav-btn${location === "/recipes" ? " active" : ""}`} onClick={() => setLocation("/recipes")}>Recipes</button>
        <button className={`nav-btn${location === "/production" ? " active" : ""}`} onClick={() => setLocation("/production")}>Production</button>
        <button className={`nav-btn${location === "/users" ? " active" : ""}`} onClick={() => setLocation("/users")}>Users</button>
      </nav>

      {/* Main Card */}
      <div className="recipes-main-card">
        <div className="recipes-header">
          <h2 className="recipes-title">Feed Recipes</h2>
          <button className="add-recipe-btn" onClick={() => setShowForm(true)}>
            + New Recipe
          </button>
        </div>

        {/* Add Recipe Form (modal style) */}
        {showForm && (
          <div className="modal-bg">
            <div className="modal-card">
              <h3>Add New Recipe</h3>
              <form onSubmit={handleAddRecipe} className="modal-form">
                <input
                  type="text"
                  placeholder="Recipe name"
                  value={newRecipe.name}
                  onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newRecipe.description}
                  onChange={e => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Batch size (kg)"
                  value={newRecipe.batch_size}
                  onChange={e => setNewRecipe({ ...newRecipe, batch_size: e.target.value })}
                />
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Recipe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recipe List */}
        <div className="recipes-list">
          {recipes.length === 0 ? (
            <p className="empty-text">No recipes found.</p>
          ) : (
            recipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-name">{recipe.name}</div>
                {recipe.description && (
                  <div className="recipe-desc">{recipe.description}</div>
                )}
                {recipe.batch_size && (
                  <div className="recipe-batch">Batch size: {recipe.batch_size} kg</div>
                )}
                <button
                  className="delete-recipe-btn" onClick={() => handleDeleteRecipe(recipe.id)} 
                >D</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
