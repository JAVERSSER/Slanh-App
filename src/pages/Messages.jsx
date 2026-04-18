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
    <div className="flex items-center gap-2 px-3 py-2 rounded-[18px] min-w-[160px]"
      style={{
        background: isMe ? "linear-gradient(135deg,#0084ff,#0060d0)" : "#e4e6eb",
        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      }}>
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
      <button onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isMe ? "rgba(255,255,255,0.25)" : "#0084ff", WebkitTapHighlightColor: "transparent" }}>
        {playing
          ? <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          : <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-0.5 h-5 mb-0.5">
          {Array.from({ length: 20 }).map((_, i) => {
            const h = [3,5,8,6,10,7,9,5,12,8,6,10,7,9,5,8,6,4,7,5][i];
            const filled = i / 20 <= progress;
            return (
              <div key={i} className="w-1 rounded-full flex-shrink-0"
                style={{ height: h*1.8,
                  background: filled
                    ? (isMe ? "rgba(255,255,255,0.9)" : "#0084ff")
                    : (isMe ? "rgba(255,255,255,0.35)" : "#bcc0ca") }} />
            );
          })}
        </div>
        <span className="text-[10px]" style={{ color: isMe ? "rgba(255,255,255,0.7)" : "#65676b" }}>{fmt(duration || 0)}</span>
      </div>
    </div>
  );
}

/* ── Image bubble ─────────────────────────── */
function ImageBubble({ src, onView }) {
  return (
    <button onClick={() => onView(src)}
      className="rounded-[18px] overflow-hidden active:opacity-80 transition-opacity"
      style={{ maxWidth: 220, display: "block", WebkitTapHighlightColor: "transparent" }}>
      <img src={src} alt="" className="w-full object-cover" style={{ maxHeight: 240 }} />
    </button>
  );
}

/* ── Full-screen image viewer ─────────────── */
function ImageViewer({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <button className="absolute right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl"
        style={{ top: "calc(env(safe-area-inset-top,44px) + 8px)", WebkitTapHighlightColor: "transparent" }}>✕</button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  );
}

