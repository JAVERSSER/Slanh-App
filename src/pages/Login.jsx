import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang, LangToggleBtn } from "../context/LangContext";

const ERROR_MSG = {
  invalid_credentials: { kh: "លេខ​ទូរស័ព្ទ ឬ​ លេខ​សម្ងាត់​ មិន​ត្រូវ", en: "Wrong phone or password" },
};

export default function Login() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const { t, lang } = useLang();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => { clearError(); setForm((f) => ({ ...f, [key]: val })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const ok = login(form);
    setLoading(false);
    if (ok) navigate("/discover");
  };

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 kh-gradient" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute bottom-40 -left-12 w-40 h-40 rounded-full bg-[#F5A623]/15" />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <LangToggleBtn />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center pt-8 pb-6">
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/30 mb-3">
          <span className="text-3xl">❤️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{t("appName")}</h1>
        <p className="text-white/60 text-sm mt-1">{t("welcomeBack")}</p>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 bg-[#FDF8F0] rounded-t-3xl px-6 pt-8 pb-10">
        <h2 className="text-2xl font-bold text-[#032EA1] mb-6">{t("login")}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("phone")}</label>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 focus-within:border-[#032EA1] transition-colors">
              <span className="text-lg">🇰🇭</span>
              <span className="text-gray-400 text-sm">+855</span>
              <div className="w-px h-5 bg-gray-200" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="012 xxx xxx"
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("password")}</label>
            <div className="flex items-center bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 focus-within:border-[#032EA1] transition-colors">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="text-gray-400 hover:text-gray-600 ml-2">
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span>⚠️</span>
              <p className="text-red-600 text-sm">{ERROR_MSG[error]?.[lang] ?? error}</p>
            </div>
          )}

          {/* Forgot */}
          <div className="text-right">
            <button type="button" className="text-[#032EA1] text-sm font-medium hover:underline">
              {t("forgotPass")}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.phone || !form.password}
            className="w-full py-4 rounded-2xl kh-gradient text-white font-bold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : t("login")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">{t("orContinue")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "📘", label: "Facebook" },
            { icon: "📱", label: "Google" },
          ].map((s) => (
            <button key={s.label} className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#032EA1]/30 transition-colors text-sm font-medium text-gray-600 active:scale-95">
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t("noAccount")}{" "}
          <Link to="/register" className="text-[#032EA1] font-bold hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
