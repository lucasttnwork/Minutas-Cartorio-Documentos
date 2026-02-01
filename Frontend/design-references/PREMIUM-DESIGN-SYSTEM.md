# Sistema de Minutas - Premium Design System v5.0 "Platinum & Onyx"

## Design Philosophy

**Objetivo**: Interface premium, sóbria e luxuosa adequada para contexto notarial/jurídico. Visual hand-crafted que transmite confiança, profissionalismo e sofisticação sem parecer "IA slop".

**Inspirações**:
- Escritórios de advocacia premium
- Interfaces financeiras high-end (Private Banking)
- Marcas de luxo discretas (Rolex, Cartier - sutileza)
- Papéis de alta qualidade (marfim, textura)

**Paleta "Platinum & Onyx"**:
- **Slate/Graphite**: Primary - tons profundos e elegantes
- **Silver/Platinum**: Acentos metálicos premium
- **Champagne/Warm Gold**: Toques de luxo discreto
- **Ivory**: Superfícies limpas (light theme)
- **Onyx/Charcoal**: Dark theme sofisticado

---

## 1. Color Palette - "Platinum & Onyx"

### Primary Colors - Deep Slate/Graphite
Tons de cinza escuro profissional e sofisticado. Neutro com leve undertone cool.

```css
/* Primary - Deep Slate (Hue ~250, very low chroma for neutral) */
--primary-50: oklch(97% 0.005 250);      /* Lightest slate tint */
--primary-100: oklch(94% 0.008 250);
--primary-200: oklch(88% 0.010 250);
--primary-300: oklch(78% 0.012 250);
--primary-400: oklch(60% 0.015 250);
--primary-500: oklch(45% 0.018 250);     /* Main primary - deep slate */
--primary-600: oklch(38% 0.020 250);     /* Hover state */
--primary-700: oklch(30% 0.018 250);
--primary-800: oklch(22% 0.015 250);
--primary-900: oklch(16% 0.012 250);
--primary-950: oklch(10% 0.010 250);     /* Near black - Onyx */
```

### Accent Colors - Champagne/Warm Gold
Toques de luxo discreto. Dourado sutil que não compete com o conteúdo.

```css
/* Accent - Champagne/Warm Gold (Hue ~55, low chroma for subtlety) */
--accent-50: oklch(98% 0.015 55);
--accent-100: oklch(96% 0.025 55);
--accent-200: oklch(92% 0.040 55);
--accent-300: oklch(86% 0.060 50);       /* Soft champagne */
--accent-400: oklch(78% 0.080 50);       /* Rich gold */
--accent-500: oklch(70% 0.090 48);       /* Main accent - warm gold */
--accent-600: oklch(62% 0.085 45);
--accent-700: oklch(52% 0.070 42);
--accent-800: oklch(42% 0.055 40);
--accent-900: oklch(32% 0.040 38);
```

### Neutral Colors - Silver/Platinum
Tons prateados sofisticados. Quase acromático com leve undertone cool.

```css
/* Neutrals - Silver/Platinum (very low chroma, cool) */
--neutral-50: oklch(98% 0.003 250);      /* Off-white - Ivory */
--neutral-100: oklch(96% 0.004 250);
--neutral-200: oklch(92% 0.005 250);     /* Silver tint */
--neutral-300: oklch(86% 0.006 250);
--neutral-400: oklch(70% 0.008 250);     /* Medium silver */
--neutral-500: oklch(55% 0.010 250);
--neutral-600: oklch(45% 0.012 250);
--neutral-700: oklch(35% 0.014 250);     /* Graphite */
--neutral-800: oklch(22% 0.015 250);     /* Charcoal */
--neutral-900: oklch(14% 0.012 250);     /* Near black */
--neutral-950: oklch(8% 0.010 250);      /* Deep Onyx */
```

### Semantic Colors

