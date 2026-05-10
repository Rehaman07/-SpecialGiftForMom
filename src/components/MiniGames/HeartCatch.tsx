import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

const TARGET_SCORE = 5;
const BUTTONS = [
  { id: 0, label: 'Warm Hug', icon: Heart, color: 'text-pink-300', active: 'bg-pink-500/40 border-pink-300' },
  { id: 1, label: 'Sweet Smile', icon: Sparkles, color: 'text-yellow-200', active: 'bg-yellow-500/30 border-yellow-200' },
  { id: 2, label: 'Big Love', icon: Heart, color: 'text-rose-300', active: 'bg-rose-500/40 border-rose-300' },
];

export const HeartCatch: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * BUTTONS.length));
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const { playSound } = useAudio();

  const targetButton = BUTTONS[target];
  const progress = useMemo(() => Array.from({ length: TARGET_SCORE }, (_, index) => index < score), [score]);

  const chooseNextTarget = (picked: number) => {
    let next = Math.floor(Math.random() * BUTTONS.length);
    if (next === picked) next = (next + 1) % BUTTONS.length;
    setTarget(next);
  };

  const handlePick = (picked: number) => {
    if (finished || selected !== null) return;

    setSelected(picked);

    if (picked === target) {
      playSound('heart');
      const nextScore = score + 1;
      setScore(nextScore);

      window.setTimeout(() => {
        if (nextScore >= TARGET_SCORE) {
          setFinished(true);
          playSound('sparkle');
          window.setTimeout(onWin, 450);
          return;
        }

        chooseNextTarget(picked);
        setSelected(null);
      }, 450);
      return;
    }

    playSound('fail');
    const nextLives = lives - 1;
    setLives(nextLives);

    window.setTimeout(() => {
      if (nextLives <= 0) {
        setFinished(true);
        onLose();
        return;
      }

      setSelected(null);
    }, 550);
  };

  return (
    <div className="relative w-full max-w-sm glass rounded-3xl overflow-hidden bg-gradient-to-b from-amber-900/50 via-rose-950/50 to-black/70 p-6 sm:p-8">
      <div className="text-center">
        <div className="text-xs font-display uppercase tracking-widest text-amber-200/70">Love Lock</div>
        <h3 className="mt-2 text-2xl font-display text-white uppercase tracking-widest">Match the Glow</h3>
        <p className="mt-2 text-sm font-accent italic text-white/60">Tap the symbol Mom's magic asks for.</p>
      </div>

      <motion.div
        key={target}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-8 flex flex-col items-center gap-3"
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-amber-200/50 bg-white/10 shadow-[0_0_36px_rgba(251,191,36,0.28)]">
          <targetButton.icon className={`${targetButton.color} fill-current`} size={48} />
          <div className="absolute -inset-3 rounded-full border border-white/10 animate-pulse" />
        </div>
        <div className="text-sm font-display uppercase tracking-[0.25em] text-amber-100/70">{targetButton.label}</div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {BUTTONS.map((button) => {
          const Icon = button.icon;
          const isPicked = selected === button.id;
          const isCorrectPick = isPicked && button.id === target;
          const isWrongPick = isPicked && button.id !== target;

          return (
            <motion.button
              key={button.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handlePick(button.id)}
              disabled={selected !== null || finished}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 touch-manipulation transition-colors ${
                isCorrectPick
                  ? button.active
                  : isWrongPick
                    ? 'bg-red-500/30 border-red-300'
                    : 'bg-white/5 border-white/10 hover:bg-white/15'
              }`}
            >
              <Icon className={`${button.color} ${button.icon === Heart ? 'fill-current' : ''}`} size={30} />
              <span className="text-[10px] font-display uppercase tracking-widest text-white/70">{button.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {progress.map((filled, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full ${filled ? 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]' : 'bg-white/15'}`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((life) => (
            <Heart key={life} size={18} className={life < lives ? 'text-rose-400 fill-rose-400' : 'text-white/20'} />
          ))}
        </div>
      </div>
    </div>
  );
};
