# Design System - Sistema de Minutas

## Visao Geral

Design system premium com suporte dual-theme (light/dark), construido sobre principios de design da Apple, Linear e Vercel. Utiliza Tailwind CSS v4.1 com cores OKLCH para uniformidade perceptual.

---

## Fundamentos

### Tipografia

**Font Family:** Geist Sans (by Vercel)

```css
--font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

**Por que Geist?**
- Criada pela Vercel, inspirada no SF Pro da Apple
- Excelente x-height para legibilidade em interfaces densas
- Estetica moderna sem ser generica (diferente do Inter)
- Otimizada para telas com renderizacao crisp em todos os tamanhos

**Escala tipografica:**
```
h1: 2.25rem (36px) - font-weight: 600
h2: 1.875rem (30px) - font-weight: 600
h3: 1.5rem (24px) - font-weight: 600
h4: 1.25rem (20px) - font-weight: 600
h5: 1.125rem (18px) - font-weight: 600
h6: 1rem (16px) - font-weight: 600

body: 1rem (16px) - line-height: 1.6
body-sm: 0.875rem (14px) - line-height: 1.5
caption: 0.8125rem (13px) - line-height: 1.4
overline: 0.75rem (12px) - uppercase, letter-spacing: 0.05em
```

### Sistema de Cores (OKLCH)

O sistema usa OKLCH (Oklab Lightness, Chroma, Hue) para:
- Uniformidade perceptual entre cores
- Melhor acessibilidade com contraste consistente
- Transicoes suaves entre temas
- Formato CSS moderno e future-proof

#### Tema Light (Warm Neutrals)
```css
--background: oklch(98.5% 0.004 85);      /* Off-white quente */
--foreground: oklch(15% 0.01 250);        /* Near-black azulado */
--card: oklch(99.5% 0.002 85);            /* Branco puro */
--primary: oklch(48% 0.16 265);           /* Indigo profundo */
--secondary: oklch(94% 0.006 85);         /* Cinza quente claro */
--muted-foreground: oklch(45% 0.01 250);  /* Cinza legivel (WCAG AA) */
--border: oklch(88% 0.008 85);            /* Borda sutil quente */
```

#### Tema Dark (Refined Deep Blue)
```css
--background: oklch(13% 0.015 250);       /* Azul-cinza profundo */
--foreground: oklch(96% 0.005 250);       /* Branco suave azulado */
--card: oklch(18% 0.018 250);             /* Superficie elevada */
--primary: oklch(65% 0.2 250);            /* Azul vibrante */
--secondary: oklch(22% 0.015 250);        /* Elevacao sutil */
--muted-foreground: oklch(70% 0.01 250);  /* Cinza legivel (WCAG AA) */
--border: oklch(30% 0.025 250);           /* Borda azulada sutil */
```

#### Cores Semanticas
```css
--destructive: oklch(55-62% 0.22-0.24 25);   /* Vermelho */
--success: oklch(52-68% 0.17-0.2 150-155);   /* Verde */
--warning: oklch(75-78% 0.16 75);            /* Ambar */
--info: oklch(55-68% 0.15 240);              /* Azul ceu */
```

### Espacamentos

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 0.75rem;   /* 12px */
--spacing-lg: 1rem;      /* 16px */
--spacing-xl: 1.5rem;    /* 24px */
--spacing-2xl: 2rem;     /* 32px */
--spacing-3xl: 3rem;     /* 48px */
```

### Border Radius

```css
--radius: 0.625rem;                      /* 10px base */
--radius-sm: calc(var(--radius) - 4px);  /* 6px */
--radius-md: calc(var(--radius) - 2px);  /* 8px */
--radius-lg: var(--radius);              /* 10px */
--radius-xl: calc(var(--radius) + 4px);  /* 14px */
--radius-2xl: calc(var(--radius) + 8px); /* 18px */
```

### Sombras

**Light Theme:**
```css
--shadow-xs: 0 1px 2px hsl(40 30% 10% / 0.04);
--shadow-sm: 0 1px 3px hsl(...), 0 1px 2px hsl(...);
--shadow-md: 0 4px 6px -1px hsl(...), 0 2px 4px -2px hsl(...);
--shadow-lg: 0 10px 15px -3px hsl(...), 0 4px 6px -4px hsl(...);
```

**Dark Theme:** Sombras mais escuras e difusas com tonalidade azulada.

### Transicoes

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

---

## Theme Switcher

### Como Funciona

O theme switcher permite alternar entre temas light e dark com:

1. **Persistencia:** Salva preferencia no `localStorage`
2. **System Detection:** Respeita `prefers-color-scheme` do sistema
3. **No Flash:** Script inline no HTML previne flash de tema errado
4. **Animacao Suave:** Transicao de 300ms com easing premium

