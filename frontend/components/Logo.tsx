interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 36, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG Logo Mark */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle — green */}
        <circle cx="20" cy="20" r="18" fill="white" stroke="#138808" strokeWidth="3.5"/>

        {/* Saffron top arc */}
        <path d="M 4.5 16 A 16 16 0 0 1 35.5 16" stroke="#FF9933" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

        {/* Ashoka Chakra — tiny in center */}
        <circle cx="20" cy="20" r="5" fill="none" stroke="#000080" strokeWidth="1.2"/>
        <circle cx="20" cy="20" r="1.2" fill="#000080"/>
        {/* 12 spokes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 20 + 1.4 * Math.cos(angle);
          const y1 = 20 + 1.4 * Math.sin(angle);
          const x2 = 20 + 4.6 * Math.cos(angle);
          const y2 = 20 + 4.6 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.8"/>;
        })}

        {/* Magnifying glass handle */}
        <line x1="33" y1="33" x2="44" y2="44" stroke="#FF9933" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="15.5" fill="none" stroke="#138808" strokeWidth="3"/>
      </svg>

      {/* Brand Name */}
      {showText && (
        <span className="font-black text-xl tracking-tight leading-none">
          <span className="text-gray-900">Yojana</span><span className="text-green-600">Khoj</span>
        </span>
      )}
    </div>
  );
}
