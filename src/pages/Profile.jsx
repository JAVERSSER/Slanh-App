import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import { useLang }     from "../context/LangContext";
import { useSettings, THEMES, BG_STYLES } from "../context/SettingsContext";
import { currentUser } from "../data/profiles";

const PROVINCE_LIST = ["ភ្នំពេញ","សៀមរាប","បាត់ដំបង","កំពត","សីហនុវិល្លេ","ក្រចេះ","ស្ទឹងត្រែង","មណ្ឌលគីរី","រតនគីរី","ពោធ៍សាត់","កំពង់ចាម","កំពង់ស្ពឺ","តាកែវ","ព្រៃវែង","ស្វាយរៀង"];
const INTEREST_LIST = ["ធ្វើ​ដំណើរ","តន្ត្រី","ចម្អិន","ថត​រូប","ហ្វឹក​ហ្វឺន","ហែល​ទឹក","អាន","Gaming","ចំណីអាហារ","យូហ្គា","ប្រាសាទ","ភាពយន្ត","ស្ទូច​ត្រី","សមុទ្រ","IT"];

function Toggle({ on, onToggle, color }) {
  return (
    <button onClick={onToggle} className="relative flex-shrink-0 transition-all"
      style={{ width: 48, height: 26, borderRadius: 13, background: on ? (color || "#032EA1") : "#e5e7eb" }}>
      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{ left: on ? 24 : 2 }} />
    </button>
  );
}

function SectionHead({ icon, title }) {
  return (
    <div className="flex items-center gap-2 px-5 pt-5 pb-2">
      <span className="text-base">{icon}</span>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
  );
}

