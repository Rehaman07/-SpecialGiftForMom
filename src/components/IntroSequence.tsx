import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { useAudio } from '../hooks/useAudio';
import { Sparkles } from 'lucide-react';
import { usePerformanceProfile, useStableParticles } from '../utils/performance';

export const IntroSequence: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
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
    let completionTimer = 0;
    const tl = gsap.timeline({
      onComplete: () => {
        completionTimer = window.setTimeout(() => setScene('STORY'), 1000);
      }
    });

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

    tl.to(textRef.current, { opacity: 0, filter: 'blur(10px)', duration: 1.5, delay: 1 });

    // Layered Doors Sequence
    const doors = [1, 2, 3];
    doors.forEach((d, i) => {
      tl.add(() => playSound('doorSlam'), "+=0.2");
      tl.fromTo(`.door-layer-${d}`, 
        { scale: 3, opacity: 0, z: 1000 },
        { scale: 1, opacity: 1, z: 0, duration: 0.8, ease: 'back.out(1.2)' },
        "-=0.1"
      );
      
      tl.to(`.door-layer-${d}`, {
        boxShadow: "0 0 50px rgba(255,105,180,0.5)",
        duration: 0.2
      });

      if (i < doors.length - 1) {
        tl.to(`.door-layer-${d}`, {
          x: 1000,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
          delay: 0.5
        });
      }
    });

    tl.to('.intro-container', {
      scale: 1.5,
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      delay: 0.5
    });

    return () => {
      window.clearTimeout(completionTimer);
      tl.kill();
    };
  }, [setScene, playSound]);

  return (
    <div ref={containerRef} className="intro-container fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden perspective-2000 pointer-events-none">
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
