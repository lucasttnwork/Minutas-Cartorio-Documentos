# 21.dev Integration Guide

**Using 21st.dev Component Library & Claude Code MCP Magic Tools**

---

## Overview

21.dev is a premium component library platform that integrates with Claude Code via MCP Magic tools. We'll use it for:

1. **Component Inspiration** - Design reference for building components
2. **Component Building** - Generate component code snippets
3. **Component Refinement** - Polish and customize components

---

## Available MCP Magic Tools

### 1. Component Builder
```
Tool: mcp__magic__21st_magic_component_builder

Purpose: Create custom components from specifications
Usage: Search for a component type, get code snippet
Integration: Paste code directly into project, customize colors/copy

Example:
- Search: "Hero section with gradient background"
- Get: Ready-to-use React component
- Customize: Apply our teal/coral color scheme
```

### 2. Component Inspiration
```
Tool: mcp__magic__21st_magic_component_inspiration

Purpose: Get design inspiration for components
Usage: Browse similar components, see design patterns
Integration: Use as reference for building similar components

Example:
- Search: "Testimonial card"
- Get: Multiple design variations
- Adapt: Choose best design, apply to our component
```

### 3. Component Refiner
```
Tool: mcp__magic__21st_magic_component_refiner

Purpose: Refine and improve existing components
Usage: Polish styling, animations, responsiveness
Integration: Improve components you've already built

Example:
- Input: Your button component code
- Output: Enhanced version with better animations, styling
- Result: Production-ready component
```

---

## Workflow for Each Section

### Step 1: Get Inspiration
```
Ask Claude Code Agent:
"Search 21.dev for inspiration on [component type]"

MCP Tool: mcp__magic__21st_magic_component_inspiration
Input: Component type (Hero, Card, FAQ, etc.)
Output: Multiple design variations to reference
```

### Step 2: Build Component
```
Ask Claude Code Agent:
"Build a [component] component for our design system"

MCP Tool: mcp__magic__21st_magic_component_builder
Input: Component specifications from IMPLEMENTATION-PLAN
Output: React component code snippet
```

### Step 3: Customize Colors & Fonts
```
Apply our design system:
- Replace colors with our palette
  - Primary: #0F766E (Teal)
  - Accent: #FB7185 (Coral)
  - Background: #0B1220 (Navy)
- Update fonts
  - Headlines: Playfair Display
  - Body: Manrope
- Add animations (Framer Motion)
```

### Step 4: Refine & Polish
```
Ask Claude Code Agent:
"Refine this component using 21.dev component refiner"

MCP Tool: mcp__magic__21st_magic_component_refiner
Input: Your component code + desired improvements
Output: Enhanced component with better styling/animations
```

---

## Component Library Categories on 21.dev

### Navigation & Headers
- Navbar (sticky, blur effect)
- Hero Headers
- Section Headers
- Breadcrumbs

### Content Blocks
- Feature Cards
- Service Cards
- Process Steps
- Stat Displays

### Social Proof
- Testimonial Cards
- Avatar Groups
- Rating Displays
- Review Cards

### Forms & Input
- Contact Forms
- Input Fields
- Text Areas
- Select Dropdowns

### CTAs & Buttons
- Button Variants
- CTA Sections
- Hero CTAs
- Footer CTAs

### Sections
- Hero Sections
- Feature Sections
- Pricing Tables
- FAQ Sections
- Footer

### Complex Components
- Carousel / Slider
- Accordion / Collapsible
- Modal / Dialog
- Tabs

---

## Color Customization Template

When using 21.dev components, use this template to adapt colors:

```javascript
// Before (21.dev component colors)
className="bg-blue-600 hover:bg-blue-700"
className="border-blue-300"
className="text-blue-500"

// After (Our design system)
className="bg-teal-700 hover:bg-teal-600" // #0F766E → #14B8A6
className="border-teal-600"
className="text-coral-500" // For accents #FB7185
className="bg-navy-900" // For backgrounds #0B1220
className="text-slate-100" // For text #F8FAFC
```

---

## Typography Customization Template

```javascript
// Before (21.dev default fonts)
className="font-sans text-lg" // Usually Inter or default
className="font-serif text-4xl" // Usually Playfair or Georgia

// After (Our design system)
// Headlines
className="font-playfair text-4xl font-light tracking-tight"

// Body
className="font-manrope text-base font-light leading-relaxed"

// Labels
className="font-manrope text-xs font-semibold uppercase tracking-widest"
```

---

## Animation Customization Template

When refining components, ensure animations use our premium easing:

```javascript
// Our premium easing
const premiumEasing = [0.22, 1, 0.36, 1];

// Apply to transitions
transition={{ duration: 0.6, ease: premiumEasing }}

// Hover animations
whileHover={{ scale: 1.03 }}

// Scroll animations
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-100px" }}
```

---

## Sections That Benefit Most from 21.dev

### High Priority
1. **Hero Section**
   - Search: "Hero with gradient and CTA"
   - Customize: Add our colors, stats, social proof

