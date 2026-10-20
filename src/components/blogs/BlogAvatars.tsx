export interface BlogAvatarProps {
  id: 'rudra' | 'mahmud' | 'david' | 'veronika';
  name: string;
}

/**
 * Rudra Gosh: Man with curly hair, glasses, beard, and patterned shirt
 */
export const AvatarRudra = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full object-cover">
    <defs>
      <linearGradient id="rudra-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
      <linearGradient id="rudra-skin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDDEC0" />
        <stop offset="100%" stopColor="#F1BF98" />
      </linearGradient>
      <linearGradient id="rudra-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0D9488" />
        <stop offset="100%" stopColor="#115E59" />
      </linearGradient>
    </defs>
    {/* Background */}
    <circle cx="24" cy="24" r="24" fill="url(#rudra-bg)" />

    {/* Shirt */}
    <path d="M 6,48 C 6,38 15,35 24,35 C 33,35 42,38 42,48 Z" fill="url(#rudra-shirt)" />
    <path d="M 21,35 L 24,41 L 27,35 Z" fill="#F1BF98" />

    {/* Neck */}
    <rect x="20.5" y="28" width="7" height="9" fill="#E8B087" rx="2" />

    {/* Head / Face */}
    <ellipse cx="24" cy="23" rx="10" ry="11.5" fill="url(#rudra-skin)" />

    {/* Curly Hair cluster behind & top */}
    <circle cx="15" cy="16" r="4.5" fill="#292524" />
    <circle cx="19" cy="13" r="5" fill="#1C1917" />
    <circle cx="24" cy="12" r="5.5" fill="#292524" />
    <circle cx="29" cy="13" r="5" fill="#1C1917" />
    <circle cx="33" cy="16" r="4.5" fill="#292524" />
    <circle cx="14" cy="21" r="3.5" fill="#1C1917" />
    <circle cx="34" cy="21" r="3.5" fill="#1C1917" />

    {/* Beard / Stubble */}
    <path d="M 16,24 C 16,32 20,34.5 24,34.5 C 28,34.5 32,32 32,24 C 30,28 27,29.5 24,29.5 C 21,29.5 18,28 16,24 Z" fill="#292524" opacity="0.85" />

    {/* Mustache */}
    <path d="M 21,27.5 Q 24,28.5 27,27.5" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" fill="none" />

    {/* Glasses */}
    <rect x="16.5" y="19" width="6" height="5.5" rx="2" fill="none" stroke="#1E293B" strokeWidth="1.2" />
    <rect x="25.5" y="19" width="6" height="5.5" rx="2" fill="none" stroke="#1E293B" strokeWidth="1.2" />
    <line x1="22.5" y1="21.5" x2="25.5" y2="21.5" stroke="#1E293B" strokeWidth="1.2" />

    {/* Eyes */}
    <circle cx="19.5" cy="21.5" r="1.1" fill="#1E293B" />
    <circle cx="28.5" cy="21.5" r="1.1" fill="#1E293B" />

    {/* Eyebrows */}
    <path d="M 17,17.5 Q 19.5,16.5 22,17.5" stroke="#1C1917" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M 26,17.5 Q 28.5,16.5 31,17.5" stroke="#1C1917" strokeWidth="1" strokeLinecap="round" fill="none" />

    {/* Smile */}
    <path d="M 22,29.5 Q 24,31.5 26,29.5" stroke="#991B1B" strokeWidth="1" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * Mahmud Niloy: Young man with dark hair, clean shaven, white collar
 */
