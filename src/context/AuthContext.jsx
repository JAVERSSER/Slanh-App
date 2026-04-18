import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Simulated user store (replace with real API calls via src/services/api.js)
const MOCK_USERS_KEY = "slanh_users";
const CURRENT_USER_KEY = "slanh_current_user";

function getUsers() {
  return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState("");

  const clearError = () => setError("");

  /** Register a new user */
  const register = ({ name, phone, password, dob, gender, province }) => {
    const users = getUsers();
    if (users.find((u) => u.phone === phone)) {
      setError("phone_taken");
      return false;
    }
    const newUser = {
      id: Date.now(),
      name,
      phone,
      password, // NOTE: hash in real backend
      dob,
      gender,
      province,
      avatar: `https://i.pravatar.cc/600?img=${Math.floor(Math.random() * 70)}`,
      bio: "",
      interests: [],
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setError("");
    return true;
  };

  /** Login with phone + password */
  const login = ({ phone, password }) => {
    const users = getUsers();
    const found = users.find((u) => u.phone === phone && u.password === password);
    if (!found) {
      setError("invalid_credentials");
      return false;
    }
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setError("");
    return true;
  };

  /** Update current user profile */
  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    // also update in users store
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, error, clearError, register, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
