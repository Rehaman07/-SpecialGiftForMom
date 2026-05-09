import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import { Key, Sparkles, Heart, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GAME_CONFIG } from '../constants';
import { useDocumentVisible, usePerformanceProfile } from '../utils/performance';

const MOMMY_IMAGE_URL = new URL('../../Mommy.png', import.meta.url).href;

export const TreasureRoom: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [correctKey] = useState(Math.floor(Math.random() * 3));
  const { setScene } = useGameStore();
  const { playSound } = useAudio();
  const profile = usePerformanceProfile();
  const transitionTimerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  const handleKeyChoice = (idx: number) => {
    if (selectedKey !== null) return;

    setSelectedKey(idx);
    if (idx === correctKey) {
      playSound('chest');
      playSound('unlock');
      confetti({
        particleCount: Math.round(200 * profile.confettiScale),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF1493', '#FFFFFF'],
      });
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => setScene('REVEAL'), 2000);
    } else {
      playSound('fail');
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => setSelectedKey(null), 1000);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0a0510] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none blur-[100px]" />
      <div className="absolute bottom-0 inset-x-0 h-20 bg-amber-500/5 blur-[50px] rotate-x-60" />

      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative mb-24"
      >
        <div className="absolute -inset-20 bg-amber-500/20 rounded-full blur-[60px] animate-pulse" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-56 h-44 md:w-72 md:h-56 bg-amber-900 border-b-[8px] border-amber-950 rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="absolute inset-3 rounded-xl overflow-hidden border-4 border-amber-400/70 bg-amber-950/70 shadow-inner">
            <img
              src={MOMMY_IMAGE_URL}
              alt="Mommy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-amber-300/30 to-transparent" />
          <div className="absolute top-1/2 left-0 w-full h-4 bg-amber-950/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-1/2 h-10 w-8 -translate-x-1/2 -translate-y-1/2 rounded-b-md border-2 border-amber-300/80 bg-amber-700 shadow-[0_0_16px_rgba(251,191,36,0.55)]" />
        </motion.div>
      </motion.div>

      <div className="flex gap-12 md:gap-24">
        {[0, 1, 2].map((i) => (
          <motion.button
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: selectedKey === i && i !== correctKey ? [0, -10, 10, -10, 10, 0] : [0, -20, 0],
              opacity: 1,
              scale: selectedKey === i ? 1.2 : 1,
            }}
            transition={{
              y: { duration: selectedKey === i && i !== correctKey ? 0.4 : 3 + i * 0.5, repeat: selectedKey === i && i !== correctKey ? 0 : Infinity },
              opacity: { delay: i * 0.2 + 1 },
            }}
            whileHover={{ scale: 1.1, y: -30 }}
            onClick={() => handleKeyChoice(i)}
            className={`cursor-pointer p-6 glass rounded-full flex items-center justify-center transition-colors ${
              selectedKey === i ? (i === correctKey ? 'bg-green-500/40 border-green-400' : 'bg-red-500/40 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)]') : 'hover:bg-white/20'
            }`}
            aria-label={`Try key ${i + 1}`}
          >
            <Key className="text-amber-400" size={48} />
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-16 text-center"
      >
        <h3 className="text-3xl font-display text-white tracking-[0.3em] uppercase">The Final Choice</h3>
        <p className="text-amber-200/50 font-display italic mt-2">Only the key of pure love can unlock the chest...</p>
      </motion.div>
    </div>
  );
};

