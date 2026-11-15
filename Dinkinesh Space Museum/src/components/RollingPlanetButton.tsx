import React from 'react';
import type { PlanetId } from '../data/artifacts';

interface RollingPlanetButtonProps {
  planet: PlanetId;
  onClick: (planet: PlanetId) => void;
  disabled?: boolean;
}

export const RollingPlanetButton: React.FC<RollingPlanetButtonProps> = ({
  planet,
  onClick,
  disabled = false,
}) => {
  const isMoon = planet === 'moon';

  return (
    <button
      type="button"
      onClick={() => onClick(planet)}
      disabled={disabled}
      className="group relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-3xl bg-[#172052]/90 hover:bg-[#1E2B6B] border-[3px] border-[#38BDF8]/65 hover:border-[#FACC15] shadow-[0_8px_0_#070B1E] hover:-translate-y-1.5 hover:shadow-[0_12px_0_#070B1E] active:translate-y-1 active:shadow-[0_4px_0_#070B1E] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38BDF8] disabled:opacity-60 disabled:cursor-not-allowed min-w-[210px] sm:min-w-[240px]"
      aria-label={`Launch to ${isMoon ? 'the Moon' : 'Mars'} with Lucy`}
    >
      {/* Rolling Planet Illustration (matches Lucy's thick-outline kids animation style) */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
        {/* Soft glowing halo */}
        <div
          className={`absolute inset-2 rounded-full blur-md opacity-45 group-hover:opacity-75 transition-opacity ${
            isMoon ? 'bg-[#38BDF8]' : 'bg-[#FF6B4A]'
          }`}
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 140 140"
          className="relative w-full h-full overflow-visible drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          aria-hidden="true"
        >
          {/* Rotating Planet Body & Craters (nonstop rolling animation) */}
          <g className="animate-planet-roll">
            {isMoon ? (
              <>
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="#F1F5F9"
                  stroke="#1E255E"
                  strokeWidth="3.8"
                />
                {/* Moon Shading Crescent */}
                <path
                  d="M70 16 A54 54 0 0 1 70 124 A44 54 0 0 0 70 16 Z"
                  fill="#CBD5E1"
                  opacity="0.65"
                />
                {/* Moon Craters distributed around the sphere so rotation looks visibly rolling */}
                <circle cx="42" cy="42" r="10" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.4" />
                <circle cx="96" cy="36" r="7" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.4" />
                <circle cx="105" cy="78" r="11" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.4" />
                <circle cx="46" cy="100" r="8.5" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.4" />
                <circle cx="75" cy="108" r="5" fill="#94A3B8" stroke="#1E255E" strokeWidth="2" />
                <circle cx="28" cy="72" r="5.5" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2" />
              </>
            ) : (
              <>
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="#FF7849"
                  stroke="#1E255E"
                  strokeWidth="3.8"
                />
                {/* Mars Warm Shading */}
                <path
                  d="M70 16 A54 54 0 0 1 70 124 A44 54 0 0 0 70 16 Z"
                  fill="#EA580C"
                  opacity="0.55"
                />
                {/* Mars Polar Ice Cap & Surface Patches */}
                <path
                  d="M52 21 Q70 28 88 21 A54 54 0 0 0 52 21 Z"
                  fill="#FFF7ED"
                  opacity="0.9"
                />
                <circle cx="38" cy="52" r="9.5" fill="#C2410C" opacity="0.45" stroke="#1E255E" strokeWidth="2.2" />
                <circle cx="100" cy="48" r="7" fill="#FB923C" stroke="#1E255E" strokeWidth="2.2" />
                <circle cx="96" cy="94" r="10.5" fill="#C2410C" opacity="0.5" stroke="#1E255E" strokeWidth="2.2" />
                <circle cx="44" cy="96" r="7.5" fill="#FDBA74" stroke="#1E255E" strokeWidth="2.2" />
                <ellipse cx="72" cy="108" rx="11" ry="5" fill="#9A3412" opacity="0.4" />
              </>
            )}
          </g>

          {/* Outer Crisp Rim Stroke (keeps silhouette solid while craters roll) */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke="#1E255E"
            strokeWidth="3.8"
          />

          {/* Cute Smiley Face (gently wobbles with the rolling motion) */}
          <g className="animate-planet-face-wobble">
            {/* Eyes */}
            <circle cx="54" cy="64" r="4.8" fill="#1E255E" />
            <circle cx="55.6" cy="62.2" r="1.7" fill="#FFFFFF" />
            <circle cx="86" cy="64" r="4.8" fill="#1E255E" />
            <circle cx="87.6" cy="62.2" r="1.7" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <ellipse
              cx="45"
              cy="73"
              rx="5.5"
              ry="3.2"
              fill={isMoon ? '#FDA4AF' : '#FEF08A'}
              opacity="0.85"
            />
            <ellipse
              cx="95"
              cy="73"
              rx="5.5"
              ry="3.2"
              fill={isMoon ? '#FDA4AF' : '#FEF08A'}
              opacity="0.85"
            />

            {/* Big Happy Smile */}
            <path
              d="M57 74 Q70 88 83 74"
              fill="none"
              stroke="#1E255E"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Glossy Storybook Highlight */}
          <path
            d="M32 39 A 44 44 0 0 1 56 23"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </div>

      <div className="text-center">
        <span className="block font-display text-2xl font-bold text-white tracking-tight">
          {isMoon ? 'The Moon' : 'Mars'}
        </span>
        <span className="block text-sm font-medium text-slate-300 mt-0.5">
          {isMoon ? '2 Historic Landings' : '3 Spacecraft Sites'}
        </span>
      </div>
    </button>
  );
};
