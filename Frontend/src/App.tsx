// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MinutaProvider } from "./contexts/MinutaContext";
import Dashboard from "./pages/Dashboard";
import UploadDocumentos from "./pages/UploadDocumentos";
import Processando from "./pages/Processando";
import ConferenciaOutorgantes from "./pages/ConferenciaOutorgantes";
import ConferenciaOutorgados from "./pages/ConferenciaOutorgados";
import ConferenciaImoveis from "./pages/ConferenciaImoveis";
import ParecerJuridico from "./pages/ParecerJuridico";
import ConferenciaNegocio from "./pages/ConferenciaNegocio";
import MinutaFinal from "./pages/MinutaFinal";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation } from "./components/layout";

function App() {
  return (
    <MinutaProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <GlobalNavigation />
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
          <Toaster position="top-right" richColors closeButton />
        </div>
      </Router>
    </MinutaProvider>
  );
}

export default App;
