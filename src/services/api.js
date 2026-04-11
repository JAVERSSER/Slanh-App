/**
 * Slanh App — API Service
 * ========================
 * Change BASE_URL to your backend server URL.
 * All API calls go through this file — easy to maintain.
 *
 * HOW TO USE:
 *   import api from "../services/api";
 *   const profiles = await api.profiles.getAll();
 */

// ✅ Change this to your backend URL when ready
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper: attach auth token to every request
function getHeaders() {
  const token = localStorage.getItem("slanh_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper: handle fetch response
async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Something went wrong");
  }
  return res.json();
}

// ─── AUTH ───────────────────────────────────────────────
const auth = {
  /** POST /api/auth/login — { phone, password } */
  login: (phone, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ phone, password }),
    }).then(handleResponse),

  /** POST /api/auth/register — { name, phone, password, dob, gender } */
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  logout: () => localStorage.removeItem("slanh_token"),

  saveToken: (token) => localStorage.setItem("slanh_token", token),
  getToken: () => localStorage.getItem("slanh_token"),
};

// ─── PROFILES ───────────────────────────────────────────
const profiles = {
  /** GET /api/profiles — returns array of nearby profiles */
  getAll: () =>
    fetch(`${BASE_URL}/profiles`, { headers: getHeaders() }).then(handleResponse),

  /** GET /api/profiles/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/profiles/${id}`, { headers: getHeaders() }).then(handleResponse),

  /** PUT /api/profiles/me — update current user profile */
  updateMe: (data) =>
    fetch(`${BASE_URL}/profiles/me`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  /** POST /api/profiles/me/photo — upload profile photo */
  uploadPhoto: (formData) =>
    fetch(`${BASE_URL}/profiles/me/photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.getToken()}` }, // no Content-Type for FormData
      body: formData,
    }).then(handleResponse),
};

// ─── SWIPES ─────────────────────────────────────────────
const swipes = {
  /** POST /api/swipes — { targetId, direction: "like" | "nope" } */
  send: (targetId, direction) =>
    fetch(`${BASE_URL}/swipes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ targetId, direction }),
    }).then(handleResponse),
};

// ─── MATCHES ────────────────────────────────────────────
const matches = {
  /** GET /api/matches — returns all matches for current user */
  getAll: () =>
    fetch(`${BASE_URL}/matches`, { headers: getHeaders() }).then(handleResponse),
};

// ─── MESSAGES ───────────────────────────────────────────
const messages = {
  /** GET /api/messages/:matchId — get chat history */
  getByMatch: (matchId) =>
    fetch(`${BASE_URL}/messages/${matchId}`, { headers: getHeaders() }).then(handleResponse),

  /** POST /api/messages/:matchId — send a message */
  send: (matchId, text) =>
    fetch(`${BASE_URL}/messages/${matchId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),
};

// ─── EXPORT ─────────────────────────────────────────────
const api = { auth, profiles, swipes, matches, messages };
export default api;
