// src/App.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MinutaProvider } from "./contexts/MinutaContext";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation, ErrorBoundary } from "./components/layout";

// Lazy load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UploadDocumentos = lazy(() => import("./pages/UploadDocumentos"));
const Processando = lazy(() => import("./pages/Processando"));
const ConferenciaOutorgantes = lazy(() => import("./pages/ConferenciaOutorgantes"));
const ConferenciaOutorgados = lazy(() => import("./pages/ConferenciaOutorgados"));
const ConferenciaImoveis = lazy(() => import("./pages/ConferenciaImoveis"));
const ParecerJuridico = lazy(() => import("./pages/ParecerJuridico"));
const ConferenciaNegocio = lazy(() => import("./pages/ConferenciaNegocio"));
const MinutaFinal = lazy(() => import("./pages/MinutaFinal"));

// Loading spinner for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MinutaProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <GlobalNavigation />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Minuta Flow */}
                <Route path="/minuta/nova" element={<UploadDocumentos />} />
                <Route path="/minuta/:id/processando" element={<Processando />} />
                <Route path="/minuta/:id/outorgantes" element={<ConferenciaOutorgantes />} />
                <Route path="/minuta/:id/outorgados" element={<ConferenciaOutorgados />} />
                <Route path="/minuta/:id/imoveis" element={<ConferenciaImoveis />} />
                <Route path="/minuta/:id/parecer" element={<ParecerJuridico />} />
                <Route path="/minuta/:id/negocio" element={<ConferenciaNegocio />} />
                <Route path="/minuta/:id/minuta" element={<MinutaFinal />} />
              </Routes>
            </Suspense>
            <Toaster position="top-right" richColors closeButton />
          </div>
        </Router>
      </MinutaProvider>
    </ErrorBoundary>
  );
}

export default App;
