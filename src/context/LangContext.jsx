import { createContext, useContext, useState } from "react";
import translations from "../data/translations";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() =>
    localStorage.getItem("slanh_lang") || "kh"
  );

  const toggleLang = () => {
    const next = lang === "kh" ? "en" : "kh";
    setLang(next);
    localStorage.setItem("slanh_lang", next);
  };

  /** t("key") returns the translated string */
  const t = (key) => translations[key]?.[lang] ?? key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Small toggle button — drop it anywhere in a header */
export function LangToggleBtn({ className = "" }) {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-bold hover:bg-white/25 active:scale-95 transition-all ${className}`}
      aria-label="Toggle language"
    >
      <span>{lang === "kh" ? "🇰🇭" : "🇺🇸"}</span>
      <span>{lang === "kh" ? "ខ្មែរ" : "EN"}</span>
    </button>
  );
}

/** Same button but for light backgrounds */
export function LangToggleBtnDark({ className = "" }) {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#032EA1]/10 border border-[#032EA1]/20 text-[#032EA1] text-sm font-bold hover:bg-[#032EA1]/15 active:scale-95 transition-all ${className}`}
      aria-label="Toggle language"
    >
      <span>{lang === "kh" ? "🇰🇭" : "🇺🇸"}</span>
      <span>{lang === "kh" ? "ខ្មែរ" : "EN"}</span>
    </button>
  );
}
