import { useEffect, useRef } from 'react';

/**
 * Ambient background for the deep blue glass theme.
 *
 * Palette from design tokens:
 *   bg.primary   #1a1a2e  — body base
 *   bg.secondary #16213e  — mid-tone
 *   bg.tertiary  #0f3460  — deepest blue
 *   accent       #93c5fd  — highlight glow
 *
 * Layers (bottom → top):
 *   1. Dot grid  — white at very low opacity
 *   2. Five orbs — tertiary pools + accent halos, mouse-parallax & float
 *   3. Radial vignette — fades into bg.primary
 *   4. Top / bottom linear fades — keeps header/footer clean
 */
const BG = '#1a1a2e'; // bg.primary

export default function AnimatedBackground() {
  const primaryRef   = useRef(null);
  const secondaryRef = useRef(null);
  const tertiaryRef  = useRef(null);
  const floatARef    = useRef(null);
  const floatBRef    = useRef(null);

  useEffect(() => {
    const mouse   = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let rafId;

    const lerp = (a, b, f) => a + (b - a) * f;
    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      current.x = lerp(current.x, mouse.x, 0.045);
      current.y = lerp(current.y, mouse.y, 0.045);
      const dx = current.x - 0.5;
      const dy = current.y - 0.5;
      const t  = Date.now() / 1000;

      // Large tertiary pool — strong mouse follow
      if (primaryRef.current)
        primaryRef.current.style.transform = `translate(${dx * 180}px, ${dy * 140}px)`;

      // Accent glow — counter-parallax + float
      if (secondaryRef.current) {
        secondaryRef.current.style.transform =
          `translate(${dx * -90 + Math.cos(t * 0.25) * 14}px, ${dy * -70 + Math.sin(t * 0.4) * 22}px)`;
      }

      // Secondary bg tone — top-left, slow parallax
      if (tertiaryRef.current) {
        tertiaryRef.current.style.transform =
          `translate(${dx * 60 + Math.sin(t * 0.2) * 12}px, ${dy * 50 + Math.cos(t * 0.35) * 18}px)`;
      }

      // Accent float A
      if (floatARef.current)
        floatARef.current.style.transform =
          `translate(${Math.cos(t * 0.3 + 0.7) * 20}px, ${Math.sin(t * 0.55 + 1.2) * 28}px)`;

      // Tertiary float B
      if (floatBRef.current)
        floatBRef.current.style.transform =
          `translate(${Math.sin(t * 0.38 + 1.0) * 16}px, ${Math.cos(t * 0.45 + 2.4) * 24}px)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      {/* ── 1. Dot grid ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── 2. Orbs ──────────────────────────────────────────────── */}

      {/* Primary — bg.tertiary deep-blue pool, centre, strong mouse */}
      <div
        ref={primaryRef}
        className="absolute rounded-full"
        style={{
          top: '35%', left: '50%',
          width: 780, height: 780,
          marginLeft: -390, marginTop: -390,
          background: 'radial-gradient(circle at center, rgba(15,52,96,0.80) 0%, rgba(15,52,96,0.30) 50%, transparent 70%)',
          willChange: 'transform',
        }}
      />

      {/* Secondary — accent (#93c5fd) soft halo, bottom-right, counter-parallax */}
      <div
        ref={secondaryRef}
        className="absolute rounded-full"
        style={{
          top: '65%', left: '74%',
          width: 580, height: 580,
          marginLeft: -290, marginTop: -290,
          background: 'radial-gradient(circle at center, rgba(147,197,253,0.16) 0%, rgba(147,197,253,0.05) 55%, transparent 72%)',
          willChange: 'transform',
        }}
      />

      {/* Tertiary — bg.secondary tone, top-left, slow parallax */}
      <div
        ref={tertiaryRef}
        className="absolute rounded-full"
        style={{
          top: '12%', left: '18%',
          width: 460, height: 460,
          marginLeft: -230, marginTop: -230,
          background: 'radial-gradient(circle at center, rgba(22,33,62,0.90) 0%, transparent 68%)',
          willChange: 'transform',
        }}
      />

      {/* Float A — accent glow, mid-right */}
      <div
        ref={floatARef}
        className="absolute rounded-full"
        style={{
          top: '28%', left: '83%',
          width: 320, height: 320,
          marginLeft: -160, marginTop: -160,
          background: 'radial-gradient(circle at center, rgba(147,197,253,0.11) 0%, transparent 62%)',
          willChange: 'transform',
        }}
      />

      {/* Float B — bg.tertiary, bottom-left */}
      <div
        ref={floatBRef}
        className="absolute rounded-full"
        style={{
          top: '77%', left: '20%',
          width: 360, height: 360,
          marginLeft: -180, marginTop: -180,
          background: 'radial-gradient(circle at center, rgba(15,52,96,0.55) 0%, transparent 62%)',
          willChange: 'transform',
        }}
      />

      {/* ── 3. Radial vignette ───────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, ${BG} 100%)` }}
      />

      {/* ── 4. Top / bottom linear fades ────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-40"
        style={{ background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: `linear-gradient(to top, ${BG} 0%, transparent 100%)` }} />
    </div>
  );
}
