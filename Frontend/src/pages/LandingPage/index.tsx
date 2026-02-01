import { LandingHeader } from './components/LandingHeader';
import { Hero } from './sections/Hero/Hero';
import { SocialProofBar } from './sections/SocialProofBar/SocialProofBar';
import { Transformacoes } from './sections/Transformacoes/Transformacoes';
import { ProblemaSolucao } from './sections/ProblemaSolucao/ProblemaSolucao';
import { ComoFunciona } from './sections/ComoFunciona/ComoFunciona';
import { Recursos } from './sections/Recursos/Recursos';
import { Seguranca } from './sections/Seguranca/Seguranca';
import { Depoimentos } from './sections/Depoimentos/Depoimentos';
import { Comparacao } from './sections/Comparacao';
import { FAQ } from './sections/FAQ';
import { CTAFinal } from './sections/CTAFinal';
import { Footer } from './sections/Footer';

export function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main data-testid="landing-page" className="min-h-screen bg-background pt-16 lg:pt-0">
        <Hero />
        <SocialProofBar />
        <Transformacoes />
        <ProblemaSolucao />
        <ComoFunciona />
        <Recursos />
        <Seguranca />
        <Depoimentos />
        <Comparacao />
        <FAQ />
        <CTAFinal />
        <Footer />
      </main>
    </>
  );
}
