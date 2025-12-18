import { useEffect, useState } from "react";
import api from "../services/api";
import { useLocation } from "wouter";
import "../style.css";

// 1. Define an interface for your production record
interface ProductionRecord {
  id: string | number;
  recipe_name?: string;
  recipe_id: string | number;
  quantity_produced: number;
  produced_on: string | Date;
}

const ProductionPage = () => {
  const [path, setLocation] = useLocation();
  
  // 2. Assign the interface to your state to avoid the 'never' type error
  const [productions, setProductions] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/production");
        setProductions(res.data);
      } catch (err) {
        console.error("Failed to fetch production data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductions();
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-btn${path === "/dashboard" ? " active" : ""}`} 
          onClick={() => setLocation("/dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn${path === "/ingredients" ? " active" : ""}`} 
          onClick={() => setLocation("/ingredients")}
        >
          Ingredients
        </button>
        <button 
          className={`nav-btn${path === "/recipes" ? " active" : ""}`} 
          onClick={() => setLocation("/recipes")}
        >
          Recipes
        </button>
        <button 
          className={`nav-btn${path === "/production" ? " active" : ""}`} 
          onClick={() => setLocation("/production")}
        >
          Production
        </button>
        <button 
          className={`nav-btn${path === "/users" ? " active" : ""}`} 
          onClick={() => setLocation("/users")}
        >
          Users
        </button>
      </nav>

      {/* Main Card */}
      <div className="production-main-card">
        <div className="production-header">
          <h2 className="production-title">Production History</h2>
          <button 
            className="add-production-btn"
            onClick={() => setLocation("/production/new")}
          >          
            + New Production
          </button>
        </div>

        <div className="production-list">
          {loading ? (
            <p>Loading...</p>
          ) : productions.length === 0 ? (
            <p className="empty-text">No production records found.</p>
          ) : (
            productions.map((prod) => (
              <div key={prod.id} className="production-card">
                <div className="production-info">
                  <strong>Recipe:</strong> {prod.recipe_name || prod.recipe_id}
                  <br />
                  <strong>Quantity Produced:</strong> {prod.quantity_produced}
                  <br />
                  <strong>Date:</strong> {new Date(prod.produced_on).toLocaleDateString()}
                </div>
              </div>   
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionPage;