import React from 'react';
import type { PlanetId } from '../data/artifacts';

export type RouteView =
  | { page: 'home' }
  | { page: 'planet'; planet: PlanetId }
  | { page: 'artifact'; planet: PlanetId; artifactId: string }
  | { page: 'exhibits' }
  | { page: 'quiz' };

interface TopBarProps {
  currentRoute: RouteView;
  onNavigate: (route: RouteView) => void;
  darkTheme?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  onNavigate,
  darkTheme = false,
}) => {
  const isHome = currentRoute.page === 'home';
  const isMoon =
    (currentRoute.page === 'planet' || currentRoute.page === 'artifact') &&
    currentRoute.planet === 'moon';
  const isMars =
    (currentRoute.page === 'planet' || currentRoute.page === 'artifact') &&
    currentRoute.planet === 'mars';
  const isExhibits = currentRoute.page === 'exhibits';
  const isQuiz = currentRoute.page === 'quiz';

  const navLinkClass = (active: boolean) => {
    if (darkTheme) {
      return `text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
        active
          ? 'text-white border-[#FACC15]'
          : 'text-slate-300 border-transparent hover:text-white hover:border-white/40'
      }`;
    }
    return `text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
      active
        ? 'text-[#1E255E] border-[#FF6B4A]'
        : 'text-[#475569] border-transparent hover:text-[#1E255E] hover:border-[#1E255E]/30'
    }`;
  };

  return (
    <header
      className={`w-full border-b transition-colors ${
        darkTheme
          ? 'bg-[#0E1538]/90 border-white/15 text-white'
          : 'bg-[#FFFBF2]/90 border-[#1E255E]/12 text-[#1E255E]'
      } backdrop-blur-md sticky top-0 z-30`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="font-display text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] rounded"
        >
          ድንቅነሽ Space Museum
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Museum sections">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'home' })}
            className={navLinkClass(isHome)}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'planet', planet: 'moon' })}
            className={navLinkClass(isMoon)}
          >
            The Moon
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'planet', planet: 'mars' })}
            className={navLinkClass(isMars)}
          >
            Mars
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'exhibits' })}
            className={navLinkClass(isExhibits)}
          >
            All Exhibits
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'quiz' })}
            className={navLinkClass(isQuiz)}
          >
            Quiz
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {isHome ? (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'exhibits' })}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#FF6B4A] hover:bg-[#EA580C] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_2px_0_#1E255E] border-2 border-[#1E255E]"
            >
              Browse Exhibits
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'home' })}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border-2 ${
                darkTheme
                  ? 'bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] border-white/80'
                  : 'bg-[#FF6B4A] hover:bg-[#EA580C] text-white border-[#1E255E]'
              }`}
            >
              Back Home
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile nav bar */}
      <nav
        className={`flex md:hidden items-center justify-around px-3 py-2 border-t text-xs font-medium ${
          darkTheme ? 'border-white/10 text-slate-300' : 'border-[#1E255E]/10 text-[#475569]'
        }`}
        aria-label="Mobile navigation"
      >
        <button type="button" onClick={() => onNavigate({ page: 'home' })} className={navLinkClass(isHome)}>
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'planet', planet: 'moon' })}
          className={navLinkClass(isMoon)}
        >
          The Moon
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'planet', planet: 'mars' })}
          className={navLinkClass(isMars)}
        >
          Mars
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'exhibits' })}
          className={navLinkClass(isExhibits)}
        >
          Exhibits
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'quiz' })}
          className={navLinkClass(isQuiz)}
        >
          Quiz
        </button>
      </nav>
    </header>
  );
};