```css
/* Success - Sage Green (sophisticated, not neon) */
--success: oklch(55% 0.12 155);
--success-soft: oklch(95% 0.025 155);

/* Warning - Warm Amber (matches champagne accent) */
--warning: oklch(75% 0.12 55);
--warning-soft: oklch(95% 0.030 55);

/* Error - Muted Rose (elegant, not harsh) */
--error: oklch(55% 0.15 15);
--error-soft: oklch(95% 0.025 15);

/* Info - Cool Steel Blue (neutral) */
--info: oklch(60% 0.08 240);
--info-soft: oklch(95% 0.015 240);
```

---

## 2. Theme Tokens

### Light Theme - "Ivory Platinum"
Clean, warm ivory base with silver accents. Professional and easy on eyes.

```css
:root {
  /* Backgrounds - Ivory warmth */
  --background: oklch(98% 0.004 55);            /* Warm ivory */
  --background-subtle: oklch(96% 0.005 55);     /* Slightly warmer */
  --foreground: oklch(14% 0.012 250);           /* Deep charcoal */

  /* Surfaces - Clean with subtle warmth */
  --card: oklch(99% 0.002 55);                  /* Near white with ivory tint */
  --card-elevated: oklch(100% 0 0);             /* Pure white for elevated */
  --card-foreground: oklch(14% 0.012 250);
  --popover: oklch(99% 0.002 55);
  --popover-foreground: oklch(14% 0.012 250);

  /* Primary - Deep Slate */
  --primary: oklch(30% 0.018 250);              /* Deep professional slate */
  --primary-hover: oklch(25% 0.020 250);        /* Darker on hover */
  --primary-foreground: oklch(99% 0 0);         /* Pure white */
  --primary-soft: oklch(95% 0.006 250);         /* Soft slate background */

  /* Secondary - Light Silver */
  --secondary: oklch(94% 0.004 250);            /* Light silver */
  --secondary-foreground: oklch(25% 0.015 250);

  /* Muted - For labels & subtle elements */
  --muted: oklch(95% 0.004 250);                /* Light muted */
  --muted-foreground: oklch(45% 0.010 250);     /* WCAG AA compliant */

  /* Accent - Warm Champagne */
  --accent: oklch(96% 0.020 55);                /* Soft champagne glow */
  --accent-foreground: oklch(35% 0.050 50);     /* Deep gold */
  --accent-vivid: oklch(70% 0.090 48);          /* Vivid gold for CTAs */

  /* Borders - Subtle silver */
  --border: oklch(90% 0.006 250);               /* Soft silver border */
  --border-subtle: oklch(94% 0.004 250);        /* Very subtle */
  --input: oklch(97% 0.003 250);                /* Input background */
  --ring: oklch(30% 0.018 250);                 /* Focus ring - primary */

  /* Shadows - Warm neutral */
  --shadow-color: 250 15% 20%;
}
```

### Dark Theme - "Onyx"
Deep charcoal-black with high contrast. Sophisticated and modern.

```css
.dark {
  /* Backgrounds - Deep Onyx */
  --background: oklch(10% 0.010 250);           /* Deep onyx black */
  --background-subtle: oklch(13% 0.012 250);    /* Slightly elevated */
  --foreground: oklch(95% 0.004 250);           /* Off-white */

  /* Surfaces - Charcoal layers */
  --card: oklch(15% 0.012 250);                 /* Elevated charcoal */
  --card-elevated: oklch(18% 0.014 250);        /* Higher elevation */
  --card-foreground: oklch(95% 0.004 250);
  --popover: oklch(16% 0.012 250);
  --popover-foreground: oklch(95% 0.004 250);

  /* Primary - Silver/Platinum */
  --primary: oklch(80% 0.010 250);              /* Luminous silver */
  --primary-hover: oklch(85% 0.008 250);        /* Brighter on hover */
  --primary-foreground: oklch(10% 0.010 250);   /* Deep onyx */
  --primary-soft: oklch(20% 0.012 250);         /* Soft dark surface */

  /* Secondary - Elevated charcoal */
  --secondary: oklch(18% 0.012 250);
  --secondary-foreground: oklch(90% 0.004 250);

  /* Muted - Labels & subtle text */
  --muted: oklch(18% 0.010 250);
  --muted-foreground: oklch(65% 0.008 250);     /* WCAG AA compliant */

  /* Accent - Warm Gold glow */
  --accent: oklch(22% 0.030 50);                /* Soft gold surface */
  --accent-foreground: oklch(85% 0.060 50);     /* Light gold text */
  --accent-vivid: oklch(75% 0.085 48);          /* Vivid gold for CTAs */

  /* Borders - Subtle charcoal */
  --border: oklch(25% 0.012 250);               /* Visible border */
  --border-subtle: oklch(20% 0.010 250);        /* Very subtle */
  --input: oklch(16% 0.010 250);
  --ring: oklch(80% 0.010 250);                 /* Focus ring - silver */

  /* Shadows - Deep black */
  --shadow-color: 250 30% 3%;
}
```

