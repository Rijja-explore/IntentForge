import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import ChatPanel from './ChatPanel';

export default function CopilotOrb() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
          boxShadow: [
            '0 0 20px rgba(62, 146, 204, 0.4)',
            '0 0 40px rgba(62, 146, 204, 0.7)',
            '0 0 20px rgba(62, 146, 204, 0.4)',
          ],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="
          fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50
          w-16 h-16 rounded-full
          bg-gradient-primary
          flex items-center justify-center
          text-white
        "
        aria-label="Open AI Copilot"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles size={26} />
        </motion.div>
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success-emerald border-2 border-neutral-charcoal"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
