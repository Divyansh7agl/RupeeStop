// ─── Shared SVG icon library ────────────────────────────────────────────────
// All icons are 20×20 viewBox, stroked, pixel-clean at any size.
// Usage: <Icon name="shield" size={20} color="currentColor" />

const PATHS = {
  // Pipeline step icons
  user: (
    <>
      <circle cx="10" cy="6.5" r="3" strokeWidth="1.6" fill="none" />
      <path d="M2.5 19c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  brain: (
    <path
      d="M10 3C7.5 3 5.5 4.8 5.5 7c0 .8.3 1.6.7 2.2C5.1 9.8 4.5 10.9 4.5 12.2c0 1.5.9 2.8 2.2 3.4V17h6.6v-1.4c1.3-.6 2.2-1.9 2.2-3.4 0-1.3-.6-2.4-1.7-3C14.2 8.6 14.5 7.8 14.5 7c0-2.2-2-4-4.5-4z"
      strokeWidth="1.6" fill="none" strokeLinejoin="round"
    />
  ),
  wrench: (
    <path
      d="M15.5 4.5a3.5 3.5 0 0 0-4.9 4.9L4.5 15.5a1.5 1.5 0 0 0 2.1 2.1l6.1-6.1a3.5 3.5 0 0 0 4.9-4.9L15.5 8l-2-2 1.5-1.5z"
      strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round"
    />
  ),
  bolt: (
    <path
      d="M12 2L5 12h6l-1 6 7-10h-6l1-6z"
      strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round"
    />
  ),
  flame: (
    <path
      d="M10 2c0 0 4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5.5-2.5S7.5 9 8 10c0 0-1-5 2-8z"
      strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round"
    />
  ),
  scale: (
    <>
      <line x1="10" y1="3" x2="10" y2="17" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5" y1="17" x2="15" y2="17" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 8l-2 4h4l-2-4z" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M16 8l-2 4h4l-2-4z" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <line x1="4" y1="8" x2="10" y2="6" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="8" x2="10" y2="6" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="10" cy="10" r="7.5" strokeWidth="1.6" fill="none" />
      <polyline points="6.5,10 9,12.5 13.5,7.5" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Spinning loader (used when status = "running")
  loader: (
    <circle cx="10" cy="10" r="7" strokeWidth="2" fill="none"
      strokeDasharray="22 22" strokeLinecap="round"
    />
  ),

  // Advisor icons
  shield: (
    <path
      d="M10 2L3.5 5v5c0 4 2.9 7.7 6.5 8.8C13.6 17.7 16.5 14 16.5 10V5L10 2z"
      strokeWidth="1.6" fill="none" strokeLinejoin="round"
    />
  ),
  trendingUp: (
    <>
      <polyline points="3,14 8,9 12,13 17,6" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="13,6 17,6 17,10" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  barChart: (
    <>
      <rect x="3"  y="11" width="3.5" height="6"  rx="1" strokeWidth="1.6" fill="none" />
      <rect x="8.2" y="7"  width="3.5" height="10" rx="1" strokeWidth="1.6" fill="none" />
      <rect x="13.5" y="3"  width="3.5" height="14" rx="1" strokeWidth="1.6" fill="none" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10 2L1.5 17.5h17L10 2z" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <line x1="10" y1="9" x2="10" y2="13" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function Icon({ name, size = 20, color = "currentColor", className = "", strokeColor }) {
  const stroke = strokeColor || color;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, display: "block", flexShrink: 0 }}
      stroke={stroke}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
