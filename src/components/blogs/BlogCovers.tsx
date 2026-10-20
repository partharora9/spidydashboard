export interface BlogCoverProps {
  type: 'wires' | 'wave' | 'ribbons' | 'droplet' | 'sphere' | 'golden';
}

/**
 * Cover 1: Blue and orange tangled wires on a light gray background
 */
export const CoverWires = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#F3F4F7]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <filter id="wire-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.16" />
        </filter>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
        <linearGradient id="blue-wire-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="blue-wire-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="60%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="orange-wire-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="orange-wire-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        <radialGradient id="wires-bg-glow" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F3F4F7" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </radialGradient>
      </defs>

      {/* Background with subtle warm gradient */}
      <rect width="380" height="280" fill="url(#wires-bg-glow)" />

      {/* Background ambient wire shadows */}
      <g opacity="0.4" filter="blur(8px)">
        <path d="M -30,60 C 90,-20 180,140 320,40 C 370,10 400,80 420,120" fill="none" stroke="#94A3B8" strokeWidth="8" />
        <path d="M 40,290 C 120,180 200,220 310,120 C 360,80 390,20 410,-10" fill="none" stroke="#CBD5E1" strokeWidth="6" />
      </g>

      {/* Orange Wires Group (Base layer) */}
      <g filter="url(#soft-shadow)">
        <path d="M -20,20 C 70,10 150,110 240,60 C 310,20 350,120 410,140" fill="none" stroke="url(#orange-wire-1)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 10,260 C 90,220 120,130 200,100 C 270,70 330,190 400,160" fill="none" stroke="url(#orange-wire-2)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 60,-20 C 130,50 160,180 260,190 C 330,200 370,150 420,240" fill="none" stroke="url(#orange-wire-1)" strokeWidth="4" strokeLinecap="round" />
        <path d="M -10,140 C 80,160 170,40 280,110 C 340,150 370,80 410,50" fill="none" stroke="url(#orange-wire-2)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 120,-10 C 180,90 220,160 300,180 C 350,190 380,120 420,100" fill="none" stroke="url(#orange-wire-1)" strokeWidth="3" strokeLinecap="round" />
        <path d="M -30,220 C 60,190 140,240 250,150 C 310,100 380,210 430,190" fill="none" stroke="url(#orange-wire-2)" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Blue Wires Group (Dense tangled cluster) */}
      <g filter="url(#wire-shadow)">
        <path d="M -10,80 C 60,20 130,150 210,110 C 290,70 340,220 410,200" fill="none" stroke="url(#blue-wire-1)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 0,110 C 70,50 140,180 220,140 C 300,100 350,250 420,230" fill="none" stroke="url(#blue-wire-2)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 20,40 C 100,140 180,30 270,130 C 330,200 380,110 410,70" fill="none" stroke="url(#blue-wire-1)" strokeWidth="4" strokeLinecap="round" />
        <path d="M -20,170 C 80,120 160,210 250,120 C 320,50 360,180 400,240" fill="none" stroke="url(#blue-wire-2)" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M 30,290 C 80,180 150,110 230,160 C 310,210 360,90 410,40" fill="none" stroke="url(#blue-wire-1)" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M 70,-20 C 90,80 170,140 240,80 C 310,20 370,130 420,170" fill="none" stroke="url(#blue-wire-2)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M -10,30 C 110,80 190,160 280,70 C 340,10 390,140 430,160" fill="none" stroke="url(#blue-wire-1)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 40,240 C 110,150 200,180 290,90 C 340,40 390,120 420,180" fill="none" stroke="url(#blue-wire-2)" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Intricate crossing strands & loops */}
      <g filter="url(#soft-shadow)">
        <path d="M 140,-10 C 180,60 210,120 280,140 C 330,150 370,90 410,30" fill="none" stroke="url(#orange-wire-1)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M -15,190 C 50,110 120,90 190,150 C 260,210 340,130 405,110" fill="none" stroke="url(#blue-wire-1)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 100,290 C 160,200 230,170 300,110 C 350,70 380,30 420,10" fill="none" stroke="url(#orange-wire-2)" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M -20,240 C 70,260 140,170 230,220 C 310,270 370,160 415,130" fill="none" stroke="url(#blue-wire-2)" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* Glossy top highlights on selected wires */}
      <g opacity="0.6">
        <path d="M -10,79 C 60,19 130,149 210,109 C 290,69 340,219 410,199" fill="none" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 20,39 C 100,139 180,29 270,129 C 330,199 380,109 410,69" fill="none" stroke="#BFDBFE" strokeWidth="1" strokeLinecap="round" />
        <path d="M -20,19 C 70,9 150,109 240,59 C 310,19 350,119 410,139" fill="none" stroke="#FEF3C7" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

/**
 * Cover 2: Soft teal-to-cream swirl with a purple-pink edge, glassy curved wave
 */
export const CoverWave = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#2D1B4E]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <linearGradient id="wave-base-diag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="25%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#F5F3FF" />
          <stop offset="75%" stopColor="#99F6E4" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
        <radialGradient id="wave-cream-glow" cx="55%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#DDD6FE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="purple-rim" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#581C87" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#831843" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#312E81" stopOpacity="0.1" />
        </linearGradient>
        <filter id="swirl-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Base gradient background */}
      <rect width="380" height="280" fill="url(#wave-base-diag)" />

      {/* Top-left dark purple/violet atmosphere */}
      <path
        d="M -50,-50 L 220,-50 C 140,80 80,180 -50,200 Z"
        fill="#3B0764"
        opacity="0.85"
        filter="url(#swirl-blur)"
      />

      {/* Deep teal / cyan ambient curve on bottom-left */}
      <path
        d="M -30,160 C 60,140 140,190 180,300 L -30,300 Z"
        fill="#14B8A6"
        opacity="0.75"
        filter="url(#swirl-blur)"
      />

      {/* Broad soft cream/white diagonal swirl glow */}
      <ellipse
        cx="200"
        cy="130"
        rx="220"
        ry="85"
        transform="rotate(-32 200 130)"
        fill="url(#wave-cream-glow)"
        filter="url(#swirl-blur)"
      />

      {/* Glassy curved wave 1 (Primary luminous curve) */}
      <path
        d="M -40,40 C 80,80 180,110 270,70 C 330,40 370,10 420,-20 L 420,60 C 350,110 280,160 170,160 C 70,160 -10,110 -40,80 Z"
        fill="#FFFFFF"
        opacity="0.65"
        filter="url(#wave-glow)"
      />

      {/* Secondary pearlescent ribbon sweep */}
      <path
        d="M -30,120 C 90,120 180,170 280,150 C 340,135 390,90 420,50 L 420,110 C 370,160 300,210 200,210 C 90,210 20,170 -30,150 Z"
        fill="#E0E7FF"
        opacity="0.5"
        filter="url(#wave-glow)"
      />

      {/* Fine sharp specular edge along the crest */}
      <path
        d="M -20,55 C 90,85 190,115 280,80 C 340,55 385,20 420,-5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 30,130 C 130,140 220,175 310,155 C 360,140 395,110 420,80"
        fill="none"
        stroke="#CCFBF1"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Bottom right purple-pink edge */}
      <path
        d="M 220,300 C 260,220 320,180 420,160 L 420,300 Z"
        fill="url(#purple-rim)"
        opacity="0.9"
        filter="url(#swirl-blur)"
      />

      {/* Ambient glass sheen */}
      <circle cx="210" cy="110" r="140" fill="#FFFFFF" opacity="0.25" filter="url(#swirl-blur)" />
    </svg>
  </div>
);