---

## 3. Glassmorphism System

### Glass Effects - Premium Depth

```css
/* Standard Glass */
.glass {
  background: oklch(from var(--card) l c h / 0.75);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid oklch(from var(--border) l c h / 0.5);
}

/* Subtle Glass - lighter effect */
.glass-subtle {
  background: oklch(from var(--card) l c h / 0.55);
  backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid oklch(from var(--border) l c h / 0.35);
}

/* Premium Glass Card */
.glass-card {
  background: linear-gradient(
    135deg,
    oklch(from var(--card) l c h / 0.88) 0%,
    oklch(from var(--card) l c h / 0.70) 100%
  );
  backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid oklch(from var(--border) l c h / 0.45);
  box-shadow:
    0 4px 24px oklch(from var(--foreground) l c h / 0.06),
    inset 0 1px 0 oklch(100% 0 0 / 0.08);
}

/* Dark mode glass adjustments */
.dark .glass-card {
  background: linear-gradient(
    135deg,
    oklch(from var(--card) l c h / 0.65) 0%,
    oklch(from var(--card) l c h / 0.45) 100%
  );
  border: 1px solid oklch(100% 0 0 / 0.06);
  box-shadow:
    0 4px 24px oklch(0% 0 0 / 0.5),
    inset 0 1px 0 oklch(100% 0 0 / 0.04);
}
```

---

## 4. Shadow System - Multi-Layer Depth

```css
/* Light theme shadows - warm neutral */
--shadow-xs:
  0 1px 2px oklch(from var(--foreground) 20% 0.01 h / 0.04);

--shadow-sm:
  0 1px 3px oklch(from var(--foreground) 20% 0.01 h / 0.06),
  0 1px 2px oklch(from var(--foreground) 20% 0.01 h / 0.04);

--shadow-md:
  0 4px 6px -1px oklch(from var(--foreground) 20% 0.01 h / 0.08),
  0 2px 4px -2px oklch(from var(--foreground) 20% 0.01 h / 0.05);

--shadow-lg:
  0 10px 15px -3px oklch(from var(--foreground) 20% 0.01 h / 0.10),
  0 4px 6px -4px oklch(from var(--foreground) 20% 0.01 h / 0.06);

--shadow-xl:
  0 20px 25px -5px oklch(from var(--foreground) 20% 0.01 h / 0.12),
  0 8px 10px -6px oklch(from var(--foreground) 20% 0.01 h / 0.06);

/* Glow effects - subtle metallic */
--glow-primary:
  0 0 20px oklch(from var(--primary) l c h / 0.20);

--glow-accent:
  0 0 20px oklch(from var(--accent-vivid) l c h / 0.25);

/* Card hover glow */
--shadow-card-hover:
  0 10px 30px oklch(from var(--foreground) l c h / 0.10),
  0 4px 10px oklch(from var(--foreground) l c h / 0.06);
```

---

## 5. Gradient Definitions

