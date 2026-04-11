import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Pages where swipe-back should NOT trigger (root tabs — nothing to go back to)
const ROOT_PATHS = ["/discover", "/matches", "/events", "/messages", "/profile", "/"];

const EDGE_ZONE   = 32;   // px from left edge to start gesture
const THRESHOLD   = 80;   // px drag needed to trigger back
const MAX_ANGLE   = 30;   // degrees — ignore mostly-vertical swipes

export function useSwipeBack() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [pullX, setPullX]       = useState(0);   // 0–1 progress
  const [active, setActive]     = useState(false);
  const touch = useRef({ startX: 0, startY: 0, tracking: false });

  const isRoot = ROOT_PATHS.includes(location.pathname);

  useEffect(() => {
    if (isRoot) return;   // don't attach on root pages

    const onStart = (e) => {
      const t = e.touches[0];
      if (t.clientX > EDGE_ZONE) return;       // only from left edge
      touch.current = { startX: t.clientX, startY: t.clientY, tracking: true };
      setActive(true);
    };

    const onMove = (e) => {
      if (!touch.current.tracking) return;
      const t    = e.touches[0];
      const dx   = t.clientX - touch.current.startX;
      const dy   = t.clientY - touch.current.startY;
      const angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);

      // Cancel if swipe is too vertical
      if (dx < 0 || angle > MAX_ANGLE) {
        touch.current.tracking = false;
        setActive(false);
        setPullX(0);
        return;
      }

      setPullX(Math.min(dx / THRESHOLD, 1));

      // Prevent page scroll while swiping horizontally
      if (dx > 10) e.preventDefault();
    };

    const onEnd = () => {
      if (!touch.current.tracking) return;
      touch.current.tracking = false;
      const progress = pullX;
      setActive(false);
      setPullX(0);
      if (progress >= 1) navigate(-1);
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove",  onMove,  { passive: false });
    document.addEventListener("touchend",   onEnd,   { passive: true });

    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove",  onMove);
      document.removeEventListener("touchend",   onEnd);
    };
  }, [isRoot, navigate, pullX]);

  // Reset on route change
  useEffect(() => {
    setActive(false);
    setPullX(0);
  }, [location.pathname]);

  return { pullX, active, isRoot };
}
