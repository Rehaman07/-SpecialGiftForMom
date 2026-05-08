import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

type FallingItem = {
  id: number;
  type: 'heart' | 'gold' | 'hazard';
  x: number;
  y: number;
  speed: number;
  size: number;
};

const GAME_WIDTH = 420;
const GAME_HEIGHT = 440;
const CATCHER_WIDTH = 96;
const TARGET_SCORE = 24;
const STARTING_LIVES = 3;

export const HeartCatch: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [catcherX, setCatcherX] = useState(GAME_WIDTH / 2);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const nextIdRef = useRef(1);
  const catcherRef = useRef(catcherX);
  const statusRef = useRef(status);
  const { playSound } = useAudio();

  useEffect(() => {
    catcherRef.current = catcherX;
  }, [catcherX]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const spawnItem = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const roll = Math.random();
    const type: FallingItem['type'] = roll > 0.82 ? 'hazard' : roll > 0.68 ? 'gold' : 'heart';
    const size = type === 'gold' ? 42 : type === 'hazard' ? 44 : 36;

    setItems(prev => [
      ...prev,
      {
        id: nextIdRef.current,
        type,
        x: 24 + Math.random() * (GAME_WIDTH - 48),
        y: -48,
        speed: 3.2 + Math.random() * 2.2 + Math.min(score / 18, 1.4),
        size,
      },
    ]);
    nextIdRef.current += 1;
  }, [score]);

  useEffect(() => {
    const spawnTimer = window.setInterval(spawnItem, 520);
    return () => window.clearInterval(spawnTimer);
  }, [spawnItem]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (statusRef.current !== 'playing') return;

      setItems(prev => {
        const remaining: FallingItem[] = [];
        let scoreDelta = 0;
        let lifeDelta = 0;
        let caughtAny = false;
        let hitHazard = false;

        for (const item of prev) {
          const nextItem = { ...item, y: item.y + item.speed };
          const catcherLeft = catcherRef.current - CATCHER_WIDTH / 2;
          const catcherRight = catcherRef.current + CATCHER_WIDTH / 2;
          const itemCenter = nextItem.x;
          const isCatchHeight = nextItem.y > GAME_HEIGHT - 82 && nextItem.y < GAME_HEIGHT - 24;
          const isInCatcher = itemCenter > catcherLeft && itemCenter < catcherRight;

          if (isCatchHeight && isInCatcher) {
            if (nextItem.type === 'hazard') {
              lifeDelta -= 1;
              hitHazard = true;
            } else {
              scoreDelta += nextItem.type === 'gold' ? 4 : 1;
              caughtAny = true;
            }
            continue;
          }

          if (nextItem.y > GAME_HEIGHT + 60) {
            if (nextItem.type !== 'hazard') {
              lifeDelta -= 1;
              hitHazard = true;
            }
            continue;
          }

          remaining.push(nextItem);
        }

        if (caughtAny) playSound('heart');
        if (hitHazard) playSound('fail');

        if (scoreDelta > 0) {
          setScore(current => {
            const nextScore = current + scoreDelta;
            if (nextScore >= TARGET_SCORE && statusRef.current === 'playing') {
              statusRef.current = 'won';
              setStatus('won');
              playSound('sparkle');
              window.setTimeout(onWin, 450);
            }
            return nextScore;
          });
        }

        if (lifeDelta < 0) {
          setLives(current => {
            const nextLives = Math.max(0, current + lifeDelta);
            if (nextLives <= 0 && statusRef.current === 'playing') {
              statusRef.current = 'lost';
              setStatus('lost');
              window.setTimeout(onLose, 700);
            }
            return nextLives;
          });
        }

        return remaining;
      });
    }, 32);

    return () => window.clearInterval(tick);
  }, [onLose, onWin, playSound]);

  const moveCatcher = (clientX: number, bounds: DOMRect) => {
    const ratio = (clientX - bounds.left) / bounds.width;
    const nextX = Math.min(GAME_WIDTH - CATCHER_WIDTH / 2, Math.max(CATCHER_WIDTH / 2, ratio * GAME_WIDTH));
    setCatcherX(nextX);
  };

  return (
    <div
      className="relative w-[min(92vw,420px)] h-[440px] glass rounded-3xl overflow-hidden bg-gradient-to-b from-amber-900/50 via-rose-950/50 to-black/70 touch-none"
      onPointerMove={(event) => moveCatcher(event.clientX, event.currentTarget.getBoundingClientRect())}
      onPointerDown={(event) => {
        playSound('click');
        moveCatcher(event.clientX, event.currentTarget.getBoundingClientRect());
      }}
    >
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
        <div>
          <div className="text-xs font-display uppercase tracking-widest text-amber-200">Love Cargo</div>
          <div className="text-3xl font-bold text-white">{Math.min(score, TARGET_SCORE)} <span className="text-white/30">/ {TARGET_SCORE}</span></div>
        </div>
        <div className="flex gap-1 pt-1">
          {[...Array(STARTING_LIVES)].map((_, index) => (
            <Heart key={index} size={22} className={index < lives ? 'text-rose-400 fill-rose-400' : 'text-white/20'} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 opacity-30">
        {[...Array(18)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute h-16 w-px bg-amber-200/40"
            style={{ left: `${(index / 18) * 100}%` }}
            animate={{ y: [-80, 520] }}
            transition={{ duration: 2.4 + index * 0.04, repeat: Infinity, ease: 'linear', delay: index * 0.08 }}
          />
        ))}
      </div>

      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            className="absolute z-10 flex items-center justify-center rounded-full"
            style={{ left: item.x - item.size / 2, top: item.y, width: item.size, height: item.size }}
          >
            {item.type === 'hazard' ? (
              <ShieldAlert className="text-red-300 drop-shadow-[0_0_14px_rgba(248,113,113,0.8)]" size={item.size} />
            ) : item.type === 'gold' ? (
              <Sparkles className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.8)]" size={item.size} />
            ) : (
              <Heart className="text-pink-400 fill-pink-400 drop-shadow-[0_0_14px_rgba(244,114,182,0.8)]" size={item.size} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="absolute bottom-5 z-20 h-12 rounded-full border-2 border-amber-200/70 bg-amber-500/20 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
        animate={{ x: catcherX - CATCHER_WIDTH / 2 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        style={{ width: CATCHER_WIDTH }}
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl">{"\u2728"}</div>
      </motion.div>

      <AnimatePresence>
        {status !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="font-display text-3xl uppercase tracking-widest text-white">
                {status === 'won' ? 'Treasure Secured' : 'Cargo Lost'}
              </div>
              <div className="mt-2 text-sm text-white/60">
                {status === 'won' ? 'Opening the next gate...' : 'The magic rewinds...'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
