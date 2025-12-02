import { Link, useLocation } from "wouter";
import { FaBox, FaList, FaCogs, FaUser, FaIndustry } from "react-icons/fa";
import type { ReactNode } from "react";
import "../index.css";

interface LayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaBox /> },
    { path: "/ingredients", label: "Ingredients", icon: <FaList /> },
    { path: "/recipes", label: "Recipes", icon: <FaCogs /> },
    { path: "/production", label: "Production", icon: <FaIndustry /> },
    { path: "/users", label: "Users", icon: <FaUser /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold text-green-600">Smart Feed</h1>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-sm text-gray-500">
          © {new Date().getFullYear()} Smart Feed
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
