import React from 'react';
import type { PlanetId } from '../data/artifacts';
import { LucyAvatar } from './LucyAvatar';
import { RollingPlanetButton } from './RollingPlanetButton';
import type { RouteView } from './TopBar';

interface HomePageProps {
  isLaunching: boolean;
  onLaunchPlanet: (planet: PlanetId) => void;
  onNavigate: (route: RouteView) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  isLaunching,
  onLaunchPlanet,
  onNavigate,
}) => {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-[#0C1232] via-[#131C48] to-[#192356] text-white">
      {/* Cheerful cosmic space glow & stars (bright & bubbly without overwhelming) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#38BDF8]/18 blur-3xl" />
        <div className="absolute top-28 -right-20 w-72 h-72 rounded-full bg-[#FACC15]/14 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-72 rounded-full bg-[#FF6B4A]/14 blur-3xl" />

        {/* Twinkling space stars & sparkles */}
        <svg className="absolute top-14 left-[10%] w-7 h-7 text-[#FACC15]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
        </svg>
        <svg className="absolute top-24 right-[12%] w-6 h-6 text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
        </svg>
        <svg className="absolute bottom-28 left-[8%] w-5 h-5 text-[#FF6B4A]/85" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
        </svg>
        <svg className="absolute bottom-36 right-[9%] w-6 h-6 text-[#34D399]/85" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
        </svg>
        <div className="absolute top-40 left-[22%] w-1.5 h-1.5 rounded-full bg-[#FEF9C3]/80" />
        <div className="absolute top-16 left-[48%] w-2 h-2 rounded-full bg-[#BAE6FD]/80" />
        <div className="absolute bottom-48 right-[24%] w-1.5 h-1.5 rounded-full bg-[#FEF9C3]/75" />
        <div className="absolute top-64 right-[6%] w-1.5 h-1.5 rounded-full bg-white/70" />
      </div>

      {/* Main Centered Museum Welcome Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-14 sm:pt-14 sm:pb-16 flex flex-col items-center text-center">
        {/* Middle Heading + Lucy Squirrel Astronaut Beside the Writing */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full max-w-4xl">
          {/* Main Big Enthusiastic Greeting */}
          <div className="flex-1 text-center md:text-left">
            <h1
              className="font-display font-bold text-white leading-[1.14] tracking-tight"
              style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.55rem)', textWrap: 'balance' }}
            >
              hello, future scientists and engineers!! Welcome to{' '}
              <span className="text-[#FACC15]">ድንቅነሽ Space Museum!!</span>
            </h1>

            {/* Distinct smaller & different style subtitle directly under the heading */}
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-200 mt-4 leading-relaxed">
              where we look back and reminisce our past inventions
            </p>
          </div>

          {/* Cute Small Smiley Squirrel Astronaut Avatar waving nonstop until buttons are clicked */}
          <div className="shrink-0 flex flex-col items-center">
            <LucyAvatar
              mode={isLaunching ? 'idle' : 'waving'}
              showSpeechBubble={true}
              speechText="hello, I’m Lucy!"
              size={146}
            />
          </div>
        </div>

        {/* Two Big Clickable Rolling Moon & Mars Buttons */}
        <div className="mt-10 sm:mt-12 w-full max-w-2xl">
          <p className="text-sm sm:text-base font-semibold text-sky-200/90 mb-5">
            Pick a world below to launch with Lucy in her spacecraft:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <RollingPlanetButton
              planet="moon"
              onClick={onLaunchPlanet}
              disabled={isLaunching}
            />
            <RollingPlanetButton
              planet="mars"
              onClick={onLaunchPlanet}
              disabled={isLaunching}
            />
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-14 w-full max-w-3xl border-t border-white/15 pt-8 flex flex-wrap items-center justify-center gap-8 text-sm">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'exhibits' })}
            className="font-semibold text-[#FACC15] hover:text-[#FDE047] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            View All 5 Exhibits →
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'quiz' })}
            className="font-semibold text-[#38BDF8] hover:text-[#7DD3FC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Take Lucy’s Space Quiz →
          </button>
        </div>
      </section>
    </main>
  );
};
