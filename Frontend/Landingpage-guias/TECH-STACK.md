# Sistema de Minutas - Tech Stack & Dependencies (Landing Page)

**Last Updated**: Janeiro 2026

---

## Core Framework

### React 19.2.0
- **Purpose**: UI library for building components
- **Why**: Latest stable React with improved performance and developer experience
- **Link**: https://react.dev
- **Versão no Projeto**: Já instalada e funcionando

### TypeScript (Recommended)
- **Purpose**: Type safety and development experience
- **Config**: jsconfig.json (JavaScript) or tsconfig.json (TypeScript)
- **Recommended**: Use JavaScript with JSDoc for simpler setup, TypeScript if team familiar

---

## Build & Development

### Vite 7.2.4
- **Purpose**: Build tool and dev server
- **Dev Server**: http://localhost:5173 (padrão do Vite)
- **Commands**:
  - `npm run dev` - Start dev server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build
- **Versão no Projeto**: Já instalada e configurada

**vite.config.js Configuration**:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@sections': path.resolve(__dirname, './src/components/sections'),
      '@data': path.resolve(__dirname, './src/data'),
      '@utils': path.resolve(__dirname, './src/lib/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
```

---

## Animations & Motion

### Framer Motion 12.29.2 (Já Instalado)
- **Purpose**: Animation library for React
- **Versão no Projeto**: 12.29.2 (já instalada e funcionando)
- **Features Usadas no Projeto**:
  - Scroll-triggered animations: `whileInView`
  - Hover interactions: `whileHover`, `whileTap`
  - Custom easing: Premium smooth ([0.16, 1, 0.3, 1])
  - Stagger effects
  - Layout animations

**Example Easing**:
```javascript
const premiumEasing = [0.22, 1, 0.36, 1];

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: premiumEasing }}
  viewport={{ once: true, margin: "-100px" }}
>
  Content
</motion.div>
```

---

## UI Components & Icons

### Lucide React 0.563.0 (Já Instalado)
- **Purpose**: Icon library with 500+ icons
- **Versão no Projeto**: 0.563.0 (já instalada)
- **Usage**:
  ```jsx
  import { Search, Menu, X, ArrowRight, Star } from 'lucide-react'
  ```
- **Para Landing Page**: Ideal para ícones de features, processo, CTAs

### ShadCN/UI Components
- **Purpose**: Pre-built, accessible React components with Tailwind CSS
- **Benefits**:
  - Copy-paste component code directly into your project
  - Full control over component styling
  - Built on Radix UI primitives
  - Fully typed with TypeScript

**Installation**:
```bash
# Initialize ShadCN/UI
npx shadcn-ui@latest init

# When prompted:
# - Style: Default
# - Color: Slate
# - CSS variables: Yes
```

**Common Components to Use**:
- Dialog (Modals)
- Accordion (FAQ section)
- Button (Pre-styled variants)
- Card (Content containers)
- Input (Form fields)
- Tabs (Service categories)
- Carousel (Testimonials slider)

**Usage**:
```bash
# Add specific components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add accordion
```

### Radix UI (Foundation for ShadCN)
- **Automatically installed** with ShadCN/UI
- **Components Used**:
  - Dialog primitives (for modals)
  - Accordion primitives (for FAQ)
  - Tabs primitives (for navigation)

### 21.dev Component Library & Inspiration Tool
- **Purpose**: Pre-designed, premium UI components and design inspiration
- **How to Use**: Access via Claude Code MCP Magic tools
  - `mcp__magic__21st_magic_component_builder` - Build custom components
  - `mcp__magic__21st_magic_component_inspiration` - Get design inspiration
  - `mcp__magic__21st_magic_component_refiner` - Refine existing components

**Component Categories Available on 21.dev**:
- Buttons & CTAs
- Cards & Containers
- Forms & Inputs
- Navigation & Menus
- Hero sections
- Feature sections
- Testimonial cards
- Pricing tables
- FAQ sections
- Footer designs

**Example Workflow**:
1. Need a Hero section design? → Use `/21st` or search 21.dev
2. Get design inspiration → Component refiner shows best practices
3. Copy code directly → Customize with your colors/copy
4. Refine styling → Use component refiner tool

**Integration with Our Design System**:
All 21.dev components will be customized with:
- Teal primary color (#0F766E)
- Coral accent (#FB7185)
- Navy background (#0B1220)
- Manrope + Playfair Display fonts

---

## Styling

### Tailwind CSS 4.1.18 (Via Vite Plugin)
- **Purpose**: Utility-first CSS framework
- **Configuration**: Vite plugin @tailwindcss/vite (já instalado no projeto)
- **Import**: Via CSS `@import "tailwindcss";` no src/index.css
- **Versão no Projeto**: Tailwind v4 com @theme inline (já configurado)

**Design System "Platinum & Onyx"** (já configurado em src/index.css):
```css
/* O projeto já usa um design system completo com OKLCH */
/* Baseado em paleta premium notarial - NO NEED TO CHANGE */

@theme inline {
  /* Cores bridgeadas das CSS variables */
  --color-primary: var(--primary);
  --color-accent: var(--accent);
  --color-accent-vivid: var(--accent-vivid);
  /* etc... */
}

/* Light theme "Ivory Platinum" */
--primary: oklch(30% 0.018 250);        /* Deep Slate */
--accent-vivid: oklch(70% 0.090 48);    /* Champagne Gold */
--teal-deep: oklch(45% 0.10 180);       /* Deep Teal */

