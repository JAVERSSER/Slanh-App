import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang, LangToggleBtn } from "../context/LangContext";

const PROVINCES = [
  "ភ្នំពេញ", "សៀមរាប", "បាត់ដំបង", "សីហនុវិល្លេ", "កំពត",
  "កំពង់ចាម", "ក្រចេះ", "ស្ទឹងត្រែង", "ព្រះវិហារ", "ឧត្តរមានជ័យ",
  "ព្រះសីហនុ", "តាកែវ", "ស្វាយរៀង", "ព្រៃវែង", "កណ្ដាល",
];


/* ── Cambodian phone validation ─────────────────────────────────────
   Format : 9 digits, starts with 0  (local format, no +855)
   Valid prefixes: 010-017, 038, 060-069, 070-079, 080-089, 090-099
   Rejects: wrong length, invalid prefix, sequential/fake patterns
─────────────────────────────────────────────────────────────────── */
const KH_VALID_PREFIXES = new Set([
  "010","011","012","013","015","016","017",
  "038",
  "060","061","062","063","064","065","066","067","068","069",
  "070","071","072","073","074","075","076","077","078","079",
  "080","081","082","083","084","085","086","087","088","089",
  "090","091","092","093","095","096","097","098","099",
]);

function validateKhmerPhone(raw) {
  const phone = raw.replace(/[\s\-().+]/g, "");
  // Accept +855XXXXXXXX (international) → strip country code
  const local = phone.startsWith("855") && phone.length === 11
    ? "0" + phone.slice(3)
    : phone;

  if (!/^0\d{8}$/.test(local)) return "format";
  if (!KH_VALID_PREFIXES.has(local.substring(0, 3))) return "prefix";

  const body = local.slice(1); // 8 digits after leading 0
  // All same digit: 00000000, 11111111 …
  if (/^(\d)\1{7}$/.test(body)) return "fake";
  // Ascending sequential: 12345678
  if (body === "12345678") return "fake";
  // Descending sequential
  if (body === "98765432" || body === "87654321") return "fake";
  // Repeating 2-digit pair: 12121212
  if (/^(\d{2})\1{3}$/.test(body)) return "fake";
  // Repeating 4-digit pair: 12341234
  if (/^(\d{4})\1$/.test(body)) return "fake";

  return "ok";
}

const ERROR_MSG = {
  phone_taken:  { kh: "លេខ​ទូរស័ព្ទ​នេះ​ប្រើ​រួច​ហើយ", en: "Phone already registered" },
  pass_mismatch:{ kh: "លេខ​សម្ងាត់​មិន​ត្រូវ​គ្នា",   en: "Passwords don't match" },
  phone_format: { kh: "លេខ​ទូរស័ព្ទ​ត្រូវ​មាន​ 9 ខ្ទង់ (ឧ. 012 345 678)", en: "Phone must be 9 digits — e.g. 012 345 678" },
  phone_prefix: { kh: "លេខ​នេះ​មិន​មែន​ជា​លេខ​ប្រតិបត្តិករ​កម្ពុជា​ (Cellcard/Smart/Metfone…)", en: "Not a valid Cambodian operator prefix (010–017, 038, 060–099)" },
  phone_fake:   { kh: "លេខ​ទូរស័ព្ទ​ហ្នឹង​មើល​ទៅ​ជា​លេខ​ក្លែងក្លាយ​ ឬ​ស្វ័យ​ប្រវត្តិ", en: "Phone looks fake or sequential — please use a real number" },
};

