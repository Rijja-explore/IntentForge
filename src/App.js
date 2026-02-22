import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Menu, ShieldOff } from 'lucide-react';

import { useWeb3 } from './hooks/useWeb3';

import Sidebar       from './components/layout/Sidebar';
import MobileNav     from './components/layout/MobileNav';
import CopilotOrb    from './components/ai/CopilotOrb';
import DemoModeToggle from './components/demo/DemoModeToggle';
import AutoPlayDemo  from './components/demo/AutoPlayDemo';
import ParticleBackground from './components/shared/ParticleBackground';
import CircuitOverlay     from './components/shared/CircuitOverlay';
import Unauthorized  from './components/intent/Unauthorized';
import Landing       from './pages/Landing';

import Dashboard      from './pages/Dashboard';
import RuleBuilderPage from './pages/RuleBuilderPage';
import Transactions   from './pages/Transactions';
import AIInsights     from './pages/AIInsights';
import Settings       from './pages/Settings';
import BlockchainAudit from './pages/BlockchainAudit';
import IntentRules    from './pages/IntentRules';

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
  { w: 700, h: 700, top: '-15%', left: '-8%',  color: 'rgba(124,58,237,0.22)',  dur: 22, delay: 0 },
  { w: 550, h: 550, top: '45%',  right: '-6%', color: 'rgba(249,115,22,0.18)',  dur: 28, delay: 6 },
  { w: 450, h: 450, bottom: '-8%', left: '25%', color: 'rgba(192,38,211,0.18)', dur: 20, delay: 11 },
  { w: 350, h: 350, top: '15%',  left: '55%',  color: 'rgba(124,58,237,0.14)', dur: 25, delay: 4 },
  { w: 250, h: 250, top: '60%',  left: '10%',  color: 'rgba(249,115,22,0.15)', dur: 18, delay: 8 },
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
            top:    orb.top,
            left:   orb.left,
            right:  orb.right,
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

/* ─── Shared background layers ───────────────────────────────────── */
function BackgroundLayers() {
  return (
    <>
      <ParticleBackground />
      <FloatingOrbs />
      <div className="aurora-bg" />
      <CircuitOverlay />
    </>
  );
}

/* ─── Role guard — blocks receiver from lender-only routes ──────── */
function LenderOnly({ children }) {
  const { role } = useWeb3();
  if (role === 'receiver') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(14,19,42,0.96)',
            border: '1px solid rgba(248,113,113,0.25)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <ShieldOff size={26} style={{ color: '#F87171' }} />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-100 mb-2">Lender-only section</h3>
          <p className="text-sm text-slate-400 mb-5">
            This page is restricted to the Lender account. Your Receiver role does not have access here.
          </p>
          <Navigate to="/intent" replace />
        </motion.div>
      </div>
    );
  }
  return children;
}

/* ─── Routes with AnimatePresence ────────────────────────────────── */
function AppRoutes({ sidebarOpen, onMenuOpen }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"             element={<PageTransition><Dashboard      sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition>} />
        <Route path="/rules"        element={<LenderOnly><PageTransition><RuleBuilderPage sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition></LenderOnly>} />
        <Route path="/transactions" element={<PageTransition><Transactions   sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition>} />
        <Route path="/ai"           element={<LenderOnly><PageTransition><AIInsights     sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition></LenderOnly>} />
        <Route path="/blockchain"   element={<LenderOnly><PageTransition><BlockchainAudit sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition></LenderOnly>} />
        <Route path="/intent"       element={<PageTransition><IntentRules    sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition>} />
        <Route path="/settings"     element={<PageTransition><Settings       sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

/* ─── Main app shell (authenticated) ─────────────────────────────── */
function MainApp({ role }) {
  const [demoActive,   setDemoActive]   = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Floating sidebar re-open button */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex fixed top-4 left-4 z-50 w-10 h-10 rounded-xl items-center justify-center"
            style={{
              background: 'rgba(14,19,42,0.9)',
              border: '1px solid rgba(167,139,250,0.25)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.2)',
            }}
            aria-label="Open sidebar"
          >
            <Menu size={17} className="text-slate-300" />
          </motion.button>
        )}
      </AnimatePresence>

      <main
        className={`flex-1 min-h-screen overflow-x-hidden ${sidebarOpen ? 'md:ml-20 lg:ml-64' : ''}`}
        style={{ transition: 'margin-left 0.3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="min-h-screen">
          <div className="fixed top-4 right-20 z-30 hidden md:block">
            <DemoModeToggle onToggle={setDemoActive} />
          </div>

          <AppRoutes
            sidebarOpen={sidebarOpen}
            onMenuOpen={() => setSidebarOpen(true)}
          />
        </div>
      </main>

      <MobileNav />
      <CopilotOrb />
      <AutoPlayDemo active={demoActive} />
    </div>
  );
}

/* ─── App shell — wallet-gated ───────────────────────────────────── */
function AppShell() {
  const { account, role, connect, disconnect, connecting, error } = useWeb3();
  const navigate  = useNavigate();
  const prevAccount = useRef(null);

  // After a successful connection, land on /intent (role dashboard)
  useEffect(() => {
    if (account && !prevAccount.current) {
      navigate('/intent', { replace: true });
    }
    prevAccount.current = account;
  }, [account, navigate]);

  /* ── 1. No wallet connected → Landing ── */
  if (!account) {
    return <Landing onConnect={connect} connecting={connecting} error={error} />;
  }

  /* ── 2. Unknown account → Unauthorized ── */
  if (role === 'unknown') {
    return <Unauthorized account={account} onDisconnect={disconnect} />;
  }

  /* ── 3. Lender or Receiver → full app ── */
  return <MainApp role={role} />;
}

/* ─── Root App ───────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      {/* Background layers are always mounted — no flicker on role change */}
      <BackgroundLayers />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
