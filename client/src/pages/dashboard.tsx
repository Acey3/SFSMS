import { useEffect, useState } from "react";
import api from "../services/api";
import { useLocation } from "wouter";
import "../style.css"; // make sure styles.css is imported

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      setLocation("/login");
      return;
    }

    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
    }

    const fetchIngredients = async () => {
      try {
        const res = await api.get("/ingredients");
        setIngredients(res.data);
      } catch {
        setError("Failed to fetch ingredients.");
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();

    //Poll every 10 seconds
    const interval = setInterval(fetchIngredients, 10000);
    return() => clearInterval(interval);
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  const getStockSummary = () => {
    let good = 0, low = 0, critical = 0;
    ingredients.forEach((ing: any) => {
      const q = Number(ing.quantity) || 0;
      const min = Number(ing.min_quantity) || 0;
      if (q < min) {
        critical++;
      } else if (q < min * 2) {
        low++;
      } else {
        good++;
      }
    });
    return [
      { label: "Good Stock", value: good, description: "Above threshold", color: "good", icon: "📦" },
      { label: "Low Stock", value: low, description: "Need attention", color: "low", icon: "↘️" },
      { label: "Critical Stock", value: critical, description: "Urgent restock needed", color: "critical", icon: "⚠️" },
    ];
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-circle">
            {/* SVG leaf icon */}
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M12 19c-4.418 0-8-4.03-8-9V5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V10c0 4.97-3.582 9-8 9Zm0 0V8m0 0c2.5 0 4.5 2 4.5 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="dashboard-title">Feed Stock Manager</h1>
            <p className="dashboard-subtitle">Intelligent inventory tracking</p>
          </div>
        </div>
        <div className="dashboard-userinfo">
          <span className="dashboard-email">{userName}</span>
          <span className="dashboard-role">Administrator</span>
          <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button className="nav-btn active"onClick={() => setLocation("/dashboard")}>Dashboard</button>
        <button className="nav-btn"onClick={() => setLocation("/ingredients") }>Ingredients</button>
        <button className="nav-btn"onClick={() => setLocation("/recipes")}>Recipes</button>
        <button className="nav-btn"onClick={() => setLocation("/production")}>Production</button>
        <button className="nav-btn"onClick={() => setLocation("/users")}>Users</button>
      </nav>

      {/* Status Cards */}
      <div className="dashboard-status-cards">
        {getStockSummary().map((card) => (
          <div key={card.label} className={`status-card ${card.color}`}>
            <div className="status-card-header">
              <span>{card.label}</span>
              <span className="status-icon">{card.icon}</span>
            </div>
            <div className="status-value">{card.value}</div>
            <div className="status-desc">{card.description}</div>
          </div>
        ))}
      </div>

      {/* Ingredient Stock Levels */}
      <div className="ingredient-stock-card">
        <h2 className="ingredient-stock-title">Ingredient Stock Levels</h2>
        <p className="ingredient-stock-desc">
          Monitor your feed ingredients and their current quantities
        </p>
        <ul className="ingredient-list">
          {ingredients.map((ing: any) => {
            const q = Number(ing.quantity) || 0;
            const min = Number(ing.min_quantity) || 0;
            return (
              <li key={ing.id} className="ingredient-row">
                <div className="ingredient-info">
                  <span className="ingredient-name">{ing.name}</span>
                  <span className="ingredient-threshold">Threshold: {min} {ing.unit}</span>
                </div>
                <div className="ingredient-qty">
                  <span className="ingredient-quantity">{q}</span>
                  <span className="ingredient-unit">{ing.unit}</span>
                  <span className={`ingredient-status ${q < min ? 'critical' : 'good'}`}>
                    {q < min ? 'Critical' : 'Good'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
