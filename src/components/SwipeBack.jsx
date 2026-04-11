import { useSwipeBack } from "../hooks/useSwipeBack";

/**
 * Drop this once inside <BrowserRouter>.
 * It renders the iOS-style left-edge pull indicator globally.
 */
export default function SwipeBack() {
  const { pullX, active } = useSwipeBack();

  if (!active && pullX === 0) return null;

  const progress  = Math.min(pullX, 1);           // 0 → 1
  const arrowSize = 14 + progress * 10;           // 14px → 24px
  const opacity   = 0.3 + progress * 0.7;

  return (
    <>
      {/* Dim overlay — very subtle, just like iOS */}
      <div
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{ background: `rgba(0,0,0,${progress * 0.08})` }}
      />

      {/* Left-edge pill */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[91] pointer-events-none flex items-center"
        style={{ transform: `translateY(-50%) translateX(${-8 + progress * 8}px)` }}
      >
        {/* Track line */}
        <div
          className="rounded-full"
          style={{
            width: 4,
            height: 48 + progress * 24,
            background: `rgba(3,46,161,${opacity})`,
            transition: active ? "none" : "all 0.25s ease",
          }}
        />

        {/* Arrow circle */}
        <div
          className="rounded-full flex items-center justify-center ml-1 shadow-lg"
          style={{
            width:  arrowSize * 2,
            height: arrowSize * 2,
            background: `rgba(3,46,161,${opacity})`,
            opacity,
            transition: active ? "none" : "all 0.25s ease",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            style={{ width: arrowSize, height: arrowSize }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </>
  );
}