### Uso

```tsx
import { ThemeSwitcher, ThemeSwitcherCompact, useTheme } from '@/components/ui';

// Toggle completo (pill style)
<ThemeSwitcher size="md" />

// Toggle compacto (icon only)
<ThemeSwitcherCompact />

// Hook para controle programatico
const { theme, isDark, toggleTheme, setLightTheme, setDarkTheme } = useTheme();
```

### Localizacao

O ThemeSwitcher ja esta integrado no:
- **GlobalNavigation** (desktop: canto direito, mobile: drawer footer)

### Implementacao Tecnica

```tsx
// Aplica tema ao documento
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}
```

---

## Componentes UI

### Button

```tsx
import { Button, IconButton } from '@/components/ui';

// Variantes
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="success">Success</Button>
<Button variant="premium">Premium (gradient)</Button>
<Button variant="subtle">Subtle</Button>
<Button variant="link">Link</Button>

// Tamanhos
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon Only</Button>

// Estados
<Button loading loadingText="Salvando...">Salvar</Button>
<Button disabled>Desabilitado</Button>

// Com icones
<Button leftIcon={<PlusIcon />}>Adicionar</Button>
<Button rightIcon={<ArrowRight />}>Continuar</Button>

// Icon button
<IconButton aria-label="Fechar" variant="ghost">
  <XIcon />
</IconButton>
```

### Input

```tsx
import { Input } from '@/components/ui';

// Variantes
<Input variant="default" placeholder="Padrao" />
<Input variant="filled" placeholder="Filled" />
<Input variant="ghost" placeholder="Ghost" />
<Input variant="premium" placeholder="Premium (glow)" />

// Tamanhos
<Input inputSize="sm" />
<Input inputSize="default" />
<Input inputSize="lg" />

// Estados
<Input error placeholder="Com erro" />
<Input success placeholder="Com sucesso" />
<Input disabled placeholder="Desabilitado" />

// Com elementos
<Input leftElement={<SearchIcon />} placeholder="Buscar..." />
<Input rightElement={<EyeIcon />} type="password" />

// Com contador
<Input showCount maxCount={100} />
```

### Masked Inputs

```tsx
import { CPFInput, CNPJInput, PhoneInput, CEPInput, CurrencyInput, DateInput } from '@/components/ui';

<CPFInput onChange={(formatted, raw) => console.log(raw)} />
<CNPJInput onChange={(formatted, raw) => console.log(raw)} />
<PhoneInput onChange={(formatted, raw) => console.log(raw)} />
<CEPInput onChange={(formatted, raw) => console.log(raw)} />
<CurrencyInput onChange={(formatted, raw) => console.log(raw)} />
<DateInput onChange={(formatted, raw) => console.log(raw)} />
```

### Select

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger variant="default">
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcao1">Opcao 1</SelectItem>
    <SelectItem value="opcao2">Opcao 2</SelectItem>
  </SelectContent>
</Select>

// Variantes do trigger
<SelectTrigger variant="filled" />
<SelectTrigger variant="premium" />
<SelectTrigger error />
```

### Textarea

```tsx
import { Textarea } from '@/components/ui';

// Variantes (mesmas do Input)
<Textarea variant="default" />
<Textarea variant="premium" />

// Tamanhos
<Textarea textareaSize="sm" />
<Textarea textareaSize="lg" />
<Textarea textareaSize="xl" />

// Features
<Textarea showCount maxCount={500} />
<Textarea noResize />
<Textarea autoGrow />
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

// Variantes
<Card variant="default">...</Card>
<Card variant="elevated">...</Card>
<Card variant="interactive">...</Card>  // Hover lift
<Card variant="glass">...</Card>        // Glassmorphism
<Card variant="highlighted">...</Card>  // Primary accent
<Card variant="muted">...</Card>

// Padding
<Card padding="sm">...</Card>
<Card padding="default">...</Card>
<Card padding="lg">...</Card>

// Estrutura completa
<Card>
  <CardHeader bordered>
    <CardTitle>Titulo</CardTitle>
    <CardDescription>Descricao</CardDescription>
  </CardHeader>
  <CardContent>Conteudo</CardContent>
  <CardFooter bordered>Acoes</CardFooter>
</Card>
```

### Label

```tsx
import { Label, FormLabel, FieldLabel } from '@/components/ui';

// Variantes
<Label variant="default">Label padrao</Label>
<Label variant="muted">Label muted</Label>
<Label variant="caption">Caption text</Label>
<Label variant="overline">OVERLINE</Label>

// Com indicadores
<Label required>Campo obrigatorio</Label>
<Label optional>Campo opcional</Label>
<Label description="Texto auxiliar">Com descricao</Label>

