import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { profiles } from "../data/profiles";
import { useLang, LangToggleBtnDark } from "../context/LangContext";
import { useSettings } from "../context/SettingsContext";


const NOTIFS = [
  { id:1, icon:"💕", text:"ចន្ទបូបា ចូល​ចិត្ត​អ្នក!",    sub:"2 minutes ago",  unread:true  },
  { id:2, icon:"💬", text:"រតនា បាន​ផ្ញើ​សារ​ថ្មី",       sub:"15 minutes ago", unread:true  },
  { id:3, icon:"⭐", text:"មករា Super Liked អ្នក!",       sub:"1 hour ago",     unread:true  },
  { id:4, icon:"🎉", text:"អ្នក​បាន​ match ថ្មី 3 នាក់",   sub:"Yesterday",      unread:false },
  { id:5, icon:"📅", text:"Event: ដើរ​ Walk Street នៅ​ ស្អែក", sub:"2 days ago", unread:false },
];

/* ── Angkor silhouette ───────────────────── */
function AngkorBg({ color }) {
  return (
    <svg viewBox="0 0 430 90" fill={color} preserveAspectRatio="xMidYMax meet" className="w-full">
      <rect x="0" y="60" width="430" height="30"/>
      <rect x="25" y="42" width="32" height="48"/><polygon points="25,42 57,42 41,22"/>
      <rect x="68" y="35" width="24" height="55"/><polygon points="68,35 92,35 80,16"/>
      <rect x="165" y="18" width="100" height="72"/>
      <rect x="182" y="8"  width="66"  height="82"/>
      <rect x="198" y="0"  width="34"  height="90"/>
      <polygon points="165,18 265,18 215,0"/>
      <rect x="338" y="35" width="24" height="55"/><polygon points="338,35 362,35 350,16"/>
      <rect x="373" y="42" width="32" height="48"/><polygon points="373,42 405,42 389,22"/>
    </svg>
  );
}

/* ── Notification Panel ─────────────────── */
function NotifPanel({ onClose, theme }) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const markAll = () => setNotifs(p => p.map(n => ({ ...n, unread: false })));
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ maxHeight: "70vh" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h3 className="font-bold text-sm text-[#1A1A2E]">ការ​ជូន​ដំណឹង</h3>
          <button onClick={markAll} className="text-xs font-medium" style={{ color: theme.primary }}>Mark all read</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 52px)" }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, unread: false } : x))}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors cursor-pointer ${n.unread ? "bg-blue-50/50" : "bg-white"}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: n.unread ? `${theme.primary}14` : "#f3f4f6" }}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${n.unread ? "font-semibold text-[#1A1A2E]" : "text-gray-500"}`}>{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
              </div>
              {n.unread && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: theme.primary }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Stories Strip ──────────────────────── */