/**
 * Cover 3: Light blue iridescent glass ribbons/waves with blue-purple highlights
 */
export const CoverRibbons = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#EBF4FF]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <linearGradient id="ribbon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="50%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="glass-ribbon-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#E0E7FF" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="glass-ribbon-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.8" />
        </linearGradient>
        <filter id="ribbon-depth" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-2" dy="8" stdDeviation="8" floodColor="#1E3A8A" floodOpacity="0.15" />
        </filter>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Base Background */}
      <rect width="380" height="280" fill="url(#ribbon-bg)" />

      {/* Soft background reflections */}
      <ellipse cx="280" cy="80" rx="160" ry="80" fill="#C7D2FE" opacity="0.4" filter="url(#soft-glow)" />
      <ellipse cx="90" cy="220" rx="140" ry="70" fill="#93C5FD" opacity="0.5" filter="url(#soft-glow)" />

      {/* Wave Ribbon 1 (Furthest Back) */}
      <g filter="url(#ribbon-depth)">
        <path
          d="M -30,60 C 60,100 160,20 260,70 C 340,110 390,80 430,40 L 430,95 C 380,140 320,165 240,120 C 150,70 60,145 -30,115 Z"
          fill="url(#glass-ribbon-1)"
          opacity="0.85"
        />
        <path
          d="M -30,60 C 60,100 160,20 260,70 C 340,110 390,80 430,40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Wave Ribbon 2 (Mid-ground parallel undulating glass) */}
      <g filter="url(#ribbon-depth)">
        <path
          d="M -30,110 C 70,160 170,70 270,125 C 350,170 390,135 430,95 L 430,155 C 380,200 330,225 250,180 C 160,130 65,205 -30,170 Z"
          fill="url(#glass-ribbon-2)"
          opacity="0.9"
        />
        <path
          d="M -30,110 C 70,160 170,70 270,125 C 350,170 390,135 430,95"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      {/* Wave Ribbon 3 (Foreground undulating crest) */}
      <g filter="url(#ribbon-depth)">
        <path
          d="M -30,165 C 80,220 180,125 280,185 C 350,230 390,195 430,155 L 430,220 C 380,265 330,285 260,245 C 170,195 75,265 -30,230 Z"
          fill="url(#glass-ribbon-1)"
          opacity="0.92"
        />
        <path
          d="M -30,165 C 80,220 180,125 280,185 C 350,230 390,195 430,155"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      {/* Glass refraction caustics and highlights */}
      <path
        d="M 50,170 C 120,200 170,140 230,160 C 290,180 340,210 390,185"
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <circle cx="270" cy="125" r="3" fill="#FFFFFF" filter="url(#soft-glow)" />
      <circle cx="160" cy="80" r="2" fill="#FFFFFF" filter="url(#soft-glow)" />
    </svg>
  </div>
);

