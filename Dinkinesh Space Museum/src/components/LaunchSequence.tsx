import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PlanetId } from '../data/artifacts';
import { LucyAvatar } from './LucyAvatar';

interface LaunchSequenceProps {
  targetPlanet: PlanetId | null;
  onComplete: (planet: PlanetId) => void;
}

export const LaunchSequence: React.FC<LaunchSequenceProps> = ({ targetPlanet, onComplete }) => {
  const [phase, setPhase] = useState<'boarding' | 'liftoff' | 'cruise'>('boarding');

  useEffect(() => {
    if (!targetPlanet) return;
    setPhase('boarding');

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const quick = setTimeout(() => onComplete(targetPlanet), 350);
      return () => clearTimeout(quick);
    }

    const t1 = setTimeout(() => setPhase('liftoff'), 700);
    const t2 = setTimeout(() => setPhase('cruise'), 1400);
    const t3 = setTimeout(() => onComplete(targetPlanet), 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [targetPlanet, onComplete]);

  if (!targetPlanet) return null;

  const isMoon = targetPlanet === 'moon';

  return (
    <AnimatePresence>
      <motion.div
        key={targetPlanet}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0F1742] via-[#1B2560] to-[#3B4994]"
        role="dialog"
        aria-modal="true"
        aria-label={`Lucy launching in her spacecraft to ${isMoon ? 'the Moon' : 'Mars'}`}
      >
        {/* Starry sky background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { top: '12%', left: '15%', s: 6 },
            { top: '20%', left: '78%', s: 8 },
            { top: '34%', left: '25%', s: 5 },
            { top: '16%', left: '48%', s: 7 },
            { top: '44%', left: '84%', s: 6 },
            { top: '60%', left: '12%', s: 7 },
            { top: '28%', left: '63%', s: 5 },
            { top: '72%', left: '76%', s: 8 },
          ].map((star, idx) => (
            <div
              key={idx}
              style={{ top: star.top, left: star.left, width: star.s, height: star.s }}
              className="absolute rounded-full bg-[#FEF08A] animate-pulse"
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={() => onComplete(targetPlanet)}
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium border border-white/25 transition-colors cursor-pointer whitespace-nowrap"
        >
          Skip Launch
        </button>

        {/* Destination Planet waiting in the upper sky */}
        <motion.div
          initial={{ scale: 0.55, y: -120, opacity: 0.7 }}
          animate={{
            scale: phase === 'cruise' ? 1.35 : 0.85,
            y: phase === 'cruise' ? 10 : -90,
            opacity: 1,
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mb-6"
        >
          <svg width="148" height="148" viewBox="0 0 140 140" aria-hidden="true">
            <circle
              cx="70"
              cy="70"
              r="54"
              fill={isMoon ? '#F1F5F9' : '#FF7849'}
              stroke="#1E255E"
              strokeWidth="4"
            />
            {isMoon ? (
              <>
                <circle cx="46" cy="48" r="10" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.2" />
                <circle cx="96" cy="46" r="7" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.2" />
                <circle cx="90" cy="96" r="11" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.2" />
              </>
            ) : (
              <>
                <path d="M52 21 Q70 28 88 21 A54 54 0 0 0 52 21 Z" fill="#FFF7ED" />
                <circle cx="44" cy="54" r="9" fill="#C2410C" opacity="0.45" />
                <circle cx="95" cy="88" r="11" fill="#C2410C" opacity="0.45" />
              </>
            )}
            <circle cx="55" cy="66" r="4.5" fill="#1E255E" />
            <circle cx="85" cy="66" r="4.5" fill="#1E255E" />
            <path d="M58 78 Q70 89 82 78" fill="none" stroke="#1E255E" strokeWidth="3.8" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Status caption */}
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 font-display text-2xl sm:text-3xl font-bold text-white text-center px-6 mb-4"
        >
          {phase === 'boarding' && 'Lucy is hopping into her spacecraft!'}
          {phase === 'liftoff' && `3, 2, 1... Blasting off to ${isMoon ? 'the Moon' : 'Mars'}!`}
          {phase === 'cruise' && `Touchdown on ${isMoon ? 'the Moon' : 'Mars'} coming up!`}
        </motion.p>

        {/* Rocket & Lucy boarding scene */}
        <div className="relative w-full max-w-md h-72 flex items-end justify-center">
          {/* Lucy hopping toward and into the rocket during boarding */}
          {phase === 'boarding' && (
            <motion.div
              initial={{ x: -130, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: 0, y: -42, scale: 0.45, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="absolute bottom-6 z-20"
            >
              <LucyAvatar mode="walking" facing="right" size={96} />
            </motion.div>
          )}

          {/* Colorful Cartoon Spacecraft */}
          <motion.div
            initial={{ y: 30, scale: 1 }}
            animate={
              phase === 'boarding'
                ? { y: 10, scale: 1, rotate: 0 }
                : phase === 'liftoff'
                ? { y: -90, scale: 1.04, rotate: [0, -2, 2, 0] }
                : { y: -330, scale: 0.42, rotate: 6 }
            }
            transition={{
              duration: phase === 'boarding' ? 0.5 : 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10"
          >
            <svg width="160" height="210" viewBox="0 0 160 210" aria-hidden="true">
              {/* Flame & Exhaust during liftoff/cruise */}
              {phase !== 'boarding' && (
                <g>
                  <path
                    d="M62 152 Q80 205 98 152 Z"
                    fill="#FACC15"
                    stroke="#1E255E"
                    strokeWidth="2.5"
                  />
                  <path d="M70 152 Q80 185 90 152 Z" fill="#F97316" />
                  <circle cx="48" cy="176" r="14" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="112" cy="176" r="14" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="80" cy="190" r="16" fill="#E0F2FE" opacity="0.9" />
                </g>
              )}

              {/* Left & Right Rocket Fins */}
              <path
                d="M48 118 L24 148 L50 144 Z"
                fill="#FF6B4A"
                stroke="#1E255E"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M112 118 L136 148 L110 144 Z"
                fill="#FF6B4A"
                stroke="#1E255E"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Rocket Thruster Nozzle */}
              <path
                d="M62 142 L56 156 L104 156 L98 142 Z"
                fill="#475569"
                stroke="#1E255E"
                strokeWidth="3.2"
              />

              {/* Main Rocket Fuselage */}
              <path
                d="M80 18 C 110 46, 114 96, 108 144 L52 144 C 46 96, 50 46, 80 18 Z"
                fill="#FFFFFF"
                stroke="#1E255E"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />

              {/* Nose Cone Accent */}
              <path
                d="M80 18 C 94 31, 102 46, 105 60 L55 60 C 58 46, 66 31, 80 18 Z"
                fill="#FF6B4A"
                stroke="#1E255E"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              {/* Spacecraft Porthole Window with Lucy inside */}
              <circle cx="80" cy="92" r="22" fill="#38BDF8" stroke="#1E255E" strokeWidth="3.5" />
              <circle cx="80" cy="92" r="17" fill="#E0F2FE" />

              {phase !== 'boarding' && (
                <g>
                  {/* Cute Lucy peeking out the window */}
                  <path d="M68 82 L72 72 L76 80 Z" fill="#EA580C" stroke="#1E255E" strokeWidth="1.8" />
                  <path d="M92 82 L88 72 L84 80 Z" fill="#EA580C" stroke="#1E255E" strokeWidth="1.8" />
                  <ellipse cx="80" cy="92" rx="12" ry="11" fill="#F97316" stroke="#1E255E" strokeWidth="2" />
                  <ellipse cx="80" cy="95" rx="9" ry="7" fill="#FFEDD5" />
                  <circle cx="75.5" cy="90" r="2.2" fill="#1E255E" />
                  <circle cx="84.5" cy="90" r="2.2" fill="#1E255E" />
                  <ellipse cx="80" cy="93" rx="1.8" ry="1.3" fill="#1E255E" />
                  <path d="M76 96 Q80 100 84 96" fill="none" stroke="#1E255E" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              )}

              {/* Stripe Accent */}
              <rect x="61" y="124" width="38" height="9" rx="4" fill="#FACC15" stroke="#1E255E" strokeWidth="2.4" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
