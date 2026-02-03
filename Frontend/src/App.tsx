// src/App.tsx
// Root app component with hostname and path-based routing
// - app.* subdomain → Authenticated app
// - domain.com/app/* path → Authenticated app
// - Other hostnames/paths → Public landing page

import { isAppSubdomain, isAppPathPrefix } from './lib/domain';
import { LandingApp } from './LandingApp';
import { AuthenticatedApp } from './AuthenticatedApp';

function App() {
  // Show AuthenticatedApp if on subdomain OR on /app/* path
  const isAuthenticatedContext = isAppSubdomain() || isAppPathPrefix();
  return isAuthenticatedContext ? <AuthenticatedApp /> : <LandingApp />;
}

export default App;