/* ── Attachment Tray ─────────────────────── */
function AttachTray({ onImage, onCamera, onFile, onLocation, onClose }) {
  const items = [
    { icon: "🖼️", label: "រូបភាព",  action: onImage    },
    { icon: "📷", label: "ថតរូប",   action: onCamera   },
    { icon: "📄", label: "ឯកសារ",   action: onFile     },
    { icon: "📍", label: "ទីតាំង",  action: onLocation },
    { icon: "🎞️", label: "GIF",     action: onClose    },
    { icon: "🎵", label: "តន្ត្រី",  action: onClose    },
  ];
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-full mb-2 left-0 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64"
        style={{ animation: "slideUp2 .2s ease-out" }}>
        <div className="grid grid-cols-3 gap-3">
          {items.map(item => (
            <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 active:bg-blue-50 transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Mic denied notice ───────────────────── */
function MicDenied({ onClose }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-t border-red-100 flex-shrink-0">
      <span className="text-red-400 text-lg">🎤</span>
      <p className="flex-1 text-xs text-red-500">Microphone access denied. Please allow in Settings.</p>
      <button onClick={onClose} className="text-red-300 text-lg w-6 h-6 flex items-center justify-center"
        style={{ WebkitTapHighlightColor: "transparent" }}>✕</button>
    </div>
  );
}

/* ─── Chat View ──────────────────────────── */
function ChatView({ contact, onBack, t }) {
  useLayoutEffect(() => {
    document.body.classList.add("chat-open");
    return () => document.body.classList.remove("chat-open");
  }, []);

  const [msgs, setMsgs] = useState([
    mkMsg("them", { text: "ជំរាបសួរ! 😊",                         time: "10:00", date: yesterdayISO(), status: "seen" }),
    mkMsg("me",   { text: "ជំរាបសួរ! ខ្ញុំ​សុខ​សប្បាយ 🙏",         time: "10:01", date: yesterdayISO(), status: "seen" }),
    mkMsg("them", { text: "អ្នក​នៅ​ភ្នំ​ពេញ​ ឬ?",                    time: "09:15", status: "read" }),
    mkMsg("me",   { text: "បាទ / ចាស ។ អ្នក​ ៗ?",                  time: "09:17", status: "seen", reaction: "❤️" }),
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
  const [micDenied, setMicDenied]           = useState(false);

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

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

  const startLongPress = id => {
    lpTimer.current = setTimeout(() => { setReactionTarget(id); navigator.vibrate?.(30); }, 420);
  };
  const cancelLongPress = () => clearTimeout(lpTimer.current);

  const setReaction = (id, emoji) => {
    setMsgs(p => p.map(m => m.id === id ? { ...m, reaction: emoji } : m));
    setReactionTarget(null);
  };

  const handleImageFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type: "image", src: URL.createObjectURL(f) })]);
    e.target.value = ""; fakeReply();
  };

  const handleFileAttach = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type: "file", fileName: f.name, fileSize: (f.size/1024).toFixed(1)+" KB" })]);
    e.target.value = ""; fakeReply();
  };

  /* ── voice recording ── */
  const micPointerDown = e => {
    e.preventDefault();
    if (isRecording) return;
    setMicDenied(false);
    cancelRef.current     = false;
    shouldSendRef.current = false;
    micAnchorX.current    = e.clientX;
    recordStartRef.current = Date.now();
    setIsRecording(true); setRecCancelled(false); setRecordMs(0);
    timerRef.current = setInterval(() => setRecordMs(Date.now() - recordStartRef.current), 100);

    const btn = e.currentTarget;
    const pid = e.pointerId;
    try { btn.setPointerCapture(pid); } catch {}

    const onMove = ev => {
      const x = ev.clientX;
      const slid = x - micAnchorX.current < -60;
      cancelRef.current = slid;
      setRecCancelled(slid);
    };

    let ended = false;
    const onUp = () => {
      if (ended) return;
      ended = true;
      btn.removeEventListener("pointermove",   onMove);
      btn.removeEventListener("pointerup",     onUp);
      btn.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerup",     onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchend",      onUp);
      window.removeEventListener("mouseup",       onUp);
      clearInterval(timerRef.current);
      if (cancelRef.current || Date.now() - recordStartRef.current < 300) {
        cancelRef.current = true;
        if (mediaRef.current?.state !== "inactive") { try { mediaRef.current.stop(); } catch {} }
        mediaRef.current = null; chunksRef.current = [];
      } else {
        if (mediaRef.current?.state !== "inactive") mediaRef.current.stop();
        else shouldSendRef.current = true;
      }
      setIsRecording(false); setRecCancelled(false); setRecordMs(0);
    };

    // Primary: pointer capture on element (slide-to-cancel works in PWA)
    btn.addEventListener("pointermove",   onMove);
    btn.addEventListener("pointerup",     onUp);
    btn.addEventListener("pointercancel", onUp);
    // Fallback: window listeners catch release if pointer capture fails on iOS PWA
    window.addEventListener("pointerup",     onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchend",      onUp);
    window.addEventListener("mouseup",       onUp);

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
        setMicDenied(true);
      }
    })();
  };

  const fmtTime = ms => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  };

  /* ── render message ── */
  const renderMsg = (msg, idx) => {
    const isMe    = msg.from === "me";
    const prevMsg = msgs[idx - 1];
    const nextMsg = msgs[idx + 1];
    const showAv  = !isMe && (!nextMsg || nextMsg.from !== "them");
    const isFirst = !prevMsg || prevMsg.from !== msg.from;
    const isLast  = !nextMsg || nextMsg.from !== msg.from;
    const showDate = idx === 0 || msgs[idx-1].date !== msg.date;

    const bubbleRadius = isMe
      ? `${isFirst ? 18 : 18}px ${isFirst ? 4 : 18}px ${isLast ? 4 : 18}px 18px`
      : `${isFirst ? 4 : 18}px 18px 18px ${isLast ? 4 : 18}px`;

    return (
      <div key={msg.id}>
        {showDate && (
          <div className="flex items-center justify-center my-4">
            <span className="text-[11px] font-medium px-3 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.06)", color: "#65676b" }}>
              {formatDateLabel(msg.date)}
            </span>
          </div>
        )}
        <div className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"} ${isLast ? "mb-2" : "mb-0.5"}`}>
          {/* Avatar placeholder for alignment */}
          {!isMe && (
            <div className="w-7 h-7 flex-shrink-0">
              {showAv && (
                <img src={contact.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75vw" }}>
            {msg.replyTo && (
              <div className="text-xs px-3 py-1.5 rounded-xl mb-1 border-l-2 border-[#0084ff] bg-gray-100 text-gray-400">
                ↩ {(msg.replyTo.text || "📷 Photo").slice(0,40)}
              </div>
            )}
            <div className="relative"
              onDoubleClick={() => setReactionTarget(msg.id)}
              onContextMenu={e => { e.preventDefault(); setReactionTarget(msg.id); }}
              onTouchStart={() => startLongPress(msg.id)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}>

              {msg.type === "image" && <ImageBubble src={msg.src} onView={setViewImg} />}
              {msg.type === "voice" && <VoiceBubble src={msg.src} duration={msg.duration} isMe={isMe} />}
              {msg.type === "file" && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-[18px]"
                  style={{ background: isMe ? "linear-gradient(135deg,#0084ff,#0060d0)" : "#e4e6eb" }}>
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isMe ? "white" : "#1c1e21" }}>{msg.fileName}</p>
                    <p className="text-xs" style={{ color: isMe ? "rgba(255,255,255,0.6)" : "#65676b" }}>{msg.fileSize}</p>
                  </div>
                  <span className="text-lg flex-shrink-0" style={{ color: isMe ? "rgba(255,255,255,0.8)" : "#0084ff" }}>⬇</span>
                </div>
              )}
              {(!msg.type || msg.type === "text") && (
                <div className="px-3 py-2 text-sm leading-relaxed"
                  style={{
                    background: isMe ? "linear-gradient(135deg,#0084ff,#0060d0)" : "#e4e6eb",
                    color: isMe ? "white" : "#1c1e21",
                    borderRadius: bubbleRadius,
                    wordBreak: "break-word",
                  }}>
                  {msg.text}
                </div>
              )}

              {msg.reaction && (
                <span className="absolute -bottom-2 right-1 text-sm bg-white rounded-full px-1 shadow border border-gray-100">
                  {msg.reaction}
                </span>
              )}

              {reactionTarget === msg.id && (
                <div className="absolute z-20 flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-xl border border-gray-100"
                  style={{ bottom: "calc(100% + 8px)", [isMe ? "right" : "left"]: 0, whiteSpace: "nowrap" }}>
                  {REACTIONS.map(em => (
                    <button key={em} onClick={ev => { ev.stopPropagation(); setReaction(msg.id, em); }}
                      className="text-xl active:scale-125 transition-transform"
                      style={{ WebkitTapHighlightColor: "transparent" }}>{em}</button>
                  ))}
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <button onClick={ev => { ev.stopPropagation(); setReplyTo(msg); setReactionTarget(null); }}
                    className="text-gray-500 text-sm font-medium"
                    style={{ WebkitTapHighlightColor: "transparent" }}>↩</button>
                </div>
              )}
            </div>

            {isLast && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px]" style={{ color: "#65676b" }}>{msg.time}</span>
                {isMe && <span className="text-[10px]" style={{ color: "#0084ff" }}>{msg.status === "seen" ? "✓✓" : "✓"}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col"
      style={{
        height: "100dvh",
        background: "white",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
      onClick={() => { setReactionTarget(null); setShowAttach(false); }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 pb-2 flex-shrink-0"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
          background: "white",
          borderBottom: "1px solid #e4e6eb",
        }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ WebkitTapHighlightColor: "transparent" }}>
          <svg className="w-5 h-5" style={{ color: "#0084ff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button className="flex items-center gap-2 flex-1 min-w-0"
          style={{ WebkitTapHighlightColor: "transparent" }}>
          <div className="relative flex-shrink-0">
            <img src={contact.avatar} alt={contact.nameEn} className="w-10 h-10 rounded-full object-cover" />
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm text-[#1c1e21] truncate">{contact.name}</p>
            <p className="text-xs" style={{ color: contact.online ? "#31a24c" : "#65676b" }}>
              {contact.online ? "Active now" : contact.location}
            </p>
          </div>
        </button>

        <div className="flex gap-1 flex-shrink-0">
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#e4e6eb", WebkitTapHighlightColor: "transparent" }}>
            <svg className="w-4 h-4" style={{ color: "#0084ff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#e4e6eb", WebkitTapHighlightColor: "transparent" }}>
            <svg className="w-4 h-4" style={{ color: "#0084ff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.649v6.702a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        {msgs.map(renderMsg)}
        {typing && (
          <div className="flex items-end gap-1.5 justify-start mb-2">
            <img src={contact.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            <div className="flex items-center gap-1 px-4 py-3 rounded-[18px] rounded-bl-[4px]"
              style={{ background: "#e4e6eb" }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply bar ── */}
      {replyTo && (
        <div className="flex items-center gap-3 px-3 py-2 flex-shrink-0"
          style={{ background: "#f0f2f5", borderTop: "1px solid #e4e6eb" }}>
          <div className="flex-1 border-l-2 border-[#0084ff] pl-2">
            <p className="text-xs font-semibold" style={{ color: "#0084ff" }}>↩ Reply</p>
            <p className="text-xs truncate" style={{ color: "#65676b" }}>{replyTo.text || "📷 Photo"}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="w-6 h-6 flex items-center justify-center text-gray-400"
            style={{ WebkitTapHighlightColor: "transparent" }}>✕</button>
        </div>
      )}

      {/* ── Mic denied ── */}
      {micDenied && <MicDenied onClose={() => setMicDenied(false)} />}

      {/* ── Recording indicator ── */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            height: "calc(env(safe-area-inset-bottom, 0px) + 62px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            background: "white",
            borderTop: "1px solid #e4e6eb",
            animation: "slideUp2 .15s ease-out",
          }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: recCancelled ? "#9ca3af" : "#ef4444",
                animation: recCancelled ? "none" : "pulse 1s infinite",
              }} />
            <span className="font-mono text-sm font-bold"
              style={{ color: recCancelled ? "#9ca3af" : "#ef4444" }}>
              {fmtTime(recordMs)}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: recCancelled ? "#ef4444" : "#9ca3af" }}>
              {recCancelled ? "Release to cancel" : "◀  Slide to cancel"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: recCancelled ? "#e4e6eb" : "#0084ff",
              animation: recCancelled ? "none" : "pulse 1.2s infinite",
              transition: "background .2s",
            }}>
            <svg className="w-4 h-4" style={{ color: recCancelled ? "#9ca3af" : "white" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      {!isRecording && (
        <div className="flex items-end gap-2 px-2 py-2 flex-shrink-0"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
            background: "white",
            borderTop: "1px solid #e4e6eb",
          }}
          onClick={e => e.stopPropagation()}>

          {/* Attach */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setShowAttach(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform"
              style={{
                background: showAttach ? "#0084ff" : "#e4e6eb",
                transform: showAttach ? "rotate(45deg)" : "none",
                WebkitTapHighlightColor: "transparent",
              }}>
              <svg className="w-4 h-4" style={{ color: showAttach ? "white" : "#65676b" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {showAttach && (
              <AttachTray
                onImage={() => imgInputRef.current?.click()}
                onCamera={() => camInputRef.current?.click()}
                onFile={() => fileInputRef.current?.click()}
                onLocation={() => setMsgs(p => [...p, mkMsg("me", { text: "📍 ភ្នំពេញ, Cambodia" })])}
                onClose={() => setShowAttach(false)}
              />
            )}
          </div>

          {/* Camera */}
          <button onClick={() => camInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#e4e6eb", WebkitTapHighlightColor: "transparent" }}>
            <svg className="w-4 h-4" style={{ color: "#65676b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 flex items-center rounded-full px-3 py-2 gap-2 min-w-0"
            style={{ background: "#f0f2f5", minHeight: 36 }}>
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Aa"
              className="flex-1 bg-transparent outline-none text-sm min-w-0"
              style={{
                WebkitUserSelect: "text",
                userSelect: "text",
                color: "#1c1e21",
              }} />
          </div>

          {/* Send or Mic */}
          {input.trim() ? (
            <button onClick={send}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#0084ff", WebkitTapHighlightColor: "transparent" }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              onPointerDown={micPointerDown}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "#0084ff",
                touchAction: "none",
                WebkitTapHighlightColor: "rgba(0,0,0,0)",
                outline: "none",
                userSelect: "none",
              }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      )}

      <input ref={imgInputRef}  type="file" accept="image/*"                       className="hidden" onChange={handleImageFile} />
      <input ref={camInputRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />
      <input ref={fileInputRef} type="file"                                         className="hidden" onChange={handleFileAttach} />

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
    <div className="flex flex-col min-h-dvh pb-24"
      style={{
        background: "white",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}>

      {/* Header */}
      <div className="px-4 pb-3"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)",
          background: "white",
          borderBottom: "1px solid #e4e6eb",
        }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold" style={{ color: "#1c1e21" }}>Chats</h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#e4e6eb", WebkitTapHighlightColor: "transparent" }}>
            <svg className="w-4 h-4" style={{ color: "#0084ff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "#f0f2f5" }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#65676b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Messenger"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ WebkitUserSelect: "text", userSelect: "text", color: "#1c1e21" }} />
        </div>
      </div>

      {/* Active now */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-semibold mb-2" style={{ color: "#65676b" }}>Active now</p>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {convos.filter(c => c.online).map(c => (
            <button key={c.id} onClick={() => setActive(c)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <div className="relative">
                <img src={c.avatar} alt={c.nameEn} className="rounded-full object-cover" style={{ width: 56, height: 56 }} />
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-xs max-w-[56px] truncate" style={{ color: "#1c1e21" }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "#e4e6eb", margin: "0 16px" }} />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        {filtered.map(c => (
          <button key={c.id} onClick={() => setActive(c)}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}>
            <div className="relative flex-shrink-0">
              <img src={c.avatar} alt={c.nameEn} className="w-14 h-14 rounded-full object-cover" />
              {c.online && <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm truncate pr-2"
                  style={{ color: "#1c1e21", fontWeight: c.unread ? 700 : 600 }}>{c.name}</span>
                <span className="text-xs flex-shrink-0" style={{ color: c.unread ? "#0084ff" : "#65676b" }}>{c.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-sm truncate pr-2"
                  style={{ color: c.unread ? "#1c1e21" : "#65676b", fontWeight: c.unread ? 600 : 400 }}>
                  {c.lastMsg}
                </p>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                    style={{ background: "#0084ff" }}>{c.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
