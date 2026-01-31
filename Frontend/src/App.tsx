// src/App.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MinutaProvider } from "./contexts/MinutaContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation, ErrorBoundary } from "./components/layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Lazy load all pages for code splitting
const Login = lazy(() => import("./pages/Login"));
const DashboardHub = lazy(() => import("./pages/DashboardHub"));
const DashboardMinutas = lazy(() => import("./pages/DashboardMinutas"));
const DashboardAgentes = lazy(() => import("./pages/DashboardAgentes"));
const AgenteExtrator = lazy(() => import("./pages/AgenteExtrator"));
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
      <Router>
        <AuthProvider>
          <MinutaProvider>
            <div className="min-h-screen bg-background">
              <GlobalNavigation />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Root redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardHub />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard/minutas" replace />} />
                    <Route path="minutas" element={<DashboardMinutas />} />
                    <Route path="agentes" element={<DashboardAgentes />} />
                  </Route>

                  {/* Agentes individual pages */}
                  <Route
                    path="/agentes/:tipo"
                    element={
                      <ProtectedRoute>
                        <AgenteExtrator />
                      </ProtectedRoute>
                    }
                  />

                  {/* Minuta Flow - all protected */}
                  <Route
                    path="/minuta/nova"
                    element={
                      <ProtectedRoute>
                        <UploadDocumentos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/processando"
                    element={
                      <ProtectedRoute>
                        <Processando />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/outorgantes"
                    element={
                      <ProtectedRoute>
                        <ConferenciaOutorgantes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/outorgados"
                    element={
                      <ProtectedRoute>
                        <ConferenciaOutorgados />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/imoveis"
                    element={
                      <ProtectedRoute>
                        <ConferenciaImoveis />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/parecer"
                    element={
                      <ProtectedRoute>
                        <ParecerJuridico />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/negocio"
                    element={
                      <ProtectedRoute>
                        <ConferenciaNegocio />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minuta/:id/minuta"
                    element={
                      <ProtectedRoute>
                        <MinutaFinal />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
              <Toaster position="top-right" richColors closeButton />
            </div>
          </MinutaProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
