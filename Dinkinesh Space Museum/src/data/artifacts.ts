export type PlanetId = 'moon' | 'mars';

export interface ArtifactInfo {
  id: string;
  planet: PlanetId;
  name: string;
  shortLabel: string;
  missionName: string;
  landingDate: string;
  landingSite: string;
  coordinates: string;
  agency: string;
  /** Position inside SVG viewBox 0..800 x 0..600 on the planet canvas */
  svgX: number;
  svgY: number;
  shortSummary: string;
  summary: string;
  lucyNote: string;
  broaderStory: {
    headline: string;
    lead: string;
    sections: {
      title: string;
      body: string;
    }[];
    engineeringFacts: {
      label: string;
      value: string;
    }[];
    whyItMatters: string;
  };
}

export interface PlanetConfig {
  id: PlanetId;
  title: string;
  subtitle: string;
  distanceNote: string;
  gravityNote: string;
  artifacts: ArtifactInfo[];
}

export const MOON_ARTIFACTS: ArtifactInfo[] = [
  {
    id: 'apollo-11',
    planet: 'moon',
    name: 'Apollo 11 Descent Stage',
    shortLabel: 'Apollo 11 Descent Stage',
    missionName: 'Apollo 11 (LM-5 "Eagle")',
    landingDate: 'July 20, 1969',
    landingSite: 'Mare Tranquillitatis (Sea of Tranquility)',
    coordinates: '0.674° N, 23.473° E',
    agency: 'NASA',
    // Orthographic projection centered at (8° N, 12° E), R=235 around (400, 300)
    svgX: 447,
    svgY: 329,
    shortSummary:
      'In 1969, astronauts landed in the Eagle lunar module. When they blasted back home, this golden four-legged Descent Stage stayed behind as their launchpad.',
    summary:
      'In July 1969, astronauts Neil Armstrong and Buzz Aldrin landed on the Moon inside the Eagle lunar module. When they blasted back off to go home, this golden four-legged Descent Stage stayed behind forever as a launchpad and monument.',
    lucyNote:
      'Look closely at those shiny gold blankets! They protected the spacecraft from the freezing cold and super hot sunlight of space.',
    broaderStory: {
      headline: 'The Golden Launchpad That Left Footprints on Another World',
      lead: 'Before Apollo 11, humans had only ever walked on Earth. To land softly on a world with no air and no runways, engineers invented a two-part spider-like spacecraft called the Lunar Module.',
      sections: [
        {
          title: 'Why Only the Bottom Half Stayed Behind',
          body: 'Carrying extra empty fuel tanks back into lunar orbit would have wasted precious rocket fuel. So engineers designed the Lunar Module in two pieces: a lower Descent Stage with four wide landing pads and a throttleable rocket engine, and an upper Ascent Stage crew cabin. When it was time to leave, explosive bolts separated the two halves and the Descent Stage acted as a launchpad on the Moon.',
        },
        {
          title: 'What Remains at Tranquility Base Today',
          body: 'Because the Moon has no wind, rain, or rushing rivers, almost everything left behind in 1969 looks much like it did the day the astronauts departed. The gold Kapton foil-wrapped octagonal frame, the nine-rung ladder on the front landing leg, the stainless-steel plaque reading "We came in peace for all mankind," scientific reflectors, and even the astronauts’ bootprints remain preserved in the fine gray lunar dust.',
        },
        {
          title: 'A Mirror Still Talking to Earth',
          body: 'Just steps away from the Descent Stage sits a small tray of 100 special glass corner-cube prisms. Even today, scientists on Earth shine laser pulses at those prisms and measure how long the light takes to bounce back—measuring the distance to the Moon down to the width of a fingernail!',
        },
      ],
      engineeringFacts: [
        { label: 'Landing Date', value: 'July 20, 1969' },
        { label: 'Site Coordinates', value: '0.674° N, 23.473° E' },
        { label: 'Distance to Apollo 15', value: '~964 km Northwest' },
        { label: 'Descent Stage Height', value: '3.2 meters' },
        { label: 'Dry Mass Left on Moon', value: '2,034 kg' },
      ],
      whyItMatters:
        'Apollo 11 proved that creative engineering—like lightweight aluminum frames, digital guidance computers, and two-stage landers—could carry people safely to another celestial body and bring them home.',
    },
  },
  {
    id: 'apollo-15',
    planet: 'moon',
    name: 'Apollo 15 Lunar Module',
    shortLabel: 'Apollo 15 Lunar Module',
    missionName: 'Apollo 15 (LM-10 "Falcon")',
    landingDate: 'July 30, 1971',
    landingSite: 'Hadley–Apennine (Palus Putredinis)',
    coordinates: '26.132° N, 3.634° E',
    agency: 'NASA',
    // Orthographic projection centered at (8° N, 12° E), R=235 around (400, 300)
    // Screen distance from Apollo 11 = ~129 px, proportional to 964 km on Moon diameter 3,474.8 km
    svgX: 369,
    svgY: 227,
    shortSummary:
      'Landed between giant lunar mountains in 1971, Falcon carried the very first foldable electric Moon buggy so astronauts could drive across craters.',
    summary:
      'Perched between towering 4,500-meter lunar mountains and a winding canyon called Hadley Rille, the Falcon Lunar Module brought the very first electric Moon car—the Lunar Roving Vehicle—so astronauts could explore kilometers away!',
    lucyNote:
      'My favorite invention here is the foldable Moon buggy! It packed flat inside the Falcon descent stage like origami and popped right out.',
    broaderStory: {
      headline: 'The Mountain Basecamp That Brought Wheels to the Moon',
      lead: 'Apollo 15 was the first "J-Mission," transforming lunar landings from brief visits into three-day scientific expeditions among ancient mountains and volcanic canyons.',
      sections: [
        {
          title: 'Packing a Car Into a Spaceship',
          body: 'The Apollo 15 Lunar Module "Falcon" carried a remarkable secret tucked into one of its side equipment bays: the Lunar Roving Vehicle (LRV). Built from ultra-light aluminum tubes and woven wire-mesh tires, the 210-kilogram electric rover folded up like a giant camp chair. Once astronauts David Scott and James Irwin landed, they pulled lanyards and lowered the rover smoothly onto the Moon’s dust.',
        },
        {
          title: 'Discovering the Genesis Rock',
          body: 'With their electric buggy, the astronauts drove 27.9 kilometers across rolling hills and along the rim of Hadley Rille. There they collected the famous "Genesis Rock," a white anorthosite stone over 4 billion years old that helped scientists understand how the Moon originally formed from a molten ocean of magma.',
        },
        {
          title: 'Remnants Under the Apennine Peaks',
          body: 'Today, Falcon’s Descent Stage still stands upright near Hadley Rille, roughly 964 kilometers northwest of Apollo 11. Parked about 100 meters east of the lander sits the first Lunar Rover, its high-gain umbrella antenna still aimed silently toward Earth.',
        },
      ],
      engineeringFacts: [
        { label: 'Landing Date', value: 'July 30, 1971' },
        { label: 'Site Coordinates', value: '26.132° N, 3.634° E' },
        { label: 'Distance to Apollo 11', value: '~964 km Southeast' },
        { label: 'Rover Drive Distance', value: '27.9 km' },
        { label: 'Surface Stay Duration', value: '66 hours 54 minutes' },
      ],
      whyItMatters:
        'Apollo 15 showed how robotic mobility and careful geological fieldwork multiply what explorers can discover—paving the way for all future planetary rovers.',
    },
  },
];

