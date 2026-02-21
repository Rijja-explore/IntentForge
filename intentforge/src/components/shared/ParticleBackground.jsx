import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let engineInitialized = false;
let enginePromise = null;

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (engineInitialized) {
      setInit(true);
      return;
    }
    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    enginePromise.then(() => {
      engineInitialized = true;
      setInit(true);
    });
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
            onHover: { enable: true, mode: 'bubble' },
            onClick: { enable: true, mode: 'repulse' },
          },
          modes: {
            bubble: { distance: 200, size: 6, duration: 0.4, opacity: 0.6 },
            repulse: { distance: 150, duration: 0.4 },
          },
        },
        particles: {
          number: { value: 80, density: { enable: true, area: 900 } },
          color: {
            value: ['#A78BFA', '#C084FC', '#FB923C', '#F97316', '#67E8F9'],
            animation: {
              enable: true,
              speed: 15,
              sync: false,
            },
          },
          shape: {
            type: ['circle', 'triangle', 'polygon'],
            options: {
              polygon: { sides: 6 },
            },
          },
          opacity: {
            value: { min: 0.2, max: 0.6 },
            animation: {
              enable: true,
              speed: 0.8,
              sync: false,
            },
          },
          size: {
            value: { min: 1, max: 4 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
          links: {
            color: { value: ['#A78BFA', '#C084FC', '#FB923C'] },
            distance: 130,
            enable: true,
            opacity: 0.2,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.06,
            },
          },
          move: {
            enable: true,
            speed: { min: 0.3, max: 1.2 },
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
            attract: { enable: true, rotate: { x: 600, y: 1200 } },
            trail: {
              enable: false,
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: 'random',
            animation: { enable: true, speed: 5, sync: false },
          },
          wobble: {
            enable: true,
            distance: 10,
            speed: { min: -15, max: 15 },
          },
          tilt: {
            direction: 'random',
            enable: true,
            value: { min: 0, max: 360 },
            animation: { enable: true, speed: 6, sync: false },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
