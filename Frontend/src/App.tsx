import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PessoaNatural from "./pages/PessoaNatural";
import PessoaJuridica from "./pages/PessoaJuridica";
import Imovel from "./pages/Imovel";
import NegocioJuridico from "./pages/NegocioJuridico";
import Upload from "./pages/Upload";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation } from "./components/layout";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <GlobalNavigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pessoa-natural" element={<PessoaNatural />} />
          <Route path="/pessoa-juridica" element={<PessoaJuridica />} />
          <Route path="/imovel" element={<Imovel />} />
          <Route path="/negocio-juridico" element={<NegocioJuridico />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </Router>
  );
}

export default App;
