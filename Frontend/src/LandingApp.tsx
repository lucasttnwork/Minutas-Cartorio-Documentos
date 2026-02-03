// src/LandingApp.tsx
// Public landing page wrapper for main domain (without app. subdomain)

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/layout";
import { Toaster } from "./components/ui/sonner";
import { HomePage } from "./pages/HomePage";
import { LandingPage } from "./pages/LandingPage";

export function LandingApp() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing-page" element={<LandingPage />} />
          {/* Note: Removed catch-all route to allow /app/* to be handled by AuthenticatedApp */}
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </ErrorBoundary>
  );
}
