import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';
import { MessageSquare, ThumbsUp } from 'lucide-react';

const RIDDLES = [
  {
    emojis: '\u{1F958}\u{1F372}\u{1F6AB}\u{1F355}\u{1F957}\u2705',
    question: "Mom just sent this. What's for dinner?",
    options: ['Pizza with salad', 'Leftover soup, no pizza, eat salad', 'The pizza is in the soup', 'Order pizza for the salad party'],
    correct: 1,
  },
  {
    emojis: '\u{1F6D2}\u{1F34E}\u{1F95B}\u{1F3C3}\u200D\u2642\uFE0F\u{1F4A8}\u{1F3E0}',
    question: 'Decoding the errand text...',
    options: ['Buying apples and milk, coming home fast', 'The milk is running away from the apples', 'Run to the store for milk', 'Apples are home alone'],
    correct: 0,
  },
  {
    emojis: '\u{1F9E5}\u{1F976}\u{1F9E3}\u{1F9E4}\u2753',
    question: "You're walking out the door and see this:",
    options: ["I'm cold", 'Where are my gloves?', "Put on your jacket, it's freezing!", 'The jacket is lost in the snow'],
    correct: 2,
  },
];

export const MomTranslator: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const { playSound } = useAudio();

  useEffect(() => {
    playSound('typing');
  }, [playSound, step]);

  const handleChoice = (idx: number) => {
    setSelected(idx);
    playSound('click');

    if (idx === RIDDLES[step].correct) {
      playSound('unlock');
      setTimeout(() => {
        if (step + 1 < RIDDLES.length) {
          setStep(s => s + 1);
          setSelected(null);
        } else {
          onWin();
        }
      }, 1000);
    } else {
      playSound('fail');
      setTimeout(() => setSelected(null), 800);
    }
  };

  const current = RIDDLES[step];

  return (
    <div className="flex flex-col items-center gap-6 glass p-8 rounded-[40px] w-full max-w-sm bg-purple-900/40 border-purple-500/30">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-purple-200">
          <MessageSquare size={20} />
          <span className="text-xs font-display tracking-widest uppercase">Mom is typing...</span>
        </div>
        <div className="text-xs font-display text-white/40">{step + 1} / {RIDDLES.length}</div>
      </div>

      <motion.div
        key={step}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white/10 rounded-3xl p-6 mb-4 text-center border border-white/10 shadow-inner"
      >
        <div className="text-4xl mb-4 tracking-widest drop-shadow-md">{current.emojis}</div>
        <p className="text-sm text-purple-100 font-accent leading-relaxed">{current.question}</p>
      </motion.div>

      <div className="flex flex-col gap-3 w-full">
        {current.options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice(i)}
            disabled={selected !== null}
            className={`text-left p-4 rounded-2xl text-sm font-display transition-all border ${
              selected === i
                ? (i === current.correct ? 'bg-green-500/30 border-green-400 text-white' : 'bg-red-500/30 border-red-400 text-white animate-shake')
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-purple-300/50 uppercase tracking-[0.2em] font-display">
        <ThumbsUp size={12} />
        <span>Decipher her love language</span>
      </div>
    </div>
  );
};
