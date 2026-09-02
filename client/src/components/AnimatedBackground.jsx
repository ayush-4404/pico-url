import { useEffect, useRef } from 'react';

/**
 * Full-viewport animated background with:
 *  - Dot grid overlay
 *  - 3 gradient orbs with mouse parallax at different speeds + depths
 *  - 2 autonomously floating orbs (JS sin/cos oscillation)
 *  - Edge vignette so content reads cleanly
 *
 * Performance: single rAF loop, CSS transform only (compositor thread),
 * will-change: transform on moving elements.
 */
export default function AnimatedBackground() {
  const primaryRef   = useRef(null); // large orb — follows mouse closely
  const secondaryRef = useRef(null); // medium orb — opposite parallax
  const tertiaryRef  = useRef(null); // small top-left — slow parallax
  const floatARef    = useRef(null); // autonomous float A
  const floatBRef    = useRef(null); // autonomous float B

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
      // Smoothly chase mouse (lerp factor = easing speed, lower = more lag)
      current.x = lerp(current.x, mouse.x, 0.045);
      current.y = lerp(current.y, mouse.y, 0.045);

      const dx = current.x - 0.5; // –0.5 → +0.5
      const dy = current.y - 0.5;
      const t  = Date.now() / 1000; // seconds elapsed

      // Primary — large, follows mouse, strongest parallax
      if (primaryRef.current) {
        primaryRef.current.style.transform =
          `translate(${dx * 180}px, ${dy * 140}px)`;
      }

      // Secondary — opposite direction (creates depth illusion), + float
      if (secondaryRef.current) {
        const fy = Math.sin(t * 0.4) * 22;
        const fx = Math.cos(t * 0.25) * 14;
        secondaryRef.current.style.transform =
          `translate(${dx * -90 + fx}px, ${dy * -70 + fy}px)`;
      }

      // Tertiary — slow parallax + gentle float
      if (tertiaryRef.current) {
        const fy = Math.cos(t * 0.35) * 18;
        const fx = Math.sin(t * 0.2) * 12;
        tertiaryRef.current.style.transform =
          `translate(${dx * 60 + fx}px, ${dy * 50 + fy}px)`;
      }

      // Autonomous float A — pure oscillation, no mouse
      if (floatARef.current) {
        const fy = Math.sin(t * 0.55 + 1.2) * 28;
        const fx = Math.cos(t * 0.3 + 0.7) * 20;
        floatARef.current.style.transform = `translate(${fx}px, ${fy}px)`;
      }

      // Autonomous float B
      if (floatBRef.current) {
        const fy = Math.cos(t * 0.45 + 2.4) * 24;
        const fx = Math.sin(t * 0.38 + 1.0) * 16;
        floatBRef.current.style.transform = `translate(${fx}px, ${fy}px)`;
      }

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
      {/* ── Dot grid ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(113,113,122,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Gradient orbs ────────────────────────────────── */}

      {/* Primary — violet, centre, strong mouse follow */}
      <div
        ref={primaryRef}
        className="absolute rounded-full"
        style={{
          top: '35%', left: '50%',
          width: 720, height: 720,
          marginLeft: -360, marginTop: -360,
          background:
            'radial-gradient(circle at center, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.08) 45%, transparent 70%)',
          filter: 'blur(2px)',
          willChange: 'transform',
        }}
      />

      {/* Secondary — indigo, bottom-right, counter-parallax */}
      <div
        ref={secondaryRef}
        className="absolute rounded-full"
        style={{
          top: '62%', left: '72%',
          width: 520, height: 520,
          marginLeft: -260, marginTop: -260,
          background:
            'radial-gradient(circle at center, rgba(79,70,229,0.18) 0%, rgba(67,56,202,0.06) 50%, transparent 70%)',
          filter: 'blur(2px)',
          willChange: 'transform',
        }}
      />

      {/* Tertiary — violet light, top-left */}
      <div
        ref={tertiaryRef}
        className="absolute rounded-full"
        style={{
          top: '12%', left: '18%',
          width: 420, height: 420,
          marginLeft: -210, marginTop: -210,
          background:
            'radial-gradient(circle at center, rgba(139,92,246,0.14) 0%, transparent 65%)',
          filter: 'blur(2px)',
          willChange: 'transform',
        }}
      />

      {/* Float A — fuchsia tint, mid-right */}
      <div
        ref={floatARef}
        className="absolute rounded-full"
        style={{
          top: '30%', left: '82%',
          width: 280, height: 280,
          marginLeft: -140, marginTop: -140,
          background:
            'radial-gradient(circle at center, rgba(167,139,250,0.10) 0%, transparent 60%)',
          filter: 'blur(1px)',
          willChange: 'transform',
        }}
      />

      {/* Float B — indigo, bottom-left */}
      <div
        ref={floatBRef}
        className="absolute rounded-full"
        style={{
          top: '75%', left: '22%',
          width: 320, height: 320,
          marginLeft: -160, marginTop: -160,
          background:
            'radial-gradient(circle at center, rgba(99,102,241,0.11) 0%, transparent 60%)',
          filter: 'blur(1px)',
          willChange: 'transform',
        }}
      />

      {/* ── Edge vignette (fades orbs into dark edges) ───── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, #0a0a0a 100%)',
        }}
      />

      {/* Top & bottom linear fades so content at header/footer reads clean */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)' }}
      />
    </div>
  );
}