/* Dark theme "Onyx" */
--background-dark: oklch(10% 0.010 250); /* Deep onyx black */
--primary-dark: oklch(80% 0.010 250);    /* Silver luminoso */
```

**Fontes do Projeto:**
- **Geist** (sans-serif) - Principal
- **Geist Mono** (monospace) - Código

---

## Typography

### Geist Font Family (Já Configurado no Projeto)
- **Geist** (sans-serif)
  - **Use**: Todos os textos (headlines, body, labels)
  - **Weight**: Variable font (100-900)
  - **Inspiração**: Apple SF Pro, excelente legibilidade
  - **Já instalado**: Configurado via --font-sans em index.css

- **Geist Mono** (monospace)
  - **Use**: Código, dados técnicos
  - **Weight**: Variable font
  - **Já instalado**: Configurado via --font-mono em index.css

**Para a Landing Page:**
- Manter Geist como fonte principal (já perfeita para o contexto)
- Ou usar fontes web seguras se quiser diferenciação:
  - **Alternativa Serif**: Georgia, "Times New Roman" (para headlines elegantes)
  - **Alternativa Sans**: Inter, -apple-system (para compatibilidade)

---

## Project Structure

```
apex-digital/
├── public/
│   ├── index.html          (Main HTML with Tailwind CDN, Google Fonts)
│   └── images/             (Static images)
├── src/
│   ├── index.css           (Global styles + design system variables)
│   ├── App.jsx             (Main app component)
│   ├── main.jsx            (React DOM render)
│   ├── components/
│   │   ├── ui/             (Reusable UI components)
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── SectionWrapper.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── AnimatedText.jsx
│   │   │   └── StatCard.jsx
│   │   ├── sections/       (Page sections)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── CredibilityBar.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Process.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Differentiators.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── FinalCTA.jsx
│   │   │   └── Footer.jsx
│   │   └── MobileMenu.jsx
│   ├── lib/
│   │   └── utils.js        (Utility functions)
│   ├── data/
│   │   ├── copy.js         (All copy/text content)
│   │   ├── services.js     (Services data)
│   │   ├── team.js         (Team data)
│   │   ├── testimonials.js (Testimonials data)
│   │   └── faq.js          (FAQ data)
│   ├── hooks/
│   │   ├── useScrollPosition.js
│   │   ├── useInView.js
│   │   └── useMobileMenu.js
│   └── assets/
│       └── fonts/          (If custom fonts)
├── vite.config.js          (Vite configuration)
├── jsconfig.json           (or tsconfig.json)
├── package.json
├── package-lock.json
└── .gitignore
```

---

## Dependencies Summary (Projeto Atual)

### Production Dependencies (Já Instaladas)
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "framer-motion": "^12.29.2",
  "lucide-react": "^0.563.0",
  "react-router-dom": "^7.13.0"
}
```

### Development Dependencies (Já Instaladas)
```json
{
  "vite": "^7.2.4",
  "@vitejs/plugin-react": "^5.1.1",
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18",
  "typescript": "~5.9.3"
}
```

**Nota**: O projeto já está completamente configurado. Para a landing page, você só precisa criar novos componentes usando a stack existente.

### Optional Dependencies (for complex components)
```json
{
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-accordion": "^1.0.4"
}
```

---

## npm Scripts

**package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

---

## Installation Commands

```bash
# Create project
npm create vite@latest apex-digital -- --template react
cd apex-digital

# Install core dependencies
npm install
npm install framer-motion@^12.23.26 lucide-react@^0.562.0

# Optional: Install component libraries
npm install @radix-ui/react-dialog@^1.1.1 @radix-ui/react-accordion@^1.0.4

# For development
npm install -D tailwindcss postcss autoprefixer
```

---

## Tailwind CSS - CDN vs Build

### Using CDN (RECOMMENDED for this project)
✅ **Pros**:
- No build step needed
- Faster development
- Simpler setup
- All standard Tailwind classes available

❌ **Cons**:
- Larger CSS file (but cached)
- Can't use advanced customization easily

### Using PostCSS Build
✅ **Pros**:
- Optimized CSS (purged)
- Advanced customization
- Better for large projects

❌ **Cons**:
- More complex setup
- Slower development
- Extra build step

**For this project**: Use CDN approach as specified in IMPLEMENTATION-PLAN.md

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance Targets

- **Lighthouse Score**: 90+
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Bundle Size**: < 200KB (gzipped)

---

## Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
# Navigate to http://localhost:3000

# 3. Make changes
# Hot Module Replacement (HMR) will update automatically

# 4. When ready to deploy
npm run build

# 5. Test production build locally
npm run preview
```

---

## Version Lock

All dependencies are pinned to specific versions to ensure consistency across team members:

```json
{
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "framer-motion": "12.23.26",
  "lucide-react": "0.562.0",
  "vite": "6.2.0"
}
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### HMR Not Working
- Ensure Vite server is running on `0.0.0.0`
- Check firewall settings
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Tailwind Classes Not Applying
- Ensure CDN script is loaded in index.html
- Clear browser cache
- Use full class names (no string interpolation)

---

## Deployment

### Build Output
- Location: `dist/`
- Files: HTML, CSS, JS (all optimized)

### Deployment Targets
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static host (AWS S3 + CloudFront, etc.)

### Pre-deployment Checklist
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` shows correct output
- [ ] All links use relative paths
- [ ] Images are optimized
- [ ] Meta tags are correct

---

## References

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Google Fonts**: https://fonts.google.com

