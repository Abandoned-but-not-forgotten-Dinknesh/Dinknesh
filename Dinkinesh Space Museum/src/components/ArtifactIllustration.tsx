import React from 'react';
import apollo11Img from '../assets/images/apollo_11_descent_1794694118159.jpg';
import apollo15Img from '../assets/images/apollo_15_falcon_1794694119612.jpg';
import viking1Img from '../assets/images/viking_1_lander_1794694120618.jpg';
import opportunityImg from '../assets/images/opportunity_rover_1794694119816.jpg';
import ingenuityImg from '../assets/images/ingenuity_helicopter_1794694119979.jpg';
import spiritImg from '../assets/images/spirit_rover_1794694120942.jpg';

const ARTIFACT_PHOTOS: Record<string, { src: string; alt: string }> = {
  'apollo-11': {
    src: apollo11Img,
    alt: 'Apollo 11 Lunar Module Descent Stage on the Moon at Tranquility Base',
  },
  'apollo-15': {
    src: apollo15Img,
    alt: 'Apollo 15 Falcon Lunar Module and Lunar Roving Vehicle on the Moon',
  },
  'viking-1': {
    src: viking1Img,
    alt: 'Viking 1 Lander on the Martian surface at Chryse Planitia',
  },
  'spirit-opportunity': {
    src: opportunityImg,
    alt: 'Spirit and Opportunity Twin Mars Exploration Rovers on Martian terrain',
  },
  opportunity: {
    src: opportunityImg,
    alt: 'Opportunity Mars Exploration Rover on Martian sand dunes',
  },
  ingenuity: {
    src: ingenuityImg,
    alt: 'Ingenuity Mars Helicopter on the surface of Jezero Crater',
  },
  spirit: {
    src: spiritImg,
    alt: 'Spirit Mars Exploration Rover in Gusev Crater near the Columbia Hills',
  },
};

interface ArtifactIllustrationProps {
  artifactId: string;
  className?: string;
  variant?: 'photo' | 'vector';
}

