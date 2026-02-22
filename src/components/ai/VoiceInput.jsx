import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // Ref prevents stale closure: onend always reads the latest value
  const transcriptRef = useRef('');

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input requires Chrome or a Chromium-based browser.');
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      transcriptRef.current = t;
      setTranscript(t);
    };

    recognition.onend = () => {
      setListening(false);
      const finalText = transcriptRef.current.trim();
      if (finalText) {
        onResult && onResult(finalText);
      }
      transcriptRef.current = '';
    };

    recognition.onerror = () => {
      setListening(false);
    };

    setListening(true);
    setTranscript('');
    transcriptRef.current = '';
    recognition.start();
  }, [onResult]);

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

        {listening && [1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-danger-crimson"
            animate={{ scale: 1 + i * 0.4, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.button>

      {/* Waveform */}
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
              animate={{ height: [4, 8 + (i % 5) * 6, 4] }}
              transition={{ duration: 0.5 + (i % 3) * 0.15, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}

      {/* Transcript preview */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 rounded-xl text-sm font-body text-slate-200 text-center max-w-xs"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}
          >
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs font-body text-slate-400 text-center">
        {listening ? 'Listening… speak your command' : 'Click the mic and speak a command'}
      </p>
    </div>
  );
}
