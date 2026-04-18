import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { profiles } from "../data/profiles";
import { useLang } from "../context/LangContext";

const REACTIONS = ["❤️","😂","😮","😢","😡","👍"];

const INIT_CONVOS = profiles.slice(0, 4).map((p, i) => ({
  ...p,
  lastMsg: ["ជំរាបសួរ! 😊","ចង់ទៅហូបអាហារជាមួយគ្នាទេ?","ស្រុកខ្មែរស្អាតណាស់ 🇰🇭","Online ទេ?"][i],
  time: ["ទើបតែ","5m","1h","3h"][i],
  unread: [2,0,1,0][i],
  online: [true,false,true,false][i],
}));

function todayISO()     { return new Date().toISOString().slice(0,10); }
function yesterdayISO() { return new Date(Date.now()-86400000).toISOString().slice(0,10); }

function formatDateLabel(iso) {
  const today     = todayISO();
  const yesterday = yesterdayISO();
  if (iso === today)     return "Today";
  if (iso === yesterday) return "Yesterday";
  const d = new Date(iso);
  const diffDays = Math.round((new Date(today) - d) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mkMsg(from, extras = {}) {
  return {
    id: Date.now() + Math.random(),
    from,
    text: "",
    date: todayISO(),
    time: new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false }),
    status: "sent",
    reaction: null,
    type: "text",
    ...extras,
  };
}

/* ── Icon helpers ─────────────────────────── */
const IcoPhone = () => (
  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const IcoVideo = () => (
  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.649v6.702a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const IcoMic = ({ color = "currentColor" }) => (
  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);
const IcoSend = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

/* ── Voice bubble ─────────────────────────── */
function VoiceBubble({ src, duration, isMe }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else         { a.play();  setPlaying(true);  }
  };
  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (a && a.duration) setProgress(a.currentTime / a.duration);
  };
  const onEnded = () => { setPlaying(false); setProgress(0); };
  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 20, minWidth: 180,
      background: isMe ? "linear-gradient(135deg,#032EA1,#1a4fcc)" : "#E4E6EB",
    }}>
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
      <button onClick={toggle} style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: isMe ? "rgba(255,255,255,0.2)" : "#032EA1",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}>
        {playing
          ? <svg width={14} height={14} fill={isMe?"white":"white"} viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          : <svg width={14} height={14} fill={isMe?"white":"white"} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        }
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 24, marginBottom: 4 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const h = [2,3,5,4,7,5,6,3,8,6,4,7,5,6,3,5,4,3,5,4,6,3,4,3][i];
            const filled = i / 24 <= progress;
            return (
              <div key={i} style={{
                width: 3, borderRadius: 2, flexShrink: 0,
                height: h * 2.5,
                background: filled
                  ? (isMe ? "rgba(255,255,255,0.9)" : "#032EA1")
                  : (isMe ? "rgba(255,255,255,0.3)" : "#BCC0C8"),
              }} />
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,0.7)" : "#65676B" }}>
          {fmt(duration || 0)}
        </span>
      </div>
    </div>
  );
}

/* ── Image bubble ─────────────────────────── */
function ImageBubble({ src, onView }) {
  return (
    <button onClick={() => onView(src)} style={{
      borderRadius: 16, overflow: "hidden", display: "block",
      maxWidth: 220, boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
      WebkitTapHighlightColor: "transparent",
    }}>
      <img src={src} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
    </button>
  );
}

