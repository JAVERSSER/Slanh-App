import { useState } from "react";
import { useLang } from "../context/LangContext";
import { events, categories } from "../data/events";

function EventCard({ ev, lang, joined, onToggle }) {
  const isKh = lang === "kh";
  const pct = Math.round((ev.attendees / ev.maxAttendees) * 100);
  const dateObj = new Date(ev.date);
  const dayName = dateObj.toLocaleDateString(isKh ? "km-KH" : "en-US", { weekday: "short" });
  const day     = dateObj.getDate();
  const month   = dateObj.toLocaleDateString(isKh ? "km-KH" : "en-US", { month: "short" });

  return (
    <div className="event-card fade-up">
      {/* Image */}
      <div className="relative h-40">
        <img src={ev.image} alt={ev.titleEn} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "rgba(3,46,161,0.85)", backdropFilter: "blur(4px)" }}>
          {categories.find(c => c.key === ev.category)?.[isKh ? "kh" : "en"]}
        </span>

        {/* Price */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: ev.price === 0 ? "rgba(34,197,94,0.9)" : "rgba(245,166,35,0.9)", color: "white" }}>
          {ev.price === 0 ? (isKh ? "ឥត​គិត​ថ្លៃ" : "Free") : `$${ev.price}`}
        </span>

        {/* Date box */}
        <div className="absolute bottom-3 left-3 bg-white rounded-xl px-3 py-1.5 text-center min-w-[50px]">
          <p className="text-[10px] text-gray-400 uppercase">{dayName}</p>
          <p className="text-lg font-bold text-[#032EA1] leading-none">{day}</p>
          <p className="text-[10px] text-gray-500">{month}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[#1A1A2E] text-base leading-snug mb-1">
          {isKh ? ev.title : ev.titleEn}
        </h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
          {isKh ? ev.desc : ev.descEn}
        </p>

        {/* Location + Time */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            📍 {isKh ? ev.location : ev.locationEn}
          </span>
          <span className="text-xs text-gray-500">🕐 {ev.time}</span>
        </div>

        {/* Attendees bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>👥 {ev.attendees + (joined ? 1 : 0)} {isKh ? "នាក់" : "going"}</span>
            <span>{ev.maxAttendees} {isKh ? "កន្លែង" : "spots"}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct + (joined ? 1 : 0), 100)}%`,
                background: "linear-gradient(90deg,#032EA1,#E00025)" }} />
          </div>
        </div>

        {/* Tags + Join */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(isKh ? ev.tags : ev.tagsEn).map(tag => (
              <span key={tag} className="kh-chip kh-chip-idle text-[11px]">{tag}</span>
            ))}
          </div>
          <button onClick={() => onToggle(ev.id)}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center ${
              joined
                ? "bg-green-100 text-green-600"
                : "text-white"
            }`}
            style={joined ? {} : { background: "linear-gradient(135deg,#032EA1,#8B0020)" }}>
            {joined ? (isKh ? "បាន​ចូល​រួម ✓" : "Joined ✓") : (isKh ? "ចូល​រួម" : "Join")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const { t, lang } = useLang();
  const isKh = lang === "kh";
  const [activeCat, setActiveCat] = useState("all");
  const [joined, setJoined] = useState(new Set());

  const filtered = activeCat === "all" ? events : events.filter(e => e.category === activeCat);

  const toggle = (id) => setJoined(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--kh-cream)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#032EA1,#8B0020)" }} className="px-6 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <h1 className="text-2xl font-bold text-white mb-0.5">{t("eventsTitle")} 🎉</h1>
        <p className="text-white/60 text-sm">{t("eventsDesc")}</p>

        {/* Category tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              className={`flex-shrink-0 px-4 py-2.5 min-h-[40px] rounded-full text-sm font-medium transition-all ${
                activeCat === cat.key
                  ? "bg-white text-[#032EA1] shadow"
                  : "bg-white/20 text-white"
              }`}>
              {cat[isKh ? "kh" : "en"]}
            </button>
          ))}
        </div>
      </div>

      {/* My joined events banner */}
      {joined.size > 0 && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🎟️</span>
          <div>
            <p className="text-sm font-semibold text-green-700">
              {isKh ? `អ្នក​ចូល​រួម ${joined.size} ព្រឹត្តិការណ៍` : `You joined ${joined.size} event${joined.size > 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-green-500">
              {isKh ? "ពួក​គេ​រង់​ចាំ​អ្នក!" : "They're waiting for you!"}
            </p>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="px-4 mt-4 space-y-4">
        {filtered.map(ev => (
          <EventCard key={ev.id} ev={ev} lang={lang}
            joined={joined.has(ev.id)} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}
