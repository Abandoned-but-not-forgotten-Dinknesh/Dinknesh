import type { QuizTrack } from '../data/quizQuestions';

export interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  userAnswerSummary: string;
  correctAnswerSummary: string;
}

export interface PersistedQuizState {
  activeTrack: QuizTrack;
  currentIndex: number;
  isFinished: boolean;
  answers: AnswerRecord[];
  bestAll: number;
  bestMoon: number;
  bestMars: number;
  completedRuns: number;
  stampedExhibitIds: string[];
}

export const DEFAULT_QUIZ_STATE: PersistedQuizState = {
  activeTrack: 'all',
  currentIndex: 0,
  isFinished: false,
  answers: [],
  bestAll: 0,
  bestMoon: 0,
  bestMars: 0,
  completedRuns: 0,
  stampedExhibitIds: [],
};

const LOCAL_STORAGE_KEY = 'dinqnesh_museum_quiz_v1';

function clampInt(val: unknown, min: number, max: number, fallback = min): number {
  const num = typeof val === 'number' && Number.isFinite(val) ? Math.trunc(val) : fallback;
  return Math.min(max, Math.max(min, num));
}

export function sanitizeQuizState(
  raw: Partial<PersistedQuizState> | null | undefined
): PersistedQuizState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_QUIZ_STATE };

  const activeTrack: QuizTrack =
    raw.activeTrack === 'moon' || raw.activeTrack === 'mars' ? raw.activeTrack : 'all';

  const answers: AnswerRecord[] = Array.isArray(raw.answers)
    ? raw.answers
        .slice(0, 20)
        .filter(
          (a): a is AnswerRecord =>
            Boolean(a) &&
            typeof a.questionId === 'string' &&
            a.questionId.length > 0 &&
            typeof a.isCorrect === 'boolean'
        )
        .map((a) => ({
          questionId: a.questionId.slice(0, 64),
          isCorrect: a.isCorrect,
          userAnswerSummary: String(a.userAnswerSummary ?? '').slice(0, 240),
          correctAnswerSummary: String(a.correctAnswerSummary ?? '').slice(0, 240),
        }))
    : [];

  const stampedExhibitIds = Array.isArray(raw.stampedExhibitIds)
    ? Array.from(
        new Set(
          raw.stampedExhibitIds
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
            .map((id) => id.slice(0, 64))
        )
      ).slice(0, 10)
    : [];

  return {
    activeTrack,
    currentIndex: clampInt(raw.currentIndex, 0, 20, 0),
    isFinished: Boolean(raw.isFinished),
    answers,
    bestAll: clampInt(raw.bestAll, 0, 10, 0),
    bestMoon: clampInt(raw.bestMoon, 0, 4, 0),
    bestMars: clampInt(raw.bestMars, 0, 6, 0),
    completedRuns: clampInt(raw.completedRuns, 0, 100000, 0),
    stampedExhibitIds,
  };
}

export function loadLocalQuizState(): PersistedQuizState {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_QUIZ_STATE };
    return sanitizeQuizState(JSON.parse(raw) as Partial<PersistedQuizState>);
  } catch {
    return { ...DEFAULT_QUIZ_STATE };
  }
}

export function saveLocalQuizState(state: PersistedQuizState): void {
  try {
    const clean = sanitizeQuizState(state);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota or private browsing errors cleanly
  }
}