/* ── Full-screen image viewer ─────────────── */
function ImageViewer({ src, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.95)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <button style={{
        position: "absolute", top: "max(48px, calc(env(safe-area-inset-top,0px)+12px))", right: 16,
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        color: "white", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>
      <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
    </div>
  );
}

/* ── Attachment Tray ─────────────────────── */
function AttachTray({ onImage, onCamera, onFile, onLocation, onClose }) {
  const items = [
    { icon: "🖼️", label: "Gallery",  action: onImage    },
    { icon: "📷", label: "Camera",   action: onCamera   },
    { icon: "📄", label: "File",     action: onFile     },
    { icon: "📍", label: "Location", action: onLocation },
    { icon: "🎞️", label: "GIF",      action: onClose    },
    { icon: "🎵", label: "Audio",    action: onClose    },
  ];
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={onClose} />
      <div style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 40,
        background: "white", borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        padding: 16, width: 240,
        animation: "slideUp2 .18s ease-out",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {items.map(item => (
            <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, padding: "12px 8px", borderRadius: 12,
                background: "#F0F2F5", WebkitTapHighlightColor: "transparent",
              }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: "#65676B", fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Chat View ──────────────────────────── */
function ChatView({ contact, onBack, t }) {
  useLayoutEffect(() => {
    document.body.classList.add("chat-open");
    return () => document.body.classList.remove("chat-open");
  }, []);

  const [msgs, setMsgs] = useState([
    mkMsg("them", { text: "ជំរាបសួរ! 😊",               time: "10:00", date: yesterdayISO(), status: "seen" }),
    mkMsg("me",   { text: "ជំរាបសួរ! ខ្ញុំ​សុខ​សប្បាយ 🙏", time: "10:01", date: yesterdayISO(), status: "seen" }),
    mkMsg("them", { text: "អ្នក​នៅ​ភ្នំ​ពេញ​ ឬ?",            time: "09:15", status: "read" }),
    mkMsg("me",   { text: "បាទ / ចាស ។ អ្នក​ ៗ?",          time: "09:17", status: "seen", reaction: "❤️" }),
  ]);
  const [input, setInput]                   = useState("");
  const [typing, setTyping]                 = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [replyTo, setReplyTo]               = useState(null);
  const [showAttach, setShowAttach]         = useState(false);
  const [viewImg, setViewImg]               = useState(null);
  const [isRecording, setIsRecording]       = useState(false);
  const [recordMs, setRecordMs]             = useState(0);
  const [recCancelled, setRecCancelled]     = useState(false);

  const inputRef       = useRef(null);
  const bottomRef      = useRef(null);
  const lpTimer        = useRef(null);
  const typingTimer    = useRef(null);
  const imgInputRef    = useRef(null);
  const camInputRef    = useRef(null);
  const fileInputRef   = useRef(null);
  const mediaRef       = useRef(null);
  const chunksRef      = useRef([]);
  const timerRef       = useRef(null);
  const recordStartRef = useRef(0);
  const cancelRef      = useRef(false);
  const shouldSendRef  = useRef(false);
  const micAnchorX     = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  /* ── send text ── */
  const send = useCallback(() => {
    if (!input.trim()) return;
    setMsgs(p => [...p, mkMsg("me", { text: input.trim(), ...(replyTo ? { replyTo } : {}) })]);
    setInput(""); setReplyTo(null);
    fakeReply();
  }, [input, replyTo]);

  const fakeReply = () => {
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, mkMsg("them", {
        text: ["😊 អរគុណ!","មែន​ទែន?","ល្អ​ណាស់ 🙏","🇰🇭❤️"][Math.floor(Math.random()*4)],
      })]);
    }, 1500);
  };

  /* ── long-press react ── */
  const startLP = id => { lpTimer.current = setTimeout(() => { setReactionTarget(id); navigator.vibrate?.(30); }, 420); };
  const stopLP  = ()  => clearTimeout(lpTimer.current);

  /* ── reactions ── */
  const setReaction = (id, emoji) => {
    setMsgs(p => p.map(m => m.id === id ? { ...m, reaction: emoji } : m));
    setReactionTarget(null);
  };

  /* ── image ── */
  const handleImageFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type: "image", src: URL.createObjectURL(f) })]);
    e.target.value = ""; fakeReply();
  };

  /* ── file ── */
  const handleFileAttach = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type: "file", fileName: f.name, fileSize: (f.size/1024).toFixed(1)+" KB" })]);
    e.target.value = ""; fakeReply();
  };

  /* ── voice recording ── */
  const micPointerDown = e => {
    e.preventDefault();
    if (isRecording) return;
    cancelRef.current    = false;
    shouldSendRef.current = false;
    micAnchorX.current   = e.touches ? e.touches[0].clientX : e.clientX;
    recordStartRef.current = Date.now();
    setIsRecording(true);
    setRecCancelled(false);
    setRecordMs(0);
    timerRef.current = setInterval(() => setRecordMs(Date.now() - recordStartRef.current), 100);

    const onMove = ev => {
      const touch = ev.changedTouches?.[0] ?? ev.touches?.[0];
      const x = touch ? touch.clientX : ev.clientX;
      const slid = x - micAnchorX.current < -60;
      cancelRef.current = slid;
      setRecCancelled(slid);
    };
    const onUp = () => {
      window.removeEventListener("mousemove",     onMove);
      window.removeEventListener("touchmove",     onMove);
      window.removeEventListener("mouseup",       onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchend",      onUp);
      clearInterval(timerRef.current);
      const elapsed  = Date.now() - recordStartRef.current;
      if (cancelRef.current || elapsed < 300) {
        cancelRef.current = true;
        if (mediaRef.current?.state !== "inactive") { try { mediaRef.current.stop(); } catch {} }
        mediaRef.current = null; chunksRef.current = [];
      } else {
        if (mediaRef.current?.state !== "inactive") mediaRef.current.stop();
        else shouldSendRef.current = true;
      }
      setIsRecording(false); setRecCancelled(false); setRecordMs(0);
    };
    window.addEventListener("mousemove",     onMove);
    window.addEventListener("touchmove",     onMove, { passive: true });
    window.addEventListener("mouseup",       onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchend",      onUp);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = ev => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (cancelRef.current) { chunksRef.current = []; return; }
          const dur = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
          const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
          setMsgs(p => [...p, mkMsg("me", { type: "voice", src: url, duration: dur })]);
          fakeReply();
        };
        mr.start(); mediaRef.current = mr;
        if (shouldSendRef.current) { shouldSendRef.current = false; mr.stop(); }
      } catch {
        clearInterval(timerRef.current);
        setIsRecording(false); setRecordMs(0);
        alert("Microphone permission denied");
      }
    })();
  };

  const fmtTime = ms => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  };

  /* ── bubble style helpers ── */
  const isLastInGroup = (idx) => idx === msgs.length - 1 || msgs[idx + 1].from !== msgs[idx].from;
  const isFirstInGroup = (idx) => idx === 0 || msgs[idx - 1].from !== msgs[idx].from;

  /* ── render one message ── */
  const renderMsg = (msg, idx) => {
    const isMe    = msg.from === "me";
    const isLast  = isLastInGroup(idx);
    const isFirst = isFirstInGroup(idx);
    const showDate = idx === 0 || msgs[idx-1].date !== msg.date;

    // Messenger-style border radius
    const r = 18;
    const small = 4;
    const borderRadius = isMe
      ? `${r}px ${isFirst ? r : small}px ${isLast ? small : r}px ${r}px`
      : `${isFirst ? r : small}px ${r}px ${r}px ${isLast ? small : r}px`;

    return (
      <div key={msg.id}>
        {showDate && (
          <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
            <span style={{
              background: "rgba(0,0,0,0.08)", color: "#65676B",
              fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
            }}>{formatDateLabel(msg.date)}</span>
          </div>
        )}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 6,
          justifyContent: isMe ? "flex-end" : "flex-start",
          marginBottom: isLast ? 6 : 2,
        }}>
          {/* Avatar — show only on last message in a "them" group */}
          {!isMe && (
            <img src={contact.avatar} alt="" style={{
              width: 28, height: 28, borderRadius: "50%", objectFit: "cover",
              flexShrink: 0, visibility: isLast ? "visible" : "hidden",
            }} />
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "72vw" }}>
            {/* Reply preview */}
            {msg.replyTo && (
              <div style={{
                fontSize: 12, padding: "6px 10px", borderRadius: 10, marginBottom: 4,
                borderLeft: "3px solid #032EA1",
                background: isMe ? "rgba(3,46,161,0.08)" : "rgba(0,0,0,0.05)",
                color: "#65676B",
              }}>
                ↩ {(msg.replyTo.text || "📷 Photo").slice(0,40)}
              </div>
            )}

            {/* Bubble */}
            <div style={{ position: "relative" }}
              onDoubleClick={() => setReactionTarget(msg.id)}
              onContextMenu={e => { e.preventDefault(); setReactionTarget(msg.id); }}
              onTouchStart={() => startLP(msg.id)}
              onTouchEnd={stopLP} onTouchMove={stopLP}>

              {msg.type === "image" && <ImageBubble src={msg.src} onView={setViewImg} />}
              {msg.type === "voice" && <VoiceBubble src={msg.src} duration={msg.duration} isMe={isMe} />}
              {msg.type === "file" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius,
                  background: isMe ? "linear-gradient(135deg,#032EA1,#1a4fcc)" : "#E4E6EB",
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isMe ? "white" : "#050505", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{msg.fileName}</p>
                    <p style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,0.65)" : "#65676B" }}>{msg.fileSize}</p>
                  </div>
                  <span style={{ fontSize: 16, color: isMe ? "rgba(255,255,255,0.8)" : "#032EA1" }}>⬇</span>
                </div>
              )}
              {(!msg.type || msg.type === "text") && (
                <div style={{
                  padding: "8px 14px",
                  borderRadius,
                  background: isMe ? "linear-gradient(135deg,#032EA1,#1a4fcc)" : "#E4E6EB",
                  color: isMe ? "white" : "#050505",
                  fontSize: 15, lineHeight: "20px",
                  wordBreak: "break-word",
                }}>
                  {msg.text}
                </div>
              )}

              {/* Reaction badge */}
              {msg.reaction && (
                <span style={{
                  position: "absolute", bottom: -8, right: 4,
                  fontSize: 14, background: "white",
                  borderRadius: 20, padding: "1px 4px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}>{msg.reaction}</span>
              )}

              {/* Reaction picker */}
              {reactionTarget === msg.id && (
                <div style={{
                  position: "absolute", zIndex: 20,
                  display: "flex", alignItems: "center", gap: 4,
                  background: "white", borderRadius: 30,
                  padding: "8px 12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  bottom: "calc(100% + 8px)",
                  [isMe ? "right" : "left"]: 0,
                  whiteSpace: "nowrap",
                }}>
                  {REACTIONS.map(em => (
                    <button key={em} onClick={ev => { ev.stopPropagation(); setReaction(msg.id, em); }}
                      style={{ fontSize: 22, WebkitTapHighlightColor: "transparent" }}
                      className="hover:scale-125 transition-transform">{em}</button>
                  ))}
                  <div style={{ width: 1, height: 20, background: "#E4E6EB", margin: "0 4px" }} />
                  <button onClick={ev => { ev.stopPropagation(); setReplyTo(msg); setReactionTarget(null); }}
                    style={{ fontSize: 13, color: "#65676B", fontWeight: 600, WebkitTapHighlightColor: "transparent" }}>↩</button>
                </div>
              )}
            </div>

            {/* Time + status (only on last in group) */}
            {isLast && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: "#65676B" }}>{msg.time}</span>
                {isMe && <span style={{ fontSize: 10, color: "#032EA1" }}>{msg.status === "seen" ? "✓✓" : "✓"}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh",
      background: "#F0F2F5",
      WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
      /* Responsive: centered on desktop */
      maxWidth: 680, margin: "0 auto", width: "100%",
    }}
      onClick={() => { setReactionTarget(null); setShowAttach(false); }}>

      {/* ── Header ── */}
      <div style={{
        background: "white",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingBottom: 10, paddingLeft: 8, paddingRight: 12,
        display: "flex", alignItems: "center", gap: 4,
        boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}>
        {/* Back */}
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#032EA1", flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}>
          <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar + online */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={contact.avatar} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
          {contact.online && (
            <span style={{
              position: "absolute", bottom: 1, right: 1,
              width: 12, height: 12, borderRadius: "50%",
              background: "#31A24C", border: "2.5px solid white",
            }} />
          )}
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#050505", lineHeight: 1.3 }}>{contact.name}</p>
          <p style={{ fontSize: 12, color: contact.online ? "#31A24C" : "#65676B", lineHeight: 1.3 }}>
            {contact.online ? "Active now" : contact.location}
          </p>
        </div>

        {/* Call + Video */}
        {[IcoPhone, IcoVideo].map((Ico, i) => (
          <button key={i} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "#E4E6EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#032EA1", flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}><Ico /></button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", WebkitOverflowScrolling: "touch" }}>
        {msgs.map(renderMsg)}
        {typing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 6 }}>
            <img src={contact.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div style={{
              background: "#E4E6EB", borderRadius: "4px 18px 18px 18px",
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 4,
            }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply bar ── */}
      {replyTo && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 14px", background: "#E8EEFF",
          borderTop: "1px solid #D0D7FF", flexShrink: 0,
        }}>
          <div style={{ flex: 1, borderLeft: "3px solid #032EA1", paddingLeft: 8 }}>
            <p style={{ fontSize: 11, color: "#032EA1", fontWeight: 700 }}>↩ Reply</p>
            <p style={{ fontSize: 12, color: "#65676B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {replyTo.text || "📷 Photo"}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ color: "#65676B", fontSize: 18, WebkitTapHighlightColor: "transparent" }}>✕</button>
        </div>
      )}

      {/* ── Recording indicator ── */}
      {isRecording && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
          height: "calc(env(safe-area-inset-bottom, 0px) + 62px)",
          background: "white", borderTop: "1px solid #E4E6EB", flexShrink: 0,
          animation: "slideUp2 .15s ease-out",
        }}>
          {/* Dot + timer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: recCancelled ? "#BCC0C8" : "#E41E3F",
              animation: recCancelled ? "none" : "pulse 1s infinite",
            }} />
            <span style={{
              fontFamily: "monospace", fontSize: 15, fontWeight: 700,
              color: recCancelled ? "#BCC0C8" : "#E41E3F",
              minWidth: 44,
            }}>{fmtTime(recordMs)}</span>
          </div>
          {/* Hint */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: recCancelled ? "#E41E3F" : "#BCC0C8", fontWeight: 500 }}>
              {recCancelled ? "Release to cancel" : "◀  Slide to cancel"}
            </span>
          </div>
          {/* Pulsing mic */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: recCancelled ? "#E4E6EB" : "linear-gradient(135deg,#E41E3F,#8B0020)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: recCancelled ? "none" : "pulse 1.2s infinite",
            transition: "background .2s",
          }}>
            <IcoMic color={recCancelled ? "#BCC0C8" : "white"} />
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      {!isRecording && (
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 6,
          padding: "8px 8px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          background: "white", borderTop: "1px solid #E4E6EB", flexShrink: 0,
        }}
          onClick={e => e.stopPropagation()}>

          {/* Attachment */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button onClick={() => setShowAttach(v => !v)} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: showAttach ? "linear-gradient(135deg,#032EA1,#8B0020)" : "#E4E6EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: showAttach ? "white" : "#65676B", flexShrink: 0,
              transition: "background .2s, transform .2s",
              transform: showAttach ? "rotate(45deg)" : "none",
              WebkitTapHighlightColor: "transparent",
            }}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {showAttach && (
              <AttachTray
                onImage={() => imgInputRef.current?.click()}
                onCamera={() => camInputRef.current?.click()}
                onFile={() => fileInputRef.current?.click()}
                onLocation={() => { setMsgs(p => [...p, mkMsg("me", { text: "📍 ភ្នំពេញ, Cambodia (12.3657° N, 104.9910° E)" })]); }}
                onClose={() => setShowAttach(false)}
              />
            )}
          </div>

          {/* Text input pill */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "#F0F2F5", borderRadius: 22,
            padding: "0 14px", minHeight: 38, gap: 8,
          }}>
            <input
              ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Aa"
              style={{
                flex: 1, background: "transparent", outline: "none", border: "none",
                fontSize: 15, color: "#050505", minWidth: 0,
                WebkitUserSelect: "text", userSelect: "text",
              }}
            />
            {/* Emoji button */}
            <button style={{ fontSize: 18, flexShrink: 0, WebkitTapHighlightColor: "transparent", lineHeight: 1 }}>🙂</button>
          </div>

          {/* Send or Mic */}
          {input.trim() ? (
            <button onClick={send} style={{
              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#032EA1,#8B0020)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", boxShadow: "0 2px 8px rgba(3,46,161,0.35)",
              WebkitTapHighlightColor: "transparent",
            }}>
              <IcoSend />
            </button>
          ) : (
            <button
              onMouseDown={micPointerDown}
              onTouchStart={micPointerDown}
              style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#032EA1,#8B0020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", boxShadow: "0 2px 8px rgba(3,46,161,0.35)",
                touchAction: "none",
                WebkitTapHighlightColor: "rgba(0,0,0,0)",
                outline: "none",
              }}>
              <IcoMic color="white" />
            </button>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imgInputRef}  type="file" accept="image/*"                       style={{ display:"none" }} onChange={handleImageFile} />
      <input ref={camInputRef}  type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleImageFile} />
      <input ref={fileInputRef} type="file"                                         style={{ display:"none" }} onChange={handleFileAttach} />

      {viewImg && <ImageViewer src={viewImg} onClose={() => setViewImg(null)} />}
    </div>
  );
}

