import { motion } from 'framer-motion';
import { pageVariants } from '../../utils/animations';
import ParticleBackground from '../shared/ParticleBackground';

export default function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-screen"
    >
      <ParticleBackground />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