export default function Register() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const { t, lang } = useLang();

  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", password: "", confirmPass: "",
    dob: "", gender: "", province: "",
  });

  const set = (key, val) => { clearError(); setLocalError(""); setForm((f) => ({ ...f, [key]: val })); };

  const nextStep = () => {
    if (step === 0) {
      if (!form.name || !form.phone || !form.password || !form.dob || !form.gender) {
        setLocalError(lang === "kh" ? "សូម​បំពេញ​ព័ត៌មាន​គ្រប់​ចន្លោះ" : "Please fill all fields");
        return;
      }
      const phoneCheck = validateKhmerPhone(form.phone);
      if (phoneCheck !== "ok") {
        setLocalError(ERROR_MSG[`phone_${phoneCheck}`][lang]);
        return;
      }
      if (form.password !== form.confirmPass) {
        setLocalError(ERROR_MSG.pass_mismatch[lang]);
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.province) { setLocalError(lang === "kh" ? "សូម​ជ្រើស​ខេត្ត" : "Please select province"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const ok = register(form);
    setLoading(false);
    if (ok) { setStep(2); setTimeout(() => navigate("/discover"), 1500); }
  };

  const displayError = localError || (error ? ERROR_MSG[error]?.[lang] : "");

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 kh-gradient" />
      <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-white/5" />
      <div className="absolute bottom-40 -right-12 w-40 h-40 rounded-full bg-[#F5A623]/15" />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/")} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <LangToggleBtn />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center pt-6 pb-5">
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/30 mb-2">
          <span className="text-2xl">❤️</span>
        </div>
        <h1 className="text-xl font-bold text-white">{t("createAccount")}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {[0, 1].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "w-8 bg-[#F5A623]" : "w-4 bg-white/30"}`} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 bg-[#FDF8F0] rounded-t-3xl px-6 pt-8 pb-10">

        {/* STEP 0 — Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#032EA1] mb-2">{lang === "kh" ? "ព័ត៌មាន​ផ្ទាល់​ខ្លួន" : "Personal Info"}</h2>

            {[
              { key: "name", label: t("fullName"), type: "text", placeholder: lang === "kh" ? "ឈ្មោះ​របស់​អ្នក" : "Your full name", icon: "👤" },
              { key: "dob", label: t("dob"), type: "date", icon: "🎂" },
            ].map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 focus-within:border-[#032EA1] transition-colors">
                  <span>{icon}</span>
                  <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="flex-1 outline-none bg-transparent" />
                </div>
              </div>
            ))}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t("phone")}</label>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 focus-within:border-[#032EA1] transition-colors">
                <span>🇰🇭</span><span className="text-gray-400 text-sm">+855</span>
                <div className="w-px h-5 bg-gray-200" />
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="012 xxx xxx" className="flex-1 outline-none bg-transparent" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">{t("gender")}</label>
              <div className="flex gap-3">
                {[{ val: "male", label: t("male"), icon: "👨" }, { val: "female", label: t("female"), icon: "👩" }].map((g) => (
                  <button key={g.val} type="button" onClick={() => set("gender", g.val)}
                    className={`flex-1 py-3 min-h-[52px] rounded-2xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1 ${form.gender === g.val ? "border-[#032EA1] bg-[#032EA1]/5 text-[#032EA1]" : "border-gray-100 bg-white text-gray-500"}`}>
                    <span className="text-xl">{g.icon}</span>{g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            {["password", "confirmPass"].map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{key === "password" ? t("password") : t("confirmPass")}</label>
                <div className="flex items-center bg-white rounded-2xl px-4 py-3 border-2 border-gray-100 focus-within:border-[#032EA1] transition-colors">
                  <input type={showPass ? "text" : "password"} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder="••••••••" className="flex-1 outline-none bg-transparent" />
                  {key === "confirmPass" && (
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="text-gray-400 ml-2">{showPass ? "🙈" : "👁️"}</button>
                  )}
                </div>
              </div>
            ))}

            {displayError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">⚠️ {displayError}</p>}

            <button onClick={nextStep} className="w-full py-4 rounded-2xl kh-gradient text-white font-bold text-lg mt-2 active:scale-95 transition-transform">
              {lang === "kh" ? "បន្ត​ ➤" : "Next ➤"}
            </button>
          </div>
        )}

        {/* STEP 1 — Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#032EA1] mb-2">📍 {t("province")}</h2>
            <p className="text-gray-400 text-sm mb-3">{lang === "kh" ? "អ្នក​នៅ​ខេត្ត​ណា?" : "Which province are you in?"}</p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
              {PROVINCES.map((p) => (
                <button key={p} onClick={() => set("province", p)}
                  className={`py-3 px-4 min-h-[48px] rounded-2xl text-sm border-2 transition-all font-medium ${form.province === p ? "border-[#032EA1] bg-[#032EA1] text-white" : "border-gray-100 bg-white text-gray-600 hover:border-[#032EA1]/40"}`}>
                  {p}
                </button>
              ))}
            </div>

            {displayError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">⚠️ {displayError}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-2xl kh-gradient text-white font-bold text-lg mt-2 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (lang === "kh" ? "បង្កើត​គណនី 🎉" : "Create Account 🎉")}
            </button>
          </div>
        )}

        {/* STEP 2 — Success */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4 match-animate">🎉</div>
            <h2 className="text-2xl font-bold text-[#032EA1] mb-2">{lang === "kh" ? "ស្វាគមន៍​មក​កាន់​ Slanh!" : "Welcome to Slanh!"}</h2>
            <p className="text-gray-400">{lang === "kh" ? "ចាប់​ផ្ដើម​រក​ដៃ​គូ​ ..." : "Finding your match..."}</p>
            <div className="mt-6 w-8 h-8 border-3 border-[#032EA1]/20 border-t-[#032EA1] rounded-full animate-spin" />
          </div>
        )}

        {/* Login link */}
        {step < 2 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            {t("alreadyAccount")}{" "}
            <Link to="/login" className="text-[#032EA1] font-bold hover:underline">{t("login")}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
