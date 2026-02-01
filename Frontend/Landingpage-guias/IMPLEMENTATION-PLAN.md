# Digital Marketing SEO Agency - Implementation Plan

> **Project**: High-Ticket Digital Marketing & SEO Agency Landing Page
> **Language**: English (Copy & UI)
> **Framework**: React 19.2.3 + Vite 6.2.0
> **Styling**: Tailwind CSS (CDN) + Custom Theme
> **Animations**: Framer Motion 12.23.26
> **Design System**: Premium Dark Theme with Teal & Coral Accents

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Identity & Design System](#2-brand-identity--design-system)
3. [Complete Copy Document](#3-complete-copy-document)
4. [Implementation Tasks](#4-implementation-tasks)
5. [Task Execution Guide](#5-task-execution-guide)

---

## 1. Project Overview

### 1.1 Business Context

**Company Type**: Premium Digital Marketing & SEO Agency
**Target Clients**:
- Fortune 500 Companies
- Fast-growing startups seeking market dominance
- E-commerce brands with $1M+ revenue
- SaaS companies seeking organic growth

**Service Price Range**: $5,000 - $50,000+/month retainers

**Core Value Proposition**:
"We don't just rank websites—we engineer market dominance through data-driven SEO and strategic digital marketing that delivers measurable revenue growth."

### 1.2 Page Structure (12 Sections)

Following the AIDA framework for high-ticket:

```
PHASE 1: ATTENTION (0-5 seconds)
├── Section 1: Hero
├── Section 2: Credibility Bar (Logos)

PHASE 2: INTEREST (5-30 seconds)
├── Section 3: Results/Transformations (Case Studies)
├── Section 4: Services

PHASE 3: DESIRE (30-90 seconds)
├── Section 5: Process/Journey
├── Section 6: Team/Expertise
├── Section 7: Differentiators

PHASE 4: VALIDATION (90-150 seconds)
├── Section 8: Testimonials
├── Section 9: Investment/Pricing (Optional)

PHASE 5: OBJECTION RESOLUTION (150-180 seconds)
├── Section 10: FAQ

PHASE 6: CONVERSION (180+ seconds)
├── Section 11: Final CTA
├── Section 12: Footer
```

---

## 2. Brand Identity & Design System

### 2.1 Color Palette

```css
/* Primary Colors */
--primary: #0F766E;           /* Evergreen Teal */
--primary-light: #14B8A6;     /* Teal Pop (hovers) */
--primary-dark: #134E4A;      /* Deep Teal */

/* Accent */
--accent: #FB7185;            /* Friendly Coral */
--accent-hover: #FF8597;      /* Coral Light */

/* Backgrounds (Cool + Modern: Tech-trusted aesthetic) */
--bg-primary: #0B1220;        /* Deep Navy Charcoal */
--bg-secondary: #111B2E;      /* Dark Surface */
--bg-tertiary: #18243D;       /* Cards */
--bg-elevated: #1F2D4A;       /* Hovers */

/* Text */
--text-primary: #F8FAFC;      /* Headlines */
--text-secondary: #CBD5E1;    /* Body */
--text-tertiary: #94A3B8;     /* Supporting */
--text-muted: #64748B;        /* Labels */

/* Feedback */
--success: #22C55E;
--error: #EF4444;
--warning: #F59E0B;
```

### 2.2 Typography

```css
/* Headings - Serif */
font-family: 'Playfair Display', Georgia, serif;

/* Body - Sans-serif */
font-family: 'Inter', 'Helvetica Neue', sans-serif;

/* Hero Title */
font-size: clamp(3rem, 8vw, 5rem);
font-weight: 300;
line-height: 1.1;
letter-spacing: -0.02em;

/* Section Titles */
font-size: clamp(2.5rem, 5vw, 4rem);
font-weight: 300;

/* Body */
font-size: 1rem;
font-weight: 300;
line-height: 1.7;
max-width: 65ch;
```

### 2.3 Spacing System

```css
--section-padding-y: clamp(4rem, 10vw, 8rem);
--section-padding-x: clamp(1rem, 5vw, 4rem);
--container-max: 1400px;
```

### 2.4 Component Styles

```css
/* Border Radius */
--radius-sm: 0.5rem;    /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-2xl: 2rem;     /* 32px */

/* Shadows */
--shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
--glow-primary: 0 8px 30px rgba(15, 118, 110, 0.25);
--glow-accent: 0 8px 30px rgba(251, 113, 133, 0.25);

/* Glass Effect */
background: rgba(17, 27, 46, 0.8);
backdrop-filter: blur(16px);
border: 1px solid rgba(20, 184, 166, 0.15);
```

---

## 3. Complete Copy Document

### 3.1 Hero Section

**Badge**: `NEW YORK • LONDON • DUBAI`

**Headline**:
```
Rankings That Build Empires.
```

**Subheadline**:
```
Where industry leaders and ambitious brands engineer market dominance—through data-driven SEO and strategic digital marketing that delivers measurable revenue.
```

**Primary CTA**: `Schedule Strategy Session`

**Secondary CTA**: `Explore Our Results →`

**Social Proof Line**: `Trusted by 150+ Category Leaders Across 23 Countries`

**Logo Bar**: Forbes, Inc., Entrepreneur, TechCrunch, Fast Company

**Hero Stats** (3 stats):
| Value | Label |
|-------|-------|
| $2.8B+ | Revenue Generated |
| 847% | Average ROI |
| 15+ | Years of Excellence |

---

### 3.2 Credibility Bar

**Section Label**: `AS FEATURED IN`

**Logos**: Forbes, Inc., Entrepreneur, TechCrunch, Fast Company, Business Insider

---

### 3.3 Results Section (Case Studies)

**Section Label**: `PROVEN RESULTS`

**Headline**:
```
Transformations That Speak Volumes
```

**Subheadline**:
```
Real results from real partnerships. We don't just promise growth—we engineer it.
```

**Case Studies** (4 cards):

| Client | Industry | Metric | Before | After | Timeline |
|--------|----------|--------|--------|-------|----------|
| TechFlow SaaS | B2B Software | Organic Revenue | $120K/mo | $2.1M/mo | 18 months |
| Luxe Retail | E-Commerce | Organic Traffic | 45K/mo | 890K/mo | 12 months |
| FinanceHub | FinTech | Lead Generation | 230/mo | 4,200/mo | 14 months |
| HealthCore | Healthcare | Market Position | Page 4 | #1 for 340 keywords | 16 months |

**CTA**: `View Full Case Studies →`

---

### 3.4 Services Section

**Section Label**: `OUR EXPERTISE`

**Headline**:
```
Strategic Solutions for Market Leaders
```

**Subheadline**:
```
Every engagement is custom-architected to your market position and growth objectives.
```

**Services** (6 cards):

#### 1. Enterprise SEO (FLAGSHIP - Large Card)
- **Badge**: `SIGNATURE SERVICE`
- **Title**: Enterprise SEO
- **Description**: Comprehensive organic growth strategies for brands ready to dominate their market. Technical excellence meets strategic content that compounds.
- **Features**:
  - Full technical infrastructure audit
  - Content strategy & creation
  - Authority building at scale
  - Executive reporting & insights

#### 2. Performance Marketing
- **Badge**: `HIGH-IMPACT`
- **Title**: Performance Marketing
- **Description**: Paid media strategies that maximize every dollar. From PPC to programmatic, engineered for ROAS.
- **Features**:
  - Multi-channel campaign management
  - Advanced attribution modeling
  - Creative optimization

#### 3. Content Strategy
- **Title**: Content Strategy
- **Description**: Thought leadership content that positions your brand as the definitive authority in your space.
- **Features**:
  - Editorial calendar development
  - Content production at scale
  - Distribution & amplification

#### 4. Technical SEO
- **Title**: Technical SEO
- **Description**: Deep technical optimization that ensures search engines can fully access and understand your value.
- **Features**:
  - Core Web Vitals optimization
  - Site architecture refinement
  - Schema & structured data

#### 5. Analytics & Intelligence
- **Badge**: `DATA-DRIVEN`
- **Title**: Analytics & Intelligence
- **Description**: Custom dashboards and predictive analytics that transform data into strategic decisions.
- **Features**:
  - Custom attribution models
  - Competitive intelligence
  - Predictive forecasting

#### 6. International SEO
- **Title**: International SEO
- **Description**: Global expansion strategies for brands ready to dominate new markets across languages and regions.
- **Features**:
  - Multi-language optimization
  - Regional market analysis
  - Hreflang implementation

**CTA**: `Discuss Your Growth Strategy →`

---

### 3.5 Process Section

**Section Label**: `YOUR JOURNEY`

**Headline**:
```
From Strategy to Dominance
```

**Subheadline**:
```
A proven methodology refined over 15 years and 500+ successful partnerships.
```

**Steps** (4 steps):

#### Step 1: Discovery
- **Icon**: Compass/Search
- **Title**: Discovery
- **Description**: Deep-dive into your market position, competitors, and growth opportunities through our proprietary audit framework.
- **Duration**: Week 1-2

#### Step 2: Strategy
- **Icon**: Target/Blueprint
- **Title**: Strategy
- **Description**: Your dedicated strategist architects a custom roadmap with clear milestones, KPIs, and projected outcomes.
- **Duration**: Week 2-3

#### Step 3: Execution
- **Icon**: Rocket/Gear
- **Title**: Execution
- **Description**: Our specialist teams deploy your strategy with precision—from technical fixes to content creation and link building.
- **Duration**: Ongoing

#### Step 4: Optimization
- **Icon**: Chart/TrendingUp
- **Title**: Optimization
- **Description**: Continuous analysis and refinement. Weekly reporting, monthly strategy calls, and quarterly business reviews.
- **Duration**: Continuous

**CTA**: `Start Your Discovery →`

---

### 3.6 Team/Expertise Section

**Section Label**: `LEADERSHIP`

**Headline**:
```
Guided by Industry Veterans
```

**Subheadline**:
```
Our leadership team brings decades of experience from the world's most demanding brands.
```

**Team Members** (4 profiles):

#### 1. Michael Chen
- **Role**: Founder & CEO
- **Credentials**:
  - Former Google Search Quality Team
  - 15+ years in digital marketing
  - Speaker at MozCon, SMX, BrightonSEO
- **Photo**: Professional headshot (placeholder)

#### 2. Sarah Williams
- **Role**: Chief Strategy Officer
- **Credentials**:
  - Ex-McKinsey Digital Practice
  - Harvard MBA
  - Led $500M+ in client revenue growth

#### 3. James Morrison
- **Role**: VP of Technical SEO
- **Credentials**:
  - Former Engineering Lead at Moz
  - 20+ patents in search technology
  - Author of "Technical SEO at Scale"

#### 4. Elena Rodriguez
- **Role**: VP of Client Success
- **Credentials**:
  - 12+ years enterprise client management
  - 98% client retention rate
  - Certified in Executive Communication

**Stats Bar**:
| Value | Label |
|-------|-------|
| 127 | Team Members Globally |
| 15+ | Languages Spoken |
| 98% | Client Retention Rate |

---

### 3.7 Differentiators Section

**Section Label**: `THE APEX DIFFERENCE`

**Headline**:
```
Why Category Leaders Choose Us
```

**Differentiators** (6 items):

1. **Proprietary Technology**
   - Our custom-built SEO intelligence platform processes 2.3B data points monthly for competitive advantage.

2. **Executive Access**
   - Direct line to senior strategists. No account managers gatekeeping your growth.

3. **Transparent Reporting**
   - Real-time dashboards, weekly updates, and monthly strategy calls. No black boxes.

4. **Performance Guarantees**
   - We put our fees at risk. If we don't hit agreed benchmarks, you don't pay full price.

5. **Global Capability**
   - Boots on the ground in 12 markets with native-speaking specialists.

6. **Proven Methodology**
   - 500+ engagements refined into a repeatable framework for market dominance.

---

### 3.8 Testimonials Section

**Section Label**: `CLIENT VOICES`

**Headline**:
```
Partnerships That Transformed Businesses
```

**Testimonials** (4 testimonials):

#### Testimonial 1
- **Quote**: "They didn't just improve our SEO—they fundamentally changed how we think about digital growth. Our organic revenue is now our primary channel, and we've reduced CAC by 62%."
- **Name**: David Park
- **Title**: CMO, TechFlow
- **Result**: 1,650% organic revenue growth
- **Rating**: 5/5

#### Testimonial 2
- **Quote**: "The level of strategic thinking is unmatched. They're not an agency—they're an extension of our executive team. The ROI speaks for itself."
- **Name**: Jennifer Walsh
- **Title**: CEO, Luxe Retail
- **Result**: $34M additional revenue
- **Rating**: 5/5

#### Testimonial 3
- **Quote**: "We interviewed seven agencies. Apex was the only one that challenged our assumptions and showed us opportunities we'd completely missed. Best decision we made."
- **Name**: Marcus Thompson
- **Title**: VP Growth, FinanceHub
- **Result**: 18x lead generation increase
- **Rating**: 5/5

#### Testimonial 4
- **Quote**: "Their technical SEO work unlocked growth we didn't think was possible. Within six months, we went from invisible to dominating our category."
- **Name**: Dr. Amanda Foster
- **Title**: Founder, HealthCore
- **Result**: #1 rankings for 340 keywords
- **Rating**: 5/5

---

### 3.9 Investment Section (Optional)

**Section Label**: `INVESTMENT`

**Headline**:
```
Partnership Tiers
```

**Subheadline**:
```
Transparent investment levels designed for serious growth ambitions.
```

**Tiers** (3 tiers):

#### Growth
- **Range**: $5,000 - $15,000/month
- **For**: Emerging brands ready to accelerate
- **Includes**:
  - Dedicated strategist
  - Core SEO services
  - Monthly reporting
  - Quarterly strategy sessions

#### Enterprise
- **Range**: $15,000 - $35,000/month
- **Badge**: MOST POPULAR
- **For**: Established brands seeking dominance
- **Includes**:
  - Senior strategy team
  - Full-stack digital marketing
  - Weekly reporting
  - Monthly executive sessions
  - Custom technology solutions

#### Bespoke
- **Range**: $35,000+/month
- **For**: Market leaders requiring white-glove service
- **Includes**:
  - C-level strategic partnership
  - Unlimited scope
  - Real-time reporting
  - Dedicated team members
  - Performance guarantees

**Note**: "All partnerships begin with a complimentary strategy session to ensure mutual fit."

---

### 3.10 FAQ Section

**Section Label**: `FREQUENTLY ASKED`

**Headline**:
```
Questions Before We Begin
```

**FAQs** (8 questions):

#### Q1: What makes Apex different from other SEO agencies?
**A**: Unlike traditional agencies focused on rankings alone, we engineer holistic digital market positions. Our proprietary technology, senior-level teams, and performance guarantees ensure we're invested in your actual business outcomes—not just vanity metrics.

#### Q2: How long until we see results?
**A**: Meaningful SEO results typically emerge between months 3-6, with compounding growth thereafter. However, our performance marketing services can generate leads within weeks. During our strategy session, we'll provide realistic timelines based on your specific market and competition.

#### Q3: Do you work with companies in our industry?
**A**: We've delivered results across B2B SaaS, e-commerce, fintech, healthcare, professional services, and more. During our discovery phase, we assess market fit to ensure we can deliver exceptional results. We maintain strict category exclusivity—we won't work with your direct competitors.

#### Q4: What's included in the strategy session?
**A**: Our complimentary strategy session includes a preliminary audit of your digital presence, competitive landscape analysis, and identification of your highest-impact growth opportunities. There's no obligation—it's designed to demonstrate our thinking and ensure mutual fit.

#### Q5: How do your performance guarantees work?
**A**: For qualified engagements, we agree on specific KPIs and timelines upfront. If we don't deliver on agreed benchmarks, a portion of our fees are at risk. This aligns our incentives with your success and ensures accountability.

#### Q6: Can you work with our internal team?
**A**: Absolutely. We regularly embed with in-house teams, providing strategic direction, training, and specialized execution. Many clients use us as a strategic layer over their internal capabilities.

#### Q7: What reporting and communication can we expect?
**A**: You'll have access to real-time dashboards, weekly written updates, and scheduled strategy calls (frequency based on your partnership tier). Our commitment is radical transparency—you'll never wonder what we're doing or why.

#### Q8: How do we get started?
**A**: Begin with a complimentary strategy session. We'll assess your current position, identify opportunities, and determine if there's a strong mutual fit. From there, we'll propose a custom engagement designed for your specific goals.

---

### 3.11 Final CTA Section

**Headline**:
```
Ready to Dominate Your Market?
```

**Subheadline**:
```
Schedule your complimentary strategy session and discover the growth opportunities you're leaving on the table.
```

**Form Fields**:
1. Full Name (required)
2. Business Email (required)
3. Company Website (optional)
4. Monthly Marketing Budget (dropdown, optional)
   - Options: "Under $10K", "$10K-$25K", "$25K-$50K", "$50K+"

**Submit Button**: `Request Strategy Session`

**Alternative Contact**:
```
Prefer to talk? Call us directly: +1 (888) 555-0123
Or email: strategy@apexdigital.com
```

**Trust Elements**:
- ✓ Response within 24 business hours
- 🔒 Your information is never shared
- 📞 No obligation, no pressure

---

### 3.12 Footer

**Company Name**: Apex Digital

**Tagline**: Engineering Market Dominance

**Navigation**:
- Services
- Results
- About
- Insights (Blog)
- Careers
- Contact

**Contact Info**:
- Email: hello@apexdigital.com
- Phone: +1 (888) 555-0123

**Offices**:
- New York (HQ)
- London
- Dubai

**Social Links**: LinkedIn, Twitter, Instagram

**Legal Links**: Privacy Policy, Terms of Service

**Copyright**: © 2024 Apex Digital. All rights reserved.

---

## 4. Implementation Tasks

Each task below is designed to be executed independently by a separate Claude Code agent. Copy the entire task block when requesting implementation.

---

### TASK 1: Project Setup & Configuration

**Objective**: Initialize React + Vite project with all required dependencies and configuration files.

**Instructions for Agent**:
```
Create a new React + Vite project for a premium Digital Marketing SEO Agency landing page.

REQUIREMENTS:

1. Initialize Vite project with React 19:
   npm create vite@latest apex-digital -- --template react
   cd apex-digital

2. Install core dependencies:
   npm install
   npm install framer-motion lucide-react
   npm install -D tailwindcss postcss autoprefixer

3. Initialize ShadCN/UI:
   npx shadcn-ui@latest init
   (This will auto-install Radix UI)

4. Create project structure:
   /src
     /index.css (global styles + Tailwind)
     /index.html (with Google Fonts + Tailwind CDN)
     /App.jsx (main app)
     /components
       /ui (reusable + ShadCN components)
       /sections (page sections)
     /lib
       /utils.js (utility functions)
     /data (constants, copy)
     /hooks (custom hooks)
   /public
     /images

5. Configure index.html with:
   - Tailwind CSS via CDN (NOT PostCSS build)
   - Google Fonts (Manrope + Playfair Display)
   - Viewport meta tags
   - Meta tags for SEO

6. Set up Vite config (vite.config.js):
   - Path aliases: @components, @sections, @data, @utils, @hooks
   - Optimizations for production

7. Create src/index.css with:
   - CSS variables for design system (teal, coral, navy)
   - Tailwind @apply rules
   - Base styles
   - Custom utility classes

8. Configure TypeScript (optional but recommended):
   - jsconfig.json or tsconfig.json
   - Path aliases matching vite.config.js

DESIGN SYSTEM TO IMPLEMENT:
- Primary: #0F766E (Evergreen Teal)
- Primary Light: #14B8A6 (Teal Pop)
- Accent: #FB7185 (Friendly Coral)
- Background: #0B1220 (Deep Navy Charcoal)
- Text Primary: #F8FAFC (headlines)
- Text Secondary: #CBD5E1 (body)

FONTS:
- Manrope (sans-serif) - Body + Labels
- Playfair Display (serif) - Headlines

Refer to IMPLEMENTATION-PLAN.md Section 2 for complete design specifications.
```

**Deliverables**:
- [ ] Vite + React 19 project initialized
- [ ] All dependencies installed (Tailwind, Framer Motion, Lucide, etc.)
- [ ] Tailwind CSS configured via CDN in index.html
- [ ] Google Fonts (Manrope + Playfair Display) imported
- [ ] Project folder structure created
- [ ] src/index.css with design system variables
- [ ] vite.config.js with path aliases
- [ ] jsconfig.json or tsconfig.json configured
- [ ] npm scripts ready (dev, build, preview)

---

### TASK 2: Reusable UI Components

**Objective**: Create the foundational UI components using ShadCN/UI and custom components.

**Instructions for Agent**:
```
Create reusable UI components for the premium landing page using ShadCN/UI + custom components.

Read IMPLEMENTATION-PLAN.md for design specifications.
Reference TECH-STACK.md for ShadCN/UI setup.

SETUP:
1. Initialize ShadCN/UI:
   npx shadcn-ui@latest init
   - Style: Default
   - Color: Slate
   - CSS variables: Yes

2. Add ShadCN components:
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add accordion
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add form

CUSTOM COMPONENTS TO CREATE:

1. Button.jsx (extend ShadCN Button)
   - Variants: primary (teal), secondary (outline), ghost, coral (accent)
   - Sizes: sm, md, lg, xl
   - With icon support (left/right)
   - Premium hover animations (scale 1.03, glow effect with teal)
   - Uses color: #0F766E (teal), #FB7185 (coral)

2. Badge.jsx
   - For labels like "SIGNATURE SERVICE", "NEW", "MOST POPULAR"
   - Teal/coral accent colors
   - Uppercase, letter-spacing
   - Glass morphism background option

3. Card.jsx (extend ShadCN Card)
   - Glass morphism effect (navy background with blur)
   - Border glow on hover (teal border)
   - Optional image support
   - Flexible content area
   - Shadow with teal glow

4. SectionWrapper.jsx
   - Consistent section padding (from design system)
   - Optional background variants
   - Container with max-width
   - Gradient backgrounds option

5. SectionHeader.jsx
   - Label (small uppercase, teal color)
   - Headline (Playfair Display, light weight, white)
   - Subheadline (Manrope, secondary text color)
   - Centered variant option

6. AnimatedText.jsx
   - Blur-to-focus animation on scroll
   - Word-by-word reveal option
   - Uses Framer Motion with easing [0.22, 1, 0.36, 1]
   - Stagger effect for multiple words

7. StatCard.jsx
   - Large count-up value with animation
   - Label below (secondary text)
   - Optional icon (Lucide React)
   - Premium styling with teal accents

8. Input.jsx (extend ShadCN Input)
   - Styled for dark theme
   - Teal focus ring
   - Label styling
   - Error states

OPTIONAL: Use 21.dev for inspiration
- For component designs, use: /21st search "button", "card", etc.
- For design inspiration: mcp__magic__21st_magic_component_inspiration
- For refining designs: mcp__magic__21st_magic_component_refiner

STYLE REQUIREMENTS:
- All components use Tailwind + ShadCN base
- Dark theme (navy backgrounds)
- Teal (#0F766E) primary accents
- Coral (#FB7185) secondary accents
- Smooth animations (0.3-0.6s duration, [0.22, 1, 0.36, 1] easing)
- Accessible (focus states, ARIA labels, keyboard nav)
- Responsive (mobile-first)
- Glass morphism effects where appropriate

COLOR REFERENCES:
- Primary: #0F766E (Evergreen Teal)
- Primary Light: #14B8A6 (Teal Pop)
- Accent: #FB7185 (Friendly Coral)
- Background: #0B1220 (Deep Navy Charcoal)
- Text Primary: #F8FAFC
- Text Secondary: #CBD5E1

Place components in:
- /src/components/ui/ (custom base components)
- /src/components/ui/shadcn/ (ShadCN components, auto-generated)
```

**Deliverables**:
- [ ] Button component with variants
- [ ] Badge component
- [ ] Card component with glass effect
- [ ] SectionWrapper component
- [ ] SectionHeader component
- [ ] AnimatedText component
- [ ] StatCard component

---

### TASK 3: Navigation Component

**Objective**: Create a premium sticky navigation with transparency and blur effects.

**Instructions for Agent**:
```
Create the Navigation component for the landing page.

Read IMPLEMENTATION-PLAN.md for design and copy specifications.

REQUIREMENTS:

1. Navbar.tsx features:
   - Transparent on top, solid with blur on scroll
   - Logo (text-based: "APEX")
   - Navigation links: Services, Results, Process, About, FAQ
   - CTA Button: "Get Started"
   - Mobile hamburger menu
   - Smooth scroll to sections

2. MobileMenu.tsx:
   - Full-screen overlay
   - Animated entry (slide + fade)
   - Same links as desktop
   - Close button

3. Scroll behavior:
   - Detect scroll position
   - Add background blur after 100px scroll
   - Shrink height slightly on scroll

4. Logo styling:
   - "APEX" in Playfair Display
   - Gold accent on "A" or underline
   - Subtle animation on hover

ANIMATIONS:
- Links: underline from left on hover
- CTA: scale + glow on hover
- Mobile menu: staggered link entry
- Background transition: 0.3s ease

Place in /components/Navbar.tsx and /components/MobileMenu.tsx
```

**Deliverables**:
- [ ] Navbar with transparency/blur effect
- [ ] Mobile menu with animations
- [ ] Smooth scroll functionality
- [ ] Responsive design

---

### TASK 4: Hero Section

**Objective**: Create the above-the-fold Hero section with all elements.

**Instructions for Agent**:
```
Create the Hero section for the landing page.

Read IMPLEMENTATION-PLAN.md Section 3.1 for exact copy and structure.

HERO SECTION REQUIREMENTS:

1. Structure:
   - Full viewport height (100vh)
   - Two-column layout on desktop (60/40)
   - Stack on mobile

2. Left Column Content:
   - Badge: "NEW YORK • LONDON • DUBAI"
   - Headline: "Rankings That Build Empires."
   - Subheadline: Full text from plan
   - Primary CTA: "Schedule Strategy Session"
   - Secondary CTA: "Explore Our Results →"
   - Social proof: "Trusted by 150+ Category Leaders..."
   - Logo bar: 5 placeholder logos (Forbes, Inc., etc.)

3. Right Column:
   - Abstract visual element OR
   - Stats cards floating with animation
   - Stats: $2.8B+, 847%, 15+

4. Animations:
   - Headline: blur-to-focus reveal
   - Subheadline: fade in with delay
   - CTAs: slide up with stagger
   - Stats: count-up animation
   - Subtle floating animation on visuals

5. Background:
   - Gradient: radial from gold/dark to pure black
   - Optional: subtle grid pattern
   - Optional: floating particles

CRITICAL:
- CTA must be above the fold
- Social proof visible without scroll
- Mobile: stack vertically, maintain all elements

Place in /components/sections/Hero.tsx
```

**Deliverables**:
- [ ] Hero section with full copy
- [ ] Two-column responsive layout
- [ ] All animations implemented
- [ ] Stats with count-up
- [ ] Logo bar placeholder
- [ ] Mobile optimized

---

### TASK 5: Credibility Bar Section

**Objective**: Create the "As Featured In" logo bar.

**Instructions for Agent**:
```
Create the Credibility Bar section.

Read IMPLEMENTATION-PLAN.md Section 3.2 for specifications.

REQUIREMENTS:

1. Structure:
   - Section label: "AS FEATURED IN"
   - Row of 5-6 logos
   - Subtle divider above/below

2. Logos (use text placeholders or simple SVGs):
   - Forbes
   - Inc.
   - Entrepreneur
   - TechCrunch
   - Fast Company
   - Business Insider

3. Styling:
   - Logos in grayscale/muted
   - Subtle opacity (70%)
   - Hover: full opacity + slight gold tint
   - Even spacing with flex/grid

4. Animation:
   - Fade in when in view
   - Optional: infinite slow scroll (marquee)

5. Mobile:
   - 2 rows if needed
   - Smaller logo sizes
   - Maintained visibility

Place in /components/sections/CredibilityBar.tsx
```

**Deliverables**:
- [ ] Logo bar with 6 logos
- [ ] Hover effects
- [ ] Responsive layout
- [ ] Scroll animation

---

### TASK 6: Results/Case Studies Section

**Objective**: Create the social proof section showcasing client results.

**Instructions for Agent**:
```
Create the Results section with case study cards.

Read IMPLEMENTATION-PLAN.md Section 3.3 for exact copy and data.

REQUIREMENTS:

1. Section Header:
   - Label: "PROVEN RESULTS"
   - Headline: "Transformations That Speak Volumes"
   - Subheadline: from plan

2. Case Study Cards (4 cards):
   - Grid layout: 2x2 on desktop, 1 column mobile
   - Each card contains:
     - Client name (e.g., "TechFlow SaaS")
     - Industry tag
     - Before metric
     - After metric (large, gold color)
     - Growth percentage badge
     - Timeline

3. Card Design:
   - Glass morphism background
   - Border glow on hover
   - Before/After visual comparison
   - Metric emphasis (large typography)

4. Data from plan:
   - TechFlow: $120K → $2.1M (18mo)
   - Luxe Retail: 45K → 890K traffic (12mo)
   - FinanceHub: 230 → 4,200 leads (14mo)
   - HealthCore: Page 4 → #1 for 340 kw (16mo)

5. CTA at bottom:
   - "View Full Case Studies →"

6. Animations:
   - Cards fade in staggered
   - Metrics count up when in view
   - Hover: card lifts, border glows

Place in /components/sections/Results.tsx
```

**Deliverables**:
- [ ] Section with header
- [ ] 4 case study cards with data
- [ ] Before/After visualization
- [ ] Count-up animations
- [ ] Responsive grid
- [ ] CTA button

---

### TASK 7: Services Section

**Objective**: Create the services showcase with cards.

**Instructions for Agent**:
```
Create the Services section with service cards.

Read IMPLEMENTATION-PLAN.md Section 3.4 for complete copy and structure.

REQUIREMENTS:

1. Section Header:
   - Label: "OUR EXPERTISE"
   - Headline: "Strategic Solutions for Market Leaders"
   - Subheadline: from plan

2. Service Cards Grid:
   - 6 cards total
   - Card 1 (Enterprise SEO): larger, spans 2 columns
   - Cards 2-6: standard size

3. Card Structure:
   - Badge (optional): "SIGNATURE SERVICE", "HIGH-IMPACT", etc.
   - Icon (Lucide)
   - Title
   - Description (1-2 sentences)
   - Features list (2-4 bullets)
   - Subtle arrow/link indicator

4. Services from plan:
   1. Enterprise SEO (flagship)
   2. Performance Marketing
   3. Content Strategy
   4. Technical SEO
   5. Analytics & Intelligence
   6. International SEO

5. Styling:
   - Glass morphism cards
   - Gold accent on badges/icons
   - Hover: border glow, slight lift
   - Features: small text, checkmarks

6. Bottom CTA:
   - "Discuss Your Growth Strategy →"

7. Animations:
   - Cards stagger in
   - Icons subtle pulse on hover

Place in /components/sections/Services.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] 6 service cards with full copy
- [ ] Flagship card larger
- [ ] Icons for each service
- [ ] Hover animations
- [ ] Responsive grid
- [ ] Bottom CTA

---

### TASK 8: Process Section

**Objective**: Create the client journey/process visualization.

**Instructions for Agent**:
```
Create the Process section showing the client journey.

Read IMPLEMENTATION-PLAN.md Section 3.5 for copy and steps.

REQUIREMENTS:

1. Section Header:
   - Label: "YOUR JOURNEY"
   - Headline: "From Strategy to Dominance"
   - Subheadline: from plan

2. Process Steps (4 steps):
   - Visual timeline/connection between steps
   - Each step has:
     - Step number (styled)
     - Icon
     - Title
     - Description
     - Duration badge

3. Steps from plan:
   1. Discovery (Week 1-2)
   2. Strategy (Week 2-3)
   3. Execution (Ongoing)
   4. Optimization (Continuous)

4. Layout Options:
   - Desktop: horizontal timeline with steps below/above
   - Or: numbered vertical steps with connecting line
   - Mobile: vertical stack

5. Visual Elements:
   - Connecting line between steps (gold gradient)
   - Step numbers in circles
   - Icons above titles
   - Duration as subtle badge

6. CTA at bottom:
   - "Start Your Discovery →"

7. Animations:
   - Steps reveal sequentially as scrolled into view
   - Line draws as steps reveal
   - Icons have subtle animation

Place in /components/sections/Process.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] 4 process steps with full content
- [ ] Timeline visualization
- [ ] Duration indicators
- [ ] Responsive layout
- [ ] Scroll animations
- [ ] CTA button

---

### TASK 9: Team Section

**Objective**: Create the leadership team showcase.

**Instructions for Agent**:
```
Create the Team/Leadership section.

Read IMPLEMENTATION-PLAN.md Section 3.6 for team data.

REQUIREMENTS:

1. Section Header:
   - Label: "LEADERSHIP"
   - Headline: "Guided by Industry Veterans"
   - Subheadline: from plan

2. Team Cards (4 members):
   - Photo placeholder (gradient or abstract)
   - Name
   - Role
   - Credentials (2-3 bullets)
   - Optional: LinkedIn icon link

3. Team from plan:
   1. Michael Chen - Founder & CEO
   2. Sarah Williams - Chief Strategy Officer
   3. James Morrison - VP Technical SEO
   4. Elena Rodriguez - VP Client Success

4. Layout:
   - 4-column grid on desktop
   - 2-column on tablet
   - 1-column on mobile with carousel option

5. Card Design:
   - Elegant, minimal
   - Photo takes top half
   - Text below
   - Subtle hover effect

6. Stats Bar below team:
   - 127 Team Members
   - 15+ Languages
   - 98% Retention Rate

7. Animations:
   - Cards fade in staggered
   - Stats count up

Place in /components/sections/Team.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] 4 team member cards
- [ ] Photo placeholders
- [ ] Credentials display
- [ ] Stats bar
- [ ] Responsive layout
- [ ] Animations

---

### TASK 10: Differentiators Section

**Objective**: Create the "Why Choose Us" section.

**Instructions for Agent**:
```
Create the Differentiators section.

Read IMPLEMENTATION-PLAN.md Section 3.7 for content.

REQUIREMENTS:

1. Section Header:
   - Label: "THE APEX DIFFERENCE"
   - Headline: "Why Category Leaders Choose Us"

2. Differentiator Items (6 items):
   - Icon
   - Title
   - Description (1-2 sentences)

3. Items from plan:
   1. Proprietary Technology
   2. Executive Access
   3. Transparent Reporting
   4. Performance Guarantees
   5. Global Capability
   6. Proven Methodology

4. Layout Options:
   - 3x2 grid
   - Or: alternating left/right large feature blocks
   - Or: 2 columns of 3

5. Design:
   - Icons with gold accent
   - Clean, minimal cards or list items
   - Generous spacing
   - Optional: number or icon in circle

6. Animations:
   - Stagger reveal on scroll
   - Icons have subtle entrance animation

Place in /components/sections/Differentiators.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] 6 differentiator items
- [ ] Icons for each
- [ ] Responsive grid
- [ ] Animations

---

### TASK 11: Testimonials Section

**Objective**: Create the client testimonials showcase.

**Instructions for Agent**:
```
Create the Testimonials section.

Read IMPLEMENTATION-PLAN.md Section 3.8 for testimonial content.

REQUIREMENTS:

1. Section Header:
   - Label: "CLIENT VOICES"
   - Headline: "Partnerships That Transformed Businesses"

2. Testimonial Cards (4 testimonials):
   - Quote (in quotation marks, styled)
   - Client name
   - Title & company
   - Result metric (gold highlight)
   - Star rating (5 stars)
   - Optional: photo placeholder

3. Testimonials from plan:
   1. David Park, CMO TechFlow
   2. Jennifer Walsh, CEO Luxe Retail
   3. Marcus Thompson, VP Growth FinanceHub
   4. Dr. Amanda Foster, Founder HealthCore

4. Layout:
   - Masonry or grid layout
   - Or: carousel with peek
   - Featured testimonial larger

5. Design:
   - Large quotation mark decorative element
   - Card with glass effect
   - Result metric prominently displayed
   - Stars in gold

6. Animations:
   - Cards fade in
   - Optional: auto-scroll carousel
   - Hover: subtle lift

Place in /components/sections/Testimonials.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] 4 testimonial cards
- [ ] Quote styling
- [ ] Result metrics display
- [ ] Star ratings
- [ ] Responsive layout
- [ ] Animations

---

### TASK 12: FAQ Section

**Objective**: Create the expandable FAQ section.

**Instructions for Agent**:
```
Create the FAQ section with accordion.

Read IMPLEMENTATION-PLAN.md Section 3.10 for all Q&A content.

REQUIREMENTS:

1. Section Header:
   - Label: "FREQUENTLY ASKED"
   - Headline: "Questions Before We Begin"

2. FAQ Accordion (8 questions):
   - Expandable/collapsible items
   - Only one open at a time (or allow multiple)
   - Plus/minus or chevron icon
   - Smooth expand animation

3. Questions from plan:
   1. What makes Apex different...
   2. How long until results...
   3. Do you work with our industry...
   4. What's included in strategy session...
   5. How do guarantees work...
   6. Can you work with internal team...
   7. What reporting to expect...
   8. How do we get started...

4. Styling:
   - Clean, minimal design
   - Question: white text, medium weight
   - Answer: secondary text color
   - Divider lines between items
   - Active item: gold accent

5. Layout:
   - Single column, centered
   - Max-width for readability
   - Generous padding

6. Animations:
   - Smooth height transition
   - Icon rotation
   - Answer fade in

Place in /components/sections/FAQ.tsx
```

**Deliverables**:
- [ ] Section header
- [ ] Accordion component
- [ ] 8 FAQ items with full content
- [ ] Smooth animations
- [ ] Accessible (keyboard, ARIA)
- [ ] Responsive

---

### TASK 13: Final CTA Section

**Objective**: Create the conversion-focused final CTA with form.

**Instructions for Agent**:
```
Create the Final CTA section with contact form.

Read IMPLEMENTATION-PLAN.md Section 3.11 for copy and form structure.

REQUIREMENTS:

1. Section Layout:
   - Full-width with distinct background
   - Two columns: content left, form right
   - Stack on mobile

2. Left Column:
   - Headline: "Ready to Dominate Your Market?"
   - Subheadline: from plan
   - Trust elements:
     - ✓ Response within 24 hours
     - 🔒 Information never shared
     - 📞 No obligation

3. Right Column - Form:
   - Fields:
     - Full Name (required)
     - Business Email (required)
     - Company Website (optional)
     - Monthly Budget (dropdown, optional)
   - Submit: "Request Strategy Session"
   - Loading state for submit

4. Alternative Contact:
   - "Prefer to talk? Call +1 (888) 555-0123"
   - "Or email: strategy@apexdigital.com"

5. Form Design:
   - Dark inputs with subtle border
   - Gold focus ring
   - Placeholder text styled
   - Error states styled

6. Animations:
   - Form fields fade in staggered
   - Submit button hover effect
   - Success state animation

7. Background:
   - Gradient or pattern distinct from rest
   - Optional: subtle glow effect

Place in /components/sections/FinalCTA.tsx
```

**Deliverables**:
- [ ] Two-column layout
- [ ] Full form with validation
- [ ] All copy from plan
- [ ] Trust badges
- [ ] Alternative contact info
- [ ] Responsive design
- [ ] Form states (loading, success, error)

---

### TASK 14: Footer Section

**Objective**: Create the site footer with all links and info.

**Instructions for Agent**:
```
Create the Footer section.

Read IMPLEMENTATION-PLAN.md Section 3.12 for content.

REQUIREMENTS:

1. Footer Structure:
   - Main content area
   - Bottom bar (copyright, legal)

2. Main Content Columns:
   Column 1 - Brand:
   - Logo: "APEX"
   - Tagline: "Engineering Market Dominance"
   - Social icons: LinkedIn, Twitter, Instagram

   Column 2 - Navigation:
   - Services
   - Results
   - About
   - Insights
   - Careers
   - Contact

   Column 3 - Contact:
   - Email: hello@apexdigital.com
   - Phone: +1 (888) 555-0123

   Column 4 - Offices:
   - New York (HQ)
   - London
   - Dubai

3. Bottom Bar:
   - Copyright: © 2024 Apex Digital
   - Legal links: Privacy Policy, Terms

4. Design:
   - Subtle background (slightly lighter than page)
   - Grid layout
   - Sufficient padding
   - Link hover effects

5. Mobile:
   - Stack columns
   - Accordion for link groups (optional)
   - Centered content

Place in /components/sections/Footer.tsx
```

**Deliverables**:
- [ ] Multi-column footer
- [ ] All navigation links
- [ ] Contact information
- [ ] Social icons
- [ ] Legal links
- [ ] Responsive layout

---

### TASK 15: Page Assembly & Final Integration

**Objective**: Assemble all sections into the main page with proper ordering.

**Instructions for Agent**:
```
Assemble the complete landing page from all created sections.

Read IMPLEMENTATION-PLAN.md for section order and verify all sections exist.

REQUIREMENTS:

1. Page Structure (src/App.jsx):
   Import and render sections in order:
   1. Navbar (fixed)
   2. Hero
   3. CredibilityBar
   4. Results
   5. Services
   6. Process
   7. Team
   8. Differentiators
   9. Testimonials
   10. FAQ
   11. FinalCTA
   12. Footer

2. Smooth Scroll:
   - Add IDs to each section for navigation
   - Implement smooth scroll behavior
   - Account for fixed navbar offset

3. Page Metadata (in public/index.html):
   - Title: "Apex Digital | Premium SEO & Digital Marketing Agency"
   - Description: compelling meta description
   - Open Graph tags
   - Viewport meta tag

4. Performance:
   - Use regular <img> tags with loading="lazy"
   - Ensure proper image dimensions to avoid layout shift
   - Consider using WebP format with fallbacks
   - Check Lighthouse scores

5. Final Checks:
   - All CTAs link to correct section IDs
   - Mobile menu works correctly
   - All animations trigger properly
   - No console errors
   - Smooth scroll behavior working

6. Accessibility:
   - Skip to content link
   - Proper heading hierarchy (h1, h2, h3)
   - Alt text on all images
   - Focus states on interactive elements

Place in src/App.jsx and ensure index.html is properly configured.
```

**Deliverables**:
- [ ] Complete page assembly
- [ ] Smooth scroll navigation
- [ ] Section IDs for linking
- [ ] Metadata configured
- [ ] All sections rendering
- [ ] Mobile fully functional
- [ ] No errors

---

### TASK 16: Animation Polish & Performance

**Objective**: Final animation polish and performance optimization.

**Instructions for Agent**:
```
Polish all animations and optimize performance.

REQUIREMENTS:

1. Animation Consistency:
   - Review all sections for animation timing
   - Ensure consistent easing: [0.22, 1, 0.36, 1]
   - Stagger delays should be uniform

2. Scroll Animations:
   - All sections use viewport={{ once: true }}
   - Proper threshold for triggering
   - No animation on initial load jank

3. Hover States:
   - All interactive elements have hover feedback
   - Consistent scale values (1.02-1.05)
   - Proper transition duration (0.3s)

4. Reduced Motion:
   - Respect prefers-reduced-motion
   - Provide static alternative

5. Performance:
   - Run Lighthouse audit
   - Fix any LCP issues
   - Ensure CLS < 0.1
   - Optimize images if needed

6. Final Polish:
   - Number count-up animations
   - Logo bar subtle animation
   - Hero visual effects
   - Button glow effects

Test on:
- Chrome, Firefox, Safari
- Mobile devices
- Different viewport sizes
```

**Deliverables**:
- [ ] Consistent animations
- [ ] Reduced motion support
- [ ] Lighthouse score 90+
- [ ] Cross-browser tested
- [ ] Mobile animations smooth

---

## 5. Task Execution Guide

### How to Use This Plan

1. **Start with Task 1** - Project setup must come first
2. **Tasks 2-3** can be done in parallel (UI components + Navbar)
3. **Tasks 4-14** can be done in any order (sections are independent)
4. **Task 15** must be done after all sections are complete
5. **Task 16** is the final polish step

### For Each Agent Session

When starting a new Claude Code session for a task:

1. Copy the entire task block from this document
2. Include the context: "This is for a premium Digital Marketing SEO Agency landing page. The project uses React 19.2.3 + Vite 6.2.0, Tailwind CSS (CDN), and Framer Motion 12.23.26."
3. Reference this file for design specifications
4. Ask the agent to read IMPLEMENTATION-PLAN.md if needed

### Example Prompt Format

```
I'm building a premium Digital Marketing SEO Agency landing page.

Please execute TASK [X]: [Task Name]

Project context:
- React 19.2.3 + Vite 6.2.0
- Tailwind CSS (CDN) with custom theme
- Framer Motion 12.23.26 for animations
- Dark theme with teal & coral accents
- Dev server: http://localhost:3000

Read IMPLEMENTATION-PLAN.md for complete specifications.

[Paste full task instructions here]
```

### Quality Checklist Per Task

Before marking a task complete:
- [ ] All copy matches the plan
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations are smooth
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Accessibility basics met

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial implementation plan |

---

*This document serves as the single source of truth for the project implementation. All agents should reference this for copy, design specifications, and component requirements.*
