import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scene, useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import { SlipperChase } from './MiniGames/SlipperChase';
import { HeartCatch } from './MiniGames/HeartCatch';
import { MomTranslator } from './MiniGames/MomTranslator';
import { Key } from 'lucide-react';

const THEMES = [
  {
    title: 'Crystal Love Gate',
    bg: 'bg-gradient-to-br from-pink-900 via-rose-950 to-black',
    particles: 'text-rose-400/20',
    doorColor: 'border-rose-300 shadow-rose-500/50',
    glow: 'bg-rose-500/10',
    particle: '\u2726',
  },
  {
    title: 'Royal Golden Gate',
    bg: 'bg-gradient-to-br from-amber-900 via-yellow-950 to-black',
    particles: 'text-amber-400/20',
    doorColor: 'border-amber-300 shadow-amber-500/50',
    glow: 'bg-amber-500/10',
    particle: '\u2728',
  },
  {
    title: 'Cosmic Galaxy Gate',
    bg: 'bg-gradient-to-br from-indigo-900 via-purple-950 to-black',
    particles: 'text-purple-400/20',
    doorColor: 'border-purple-300 shadow-purple-500/50',
    glow: 'bg-purple-500/10',
    particle: '\u2605',
  },
];

export const DoorScene: React.FC<{ doorIndex: number }> = ({ doorIndex }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const { setScene, resetGame } = useGameStore();
  const { playSound } = useAudio();
  const theme = THEMES[doorIndex - 1];

  const handleWin = () => {
    playSound('unlock');
    setUnlocked(true);
    setTimeout(() => {
      if (doorIndex < 3) {
        playSound('whoosh');
        setScene(`DOOR_${doorIndex + 1}` as Scene);
      } else {
        playSound('win');
        setScene('TREASURE');
      }
    }, 2500);
  };

  const handleLose = () => {
    playSound('fail');
    resetGame();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 2, filter: 'blur(30px)' }}
      className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${theme.bg}`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -1000],
              x: Math.sin(i) * 100,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className={`absolute bottom-[-100px] text-4xl ${theme.particles}`}
            style={{ left: `${Math.random() * 100}%` }}
          >
            {theme.particle}
          </motion.div>
        ))}
      </div>

      <div className="z-10 text-center mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm font-display tracking-[0.4em] uppercase text-amber-200/60 mb-2"
        >
          Adventure {doorIndex}
        </motion.div>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-display text-white drop-shadow-lg"
        >
          {theme.title}
        </motion.h2>
      </div>

      <AnimatePresence mode="wait">
        {!showGame && !unlocked ? (
          <motion.div
            key="door-visual"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            onClick={() => {
              playSound('doorSlam');
              setShowGame(true);
            }}
            className="group relative cursor-pointer"
          >
            <div className={`w-[250px] h-[400px] md:w-[350px] md:h-[550px] bg-black/40 border-[12px] ${theme.doorColor} rounded-t-full shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_100px_rgba(255,255,255,0.2)]`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/50 flex items-center justify-center">
                  <Key className="text-amber-500 animate-float" size={32} />
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-amber-200/40 font-display text-xs tracking-widest uppercase">Tap to Unlock</div>
            </div>
            <div className={`absolute -inset-10 ${theme.glow} rounded-full blur-[80px] pointer-events-none`} />
          </motion.div>
        ) : unlocked ? (
          <motion.div
            key="unlocked"
            initial={{ scale: 1 }}
            animate={{
              scale: 5,
              opacity: 0,
              filter: 'brightness(5)',
            }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <div className="text-9xl">{"\u2728"}</div>
          </motion.div>
        ) : (
          <motion.div
            key="game-container"
            initial={{ y: 100, opacity: 0, rotateX: 45 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex flex-col items-center gap-8 perspective-2000"
          >
            {doorIndex === 1 && <SlipperChase onWin={handleWin} onLose={handleLose} />}
            {doorIndex === 2 && <HeartCatch onWin={handleWin} onLose={handleLose} />}
            {doorIndex === 3 && <MomTranslator onWin={handleWin} onLose={handleLose} />}

            <button
              onClick={() => {
                playSound('click');
                setShowGame(false);
              }}
              className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-display"
            >
              Back to Gate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