export const ArtifactIllustration: React.FC<ArtifactIllustrationProps> = ({
  artifactId,
  className = 'w-full h-44 object-cover',
  variant = 'photo',
}) => {
  if (variant === 'photo') {
    const photo = ARTIFACT_PHOTOS[artifactId];
    if (photo) {
      return (
        <img
          src={photo.src}
          alt={photo.alt}
          referrerPolicy="no-referrer"
          className={className}
        />
      );
    }
  }

  switch (artifactId) {
    case 'apollo-11':
      return (
        <svg viewBox="0 0 260 150" className={className} role="img" aria-label="Apollo 11 Descent Stage remnants">
          {/* Lunar dust ground */}
          <path d="M0 120 Q130 105 260 120 L260 150 L0 150 Z" fill="#CBD5E1" />
          <ellipse cx="130" cy="126" rx="70" ry="9" fill="#94A3B8" opacity="0.45" />
          {/* Footprints */}
          <g fill="#64748B" opacity="0.7">
            <ellipse cx="42" cy="130" rx="5" ry="2.5" />
            <ellipse cx="56" cy="135" rx="5" ry="2.5" />
            <ellipse cx="72" cy="131" rx="5" ry="2.5" />
          </g>
          {/* Flag beside lander */}
          <line x1="205" y1="68" x2="205" y2="124" stroke="#E2E8F0" strokeWidth="3" />
          <rect x="206" y="69" width="28" height="17" fill="#3B82F6" stroke="#1E255E" strokeWidth="1.8" />
          <line x1="217" y1="73" x2="233" y2="73" stroke="#EF4444" strokeWidth="2.5" />
          <line x1="217" y1="79" x2="233" y2="79" stroke="#EF4444" strokeWidth="2.5" />
          {/* Lander 4 Legs & Pads */}
          <line x1="95" y1="95" x2="66" y2="125" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="165" y1="95" x2="194" y2="125" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="115" y1="98" x2="105" y2="132" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <line x1="145" y1="98" x2="155" y2="132" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="66" cy="126" rx="11" ry="4" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="194" cy="126" rx="11" ry="4" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="105" cy="132" rx="10" ry="3.5" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="155" cy="132" rx="10" ry="3.5" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          {/* Engine Bell underneath */}
          <path d="M122 103 L116 119 L144 119 L138 103 Z" fill="#475569" stroke="#1E255E" strokeWidth="2.2" />
          {/* Golden Kapton Octagonal Descent Stage */}
          <polygon
            points="92,68 168,68 178,86 168,104 92,104 82,86"
            fill="#FACC15"
            stroke="#1E255E"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="103" y="73" width="54" height="25" rx="3" fill="#F59E0B" stroke="#1E255E" strokeWidth="2" />
          {/* Ladder on front leg */}
          <line x1="130" y1="76" x2="130" y2="122" stroke="#E2E8F0" strokeWidth="2.5" />
          <line x1="125" y1="86" x2="135" y2="86" stroke="#1E255E" strokeWidth="2" />
          <line x1="125" y1="96" x2="135" y2="96" stroke="#1E255E" strokeWidth="2" />
          <line x1="125" y1="106" x2="135" y2="106" stroke="#1E255E" strokeWidth="2" />
          {/* Top separation ring where Ascent Stage blasted off */}
          <ellipse cx="130" cy="68" rx="30" ry="5" fill="#475569" stroke="#1E255E" strokeWidth="2.2" />
        </svg>
      );

    case 'apollo-15':
      return (
        <svg viewBox="0 0 260 150" className={className} role="img" aria-label="Apollo 15 Lunar Module and Moon Rover remnants">
          {/* Apennine Mountain backdrop */}
          <path d="M0 118 L48 58 L95 96 L152 50 L215 102 L260 76 L260 150 L0 150 Z" fill="#94A3B8" opacity="0.35" />
          <path d="M0 122 Q130 110 260 122 L260 150 L0 150 Z" fill="#CBD5E1" />
          {/* Falcon Descent Stage on Left */}
          <line x1="58" y1="98" x2="36" y2="126" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <line x1="106" y1="98" x2="128" y2="126" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="36" cy="127" rx="9" ry="3.5" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="128" cy="127" rx="9" ry="3.5" fill="#FACC15" stroke="#1E255E" strokeWidth="2" />
          <polygon points="55,72 109,72 116,88 109,103 55,103 48,88" fill="#F59E0B" stroke="#1E255E" strokeWidth="2.8" />
          <ellipse cx="82" cy="72" rx="22" ry="4" fill="#475569" stroke="#1E255E" strokeWidth="2" />
          {/* Lunar Roving Vehicle (Moon Buggy) on Right */}
          <rect x="155" y="108" width="66" height="8" rx="3" fill="#E2E8F0" stroke="#1E255E" strokeWidth="2.4" />
          {/* Seats */}
          <path d="M173 108 L173 96 L183 96" fill="none" stroke="#1E255E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M192 108 L192 96 L202 96" fill="none" stroke="#1E255E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Umbrella High-Gain Dish */}
          <line x1="212" y1="108" x2="212" y2="82" stroke="#1E255E" strokeWidth="2.4" />
          <path d="M196 82 Q212 68 228 82 Z" fill="#FACC15" stroke="#1E255E" strokeWidth="2.2" />
          {/* Wire-mesh Wheels */}
          <circle cx="166" cy="122" r="11" fill="#475569" stroke="#1E255E" strokeWidth="2.8" />
          <circle cx="166" cy="122" r="4.5" fill="#FACC15" />
          <circle cx="212" cy="122" r="11" fill="#475569" stroke="#1E255E" strokeWidth="2.8" />
          <circle cx="212" cy="122" r="4.5" fill="#FACC15" />
        </svg>
      );

    case 'viking-1':
      return (
        <svg viewBox="0 0 260 150" className={className} role="img" aria-label="Viking 1 Lander remnants on Mars">
          {/* Rusty Martian plain */}
          <path d="M0 116 Q130 106 260 118 L260 150 L0 150 Z" fill="#EA580C" opacity="0.85" />
          {/* Martian Boulders */}
          <path d="M22 128 L38 114 L56 128 Z" fill="#9A3412" stroke="#1E255E" strokeWidth="2" />
          <path d="M204 130 L220 116 L242 132 Z" fill="#9A3412" stroke="#1E255E" strokeWidth="2" />
          {/* Viking 3 Landing Legs */}
          <line x1="94" y1="98" x2="72" y2="128" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="166" y1="98" x2="188" y2="128" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="130" y1="100" x2="130" y2="134" stroke="#CBD5E1" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="72" cy="129" rx="10" ry="3.5" fill="#475569" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="188" cy="129" rx="10" ry="3.5" fill="#475569" stroke="#1E255E" strokeWidth="2" />
          <ellipse cx="130" cy="134" rx="10" ry="3.5" fill="#475569" stroke="#1E255E" strokeWidth="2" />
          {/* Viking Hexagonal Body */}
          <rect x="86" y="76" width="88" height="24" rx="6" fill="#F8FAFC" stroke="#1E255E" strokeWidth="3" />
          <rect x="94" y="81" width="22" height="14" rx="3" fill="#F97316" stroke="#1E255E" strokeWidth="2" />
          <rect x="144" y="81" width="22" height="14" rx="3" fill="#F97316" stroke="#1E255E" strokeWidth="2" />
          {/* High-Gain Dish Antenna */}
          <line x1="146" y1="76" x2="152" y2="54" stroke="#1E255E" strokeWidth="3" />
          <ellipse cx="154" cy="48" rx="22" ry="9" transform="rotate(-18 154 48)" fill="#F1F5F9" stroke="#1E255E" strokeWidth="2.6" />
          {/* Weather Mast & Camera Turrets */}
          <line x1="106" y1="76" x2="106" y2="42" stroke="#1E255E" strokeWidth="3" />
          <circle cx="106" cy="40" r="5" fill="#38BDF8" stroke="#1E255E" strokeWidth="2" />
          <rect x="122" y="60" width="12" height="16" rx="2" fill="#CBD5E1" stroke="#1E255E" strokeWidth="2.2" />
          {/* Soil Scoop Arm */}
          <path d="M86 88 L56 96 L46 112" fill="none" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'spirit-opportunity':
    case 'opportunity':
    case 'spirit': {
      const isSpirit = artifactId === 'spirit';
      return (
        <svg viewBox="0 0 260 150" className={className} role="img" aria-label={`${isSpirit ? 'Spirit' : 'Opportunity'} Mars Rover remnants`}>
          {/* Martian Dune Ground */}
          <path d="M0 116 Q130 104 260 116 L260 150 L0 150 Z" fill={isSpirit ? '#C2410C' : '#EA580C'} opacity="0.88" />
          {isSpirit && (
            /* Bright white silica streak uncovered by Spirit's wheel */
            <ellipse cx="64" cy="130" rx="28" ry="6" fill="#FEF3C7" opacity="0.8" />
          )}
          {/* Rover Rocker-Bogie Suspension */}
          <g transform={isSpirit ? 'rotate(-5 130 100)' : ''}>
            <path d="M74 116 L96 96 L130 100 L164 96 L186 116" fill="none" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* 6 Rover Wheels */}
            <circle cx="74" cy="120" r="10.5" fill="#334155" stroke="#1E255E" strokeWidth="2.6" />
            <circle cx="112" cy="120" r="10.5" fill="#334155" stroke="#1E255E" strokeWidth="2.6" />
            <circle cx="150" cy="120" r="10.5" fill="#334155" stroke="#1E255E" strokeWidth="2.6" />
            <circle cx="186" cy="120" r="10.5" fill="#334155" stroke="#1E255E" strokeWidth="2.6" />
            <circle cx="74" cy="120" r="3.5" fill="#CBD5E1" />
            <circle cx="112" cy="120" r="3.5" fill="#CBD5E1" />
            <circle cx="150" cy="120" r="3.5" fill="#CBD5E1" />
            <circle cx="186" cy="120" r="3.5" fill="#CBD5E1" />

            {/* Warm Electronics Box */}
            <rect x="98" y="80" width="64" height="22" rx="4" fill="#FACC15" stroke="#1E255E" strokeWidth="2.8" />
            {/* Solar Wings */}
            <polygon points="56,74 102,80 96,90 50,84" fill="#1D4ED8" stroke="#1E255E" strokeWidth="2.5" />
            <polygon points="158,80 204,74 210,84 164,90" fill="#1D4ED8" stroke="#1E255E" strokeWidth="2.5" />
            <line x1="75" y1="77" x2="71" y2="87" stroke="#60A5FA" strokeWidth="1.5" />
            <line x1="185" y1="77" x2="189" y2="87" stroke="#60A5FA" strokeWidth="1.5" />

            {/* Pancam Mast & Cute Rover Eyes */}
            <line x1="146" y1="80" x2="146" y2="42" stroke="#E2E8F0" strokeWidth="4" />
            <rect x="131" y="32" width="32" height="14" rx="4" fill="#F8FAFC" stroke="#1E255E" strokeWidth="2.6" />
            <circle cx="140" cy="39" r="3" fill="#0F172A" />
            <circle cx="154" cy="39" r="3" fill="#0F172A" />
            <circle cx="141" cy="38" r="1" fill="#38BDF8" />
            <circle cx="155" cy="38" r="1" fill="#38BDF8" />
          </g>
        </svg>
      );
    }

    case 'ingenuity':
      return (
        <svg viewBox="0 0 260 150" className={className} role="img" aria-label="Ingenuity Mars Helicopter remnants">
          {/* Jezero Crater Sand */}
          <path d="M0 118 Q130 106 260 118 L260 150 L0 150 Z" fill="#D97706" opacity="0.82" />
          {/* Rover tracks nearby */}
          <path d="M18 134 Q70 128 115 138" fill="none" stroke="#9A3412" strokeWidth="4" strokeDasharray="6 4" opacity="0.5" />
          {/* Helicopter Shadow */}
          <ellipse cx="130" cy="126" rx="44" ry="7" fill="#7C2D12" opacity="0.35" />
          {/* 4 Carbon Landing Legs */}
          <line x1="118" y1="95" x2="88" y2="125" stroke="#1E255E" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="142" y1="95" x2="172" y2="125" stroke="#1E255E" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="122" y1="97" x2="104" y2="129" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="138" y1="97" x2="156" y2="129" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" />
          {/* Gold Foil Fuselage Box */}
          <rect x="112" y="76" width="36" height="24" rx="5" fill="#FACC15" stroke="#1E255E" strokeWidth="2.8" />
          <circle cx="130" cy="88" r="4" fill="#1E255E" />
          {/* Central Rotor Mast */}
          <line x1="130" y1="76" x2="130" y2="40" stroke="#475569" strokeWidth="4" />
          {/* Twin Coaxial Carbon-Fiber Rotor Blades */}
          <ellipse cx="130" cy="56" rx="72" ry="5" fill="#334155" stroke="#1E255E" strokeWidth="2.2" />
          <ellipse cx="130" cy="46" rx="68" ry="4.5" fill="#475569" stroke="#1E255E" strokeWidth="2.2" />
          {/* Top Solar Panel Cap */}
          <rect x="108" y="34" width="44" height="7" rx="2" fill="#2563EB" stroke="#1E255E" strokeWidth="2" />
        </svg>
      );

    default:
      return null;
  }
};
