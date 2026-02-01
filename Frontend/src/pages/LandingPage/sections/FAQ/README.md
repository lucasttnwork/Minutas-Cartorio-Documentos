# FAQ Section - Sistema de Minutas Landing Page

## Overview
The FAQ (Frequently Asked Questions) section provides a comprehensive, categorized accordion interface for answering common user questions about the Minutas system.

## Component Structure

### Main Component
- **File**: `FAQ.tsx`
- **Type**: React Functional Component with Framer Motion animations
- **Data Source**: `landing-copy.ts`

### Key Features
1. **Categorized Questions**: 12 questions organized into 4 categories
   - Geral (General) - 3 questions
   - Técnico (Technical) - 3 questions
   - Segurança (Security) - 3 questions
   - Preço (Pricing) - 3 questions

2. **Interactive Accordion**:
   - Multiple items can be open simultaneously
   - Smooth expand/collapse animations
   - ChevronDown icon rotation on expand

3. **Animations**:
   - Staggered entrance animations
   - Scroll-triggered visibility
   - Smooth transitions

## Design Implementation

### Inspiration
Based on 21st.dev FAQ components with adaptations:
- Two-column layout (header left, questions right)
- Category-based organization
- Glassmorphism card effects
- Responsive design

### Visual Elements
- **Background**: Gradient with decorative blur elements
- **Cards**: Semi-transparent cards with backdrop blur
- **Typography**: Clear hierarchy with proper font sizes
- **Badge**: "FAQ" label with primary color accent
- **CTA**: Support contact link

## Data Structure

```typescript
{
  headline: "Perguntas Frequentes",
  subheadline: "Tudo que você precisa saber antes de começar.",
  perguntas: [
    {
      id: string,
      categoria: "geral" | "tecnico" | "seguranca" | "preco",
      pergunta: string,
      resposta: string
    }
  ]
}
```

## Testing

### Test Coverage: 92.85% (30 tests)
All tests passing with comprehensive coverage:

#### Test Categories
1. **Rendering** (5 tests)
   - Section rendering
   - Headline and subheadline
   - FAQ badge
   - Support contact link

2. **Questions and Categories** (5 tests)
   - Category labels
   - All 12 questions
   - Correct categorization
   - Total question count

3. **Accordion Interaction** (5 tests)
   - Default closed state
   - Click to expand
   - Multiple open accordions
   - Click to collapse
   - State persistence

4. **Accessibility** (4 tests)
   - Heading hierarchy
   - Clickable buttons
   - Link attributes
   - Keyboard navigation

5. **Content Validation** (4 tests)
   - Question text accuracy
   - Answer content
   - Security questions
   - Pricing questions

6. **Styling and Layout** (4 tests)
   - Section structure
   - Gradient background
   - Grid layout
   - Responsive padding

7. **Data Integration** (2 tests)
   - landing-copy.ts usage
   - Unique IDs

8. **Edge Cases** (3 tests)
   - Empty categories
   - Long content
   - Multiple interactions

## Files Created

```
src/pages/LandingPage/sections/FAQ/
├── FAQ.tsx                 # Main component
├── FAQ.test.tsx           # Comprehensive tests (30 tests)
├── index.ts               # Export barrel
└── README.md              # This file
```

```
src/components/ui/
└── accordion.tsx          # Radix UI Accordion component
```

## Dependencies Added

- `@radix-ui/react-accordion`: For accessible accordion functionality

## Integration

The FAQ section has been integrated into the main landing page:

```typescript
// src/pages/LandingPage/index.tsx
import { FAQ } from './sections/FAQ';

// In render:
<Comparacao />
<FAQ />
<CTAFinal />
```

## Usage Example

```tsx
import { FAQ } from './sections/FAQ';

export function LandingPage() {
  return (
    <main>
      {/* Other sections */}
      <FAQ />
      {/* More sections */}
    </main>
  );
}
```

## Accessibility Features

1. **Semantic HTML**: Proper section and heading structure
2. **ARIA**: Radix UI provides automatic ARIA attributes
3. **Keyboard Navigation**: Full keyboard support (Enter, Space, Tab)
4. **Focus Management**: Clear focus indicators
5. **Screen Readers**: Descriptive labels and content

## Responsive Design

- **Mobile**: Stacked layout, full-width accordion
- **Tablet**: Optimized spacing
- **Desktop**: Two-column layout (2/3 - 3/5 grid)

## Animation Details

- **Container**: Fade in with stagger
- **Items**: Slide up with fade
- **Accordion**: Smooth height transitions
- **Chevron**: 180° rotation

## Content Management

To update FAQ content, edit `src/pages/LandingPage/data/landing-copy.ts`:

```typescript
export const faq = {
  headline: "Your headline",
  subheadline: "Your subheadline",
  perguntas: [
    {
      id: "unique-id",
      categoria: "geral",
      pergunta: "Question?",
      resposta: "Answer."
    }
  ]
};
```

## Performance Considerations

1. **Framer Motion**: Animations are GPU-accelerated
2. **Lazy Content**: Accordion content only rendered when open
3. **Optimized Re-renders**: Proper React key usage
4. **Smooth Animations**: CSS transforms for performance

## Future Enhancements

Potential improvements:
1. Search functionality for questions
2. Analytics tracking on question opens
3. "Was this helpful?" feedback buttons
4. Related questions suggestions
5. Dynamic content loading from CMS

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Notes

- All questions and answers sourced from `LANDING-COPY-FINAL.md`
- Categories are hard-coded for structure consistency
- Support link points to `#contato` anchor
- Component follows existing design system patterns

## Related Documentation

- [Landing Copy Final](../../../../Landingpage-guias/LANDING-COPY-FINAL.md)
- [Design System](../../../../Landingpage-guias/GUIA-CARTORIO-ADAPTADO.md)
- [Radix UI Accordion Docs](https://www.radix-ui.com/primitives/docs/components/accordion)

---

**Created**: 2026-02-01
**Status**: Complete
**Test Coverage**: 92.85%
**Tests Passed**: 30/30