export const AvatarMahmud = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full object-cover">
    <defs>
      <linearGradient id="mahmud-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="mahmud-skin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE0C8" />
        <stop offset="100%" stopColor="#F7C4A5" />
      </linearGradient>
    </defs>
    {/* Background */}
    <circle cx="24" cy="24" r="24" fill="url(#mahmud-bg)" />

    {/* Shirt */}
    <path d="M 6,48 C 6,37 15,34 24,34 C 33,34 42,37 42,48 Z" fill="#FFFFFF" />
    <path d="M 24,34 L 21,48 M 24,34 L 27,48" stroke="#E2E8F0" strokeWidth="1" />

    {/* Neck */}
    <rect x="20.5" y="27" width="7" height="9" fill="#E8B087" rx="2" />

    {/* Head / Face */}
    <ellipse cx="24" cy="22" rx="9.5" ry="11" fill="url(#mahmud-skin)" />

    {/* Hair: neat stylish dark hair swept up and to the side */}
    <path
      d="M 14,21 C 13,15 17,11 23,10 C 29,9 34,12 34,18 C 34,20 32,21 32,21 C 32,17 28,14 23,14 C 18,14 15,18 14,21 Z"
      fill="#18181B"
    />
    <path
      d="M 15,17 C 17,11 25,10 32,12 C 34,14 34,16 33,18 C 31,14 26,12 21,13 C 17,14 15,16 15,17 Z"
      fill="#27272A"
    />

    {/* Eyebrows */}
    <path d="M 17,18.5 Q 19.5,17.5 22,18.2" stroke="#18181B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M 26,18.2 Q 28.5,17.5 31,18.5" stroke="#18181B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

    {/* Eyes */}
    <circle cx="19.5" cy="21.5" r="1.3" fill="#18181B" />
    <circle cx="28.5" cy="21.5" r="1.3" fill="#18181B" />
    <circle cx="19.8" cy="21.2" r="0.4" fill="#FFFFFF" />
    <circle cx="28.8" cy="21.2" r="0.4" fill="#FFFFFF" />

    {/* Nose */}
    <path d="M 24,22 L 23.5,24.5 L 24.5,24.5" stroke="#D99B77" strokeWidth="0.9" strokeLinecap="round" fill="none" />

    {/* Friendly Smile */}
    <path d="M 21.5,27 Q 24,29.5 26.5,27" stroke="#BE123C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * David Henricks: 3D Memoji style face with rounded warm features
 */
export const AvatarDavid = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full object-cover">
    <defs>
      <linearGradient id="david-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <radialGradient id="david-face-3d" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFF1E0" />
        <stop offset="50%" stopColor="#FCD5B5" />
        <stop offset="100%" stopColor="#E2A67E" />
      </radialGradient>
      <linearGradient id="david-hair" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#592507" />
      </linearGradient>
    </defs>
    {/* Background */}
    <circle cx="24" cy="24" r="24" fill="url(#david-bg)" />

    {/* Shirt */}
    <path d="M 7,48 C 7,38 15,35 24,35 C 33,35 41,38 41,48 Z" fill="#3B82F6" />

    {/* 3D Round Face */}
    <ellipse cx="24" cy="23" rx="11" ry="12" fill="url(#david-face-3d)" />

    {/* 3D Ears */}
    <ellipse cx="12.5" cy="23" rx="2.5" ry="3.5" fill="#FCD5B5" />
    <ellipse cx="35.5" cy="23" rx="2.5" ry="3.5" fill="#FCD5B5" />

    {/* Brown 3D styled hair with volume */}
    <path
      d="M 13,20 C 12,13 17,9 24,9 C 31,9 36,13 35,20 C 33,16 30,13 24,13 C 18,13 15,16 13,20 Z"
      fill="url(#david-hair)"
    />
    <ellipse cx="20" cy="11.5" rx="5" ry="3" fill="#B45309" />
    <ellipse cx="27" cy="12" rx="6" ry="3.5" fill="#B45309" />

    {/* Expressive 3D Eyes */}
    <ellipse cx="19.5" cy="21.5" rx="2" ry="2.2" fill="#FFFFFF" />
    <circle cx="19.8" cy="21.5" r="1.3" fill="#451A03" />
    <circle cx="20.2" cy="21" r="0.5" fill="#FFFFFF" />

    <ellipse cx="28.5" cy="21.5" rx="2" ry="2.2" fill="#FFFFFF" />
    <circle cx="28.2" cy="21.5" r="1.3" fill="#451A03" />
    <circle cx="28.6" cy="21" r="0.5" fill="#FFFFFF" />

    {/* Eyebrows */}
    <path d="M 17,17.5 Q 19.5,15.5 22,17" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M 26,17 Q 28.5,15.5 31,17.5" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Cheeks Blush */}
    <circle cx="16" cy="24.5" r="2.5" fill="#F43F5E" opacity="0.25" filter="blur(1px)" />
    <circle cx="32" cy="24.5" r="2.5" fill="#F43F5E" opacity="0.25" filter="blur(1px)" />

    {/* 3D Button Nose */}
    <ellipse cx="24" cy="24" rx="1.5" ry="1.2" fill="#E2A67E" />

    {/* Big Happy 3D Smile */}
    <path
      d="M 20,26.5 Q 24,32 28,26.5 Z"
      fill="#FFFFFF"
      stroke="#B91C1C"
      strokeWidth="1"
    />
  </svg>
);

