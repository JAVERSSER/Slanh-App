import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profiles } from "../data/profiles";
import { useLang } from "../context/LangContext";
import { useSettings } from "../context/SettingsContext";

const myMatches = profiles.slice(0, 4).map((p, i) => ({
  ...p,
  matchedAt:   ["ថ្ងៃ​នេះ","ម្សិល​មិញ","2 ថ្ងៃ​មុន","4 ថ្ងៃ​មុន"][i],
  matchedAtEn: ["Today","Yesterday","2 days ago","4 days ago"][i],
  isNew: i < 2,
}));

// Profiles that "liked you" but are blurred (premium)
const likedYou = profiles.slice(0, 6).map((p, i) => ({
  ...p,
  likedAt: ["2m ago","5m ago","20m ago","1h ago","3h ago","Yesterday"][i],
  interest: ["❤️","⭐","❤️","⭐","❤️","⭐"][i],
}));

/* ── Premium Upgrade Modal ──────────────── */
function UpgradeModal({ onClose, theme }) {
  const [selected, setSelected] = useState(1);
  const plans = [
    { period:"1 ថ្ងៃ / 1 Day",    price:"$1",  priceNum:1,  badge:"",             perDay:"$1/day"  },
    { period:"1 ខែ / 1 Month",    price:"$2",  priceNum:2,  badge:"💎 Most Popular", perDay:"$0.07/day" },
    { period:"3 ខែ / 3 Months",   price:"$3",  priceNum:3,  badge:"🔥 Best Value",  perDay:"$0.03/day" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl pb-10 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Gold header */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
          style={{ background: "linear-gradient(135deg,#F5A623,#e8931a,#c9781a)" }}>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">✕</button>
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-2xl font-black text-white mb-1">Slanh Gold</h2>
          <p className="text-white/80 text-sm">ចាប់ពី $1 តែ​ប៉ុណ្ណោះ!</p>
        </div>

        {/* Features */}
        <div className="px-6 pt-5 pb-3 space-y-2.5">
          {[
            { icon:"👁️", title:"មើល​អ្នក​ Liked អ្នក",       sub:"See who likes you — no blur" },
            { icon:"⭐", title:"Super Like គ្មាន​កំណត់",     sub:"Unlimited super likes daily" },
            { icon:"🔄", title:"Rewind ការ​ Swipe",           sub:"Take back accidental swipes"  },
            { icon:"🚀", title:"Boost Profile ១ ដង/ថ្ងៃ",    sub:"Get 10× more visibility"      },
            { icon:"📍", title:"ចម្ងាយ​គ្មាន​ដែន​កំណត់",     sub:"Match anyone in Cambodia"     },
          ].map(f => (
            <div key={f.icon} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-amber-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#F5A623,#e8931a)" }}>{f.icon}</div>
              <div>
                <p className="text-sm font-bold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="px-6 space-y-2 pb-2">
          {plans.map((plan, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all active:scale-95 relative"
              style={selected === i
                ? { background: "linear-gradient(135deg,#F5A623,#e8931a)", borderColor: "#F5A623", boxShadow: "0 4px 20px #F5A62344" }
                : { background: "white", borderColor: "#f3f4f6" }}>
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: selected === i ? "rgba(0,0,0,0.25)" : "#032EA1" }}>{plan.badge}</span>
              )}
              <div className="text-left">
                <p className={`text-sm font-bold ${selected === i ? "text-white" : "text-gray-800"}`}>{plan.period}</p>
                <p className={`text-xs ${selected === i ? "text-white/75" : "text-gray-400"}`}>{plan.perDay}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-black ${selected === i ? "text-white" : "text-gray-700"}`}>{plan.price}</p>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected === i ? "border-white bg-white" : "border-gray-300"}`}>
                  {selected === i && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5A623" }} />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Subscribe button */}
        <div className="px-6 pt-3">
          <button onClick={onClose}
            className="w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#F5A623,#e8931a)" }}>
            ចាប់ផ្ដើម — {plans[selected].price} 🚀
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">បោះបង់​បាន​គ្រប់​ពេល · Cancel anytime</p>
        </div>

        <button onClick={onClose} className="block mx-auto mt-3 text-sm text-gray-400 py-1">
          ក្រោយ / Maybe later
        </button>
      </div>
    </div>
  );
}

export default function Matches() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { theme } = useSettings();
  const isKh = lang === "kh";
  const [tab, setTab]         = useState("matches");
  const [removed, setRemoved] = useState(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);

  const visible = myMatches.filter(m => !removed.has(m.id));

  return (
    <>
      <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--kh-cream)" }}>
        {/* Header */}
        <div className="px-5 pt-12 pb-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold mb-0.5" style={{ color: theme.primary }}>{t("myMatches")} 💞</h1>
          <p className="text-gray-400 text-xs mb-3">{t("itsMutual")}</p>
          <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
            {[
              { key:"matches", kh:"គូស​ (~"+visible.length+")", en:"Matches ("+visible.length+")" },
              { key:"liked",   kh:"ចូល​ចិត្ត​ (~"+likedYou.length+")", en:"Liked You ("+likedYou.length+")" },
            ].map(tb => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === tb.key ? "bg-white shadow-sm" : "text-gray-400"}`}
                style={tab === tb.key ? { color: theme.primary } : {}}>
                {isKh ? tb.kh : tb.en}
              </button>
            ))}
          </div>
        </div>

        {tab === "matches" && (
          <>
            {visible.filter(m => m.isNew).length > 0 && (
              <div className="px-5 pt-5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">{isKh?"ថ្មី":"New"}</p>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                  {visible.filter(m => m.isNew).map(m => (
                    <button key={m.id} onClick={() => navigate("/messages")}
                      className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-95 transition-transform">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full p-0.5"
                          style={{ background: `linear-gradient(135deg,${theme.primary},${theme.secondary})` }}>
                          <img src={m.avatar} alt={m.nameEn}
                            className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                          style={{ background: theme.secondary }}>!</span>
                      </div>
                      <span className="text-xs text-gray-600 max-w-[60px] truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="angkor-divider mx-5 my-4 text-xs">🏛️</div>

            <div className="px-4 space-y-3">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="text-5xl mb-3">💔</div>
                  <p className="font-bold" style={{ color: theme.primary }}>{isKh?"មិន​ទាន់​មាន​គូស":"No matches yet"}</p>
                  <p className="text-sm text-gray-400 mt-1">{isKh?"ចូល​រក ❤️":"Go swipe to find someone ❤️"}</p>
                  <button onClick={() => navigate("/discover")}
                    className="mt-5 px-6 py-3 rounded-2xl text-white font-bold"
                    style={{ background: theme.gradient }}>{t("discover")}</button>
                </div>
              ) : visible.map(m => (
                <div key={m.id} className="kh-card flex items-center gap-3 p-4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: theme.gradient }} />
                  <button onClick={() => navigate("/messages")} className="relative flex-shrink-0">
                    <img src={m.avatar} alt={m.nameEn} className="w-14 h-14 rounded-full object-cover" />
                    {m.isNew && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white text-white text-xs flex items-center justify-center font-bold"
                        style={{ background: theme.secondary }}>!</span>
                    )}
                  </button>
                  <button onClick={() => navigate("/messages")} className="flex-1 text-left min-w-0">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#1A1A2E]">{m.name}</span>
                      <span className="text-xs text-gray-400">{isKh?m.matchedAt:m.matchedAtEn}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {m.location}{m.distance ? ` · ${m.distance}` : ""}</p>
                    <div className="flex gap-1 mt-1.5">
                      {m.interests.slice(0,2).map(i => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: `${theme.primary}14`, color: theme.primary }}>{i}</span>
                      ))}
                    </div>
                  </button>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => navigate("/messages")}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm"
                      style={{ background: theme.gradient }}>💬</button>
                    <button onClick={() => setRemoved(p => new Set(p).add(m.id))}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg hover:bg-red-50 hover:text-red-400 transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "liked" && (
          <div className="px-4 pt-4 pb-6">

            {/* Free v1 banner */}
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-4">
              <span className="text-xl mt-0.5">🎁</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-700">
                  {isKh ? "ឥត​គិត​ថ្លៃ នៅ​ Version 1!" : "Free in Version 1!"}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {isKh
                    ? "Version 2 នឹង​ត្រូវ​ការ Gold ($1–$3) · សូម​រីករាយ​ប្រើ​ប្រាស់​ឥតគិតថ្លៃ​!"
                    : "Version 2 will require Gold ($1–$3) · Enjoy it free now!"}
                </p>
              </div>
              <button onClick={() => setShowUpgrade(true)}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg,#F5A623,#e8931a)" }}>
                👑 v2
              </button>
            </div>

            {/* Count */}
            <p className="text-sm font-bold mb-3" style={{ color: theme.primary }}>
              ❤️ {likedYou.length} {isKh ? "នាក់​ Liked អ្នក" : "people liked you"}
            </p>

            {/* Real unblurred profile grid */}
            <div className="grid grid-cols-2 gap-3">
              {likedYou.map((p) => (
                <button key={p.id} onClick={() => navigate("/messages")}
                  className="relative rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
                  style={{ aspectRatio: "3/4" }}>
                  <img src={p.avatar} alt={p.nameEn} className="w-full h-full object-cover" />

                  {/* Bottom gradient */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)" }} />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                    <p className="text-white font-bold text-sm leading-tight">{p.name}</p>
                    <p className="text-white/70 text-xs">{p.age} · {p.location}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {p.interests.slice(0, 2).map(i => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full text-white"
                          style={{ background: "rgba(255,255,255,0.2)" }}>{i}</span>
                      ))}
                    </div>
                  </div>

                  {/* Liked icon badge */}
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow"
                    style={{ background: "linear-gradient(135deg,#E00025,#8B0020)" }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>

                  {/* Time */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ background: "rgba(0,0,0,0.40)" }}>{p.likedAt}</div>

                  {/* Cambodia flag strip */}
                  <div className="absolute top-0 right-0 flex flex-col" style={{ width: 4, height: 30 }}>
                    <div className="flex-1" style={{ background: "#032EA1" }} />
                    <div className="flex-1" style={{ background: "#E00025" }} />
                    <div className="flex-1" style={{ background: "#F5A623" }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Chat CTA */}
            <button onClick={() => navigate("/messages")}
              className="w-full mt-4 py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ background: theme.gradient }}>
              💬 {isKh ? "ចាប់​ផ្ដើម​ Chat!" : "Start Chatting!"}
            </button>

            {/* v2 teaser */}
            <button onClick={() => setShowUpgrade(true)}
              className="w-full mt-2 py-3 rounded-2xl border-2 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ borderColor: "#F5A623", color: "#e8931a", background: "#FFFBF0" }}>
              👑 {isKh ? "មើល​ Slanh Gold (Version 2)" : "See Slanh Gold — coming in v2"}
            </button>
          </div>
        )}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} theme={theme} />}
    </>
  );
}