2. **Testimonial Cards**
   - Search: "Testimonial card with rating"
   - Customize: Add client photos, our colors

3. **FAQ Accordion**
   - Search: "FAQ accordion dark theme"
   - Customize: Ensure teal accents, smooth animations

4. **CTA Section**
   - Search: "Contact form with trust badges"
   - Customize: Our form fields, colors, copy

### Medium Priority
5. **Service Cards**
   - Search: "Feature card with icon and description"
   - Customize: Icons, colors, hover effects

6. **Team Cards**
   - Search: "Team member card with social links"
   - Customize: Photo frame, credential display

7. **Footer**
   - Search: "Dark footer with newsletter"
   - Customize: Our links, colors, branding

### Lower Priority
8. **Process Steps**
9. **Pricing Table**
10. **Stat Cards**

---

## Integration Checklist

For each component built using 21.dev:

- [ ] Copied code from 21.dev component
- [ ] Applied color customization (teal/coral/navy)
- [ ] Updated fonts (Playfair/Manrope)
- [ ] Applied animations (Framer Motion + easing)
- [ ] Made responsive (mobile-first)
- [ ] Added accessibility (ARIA, focus states)
- [ ] Tested on desktop/mobile/tablet
- [ ] Verified animations smooth on scroll
- [ ] Checked Tailwind classes are correct
- [ ] No console errors

---

## Example: Building a Hero Section

### 1. Get Inspiration
```
Agent Task: Search 21.dev for "hero section with stats"
Result: Multiple hero designs with animations and stats cards
```

### 2. Find Best Fit
Choose design that has:
- Large headline
- Subheadline
- CTA buttons
- Stats cards
- Background image/gradient

### 3. Build Component
```
Agent Task: Build hero section using 21.dev inspiration
Input: Exact copy from IMPLEMENTATION-PLAN.md Section 3.1
Output: React component skeleton
```

### 4. Customize

**Colors**:
```jsx
// Headlines - change from gray to white
className="text-white" // #F8FAFC

// CTA button - change from blue to teal
className="bg-teal-700 hover:bg-teal-600" // #0F766E

// Gradient background - navy with teal accents
className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"

// Stats glow - teal glow effect
style={{ boxShadow: "0 8px 30px rgba(15, 118, 110, 0.25)" }}
```

**Fonts**:
```jsx
// Headline
<h1 className="font-playfair text-5xl font-light">
  Rankings That Build Empires.
</h1>

// Subheadline
<p className="font-manrope text-lg font-light text-slate-300">
  Where industry leaders...
</p>

// Label
<span className="font-manrope text-xs font-semibold uppercase tracking-widest text-teal-400">
  NEW YORK • LONDON • DUBAI
</span>
```

**Animations**:
```jsx
import { motion } from "framer-motion";

const premiumEasing = [0.22, 1, 0.36, 1];

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: premiumEasing }}
>
  Content
</motion.div>
```

### 5. Refine Component
```
Agent Task: Refine hero component for polish
Input: Current component code
Output: Enhanced with better animations, improved spacing
```

---

## FAQ: 21.dev Integration

**Q: Can we use 21.dev components directly without changes?**
A: Not recommended. Always customize colors, fonts, and copy to match our design system.

**Q: Do we need to credit 21.dev?**
A: Check their license. Most premium tiers don't require credits in final product.

**Q: What if a component doesn't match our design exactly?**
A: Use 21.dev as inspiration/reference, build custom version with our specifications.

**Q: Should we use 21.dev for every component?**
A: No. Use for complex components (hero, forms, carousels). Build simple components from scratch.

**Q: How do we ensure consistency across components?**
A: Always apply same colors, fonts, animations, spacing. Use component variants.

---

## Quick Reference: Color Map

| Use Case | Color | Hex | Tailwind |
|----------|-------|-----|----------|
| **Primary** | Teal | #0F766E | `bg-teal-700` |
| **Primary Light** | Teal Pop | #14B8A6 | `bg-teal-500` |
| **Accent** | Coral | #FB7185 | `bg-rose-400` |
| **Background** | Navy Dark | #0B1220 | `bg-slate-950` |
| **Surface** | Navy | #111B2E | `bg-slate-900` |
| **Card** | Navy Light | #18243D | `bg-slate-800` |
| **Text Primary** | Light | #F8FAFC | `text-slate-50` |
| **Text Body** | Light-Medium | #CBD5E1 | `text-slate-300` |
| **Text Support** | Medium | #94A3B8 | `text-slate-400` |

---

## Resources

- **21.dev**: https://21.dev
- **Component Search**: Use search bar at 21.dev
- **Component Library**: Browse categories
- **Documentation**: Check 21.dev docs for latest features

---

## Next Steps

1. **Task 2** will use 21.dev for UI component building
2. Each section task can reference 21.dev for specific components
3. Final polish (Task 16) will use component refiner to perfect animations

