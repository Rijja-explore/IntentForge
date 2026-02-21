import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let engineInitialized = false;
let enginePromise = null;

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (engineInitialized) { setInit(true); return; }
    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    enginePromise.then(() => { engineInitialized = true; setInit(true); });
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      className="fixed inset-0 -z-10 pointer-events-none"
      options={{
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            grab: {
              distance: 180,
              links: { opacity: 0.55, color: '#A78BFA' },
            },
            push: { quantity: 2 },
          },
        },
        particles: {
          number: { value: 60, density: { enable: true, area: 1000 } },
          color: { value: ['#A78BFA', '#C084FC', '#22D3EE', '#FB923C', '#67E8F9', '#F97316'] },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.25, max: 0.65 },
            animation: { enable: true, speed: 0.6, sync: false },
          },
          size: {
            value: { min: 2, max: 3.5 },
          },
          links: {
            color: '#A78BFA',
            distance: 160,
            enable: true,
            opacity: 0.2,
            width: 0.8,
          },
          move: {
            enable: true,
            speed: { min: 0.2, max: 0.55 },
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