export const MARS_ARTIFACTS: ArtifactInfo[] = [
  {
    id: 'viking-1',
    planet: 'mars',
    name: 'Viking 1',
    shortLabel: 'Viking 1',
    missionName: 'Viking 1 Lander',
    landingDate: 'July 20, 1976',
    landingSite: 'Chryse Planitia (Plains of Gold)',
    coordinates: '22.27° N, 47.95° W',
    agency: 'NASA',
    // Proportional distance checks (scale ~31.5 km/px):
    // Viking 1 -> Opportunity = 89.6 px (~2,822 km)
    svgX: 220,
    svgY: 248,
    shortSummary:
      'In 1976, Viking 1 became the first spacecraft to land safely on Mars, sending back color photos and tracking Martian weather for over six years.',
    summary:
      'Viking 1 made history in 1976 as the first spacecraft to land safely on Mars and send clear color photos from the surface for more than six years! Its three-legged body and weather boom still rest in the rusty rocks of Chryse Planitia.',
    lucyNote:
      'Before Viking 1, nobody knew what standing on Mars really looked like. Its spinning camera gave us our very first sunset postcard from Mars!',
    broaderStory: {
      headline: 'Our First Long-Term Eyes and Weather Station on Mars',
      lead: 'After traveling nearly a year through deep space, the Viking 1 Lander plunged into Mars’s thin pink sky on July 20, 1976—exactly seven years to the day after Apollo 11 landed on the Moon.',
      sections: [
        {
          title: 'Touchdown in the Plains of Gold',
          body: 'Because Mars has a thin atmosphere, Viking 1 could not rely on parachutes alone—and unlike the Moon, it needed a heat shield first. Engineers combined an aerodynamic shell, a supersonic parachute, and three clusters of 18-nozzle landing engines that stopped firing the instant its footpads touched Martian soil.',
        },
        {
          title: 'Scooping Rusty Soil and Tracking Martian Seasons',
          body: 'Viking 1 stretched out a three-meter robotic arm to scoop up soil samples and test them inside a miniature biology laboratory tucked inside the lander. Its weather mast measured daily temperatures, pressure drops, and fierce dust storms for over 2,245 Martian days (sols), far outliving its planned 90-day mission.',
        },
        {
          title: 'A Quiet Monument Since 1982',
          body: 'Named the Thomas A. Mutch Memorial Station, Viking 1 rests upright on its three landing legs in Chryse Planitia. Fine reddish dust blankets its circular dish antenna and nuclear power covers, preserving the pioneer that taught engineers how to land on Mars.',
        },
      ],
      engineeringFacts: [
        { label: 'Landing Date', value: 'July 20, 1976' },
        { label: 'Site Coordinates', value: '22.27° N, 47.95° W' },
        { label: 'Distance to Opportunity', value: '~2,822 km Southeast' },
        { label: 'Active Surface Life', value: '2,245 sols (~6.4 Earth years)' },
        { label: 'Landing Mass', value: '572 kg' },
      ],
      whyItMatters:
        'Viking 1 proved long-duration surface science on Mars was possible and gave humanity its first complete seasonal weather record of another planet.',
    },
  },
  {
    id: 'spirit-opportunity',
    planet: 'mars',
    name: 'Spirit & Opportunity',
    shortLabel: 'Spirit & Opportunity',
    missionName: 'Mars Exploration Rovers (MER-A & MER-B)',
    landingDate: 'January 2004',
    landingSite: 'Gusev Crater & Meridiani Planum',
    coordinates: '14.57° S, 175.47° E · 1.95° S, 5.53° W',
    agency: 'NASA',
    // Proportional distance from Viking 1 to Opportunity in Meridiani Planum (~2,822 km)
    svgX: 290,
    svgY: 304,
    shortSummary:
      'Identical twin six-wheeled rovers built for a 90-day mission! Spirit climbed hills in Gusev Crater while Opportunity rolled 45.16 km across Meridiani Planum.',
    summary:
      'Designed as identical robotic twins for a 90-day trip, Spirit and Opportunity bounced onto opposite sides of Mars in January 2004 inside giant airbags—and kept exploring for years! Spirit scaled Husband Hill and uncovered hot-spring silica, while Opportunity drove a record 45.16 kilometers and found ancient water-formed rocks.',
    lucyNote:
      'Because Spirit and Opportunity were built as identical twins, engineers could even test fixes on a spare twin back on Earth before beaming commands across space!',
    broaderStory: {
      headline: 'The Identical Twin Rovers That Explored Opposite Sides of Mars',
      lead: 'In January 2004, NASA landed two identical six-wheeled solar-powered rovers—Spirit in Gusev Crater and Opportunity halfway around the planet on Meridiani Planum. Built to last 90 Martian days, together they explored Mars for over 15 years.',
      sections: [
        {
          title: 'Two Identical Twins, Two Opposite Worlds',
          body: 'Spirit (MER-A) and Opportunity (MER-B) shared the exact same chassis, rocker-bogie suspension, solar wings, and panoramic camera masts. Wrapped inside clusters of 24 giant inflatable airbags, both bounced safely onto Martian soil three weeks apart—Spirit on January 4 and Opportunity on January 25, 2004.',
        },
        {
          title: 'Scaling Hills & Rolling a Martian Marathon',
          body: 'In Gusev Crater, Spirit became the first robot to climb a mountain on another planet, scaling 106 meters up Husband Hill. Even after a wheel jammed, Spirit drove backwards—accidentally scraping open bright white silica from ancient Martian hot springs! Meanwhile on Meridiani Planum, Opportunity spotted tiny round iron "blueberries" formed in ancient shallow water.',
        },
        {
          title: 'Long-Lived Monuments on the Red Planet',
          body: 'Lucky Martian winds repeatedly swept dust off their solar panels, multiplying their mission lives. Spirit operated for over six years until getting trapped in soft sand at Troy in 2009, while Opportunity drove an off-world record of 45.16 kilometers before a global dust storm ended its 14-year journey in 2018.',
        },
      ],
      engineeringFacts: [
        { label: 'Landing Dates', value: 'Jan 4 & Jan 25, 2004' },
        { label: 'Twin Sites', value: 'Gusev Crater & Meridiani Planum' },
        { label: 'Distance (Viking 1 → Oppy)', value: '~2,822 km Southeast' },
        { label: 'Opportunity Drive Record', value: '45.16 km (5,111 sols)' },
        { label: 'Spirit Mountain Climb', value: '7.73 km (2,208 sols)' },
      ],
      whyItMatters:
        'Spirit and Opportunity proved that twin solar-powered field geologists could survive harsh Martian winters and uncover clear proof that Mars once had liquid water.',
    },
  },
  {
    id: 'ingenuity',
    planet: 'mars',
    name: 'Ingenuity',
    shortLabel: 'Ingenuity',
    missionName: 'Mars Helicopter "Ingenuity"',
    landingDate: 'February 18, 2021 (First Flight: April 19, 2021)',
    landingSite: 'Jezero Crater',
    coordinates: '18.38° N, 77.58° E',
    agency: 'NASA',
    // Meridiani Planum -> Ingenuity (~4,928 km)
    svgX: 438,
    svgY: 256,
    shortSummary:
      'The first aircraft to fly on another planet! Weighing just 1.8 kg, Ingenuity spun its twin blades 2,400 times a minute for 72 flights over Mars.',
    summary:
      'Everyone thought Mars’s air was too thin to fly—until Ingenuity spun its twin carbon-fiber blades 2,400 times a minute and lifted off! Built for 5 test flights, this tiny 1.8-kilogram helicopter soared 72 times over Jezero Crater.',
    lucyNote:
      'Flying on Mars is like flying a helicopter 3 times higher than Mount Everest! Ingenuity even carried a tiny scrap of fabric from the Wright brothers’ 1903 airplane.',
    broaderStory: {
      headline: 'The First Aircraft to Fly Through Another Planet’s Sky',
      lead: 'Mars has an atmosphere only 1% as thick as Earth’s. To lift off there, Ingenuity had to be feather-light, ultra-strong, and smart enough to pilot itself without anyone holding a joystick.',
      sections: [
        {
          title: 'How Do You Fly Where There Is Almost No Air?',
          body: 'Because radio signals take many minutes to travel between Earth and Mars, nobody on Earth could fly Ingenuity live. Instead, engineers packed an autonomous flight computer, a downward navigation camera, and two counter-rotating 1.2-meter carbon-fiber rotors spinning nearly ten times faster than an Earth helicopter’s blades.',
        },
        {
          title: 'From 5 Test Hops to 72 Aerial Adventures',
          body: 'Ingenuity rode to Mars tucked beneath the belly of the Perseverance rover. After its historic 39-second hover at Wright Brothers Field in April 2021, Ingenuity went on to scout cliffs, sand dunes, and rocky river deltas ahead of Perseverance—flying over 17 kilometers in total!',
        },
        {
          title: 'Resting at Valinor Hills',
          body: 'During its 72nd flight in January 2024, Ingenuity’s rotor blades were damaged on landing among featureless sand ripples. Today it sits upright at "Valinor Hills" in Jezero Crater—still capable of waking up with its top solar panel as a monument to the first Wright brothers moment on another world.',
        },
      ],
      engineeringFacts: [
        { label: 'First Powered Flight', value: 'April 19, 2021' },
        { label: 'Site Coordinates', value: '18.38° N, 77.58° E' },
        { label: 'Distance to Meridiani', value: '~4,928 km Northeast' },
        { label: 'Total Flights', value: '72 flights (17.0 km)' },
        { label: 'Earth Mass', value: '1.8 kg (0.68 kg on Mars)' },
      ],
      whyItMatters:
        'Ingenuity opened a brand-new dimension for planetary science: aerial exploration, proving future drones can fly across canyons, caves, and distant moons.',
    },
  },
];

