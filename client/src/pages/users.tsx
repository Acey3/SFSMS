import { useEffect, useState } from "react";
import api from "../services/api";
import { useLocation } from "wouter";
import "../style.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const MAX_USERS = 7;

const UsersPage = () => {
  const [location, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("All fields are required.");
    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error adding user.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setShowForm(true);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(""); // You may want to handle password differently for editing
    // Optionally, store user.id in state for update
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error deleting user.");
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
      <div className="users-main-card">
        <div className="users-header-row">
          <div>
            <h2 className="users-title">
              <span className="users-title-icon">👥</span> User Management
            </h2>
            <div className="users-count">{users.length} / {MAX_USERS} users</div>
          </div>
          <button className="add-user-btn" onClick={() => setShowForm(true)}>
            <span className="add-user-icon">👤+</span> Add User
          </button>
        </div>

        {/* Add User Form (modal style) */}
        {showForm && (
          <div className="modal-bg">
            <div className="modal-card">
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser} className="modal-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table or Empty Message */}
        {users.length === 0 ? (
          <div className="empty-text" style={{ textAlign: "center", margin: "40px 0" }}>
            No users yet
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        title="Edit"
                        onClick={() => handleEditUser(u)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