// Form labels (com margem automatica)
<FormLabel htmlFor="email" required>Email</FormLabel>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox id="terms" />
<label htmlFor="terms">Aceito os termos</label>
```

### Dialog

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose
} from '@/components/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titulo</DialogTitle>
      <DialogDescription>Descricao</DialogDescription>
    </DialogHeader>
    <p>Conteudo do dialog</p>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancelar</Button>
      </DialogClose>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Skeleton Loaders

```tsx
import {
  Skeleton, SkeletonText, SkeletonHeading,
  SkeletonAvatar, SkeletonInput, SkeletonButton,
  SkeletonCard, SkeletonForm, SkeletonTable
} from '@/components/ui';

<Skeleton className="w-full h-10" />
<SkeletonText lines={3} />
<SkeletonHeading />
<SkeletonAvatar size="lg" />
<SkeletonCard />
<SkeletonForm fields={4} />
<SkeletonTable rows={5} columns={4} />
```

### Toast Notifications

```tsx
import { toast } from '@/components/ui';

toast.success('Sucesso!');
toast.error('Erro!');
toast.warning('Atencao!');
toast.info('Informacao');
toast.loading('Carregando...');
toast.promise(asyncFn, {
  loading: 'Salvando...',
  success: 'Salvo!',
  error: 'Erro ao salvar',
});
```

---

## Componentes de Formulario

### FormField

```tsx
import { FormField, FormFieldGroup } from '@/components/forms';

// Tipos disponiveis
<FormField
  label="Nome"
  type="text"  // text, email, tel, number, date
  value={value}
  onChange={setValue}
  required
  error="Campo obrigatorio"
  helperText="Digite seu nome completo"
/>

<FormField type="cpf" label="CPF" />
<FormField type="cnpj" label="CNPJ" />
<FormField type="phone" label="Telefone" />
<FormField type="cep" label="CEP" />
<FormField type="currency" label="Valor" />
<FormField type="masked-date" label="Data" />

<FormField
  type="select"
  label="Estado"
  options={[
    { value: 'SP', label: 'Sao Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
  ]}
/>

<FormField type="textarea" label="Observacoes" />

// Grupo de campos
<FormFieldGroup label="Dados Pessoais" columns={2}>
  <FormField label="Nome" />
  <FormField label="Email" />
</FormFieldGroup>
```

### FormSection

```tsx
import { FormSection } from '@/components/forms';

<FormSection
  title="Informacoes Pessoais"
  description="Preencha os dados abaixo"
  icon={<UserIcon />}
  collapsible
>
  {/* campos */}
</FormSection>
```

---

## Componentes de Layout

### GlobalNavigation

Navegacao global premium com glassmorphism e theme switcher integrado.

```tsx
import { GlobalNavigation } from '@/components/layout';

// Usado no App.tsx
<GlobalNavigation />
```

Features:
- Desktop: Navbar fixa com blur, logo, links, botao CTA, theme switcher
- Mobile: Botao hamburger + drawer lateral
- Animacoes Framer Motion

### HubSidebar

Sidebar colapsavel para navegacao de hub.

```tsx
import { HubSidebar, HubSidebarMobile } from '@/components/layout';

<HubSidebar defaultCollapsed={false} />
<HubSidebarMobile isOpen={isOpen} onClose={close} />
```

### SectionCard

Cards de secao com multiplas variantes.

```tsx
import { SectionCard, SectionCardCompact, StatsCard, FeatureCard } from '@/components/layout';

// Variantes
<SectionCard variant="default" title="Titulo">...</SectionCard>
<SectionCard variant="elevated" />
<SectionCard variant="bordered" />
<SectionCard variant="highlight" />
<SectionCard variant="nested" />
<SectionCard variant="ghost" />

// Com icone e acao
<SectionCard
  title="Documentos"
  description="Upload de arquivos"
  icon={<FileIcon />}
  action={<Button size="sm">Adicionar</Button>}
/>

// Cards especializados
<StatsCard
  label="Total"
  value={42}
  trend="up"
  trendLabel="12%"
  icon={<ChartIcon />}
/>

<FeatureCard
  title="Nova Minuta"
  description="Criar nova minuta"
  icon={<PlusIcon />}
  onClick={handleClick}
/>
```

### FlowStepper

Indicador de progresso para fluxos multi-step.

```tsx
import { FlowStepper } from '@/components/layout';

<FlowStepper
  currentStep="outorgantes"
  // Steps: upload -> outorgantes -> outorgados -> imoveis -> parecer -> negocio -> minuta
/>
```

### PageHeader

Cabecalho de pagina padronizado.

```tsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="Titulo da Pagina"
  subtitle="Subtitulo opcional"
  backTo="/dashboard"
  actions={<Button>Acao</Button>}
/>
```

### Breadcrumbs

Navegacao hierarquica.

```tsx
import { Breadcrumbs, BreadcrumbBar, generateBreadcrumbs } from '@/components/ui';

<BreadcrumbBar /> // Automatico baseado na rota

<Breadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Minutas', href: '/dashboard/minutas' },
    { label: 'Nova Minuta' },
  ]}
