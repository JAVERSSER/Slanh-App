import { NavLink } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useSettings } from "../context/SettingsContext";

const items = [
  {
    to: "/discover",
    label: "Find",
    icon: (active) => (
      /* Heart */
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ),
  },
  {
    to: "/matches",
    label: "Matches",
    icon: (active) => (
      /* Heart */
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    ),
  },
  {
    to: "/events",
    label: "Events",
    icon: (active) => (
      /* Calendar */
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="3"/>
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    to: "/messages",
    label: "Chat",
    icon: (active) => (
      /* Chat bubble */
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (active) => (
      /* Person */
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="8" r="4"/>
        <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function Navbar() {
  const { t } = useLang();
  const { theme } = useSettings();

  return (
    <nav className="bottom-nav" style={{ background: theme.gradient }}>
      <div className="flex items-center justify-between gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className="flex-1">
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-1 py-2 px-2 rounded-full transition-all duration-200`}
                style={isActive ? { background: "rgba(255,255,255,0.20)" } : {}}>
                {/* Icon + badge wrapper */}
                <div className="relative">
                  <span style={{ color: isActive ? "white" : "rgba(255,255,255,0.50)" }}>
                    {item.icon(isActive)}
                  </span>
                  {item.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: theme.accent }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold leading-none"
                  style={{ color: isActive ? "white" : "rgba(255,255,255,0.50)" }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
