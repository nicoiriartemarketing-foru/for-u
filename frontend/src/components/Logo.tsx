type LogoProps = {
  className?: string;
  compact?: boolean;
};

export default function Logo({ className, compact = false }: LogoProps) {
  return (
    <span className={className ? `foru-logo-lockup ${className}` : 'foru-logo-lockup'} aria-label="FOR U">
      <svg className="foru-logo-mark" viewBox="0 0 96 112" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="foru-u-gradient" x1="16" y1="12" x2="82" y2="98" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#D4AF37" />
            <stop offset="0.25" stopColor="#E8D5F5" />
            <stop offset="0.5" stopColor="#D5E8E0" />
            <stop offset="0.75" stopColor="#F5D5E0" />
            <stop offset="1" stopColor="#D4AF37" />
          </linearGradient>
          <radialGradient id="foru-pearl-gradient" cx="34%" cy="30%" r="68%">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.48" stopColor="#F8F6F3" />
            <stop offset="0.76" stopColor="#E8D5F5" />
            <stop offset="1" stopColor="#D5E8E0" />
          </radialGradient>
          <filter id="foru-logo-shadow" x="-40%" y="-30%" width="180%" height="180%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#D4AF37" floodOpacity="0.13" />
          </filter>
        </defs>

        <path
          d="M24 18v48c0 20 9 32 24 32s24-12 24-32V18"
          fill="none"
          stroke="url(#foru-u-gradient)"
          strokeWidth="17"
          strokeLinecap="round"
          filter="url(#foru-logo-shadow)"
        />
        <circle cx="24" cy="17" r="9" fill="url(#foru-pearl-gradient)" />
        <circle cx="72" cy="17" r="9" fill="url(#foru-pearl-gradient)" />
        <circle cx="37" cy="96" r="5" fill="url(#foru-pearl-gradient)" opacity="0.92" />
        <circle cx="59" cy="96" r="5" fill="url(#foru-pearl-gradient)" opacity="0.92" />
      </svg>

      {!compact && (
        <span className="foru-logo-wordmark">
          FOR <strong>U</strong>
        </span>
      )}
    </span>
  );
}