function StoriesStrip({ profiles, theme, onView }) {
  return (
    <div className="flex gap-3 px-4 pb-2 overflow-x-auto no-scrollbar flex-shrink-0">
      {/* My story */}
      <button className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: theme.gradient, padding: 2 }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl overflow-hidden">
              <img src="https://i.pravatar.cc/600?img=47" alt="me"
                className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow"
            style={{ background: theme.primary }}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
        </div>
        <span className="text-[10px] text-gray-500 max-w-[52px] truncate">ខ្ញុំ</span>
      </button>

      {/* Active profiles */}
      {profiles.filter((_, i) => i < 6).map((p, i) => (
        <button key={p.id} onClick={() => onView(p)}
          className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-95 transition-transform">
          <div className="relative">
            <div className="w-14 h-14 rounded-full p-0.5"
              style={{ background: i % 2 === 0
                ? `linear-gradient(135deg,${theme.primary},${theme.secondary})`
                : `linear-gradient(135deg,${theme.accent},${theme.secondary})` }}>
              <img src={p.avatar} alt={p.nameEn}
                className="w-full h-full rounded-full object-cover border-2 border-white" />
            </div>
            {/* Online dot */}
            {i < 3 && (
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-[10px] text-gray-500 max-w-[52px] truncate">{p.name}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Story Viewer ───────────────────────── */
function StoryViewer({ profile, onClose, theme }) {
  const [progress, setProgress] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = [
    profile.avatar,
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 10}`),
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 20}`),
  ];

  // Auto-advance story
  useState(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setPhotoIdx(i => {
            if (i >= photos.length - 1) { clearInterval(iv); onClose(); return i; }
            return i + 1;
          });
          return 0;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(iv);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-10">
        {photos.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-none"
              style={{ width: i < photoIdx ? "100%" : i === photoIdx ? `${progress}%` : "0%" }} />
          </div>
        ))}
      </div>

      {/* Close */}
      <button onClick={onClose}
        className="absolute top-14 right-4 z-20 w-11 h-11 rounded-full bg-black/40 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Photo */}
      <img src={photos[photoIdx]} alt={profile.nameEn} className="w-full h-full object-cover" />

      {/* Bottom overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%)" }} />

      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src={profile.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
            <div>
              <p className="text-white font-bold text-base">{profile.name}</p>
              <p className="text-white/65 text-xs">📍 {profile.location}</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            {profile.interests.slice(0, 3).map(i => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-full text-white"
                style={{ background: "rgba(255,255,255,0.2)" }}>{i}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Full Profile Detail Overlay ─────────── */
function ProfileDetail({ profile, onClose, theme, showAge, showDist }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = [
    profile.avatar,
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 10}`),
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 20}`),
  ];

  const interestEmoji = {
    "ប្រាសាទ":"🏛️","ថត​រូប":"📷","ចំអិន":"🍳","ចំអិនអាហារ":"🍳",
    "តន្ត្រី":"🎵","ភាពយន្ត":"🎬","ស្ថាបត្យកម្ម":"🏗️","អាន":"📚",
    "ធម្មជាតិ":"🌿","យូហ្គា":"🧘","ដំណើរ":"✈️","ធ្វើ​ដំណើរ":"✈️",
    "ហូប​ចុក":"🍜","ស្ទូច​ត្រី":"🎣","សមុទ្រ":"🌊","ហែល​ទឹក":"🏊",
    "IT":"💻","ហ្វឹក​ហ្វឺន":"💪","Gaming":"🎮",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <button onClick={onClose}
        className="absolute top-12 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div className="relative" style={{ height: "72vh" }}>
        <img src={photos[photoIdx]} alt={profile.nameEn} className="w-full h-full object-cover" />
        <button className="absolute left-0 top-0 w-[35%] h-full z-10 opacity-0"
          onClick={() => setPhotoIdx(i => Math.max(i - 1, 0))} />
        <button className="absolute right-0 top-0 w-[35%] h-full z-10 opacity-0"
          onClick={() => setPhotoIdx(i => Math.min(i + 1, photos.length - 1))} />
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20 px-8">
          {photos.map((_, i) => (
            <div key={i} className="h-1 rounded-full flex-1 max-w-[60px] transition-all"
              style={{ background: i === photoIdx ? "white" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pointer-events-none">
          <div className="flex items-end gap-3">
            <h2 className="text-white text-3xl font-black leading-tight">{profile.name}</h2>
            {showAge && <span className="text-white/85 text-2xl font-light mb-0.5">{profile.age}</span>}
          </div>
          <p className="text-white/70 text-base mt-1">{profile.nameEn}</p>
        </div>
        <div className="absolute top-0 right-0 z-20 pointer-events-none">
          <div className="flex flex-col" style={{ width: 5, height: 50 }}>
            <div className="flex-1" style={{ background: "#032EA1" }} />
            <div className="flex-1" style={{ background: "#E00025" }} />
            <div className="flex-1" style={{ background: "#F5A623" }} />
          </div>
        </div>
      </div>

      <div className="relative bg-white rounded-t-3xl -mt-6 px-6 pt-7 pb-32" style={{ minHeight: "40vh" }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-2xl px-4 py-2.5">
            <span className="text-base">📍</span>
            <span className="text-sm font-medium text-gray-700">{profile.location}</span>
          </div>
          {showDist && profile.distance && (
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-2xl px-4 py-2.5">
              <span className="text-base">🚗</span>
              <span className="text-sm font-medium text-gray-700">{profile.distance}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: theme.gradient }} />
            <h3 className="text-base font-bold text-gray-800">អំពីខ្លួន / About me</h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: theme.gradient }} />
            <h3 className="text-base font-bold text-gray-800">ចូល​ចិត្ត / Interests</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(interest => (
              <span key={interest} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium"
                style={{ background: `${theme.primary}14`, color: theme.primary }}>
                <span>{interestEmoji[interest] || "✨"}</span>
                <span>{interest}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: theme.gradient }} />
            <h3 className="text-base font-bold text-gray-800">ស្វែងរក / Looking for</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:"❤️", label:"ទំនាក់ទំនង", sub:"Relationship" },
              { icon:"😊", label:"មិត្តភ័ក្ត",  sub:"Friendship"   },
              { icon:"🌟", label:"ដៃគូស្មោះ",   sub:"Loyalty"      },
              { icon:"🇰🇭", label:"ខ្មែរ​ស្មោះ", sub:"Cambodian"   },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="opacity-[0.05] pointer-events-none" style={{ color: theme.primary }}>
          <AngkorBg color={theme.primary} />
        </div>
      </div>

      <div className="fixed bottom-0 pb-4 pt-3 px-6 flex gap-4 bg-white/97"
        style={{ maxWidth: 430, left: "50%", transform: "translateX(-50%)",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom,0px))",
          backdropFilter: "blur(12px)", width: "100%" }}>
        <button onClick={onClose}
          className="flex-1 py-4 rounded-2xl font-bold text-base border-2 flex items-center justify-center gap-2"
          style={{ borderColor: "#ef4444", color: "#ef4444" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          No Interest
        </button>
        <button onClick={onClose}
          className="flex-1 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 shadow-lg"
          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          Interest ❤️
        </button>
      </div>
    </div>
  );
}

/* ── Tinder-style Card ───────────────────── */
function TinderCard({ profile, onSwipe, isTop, isBehind, showAge, showDist, theme, onViewDetail }) {
  const drag = useRef({ startX:0, startY:0, isDragging:false });
  const [dx, setDx]             = useState(0);
  const [dy, setDy]             = useState(0);
  const [exiting, setExiting]   = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = [
    profile.avatar,
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 10}`),
    profile.avatar.replace(/img=\d+/, `img=${profile.id + 20}`),
  ];

  const pos = (e) => e.touches
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY };

  const onStart = (e) => {
    if (!isTop) return;
    const p = pos(e);
    drag.current = { startX: p.x, startY: p.y, isDragging: true };
  };
  const onMove = (e) => {
    if (!drag.current.isDragging) return;
    const p = pos(e);
    setDx(p.x - drag.current.startX);
    setDy(p.y - drag.current.startY);
    if (Math.abs(p.x - drag.current.startX) > 8) e.preventDefault?.();
  };
  const onEnd = () => {
    if (!drag.current.isDragging) return;
    drag.current.isDragging = false;
    if (dy < -80 && Math.abs(dx) < 60) { triggerExit("super"); return; }
    if (dx >  100) { triggerExit("like");  return; }
    if (dx < -100) { triggerExit("nope");  return; }
    setDx(0); setDy(0);
  };

  const triggerExit = (dir) => {
    setExiting(dir);
    setTimeout(() => onSwipe(dir), 320);
  };

  const exitStyle = exiting === "like"  ? { transform: "translateX(150%) rotate(30deg)", transition: "transform 0.32s ease-in", opacity: 0 }
                  : exiting === "nope"  ? { transform: "translateX(-150%) rotate(-30deg)", transition: "transform 0.32s ease-in", opacity: 0 }
                  : exiting === "super" ? { transform: "translateY(-150%)", transition: "transform 0.32s ease-in", opacity: 0 }
                  : {};

  const liveStyle = exiting ? exitStyle : {
    transform: `translateX(${dx}px) translateY(${dy < 0 ? dy * 0.3 : 0}px) rotate(${dx / 20}deg)`,
    transition: drag.current.isDragging ? "none" : "transform 0.35s cubic-bezier(.25,.8,.5,1)",
  };

  const likeOp  = Math.min(Math.max(dx  / 80, 0), 1);
  const nopeOp  = Math.min(Math.max(-dx / 80, 0), 1);
  const superOp = Math.min(Math.max(-dy / 80, 0), 1) * (Math.abs(dx) < 60 ? 1 : 0);

  if (isBehind) return (
    <div className="absolute inset-0 overflow-hidden select-none"
      style={{ transform: "scale(0.93) translateY(22px)", zIndex: 4, borderRadius: 32,
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}>
      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden select-none"
      style={{ ...liveStyle, zIndex: 10, borderRadius: 32,
        boxShadow: "0 24px 64px rgba(0,0,0,0.38), 0 0 0 1.5px rgba(255,255,255,0.12)",
        cursor: isTop ? "grab" : "default", touchAction: "none" }}
      onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>

      {/* Photo */}
      <div className="absolute inset-0">
        <img src={photos[photoIdx]} alt={profile.nameEn}
          className="w-full h-full object-cover pointer-events-none" draggable={false} />
      </div>

      {/* Tap zones */}
      <button className="absolute left-0 top-0 w-[30%] h-full z-20 opacity-0"
        onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.max(i-1,0)); }} />
      <button className="absolute right-0 top-0 w-[30%] h-full z-20 opacity-0"
        onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.min(i+1, photos.length-1)); }} />

      {/* Photo dots — glowing active pill */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-30 px-6">
        {photos.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              height: 4,
              flex: i === photoIdx ? 2 : 1,
              maxWidth: i === photoIdx ? 48 : 28,
              background: i === photoIdx ? "white" : "rgba(255,255,255,0.38)",
              boxShadow: i === photoIdx ? "0 0 10px rgba(255,255,255,0.9)" : "none",
            }} />
        ))}
      </div>

      {/* Stamps */}
      <div className="absolute top-10 left-5 z-30 pointer-events-none" style={{ opacity: likeOp, transform: "rotate(-16deg)" }}>
        <div className="px-4 py-2 rounded-2xl" style={{ border: "3.5px solid #22c55e", background: "rgba(34,197,94,0.08)" }}>
          <p className="text-[#22c55e] text-xl font-black tracking-[3px]">INTEREST</p>
        </div>
      </div>
      <div className="absolute top-10 right-5 z-30 pointer-events-none" style={{ opacity: nopeOp, transform: "rotate(16deg)" }}>
        <div className="px-4 py-2 rounded-2xl" style={{ border: "3.5px solid #ef4444", background: "rgba(239,68,68,0.08)" }}>
          <p className="text-[#ef4444] text-xl font-black tracking-[3px]">NO INTEREST</p>
        </div>
      </div>

      {/* Swipe colour wash */}
      <div className="absolute inset-0 pointer-events-none z-10 transition-colors"
        style={{ background: likeOp > 0 ? `rgba(34,197,94,${likeOp * 0.15})`
                            : nopeOp > 0 ? `rgba(239,68,68,${nopeOp * 0.15})` : "transparent" }} />

      {/* Deep gradient overlay */}
      <div className="absolute inset-0 pointer-events-none z-20"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.30) 45%, transparent 72%)" }} />

      {/* Cambodia flag strip */}
      <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden" style={{ borderRadius: "0 32px 0 0" }}>
        <div className="flex flex-col" style={{ width: 5, height: 48 }}>
          <div className="flex-1" style={{ background: "#032EA1" }} />
          <div className="flex-1" style={{ background: "#E00025" }} />
          <div className="flex-1" style={{ background: "#F5A623" }} />
        </div>
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-24">

        {/* Name + age + verified */}
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-white font-black leading-tight truncate" style={{ fontSize: 28 }}>{profile.name}</h2>
          {showAge && (
            <span className="text-white/85 font-light flex-shrink-0" style={{ fontSize: 22 }}>{profile.age}</span>
          )}
          {/* Verified badge */}
          <span className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 2px 8px rgba(59,130,246,0.55)" }}>✓</span>
        </div>

        <p className="text-white/65 text-[13px] mb-1">{profile.nameEn}</p>

        {showDist && (
          <p className="text-white/50 text-xs flex items-center gap-1 mb-2">
            <span>📍</span>{profile.location}{profile.distance ? ` · ${profile.distance}` : ""}
          </p>
        )}

        {/* Interest chips */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {profile.interests.slice(0, 3).map(interest => (
            <span key={interest} className="text-[11px] px-3 py-1 rounded-full font-medium text-white"
              style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)" }}>
              {interest}
            </span>
          ))}
        </div>

        {/* View profile pill button */}
        <button
          onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onViewDetail(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full active:scale-95 transition-transform shadow-lg"
          style={{
            background: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(14px)",
            border: "1.5px solid rgba(255,255,255,0.35)",
          }}>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
          </svg>
          <span className="text-white text-[13px] font-semibold tracking-wide">View Profile</span>
        </button>

      </div>
    </div>
  );
}

/* ── Action Buttons (compact overlay) ───── */
function ActionButtons({ onNope, onLike, disabled }) {
  return (
    <div className="flex items-center justify-center gap-10">

      {/* No Interest */}
      <button onClick={onNope} disabled={disabled}
        className="rounded-full flex flex-col items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-40"
        style={{
          width: 58, height: 58,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          border: "2px solid rgba(239,68,68,0.45)",
          boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
        }}>
        <svg className="w-6 h-6" style={{ color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span className="text-[9px] font-bold mt-0.5" style={{ color: "#ef4444", letterSpacing: "0.02em" }}>No</span>
      </button>

      {/* Interest — main CTA */}
      <button onClick={onLike} disabled={disabled}
        className="rounded-full flex flex-col items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-40"
        style={{
          width: 70, height: 70,
          background: "linear-gradient(135deg, #f472b6 0%, #ec4899 55%, #be185d 100%)",
          boxShadow: "0 8px 28px rgba(236,72,153,0.55), 0 2px 8px rgba(236,72,153,0.25)",
          border: "2.5px solid rgba(255,255,255,0.7)",
        }}>
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-[9px] font-bold mt-0.5 text-white" style={{ letterSpacing: "0.02em" }}>Yes</span>
      </button>

    </div>
  );
}

/* ── Grid card ──────────────────────────── */
function GridCard({ profile, onLike, theme, showAge }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="profile-grid-item fade-up">
      <img src={profile.avatar} alt={profile.nameEn} className="w-full h-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm">{profile.name}{showAge ? `, ${profile.age}` : ""}</p>
        <p className="text-white/65 text-xs">{profile.location}</p>
      </div>
      <button onClick={()=>{setLiked(true);onLike(profile.id);}}
        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow text-lg active:scale-90 transition-transform">
        {liked?"❤️":"🤍"}
      </button>
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1" style={{background:"#032EA1"}}/>
        <div className="flex-1" style={{background:"#E00025"}}/>
        <div className="flex-1" style={{background:"#F5A623"}}/>
      </div>
    </div>
  );
}

/* ── List card ──────────────────────────── */
function ListCard({ profile, onLike, theme, showAge, showDist }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="kh-card flex items-center gap-3 p-3 fade-up overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{background:theme.gradient}}/>
      <img src={profile.avatar} alt={profile.nameEn} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ml-1"/>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1A1A2E]">{profile.name}{showAge?<span className="font-normal text-gray-400 text-sm"> {profile.age}</span>:""}</p>
        <p className="text-xs text-gray-400 mt-0.5">📍 {profile.location}{showDist?` · ${profile.distance}`:""}</p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{profile.bio}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {profile.interests.slice(0,3).map(i=>(
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{background:`${theme.primary}14`,color:theme.primary}}>{i}</span>
          ))}
        </div>
      </div>
      <button onClick={()=>{setLiked(true);onLike(profile.id);}}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow active:scale-90 transition-transform flex-shrink-0"
        style={{background:liked?theme.gradient:`${theme.primary}10`}}>
        {liked?"❤️":<span style={{color:theme.primary}}>🤍</span>}
      </button>
    </div>
  );
}

/* ── Match Modal ─────────────────────────── */
function MatchModal({ profile, onClose, onChat, t, theme }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{background:"rgba(0,0,0,0.80)",backdropFilter:"blur(8px)"}}>
      <div className="match-animate w-full max-w-xs text-center">
        <div className="mb-6">
          <p className="text-white/70 text-sm mb-1">🇰🇭 Slanh App</p>
          <h2 className="text-4xl font-black text-transparent bg-clip-text"
            style={{backgroundImage:theme.gradient}}>{t("itsMutual")}</h2>
          <p className="text-white/60 text-sm mt-1">
            <span className="font-bold text-white">{profile.name}</span> ចូល​ចិត្ត​អ្នក​ ❤️
          </p>
        </div>
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="relative">
            <img src="https://i.pravatar.cc/600?img=47" alt="me"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"/>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white"
              style={{background:theme.gradient}}>✓</div>
          </div>
          <div className="text-4xl heart-beat">💕</div>
          <div className="relative">
            <img src={profile.avatar} alt={profile.nameEn}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"/>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white"
              style={{background:theme.gradient}}>✓</div>
          </div>
        </div>
        <button onClick={onChat} className="w-full py-4 rounded-2xl text-white font-bold text-lg mb-3 shadow-xl"
          style={{background:theme.gradient}}>{t("startChat")}</button>
        <button onClick={onClose} className="w-full py-3 text-white/60 font-medium text-sm">{t("keepSwiping")}</button>
      </div>
    </div>
  );
}


/* ── MAIN PAGE ───────────────────────────── */
export default function Discover() {
  const { t } = useLang();
  const { layout, theme, showDistance, showAge } = useSettings();
  const navigate = useNavigate();
  const [deck, setDeck]             = useState([...profiles].reverse());
  const [likedIds, setLiked]        = useState(new Set());
  const [match, setMatch]           = useState(null);
const [detailProfile, setDetailProfile] = useState(null);
  const [storyProfile, setStoryProfile]   = useState(null);
  const [showNotifs, setShowNotifs]       = useState(false);
  const unreadCount = NOTIFS.filter(n => n.unread).length;

  const topCard    = deck[deck.length - 1];
  const behindCard = deck[deck.length - 2];

  const handleSwipe = (dir) => {
    if (!topCard) return;
    if (dir === "like" || dir === "super") {
      setLiked(p => new Set(p).add(topCard.id));
      if (Math.random() > 0.45) { setMatch(topCard); return; }
    }
    setDeck(p => p.slice(0, -1));
  };

  const dismissMatch = () => { setMatch(null); setDeck(p => p.slice(0, -1)); };

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 88px)", background: "var(--kh-cream)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-10 pb-1 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base">❤️</span>
          <h1 className="text-base font-black" style={{ color: theme.primary }}>{t("appName")}</h1>
          <span className="text-gray-300 text-xs">·</span>
          <p className="text-gray-400 text-xs">🇰🇭 {t("nearYou")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggleBtnDark />
          <div className="relative">
            <button onClick={() => setShowNotifs(v => !v)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm relative"
              style={{ background: showNotifs ? theme.primary : "white", border: "1px solid #f3f4f6" }}>
              <svg className="w-4 h-4" style={{ color: showNotifs ? "white" : theme.primary }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unreadCount > 0 && !showNotifs && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: theme.secondary }}>{unreadCount}</span>
              )}
            </button>
            {showNotifs && <NotifPanel onClose={() => setShowNotifs(false)} theme={theme} />}
          </div>
        </div>
      </div>

      {/* ── Stories strip (card layout only) ── */}
      {layout === "card" && (
        <StoriesStrip profiles={profiles} theme={theme} onView={setStoryProfile} />
      )}

      {/* ── CARD view ── */}
      {layout === "card" && (
        <div className="flex-1 relative px-3 pt-1 pb-2 min-h-0">
          {deck.length === 0 ? (
            <div className="absolute inset-3 flex flex-col items-center justify-center text-center rounded-3xl bg-white shadow-inner">
              <div className="w-48 opacity-15 mb-4" style={{ color: theme.primary }}>
                <AngkorBg color={theme.primary} />
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: theme.primary }}>{t("noMoreProfiles")}</h3>
              <p className="text-gray-400 text-sm mb-6 px-4">{t("noMoreSub")}</p>
              <button onClick={() => setDeck([...profiles].reverse())}
                className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg"
                style={{ background: theme.gradient }}>
                {t("restart")} 🔄
              </button>
            </div>
          ) : (
            <>
              {behindCard && (
                <TinderCard key={behindCard.id} profile={behindCard} isTop={false} isBehind={true}
                  onSwipe={()=>{}} onViewDetail={()=>{}} theme={theme} showAge={showAge} showDist={showDistance}/>
              )}
              <TinderCard key={topCard.id} profile={topCard} isTop={true} isBehind={false}
                onSwipe={handleSwipe} onViewDetail={() => setDetailProfile(topCard)}
                theme={theme} showAge={showAge} showDist={showDistance}/>

              {/* Action buttons — float over bottom of card */}
              <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <ActionButtons
                    onNope={() => handleSwipe("nope")}
                    onLike={() => handleSwipe("like")}
                    disabled={false}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── GRID view ── */}
      {layout === "grid" && (
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
          <div className="profile-grid">
            {profiles.map(p => (
              <GridCard key={p.id} profile={p} onLike={id=>setLiked(s=>new Set(s).add(id))} theme={theme} showAge={showAge}/>
            ))}
          </div>
        </div>
      )}

      {/* ── LIST view ── */}
      {layout === "list" && (
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-3">
          {profiles.map(p => (
            <ListCard key={p.id} profile={p} onLike={id=>setLiked(s=>new Set(s).add(id))} theme={theme} showAge={showAge} showDist={showDistance}/>
          ))}
        </div>
      )}

      {detailProfile && (
        <ProfileDetail profile={detailProfile} onClose={() => setDetailProfile(null)}
          theme={theme} showAge={showAge} showDist={showDistance}/>
      )}
      {storyProfile && (
        <StoryViewer profile={storyProfile} onClose={() => setStoryProfile(null)} theme={theme}/>
      )}
      {match && <MatchModal profile={match} t={t} theme={theme} onClose={dismissMatch}
        onChat={()=>{dismissMatch();navigate("/messages");}}/>}
    </div>
  );
}