/**
 * Veronika Belova: Person in purple turtleneck sweater
 */
export const AvatarVeronika = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full object-cover">
    <defs>
      <linearGradient id="veronika-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F3E8FF" />
        <stop offset="100%" stopColor="#E9D5FF" />
      </linearGradient>
      <linearGradient id="veronika-turtleneck" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#581C87" />
        <stop offset="100%" stopColor="#3B0764" />
      </linearGradient>
      <linearGradient id="veronika-skin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="100%" stopColor="#FDBA74" />
      </linearGradient>
    </defs>
    {/* Background */}
    <circle cx="24" cy="24" r="24" fill="url(#veronika-bg)" />

    {/* Purple Turtleneck body */}
    <path d="M 6,48 C 6,36 14,33 24,33 C 34,33 42,36 42,48 Z" fill="url(#veronika-turtleneck)" />

    {/* Turtleneck high ribbed collar */}
    <rect x="18" y="27" width="12" height="8" rx="3.5" fill="#4A166E" />
    <line x1="20" y1="28" x2="20" y2="34" stroke="#6B21A8" strokeWidth="0.8" />
    <line x1="24" y1="28" x2="24" y2="34" stroke="#6B21A8" strokeWidth="0.8" />
    <line x1="28" y1="28" x2="28" y2="34" stroke="#6B21A8" strokeWidth="0.8" />

    {/* Head / Face */}
    <ellipse cx="24" cy="20.5" rx="9" ry="10.5" fill="url(#veronika-skin)" />

    {/* Dark neat short hair */}
    <path
      d="M 15,19 C 14,13 18,9 24,9 C 30,9 33,12 33,17 C 33,19 32,21 32,21 C 31,16 27,13 23,13 C 18,13 16,16 15,19 Z"
      fill="#1E1B4B"
    />

    {/* Eyebrows */}
    <path d="M 18,17 Q 20,16 22,17" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M 26,17 Q 28,16 30,17" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" fill="none" />

    {/* Eyes */}
    <circle cx="20" cy="19.5" r="1.2" fill="#1E1B4B" />
    <circle cx="28" cy="19.5" r="1.2" fill="#1E1B4B" />
    <circle cx="20.3" cy="19.2" r="0.4" fill="#FFFFFF" />
    <circle cx="28.3" cy="19.2" r="0.4" fill="#FFFFFF" />

    {/* Smile */}
    <path d="M 22,24 Q 24,25.5 26,24" stroke="#BE185D" strokeWidth="1" strokeLinecap="round" fill="none" />
  </svg>
);

export const BlogAvatar = ({ id, name }: BlogAvatarProps) => {
  return (
    <div
      className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-black/5 shadow-sm"
      title={name}
      aria-label={name}
    >
      {id === 'rudra' && <AvatarRudra />}
      {id === 'mahmud' && <AvatarMahmud />}
      {id === 'david' && <AvatarDavid />}
      {id === 'veronika' && <AvatarVeronika />}
    </div>
  );
};