```css
/* Primary gradient - subtle slate */
--gradient-primary: linear-gradient(
  135deg,
  oklch(from var(--primary) l c h) 0%,
  oklch(from var(--primary) calc(l - 0.06) c h) 100%
);

/* Accent gradient - warm champagne/gold */
--gradient-accent: linear-gradient(
  135deg,
  oklch(from var(--accent-vivid) l c h) 0%,
  oklch(from var(--accent-vivid) calc(l - 0.08) calc(c - 0.01) calc(h - 5)) 100%
);

/* Surface gradient - subtle depth */
--gradient-surface: linear-gradient(
  180deg,
  oklch(from var(--card) l c h) 0%,
  oklch(from var(--card) calc(l - 0.02) c h) 100%
);

/* Shimmer effect for buttons */
--gradient-shimmer: linear-gradient(
  110deg,
  transparent 25%,
  oklch(100% 0 0 / 0.12) 50%,
  transparent 75%
);

/* Mesh gradient background - subtle warm */
--gradient-mesh:
  radial-gradient(at 40% 20%, oklch(from var(--accent) l c h / 0.15) 0px, transparent 50%),
  radial-gradient(at 80% 0%, oklch(from var(--primary-soft) l c h / 0.20) 0px, transparent 50%),
  radial-gradient(at 0% 50%, oklch(from var(--accent) l c h / 0.10) 0px, transparent 50%),
  var(--background);
```

---

## 6. Animation Guidelines

### Timing Functions - Refined & Smooth

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-in-out-smooth: cubic-bezier(0.65, 0, 0.35, 1);
--spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Duration Scale

```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
```

### Premium Animations

```css
/* Shimmer effect */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Subtle float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Glow pulse - subtle */
@keyframes glow-pulse {
  0%, 100% { box-shadow: var(--glow-primary); }
  50% { box-shadow: 0 0 25px oklch(from var(--primary) l c h / 0.30); }
}

/* Status dot pulse */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 7. Component Patterns

### Premium Card - Platinum Style

```jsx
<Card className="
  glass-card
  rounded-2xl
  p-6
  transition-all duration-300 ease-out-expo
  hover:shadow-card-hover
  hover:translate-y-[-2px]
  hover:border-primary/30
  cursor-pointer
">
  {/* Content */}
</Card>
```

### Premium Button - Slate Primary

```jsx
<Button className="
  relative overflow-hidden
  bg-primary text-primary-foreground
  shadow-md rounded-xl
  transition-all duration-200 ease-out
  hover:shadow-lg hover:bg-primary-hover
  hover:scale-[1.02]
  active:scale-[0.98]
">
  {children}
</Button>
```

### Accent Button - Champagne/Gold

```jsx
<Button variant="accent" className="
  relative overflow-hidden
  bg-gradient-accent text-white
  shadow-md rounded-xl
  transition-all duration-200 ease-out
  hover:shadow-lg hover:shadow-accent-vivid/25
  hover:scale-[1.02]
  active:scale-[0.98]
">
  {children}
</Button>
```

### Premium Sidebar Item

```jsx
<NavLink className={cn(
  "group relative flex items-center gap-3 px-4 py-3 rounded-xl",
  "transition-all duration-200 ease-out",
  isActive
    ? "bg-primary/10 text-primary shadow-sm"
    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
)}>
  {/* Active indicator - subtle gold line */}
  {isActive && (
    <div className="
      absolute left-0 top-1/2 -translate-y-1/2
      w-1 h-8 rounded-r-full
      bg-gradient-to-b from-accent-vivid to-accent-vivid/70
      shadow-[0_0_8px_var(--accent-vivid)]
    " />
  )}
  <Icon className="transition-transform group-hover:scale-110" />
  <span>{label}</span>
</NavLink>
```

---

## 8. Typography Refinements

### Font Stack
```css
--font-sans: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Letter Spacing
```css
--tracking-tighter: -0.03em;  /* Large headings */
--tracking-tight: -0.02em;    /* Headings */
--tracking-normal: -0.011em;  /* Body text */
--tracking-wide: 0.025em;     /* Labels */
--tracking-wider: 0.05em;     /* Overlines */
```