function SettingRow({ icon, label, sub, right, onPress, last }) {
  return (
    <button onClick={onPress}
      className={`w-full flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors ${!last ? "border-b border-gray-50" : ""}`}>
      <span className="text-xl w-7 flex-shrink-0">{icon}</span>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {right ?? (
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

/* ── Edit Profile Modal ─────────────────── */
function EditProfileModal({ profile, onSave, onClose, theme }) {
  const [form, setForm] = useState({
    name:      profile.name     || "",
    nameEn:    profile.nameEn   || "",
    age:       profile.age      || 22,
    location:  profile.location || "ភ្នំពេញ",
    bio:       profile.bio      || "",
    interests: profile.interests || [],
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
  const avatarRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleInterest = (i) => {
    set("interests", form.interests.includes(i)
      ? form.interests.filter(x => x !== i)
      : [...form.interests, i]);
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    set("avatar", url);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 className="font-bold text-[#1A1A2E] text-base">កែ​សម្រួល​គណនី / Edit Profile</h2>
        <button onClick={() => onSave(form)}
          className="px-4 py-2 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform"
          style={{ background: theme.gradient }}>
          រក្សា​ទុក
        </button>
      </div>

      <div className="px-5 py-6 space-y-5 pb-16">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img src={avatarPreview} alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl" />
            <button onClick={() => avatarRef.current?.click()}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: theme.gradient }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
          </div>
          <p className="text-xs text-gray-400">ចុចដើម្បី​ប្ដូររូប / Tap to change photo</p>
        </div>

        {/* Fields */}
        {[
          { label: "ឈ្មោះ​ខ្មែរ / Khmer Name", key: "name",   type: "text",   placeholder: "ឈ្មោះ​ (Khmer)" },
          { label: "ឈ្មោះ​អង់គ្លេស / English Name", key: "nameEn", type: "text",   placeholder: "Name (English)" },
          { label: "អាយុ / Age",              key: "age",    type: "number", placeholder: "22" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{f.label}</label>
            <input type={f.type} value={form[f.key]}
              onChange={e => set(f.key, f.type === "number" ? +e.target.value : e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-300 transition-colors" />
          </div>
        ))}

        {/* Province */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">ខេត្ត / Province</label>
          <div className="flex flex-wrap gap-2">
            {PROVINCE_LIST.map(p => (
              <button key={p} onClick={() => set("location", p)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={form.location === p
                  ? { background: theme.primary, color: "white" }
                  : { background: "#f3f4f6", color: "#6b7280" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">អំពី​ខ្លួន / About Me</label>
          <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={4}
            placeholder="សរសេរ​អំពី​ខ្លួន​អ្នក... / Write about yourself..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-300 transition-colors resize-none" />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">ចូល​ចិត្ត / Interests ({form.interests.length} selected)</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_LIST.map(i => {
              const on = form.interests.includes(i);
              return (
                <button key={i} onClick={() => toggleInterest(i)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={on
                    ? { background: theme.primary, color: "white" }
                    : { background: `${theme.primary}14`, color: theme.primary }}>
                  {i}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Find Partner Panel ─────────────────── */
function FindPartnerPanel({ theme }) {
  const [prefs, setPrefs] = useState(() => {
    const stored = localStorage.getItem("slanh_partner");
    return stored ? JSON.parse(stored) : {
      lookingFor: "relationship",
      interestedIn: "all",
      minAge: 18,
      maxAge: 35,
      maxDist: 100,
      interests: [],
    };
  });

  const save = (updates) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    localStorage.setItem("slanh_partner", JSON.stringify(next));
  };

  const toggleInt = (i) => {
    const arr = prefs.interests;
    save({ interests: arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i] });
  };

  const LOOKING = [
    { val: "relationship", kh: "ទំនាក់​ទំនង​ស្នេហ", icon: "❤️"  },
    { val: "friendship",   kh: "មិត្ត​ភ័ក្ត",       icon: "🤝"  },
    { val: "casual",       kh: "កម្សាន្ត",           icon: "😊"  },
    { val: "marriage",     kh: "រៀប​ការ",             icon: "💍"  },
  ];
  const GENDER = [
    { val: "women", kh: "ស្ត្រី",  icon: "👩" },
    { val: "men",   kh: "បុរស",   icon: "👨" },
    { val: "all",   kh: "ទាំង​អស់", icon: "🌈" },
  ];

  return (
    <div className="mx-5 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Looking for */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">ស្វែង​រក / Looking For</p>
        <div className="grid grid-cols-2 gap-2">
          {LOOKING.map(item => (
            <button key={item.val} onClick={() => save({ lookingFor: item.val })}
              className="flex items-center gap-2 p-3 rounded-2xl border-2 transition-all"
              style={prefs.lookingFor === item.val
                ? { borderColor: theme.primary, background: `${theme.primary}08` }
                : { borderColor: "#f3f4f6", background: "white" }}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-semibold" style={{ color: prefs.lookingFor === item.val ? theme.primary : "#6b7280" }}>{item.kh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interested in */}
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">ចំណូល​ចិត្ត / Interested In</p>
        <div className="flex gap-2">
          {GENDER.map(g => (
            <button key={g.val} onClick={() => save({ interestedIn: g.val })}
              className="flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all"
              style={prefs.interestedIn === g.val
                ? { borderColor: theme.primary, background: `${theme.primary}08` }
                : { borderColor: "#f3f4f6", background: "white" }}>
              <span className="text-2xl mb-1">{g.icon}</span>
              <span className="text-xs font-medium" style={{ color: prefs.interestedIn === g.val ? theme.primary : "#9ca3af" }}>{g.kh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Age range */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-gray-500">អាយុ / Age Range</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${theme.primary}14`, color: theme.primary }}>
            {prefs.minAge} – {prefs.maxAge}
          </span>
        </div>
        <input type="range" min={18} max={50} value={prefs.minAge}
          onChange={e => save({ minAge: Math.min(+e.target.value, prefs.maxAge - 1) })}
          style={{ "--pct": `${((prefs.minAge-18)/32)*100}%` }} className="w-full mb-2" />
        <input type="range" min={18} max={60} value={prefs.maxAge}
          onChange={e => save({ maxAge: Math.max(+e.target.value, prefs.minAge + 1) })}
          style={{ "--pct": `${((prefs.maxAge-18)/42)*100}%` }} className="w-full" />
      </div>

      {/* Distance */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-gray-500">ចម្ងាយ / Max Distance</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${theme.primary}14`, color: theme.primary }}>
            {prefs.maxDist} km
          </span>
        </div>
        <input type="range" min={5} max={500} step={5} value={prefs.maxDist}
          onChange={e => save({ maxDist: +e.target.value })}
          style={{ "--pct": `${((prefs.maxDist-5)/495)*100}%` }} className="w-full" />
      </div>

      {/* Preferred interests */}
      <div className="px-4 py-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">ចូល​ចិត្ត​ដូច / Shared Interests</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_LIST.slice(0, 10).map(i => {
            const on = prefs.interests.includes(i);
            return (
              <button key={i} onClick={() => toggleInt(i)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={on
                  ? { background: theme.primary, color: "white" }
                  : { background: `${theme.primary}14`, color: theme.primary }}>
                {i}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main Profile Page ───────────────────── */
/* ── Photo Gallery ──────────────────────── */
function PhotoGallery({ mainAvatar, theme, isKh }) {
  // 6 slots: first is the main avatar, rest are extras
  const [photos, setPhotos] = useState(() => [mainAvatar, null, null, null, null, null]);
  const [lightbox, setLightbox] = useState(null);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handlePick = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos(p => { const n = [...p]; n[idx] = url; return n; });
    e.target.value = "";
  };

  const remove = (idx) => setPhotos(p => { const n = [...p]; n[idx] = idx === 0 ? mainAvatar : null; return n; });

  return (
    <div className="mx-5 mb-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{isKh ? "រូប​ភាព / Photos" : "My Photos"}</p>
        <p className="text-xs text-gray-400">{photos.filter(Boolean).length}/6</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, idx) => (
          <div key={idx} className="relative rounded-2xl overflow-hidden bg-gray-100"
            style={{ aspectRatio: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
            {photo ? (
              <>
                <img src={photo} alt="" className="w-full h-full object-cover" />
                {/* Tap to view */}
                <button className="absolute inset-0 opacity-0" onClick={() => setLightbox(photo)} />
                {/* Remove */}
                <button onClick={() => remove(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs shadow">✕</button>
                {/* Main badge */}
                {idx === 0 && (
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: theme.gradient }}>Main</div>
                )}
              </>
            ) : (
              <button onClick={() => inputRefs[idx].current?.click()}
                className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors active:scale-95">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.primary}18` }}>
                  <svg className="w-4 h-4" style={{ color: theme.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <span className="text-[10px] text-gray-400">Add Photo</span>
              </button>
            )}
            <input ref={inputRefs[idx]} type="file" accept="image/*" className="hidden"
              onChange={e => handlePick(idx, e)} />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 px-1">{isKh ? "ចុច + ដើម្បីបន្ថែមរូប • ចុច ✕ ដើម្បីដកចេញ" : "Tap + to add • Tap ✕ to remove"}</p>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">✕</button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const {
    theme, themeId, setThemeId,
    bgStyle, setBgStyle,
    bgImage, setBgImage,
    layout, setLayout,
    compact, toggleCompact,
    darkMode, toggleDarkMode,
    showDistance, toggleDistance,
    showAge, toggleAge,
  } = useSettings();

  const isKh    = lang === "kh";
  const profile = user || currentUser;

  const [showEdit, setShowEdit]         = useState(false);
  const [showLogout, setShowLogout]     = useState(false);
  const [openSection, setOpenSection]   = useState(null);
  const bgImgRef = useRef(null);

  const toggle = (key) => setOpenSection(p => p === key ? null : key);

  const handleSaveProfile = (form) => {
    updateProfile?.(form);
    setShowEdit(false);
  };

  const handleBgImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage(url);
    e.target.value = "";
  };

  const LAYOUT_OPTS = [
    { key:"card", icon:"🃏", kh:"បណ្ណ",  en:"Card" },
    { key:"grid", icon:"⊞",  kh:"ក្រឡា", en:"Grid" },
    { key:"list", icon:"☰",  kh:"បញ្ជី", en:"List" },
  ];

  return (
    <>
      <div className="flex flex-col min-h-dvh pb-28" style={{ background: "var(--kh-cream)" }}>

        {/* ── Hero ── */}
        <div className="relative">
          <div className="h-44" style={{ background: theme.gradient }}>
            {/* Kbach pattern */}
            <div className="absolute bottom-14 left-0 right-0 opacity-20">
              <svg viewBox="0 0 430 12" className="w-full">
                {Array.from({length:22}).map((_,i)=>(
                  <g key={i} transform={`translate(${i*20},0)`}>
                    <path d="M0,12 Q5,2 10,6 Q15,10 20,0" fill="none" stroke="white" strokeWidth="1.5"/>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center -mt-14 pb-4 relative z-10">
            <div className="relative mb-3">
              <img src={profile.avatar || currentUser.avatar} alt="me"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl" />
              <button onClick={() => setShowEdit(true)}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ background: theme.gradient }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">{profile.name || currentUser.name}</h2>
            <p className="text-gray-400 text-sm">{profile.nameEn || currentUser.nameEn} · {profile.age || currentUser.age}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: theme.primary }}>
              📍 {profile.province || profile.location || currentUser.location}
            </p>
            {/* Edit button */}
            <button onClick={() => setShowEdit(true)}
              className="mt-3 px-6 py-2 rounded-2xl text-white text-sm font-bold shadow active:scale-95 transition-transform"
              style={{ background: theme.gradient }}>
              ✏️ {isKh ? "កែ​គណនី" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="flex gap-3 mx-5 mb-2">
          {[["12","💞",t("matchesCount")],["48","❤️",t("likesCount")],["130","👁️",t("viewsCount")]].map(([val,icon,label])=>(
            <div key={label} className="flex-1 kh-card p-3 text-center">
              <div className="text-xl">{icon}</div>
              <div className="text-lg font-bold" style={{color:theme.primary}}>{val}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Photo Gallery ── */}
        <PhotoGallery mainAvatar={profile.avatar || currentUser.avatar} theme={theme} isKh={isKh} />

        {/* ── Bio preview ── */}
        <div className="mx-5 kh-card p-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm text-[#1A1A2E]">{t("aboutMe")}</h3>
            <button onClick={() => setShowEdit(true)}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{background:`${theme.primary}14`,color:theme.primary}}>{t("edit")}</button>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{profile.bio || currentUser.bio}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {(profile.interests?.length ? profile.interests : currentUser.interests).map(i=>(
              <span key={i} className="kh-chip" style={{background:`${theme.primary}14`,color:theme.primary}}>{i}</span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            FIND PARTNER section
            ══════════════════════════════════════ */}
        <SectionHead icon="💑" title={isKh ? "ស្វែង​រក​ដៃ​គូ" : "Find Partner"} />
        <FindPartnerPanel theme={theme} />

        {/* ══════════════════════════════════════
            CUSTOMIZE section
            ══════════════════════════════════════ */}
        <SectionHead icon="🎨" title={isKh ? "រចនា​ប័ន្ន" : "Customize"} />

        <div className="mx-5 rounded-2xl overflow-hidden shadow-sm">

          {/* Theme color */}
          <SettingRow icon="🌈" label={isKh ? "ពណ៌​កម្មវិធី" : "App Theme"}
            sub={THEMES.find(x=>x.id===themeId)?.name}
            onPress={()=>toggle("theme")} last={false}
            right={
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{background:theme.primary}} />
                <svg className={`w-4 h-4 text-gray-300 transition-transform ${openSection==="theme"?"rotate-90":""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            }
          />
          {openSection === "theme" && (
            <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(th=>(
                  <button key={th.id} onClick={()=>setThemeId(th.id)}
                    className={`rounded-2xl p-3 border-2 transition-all flex flex-col items-center gap-2 ${themeId===th.id?"shadow-md":""}`}
                    style={themeId===th.id?{borderColor:th.primary,background:`${th.primary}08`}:{borderColor:"transparent",background:"white"}}>
                    <div className="w-10 h-10 rounded-full" style={{background:th.gradient}} />
                    <span className="text-xs font-medium text-gray-600 text-center leading-tight">{th.name}</span>
                    {themeId===th.id && <span className="text-xs font-bold" style={{color:th.primary}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background style */}
          <SettingRow icon="🖼️" label={isKh ? "ផ្ទៃ​ខាង​ក្រោយ" : "Background"}
            sub={bgImage ? (isKh?"រូប​ផ្ទាល់​ខ្លួន":"Custom Image") : BG_STYLES.find(x=>x.id===bgStyle)?.[isKh?"nameKh":"name"]}
            onPress={()=>toggle("bg")} last={false}
            right={
              <svg className={`w-4 h-4 text-gray-300 transition-transform ${openSection==="bg"?"rotate-90":""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            }
          />
          {openSection === "bg" && (
            <div className="bg-gray-50 px-4 py-4 border-t border-gray-100 space-y-3">
              {/* Custom image upload button */}
              <button onClick={() => bgImgRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                style={bgImage
                  ? { borderColor: theme.primary, background: `${theme.primary}08` }
                  : { borderColor: "#e5e7eb", background: "white" }}>
                {bgImage
                  ? <img src={bgImage} className="w-12 h-9 rounded-xl object-cover flex-shrink-0" alt="bg" />
                  : <div className="w-12 h-9 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                }
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-700">{isKh ? "ផ្ទុក​រូប​ផ្ទាល់​ខ្លួន" : "Upload Custom Image"}</p>
                  <p className="text-xs text-gray-400">{isKh ? "ប្រើ​រូប​ផ្ទាល់​ខ្លួន​ជា​ផ្ទៃ​ខាង​ក្រោយ" : "Use your own photo as background"}</p>
                </div>
                {bgImage && (
                  <button onClick={e => { e.stopPropagation(); setBgImage(null); }}
                    className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-sm flex-shrink-0">✕</button>
                )}
              </button>
              <input ref={bgImgRef} type="file" accept="image/*" className="hidden" onChange={handleBgImagePick} />

              {/* Preset styles */}
              <div className="grid grid-cols-3 gap-2">
                {BG_STYLES.map(bs => {
                  const previewStyle = {
                    solid:    { background: theme.bg },
                    gradient: { background: theme.gradient },
                    angkor:   { background: theme.bg },
                    dots:     { background: `radial-gradient(circle, ${theme.primary}22 1px, transparent 1px)`, backgroundSize:"10px 10px", backgroundColor: theme.bg },
                    kbach:    { background: `repeating-linear-gradient(45deg, ${theme.primary}11, ${theme.primary}11 2px, transparent 2px, transparent 10px)`, backgroundColor: theme.bg },
                  }[bs.id] || {};
                  const isActive = !bgImage && bgStyle === bs.id;
                  return (
                    <button key={bs.id} onClick={() => { setBgStyle(bs.id); setBgImage(null); }}
                      className={`rounded-2xl border-2 transition-all overflow-hidden`}
                      style={isActive ? {borderColor:theme.primary} : {border:"2px solid #f3f4f6"}}>
                      <div className="h-12 w-full" style={previewStyle}>
                        {bs.id==="angkor" && (
                          <svg viewBox="0 0 60 20" fill={theme.primary} opacity="0.3" className="w-full h-full">
                            <rect x="0" y="12" width="60" height="8"/>
                            <rect x="20" y="4" width="20" height="16"/>
                            <polygon points="20,4 40,4 30,0"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-gray-600 py-1.5 text-center">{bs[isKh?"nameKh":"name"]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Discover Layout */}
          <SettingRow icon="📐" label={isKh?"រចនា​ប័ន្ន​ស្វែងរក":"Discover Layout"}
            sub={LAYOUT_OPTS.find(x=>x.key===layout)?.[isKh?"kh":"en"]}
            onPress={()=>toggle("layout")} last={false}
            right={
              <svg className={`w-4 h-4 text-gray-300 transition-transform ${openSection==="layout"?"rotate-90":""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            }
          />
          {openSection === "layout" && (
            <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
              <div className="flex gap-2">
                {LAYOUT_OPTS.map(l=>(
                  <button key={l.key} onClick={()=>setLayout(l.key)}
                    className="flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all"
                    style={layout===l.key
                      ?{borderColor:theme.primary,background:`${theme.primary}08`,color:theme.primary}
                      :{borderColor:"#f3f4f6",background:"white",color:"#9ca3af"}}>
                    <span className="text-2xl mb-1">{l.icon}</span>
                    <span className="text-xs font-semibold">{isKh?l.kh:l.en}</span>
                    {layout===l.key && <span className="text-xs mt-0.5" style={{color:theme.primary}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Display options */}
          <SettingRow icon="👁️" label={isKh?"ជម្រើស​បង្ហាញ":"Display Options"}
            onPress={()=>toggle("display")} last={true}
            right={
              <svg className={`w-4 h-4 text-gray-300 transition-transform ${openSection==="display"?"rotate-90":""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            }
          />
          {openSection === "display" && (
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 space-y-4">
              {[
                { label:isKh?"បង្ហាញ​អាយុ":"Show Age",        sub:isKh?"លើ​កាត":"On profile cards", on:showAge,      toggle:toggleAge      },
                { label:isKh?"បង្ហាញ​ចម្ងាយ":"Show Distance",  sub:isKh?"ជិត/ឆ្ងាយ":"km from you",   on:showDistance, toggle:toggleDistance },
                { label:isKh?"ចន្លោះ​ស​ហ":"Compact Spacing", sub:isKh?"ចន្លោះ​តូច":"Tighter layout", on:compact,      toggle:toggleCompact  },
                { label:t("darkMode"),                           sub:isKh?"ផ្ទៃ​ងងឹត":"Dark background", on:darkMode,    toggle:toggleDarkMode },
              ].map(item=>(
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <Toggle on={item.on} onToggle={item.toggle} color={theme.primary} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language */}
        <SectionHead icon="🌐" title={isKh?"ភាសា":"Language"} />
        <div className="mx-5 flex gap-2">
          {[{val:"kh",flag:"🇰🇭",label:"ខ្មែរ"},{val:"en",flag:"🇺🇸",label:"English"}].map(l=>(
            <button key={l.val} onClick={()=>lang!==l.val&&toggleLang()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-medium text-sm transition-all active:scale-95"
              style={lang===l.val
                ?{borderColor:theme.primary,background:`${theme.primary}08`,color:theme.primary}
                :{borderColor:"#f3f4f6",background:"white",color:"#9ca3af"}}>
              <span>{l.flag}</span><span>{l.label}</span>
              {lang===l.val && <span>✓</span>}
            </button>
          ))}
        </div>

        {/* Account */}
        <SectionHead icon="⚙️" title={isKh?"គណនី":"Account"} />
        <div className="mx-5 rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon:"🔔", kh:"ការជូន​ដំណឹង", en:"Notifications", sub:isKh?"Push notifications":"Push notifications" },
            { icon:"🔒", kh:"ឯក​ជន​ភាព",    en:"Privacy",        sub:isKh?"គ្រប់​គ្រង​ទិន្នន័យ":"Manage your data" },
            { icon:"📍", kh:"ទីតាំង",        en:"Location",       sub:isKh?"GPS & ចម្ងាយ":"GPS & distance" },
            { icon:"❓", kh:"ជំនួយ",          en:"Help & Support", sub:isKh?"FAQ & ទំនាក់​ទំនង":"FAQ & Contact" },
          ].map((item,i,arr)=>(
            <SettingRow key={item.kh} icon={item.icon}
              label={isKh?item.kh:item.en} sub={item.sub}
              onPress={()=>{}} last={i===arr.length-1} />
          ))}
        </div>

        {/* Logout */}
        <div className="mx-5 mt-4 mb-2">
          {!showLogout ? (
            <button onClick={()=>setShowLogout(true)}
              className="w-full py-4 rounded-2xl border-2 border-red-100 bg-white text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
              🚪 {t("logout")}
            </button>
          ) : (
            <div className="kh-card p-4">
              <p className="text-sm font-semibold text-center text-[#1A1A2E] mb-3">
                {isKh?"ចាក​ចេញ​មែន​ទែន?":"Confirm logout?"}
              </p>
              <div className="flex gap-3">
                <button onClick={()=>setShowLogout(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium text-sm">
                  {t("cancel")}
                </button>
                <button onClick={()=>{logout();navigate("/");}}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform">
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 pb-4">Slanh App v1.0 🇰🇭</p>
      </div>

      {/* Edit Profile Modal (full screen) */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
          theme={theme}
        />
      )}
    </>
  );
}
