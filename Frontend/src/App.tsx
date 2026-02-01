// src/App.tsx
// Root app component with hostname-based routing
// - app.* subdomain → Authenticated app
// - Other hostnames → Public landing page

import { isAppSubdomain } from './lib/domain';
import { LandingApp } from './LandingApp';
import { AuthenticatedApp } from './AuthenticatedApp';

function App() {
  return isAppSubdomain() ? <AuthenticatedApp /> : <LandingApp />;
}

export default App;
