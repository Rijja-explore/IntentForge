import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import CopilotOrb from './components/ai/CopilotOrb';
import DemoModeToggle from './components/demo/DemoModeToggle';
import AutoPlayDemo from './components/demo/AutoPlayDemo';
import ParticleBackground from './components/shared/ParticleBackground';

import Dashboard from './pages/Dashboard';
import RuleBuilderPage from './pages/RuleBuilderPage';
import Transactions from './pages/Transactions';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

import { pageVariants } from './utils/animations';

/* ─── Per-route page transition wrapper ─────────────────────────── */
function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated ambient orbs (background layer) ───────────────────── */
const ORB_CONFIGS = [
  { w: 700, h: 700, top: '-15%', left: '-8%',  color: 'rgba(124,58,237,0.09)',  dur: 22, delay: 0 },
  { w: 550, h: 550, top: '45%',  right: '-6%', color: 'rgba(249,115,22,0.07)',  dur: 28, delay: 6 },
  { w: 450, h: 450, bottom: '-8%', left: '25%', color: 'rgba(192,38,211,0.07)', dur: 20, delay: 11 },
  { w: 350, h: 350, top: '15%',  left: '55%',  color: 'rgba(124,58,237,0.05)', dur: 25, delay: 4 },
  { w: 250, h: 250, top: '60%',  left: '10%',  color: 'rgba(249,115,22,0.06)', dur: 18, delay: 8 },
];

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {ORB_CONFIGS.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
          animate={{
            scale: [1, 1.25, 0.9, 1.15, 1],
            x: [0, 40, -25, 15, 0],
            y: [0, -30, 40, -15, 0],
          }}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Routes with AnimatePresence ────────────────────────────────── */
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"            element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/rules"       element={<PageTransition><RuleBuilderPage /></PageTransition>} />
        <Route path="/transactions" element={<PageTransition><Transactions /></PageTransition>} />
        <Route path="/ai"          element={<PageTransition><AIInsights /></PageTransition>} />
        <Route path="/settings"    element={<PageTransition><Settings /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

/* ─── Root App ───────────────────────────────────────────────────── */
function App() {
  const [demoActive, setDemoActive] = useState(false);

  return (
    <BrowserRouter>
      {/* Layer 1 – tsParticles canvas (z -10, fixed, pointer-events-none) */}
      <ParticleBackground />

      {/* Layer 2 – slow animated gradient orbs */}
      <FloatingOrbs />

      {/* Layer 3 – aurora color wash */}
      <div className="aurora-bg" />

      {/* Layer 4 – dot grid texture */}
      <div className="dot-grid" />

      {/* Layer 5 – app chrome */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <main className="flex-1 md:ml-20 lg:ml-64 min-h-screen overflow-x-hidden">
          {/* Demo mode toggle */}
          <div className="fixed top-4 right-20 z-30 hidden md:block">
            <DemoModeToggle onToggle={setDemoActive} />
          </div>

          <AppRoutes />
        </main>

        <MobileNav />
        <CopilotOrb />
        <AutoPlayDemo active={demoActive} />
      </div>
    </BrowserRouter>
  );
}

export default App;