/**
 * Cover 4: Pale aqua background with a lavender droplet pair and a mint liquid pour over a white curved disc
 */
export const CoverDroplet = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#D8F2EE]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <linearGradient id="aqua-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E6F7F4" />
          <stop offset="50%" stopColor="#D4F0EB" />
          <stop offset="100%" stopColor="#BFE7E0" />
        </linearGradient>
        <radialGradient id="disc-top" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F0FAF8" />
          <stop offset="100%" stopColor="#D5EFEA" />
        </radialGradient>
        <linearGradient id="lavender-glass" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="40%" stopColor="#C4B5FD" />
          <stop offset="80%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="mint-pour" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="45%" stopColor="#A7F3D0" />
          <stop offset="80%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="droplet-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="12" stdDeviation="10" floodColor="#0F766E" floodOpacity="0.2" />
        </filter>
        <filter id="soft-disc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#115E59" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Aqua Base */}
      <rect width="380" height="280" fill="url(#aqua-bg)" />

      {/* Floating background ambient mint droplets */}
      <circle cx="80" cy="60" r="14" fill="#A7F3D0" opacity="0.4" filter="blur(4px)" />
      <circle cx="330" cy="190" r="18" fill="#DDD6FE" opacity="0.45" filter="blur(6px)" />

      {/* Large curved white/mint disc platform */}
      <g filter="url(#soft-disc-shadow)">
        <ellipse cx="230" cy="200" rx="140" ry="46" fill="#A5DDD4" />
        <ellipse cx="230" cy="194" rx="138" ry="44" fill="url(#disc-top)" />
      </g>

      {/* Curved organic disc rim swoosh (front edge) */}
      <path
        d="M 94,196 C 130,225 210,240 310,220 C 350,210 368,198 368,198 C 368,198 335,232 230,240 C 135,246 94,196 94,196 Z"
        fill="#83CFC4"
        opacity="0.6"
      />

      {/* Lavender Droplet Pair (Hourglass 3D style) */}
      <g filter="url(#droplet-shadow)">
        {/* Bottom Bulb */}
        <ellipse cx="210" cy="155" rx="26" ry="24" fill="url(#lavender-glass)" />
        {/* Top Bulb */}
        <ellipse cx="210" cy="112" rx="20" ry="21" fill="url(#lavender-glass)" />
        {/* Waist connection */}
        <path d="M 197,118 C 204,130 204,138 193,148 L 227,148 C 216,138 216,130 223,118 Z" fill="url(#lavender-glass)" />
        {/* Specular highlights on lavender glass */}
        <ellipse cx="204" cy="106" rx="6" ry="10" transform="rotate(-25 204 106)" fill="#FFFFFF" opacity="0.75" />
        <ellipse cx="203" cy="148" rx="8" ry="12" transform="rotate(-25 203 148)" fill="#FFFFFF" opacity="0.65" />
      </g>

      {/* Mint Liquid Pour / Droplet column on right */}
      <g filter="url(#droplet-shadow)">
        <path
          d="M 270,30 C 270,90 262,120 262,150 C 262,175 285,185 285,185 C 285,185 250,188 245,170 C 242,150 252,100 252,30 Z"
          fill="url(#mint-pour)"
        />
        {/* Specular gloss on the mint pour */}
        <path
          d="M 264,40 C 264,90 257,120 257,150"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* Small floating droplet */}
      <circle cx="210" cy="74" r="6" fill="#C4B5FD" filter="url(#droplet-shadow)" />
      <circle cx="208" cy="72" r="2" fill="#FFFFFF" opacity="0.8" />
    </svg>
  </div>
);

