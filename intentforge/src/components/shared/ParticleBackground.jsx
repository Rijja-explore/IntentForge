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
          color: { value: ['#3E92CC', '#FFB81C', '#06D6A0'] },
          links: {
            color: '#3E92CC',
            distance: 150,
            enable: true,
            opacity: 0.15,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'bounce' },
          },
          number: {
            value: 60,
            density: { enable: true, area: 800 },
          },
          opacity: {
            value: 0.3,
            random: true,
            animation: { enable: true, speed: 0.5, minimumValue: 0.1 },
          },
          shape: { type: 'circle' },
          size: { value: { min: 1, max: 4 }, random: true },
        },
        detectRetina: true,
      }}
    />
  );
}
