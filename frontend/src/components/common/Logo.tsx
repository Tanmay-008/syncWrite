import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  to?: string;
}

export function Logo({
  className = "",
  size = 32,
  withText = true,
  to,
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="swCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="swPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="swSync" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <filter id="shadow" x="0" y="1" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Clean White Squircle Badge with subtle shadow */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="7.5"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.2"
          filter="url(#shadow)"
        />

        {/* Minimal Document Sheet */}
        <rect
          x="7"
          y="6"
          width="18"
          height="20"
          rx="3.5"
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="0.8"
        />

        {/* Document Text Lines */}
        <rect x="10" y="10" width="7" height="1.6" rx="0.8" fill="#cbd5e1" />
        <rect x="10" y="14" width="11" height="1.6" rx="0.8" fill="#cbd5e1" />
        <rect x="10" y="18" width="6" height="1.6" rx="0.8" fill="#cbd5e1" />

        {/* Dynamic Real-time Sync Arc */}
        <path
          d="M14 14.5 C 16.5 12, 19 18, 21.5 15.5"
          stroke="url(#swSync)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Collaborator 1 Cursor (Cyan) */}
        <path
          d="M12.5 8.5 L12.5 14.5 L14.2 13 L15.7 16 L16.9 15.3 L15.4 12.4 L17 12.4 Z"
          fill="url(#swCyan)"
        />

        {/* Collaborator 2 Cursor (Purple) */}
        <path
          d="M18.5 16.5 L18.5 22.5 L20.2 21 L21.7 24 L22.9 23.3 L21.4 20.4 L23 20.4 Z"
          fill="url(#swPurple)"
        />
      </svg>

      {withText && (
        <span className="text-base font-bold tracking-tight text-slate-900">
          Sync<span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Write</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
