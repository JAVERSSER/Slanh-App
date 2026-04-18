import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { profiles } from "../data/profiles";
import { useLang } from "../context/LangContext";

const REACTIONS = ["❤️","😂","😮","😢","😡","👍"];

const isKhmer = text => /[\u1780-\u17FF]/.test(text);

async function fetchTranslation(text) {
  const from = isKhmer(text) ? "km" : "en";
  const to   = from === "km" ? "en" : "km";
  const res  = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  );
  const data = await res.json();
  return data.responseData?.translatedText || null;
}

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
  const today = todayISO(), yesterday = yesterdayISO();
  if (iso === today)     return "Today";
  if (iso === yesterday) return "Yesterday";
  const d = new Date(iso);
  if (Math.round((new Date(today) - d) / 86400000) < 7)
    return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mkMsg(from, extras = {}) {
  return {
    id: Date.now() + Math.random(), from,
    text: "", date: todayISO(),
    time: new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false }),
    status: "sent", reaction: null, type: "text",
    ...extras,
  };
}

/* ── Voice bubble (Telegram style) ───────── */
const WAVEFORM = [3,5,8,5,10,14,9,12,7,15,11,8,13,6,10,12,8,5,9,11,14,10,7,12,8,6,10,9,5,7];

function VoiceBubble({ src, duration, isMe, msgId, playingId, setPlayingId, onEnded }) {
  const playing  = playingId === msgId;
  const [progress, setProgress] = useState(0);
  const [current,  setCurrent]  = useState(0);
  const audioRef = useRef(null);
  const rafRef   = useRef(null);

  // Stop and clean up when component unmounts (navigating away from Messages)
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const a = audioRef.current;
      if (a) { a.pause(); a.src = ""; }
    };
  }, []);

  // Control play/pause whenever playingId changes
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    if (playing) a.play().catch(() => {});
    else         a.pause();
  }, [playing]);

  // requestAnimationFrame loop — silky smooth 60fps timer
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    const tick = () => {
      const a = audioRef.current;
      if (a?.duration) { setProgress(a.currentTime / a.duration); setCurrent(a.currentTime); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const toggle = () => setPlayingId(playing ? null : msgId);

  const handleEnded = () => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0); setCurrent(0);
    onEnded(msgId); // triggers auto-play of next voice
  };

  const seek = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const a    = audioRef.current;
    if (a?.duration) { a.currentTime = pct * a.duration; setProgress(pct); setCurrent(a.currentTime); }
  };

  const fmt    = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const accent  = isMe ? "rgba(255,255,255,0.95)" : "#032EA1";
  const faded   = isMe ? "rgba(255,255,255,0.28)" : "#d1d5db";
  const timeTxt = isMe ? "rgba(255,255,255,0.65)" : "#9ca3af";

  return (
    <div className="flex items-center gap-3 px-3 py-3"
      style={{
        background:   isMe ? "linear-gradient(135deg,#032EA1,#1a4fcc)" : "white",
        borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
        minWidth: 230, maxWidth: 280,
        boxShadow: isMe ? "none" : "0 2px 10px rgba(0,0,0,0.08)",
      }}>
      <audio ref={audioRef} src={src} onEnded={handleEnded} />

      {/* Play / Pause */}
      <button onClick={toggle}
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 42, height: 42,
          background: isMe ? "rgba(255,255,255,0.22)" : "linear-gradient(135deg,#032EA1,#1a4fcc)",
          boxShadow: isMe ? "none" : "0 2px 8px rgba(3,46,161,0.35)",
          WebkitTapHighlightColor: "transparent",
          transition: "transform 0.12s",
        }}
        onTouchStart={e => e.currentTarget.style.transform = "scale(0.88)"}
        onTouchEnd={e   => e.currentTarget.style.transform = "scale(1)"}>
        {playing
          ? <svg viewBox="0 0 24 24" fill="white" style={{ width:16, height:16 }}>
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          : <svg viewBox="0 0 24 24" fill="white" style={{ width:16, height:16, marginLeft:2 }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
        }
      </button>

      {/* Waveform + timer */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-[2.5px] h-9 cursor-pointer" onClick={seek}>
          {WAVEFORM.map((h, i) => (
            <div key={i} className="rounded-full flex-shrink-0"
              style={{
                width: 3,
                height: Math.max(4, h * 2.1),
                background: i / WAVEFORM.length <= progress ? accent : faded,
              }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize:11, fontWeight:600, color:timeTxt, fontVariantNumeric:"tabular-nums" }}>
            {fmt(playing ? current : (duration || 0))}
          </span>
          {playing && (
            <span style={{ fontSize:10, color:timeTxt, fontVariantNumeric:"tabular-nums" }}>
              {fmt(duration || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Image bubble ─────────────────────────── */
function ImageBubble({ src, onView }) {
  return (
    <button onClick={() => onView(src)}
      className="rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
      style={{ maxWidth:200, display:"block", WebkitTapHighlightColor:"transparent" }}>
      <img src={src} alt="" className="w-full object-cover" style={{ maxHeight:220 }} />
    </button>
  );
}

/* ── Full-screen image viewer ─────────────── */
function ImageViewer({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <button className="absolute right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl"
        style={{ top:"calc(env(safe-area-inset-top,44px) + 8px)", WebkitTapHighlightColor:"transparent" }}>✕</button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  );
}

/* ── Attachment Tray ─────────────────────── */
function AttachTray({ onFile, onLocation, onClose }) {
  const items = [
    { icon:"📄", label:"ឯកសារ",  action:onFile     },
    { icon:"📍", label:"ទីតាំង", action:onLocation },
  ];
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-full mb-2 left-0 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-44"
        style={{ animation:"slideUp2 .2s ease-out" }}>
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 active:scale-95 transition-all"
              style={{ WebkitTapHighlightColor:"transparent" }}>
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
    mkMsg("them", { text:"ជំរាបសួរ! 😊",               time:"10:00", date:yesterdayISO(), status:"seen" }),
    mkMsg("me",   { text:"ជំរាបសួរ! ខ្ញុំ​សុខ​សប្បាយ 🙏", time:"10:01", date:yesterdayISO(), status:"seen" }),
    mkMsg("them", { text:"អ្នក​នៅ​ភ្នំ​ពេញ​ ឬ?",            time:"09:15", status:"read" }),
    mkMsg("me",   { text:"បាទ / ចាស ។ អ្នក​ ៗ?",          time:"09:17", status:"seen", reaction:"❤️" }),
  ]);
  const [input, setInput]                   = useState("");
  const [inputFocused, setInputFocused]     = useState(false);
  const [typing, setTyping]                 = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [replyTo, setReplyTo]               = useState(null);
  const [showAttach, setShowAttach]         = useState(false);
  const [viewImg, setViewImg]               = useState(null);
  const [isRecording, setIsRecording]       = useState(false);
  const [recordMs, setRecordMs]             = useState(0);
  const [recCancelled, setRecCancelled]     = useState(false);
  const [micDenied, setMicDenied]           = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const playNextVoice = useCallback((currentId) => {
    const voices = msgs.filter(m => m.type === "voice");
    const idx    = voices.findIndex(m => m.id === currentId);
    if (idx >= 0 && idx < voices.length - 1) setPlayingVoiceId(voices[idx + 1].id);
    else setPlayingVoiceId(null);
  }, [msgs]);

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
  const micBtnRef      = useRef(null);
  const startRecordingRef = useRef(null);

  // Collapse attach+camera when input focused or has text
  const showExtras = !inputFocused && !input.trim();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  // Warm mic permission on first touch so user is never asked mid-recording
  useEffect(() => {
    const warm = () => {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(s => s.getTracks().forEach(t => t.stop()))
        .catch(() => {});
    };
    document.addEventListener("touchstart", warm, { once:true, passive:true });
    document.addEventListener("mousedown",  warm, { once:true });
    return () => {
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("mousedown",  warm);
    };
  }, []);

  const send = useCallback(() => {
    if (!input.trim()) return;
    setMsgs(p => [...p, mkMsg("me", { text:input.trim(), ...(replyTo ? { replyTo } : {}) })]);
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

  const startLongPress = id => { lpTimer.current = setTimeout(() => { setReactionTarget(id); navigator.vibrate?.(30); }, 420); };
  const cancelLongPress = () => clearTimeout(lpTimer.current);
  const setReaction = (id, emoji) => { setMsgs(p => p.map(m => m.id===id?{...m,reaction:emoji}:m)); setReactionTarget(null); };

  const translateMsg = async (id, text) => {
    setReactionTarget(null);
    // If already translated, toggle visibility
    const msg = msgs.find(m => m.id === id);
    if (msg?.translatedText) {
      setMsgs(p => p.map(m => m.id===id ? {...m, showTranslated:!m.showTranslated} : m));
      return;
    }
    setMsgs(p => p.map(m => m.id===id ? {...m, translating:true} : m));
    try {
      const result = await fetchTranslation(text);
      setMsgs(p => p.map(m => m.id===id ? {...m, translating:false, translatedText:result, showTranslated:true} : m));
    } catch {
      setMsgs(p => p.map(m => m.id===id ? {...m, translating:false} : m));
    }
  };

  const handleImageFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type:"image", src:URL.createObjectURL(f) })]);
    e.target.value = ""; fakeReply();
  };
  const handleFileAttach = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setMsgs(p => [...p, mkMsg("me", { type:"file", fileName:f.name, fileSize:(f.size/1024).toFixed(1)+" KB" })]);
    e.target.value = ""; fakeReply();
  };

  /* ── Recording ── */
  // Keep a stable ref so the direct DOM listener always calls the latest version
  const startRecording = useCallback(e => {
    e.preventDefault(); // works because listener is attached with { passive: false }
    if (isRecording) return;
    setMicDenied(false);
    const touchId = e.touches?.[0]?.identifier;
    micAnchorX.current     = e.touches ? e.touches[0].clientX : e.clientX;
    cancelRef.current      = false;
    shouldSendRef.current  = false;
    recordStartRef.current = Date.now();
    setIsRecording(true); setRecCancelled(false); setRecordMs(0);
    timerRef.current = setInterval(() => setRecordMs(Date.now() - recordStartRef.current), 100);

    const onMove = ev => {
      ev.preventDefault(); // prevents iOS from treating this as a scroll gesture
      const t = touchId !== undefined
        ? Array.from(ev.changedTouches ?? []).find(t => t.identifier === touchId)
        : (ev.changedTouches?.[0] ?? ev.touches?.[0]);
      const x = t ? t.clientX : ev.clientX;
      const slid = x - micAnchorX.current < -60;
      cancelRef.current = slid;
      setRecCancelled(slid);
    };

    let ended = false;
    const onEnd = ev => {
      if (ended) return;
      // For touchend, confirm it's the same finger
      if (ev.changedTouches && touchId !== undefined) {
        const t = Array.from(ev.changedTouches).find(t => t.identifier === touchId);
        if (!t) return;
      }
      ended = true;
      document.removeEventListener("touchmove",   onMove);
      document.removeEventListener("touchend",    onEnd);
      document.removeEventListener("touchcancel", onEnd);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
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

    // passive: false on touchmove is critical — lets us call preventDefault()
    // which stops iOS treating the drag as a page scroll
    document.addEventListener("touchmove",   onMove, { passive: false });
    document.addEventListener("touchend",    onEnd,  { passive: true  });
    document.addEventListener("touchcancel", onEnd,  { passive: true  });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);

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
          const url = URL.createObjectURL(new Blob(chunksRef.current, { type:"audio/webm" }));
          setMsgs(p => [...p, mkMsg("me", { type:"voice", src:url, duration:dur })]);
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
  }, [isRecording]);

  // Keep ref current so the direct DOM listener always has the latest closure
  useEffect(() => { startRecordingRef.current = startRecording; }, [startRecording]);

  // Attach touchstart with { passive: false } directly — bypasses React's passive default
  // This makes e.preventDefault() actually work on iOS, stopping scroll intent
  useEffect(() => {
    const btn = micBtnRef.current;
    if (!btn) return;
    const handler = e => startRecordingRef.current(e);
    btn.addEventListener("touchstart", handler, { passive: false });
    return () => btn.removeEventListener("touchstart", handler);
  });

  const fmtTime = ms => { const s=Math.floor(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    cancelRef.current = true;
    if (mediaRef.current?.state !== "inactive") { try { mediaRef.current.stop(); } catch {} }
    mediaRef.current = null; chunksRef.current = [];
    setIsRecording(false); setRecCancelled(false); setRecordMs(0);
  };

  /* ── render message ── */
  const renderMsg = (msg, idx) => {
    const isMe    = msg.from === "me";
    const showAv  = !isMe && (idx===0 || msgs[idx-1].from !== "them");
    const showDate = idx===0 || msgs[idx-1].date !== msg.date;
    return (
      <div key={msg.id}>
        {showDate && (
          <div className="flex items-center justify-center my-3">
            <span className="bg-gray-200/80 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full">
              {formatDateLabel(msg.date)}
            </span>
          </div>
        )}
        <div className={`flex items-end gap-2 ${isMe?"justify-end":"justify-start"} mb-1`}>
          {!isMe && (
            <img src={contact.avatar} alt=""
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              style={{ visibility:showAv?"visible":"hidden" }} />
          )}
          <div style={{ display:"flex", flexDirection:"column", alignItems:isMe?"flex-end":"flex-start", maxWidth:"72vw" }}>
            {msg.replyTo && (
              <div className={`text-xs px-3 py-1.5 rounded-xl mb-1 border-l-2 border-[#032EA1] ${isMe?"bg-blue-50":"bg-white"} text-gray-400`}>
                ↩ {(msg.replyTo.text||"📷 Photo").slice(0,40)}
              </div>
            )}
            <div className="relative"
              onDoubleClick={() => setReactionTarget(msg.id)}
              onContextMenu={e => { e.preventDefault(); setReactionTarget(msg.id); }}
              onTouchStart={() => startLongPress(msg.id)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}>

              {msg.type==="image" && <ImageBubble src={msg.src} onView={setViewImg} />}
              {msg.type==="voice" && (
                <VoiceBubble
                  src={msg.src} duration={msg.duration} isMe={isMe}
                  msgId={msg.id}
                  playingId={playingVoiceId}
                  setPlayingId={setPlayingVoiceId}
                  onEnded={playNextVoice}
                />
              )}
              {msg.type==="file" && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background:isMe?"linear-gradient(135deg,#032EA1,#1a4fcc)":"white" }}>
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe?"text-white":"text-[#1A1A2E]"}`}>{msg.fileName}</p>
                    <p className={`text-xs ${isMe?"text-white/60":"text-gray-400"}`}>{msg.fileSize}</p>
                  </div>
                  <span className={`text-lg flex-shrink-0 ${isMe?"text-white/80":"text-[#032EA1]"}`}>⬇</span>
                </div>
              )}
              {(!msg.type||msg.type==="text") && (
                <div className={isMe?"bubble-me":"bubble-them"}
                  style={isMe?{ background:"linear-gradient(135deg,#032EA1,#1a4fcc)" }:{}}>
                  {msg.text}
                </div>
              )}

              {msg.reaction && (
                <span className="absolute -bottom-2 right-1 text-sm bg-white rounded-full px-1 shadow border border-gray-100">
                  {msg.reaction}
                </span>
              )}
              {reactionTarget===msg.id && (
                <div className="absolute z-20 bg-white rounded-2xl shadow-xl border border-gray-100"
                  style={{ bottom:"calc(100% + 8px)", [isMe?"right":"left"]:0, whiteSpace:"nowrap" }}>
                  {/* Emoji row */}
                  <div className="flex items-center gap-1 px-3 py-1.5">
                    {REACTIONS.map(em => (
                      <button key={em} onClick={ev => { ev.stopPropagation(); setReaction(msg.id,em); }}
                        className="text-xl hover:scale-125 transition-transform"
                        style={{ WebkitTapHighlightColor:"transparent" }}>{em}</button>
                    ))}
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <button onClick={ev => { ev.stopPropagation(); setReplyTo(msg); setReactionTarget(null); }}
                      className="text-gray-500 text-sm font-medium hover:text-[#032EA1]"
                      style={{ WebkitTapHighlightColor:"transparent" }}>↩</button>
                  </div>
                  {/* Translate button — only for text messages */}
                  {(!msg.type || msg.type==="text") && msg.text && (
                    <>
                      <div className="h-px bg-gray-100 mx-3" />
                      <button
                        onClick={ev => { ev.stopPropagation(); translateMsg(msg.id, msg.text); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#032EA1] font-medium hover:bg-gray-50 rounded-b-2xl"
                        style={{ WebkitTapHighlightColor:"transparent" }}>
                        <span>🌐</span>
                        <span>{msg.showTranslated ? "Show original" : isKhmer(msg.text) ? "Translate to English" : "បកប្រែជាខ្មែរ"}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Translated text */}
            {msg.translating && (
              <p className="text-[11px] text-gray-400 mt-1 italic px-1">Translating…</p>
            )}
            {msg.showTranslated && msg.translatedText && (
              <div className="mt-1 px-3 py-1.5 rounded-xl text-[12px] leading-relaxed"
                style={{ background: isMe ? "rgba(3,46,161,0.08)" : "rgba(0,0,0,0.05)",
                  color: "#4b5563", maxWidth: "100%" }}>
                <span className="text-[10px] font-semibold text-[#032EA1] mr-1">🌐</span>
                {msg.translatedText}
                <button onClick={() => setMsgs(p => p.map(m => m.id===msg.id?{...m,showTranslated:false}:m))}
                  className="ml-2 text-[10px] text-gray-400 underline"
                  style={{ WebkitTapHighlightColor:"transparent" }}>hide</button>
              </div>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-gray-400">{msg.time}</span>
              {isMe && <span className="text-[10px] text-[#032EA1]">{msg.status==="seen"?"✓✓":"✓"}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col"
      style={{ height:"100dvh", background:"#F0F2F5",
        WebkitUserSelect:"none", userSelect:"none", WebkitTouchCallout:"none" }}
      onClick={() => { setReactionTarget(null); setShowAttach(false); }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 pb-3 px-4 bg-white shadow-sm flex-shrink-0"
        style={{ paddingTop:"calc(env(safe-area-inset-top, 44px) + 8px)" }}>
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
          style={{ WebkitTapHighlightColor:"transparent" }}>
          <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={contact.avatar} alt={contact.nameEn} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A1A2E] text-sm">{contact.name}</p>
          <p className="text-xs" style={{ color:contact.online?"#22c55e":"#9ca3af" }}>
            {contact.online ? "🟢 Online" : contact.location}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
            style={{ WebkitTapHighlightColor:"transparent" }}>
            <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
            style={{ WebkitTapHighlightColor:"transparent" }}>
            <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.649v6.702a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ WebkitOverflowScrolling:"touch" }}>
        {msgs.map(renderMsg)}
        {typing && (
          <div className="flex items-end gap-2 justify-start">
            <img src={contact.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            <div className="bubble-them flex items-center gap-1 py-3.5 px-4" style={{ background:"white" }}>
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
            <p className="text-xs text-gray-500 truncate">{replyTo.text||"📷 Photo"}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 text-xl w-7 h-7 flex items-center justify-center"
            style={{ WebkitTapHighlightColor:"transparent" }}>✕</button>
        </div>
      )}

      {/* ── Mic denied ── */}
      {micDenied && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-t border-red-100 flex-shrink-0">
          <span className="text-lg">🎤</span>
          <p className="flex-1 text-xs text-red-500">Microphone access denied. Enable in Settings.</p>
          <button onClick={() => setMicDenied(false)} className="text-red-300 text-lg w-6 h-6 flex items-center justify-center"
            style={{ WebkitTapHighlightColor:"transparent" }}>✕</button>
        </div>
      )}

      {/* ── Recording bar ── */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 bg-white border-t border-gray-100 flex-shrink-0 z-30"
          style={{ height:"calc(env(safe-area-inset-bottom,0px) + 66px)",
            paddingBottom:"env(safe-area-inset-bottom,0px)" }}>

          {/* Delete button */}
          <button onClick={cancelRecording}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background:"#fee2e2", WebkitTapHighlightColor:"transparent" }}>
            <svg className="w-5 h-5" style={{ color:"#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Timer + slide hint */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background:recCancelled?"#9ca3af":"#ef4444",
                animation:recCancelled?"none":"pulse 1s infinite" }} />
            <span className="font-mono text-sm font-bold flex-shrink-0"
              style={{ color:recCancelled?"#9ca3af":"#ef4444" }}>{fmtTime(recordMs)}</span>
            <span className="text-xs truncate" style={{ color:recCancelled?"#ef4444":"#9ca3af" }}>
              {recCancelled ? "Release to cancel" : "◀ Slide to cancel"}
            </span>
          </div>

          {/* Mic pulse indicator */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background:recCancelled?"#f3f4f6":"linear-gradient(135deg,#032EA1,#8B0020)",
              animation:recCancelled?"none":"pulse 1.2s infinite", transition:"background .2s" }}>
            <svg className="w-5 h-5" style={{ color:recCancelled?"#9ca3af":"white" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      {!isRecording && (
        <div className="flex items-end gap-2 px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0"
          style={{ paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 10px)" }}
          onClick={e => e.stopPropagation()}>

          {/* Collapse chevron (shows when typing / focused) */}
          {!showExtras && (
            <button onClick={() => { setInputFocused(false); inputRef.current?.blur(); }}
              className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
              style={{ WebkitTapHighlightColor:"transparent" }}>
              <svg className="w-5 h-5 text-[#032EA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Attach */}
          {showExtras && (
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowAttach(v => !v)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${showAttach?"rotate-45":""}`}
                style={{ background:showAttach?"linear-gradient(135deg,#032EA1,#8B0020)":"#f3f4f6",
                  WebkitTapHighlightColor:"transparent" }}>
                <svg className={`w-5 h-5 ${showAttach?"text-white":"text-gray-500"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {showAttach && (
                <AttachTray
                  onFile={() => fileInputRef.current?.click()}
                  onLocation={() => setMsgs(p => [...p, mkMsg("me", { text:"📍 ភ្នំពេញ, Cambodia (12.3657° N, 104.9910° E)" })])}
                  onClose={() => setShowAttach(false)}
                />
              )}
            </div>
          )}

          {/* Camera */}
          {showExtras && (
            <button onClick={() => camInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
              style={{ WebkitTapHighlightColor:"transparent" }}>
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-3 py-2 gap-2 relative min-w-0">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
              placeholder={t("typeMessage")}
              className="flex-1 bg-transparent outline-none min-w-0"
              style={{ WebkitUserSelect:"text", userSelect:"text" }} />
          </div>

          {/* Send or Mic */}
          {input.trim() ? (
            <button onClick={send}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow active:scale-90 transition-transform"
              style={{ background:"linear-gradient(135deg,#032EA1,#8B0020)", WebkitTapHighlightColor:"transparent" }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              ref={micBtnRef}
              onMouseDown={startRecording}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow"
              style={{ background:"linear-gradient(135deg,#032EA1,#8B0020)",
                touchAction:"none", WebkitTapHighlightColor:"rgba(0,0,0,0)",
                WebkitUserSelect:"none", userSelect:"none", outline:"none" }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <div className="flex flex-col min-h-dvh pb-24" style={{ background:"var(--kh-cream)" }}>
      <div className="px-5 pb-4 bg-white shadow-sm"
        style={{ paddingTop:"calc(env(safe-area-inset-top, 44px) + 14px)" }}>
        <h1 className="text-2xl font-bold text-[#032EA1] mb-1">{t("chats")}</h1>
        <p className="text-gray-400 text-xs mb-3">{t("chatWith")}</p>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="flex-1 bg-transparent outline-none"
            style={{ WebkitUserSelect:"text", userSelect:"text" }} />
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Online</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {convos.filter(c => c.online).map(c => (
            <button key={c.id} onClick={() => setActive(c)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              style={{ WebkitTapHighlightColor:"transparent" }}>
              <div className="relative">
                <img src={c.avatar} alt={c.nameEn} className="rounded-full object-cover border-2 border-[#032EA1]"
                  style={{ width:52, height:52 }} />
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
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
            style={{ WebkitTapHighlightColor:"transparent" }}>
            <div className="relative flex-shrink-0">
              <img src={c.avatar} alt={c.nameEn} className="w-14 h-14 rounded-full object-cover" />
              {c.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-[#1A1A2E] ${c.unread?"font-bold":""}`}>{c.name}</span>
                <span className="text-xs text-gray-400">{c.time}</span>
              </div>
              <p className={`text-sm truncate mt-0.5 ${c.unread?"text-[#032EA1] font-medium":"text-gray-400"}`}>{c.lastMsg}</p>
            </div>
            {c.unread > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                style={{ background:"var(--kh-red)" }}>{c.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
