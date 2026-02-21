import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Use Chrome.');
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };

    recognition.onend = () => {
      setListening(false);
      if (transcript) onResult && onResult(transcript);
    };

    recognition.start();
    setListening(true);
    setTranscript('');
  }, [transcript, onResult]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={listening ? () => setListening(false) : startListening}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          transition-colors duration-300
          ${listening
            ? 'bg-danger-crimson shadow-glow-red'
            : 'bg-trust-electric/20 border-2 border-trust-electric hover:bg-trust-electric/30'
          }
        `}
        aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      >
        {listening ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-trust-electric" />
        )}

        {/* Pulse rings when listening */}
        {listening && [1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-danger-crimson"
            animate={{ scale: 1 + i * 0.4, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.button>

      {/* Waveform visual */}
      {listening && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-1 h-10"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-trust-electric rounded-full"
              animate={{ height: [4, Math.random() * 32 + 8, 4] }}
              transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 rounded-xl bg-violet-50 border border-violet-100 text-sm font-body text-slate-500 text-center max-w-xs"
          >
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs font-body text-slate-400 text-center">
        {listening ? 'Listening... speak your command' : 'Say: "Lock 5000 rupees for groceries"'}
      </p>
    </div>
  );
}
