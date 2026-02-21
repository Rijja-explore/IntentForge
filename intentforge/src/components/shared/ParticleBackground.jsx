import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      className="absolute inset-0 -z-10"
      options={{
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          color: { value: ['#7C3AED', '#F97316', '#C026D3'] },
          links: {
            color: '#7C3AED',
            distance: 150,
            enable: true,
            opacity: 0.08,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.4,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'bounce' },
          },
          number: {
            value: 50,
            density: { enable: true, area: 800 },
          },
          opacity: {
            value: 0.2,
            random: true,
            animation: { enable: true, speed: 0.5, minimumValue: 0.05 },
          },
          shape: { type: 'circle' },
          size: { value: { min: 1, max: 3 }, random: true },
        },
        detectRetina: true,
      }}
    />
  );
}
