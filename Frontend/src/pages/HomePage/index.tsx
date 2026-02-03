// src/pages/HomePage/index.tsx
// Minimal homepage for "Cartório Paulista" - Apple-style design with 2 sections

import { HomeHero } from './sections/HomeHero';
import { HomeFuncionalidades } from './sections/HomeFuncionalidades';

export function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HomeHero />
      <HomeFuncionalidades />
    </main>
  );
}