/* ─── Conversation List ──────────────────── */
export default function Messages() {
  const { t } = useLang();
  const [convos] = useState(INIT_CONVOS);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");

  if (active) return <ChatView contact={active} onBack={() => setActive(null)} t={t} />;

  const filtered = convos.filter(c =>
    c.name.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100dvh",
      paddingBottom: 96,
      background: "#F0F2F5",
      maxWidth: 680, margin: "0 auto", width: "100%",
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
        padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 12px",
        boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#032EA1" }}>{t("chats")}</h1>
          <button style={{
            width: 36, height: 36, borderRadius: "50%", background: "#E4E6EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}>
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#032EA1" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F0F2F5", borderRadius: 22, padding: "8px 14px",
        }}>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#65676B" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Messenger"
            style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: 15, color: "#050505" }} />
        </div>
      </div>

      {/* Active now strip */}
      <div style={{ padding: "12px 16px 4px" }}>
        <p style={{ fontSize: 12, color: "#65676B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Active Now
        </p>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}
          className="no-scrollbar">
          {convos.filter(c => c.online).map(c => (
            <button key={c.id} onClick={() => setActive(c)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
              <div style={{ position: "relative" }}>
                <img src={c.avatar} alt="" style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", border: "2px solid #032EA1" }} />
                <span style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 13, height: 13, borderRadius: "50%",
                  background: "#31A24C", border: "2.5px solid white",
                }} />
              </div>
              <span style={{ fontSize: 11, color: "#050505", maxWidth: 54, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "8px 16px" }} />

      {/* Conversation list */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map(c => (
          <button key={c.id} onClick={() => setActive(c)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 10px", borderRadius: 12,
              background: "transparent", width: "100%",
              WebkitTapHighlightColor: "rgba(0,0,0,0.04)",
              transition: "background .15s",
            }}
            className="hover:bg-white active:bg-gray-100">
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={c.avatar} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
              {c.online && (
                <span style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 13, height: 13, borderRadius: "50%",
                  background: "#31A24C", border: "2.5px solid white",
                }} />
              )}
            </div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: c.unread ? 700 : 500, color: "#050505" }}>{c.name}</span>
                <span style={{ fontSize: 12, color: c.unread ? "#032EA1" : "#65676B", flexShrink: 0, marginLeft: 8 }}>{c.time}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{
                  fontSize: 13, color: c.unread ? "#050505" : "#65676B",
                  fontWeight: c.unread ? 600 : 400,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                }}>{c.lastMsg}</p>
                {c.unread > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, borderRadius: 10, padding: "0 5px",
                    background: "#032EA1", color: "white",
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{c.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
