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

function mkMsg(from, extras = {}) {
  return {
    id: Date.now() + Math.random(),
    from,
    text: "",
    time: new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false }),
    status: "sent",
    reaction: null,
    type: "text", // text | image | voice | file
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
    else { a.play(); setPlaying(true); }
  };
  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (a && a.duration) setProgress(a.currentTime / a.duration);
  };
  const onEnded = () => { setPlaying(false); setProgress(0); };
  const fmt = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl min-w-[160px] ${isMe ? "bubble-me" : "bubble-them"}`}
      style={{ background: isMe ? "linear-gradient(135deg,#032EA1,#1a4fcc)" : "white", borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px" }}>
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
      <button onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? "bg-white/20" : "bg-[#032EA1]"}`}>
        {playing
          ? <span className={`text-base ${isMe ? "text-white" : "text-white"}`}>⏸</span>
          : <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isMe ? "text-white" : "text-white"}`}><path d="M8 5v14l11-7z"/></svg>
        }
      </button>
      <div className="flex-1 min-w-0">
        {/* Waveform bars */}
        <div className="flex items-center gap-0.5 h-6 mb-1">
          {Array.from({ length: 20 }).map((_, i) => {
            const h = [3,5,8,6,10,7,9,5,12,8,6,10,7,9,5,8,6,4,7,5][i];
            const filled = i / 20 <= progress;
            return <div key={i} className="w-1 rounded-full flex-shrink-0 transition-colors"
              style={{ height: h*2, background: filled ? (isMe ? "rgba(255,255,255,0.9)" : "#032EA1") : (isMe ? "rgba(255,255,255,0.35)" : "#d1d5db") }} />;
          })}
        </div>
        <span className={`text-[11px] ${isMe ? "text-white/70" : "text-gray-400"}`}>{fmt(duration || 0)}</span>
      </div>
    </div>
  );
}

/* ── Image bubble ─────────────────────────── */
function ImageBubble({ src, isMe, onView }) {
  return (
    <button onClick={() => onView(src)}
      className="rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
      style={{ maxWidth: 200, display: "block" }}>
      <img src={src} alt="" className="w-full object-cover" style={{ maxHeight: 220 }} />
    </button>
  );
}


/* ── Full-screen image viewer ─────────────── */
function ImageViewer({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">✕</button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  );
}

/* ─── Attachment Tray ────────────────────── */
function AttachTray({ onImage, onCamera, onFile, onLocation, onClose }) {
  const items = [
    { icon: "🖼️", label: "រូបភាព",   labelEn: "Gallery",  action: onImage    },
    { icon: "📷", label: "ថតរូប",    labelEn: "Camera",   action: onCamera   },
    { icon: "📄", label: "ឯកសារ",    labelEn: "File",     action: onFile     },
    { icon: "📍", label: "ទីតាំង",   labelEn: "Location", action: onLocation },
    { icon: "🎞️", label: "GIF",      labelEn: "GIF",      action: onClose    },
    { icon: "🎵", label: "តន្ត្រី",   labelEn: "Audio",    action: onClose    },
  ];
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-full mb-2 left-0 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64"
        style={{ animation: "slideUp2 .2s ease-out" }}>
        <div className="grid grid-cols-3 gap-3">
          {items.map(item => (
            <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 active:scale-95 transition-all">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
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
    mkMsg("them", { text: "ជំរាបសួរ! 😊", time: "10:00", status: "seen" }),
    mkMsg("me",   { text: "ជំរាបសួរ! ខ្ញុំ​សុខ​សប្បាយ 🙏", time: "10:01", status: "seen" }),
    mkMsg("them", { text: "អ្នក​នៅ​ភ្នំ​ពេញ​ ឬ?", time: "10:02", status: "read" }),
    mkMsg("me",   { text: "បាទ / ចាស ។ អ្នក​ ៗ?", time: "10:03", status: "seen", reaction: "❤️" }),
  ]);
  const [input, setInput]               = useState("");
  const [typing, setTyping]             = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [replyTo, setReplyTo]           = useState(null);
  const [showAttach, setShowAttach]     = useState(false);
  const inputRef = useRef(null);
  const [viewImg, setViewImg]           = useState(null);
  // Voice recording
  const [isRecording, setIsRecording]   = useState(false);
  const [recordSecs, setRecordSecs]     = useState(0);
  const [voiceLocked, setVoiceLocked]   = useState(false);
  const [voiceDrag, setVoiceDrag]       = useState({ dx: 0, dy: 0 });
  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const micAnchor   = useRef({ x: 0, y: 0 });
  const recSecsRef  = useRef(0);
  const cancelRef   = useRef(false);
  const typingTimer    = useRef(null);
  const bottomRef      = useRef(null);
  const lpTimer        = useRef(null);   // long-press timer for reactions
  // Hidden file inputs
  const imgInputRef  = useRef(null);
  const camInputRef  = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  /* ── send text ── */
  const send = useCallback(() => {
    if (!input.trim()) return;
    const msg = mkMsg("me", { text: input.trim(), ...(replyTo ? { replyTo } : {}) });
    setMsgs(p => [...p, msg]);
    setInput(""); setReplyTo(null);
    fakeReply();
  }, [input, replyTo]);

  const fakeReply = () => {
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, mkMsg("them", { text: ["😊 អរគុណ!","មែន​ទែន?","ល្អ​ណាស់ 🙏","🇰🇭❤️"][Math.floor(Math.random()*4)] })]);
    }, 1500);
  };

  /* ── long-press to react ── */
  const startLongPress = (id) => {
    lpTimer.current = setTimeout(() => {
      setReactionTarget(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 420);
  };
  const cancelLongPress = () => clearTimeout(lpTimer.current);

  /* ── reactions ── */
  const setReaction = (id, emoji) => {
    setMsgs(p => p.map(m => m.id === id ? { ...m, reaction: emoji } : m));
    setReactionTarget(null);
  };

  /* ── image from gallery ── */
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMsgs(p => [...p, mkMsg("me", { type: "image", src: url })]);
    e.target.value = "";
    fakeReply();
  };

  /* ── file attachment ── */
  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsgs(p => [...p, mkMsg("me", {
      type: "file",
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
    })]);
    e.target.value = "";
    fakeReply();
  };

  /* ── voice recording ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      recSecsRef.current = 0;
      cancelRef.current = false;
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (cancelRef.current) { chunksRef.current = []; return; }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url  = URL.createObjectURL(blob);
        setMsgs(p => [...p, mkMsg("me", { type: "voice", src: url, duration: recSecsRef.current })]);
        setRecordSecs(0);
        recSecsRef.current = 0;
        fakeReply();
      };
      mr.start();
      mediaRef.current = mr;
      setIsRecording(true);
      setVoiceLocked(false);
      setVoiceDrag({ dx: 0, dy: 0 });
      timerRef.current = setInterval(() => {
        recSecsRef.current += 1;
        setRecordSecs(s => s + 1);
      }, 1000);
    } catch {
      alert("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (!mediaRef.current || mediaRef.current.state === "inactive") return;
    mediaRef.current.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setVoiceLocked(false);
    setVoiceDrag({ dx: 0, dy: 0 });
  };

  const cancelRecording = () => {
    cancelRef.current = true;
    if (mediaRef.current) {
      try { mediaRef.current.stop(); } catch {}
      mediaRef.current = null;
    }
    clearInterval(timerRef.current);
    chunksRef.current = [];
    recSecsRef.current = 0;
    setIsRecording(false);
    setVoiceLocked(false);
    setVoiceDrag({ dx: 0, dy: 0 });
    setRecordSecs(0);
  };

  const micDown = async (e) => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    micAnchor.current = { x: pt.clientX, y: pt.clientY };
    await startRecording();
  };

  /* Drag tracking while holding mic (unlocked only) */
  useEffect(() => {
    if (!isRecording || voiceLocked) return;
    let done = false;

    const onMove = (e) => {
      if (done) return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - micAnchor.current.x;
      const dy = pt.clientY - micAnchor.current.y;
      setVoiceDrag({ dx, dy });
      if (dx < -80) {
        done = true;
        cancelRef.current = true;
        if (mediaRef.current) { try { mediaRef.current.stop(); } catch {} mediaRef.current = null; }
        clearInterval(timerRef.current);
        chunksRef.current = []; recSecsRef.current = 0;
        setIsRecording(false); setVoiceDrag({ dx: 0, dy: 0 }); setRecordSecs(0);
      } else if (dy < -80) {
        done = true;
        setVoiceLocked(true);
      }
    };

    const onUp = () => {
      if (done) return;
      done = true;
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setVoiceDrag({ dx: 0, dy: 0 });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [isRecording, voiceLocked]);

  const fmtTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  /* ── render message ── */
  const renderMsg = (msg, idx) => {
    const isMe = msg.from === "me";
    const showAv = !isMe && (idx === 0 || msgs[idx-1].from !== "them");

    return (
      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} mb-1`}>
        {!isMe && (
          <img src={contact.avatar} alt=""
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            style={{ visibility: showAv ? "visible" : "hidden" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "72vw" }}>
          {/* Reply preview */}
          {msg.replyTo && (
            <div className={`text-xs px-3 py-1.5 rounded-xl mb-1 border-l-2 border-[#032EA1] ${isMe ? "bg-blue-50" : "bg-white"} text-gray-400`}>
              ↩ {(msg.replyTo.text || "📷 Photo").slice(0,40)}
            </div>
          )}

          <div className="relative"
            onDoubleClick={() => setReactionTarget(msg.id)}
            onContextMenu={e => { e.preventDefault(); setReactionTarget(msg.id); }}
            onTouchStart={() => startLongPress(msg.id)}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            style={{ WebkitUserSelect: "none", userSelect: "none" }}>

            {/* Content */}
            {msg.type === "image" && <ImageBubble src={msg.src} isMe={isMe} onView={setViewImg} />}
            {msg.type === "voice" && <VoiceBubble src={msg.src} duration={msg.duration} isMe={isMe} />}
            {msg.type === "file"  && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isMe ? "bubble-me" : "bubble-them"}`}
                style={isMe ? { background: "linear-gradient(135deg,#032EA1,#1a4fcc)" } : { background: "white" }}>
                <span className="text-2xl flex-shrink-0">📄</span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-[#1A1A2E]"}`}>{msg.fileName}</p>
                  <p className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}>{msg.fileSize}</p>
                </div>
                <span className={`text-lg flex-shrink-0 ${isMe ? "text-white/80" : "text-[#032EA1]"}`}>⬇</span>
              </div>
            )}
            {(!msg.type || msg.type === "text") && (
              <div className={isMe ? "bubble-me" : "bubble-them"}
                style={isMe ? { background: "linear-gradient(135deg,#032EA1,#1a4fcc)" } : {}}>
                {msg.text}
              </div>
            )}

            {/* Reaction badge */}
            {msg.reaction && (
              <span className="absolute -bottom-2 right-1 text-sm bg-white rounded-full px-1 shadow border border-gray-100">
                {msg.reaction}
              </span>
            )}

            {/* Reaction + reply picker */}
            {reactionTarget === msg.id && (
              <div className="absolute z-20 flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-xl border border-gray-100"
                style={{ bottom: "calc(100% + 8px)", [isMe ? "right" : "left"]: 0, whiteSpace: "nowrap" }}>
                {REACTIONS.map(e => (
                  <button key={e} onClick={ev => { ev.stopPropagation(); setReaction(msg.id, e); }}
                    className="text-xl hover:scale-125 transition-transform">{e}</button>
                ))}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button onClick={ev => { ev.stopPropagation(); setReplyTo(msg); setReactionTarget(null); }}
                  className="text-gray-500 text-sm font-medium hover:text-[#032EA1]">↩</button>
              </div>
            )}
          </div>

          {/* Time + status */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-gray-400">{msg.time}</span>
            {isMe && <span className="text-[10px] text-[#032EA1]">{msg.status === "seen" ? "✓✓" : "✓"}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#F0F2F5" }}
      onClick={() => { setReactionTarget(null); setShowAttach(false); }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white shadow-sm flex-shrink-0">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={contact.avatar} alt={contact.nameEn} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A1A2E] text-sm">{contact.name}</p>
          <p className="text-xs" style={{ color: contact.online ? "#22c55e" : "#9ca3af" }}>
            {contact.online ? "🟢 Online" : contact.location}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.649v6.702a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {msgs.map(renderMsg)}
        {typing && (
          <div className="flex items-end gap-2 justify-start">
            <img src={contact.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            <div className="bubble-them flex items-center gap-1 py-3.5 px-4" style={{ background: "white" }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply bar ── */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-t border-blue-100 flex-shrink-0">
          <div className="flex-1 border-l-2 border-[#032EA1] pl-2">
            <p className="text-xs text-[#032EA1] font-semibold">↩ Reply</p>
            <p className="text-xs text-gray-500 truncate">{replyTo.text || "📷 Photo"}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 text-xl w-7 h-7 flex items-center justify-center">✕</button>
        </div>
      )}

      {/* ── Recording bar — LOCKED mode ── */}
      {isRecording && voiceLocked && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-t border-red-100 flex-shrink-0">
          <button onClick={cancelRecording}
            className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-lg">✕</button>
          <div className="flex-1 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" style={{ animation: "pulse 1s infinite" }} />
            <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(recordSecs * 3, 100)}%`, transition: "width 1s linear" }} />
            </div>
            <span className="text-red-600 font-mono font-bold text-sm flex-shrink-0">{fmtTime(recordSecs)}</span>
          </div>
          <button onClick={stopRecording}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow"
            style={{ background: "linear-gradient(135deg,#032EA1,#8B0020)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      )}

      {/* ── Recording bar — HOLD mode ── */}
      {isRecording && !voiceLocked && (
        <div className="flex items-end gap-2 px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0"
          style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom,0px))" }}>
          {/* Trash / cancel */}
          <button onClick={cancelRecording}
            className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
          {/* Timer + hint */}
          <div className="flex-1 flex items-center gap-2 bg-red-50 rounded-2xl px-3 h-11">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" style={{ animation: "pulse 1s infinite" }} />
            <span className="text-red-600 font-mono text-sm font-bold flex-shrink-0">{fmtTime(recordSecs)}</span>
            <span className="flex-1 text-gray-400 text-xs text-center select-none">← Slide to cancel</span>
          </div>
          {/* Lock hint + mic button */}
          <div className="flex flex-col items-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-gray-400 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-[9px] text-gray-400 leading-none mb-1">Lock</span>
            <button
              onMouseDown={micDown} onTouchStart={micDown}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow"
              style={{ background: "linear-gradient(135deg,#E00025,#8B0020)", touchAction: "none" }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Normal input bar ── */}
      {!isRecording && (
        <div className="flex items-end gap-2 px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0"
          style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom,0px))" }}
          onClick={e => e.stopPropagation()}>

          {/* + Attachment */}
          <div className="relative flex-shrink-0">
            <button onClick={() => { setShowAttach(v => !v); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${showAttach ? "rotate-45" : ""}`}
              style={{ background: showAttach ? "linear-gradient(135deg,#032EA1,#8B0020)" : "#f3f4f6" }}>
              <svg className={`w-5 h-5 ${showAttach ? "text-white" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {showAttach && (
              <AttachTray
                onImage={() => imgInputRef.current?.click()}
                onCamera={() => camInputRef.current?.click()}
                onFile={() => fileInputRef.current?.click()}
                onLocation={() => setMsgs(p => [...p, mkMsg("me", { text: "📍 ភ្នំពេញ, Cambodia (12.3657° N, 104.9910° E)" })])}
                onClose={() => setShowAttach(false)}
              />
            )}
          </div>

          {/* Camera shortcut */}
          <button onClick={() => camInputRef.current?.click()}
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-3 py-2 gap-2 relative min-w-0">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={t("typeMessage")}
              className="flex-1 bg-transparent outline-none min-w-0" />
          </div>

          {/* Send or Mic */}
          {input.trim() ? (
            <button onClick={send}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow active:scale-90 transition-transform"
              style={{ background: "linear-gradient(135deg,#032EA1,#8B0020)" }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              onMouseDown={micDown} onTouchStart={micDown}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow active:scale-90 transition-all"
              style={{ background: "linear-gradient(135deg,#032EA1,#8B0020)", touchAction: "none" }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imgInputRef}  type="file" accept="image/*"            className="hidden" onChange={handleImageFile} />
      <input ref={camInputRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />
      <input ref={fileInputRef} type="file"                              className="hidden" onChange={handleFileAttach} />

      {/* Full-screen image */}
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
    <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--kh-cream)" }}>
      <div className="px-5 pt-12 pb-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-[#032EA1] mb-1">{t("chats")}</h1>
        <p className="text-gray-400 text-xs mb-3">{t("chatWith")}</p>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Online</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {convos.filter(c => c.online).map(c => (
            <button key={c.id} onClick={() => setActive(c)} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <img src={c.avatar} alt={c.nameEn} className="rounded-full object-cover border-2 border-[#032EA1]" style={{ width: 52, height: 52 }} />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-xs text-gray-600 max-w-[52px] truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="angkor-divider mx-5 my-2 text-xs">🏛️</div>

      <div className="px-4 space-y-1.5">
        {filtered.map(c => (
          <button key={c.id} onClick={() => setActive(c)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
            <div className="relative flex-shrink-0">
              <img src={c.avatar} alt={c.nameEn} className="w-14 h-14 rounded-full object-cover" />
              {c.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-[#1A1A2E] ${c.unread ? "font-bold" : ""}`}>{c.name}</span>
                <span className="text-xs text-gray-400">{c.time}</span>
              </div>
              <p className={`text-sm truncate mt-0.5 ${c.unread ? "text-[#032EA1] font-medium" : "text-gray-400"}`}>{c.lastMsg}</p>
            </div>
            {c.unread > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: "var(--kh-red)" }}>{c.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
