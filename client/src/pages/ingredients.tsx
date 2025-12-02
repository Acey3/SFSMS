import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import api from "../services/api";
import "../style.css"; // use your global styles

interface IngredientInput {
  name: string;
  quantity: number;
  min_quantity: number;
  unit: string;
}

const AddIngredient = () => {
  const [location, setLocation] = useLocation();
  const [form, setForm] = useState<IngredientInput>({
    name: "",
    quantity: 0,
    min_quantity: 0,
    unit: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchIngredients = async () => {
    try {
      const res = await api.get("/ingredients");
      setIngredients(res.data);
    } catch (err) {
      setError("Failed to fetch ingredients.");
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [success]); // refetch when ingredient is added/deleted

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "min_quantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (editingId) {
        const res = await api.put(`/ingredients/${editingId}`, form);
        if (res.status === 200) {
          setSuccess("Ingredient updated successfully!");
        }
      } else {
        const res = await api.post("/ingredients", form);
        if (res.status === 201) {
          setSuccess("Ingredient added successfully!");
        }
      }
      setForm({ name: "", quantity: 0, min_quantity: 0, unit: "" });
      setEditingId(null);
      setShowForm(false);
      fetchIngredients();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    try {
      await api.delete(`/ingredients/${id}`);
      setSuccess("Ingredient deleted successfully!");
      fetchIngredients();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete ingredient.");
    }
  };

  const handleEdit = (id: number) => {
    const ing = ingredients.find((i: any) => i.id === id);
    if (ing) {
      setForm({
        name: ing.name,
        quantity: ing.quantity,
        min_quantity: ing.min_quantity,
        unit: ing.unit,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="dashboard-nav">
        <button className={`nav-btn${location === "/" ? " active" : ""}`} onClick={() => setLocation("/dashboard")}>
          Dashboard
        </button>
        <button className={`nav-btn${location === "/ingredients" ? " active" : ""}`} onClick={() => setLocation("/ingredients")}>
          Ingredients
        </button>
        <button className={`nav-btn${location === "/recipes" ? " active" : ""}`} onClick={() => setLocation("/recipes")}>
          Recipes
        </button>
        <button className={`nav-btn${location === "/production" ? " active" : ""}`} onClick={() => setLocation("/production")}>
          Production
        </button>
        <button className={`nav-btn${location === "/users" ? " active" : ""}`} onClick={() => setLocation("/users")}>
          Users
        </button>
      </nav>

      {/* Main Card */}
      <div className="ingredients-main-card">
        <div className="ingredients-header-row">
          <h2 className="ingredients-title">Ingredients Management</h2>
         
        </div>

        {/* Success/Error messages */}
        {success && <div className="success-text">{success}</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Ingredients Table */}
        <div className="ingredients-table-card">
          <table className="ingredients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Min Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-message">No ingredients found.</td>
                </tr>
              ) : (
                ingredients.map((ing: any) => (
                  <tr key={ing.id}>
                    <td><strong>{ing.name}</strong></td>
                    <td>{Number(ing.quantity).toFixed(2)}</td>
                    <td>{ing.unit}</td>
                    <td>{Number(ing.min_quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => handleDelete(ing.id)}
                      >
                        🗑️
                      </button>
                      <button
                      className="action-btn edit"
                      title="Edit"
                      onClick={() => handleEdit(ing.id)}
                      >
                        E
                      </button>
                        
                    </td>
                  </tr>
                  
                ))
              )}
            </tbody>
             <button className="add-ingredient-btn" onClick={() => setShowForm(true)}>
                           + Add Ingredient
                           </button>
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showForm && (
        <div className="modal-bg">
          <div className="modal-card">
            <h3>{editingId ? "Edit Ingredient" : "Add New Ingredient"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                name="name"
                placeholder="Ingredient Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="min_quantity"
                placeholder="Minimum Quantity"
                value={form.min_quantity}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="unit"
                placeholder="Unit (e.g. kg, g, L)"
                value={form.unit}
                onChange={handleChange}
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({ name: "", quantity: 0, min_quantity: 0, unit: "" });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? (editingId ? "Saving..." : "Adding...") : (editingId ? "Save Changes" : "Add Ingredient")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddIngredient;
