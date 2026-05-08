import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Footprints } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useDocumentVisible, usePerformanceProfile } from '../../utils/performance';

export const SlipperChase: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hits, setHits] = useState(0);
  const [phrase, setPhrase] = useState("CLEAN YOUR ROOM!");
  const { playSound } = useAudio();
  const profile = usePerformanceProfile();
  const isVisible = useDocumentVisible();

  const PHRASES = [
    "CLEAN YOUR ROOM!",
    "STOP RUNNING!",
    "DID YOU TAKE THE CHICKEN OUT?",
    "I'M COUNTING TO THREE...",
    "BECAUSE I SAID SO!",
    "ASK YOUR FATHER!"
  ];

  const moveSlipper = useCallback(() => {
    const reach = profile.isMobile ? 0.82 : 1;
    const x = (Math.random() - 0.5) * 250 * reach;
    const y = (Math.random() - 0.5) * 350 * reach;
    setPos({ x, y });
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  }, [profile.isMobile]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(moveSlipper, 700);
    return () => clearInterval(timer);
  }, [isVisible, moveSlipper]);

  const handleCatch = () => {
    playSound('hit');
    setHits(h => h + 1);
    if (hits + 1 >= 4) {
      onWin();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 glass p-6 sm:p-8 rounded-[40px] w-full max-w-sm relative overflow-hidden bg-rose-900/40">
      <div className="text-center z-10">
        <h3 className="text-xl font-display text-rose-200 uppercase tracking-widest">The Legendary Slipper</h3>
        <p className="text-white/60 text-sm font-accent italic">"You can't outrun Mom's speed!"</p>
        <div className="mt-4 flex gap-1 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < hits ? 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="h-[min(42vh,16rem)] min-h-56 w-full relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phrase}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.2, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute text-2xl font-black text-white pointer-events-none text-center leading-none"
          >
            {phrase}
          </motion.div>
        </AnimatePresence>

        <motion.button
          animate={{ x: pos.x, y: pos.y, rotate: [0, 15, -15, 0] }}
          transition={{ 
            x: { type: 'spring', damping: 5, stiffness: 100 },
            y: { type: 'spring', damping: 5, stiffness: 100 },
            rotate: { duration: 0.2, repeat: Infinity }
          }}
          onClick={handleCatch}
          className="absolute p-4 bg-rose-500 text-white rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.4)] border-2 border-rose-300 touch-manipulation"
          aria-label="Catch the slipper"
        >
          <Footprints size={48} className="rotate-45" />
          <Zap className="absolute -top-2 -right-2 text-yellow-300 fill-yellow-300" size={24} />
        </motion.button>
      </div>

      <p className="text-rose-200/50 text-xs font-display tracking-widest uppercase">Tap 4 times to survive!</p>
    </div>
  );
};
