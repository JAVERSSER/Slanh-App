import { useNavigate } from "react-router-dom";
import { useLang, LangToggleBtn } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isAuthenticated } = useAuth();

  // If already logged in, skip to discover
  useEffect(() => { if (isAuthenticated) navigate("/discover"); }, [isAuthenticated]);

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 kh-gradient" />

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
      <div className="absolute top-36 -left-16 w-52 h-52 rounded-full bg-white/5" />
      <div className="absolute bottom-44 -right-12 w-40 h-40 rounded-full" style={{ background: "rgba(245,166,35,0.15)" }} />

      {/* Angkor silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-28 opacity-10 pointer-events-none">
        <svg viewBox="0 0 430 110" fill="white" preserveAspectRatio="xMidYMax meet">
          <rect x="0" y="75" width="430" height="35" />
          <rect x="40" y="55" width="28" height="55" /><polygon points="40,55 68,55 54,38" />
          <rect x="90" y="48" width="22" height="62" /><polygon points="90,48 112,48 101,28" />
          <rect x="180" y="28" width="70" height="82" />
          <rect x="196" y="16" width="38" height="94" />
          <polygon points="180,28 250,28 215,4" /><polygon points="196,16 234,16 215,0" />
          <rect x="285" y="55" width="22" height="55" /><polygon points="285,55 307,55 296,38" />
          <rect x="330" y="48" width="28" height="62" /><polygon points="330,48 358,48 344,28" />
        </svg>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-6 rounded-full bg-[#F5A623]" />
          <div className="w-2 h-6 rounded-full bg-white" />
          <div className="w-2 h-6 rounded-full bg-[#E00025]" />
        </div>
        <LangToggleBtn />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 heart-beat">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="text-5xl">❤️</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-1">{t("appName")}</h1>
        <p className="text-2xl font-bold mb-1" style={{ color: "#F5A623" }}>Slanh App</p>
        <p className="text-white/60 text-sm mb-8">{t("appTagline")}</p>

        <div className="angkor-divider w-full max-w-xs mb-8">🏛️</div>

        <p className="text-white/80 text-base mb-10 leading-relaxed max-w-xs">
          {t("cambodiaOnly")}
          <br />
          <span className="font-semibold" style={{ color: "#F5A623" }}>
            {t("isKh") || "រក​ដៃ​គូ​ស្មោះ​ ជាមួយ​ Slanh"}
          </span>
        </p>

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <button onClick={() => navigate("/login")}
            className="w-full py-4 rounded-2xl bg-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            style={{ color: "var(--kh-blue)" }}>
            {t("login")}
          </button>
          <button onClick={() => navigate("/register")}
            className="w-full py-4 rounded-2xl border-2 border-white/50 text-white font-bold text-lg hover:bg-white/10 active:scale-95 transition-all">
            {t("register")}
          </button>
        </div>

        <p className="mt-6 text-white/30 text-xs">Made with ❤️ for Cambodia 🇰🇭</p>
      </div>
    </div>
  );
}
