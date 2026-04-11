import { createContext, useContext, useState } from "react";

/* ── Preset themes ──────────────────────── */
export const THEMES = [
  {
    id: "cambodia", name: "Cambodia 🇰🇭",
    primary: "#032EA1", secondary: "#E00025", accent: "#F5A623", bg: "#FDF8F0",
    gradient: "linear-gradient(135deg,#032EA1 0%,#1a4fcc 55%,#8B0020 100%)",
  },
  {
    id: "sunset", name: "Sunset 🌅",
    primary: "#C2410C", secondary: "#F59E0B", accent: "#FCD34D", bg: "#FFF7ED",
    gradient: "linear-gradient(135deg,#C2410C 0%,#EA580C 50%,#D97706 100%)",
  },
  {
    id: "forest", name: "Forest 🌿",
    primary: "#166534", secondary: "#15803D", accent: "#84CC16", bg: "#F0FDF4",
    gradient: "linear-gradient(135deg,#14532D 0%,#166534 55%,#15803D 100%)",
  },
  {
    id: "night", name: "Night 🌙",
    primary: "#1E1B4B", secondary: "#7C3AED", accent: "#A78BFA", bg: "#0F0F1A",
    gradient: "linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243e 100%)",
  },
  {
    id: "royal", name: "Royal 👑",
    primary: "#6B21A8", secondary: "#DB2777", accent: "#F0ABFC", bg: "#FAF5FF",
    gradient: "linear-gradient(135deg,#581C87 0%,#7E22CE 55%,#9D174D 100%)",
  },
  {
    id: "ocean", name: "Ocean 🌊",
    primary: "#0369A1", secondary: "#0891B2", accent: "#38BDF8", bg: "#F0F9FF",
    gradient: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0E7490 100%)",
  },
];

/* ── Background patterns ─────────────────── */
export const BG_STYLES = [
  { id: "solid",    name: "Solid",    nameKh: "ពណ៌​ធម្មតា"  },
  { id: "gradient", name: "Gradient", nameKh: "ជម្រាល​ពណ៌" },
  { id: "angkor",   name: "Angkor",   nameKh: "អង្គរ​វត្ត"  },
  { id: "dots",     name: "Dots",     nameKh: "ចំណុច"       },
  { id: "kbach",    name: "Kbach",    nameKh: "ក្បាច់​ខ្មែរ" },
];

const SettingsContext = createContext(null);

function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function SettingsProvider({ children }) {
  const [themeId, setThemeIdState] = useState(
    () => localStorage.getItem("slanh_theme") || "cambodia"
  );
  const [bgStyle, setBgStyleState] = useState(
    () => localStorage.getItem("slanh_bg") || "gradient"
  );
  const [layout, setLayoutState] = useState(
    () => localStorage.getItem("slanh_layout") || "card"
  );
  const [compact, setCompactState] = useState(
    () => localStorage.getItem("slanh_compact") === "true"
  );
  const [darkMode, setDarkModeState] = useState(
    () => localStorage.getItem("slanh_dark") === "true"
  );
  const [showDistance, setShowDistState] = useState(
    () => localStorage.getItem("slanh_dist") !== "false"
  );
  const [showAge, setShowAgeState] = useState(
    () => localStorage.getItem("slanh_age") !== "false"
  );
  // Custom background image (blob URL — current session only)
  const [bgImage, setBgImageRaw] = useState(null);

  const theme = getTheme(themeId);

  const setThemeId = (id) => {
    setThemeIdState(id);
    localStorage.setItem("slanh_theme", id);
  };
  const setBgStyle = (s) => {
    setBgStyleState(s);
    localStorage.setItem("slanh_bg", s);
  };
  const setLayout = (v) => {
    setLayoutState(v);
    localStorage.setItem("slanh_layout", v);
  };
  const toggleCompact = () => {
    const n = !compact;
    setCompactState(n);
    localStorage.setItem("slanh_compact", String(n));
  };
  const toggleDarkMode = () => {
    const n = !darkMode;
    setDarkModeState(n);
    localStorage.setItem("slanh_dark", String(n));
    document.documentElement.classList.toggle("dark", n);
  };
  const toggleDistance = () => {
    const n = !showDistance;
    setShowDistState(n);
    localStorage.setItem("slanh_dist", String(n));
  };
  const toggleAge = () => {
    const n = !showAge;
    setShowAgeState(n);
    localStorage.setItem("slanh_age", String(n));
  };
  const setBgImage = (url) => setBgImageRaw(url);

  return (
    <SettingsContext.Provider value={{
      theme, themeId, setThemeId,
      bgStyle, setBgStyle,
      bgImage, setBgImage,
      layout, setLayout,
      compact, toggleCompact,
      darkMode, toggleDarkMode,
      showDistance, toggleDistance,
      showAge, toggleAge,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
