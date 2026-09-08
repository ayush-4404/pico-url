import { useEffect, useRef } from 'react';

/**
 * Minimalist atmospheric background:
 * - Clean pitch-black #0a0a0a base
 * - Subtle 24px dot grid
 * - Vignette edge falloff
 * - Subtle, smooth cursor-reactive ambient radial luminance
 */
export default function AnimatedBackground() {
  const glowRef = useRef(null);

  useEffect(() => {
    const mouse = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let rafId;

    const lerp = (a, b, f) => a + (b - a) * f;

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      current.x = lerp(current.x, mouse.x, 0.06);
      current.y = lerp(current.y, mouse.y, 0.06);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.x - 300}px, ${current.y - 300}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      {/* 1. Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* 2. Responsive cursor ambient glow */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)',
          willChange: 'transform',
        }}
      />

      {/* 3. Subtle Dot Grid */}
      <div className="absolute inset-0 bg-dotgrid opacity-75" />

      {/* 4. Vignette shading for edge depth */}
      <div className="absolute inset-0 bg-vignette" />

      {/* 5. Top & Bottom subtle fade gradients */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  );
}
