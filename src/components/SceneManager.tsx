import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import { IntroSequence } from './IntroSequence';
import { DoorScene } from './DoorScene';
import { FinalReveal, TreasureRoom } from './TreasureRoom';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';

export const SceneManager: React.FC = () => {
  const { currentScene, setScene, isAudioOn, toggleAudio, resetGame } = useGameStore();
  const { playSound } = useAudio();

  const handleToggleAudio = () => {
    playSound('click');
    toggleAudio();
  };

  const handleReset = () => {
    playSound('rewind');
    resetGame();
  };

  const handleBegin = () => {
    playSound('sparkle');
    setScene('DOOR_1');
  };

  useEffect(() => {
    if (currentScene !== 'RESTARTING') return;

    const timer = window.setTimeout(() => setScene('INTRO'), 2000);
    return () => window.clearTimeout(timer);
  }, [currentScene, setScene]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <div className="fixed top-6 right-6 z-[110] flex gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleAudio}
          className="p-3 glass rounded-full text-white/80 hover:text-white"
          aria-label={isAudioOn ? 'Turn sound off' : 'Turn sound on'}
        >
          {isAudioOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="p-3 glass rounded-full text-white/80 hover:text-white"
          aria-label="Restart adventure"
        >
          <RefreshCw size={24} />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {currentScene === 'INTRO' && <IntroSequence key="intro" />}

        {currentScene === 'STORY' && (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center stars-container"
          >
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-4xl font-accent italic text-pink-200 mb-8 max-w-2xl"
            >
              "The path to your surprise is hidden behind three enchanted gates. Only with your love and magic can they be opened..."
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBegin}
              className="px-12 py-4 bg-pink-600/80 hover:bg-pink-500 rounded-full text-xl font-display tracking-widest text-white shadow-2xl glass"
            >
              BEGIN ADVENTURE
            </motion.button>
          </motion.div>
        )}

        {(currentScene === 'DOOR_1' || currentScene === 'DOOR_2' || currentScene === 'DOOR_3') && (
          <DoorScene key={currentScene} doorIndex={Number(currentScene.split('_')[1])} />
        )}

        {currentScene === 'TREASURE' && <TreasureRoom key="treasure" />}

        {currentScene === 'REVEAL' && <FinalReveal key="reveal" />}

        {currentScene === 'RESTARTING' && (
          <motion.div
            key="restarting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-[200] flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="text-pink-500" size={64} />
            </motion.div>
            <h2 className="text-2xl font-display mt-8 text-white tracking-widest uppercase">The Magic Rewinds...</h2>
            <p className="text-white/50 mt-2">Starting over with love.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
