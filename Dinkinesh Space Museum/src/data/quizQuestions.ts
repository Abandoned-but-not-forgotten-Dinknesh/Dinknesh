import type { PlanetId } from './artifacts';

export type QuizQuestionType = 'choice' | 'exhibit-pick' | 'slider';
export type QuizTrack = 'all' | 'moon' | 'mars';

export interface QuizChoiceOption {
  id: string;
  label: string;
}

export interface QuizExhibitOption {
  artifactId: string;
  name: string;
  planetLabel: string;
}

export interface QuizQuestion {
  id: string;
  planet: PlanetId;
  relatedArtifactId: string;
  relatedArtifactName: string;
  type: QuizQuestionType;
  prompt: string;
  hint: string;
  explanation: string;
  lucyCorrect: string;
  lucyTryAgain: string;
  // For 'choice'
  options?: QuizChoiceOption[];
  correctOptionId?: string;
  // For 'exhibit-pick'
  exhibitOptions?: QuizExhibitOption[];
  correctArtifactId?: string;
  // For 'slider'
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
    initialValue: number;
    exactValue: number;
    exactDisplay: string;
    acceptedMin: number;
    acceptedMax: number;
  };
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-apollo11-stage',
    planet: 'moon',
    relatedArtifactId: 'apollo-11',
    relatedArtifactName: 'Apollo 11 Descent Stage',
    type: 'choice',
    prompt: 'Why did the Apollo 11 astronauts leave the golden Descent Stage behind on the Moon?',
    hint: 'Think about how heavy empty fuel tanks are when blasting off into space!',
    explanation:
      'Carrying empty landing tanks back into orbit would have wasted precious rocket fuel, so the Lunar Module split in two and used the Descent Stage as a launchpad.',
    lucyCorrect: 'Bullseye! Light spaceships save rocket fuel!',
    lucyTryAgain: 'Good guess! Leaving the heavy bottom half saved fuel for the trip home.',
    options: [
      { id: 'a', label: 'To save rocket fuel by using it as a launchpad' },
      { id: 'b', label: 'Because its solar panels got covered in lunar rain' },
      { id: 'c', label: 'So future rovers could drive it around Mare Tranquillitatis' },
      { id: 'd', label: 'Because it was too tall to fit back inside the crater' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'q-apollo11-lasers',
    planet: 'moon',
    relatedArtifactId: 'apollo-11',
    relatedArtifactName: 'Apollo 11 Descent Stage',
    type: 'choice',
    prompt: 'True or Myth: Scientists on Earth still bounce laser beams off a tray of 100 glass prisms left by Apollo 11!',
    hint: 'The museum story mentions measuring the distance to the Moon down to the width of a fingernail.',
    explanation:
      'Real space fact! Those 100 special corner-cube prisms bounce laser pulses straight back to Earth so scientists can measure the Moon’s distance with fingernail precision.',
    lucyCorrect: 'Yes! That laser mirror still works today!',
    lucyTryAgain: 'Surprise—it really is true! The 100 glass prisms are still reflecting lasers.',
    options: [
      { id: 'true', label: 'Real Space Fact — the laser prisms still work today' },
      { id: 'myth', label: 'Cosmic Myth — space dust broke them in 1969' },
    ],
    correctOptionId: 'true',
  },
  {
    id: 'q-apollo15-buggy',
    planet: 'moon',
    relatedArtifactId: 'apollo-15',
    relatedArtifactName: 'Apollo 15 Lunar Module',
    type: 'exhibit-pick',
    prompt: 'Which spacecraft packed a foldable electric Moon buggy inside like origami so astronauts could explore mountains and canyons?',
    hint: 'Its mission name was "Falcon," and it landed near Hadley Rille in 1971.',
    explanation:
      'Apollo 15 ("Falcon") tucked the 210 kg Lunar Roving Vehicle flat inside a side bay like a camp chair, then unfolded it to drive 27.9 km!',
    lucyCorrect: 'You spotted Falcon! Folding a car into a spaceship is pure genius!',
    lucyTryAgain: 'Look closely at the Moon buggy parked beside Apollo 15 Falcon!',
    exhibitOptions: [
      { artifactId: 'apollo-15', name: 'Apollo 15 Lunar Module', planetLabel: 'The Moon' },
      { artifactId: 'apollo-11', name: 'Apollo 11 Descent Stage', planetLabel: 'The Moon' },
      { artifactId: 'viking-1', name: 'Viking 1', planetLabel: 'Mars' },
      { artifactId: 'ingenuity', name: 'Ingenuity', planetLabel: 'Mars' },
    ],
    correctArtifactId: 'apollo-15',
  },
  {
    id: 'q-apollo15-genesis',
    planet: 'moon',
    relatedArtifactId: 'apollo-15',
    relatedArtifactName: 'Apollo 15 Lunar Module',
    type: 'choice',
    prompt: 'What famous ancient treasure over 4 billion years old did the Apollo 15 astronauts discover while driving their Moon buggy?',
    hint: 'Scientists wanted to learn how the Moon originally formed from a molten magma ocean.',
    explanation:
      'Near Hadley Rille, astronauts collected the white anorthosite "Genesis Rock," helping scientists uncover how the early Moon cooled from molten magma.',
    lucyCorrect: 'Rock star! The 4-billion-year-old Genesis Rock!',
    lucyTryAgain: 'Almost! They found the white "Genesis Rock" from the Moon’s fiery youth.',
    options: [
      { id: 'a', label: 'The Genesis Rock' },
      { id: 'b', label: 'Martian iron blueberries' },
      { id: 'c', label: 'A frozen ice comet core' },
      { id: 'd', label: 'A golden meteorite plaque' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'q-viking1-pick',
    planet: 'mars',
    relatedArtifactId: 'viking-1',
    relatedArtifactName: 'Viking 1',
    type: 'exhibit-pick',
    prompt: 'Which pioneer landed safely on Mars in 1976—exactly 7 years after Apollo 11—and sent back our first color surface photos and weather reports?',
    hint: 'It rests on three landing legs with a round dish antenna in Chryse Planitia ("Plains of Gold").',
    explanation:
      'Viking 1 became the first spacecraft to land safely on Mars on July 20, 1976, tracking Martian weather and storms for over six Earth years!',
    lucyCorrect: 'Spot on! Viking 1 sent us our first Mars sunset postcard!',
    lucyTryAgain: 'That pioneer was Viking 1, our very first long-term Mars weather station!',
    exhibitOptions: [
      { artifactId: 'viking-1', name: 'Viking 1', planetLabel: 'Mars' },
      { artifactId: 'spirit-opportunity', name: 'Spirit & Opportunity', planetLabel: 'Mars' },
      { artifactId: 'ingenuity', name: 'Ingenuity', planetLabel: 'Mars' },
      { artifactId: 'apollo-11', name: 'Apollo 11 Descent Stage', planetLabel: 'The Moon' },
    ],
    correctArtifactId: 'viking-1',
  },
  {
    id: 'q-viking1-landing',
    planet: 'mars',
    relatedArtifactId: 'viking-1',
    relatedArtifactName: 'Viking 1',
    type: 'choice',
    prompt: 'Unlike Moon landers, why did Viking 1 need a heat shield and a supersonic parachute before firing its landing engines?',
    hint: 'The Moon has zero air, while Mars has a thin pink sky.',
    explanation:
      'Mars has a thin atmosphere that creates fiery friction during entry—and just enough air for a supersonic parachute to help slow the lander down before rockets finish the job.',
    lucyCorrect: 'Smart thinking! Thin Martian air means heat shields + parachutes!',
    lucyTryAgain: 'Good try! Mars has a thin atmosphere, so spacecraft need a heat shield and parachute first.',
    options: [
      { id: 'a', label: 'Because Mars has a thin atmosphere that causes entry heat and slows parachutes' },
      { id: 'b', label: 'Because Mars has deep oceans that Viking 1 had to float on' },
      { id: 'c', label: 'Because Mars has stronger gravity than Jupiter' },
      { id: 'd', label: 'To keep the spacecraft warm during winter snowstorms' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'q-twins-wind',
    planet: 'mars',
    relatedArtifactId: 'spirit-opportunity',
    relatedArtifactName: 'Spirit & Opportunity',
    type: 'choice',
    prompt: 'Spirit and Opportunity were only built to work for 90 days! What lucky Martian event helped them keep exploring for years?',
    hint: 'Think about what happens when solar panels get dusty—and what blows across Mars!',
    explanation:
      'Lucky Martian winds repeatedly swept red dust off their solar panels, recharging their batteries and letting Opportunity explore for 14 years!',
    lucyCorrect: 'Whoa, yes! Martian winds acted like free solar-panel dusters!',
    lucyTryAgain: 'Not quite! Lucky Martian winds blew the dust right off their solar panels.',
    options: [
      { id: 'a', label: 'Martian winds swept dust off their solar panels' },
      { id: 'b', label: 'Astronauts flew up to swap their batteries' },
      { id: 'c', label: 'Ingenuity dropped spare panels from above' },
      { id: 'd', label: 'Heavy Martian rain washed their cameras clean' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'q-oppy-distance',
    planet: 'mars',
    relatedArtifactId: 'spirit-opportunity',
    relatedArtifactName: 'Spirit & Opportunity',
    type: 'slider',
    prompt: 'Slide the dial to guess: Opportunity set the off-world driving record on Mars! About how many kilometers did it drive?',
    hint: 'The museum calls it a "Martian marathon"—a bit over 42 kilometers!',
    explanation:
      'Opportunity rolled an incredible 45.16 kilometers across Meridiani Planum over 5,111 Martian sols, discovering tiny iron "blueberries" formed in ancient water.',
    lucyCorrect: 'Whoa, great estimate! Opportunity rolled 45.16 km!',
    lucyTryAgain: 'Close! Opportunity drove a record 45.16 km across Mars!',
    sliderConfig: {
      min: 5,
      max: 65,
      step: 1,
      unit: 'km',
      initialValue: 25,
      exactValue: 45,
      exactDisplay: '45.16 km',
      acceptedMin: 38,
      acceptedMax: 52,
    },
  },
  {
    id: 'q-ingenuity-wright',
    planet: 'mars',
    relatedArtifactId: 'ingenuity',
    relatedArtifactName: 'Ingenuity',
    type: 'exhibit-pick',
    prompt: 'Which feather-light 1.8 kg explorer carried a tiny scrap of fabric from the Wright brothers’ 1903 airplane and spun its blades 2,400 times a minute?',
    hint: 'It rode to Jezero Crater tucked under the Perseverance rover.',
    explanation:
      'Ingenuity became the first aircraft to fly on another planet! Because Mars’s air is only 1% as thick as Earth’s, its twin carbon-fiber blades spin nearly 10 times faster than an Earth helicopter.',
    lucyCorrect: 'Takeoff! Ingenuity conquered the ultra-thin Martian sky!',
    lucyTryAgain: 'Look for the little gold box with twin spinning blades—that’s Ingenuity!',
    exhibitOptions: [
      { artifactId: 'ingenuity', name: 'Ingenuity', planetLabel: 'Mars' },
      { artifactId: 'spirit-opportunity', name: 'Spirit & Opportunity', planetLabel: 'Mars' },
      { artifactId: 'viking-1', name: 'Viking 1', planetLabel: 'Mars' },
      { artifactId: 'apollo-15', name: 'Apollo 15 Lunar Module', planetLabel: 'The Moon' },
    ],
    correctArtifactId: 'ingenuity',
  },
  {
    id: 'q-ingenuity-flights',
    planet: 'mars',
    relatedArtifactId: 'ingenuity',
    relatedArtifactName: 'Ingenuity',
    type: 'slider',
    prompt: 'Ingenuity was originally built for just 5 test flights. Slide to guess how many total flights it actually completed!',
    hint: 'It flew more than 10 times as many flights as originally planned!',
    explanation:
      'Built for 5 test hops, Ingenuity completed 72 aerial flights across Jezero Crater—scouting 17 kilometers ahead of the Perseverance rover!',
    lucyCorrect: 'Amazing guess! 72 flights instead of just 5!',
    lucyTryAgain: 'Can you believe it? Ingenuity flew 72 times—14 times its original goal!',
    sliderConfig: {
      min: 5,
      max: 95,
      step: 1,
      unit: 'flights',
      initialValue: 30,
      exactValue: 72,
      exactDisplay: '72 flights',
      acceptedMin: 62,
      acceptedMax: 82,
    },
  },
];

export function getQuestionsForTrack(track: QuizTrack): QuizQuestion[] {
  if (track === 'moon') return QUIZ_QUESTIONS.filter((q) => q.planet === 'moon');
  if (track === 'mars') return QUIZ_QUESTIONS.filter((q) => q.planet === 'mars');
  return QUIZ_QUESTIONS;
}
