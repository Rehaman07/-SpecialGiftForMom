import React, { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import { Sparkles } from 'lucide-react';
import { usePerformanceProfile, useStableParticles } from '../utils/performance';

export const IntroSequence: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasDismissedRef = useRef(false);
  const { setScene } = useGameStore();
  const { playSound } = useAudio();
  const profile = usePerformanceProfile();
  const particles = useStableParticles(
    () => Array.from({ length: Math.max(10, Math.round(20 * profile.particleScale)) }, (_, i) => ({
      id: i,
      size: Math.random() * 300 + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    })),
    [profile.particleScale],
  );

  useEffect(() => {
    const tl = gsap.timeline();
    introTimelineRef.current = tl;

    // Initial darkness to glows
    tl.to('.particle-glow', {
      opacity: 0.6,
      scale: 1.5,
      stagger: 0.2,
      duration: 2,
    });

    // Cinematic Text
    tl.fromTo(textRef.current, 
      { opacity: 0, y: 50, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2, ease: 'power2.out' }
    );

    return () => {
      tl.kill();
      introTimelineRef.current = null;
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;

    introTimelineRef.current?.kill();
    playSound('sparkle');

    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.08,
      filter: 'blur(18px)',
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: () => setScene('STORY'),
    });
  }, [playSound, setScene]);

  return (
    <div
      ref={containerRef}
      onClick={handleDismiss}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') handleDismiss();
      }}
      role="button"
      tabIndex={0}
      aria-label="Continue to the story"
      className="intro-container fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden perspective-2000 cursor-pointer touch-manipulation"
    >
      {/* Background Particles */}
      {particles.map((particle) => (
        <div 
          key={particle.id}
          className="particle-glow absolute rounded-full bg-pink-500/20 glow-bloom"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            opacity: 0
          }}
        />
      ))}

      {/* Cinematic Text */}
      <div ref={textRef} className="absolute text-center z-10 px-6">
        <h1 className="text-4xl md:text-6xl font-display uppercase tracking-[0.2em] text-white glow-neon">
          Hi Ammi, You Need To Win Me<br/> To Grab Your Gift 😁...
        </h1>
        <Sparkles className="mx-auto mt-8 text-pink-400 animate-pulse" size={48} />
      </div>

      {/* Door Layers */}
      {[1, 2, 3].map((d) => (
        <div 
          key={d} 
          className={`door-layer-${d} absolute w-[300px] h-[500px] md:w-[500px] md:h-[700px] border-[16px] border-amber-900/80 bg-amber-950/90 rounded-t-[250px] shadow-2xl flex items-center justify-center preserve-3d opacity-0`}
        >
          <div className="absolute inset-4 border-4 border-amber-700/50 rounded-t-[230px]" />
          <div className="w-1 h-full bg-amber-900/50 absolute left-1/2 -translate-x-1/2" />
          <div className="text-amber-200/20 text-9xl font-display">M</div>
        </div>
      ))}
    </div>
  );
};
