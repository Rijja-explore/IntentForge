/* ──────────────────────────────────────────────────────────────────
   CircuitOverlay — SVG PCB trace pattern as a fixed background layer
   Uses violet (primary), orange (money), cyan (tech) color system
────────────────────────────────────────────────────────────────── */
export default function CircuitOverlay() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0.55) 20%, transparent 75%)',
        maskImage:
          'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0.55) 20%, transparent 75%)',
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.9 }}
      >
        <defs>
          {/* ── Fine grid substrate ── */}
          <pattern
            id="pcbGrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M48,0 L0,0 L0,48"
              fill="none"
              stroke="rgba(167,139,250,0.05)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* ── Circuit trace tile (192 × 192) ── */}
          <pattern
            id="pcbTraces"
            width="192"
            height="192"
            patternUnits="userSpaceOnUse"
          >
            {/* ─ Violet traces (primary routing) ─ */}
            {/* Top-left L-bend: right → down → right */}
            <path
              d="M0,48 H48 V96 H96"
              fill="none"
              stroke="rgba(167,139,250,0.14)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Top-right L-bend: vertical then horizontal */}
            <path
              d="M96,0 V48 H192"
              fill="none"
              stroke="rgba(167,139,250,0.11)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dashed short segment — inner detail */}
            <path
              d="M96,96 H144 V48"
              fill="none"
              stroke="rgba(167,139,250,0.08)"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeDasharray="5 4"
            />

            {/* ─ Orange traces (secondary / money routing) ─ */}
            <path
              d="M0,144 H48 V192"
              fill="none"
              stroke="rgba(251,146,60,0.13)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M144,144 H192"
              fill="none"
              stroke="rgba(251,146,60,0.1)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Dashed return path */}
            <path
              d="M48,144 V96"
              fill="none"
              stroke="rgba(251,146,60,0.07)"
              strokeWidth="0.75"
              strokeDasharray="4 5"
            />

            {/* ─ Cyan traces (tech / network routing) ─ */}
            <path
              d="M0,96 H48"
              fill="none"
              stroke="rgba(34,211,238,0.11)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M144,0 V48"
              fill="none"
              stroke="rgba(34,211,238,0.09)"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <path
              d="M144,96 V192"
              fill="none"
              stroke="rgba(34,211,238,0.08)"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeDasharray="6 5"
            />

            {/* ─ Via pads (connection points) ─ */}
            {/* Violet vias */}
            <circle cx="48" cy="48" r="3" fill="rgba(167,139,250,0.0)" />
            <circle cx="48" cy="48" r="2" fill="rgba(167,139,250,0.28)" />
            <circle cx="48" cy="48" r="5" fill="none" stroke="rgba(167,139,250,0.12)" strokeWidth="0.8" />

            <circle cx="96" cy="96" r="2" fill="rgba(167,139,250,0.24)" />
            <circle cx="96" cy="96" r="4.5" fill="none" stroke="rgba(167,139,250,0.1)" strokeWidth="0.8" />

            <circle cx="96" cy="48" r="1.8" fill="rgba(167,139,250,0.2)" />

            <circle cx="144" cy="48" r="1.8" fill="rgba(167,139,250,0.18)" />
            <circle cx="144" cy="48" r="4" fill="none" stroke="rgba(167,139,250,0.08)" strokeWidth="0.8" />

            {/* Orange vias */}
            <circle cx="48" cy="144" r="2" fill="rgba(251,146,60,0.25)" />
            <circle cx="48" cy="144" r="4.5" fill="none" stroke="rgba(251,146,60,0.11)" strokeWidth="0.8" />

            <circle cx="144" cy="144" r="2" fill="rgba(251,146,60,0.22)" />
            <circle cx="144" cy="144" r="4" fill="none" stroke="rgba(251,146,60,0.1)" strokeWidth="0.8" />

            {/* Cyan vias */}
            <circle cx="48" cy="96" r="1.8" fill="rgba(34,211,238,0.2)" />

            <circle cx="144" cy="96" r="1.8" fill="rgba(34,211,238,0.18)" />
            <circle cx="144" cy="96" r="4" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="0.8" />

            <circle cx="144" cy="0" r="1.5" fill="rgba(34,211,238,0.15)" />
          </pattern>
        </defs>

        {/* Grid substrate layer */}
        <rect width="100%" height="100%" fill="url(#pcbGrid)" />

        {/* Circuit traces layer */}
        <rect width="100%" height="100%" fill="url(#pcbTraces)" />
      </svg>
    </div>
  );
}
