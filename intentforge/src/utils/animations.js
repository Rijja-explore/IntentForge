// Enhanced animation variants for hackathon wow factor

export const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const cardVariants = {
  hidden: { y: 24, opacity: 0, scale: 0.97 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 160,
      damping: 20,
    },
  },
};

export const transactionVariants = {
  initial: { x: 80, opacity: 0, scale: 0.95 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20 }
  },
  exit: {
    x: -80,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 40,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 40,
    filter: 'blur(8px)',
    transition: { duration: 0.2 },
  },
};

export const orbVariants = {
  float: {
    y: [0, -12, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const glowVariants = {
  pulse: {
    boxShadow: [
      '0 0 12px rgba(124, 58, 237, 0.35), 0 0 24px rgba(124,58,237,0.15)',
      '0 0 24px rgba(124, 58, 237, 0.6), 0 0 48px rgba(124,58,237,0.3)',
      '0 0 12px rgba(124, 58, 237, 0.35), 0 0 24px rgba(124,58,237,0.15)',
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const counterVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 12,
    },
  },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 150,
      damping: 18,
    },
  }),
};

export const popVariants = {
  idle: { scale: 1 },
  pop: {
    scale: [1, 1.18, 0.95, 1.05, 1],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const heroEntrance = {
  initial: { opacity: 0, scale: 0.92, y: 30, filter: 'blur(12px)' },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
