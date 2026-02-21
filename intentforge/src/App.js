import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import CopilotOrb from './components/ai/CopilotOrb';
import DemoModeToggle from './components/demo/DemoModeToggle';
import AutoPlayDemo from './components/demo/AutoPlayDemo';

import Dashboard from './pages/Dashboard';
import RuleBuilderPage from './pages/RuleBuilderPage';
import Transactions from './pages/Transactions';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rules" element={<RuleBuilderPage />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/ai" element={<AIInsights />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [demoActive, setDemoActive] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-neutral-charcoal bg-gradient-mesh">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 md:ml-20 lg:ml-64 min-h-screen overflow-x-hidden">
          {/* Demo mode toggle in top-right corner of content */}
          <div className="fixed top-4 right-20 z-30 hidden md:block">
            <DemoModeToggle onToggle={setDemoActive} />
          </div>

          <AppRoutes />
        </main>

        {/* Mobile nav */}
        <MobileNav />

        {/* AI Copilot floating orb */}
        <CopilotOrb />

        {/* Demo mode overlay */}
        <AutoPlayDemo active={demoActive} />
      </div>
    </BrowserRouter>
  );
}

export default App;