/**
 * Cover 5: Lavender-blue gradient with a large pastel sphere, purple and gold glow bottom-right
 */
export const CoverSphere = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#E2E8FF]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <linearGradient id="sphere-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="50%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <radialGradient id="large-sphere-mat" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E0E7FE" />
          <stop offset="70%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </radialGradient>
        <radialGradient id="gold-glow" cx="85%" cy="85%" r="45%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
          <stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <filter id="big-sphere-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="-4" dy="16" stdDeviation="16" floodColor="#3730A3" floodOpacity="0.22" />
        </filter>
        <filter id="soft-glow-sphere" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="380" height="280" fill="url(#sphere-bg)" />

      {/* Ambient background soft glowing blobs */}
      <circle cx="100" cy="100" r="90" fill="#DDD6FE" opacity="0.5" filter="url(#soft-glow-sphere)" />
      <circle cx="280" cy="60" r="70" fill="#93C5FD" opacity="0.4" filter="url(#soft-glow-sphere)" />

      {/* Orbiting ring / sweep behind sphere */}
      <ellipse
        cx="190"
        cy="150"
        rx="135"
        ry="45"
        transform="rotate(-20 190 150)"
        fill="none"
        stroke="#C7D2FE"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      />

      {/* Primary Large Pastel Sphere in Center */}
      <g filter="url(#big-sphere-shadow)">
        <circle cx="190" cy="140" r="64" fill="url(#large-sphere-mat)" />
        {/* Soft specular light crest */}
        <ellipse cx="172" cy="122" rx="20" ry="14" transform="rotate(-25 172 122)" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Smaller floating satellite spheres */}
      <circle cx="110" cy="85" r="14" fill="url(#large-sphere-mat)" filter="url(#big-sphere-shadow)" />
      <circle cx="275" cy="105" r="9" fill="url(#large-sphere-mat)" filter="url(#big-sphere-shadow)" />
      <circle cx="130" cy="195" r="8" fill="url(#large-sphere-mat)" opacity="0.8" />

      {/* Warm Golden & Purple Glow at Bottom-Right Corner */}
      <rect width="380" height="280" fill="url(#gold-glow)" />

      {/* Ambient golden accent orb */}
      <circle cx="320" cy="230" r="32" fill="#FDE68A" opacity="0.45" filter="url(#soft-glow-sphere)" />
    </svg>
  </div>
);