### Text Styles
```css
.text-display {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: var(--tracking-tighter);
  line-height: 1.1;
}

.text-headline {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: 1.25;
}

.text-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--muted-foreground);
}
```

---

## 9. Anti-Patterns (O que evitar)

1. **NO blue/violet "IA slop"** - Use slate/graphite neutros
2. **NO harsh shadows** - Use sombras suaves e warm
3. **NO instant transitions** - Sempre use easing curves
4. **NO plain borders** - Use bordas com transparência ou gradiente sutil
5. **NO generic hover states** - Adicione transformações sutis
6. **NO emoji icons** - Use Lucide icons consistentemente
7. **NO pure white/black** - Use tons com undertone (ivory/onyx)
8. **NO neon colors** - Mantenha cores sofisticadas e low-chroma
9. **NO busy gradients** - Gradientes devem ser sutis
10. **NO cold sterile grays** - Adicione warmth com champagne accents

---

## 10. Implementation Checklist

### Cards
- [ ] Glassmorphism background with warm tint
- [ ] Subtle gradient overlay
- [ ] Multi-layer shadow (neutral)
- [ ] Hover with subtle scale + shadow increase
- [ ] Smooth lift animation

### Buttons
- [ ] Primary: Deep slate with white text
- [ ] Accent: Champagne/gold gradient for special CTAs
- [ ] Secondary: Outlined with slate border
- [ ] Shimmer effect on hover (optional)
- [ ] Scale micro-interaction
- [ ] Loading state with subtle pulse

### Sidebar
- [ ] Glass effect background
- [ ] Animated active indicator (gold accent)
- [ ] Icon scale on hover
- [ ] Smooth collapse animation
- [ ] Premium profile section

### Forms
- [ ] Soft input backgrounds (ivory/charcoal)
- [ ] Focus glow rings (primary color)
- [ ] Animated labels
- [ ] Elegant validation states

---

## 11. Color Reference Table

### Light Theme "Ivory Platinum"

| Use Case | Token | Hex Approximation |
|----------|-------|-------------------|
| Background | `--background` | #FAF9F7 (warm ivory) |
| Card | `--card` | #FDFCFB (near white) |
| Primary | `--primary` | #3D4152 (deep slate) |
| Primary Hover | `--primary-hover` | #2D3140 (darker slate) |
| Accent | `--accent-vivid` | #C9A962 (warm gold) |
| Muted Text | `--muted-foreground` | #6B6E7A (medium slate) |
| Border | `--border` | #E5E4E2 (silver) |
| Success | `--success` | #5A8A6C (sage green) |
| Warning | `--warning` | #C9A040 (amber) |
| Error | `--error` | #B85450 (muted rose) |

### Dark Theme "Onyx"

| Use Case | Token | Hex Approximation |
|----------|-------|-------------------|
| Background | `--background` | #161719 (deep onyx) |
| Card | `--card` | #1E2023 (charcoal) |
| Primary | `--primary` | #C5C8CE (luminous silver) |
| Primary Hover | `--primary-hover` | #D5D8DE (brighter silver) |
| Accent | `--accent-vivid` | #D4B872 (warm gold) |
| Muted Text | `--muted-foreground` | #9A9DA5 (medium silver) |
| Border | `--border` | #35383D (charcoal border) |
| Success | `--success` | #7AB88A (sage green) |
| Warning | `--warning` | #D4B050 (amber) |
| Error | `--error` | #C86A66 (muted rose) |

---

## 12. Inspiration Patterns (Adapted for Platinum & Onyx)

### Terminal/Code Block
```css
.terminal-container {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}
```

### Status Badge (Live)
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: oklch(from var(--success) l c h / 0.1);
  color: var(--success);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s infinite;
}
```

### Section Tag Pattern
```css
.section-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  background: oklch(from var(--primary) l c h / 0.1);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Bento Grid
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.bento-featured {
  grid-column: span 2;
}
```

---

*Última atualização: 2026-01-31*
*Versão: 5.0 "Platinum & Onyx"*
