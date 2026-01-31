# Quick Design Reference Guide - Platinum & Onyx v5.0

> Fast reference for implementing premium design patterns with the Platinum & Onyx palette.
> **For notarial/legal context** - Sober, professional, luxurious.

---

## Color Variables (Ready to Use)

### Light Theme "Ivory Platinum"
```css
:root {
  /* Backgrounds */
  --background: oklch(98% 0.004 55);      /* Warm ivory */
  --card: oklch(99% 0.002 55);            /* Near white */

  /* Primary - Deep Slate */
  --primary: oklch(30% 0.018 250);        /* Professional slate */
  --primary-foreground: oklch(99% 0 0);   /* White */

  /* Accent - Champagne/Gold */
  --accent: oklch(96% 0.020 55);          /* Soft champagne */
  --accent-vivid: oklch(70% 0.090 48);    /* Vivid gold (CTAs) */

  /* Text */
  --foreground: oklch(14% 0.012 250);     /* Deep charcoal */
  --muted-foreground: oklch(45% 0.010 250); /* Medium slate */

  /* Borders */
  --border: oklch(90% 0.006 250);         /* Silver border */
}
```

### Dark Theme "Onyx"
```css
.dark {
  /* Backgrounds */
  --background: oklch(10% 0.010 250);     /* Deep onyx */
  --card: oklch(15% 0.012 250);           /* Charcoal */

  /* Primary - Silver/Platinum */
  --primary: oklch(80% 0.010 250);        /* Luminous silver */
  --primary-foreground: oklch(10% 0.010 250); /* Onyx */

  /* Accent - Warm Gold */
  --accent: oklch(22% 0.030 50);          /* Soft gold surface */
  --accent-vivid: oklch(75% 0.085 48);    /* Vivid gold (CTAs) */

  /* Text */
  --foreground: oklch(95% 0.004 250);     /* Off-white */
  --muted-foreground: oklch(65% 0.008 250); /* Medium silver */

  /* Borders */
  --border: oklch(25% 0.012 250);         /* Charcoal border */
}
```

---

## Typography Scale

```css
/* Font sizes - use with Tailwind classes */
text-xs    →  12px
text-sm    →  14px
text-base  →  16px
text-lg    →  18px
text-xl    →  20px
text-2xl   →  24px
text-3xl   →  30px
text-4xl   →  36px
text-5xl   →  48px
text-6xl   →  64px

/* Font weights */
font-normal   →  400
font-medium   →  500
font-semibold →  600
font-bold     →  700
```

---

## Common Component Patterns

### Premium Card (Platinum Style)
```tsx
<div className="glass-card rounded-2xl p-6 card-interactive cursor-pointer">
  {/* Icon circle */}
  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-primary" />
  </div>

  {/* Title */}
  <h3 className="text-2xl font-semibold text-foreground mb-2">Feature Title</h3>

  {/* Description */}
  <p className="text-muted-foreground leading-relaxed">Description text here</p>
</div>
```

### Primary Button (Deep Slate)
```tsx
<button className="
  bg-primary text-primary-foreground
  px-6 py-3 rounded-xl font-semibold
  transition-all duration-200
  hover:shadow-lg hover:scale-[1.02]
  active:scale-[0.98]
  flex items-center gap-2
">
  Get Started
  <ArrowRight className="w-4 h-4" />
</button>
```

### Accent Button (Champagne/Gold)
```tsx
<button className="
  bg-gradient-accent text-white
  px-6 py-3 rounded-xl font-semibold
  transition-all duration-200
  shadow-md hover:shadow-lg hover:shadow-accent-vivid/25
  hover:scale-[1.02]
  active:scale-[0.98]
">
  Premium Action
</button>
```

### Secondary Button (Outline)
```tsx
<button className="
  bg-transparent border border-border
  text-foreground px-6 py-3 rounded-xl font-semibold
  transition-all duration-200
  hover:bg-accent hover:border-primary/30
">
  Learn More
</button>
```

### Status Badge
```tsx
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1 rounded-full
  bg-success/10 text-success
  text-sm font-medium uppercase tracking-wide
">
  <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
  Active
</span>
```

### Glassmorphism Card
```tsx
<div className="glass-card rounded-2xl p-6">
  {/* Content */}
</div>
```

---

## Spacing Guidelines

```
Tight spacing:     8px   (gap-2, p-2)
Small spacing:     16px  (gap-4, p-4)
Medium spacing:    24px  (gap-6, p-6)
Large spacing:     32px  (gap-8, p-8)
Section spacing:   96px  (gap-24, py-24)
```

---

## Common Tailwind Class Combos

### Navigation Bar
```
className="fixed top-0 w-full backdrop-blur-lg bg-background/80 border-b border-border z-50"
```

### Hero Section
```
className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-32"
```

### Container
```
className="max-w-7xl mx-auto px-6"
```

### Grid Layout (3 cols)
```
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
```

### Feature Icon Container
```
className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
```

---

## Hover Effects

### Scale on Hover
```
className="transition-transform duration-200 hover:scale-[1.02]"
```