export const PLANETS: Record<PlanetId, PlanetConfig> = {
  moon: {
    id: 'moon',
    title: 'The Moon',
    subtitle: 'Drag to orbit the 3D Moon, scroll or use Zoom controls, hover a spot to see its name, and tap to send Lucy!',
    distanceNote: 'Apollo 11 & Apollo 15 are shown at proportional lunar scale (~964 km apart across 3,475 km diameter).',
    gravityNote: '1/6 Earth Gravity',
    artifacts: MOON_ARTIFACTS,
  },
  mars: {
    id: 'mars',
    title: 'Mars',
    subtitle: 'Drag to orbit 3D Mars, scroll or use Zoom controls, hover a spot to see its name, and tap to send Lucy!',
    distanceNote: 'Viking 1 → Spirit & Opportunity (~2,822 km) → Ingenuity (~4,928 km) at proportional Martian scale.',
    gravityNote: '3/8 Earth Gravity',
    artifacts: MARS_ARTIFACTS,
  },
};

export function getArtifactById(planet: PlanetId, id: string): ArtifactInfo | undefined {
  const normalizedId = id === 'spirit' || id === 'opportunity' ? 'spirit-opportunity' : id;
  return PLANETS[planet]?.artifacts.find((a) => a.id === normalizedId);
}
