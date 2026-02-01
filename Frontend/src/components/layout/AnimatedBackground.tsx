// src/components/layout/AnimatedBackground.tsx
// Premium starry night background for notarial document system
// Creates elegant depth with twinkling stars effect

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Star {
  id: number;
  x: number;
  y: number;
  size: "tiny" | "small" | "medium";
  brightness: "dim" | "normal" | "bright";
  twinkleDelay: number;
  twinkleDuration: number;
}

interface AnimatedBackgroundProps {
  /** Number of stars to render */
  starCount?: number;
  /** Whether to show subtle gradient overlay */
  showGradient?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Children to render above the background */
  children?: React.ReactNode;
}

// Generate stars with natural distribution
function generateStars(count: number): Star[] {
  const stars: Star[] = [];

  // Seeded random for consistency across renders
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const seed = i * 137.5; // Golden angle for natural distribution

    // Weighted distribution: more tiny stars, fewer bright ones
    const sizeRand = seededRandom(seed + 2);
    const size = sizeRand < 0.6 ? "tiny" : sizeRand < 0.9 ? "small" : "medium";

    const brightnessRand = seededRandom(seed + 3);
    const brightness = brightnessRand < 0.5 ? "dim" : brightnessRand < 0.85 ? "normal" : "bright";

    stars.push({
      id: i,
      x: seededRandom(seed) * 100,
      y: seededRandom(seed + 1) * 100,
      size,
      brightness,
      twinkleDelay: seededRandom(seed + 4) * 8, // 0-8s delay
      twinkleDuration: 2 + seededRandom(seed + 5) * 4, // 2-6s duration
    });
  }

  return stars;
}

export function AnimatedBackground({
  starCount = 60,
  showGradient = true,
  className,
  children,
}: AnimatedBackgroundProps) {
  // Memoize stars to prevent re-generation on every render
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Subtle gradient overlay for depth */}
      {showGradient && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 50% 0%, oklch(from var(--accent) l c h / 0.025) 0%, transparent 50%),
              radial-gradient(ellipse 80% 40% at 100% 20%, oklch(from var(--accent-vivid) l c h / 0.015) 0%, transparent 40%),
              radial-gradient(ellipse 60% 30% at 0% 80%, oklch(from var(--primary-soft) l c h / 0.015) 0%, transparent 40%)
            `,
          }}
          aria-hidden="true"
        />
      )}

      {/* Starry sky layer */}
      <div className="starry-sky-container" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            className={cn(
              "star",
              `star--${star.size}`,
              `star--${star.brightness}`
            )}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.twinkleDelay}s`,
              animationDuration: `${star.twinkleDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Content layer - elevated above background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Simplified starfield for specific containers
export function StarsOverlay({
  count = 30,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className={cn(
            "star",
            `star--${star.size}`,
            `star--${star.brightness}`
          )}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.twinkleDelay}s`,
            animationDuration: `${star.twinkleDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
