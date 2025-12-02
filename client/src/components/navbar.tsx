
import { useLocation } from "wouter";

// src/components/Navbar.tsx

const Navbar = () => {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/");
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-400 shadow-lg px-8 py-4 flex items-center justify-between rounded-2xl mb-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/vite.svg" alt="Logo" className="h-10 w-10 rounded-full bg-white p-1 shadow" />
        <span className="text-2xl font-extrabold text-white tracking-wide">Smart Feed</span>
      </div>
      {/* Links */} 
      <div className="flex gap-6">
        <a href="/dashboard" className="text-white font-medium hover:bg-white/20 px-3 py-2 rounded-lg transition">Dashboard</a>
        <a href="/ingredients" className="text-white font-medium hover:bg-white/20 px-3 py-2 rounded-lg transition">Ingredients</a>
        <a href="/recipes" className="text-white font-medium hover:bg-white/20 px-3 py-2 rounded-lg transition">Recipes</a>
        <a href="/production" className="text-white font-medium hover:bg-white/20 px-3 py-2 rounded-lg transition">Production</a>
        <a href="/users" className="text-white font-medium hover:bg-white/20 px-3 py-2 rounded-lg transition">Users</a>
      </div>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-white text-green-700 hover:bg-green-100 px-5 py-2 rounded-lg font-semibold shadow transition border border-green-200"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
