/**
 * BizAnalytics Logo — minimalist circular icon
 * Abstract 'B' & 'A' integrated with a rising financial trend line and data nodes.
 * Flat vector, two-tone forest green on white, no text.
 */
export default function BizAnalyticsLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Outer circle */}
      <circle cx="18" cy="18" r="16.5" stroke="#1F4D36" strokeWidth="1.5" />

      {/* Rising trend line */}
      <path
        d="M8 26 L13 20 L18 22 L24 14 L28 10"
        stroke="#2ECC71"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Abstract 'B' (left side of trend) — vertical + two curves */}
      <path
        d="M11 24 L11 14"
        stroke="#1F4D36"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 14 Q11 12 13 12 Q15 12 15 14 Q15 16 13 17"
        stroke="#1F4D36"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11 17 Q11 19 13 19 Q15 19 15 17"
        stroke="#1F4D36"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Abstract 'A' (right side) — triangle */}
      <path
        d="M22 21 L25 14 L28 21"
        stroke="#1F4D36"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M23.5 18.5 L26.5 18.5"
        stroke="#1F4D36"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Data node points */}
      <circle cx="13" cy="20" r="1.5" fill="#2ECC71" />
      <circle cx="18" cy="22" r="1.5" fill="#2ECC71" />
      <circle cx="24" cy="14" r="1.5" fill="#2ECC71" />
      <circle cx="28" cy="10" r="1.5" fill="#2ECC71" />
    </svg>
  )
}