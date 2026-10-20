export const TechnicalGridPattern = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-[0.4]"
    >
      {/* Soft radial blue glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(221, 247, 255, 0.8) 0%, rgba(79, 143, 247, 0.08) 50%, transparent 80%)',
        }}
      />

      {/* Subtle technical coordinate grid */}
      <svg
        className="absolute inset-0 w-full h-full stroke-black/[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="tech-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="1" />
            <circle cx="48" cy="48" r="1.5" fill="rgba(79, 143, 247, 0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>
    </div>
  );
};
