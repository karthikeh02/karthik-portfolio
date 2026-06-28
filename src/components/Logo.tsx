/** Compact brand mark — a stylised "K" node, echoing the favicon. */
export default function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0d0d14" stroke="rgba(255,255,255,0.08)" />
      <path
        d="M20 14v36M20 32l18-18M20 32l18 18"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
