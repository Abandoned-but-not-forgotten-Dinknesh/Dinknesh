import React from 'react';

export type LucyMode = 'waving' | 'walking' | 'idle';

interface LucyAvatarProps {
  mode?: LucyMode;
  facing?: 'left' | 'right';
  showSpeechBubble?: boolean;
  speechText?: string;
  size?: number;
  className?: string;
}

export const LucyAvatar: React.FC<LucyAvatarProps> = ({
  mode = 'waving',
  facing = 'right',
  showSpeechBubble = false,
  speechText = "hello, I’m Lucy!",
  size = 132,
  className = '',
}) => {
  const isWalking = mode === 'walking';
  const isWaving = mode === 'waving';

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {showSpeechBubble && (
        <div
          className="relative mb-2 w-max max-w-[250px] bg-white border-[2.5px] border-[#1E255E] rounded-2xl px-4 py-1.5 shadow-[0_4px_0_#1E255E] animate-lucy-bob text-center"
          role="status"
          aria-live="polite"
        >
          <span className="font-display text-sm sm:text-base font-bold text-[#1E255E] leading-snug block">
            {speechText}
          </span>
          {/* Speech bubble tail */}
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            className="absolute -bottom-[11px] left-1/2 -translate-x-1/2"
            aria-hidden="true"
          >
            <path d="M2 0 L9 10 L16 0 Z" fill="#FFFFFF" />
            <path d="M2 0 L9 10 L16 0" fill="none" stroke="#1E255E" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div
        style={{
          width: size,
          height: size,
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
        className="transition-transform duration-200"
      >
        <svg
          viewBox="0 0 130 130"
          className={`w-full h-full overflow-visible ${isWalking ? 'animate-lucy-walk-bounce' : 'animate-lucy-bob'}`}
          role="img"
          aria-label="Lucy the squirrel astronaut"
        >
          {/* Fluffy Squirrel Tail behind the suit */}
          <g className="animate-lucy-tail">
            <path
              d="M36 96 C 10 92, 6 58, 22 44 C 31 36, 44 42, 42 54 C 40 62, 32 64, 34 72 C 36 80, 44 82, 45 90 Z"
              fill="#F97316"
              stroke="#1E255E"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Tail cream highlight */}
            <path
              d="M21 53 C 16 61, 18 76, 28 84"
              fill="none"
              stroke="#FED7AA"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Space Backpack */}
          <rect
            x="35"
            y="66"
            width="16"
            height="30"
            rx="6"
            fill="#38BDF8"
            stroke="#1E255E"
            strokeWidth="3"
          />
          <rect x="38" y="72" width="7" height="6" rx="2" fill="#FACC15" />

          {/* Left Leg */}
          <g className={isWalking ? 'animate-lucy-leg-left' : ''}>
            <rect
              x="46"
              y="98"
              width="12"
              height="19"
              rx="6"
              fill="#FFFFFF"
              stroke="#1E255E"
              strokeWidth="3"
            />
            {/* Moon Boot Left */}
            <path
              d="M44 113 H59 C61 113 62 119 59 120 H44 C42 120 42 113 44 113 Z"
              fill="#FF6B4A"
              stroke="#1E255E"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>

          {/* Right Leg */}
          <g className={isWalking ? 'animate-lucy-leg-right' : ''}>
            <rect
              x="64"
              y="98"
              width="12"
              height="19"
              rx="6"
              fill="#FFFFFF"
              stroke="#1E255E"
              strokeWidth="3"
            />
            {/* Moon Boot Right */}
            <path
              d="M62 113 H78 C80 113 81 119 78 120 H62 C60 120 60 113 62 113 Z"
              fill="#FF6B4A"
              stroke="#1E255E"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>

          {/* Astronaut Torso */}
          <rect
            x="43"
            y="67"
            width="37"
            height="36"
            rx="14"
            fill="#FFFFFF"
            stroke="#1E255E"
            strokeWidth="3.2"
          />
          {/* Suit Belt & Chest Patch */}
          <rect x="44" y="88" width="35" height="7" rx="3" fill="#38BDF8" stroke="#1E255E" strokeWidth="2.4" />
          <circle cx="62" cy="91.5" r="3.5" fill="#FACC15" stroke="#1E255E" strokeWidth="1.8" />
          {/* Star emblem on chest */}
          <circle cx="68" cy="77" r="5.5" fill="#FEF08A" stroke="#1E255E" strokeWidth="2" />
          <path d="M68 74 L69 76.2 L71.4 76.5 L69.6 78 L70.1 80.3 L68 79.1 L65.9 80.3 L66.4 78 L64.6 76.5 L67 76.2 Z" fill="#F97316" />

          {/* Left Arm (stationary or swinging opposite while walking) */}
          <path
            d="M45 73 C 35 76, 33 87, 39 91 C 42 93, 47 90, 47 85"
            fill="#FFFFFF"
            stroke="#1E255E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="38" cy="90" r="4.5" fill="#FF6B4A" stroke="#1E255E" strokeWidth="2.5" />

          {/* Right Waving Arm */}
          <g className={isWaving ? 'animate-lucy-wave' : ''}>
            <path
              d="M78 74 C 89 68, 96 54, 92 47 C 89 43, 82 47, 81 55 C 80 61, 76 66, 74 69"
              fill="#FFFFFF"
              stroke="#1E255E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Waving Glove */}
            <circle cx="91" cy="48" r="5.5" fill="#FF6B4A" stroke="#1E255E" strokeWidth="2.6" />
            {isWaving && (
              <g stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round">
                <line x1="99" y1="39" x2="103" y2="35" />
                <line x1="102" y1="46" x2="108" y2="45" />
              </g>
            )}
          </g>

          {/* Neck Ring */}
          <rect
            x="45"
            y="62"
            width="34"
            height="8"
            rx="4"
            fill="#38BDF8"
            stroke="#1E255E"
            strokeWidth="2.8"
          />

          {/* Space Helmet Glass Bubble (back tint) */}
          <circle
            cx="62"
            cy="41"
            r="27"
            fill="#E0F2FE"
            stroke="#1E255E"
            strokeWidth="3.2"
          />

          {/* Squirrel Ears inside Helmet */}
          <path
            d="M44 27 C 40 16, 51 15, 53 25 Z"
            fill="#EA580C"
            stroke="#1E255E"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M46 25 C 44 20, 49 19, 50 24 Z" fill="#FED7AA" />
          <path
            d="M79 27 C 83 16, 72 15, 70 25 Z"
            fill="#EA580C"
            stroke="#1E255E"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M77 25 C 79 20, 74 19, 73 24 Z" fill="#FED7AA" />

          {/* Lucy's Cute Squirrel Head */}
          <ellipse
            cx="62"
            cy="43"
            rx="19"
            ry="17"
            fill="#F97316"
            stroke="#1E255E"
            strokeWidth="2.8"
          />
          {/* Cream Squirrel Cheeks & Snout Area */}
          <ellipse cx="62" cy="48" rx="14" ry="10.5" fill="#FFEDD5" />

          {/* Big Happy Eyes */}
          <circle cx="54" cy="39" r="3.4" fill="#1E255E" />
          <circle cx="55.1" cy="37.8" r="1.2" fill="#FFFFFF" />
          <circle cx="70" cy="39" r="3.4" fill="#1E255E" />
          <circle cx="71.1" cy="37.8" r="1.2" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <ellipse cx="48" cy="45" rx="3.4" ry="2.2" fill="#FB7185" opacity="0.65" />
          <ellipse cx="76" cy="45" rx="3.4" ry="2.2" fill="#FB7185" opacity="0.65" />

          {/* Cute Squirrel Nose */}
          <ellipse cx="62" cy="43.5" rx="2.6" ry="1.9" fill="#1E255E" />

          {/* Enthusiastic Smile */}
          <path
            d="M56 47.5 Q62 54 68 47.5"
            fill="none"
            stroke="#1E255E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Tiny cute squirrel tooth */}
          <rect x="60.4" y="49.2" width="3.2" height="2.6" rx="0.8" fill="#FFFFFF" stroke="#1E255E" strokeWidth="1" />

          {/* Helmet Front Glass Glare */}
          <path
            d="M42 29 A 22 22 0 0 1 58 19"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="39" cy="35" r="2" fill="#FFFFFF" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
};