/>
```

---

## Classes Utilitarias

### Transicoes

```css
.transition-theme    /* Transicao suave para mudancas de tema */
.surface-interactive /* Hover/active para superficies clicaveis */
```

### Elevacao

```css
.elevation-1  /* shadow-sm */
.elevation-2  /* shadow-md */
.elevation-3  /* shadow-lg */
.elevation-4  /* shadow-xl */
```

### Efeitos

```css
.glass           /* Glassmorphism (blur + transparency) */
.glow-primary    /* Glow com cor primaria */
.bg-gradient-subtle /* Gradiente sutil de fundo */
```

### Scrollbar

```css
.scrollbar-thin  /* Scrollbar personalizada fina */
.scrollbar-none  /* Esconde scrollbar (mantendo scroll) */
```

### Texto

```css
.text-balance   /* Balanceamento de texto */
.truncate-2     /* Truncar em 2 linhas */
.truncate-3     /* Truncar em 3 linhas */
```

### Animacoes

```css
.skeleton          /* Shimmer loading */
.animate-fade-in   /* Fade in com slide up */
.animate-subtle-pulse /* Pulse sutil */
.animate-spin      /* Rotacao continua */
```

---

## Acessibilidade

### Focus States

Todos os elementos interativos tem focus ring consistente:
```css
focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Animacoes desabilitadas */
}
```

### High Contrast

```css
@media (prefers-contrast: high) {
  /* Bordas e textos mais contrastados */
}
```

### ARIA

- Labels: `required`, `aria-invalid`, `aria-describedby`
- Buttons: `aria-disabled`, `aria-busy` (loading)
- Theme Switcher: `role="switch"`, `aria-checked`

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                 # Componentes base (atomic)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── skeleton.tsx
│   │   ├── theme-switcher.tsx
│   │   ├── masked-input.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── sonner.tsx      # Toast notifications
│   │   └── index.ts        # Barrel export
│   │
│   ├── forms/              # Componentes de formulario
│   │   ├── FormField.tsx
│   │   ├── FormSection.tsx
│   │   ├── EditableField.tsx
│   │   ├── AddressFields.tsx
│   │   ├── ContactFields.tsx
│   │   └── index.ts
│   │
│   └── layout/             # Componentes de layout
│       ├── GlobalNavigation.tsx
│       ├── HubSidebar.tsx
│       ├── SectionCard.tsx
│       ├── PageHeader.tsx
│       ├── FlowStepper.tsx
│       ├── FlowNavigation.tsx
│       ├── CollapsibleSection.tsx
│       ├── FieldGrid.tsx
│       └── index.ts
│
├── index.css               # Design tokens e estilos base
└── lib/
    └── utils.ts            # Utilidades (cn, etc.)
```

---

## Checklist de Consistencia

### Cores
- [x] Todas as cores usam CSS variables
- [x] Light theme: warm neutrals
- [x] Dark theme: refined deep blue
- [x] Cores semanticas (destructive, success, warning, info)
- [x] Contraste WCAG AA para muted-foreground

### Tipografia
- [x] Geist Sans carregado corretamente
- [x] Escala tipografica consistente
- [x] Letter-spacing ajustado para headings

### Espacamentos
- [x] Sistema de spacing generoso (Apple-like)
- [x] Padding consistente em cards e sections
- [x] Gap padrao em grids e flex

### Sombras
- [x] Sombras sutis mas visiveis
- [x] Warmth matching no light theme
- [x] Sombras mais difusas no dark theme

### Transicoes
- [x] Duracao padrao: 200ms
- [x] Easing suave (cubic-bezier)
- [x] Transicao de tema: 300ms

### Acessibilidade
- [x] Focus states visiveis
- [x] Reduced motion support
- [x] High contrast mode
- [x] ARIA labels

---

## Proximos Passos (Opcional)

1. **Documentacao Storybook** - Criar stories para cada componente
2. **Testes Visuais** - Chromatic ou Percy para regressions
3. **Tokens JSON** - Exportar tokens para outras plataformas
4. **Dark Mode Auto** - Suporte a `prefers-color-scheme` automatico
5. **RTL Support** - Suporte a idiomas right-to-left

---

*Design System v3.0 - Sistema de Minutas - Cartorio Pro*
