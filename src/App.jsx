import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider }     from "./context/LangContext";
import { AuthProvider }     from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Navbar               from "./components/Navbar";
import SwipeBack            from "./components/SwipeBack";
import Landing              from "./pages/Landing";
import Login                from "./pages/Login";
import Register             from "./pages/Register";
import Discover             from "./pages/Discover";
import Matches              from "./pages/Matches";
import Events               from "./pages/Events";
import Messages             from "./pages/Messages";
import Profile              from "./pages/Profile";
import { useEffect }        from "react";

function Layout({ children }) {
  return (
    <div className="relative">
      {children}
      <Navbar />
    </div>
  );
}

/** Applies theme CSS variables + background style to :root / body */
function ThemeApplier() {
  const { theme, bgStyle, bgImage } = useSettings();
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--kh-blue",  theme.primary);
    r.setProperty("--kh-red",   theme.secondary);
    r.setProperty("--kh-gold",  theme.accent);
    r.setProperty("--kh-cream", theme.bg);

    const b = document.body.style;
    b.backgroundColor = theme.bg;
    // Custom uploaded image takes priority
    if (bgImage) {
      b.backgroundImage      = `url("${bgImage}")`;
      b.backgroundSize       = "cover";
      b.backgroundPosition   = "center";
      b.backgroundAttachment = "fixed";
      return;
    }
    b.backgroundAttachment = "";
    if (bgStyle === "gradient") {
      b.backgroundImage = `radial-gradient(ellipse at top, ${theme.primary}0A 0%, transparent 60%)`;
      b.backgroundSize  = "";
    } else if (bgStyle === "dots") {
      b.backgroundImage = `radial-gradient(circle, ${theme.primary}22 1px, transparent 1px)`;
      b.backgroundSize  = "20px 20px";
    } else if (bgStyle === "kbach") {
      b.backgroundImage = `repeating-linear-gradient(45deg,${theme.primary}0D,${theme.primary}0D 2px,transparent 2px,transparent 14px)`;
      b.backgroundSize  = "";
    } else if (bgStyle === "angkor") {
      b.backgroundImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 80' fill='${encodeURIComponent(theme.primary)}' opacity='0.04' xmlns='http://www.w3.org/2020/svg'%3E%3Crect x='0' y='55' width='200' height='25'/%3E%3Crect x='75' y='20' width='50' height='60'/%3E%3Crect x='85' y='8' width='30' height='72'/%3E%3Cpolygon points='75,20 125,20 100,2'/%3E%3C/svg%3E")`;
      b.backgroundSize  = "200px 80px";
    } else {
      b.backgroundImage = "none";
      b.backgroundSize  = "";
    }
  }, [theme, bgStyle, bgImage]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ThemeApplier />
      <SwipeBack />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Layout><Discover /></Layout>} />
        <Route path="/matches"  element={<Layout><Matches /></Layout>} />
        <Route path="/events"   element={<Layout><Events /></Layout>} />
        <Route path="/messages" element={<Layout><Messages /></Layout>} />
        <Route path="/profile"  element={<Layout><Profile /></Layout>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </LangProvider>
  );
}