### Border Glow on Hover
```
className="border border-border hover:border-primary/30 transition-colors duration-200"
```

### Card Lift on Hover
```
className="card-interactive"
```
*(Built-in class from index.css)*

---

## Color Palette Quick Reference

### Light Theme "Ivory Platinum"

| Use Case | Token | Hex Approx |
|----------|-------|------------|
| Background | `bg-background` | #FAF9F7 |
| Card | `bg-card` | #FDFCFB |
| Primary | `bg-primary` | #3D4152 |
| Accent Gold | `bg-accent-vivid` | #C9A962 |
| Text Primary | `text-foreground` | #1E1F23 |
| Text Muted | `text-muted-foreground` | #6B6E7A |
| Border | `border-border` | #E5E4E2 |

### Dark Theme "Onyx"

| Use Case | Token | Hex Approx |
|----------|-------|------------|
| Background | `bg-background` | #161719 |
| Card | `bg-card` | #1E2023 |
| Primary | `bg-primary` | #C5C8CE |
| Accent Gold | `bg-accent-vivid` | #D4B872 |
| Text Primary | `text-foreground` | #F0F1F2 |
| Text Muted | `text-muted-foreground` | #9A9DA5 |
| Border | `border-border` | #35383D |

---

## Semantic Colors

| Type | Light | Dark |
|------|-------|------|
| Success (Sage) | `oklch(55% 0.12 155)` | `oklch(65% 0.14 155)` |
| Warning (Amber) | `oklch(75% 0.12 55)` | `oklch(78% 0.12 55)` |
| Error (Rose) | `oklch(55% 0.15 15)` | `oklch(62% 0.18 15)` |
| Info (Steel) | `oklch(60% 0.08 240)` | `oklch(68% 0.10 240)` |

---

## Before Starting Checklist

### Do:
- Use warm ivory background (light) / deep onyx (dark)
- Use deep slate for primary actions (light) / silver (dark)
- Use champagne/gold accents sparingly for luxury feel
- Use generous whitespace (padding 24-32px on cards)
- Make buttons rounded-xl or rounded-2xl
- Add subtle hover states to everything clickable
- Use large, bold headings (text-4xl+ for heroes)
- Use icons with soft colored circular backgrounds
- Keep card backgrounds with glass effect

### Don't:
- Use blue/violet colors (looks like "IA slop")
- Use harsh, cold grays
- Use bright neon colors
- Cram content too closely
- Use sharp corners on buttons
- Forget hover states
- Use small, timid typography
- Overuse shadows

---

## Built-in Utility Classes

From `index.css`:

| Class | Effect |
|-------|--------|
| `.glass` | Standard glassmorphism |
| `.glass-subtle` | Light glassmorphism |
| `.glass-card` | Premium glass card |
| `.bg-gradient-subtle` | Subtle background gradient |
| `.bg-gradient-primary` | Primary color gradient |
| `.bg-gradient-accent` | Champagne/gold gradient |
| `.bg-gradient-mesh` | Premium mesh background |
| `.glow-primary` | Primary glow effect |
| `.glow-accent` | Gold glow effect |
| `.card-interactive` | Card hover with lift |
| `.surface-interactive` | Interactive surface hover |
| `.elevation-1/2/3/4` | Shadow depth levels |
| `.transition-premium` | Smooth all transitions |
| `.skeleton` | Loading skeleton shimmer |
| `.animate-pulse-dot` | Status dot animation |

---

## Testing Checklist

- [ ] Background uses warm ivory (light) / deep onyx (dark)
- [ ] Text contrast ratio > 4.5:1 for body text
- [ ] Primary buttons use deep slate (light) / silver (dark)
- [ ] Accent buttons use champagne/gold gradient
- [ ] All buttons are rounded-xl or rounded-2xl
- [ ] Cards have subtle glass effect
- [ ] Hover states on all interactive elements
- [ ] Spacing follows 8px grid
- [ ] Typography hierarchy is clear
- [ ] Icons have soft colored backgrounds
- [ ] Status indicators use semantic colors
- [ ] No blue/violet colors used

---

## New Patterns

### Section Tag + Heading Pattern
```tsx
<div className="space-y-4">
  {/* Tag */}
  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-wide">
    Features
  </span>
  {/* Heading */}
  <h2 className="text-4xl md:text-5xl font-bold text-foreground">
    Everything you need
  </h2>
  {/* Description */}
  <p className="text-lg text-muted-foreground max-w-2xl">
    Powerful tools designed for professionals.
  </p>
</div>
```

### Bento Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured card - spans 2 columns */}
  <div className="lg:col-span-2 glass-card rounded-2xl p-8">
    {/* Large feature content */}
  </div>

  {/* Regular cards */}
  <div className="glass-card rounded-2xl p-6">
    {/* Standard feature */}
  </div>
</div>
```

### Live Status Badge
```tsx
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
  <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
  LIVE
</span>
```

---

**Pro Tip:** Start with one component and perfect it before moving to the next. Premium is in the details.

---

*Última atualização: 2026-01-31*
*Versão: 5.0 "Platinum & Onyx"*