/**
 * Cover 6: Light blue-white background with a glass sphere and a golden ribbon swoosh
 */
export const CoverGolden = () => (
  <div className="w-full h-full relative overflow-hidden bg-[#F0F6FC]">
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
    >
      <defs>
        <linearGradient id="gold-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F0F7FF" />
          <stop offset="100%" stopColor="#E0EEFD" />
        </linearGradient>
        <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="30%" stopColor="#FBBF24" />
          <stop offset="65%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="glass-sphere-body" cx="35%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#93C5FD" stopOpacity="0.25" />
          <stop offset="90%" stopColor="#60A5FA" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.6" />
        </radialGradient>
        <filter id="glass-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#1E3A8A" floodOpacity="0.18" />
        </filter>
        <filter id="gold-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="-2" dy="8" stdDeviation="8" floodColor="#78350F" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Light clean background */}
      <rect width="380" height="280" fill="url(#gold-bg)" />

      {/* Golden ribbon back part (behind the sphere) */}
      <g filter="url(#gold-shadow)">
        <path
          d="M 60,200 C 100,160 140,110 200,90 C 260,70 320,100 350,70 L 370,85 C 330,125 260,95 190,115 C 130,135 90,195 60,225 Z"
          fill="url(#gold-metallic)"
        />
      </g>

      {/* Glass/Crystal Refractive Sphere */}
      <g filter="url(#glass-shadow)">
        {/* Core sphere */}
        <circle cx="210" cy="140" r="54" fill="url(#glass-sphere-body)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Internal refraction ring */}
        <ellipse cx="205" cy="145" rx="36" ry="40" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.7" />
        {/* Sharp specular reflections */}
        <ellipse cx="192" cy="120" rx="14" ry="9" transform="rotate(-30 192 120)" fill="#FFFFFF" opacity="0.85" />
        <circle cx="230" cy="165" r="5" fill="#FFFFFF" opacity="0.5" />
      </g>

      {/* Golden ribbon front part (wrapping over the front of the sphere) */}
      <g filter="url(#gold-shadow)">
        <path
          d="M 120,240 C 160,210 200,175 250,160 C 300,145 360,185 410,140 L 415,160 C 365,210 295,170 240,185 C 190,200 150,240 100,265 Z"
          fill="url(#gold-metallic)"
        />
        {/* Golden crest highlight */}
        <path
          d="M 120,240 C 160,210 200,175 250,160 C 300,145 360,185 410,140"
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      {/* Floating miniature golden and glass beads */}
      <circle cx="120" cy="90" r="7" fill="url(#gold-metallic)" filter="url(#gold-shadow)" />
      <circle cx="310" cy="210" r="9" fill="url(#gold-metallic)" filter="url(#gold-shadow)" />
      <circle cx="320" cy="50" r="12" fill="url(#glass-sphere-body)" opacity="0.75" />
    </svg>
  </div>
);

export const BlogCover = ({ type }: BlogCoverProps) => {
  switch (type) {
    case 'wires':
      return <CoverWires />;
    case 'wave':
      return <CoverWave />;
    case 'ribbons':
      return <CoverRibbons />;
    case 'droplet':
      return <CoverDroplet />;
    case 'sphere':
      return <CoverSphere />;
    case 'golden':
      return <CoverGolden />;
    default:
      return <CoverWires />;
  }
};