export const FinalReveal: React.FC = () => {
  const { playSound } = useAudio();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const profile = usePerformanceProfile();
  const isVisible = useDocumentVisible();
  const sparkles = useMemo(
    () => Array.from({ length: Math.max(14, Math.round(30 * profile.particleScale)) }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 80 + 20}%`,
      x: (Math.random() - 0.5) * 100,
      size: 8 + Math.random() * 16,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 10,
    })),
    [profile.particleScale],
  );
  const hearts = useMemo(
    () => Array.from({ length: Math.max(10, Math.round(20 * profile.particleScale)) }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      size: 24 + Math.random() * 20,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    })),
    [profile.particleScale],
  );

  useEffect(() => {
    playSound('win');
    const end = Date.now() + 15000;
    let frameId = 0;
    const frame = () => {
      if (!document.hidden) {
        const particleCount = Math.max(1, Math.round(2 * profile.confettiScale));
        confetti({
          particleCount,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FF69B4', '#00FFFF'],
        });
        confetti({
          particleCount,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FF69B4', '#00FFFF'],
        });
      }
      if (Date.now() < end) frameId = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(frameId);
  }, [playSound, profile.confettiScale]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center stars-container overflow-y-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative z-10 max-w-lg mt-20"
      >
        <div className="absolute -inset-20 bg-pink-500/10 blur-[80px] rounded-full animate-pulse" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('sparkle');
            setIsFullScreen(true);
          }}
          className="relative group p-4 bg-white/10 glass rounded-[2.5rem] shadow-[0_0_50px_rgba(236,72,153,0.3)] mb-12 cursor-zoom-in touch-manipulation"
          aria-label="Open magic view"
        >
          <div className="aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-pink-950/50 flex items-center justify-center relative">
            <img
              src={MOMMY_IMAGE_URL}
              alt="Mother's Day"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-display tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              Click for Magic View
            </div>
          </div>

          <div className="absolute -bottom-4 -right-4 bg-yellow-400 p-3 rounded-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
            <Heart className="text-rose-600 fill-rose-600" size={24} />
          </div>
        </motion.button>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-display text-white mb-6 tracking-tighter glow-neon uppercase leading-none text-shimmer">
            Happy <br /><span className="text-pink-400 italic font-accent lowercase tracking-normal">Mother's Day</span>
          </h1>

          <div className="space-y-4 px-4">
            <p className="text-xl md:text-3xl font-accent italic text-pink-200">
              Happy Mother's Day {GAME_CONFIG.MOM_NAME}! You are the light of our universe.
            </p>
            <p className="text-lg md:text-2xl font-display tracking-[0.3em] uppercase text-amber-200/60 animate-pulse">
              You are the heart of this family
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            animate={{
              y: isVisible ? [0, -200] : 0,
              x: isVisible ? [0, sparkle.x] : 0,
              opacity: isVisible ? [0, 1, 0] : 0,
            }}
            transition={{ duration: sparkle.duration, repeat: Infinity, delay: sparkle.delay }}
            className="absolute text-yellow-400/40"
            style={{ left: sparkle.left, top: sparkle.top, willChange: 'transform, opacity' }}
          >
            <Sparkles size={sparkle.size} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
            onClick={() => setIsFullScreen(false)}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {hearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ y: -50, x: heart.x, opacity: 0 }}
                  animate={{
                    y: isVisible ? '110vh' : -50,
                    opacity: isVisible ? [0, 1, 1, 0] : 0,
                    rotate: isVisible ? 360 : 0,
                  }}
                  transition={{
                    duration: heart.duration,
                    repeat: Infinity,
                    delay: heart.delay,
                  }}
                  className="absolute"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Heart className="text-pink-500/40 fill-pink-500/20" size={heart.size} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={MOMMY_IMAGE_URL}
                alt="Mother's Day Surprise"
                loading="eager"
                decoding="async"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(236,72,153,0.4)]"
              />
              <button
                onClick={() => {
                  playSound('click');
                  setIsFullScreen(false);
                }}
                className="absolute top-0 right-0 m-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white glass touch-manipulation"
                aria-label="Close magic view"
              >
                <X size={24} />
              </button>
            </motion.div>
            <p className="mt-8 text-pink-200 font-accent italic text-2xl animate-float">The Most Beautiful Mother in the Universe</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
