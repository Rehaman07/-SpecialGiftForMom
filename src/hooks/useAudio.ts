import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

type SoundKey =
  | 'ambient'
  | 'doorSlam'
  | 'unlock'
  | 'win'
  | 'fail'
  | 'click'
  | 'whoosh'
  | 'hit'
  | 'sparkle'
  | 'heart'
  | 'typing'
  | 'rewind'
  | 'chest';

let audioContext: AudioContext | null = null;
let musicElement: HTMLAudioElement | null = null;
const AMBIENT_AUDIO_URL = new URL('../../pirates.mp3', import.meta.url).href;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume().catch(() => {
      // Browsers may wait for the first user gesture before allowing audio.
    });
  }

  return audioContext;
};

const playTone = (
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.18,
  delay = 0,
) => {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
};

const playNoise = (context: AudioContext, duration: number, volume = 0.12) => {
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const now = context.currentTime;

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
  source.stop(now + duration);
};

const startAmbient = () => {
  if (!musicElement) {
    musicElement = new Audio(AMBIENT_AUDIO_URL);
    musicElement.loop = true;
    musicElement.volume = 0.28;
    musicElement.preload = 'auto';
  }

  void musicElement.play().catch(() => {
    // Browsers may wait for the first user gesture before allowing music.
  });
};

const stopAmbient = () => {
  musicElement?.pause();
};

const playSynthSound = (key: SoundKey) => {
  const context = getAudioContext();

  switch (key) {
    case 'click':
      playTone(context, 720, 0.06, 'triangle', 0.12);
      break;
    case 'whoosh':
      playNoise(context, 0.25, 0.1);
      playTone(context, 260, 0.18, 'sine', 0.08);
      break;
    case 'doorSlam':
      playNoise(context, 0.22, 0.22);
      playTone(context, 78, 0.28, 'sawtooth', 0.16);
      break;
    case 'unlock':
      playTone(context, 523.25, 0.1, 'sine', 0.14);
      playTone(context, 659.25, 0.12, 'sine', 0.14, 0.08);
      playTone(context, 987.77, 0.18, 'triangle', 0.12, 0.18);
      break;
    case 'sparkle':
      [880, 1174.66, 1567.98].forEach((frequency, index) => {
        playTone(context, frequency, 0.12, 'triangle', 0.09, index * 0.055);
      });
      break;
    case 'heart':
      playTone(context, 440, 0.08, 'sine', 0.12);
      playTone(context, 660, 0.12, 'sine', 0.1, 0.07);
      break;
    case 'hit':
      playTone(context, 180, 0.08, 'square', 0.14);
      playNoise(context, 0.08, 0.08);
      break;
    case 'typing':
      playTone(context, 620, 0.035, 'square', 0.055);
      break;
    case 'fail':
      playTone(context, 220, 0.14, 'sawtooth', 0.14);
      playTone(context, 146.83, 0.22, 'sawtooth', 0.14, 0.11);
      break;
    case 'win':
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        playTone(context, frequency, 0.22, 'triangle', 0.13, index * 0.11);
      });
      break;
    case 'rewind':
      [700, 520, 360, 220].forEach((frequency, index) => {
        playTone(context, frequency, 0.12, 'sawtooth', 0.1, index * 0.07);
      });
      break;
    case 'chest':
      playTone(context, 130.81, 0.22, 'triangle', 0.12);
      playTone(context, 392, 0.25, 'sine', 0.1, 0.14);
      break;
    case 'ambient':
      startAmbient();
      break;
    default:
      break;
  }
};

export const useAudio = () => {
  const { isAudioOn } = useGameStore();
  const isAudioOnRef = useRef(isAudioOn);

  useEffect(() => {
    isAudioOnRef.current = isAudioOn;

    if (isAudioOn) {
      startAmbient();
    } else {
      stopAmbient();
    }
  }, [isAudioOn]);

  const playSound = useCallback((key: SoundKey) => {
    if (!isAudioOnRef.current) return;
    playSynthSound(key);
  }, []);

  return { playSound };
};
