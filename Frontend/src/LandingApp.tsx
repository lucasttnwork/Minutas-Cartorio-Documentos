// src/LandingApp.tsx
// Public landing page wrapper for main domain (without app. subdomain)

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/layout";
import { Toaster } from "./components/ui/sonner";
import { LandingPage } from "./pages/LandingPage";

export function LandingApp() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </ErrorBoundary>
  );
}
