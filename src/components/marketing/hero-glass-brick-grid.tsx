/**
 * Soft glass brick grid — barely-there texture, not a dominant pattern.
 */
export function HeroGlassBrickGrid() {
  const cell = 64;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.38]"
      aria-hidden
    >
      {/* Gentle tile shading */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(219,234,254,0.06) 100%)
          `,
          backgroundSize: `${cell}px ${cell}px`,
        }}
      />
      {/* Soft white seams */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.55) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.55) 1px, transparent 1px)
          `,
          backgroundSize: `${cell}px ${cell}px`,
        }}
      />
      {/* Light depth — muted, no strong purple lines */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, transparent calc(100% - 1px), rgba(34,119,255,0.08) 100%),
            linear-gradient(to bottom, transparent calc(100% - 1px), rgba(34,119,255,0.06) 100%)
          `,
          backgroundSize: `${cell}px ${cell}px`,
        }}
      />
      {/* Fade grid under hero copy so text stays clear */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_28%,rgba(255,255,255,0.75)_0%,transparent_72%)]" />
      {/* Slightly stronger only toward bottom blue */}
      <div
        className="absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_55%,black_100%)]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: `${cell}px ${cell}px`,
        }}
      />
    </div>
  );
}
