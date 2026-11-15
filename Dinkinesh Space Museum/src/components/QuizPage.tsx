import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  HelpCircle,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { MARS_ARTIFACTS, MOON_ARTIFACTS } from '../data/artifacts';
import {
  getQuestionsForTrack,
  type QuizQuestion,
  type QuizTrack,
} from '../data/quizQuestions';
import {
  loadLocalQuizState,
  saveLocalQuizState,
  type AnswerRecord,
  type PersistedQuizState,
} from '../lib/quizPersistence';
import { ArtifactIllustration } from './ArtifactIllustration';
import { LucyAvatar } from './LucyAvatar';
import type { RouteView } from './TopBar';

interface QuizPageProps {
  onNavigate: (route: RouteView) => void;
}

const ALL_EXHIBITS = [...MOON_ARTIFACTS, ...MARS_ARTIFACTS];

function getCorrectSummary(question: QuizQuestion): string {
  if (question.type === 'choice' && question.options) {
    return question.options.find((o) => o.id === question.correctOptionId)?.label ?? '';
  }
  if (question.type === 'exhibit-pick' && question.exhibitOptions) {
    return (
      question.exhibitOptions.find((e) => e.artifactId === question.correctArtifactId)?.name ?? ''
    );
  }
  if (question.type === 'slider' && question.sliderConfig) {
    return question.sliderConfig.exactDisplay;
  }
  return '';
}

function getRankInfo(correct: number, total: number): { title: string; message: string } {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.85) {
    return {
      title: 'Chief Space Scientist',
      message: 'You remembered almost every spacecraft secret on both worlds!',
    };
  }
  if (ratio >= 0.6) {
    return {
      title: 'Space Detective',
      message: 'Great exploring! You spotted how these inventions survived space.',
    };
  }
  return {
    title: 'Junior Moon & Mars Explorer',
    message: 'Awesome start! Visit any exhibit below to uncover more hidden clues.',
  };
}

function getBestForTrack(state: PersistedQuizState, track: QuizTrack): number {
  if (track === 'moon') return state.bestMoon;
  if (track === 'mars') return state.bestMars;
  return state.bestAll;
}

function withUpdatedBest(
  state: PersistedQuizState,
  track: QuizTrack,
  score: number
): PersistedQuizState {
  if (track === 'moon') {
    return { ...state, bestMoon: Math.max(state.bestMoon, score) };
  }
  if (track === 'mars') {
    return { ...state, bestMars: Math.max(state.bestMars, score) };
  }
  return { ...state, bestAll: Math.max(state.bestAll, score) };
}

export const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const [quizState, setQuizState] = useState<PersistedQuizState>(() => loadLocalQuizState());
  const [showHint, setShowHint] = useState(false);

  const questions = useMemo(
    () => getQuestionsForTrack(quizState.activeTrack),
    [quizState.activeTrack]
  );

  const safeIndex = Math.min(quizState.currentIndex, Math.max(0, questions.length - 1));
  const currentQuestion = questions[safeIndex];
  const submittedRecord: AnswerRecord | null = quizState.answers[safeIndex] ?? null;

  const [sliderValue, setSliderValue] = useState<number>(() => {
    const initialState = loadLocalQuizState();
    const initialTrackQuestions = getQuestionsForTrack(initialState.activeTrack);
    const idx = Math.min(initialState.currentIndex, Math.max(0, initialTrackQuestions.length - 1));
    return initialTrackQuestions[idx]?.sliderConfig?.initialValue ?? 25;
  });

  useEffect(() => {
    if (!currentQuestion?.sliderConfig) return;
    const saved = quizState.answers[safeIndex];
    if (saved) {
      const parsed = parseInt(saved.userAnswerSummary, 10);
      if (Number.isFinite(parsed)) {
        setSliderValue(parsed);
        return;
      }
    }
    setSliderValue(currentQuestion.sliderConfig.initialValue);
  }, [currentQuestion, safeIndex, quizState.answers]);

  const persistState = useCallback(
    (updater: (prev: PersistedQuizState) => PersistedQuizState) => {
      setQuizState((prev) => {
        const next = updater(prev);
        saveLocalQuizState(next);
        return next;
      });
    },
    []
  );

  const handleTrackChange = (nextTrack: QuizTrack) => {
    if (nextTrack === quizState.activeTrack) return;
    const nextQuestions = getQuestionsForTrack(nextTrack);
    setShowHint(false);
    setSliderValue(nextQuestions[0]?.sliderConfig?.initialValue ?? 25);
    persistState((prev) => ({
      ...prev,
      activeTrack: nextTrack,
      currentIndex: 0,
      answers: [],
      isFinished: false,
    }));
  };

  // Retake option preserved: resets current attempt while keeping persistent best scores & stamps
  const handleRestart = () => {
    setShowHint(false);
    setSliderValue(questions[0]?.sliderConfig?.initialValue ?? 25);
    persistState((prev) => ({
      ...prev,
      currentIndex: 0,
      answers: [],
      isFinished: false,
    }));
  };

  const recordAnswer = (record: AnswerRecord) => {
    if (submittedRecord || !currentQuestion) return;
    persistState((prev) => {
      const nextAnswers = [...prev.answers];
      nextAnswers[safeIndex] = record;

      const nextScore = nextAnswers.filter((a) => a.isCorrect).length;
      const nextStamps = record.isCorrect
        ? Array.from(new Set([...prev.stampedExhibitIds, currentQuestion.relatedArtifactId])).slice(
            0,
            10
          )
        : prev.stampedExhibitIds;

      return withUpdatedBest(
        {
          ...prev,
          answers: nextAnswers,
          stampedExhibitIds: nextStamps,
        },
        prev.activeTrack,
        nextScore
      );
    });
  };

  const handleChoiceSelect = (optionId: string, optionLabel: string) => {
    if (submittedRecord || !currentQuestion) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    recordAnswer({
      questionId: currentQuestion.id,
      isCorrect,
      userAnswerSummary: optionLabel,
      correctAnswerSummary: getCorrectSummary(currentQuestion),
    });
  };

  const handleExhibitPick = (artifactId: string, name: string) => {
    if (submittedRecord || !currentQuestion) return;
    const isCorrect = artifactId === currentQuestion.correctArtifactId;
    recordAnswer({
      questionId: currentQuestion.id,
      isCorrect,
      userAnswerSummary: name,
      correctAnswerSummary: getCorrectSummary(currentQuestion),
    });
  };

  const handleSliderSubmit = () => {
    if (submittedRecord || !currentQuestion?.sliderConfig) return;
    const cfg = currentQuestion.sliderConfig;
    const isCorrect = sliderValue >= cfg.acceptedMin && sliderValue <= cfg.acceptedMax;
    recordAnswer({
      questionId: currentQuestion.id,
      isCorrect,
      userAnswerSummary: `${sliderValue} ${cfg.unit}`,
      correctAnswerSummary: cfg.exactDisplay,
    });
  };

  const handleNext = () => {
    setShowHint(false);
    if (safeIndex + 1 >= questions.length) {
      persistState((prev) => {
        const finalScore = prev.answers.filter((a) => a.isCorrect).length;
        return withUpdatedBest(
          {
            ...prev,
            isFinished: true,
            completedRuns: prev.completedRuns + 1,
          },
          prev.activeTrack,
          finalScore
        );
      });
      return;
    }

    const nextIdx = safeIndex + 1;
    setSliderValue(questions[nextIdx]?.sliderConfig?.initialValue ?? 25);
    persistState((prev) => ({
      ...prev,
      currentIndex: nextIdx,
    }));
  };

  const correctCount = quizState.answers.filter((a) => a.isCorrect).length;
  const bestForCurrentTrack = getBestForTrack(quizState, quizState.activeTrack);
  const stampedSet = useMemo(
    () => new Set(quizState.stampedExhibitIds),
    [quizState.stampedExhibitIds]
  );

  const lucySpeech = (() => {
    if (quizState.isFinished) {
      return correctCount >= Math.ceil(questions.length * 0.7)
        ? 'Woohoo! Space Detective!'
        : 'Great mission, explorer!';
    }
    if (submittedRecord && currentQuestion) {
      return submittedRecord.isCorrect
        ? currentQuestion.lucyCorrect
        : currentQuestion.lucyTryAgain;
    }
    if (showHint) {
      return 'Psst—read my clue below!';
    }
    return 'You’ve got this!';
  })();

  const trackTabClass = (active: boolean) =>
    `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
      active
        ? 'bg-[#FACC15] text-[#0E1538] shadow-[0_2px_0_#070B1E]'
        : 'text-slate-200 hover:text-white hover:bg-white/10'
    }`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0C1232] via-[#131C48] to-[#192356] text-white py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header & Track Selector */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/15 pb-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-sky-200/90 mb-2">
              ድንቅነሽ Space Museum Challenge · Interactive Space Quiz
            </p>
            <h1
              className="font-display font-bold text-white leading-[1.14]"
              style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.85rem)', textWrap: 'balance' }}
            >
              Lucy’s Space Detective Quiz
            </h1>
            <p className="font-editorial italic text-base sm:text-lg text-slate-200 mt-2">
              Test what you discovered on The Moon and Mars across multiple-choice, picture match, and dial-guess rounds.
            </p>
          </div>

          {/* Interactive Track Filter */}
          <div
            className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-[#0B102B] border-2 border-white/15 self-start lg:self-auto"
            role="group"
            aria-label="Choose quiz world"
          >
            <button
              type="button"
              onClick={() => handleTrackChange('all')}
              className={trackTabClass(quizState.activeTrack === 'all')}
            >
              All Exhibits (10)
            </button>
            <button
              type="button"
              onClick={() => handleTrackChange('moon')}
              className={trackTabClass(quizState.activeTrack === 'moon')}
            >
              The Moon (4)
            </button>
            <button
              type="button"
              onClick={() => handleTrackChange('mars')}
              className={trackTabClass(quizState.activeTrack === 'mars')}
            >
              Mars (6)
            </button>
          </div>
        </header>

        {!quizState.isFinished && currentQuestion ? (
          <>
            {/* Progress & Persistent Score Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-200">
                <span className="font-mono-tabular text-[#FACC15]">
                  Question {safeIndex + 1} of {questions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  Score: {correctCount} / {quizState.answers.length}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#6EE7B7]">
                  Best: {bestForCurrentTrack} / {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5" aria-label="Question progress">
                {questions.map((q, idx) => {
                  const ans = quizState.answers[idx];
                  const isCurrent = idx === safeIndex;
                  let barColor = 'bg-white/15 border-white/20';
                  if (ans?.isCorrect) {
                    barColor = 'bg-[#34D399] border-[#059669]';
                  } else if (ans && !ans.isCorrect) {
                    barColor = 'bg-[#FB923C] border-[#EA580C]';
                  } else if (isCurrent) {
                    barColor = 'bg-[#FACC15] border-[#FACC15]';
                  }
                  return (
                    <span
                      key={q.id}
                      className={`h-2.5 rounded-full border transition-all ${barColor} ${
                        isCurrent ? 'w-8' : 'w-4'
                      }`}
                      title={`Question ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Two-Zone Interactive Sandbox Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left / Main Interactive Question Stage */}
              <section
                aria-live="polite"
                className="lg:col-span-8 rounded-3xl bg-[#172052]/95 border-[2.5px] border-[#38BDF8]/55 shadow-[0_8px_0_#070B1E] p-6 sm:p-8"
              >
                <h2
                  className="font-display text-xl sm:text-2xl font-bold text-white leading-snug mb-6"
                  style={{ textWrap: 'balance' }}
                >
                  {currentQuestion.prompt}
                </h2>

                {/* TYPE A: Multiple Choice / Fact vs Myth */}
                {currentQuestion.type === 'choice' && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3.5">
                    {currentQuestion.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const hasAnswered = submittedRecord !== null;
                      const isSelected = submittedRecord?.userAnswerSummary === option.label;
                      const isCorrectOption = option.id === currentQuestion.correctOptionId;

                      let cardStyle =
                        'bg-[#0E1538] border-white/20 hover:border-[#38BDF8] hover:bg-[#131C48] text-white';
                      if (hasAnswered) {
                        if (isCorrectOption) {
                          cardStyle = 'bg-[#064E3B]/80 border-[#34D399] text-white';
                        } else if (isSelected && !isCorrectOption) {
                          cardStyle = 'bg-[#7C2D12]/75 border-[#FB923C] text-white';
                        } else {
                          cardStyle = 'bg-[#0E1538]/60 border-white/10 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handleChoiceSelect(option.id, option.label)}
                          className={`w-full min-h-[56px] text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] ${cardStyle} ${
                            hasAnswered ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="font-mono-tabular text-xs font-bold w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              {letter}
                            </span>
                            <span className="text-sm sm:text-base font-medium leading-snug">
                              {option.label}
                            </span>
                          </div>

                          {hasAnswered && isCorrectOption && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6EE7B7] shrink-0">
                              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                              <span>Correct</span>
                            </span>
                          )}
                          {hasAnswered && isSelected && !isCorrectOption && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FDBA74] shrink-0">
                              <Lightbulb className="w-5 h-5" aria-hidden="true" />
                              <span>Your Pick</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TYPE B: Visual Spacecraft Picture Match */}
                {currentQuestion.type === 'exhibit-pick' && currentQuestion.exhibitOptions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.exhibitOptions.map((item) => {
                      const hasAnswered = submittedRecord !== null;
                      const isSelected = submittedRecord?.userAnswerSummary === item.name;
                      const isCorrectOption = item.artifactId === currentQuestion.correctArtifactId;

                      let borderStyle =
                        'bg-[#0E1538] border-white/20 hover:border-[#38BDF8] hover:-translate-y-0.5';
                      if (hasAnswered) {
                        if (isCorrectOption) {
                          borderStyle = 'bg-[#064E3B]/75 border-[#34D399]';
                        } else if (isSelected && !isCorrectOption) {
                          borderStyle = 'bg-[#7C2D12]/75 border-[#FB923C]';
                        } else {
                          borderStyle = 'bg-[#0E1538]/60 border-white/10 opacity-70';
                        }
                      }

                      return (
                        <button
                          key={item.artifactId}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handleExhibitPick(item.artifactId, item.name)}
                          className={`rounded-2xl border-2 overflow-hidden text-left transition-all flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] ${borderStyle} ${
                            hasAnswered ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="bg-[#090D24] border-b border-white/10 p-2">
                            <ArtifactIllustration
                              artifactId={item.artifactId}
                              variant="vector"
                              className="w-full h-32 object-contain block"
                            />
                          </div>
                          <div className="px-4 py-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs text-sky-200/80 font-medium">
                                {item.planetLabel}
                              </p>
                              <p className="font-display text-base font-bold text-white">
                                {item.name}
                              </p>
                            </div>
                            {hasAnswered && isCorrectOption && (
                              <CheckCircle2
                                className="w-5 h-5 text-[#6EE7B7] shrink-0"
                                aria-label="Correct spacecraft"
                              />
                            )}
                            {hasAnswered && isSelected && !isCorrectOption && (
                              <Lightbulb
                                className="w-5 h-5 text-[#FDBA74] shrink-0"
                                aria-label="Your guess"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TYPE C: Interactive Engineer's Dial Slider */}
                {currentQuestion.type === 'slider' && currentQuestion.sliderConfig && (
                  <div className="rounded-2xl bg-[#0E1538] border-2 border-white/15 p-5 sm:p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-sky-200/85">
                          Your Estimate
                        </p>
                        <p className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#FACC15] mt-1">
                          {sliderValue}{' '}
                          <span className="text-lg font-medium text-slate-200">
                            {currentQuestion.sliderConfig.unit}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            submittedRecord !== null ||
                            sliderValue <= currentQuestion.sliderConfig.min
                          }
                          onClick={() =>
                            setSliderValue((v) =>
                              Math.max(
                                currentQuestion.sliderConfig!.min,
                                v - currentQuestion.sliderConfig!.step
                              )
                            )
                          }
                          aria-label="Decrease guess"
                          className="w-11 h-11 rounded-xl bg-[#172052] hover:bg-[#1E2B6B] disabled:opacity-40 border border-white/20 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Minus className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            submittedRecord !== null ||
                            sliderValue >= currentQuestion.sliderConfig.max
                          }
                          onClick={() =>
                            setSliderValue((v) =>
                              Math.min(
                                currentQuestion.sliderConfig!.max,
                                v + currentQuestion.sliderConfig!.step
                              )
                            )
                          }
                          aria-label="Increase guess"
                          className="w-11 h-11 rounded-xl bg-[#172052] hover:bg-[#1E2B6B] disabled:opacity-40 border border-white/20 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Plus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quiz-dial-slider" className="sr-only">
                        Estimate value in {currentQuestion.sliderConfig.unit}
                      </label>
                      <input
                        id="quiz-dial-slider"
                        type="range"
                        min={currentQuestion.sliderConfig.min}
                        max={currentQuestion.sliderConfig.max}
                        step={currentQuestion.sliderConfig.step}
                        value={sliderValue}
                        disabled={submittedRecord !== null}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full h-3 rounded-lg appearance-none bg-[#172052] accent-[#FACC15] cursor-pointer disabled:cursor-default"
                      />
                      <div className="flex justify-between text-xs font-mono-tabular text-slate-300 mt-2">
                        <span>
                          {currentQuestion.sliderConfig.min} {currentQuestion.sliderConfig.unit}
                        </span>
                        <span>
                          {Math.round(
                            (currentQuestion.sliderConfig.min +
                              currentQuestion.sliderConfig.max) /
                              2
                          )}{' '}
                          {currentQuestion.sliderConfig.unit}
                        </span>
                        <span>
                          {currentQuestion.sliderConfig.max} {currentQuestion.sliderConfig.unit}
                        </span>
                      </div>
                    </div>

                    {!submittedRecord ? (
                      <button
                        type="button"
                        onClick={handleSliderSubmit}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6B4A] hover:bg-[#EA580C] text-white font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Check My Guess
                      </button>
                    ) : (
                      <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-sm">
                        <div>
                          <span className="text-slate-300">Actual Museum Record: </span>
                          <span className="font-mono-tabular font-bold text-[#6EE7B7]">
                            {currentQuestion.sliderConfig.exactDisplay}
                          </span>
                        </div>
                        <span className="text-xs text-slate-300 font-mono-tabular">
                          Accepted range: {currentQuestion.sliderConfig.acceptedMin}–
                          {currentQuestion.sliderConfig.acceptedMax}{' '}
                          {currentQuestion.sliderConfig.unit}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Post-Answer Museum Fact Reveal */}
                {submittedRecord && (
                  <div
                    className={`mt-6 rounded-2xl border-2 p-5 ${
                      submittedRecord.isCorrect
                        ? 'bg-[#064E3B]/50 border-[#34D399]'
                        : 'bg-[#1E293B]/80 border-[#FACC15]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {submittedRecord.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[#6EE7B7]" aria-hidden="true" />
                          <h3 className="font-display text-lg font-bold text-[#6EE7B7]">
                            Spot on!
                          </h3>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-5 h-5 text-[#FACC15]" aria-hidden="true" />
                          <h3 className="font-display text-lg font-bold text-[#FACC15]">
                            Good try — here is the museum clue!
                          </h3>
                        </>
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate({
                            page: 'artifact',
                            planet: currentQuestion.planet,
                            artifactId: currentQuestion.relatedArtifactId,
                          })
                        }
                        className="text-xs sm:text-sm font-semibold text-[#38BDF8] hover:text-[#7DD3FC] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Compass className="w-4 h-4" aria-hidden="true" />
                        <span>Read about {currentQuestion.relatedArtifactName}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>
                          {safeIndex + 1 >= questions.length
                            ? 'See My Passport'
                            : 'Next Question'}
                        </span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Right Guide Rail: Lucy & Optional Clue */}
              <aside className="lg:col-span-4 space-y-5">
                <div className="rounded-3xl bg-[#172052] border-[3px] border-[#FACC15]/85 shadow-[0_6px_0_#070B1E] p-5 flex flex-col items-center text-center">
                  <LucyAvatar
                    mode={submittedRecord?.isCorrect ? 'waving' : 'idle'}
                    size={112}
                    showSpeechBubble={true}
                    speechText={lucySpeech}
                  />
                  <p className="text-xs font-semibold text-sky-200/85 mt-3">
                    Mission Guide · Lucy
                  </p>
                </div>

                {!submittedRecord && (
                  <div className="rounded-3xl bg-[#172052]/90 border-2 border-white/15 p-5 shadow-[0_6px_0_#070B1E]">
                    <button
                      type="button"
                      onClick={() => setShowHint((h) => !h)}
                      className="w-full inline-flex items-center justify-between gap-2 text-sm font-semibold text-[#FACC15] hover:text-[#FDE047] cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" aria-hidden="true" />
                        <span>{showHint ? 'Hide Lucy’s Hint' : 'Need a Hint?'}</span>
                      </span>
                      <span className="text-xs text-slate-300">
                        {showHint ? 'Open' : 'Tap'}
                      </span>
                    </button>

                    {showHint && (
                      <p className="mt-3 pt-3 border-t border-white/15 text-sm text-slate-200 leading-relaxed">
                        {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                )}
              </aside>
            </div>
          </>
        ) : (
          /* Explorer Passport Completion Screen */
          <section className="space-y-8">
            <div className="rounded-3xl bg-[#172052]/95 border-[2.5px] border-[#FACC15]/80 shadow-[0_8px_0_#070B1E] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <LucyAvatar
                  mode="waving"
                  size={136}
                  showSpeechBubble={true}
                  speechText={lucySpeech}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <p className="text-xs font-semibold text-[#FACC15] mb-1">
                  Explorer Passport Complete ·{' '}
                  <span className="font-mono-tabular">
                    {correctCount} / {questions.length} Correct
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono-tabular text-[#6EE7B7]">
                    Best: {bestForCurrentTrack} / {questions.length}
                  </span>
                  {quizState.completedRuns > 0 && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono-tabular text-sky-200">
                        Missions Completed: {quizState.completedRuns}
                      </span>
                    </>
                  )}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {getRankInfo(correctCount, questions.length).title}
                </h2>
                <p className="text-base text-slate-200 mt-2 max-w-xl">
                  {getRankInfo(correctCount, questions.length).message}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#EA580C] text-white font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Play Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate({ page: 'exhibits' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Browse All Exhibits</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mission Stamps Earned */}
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Your Museum Passport Stamps
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {ALL_EXHIBITS.map((exhibit) => {
                  const earned = stampedSet.has(exhibit.id);
                  const inCurrentTrack =
                    quizState.activeTrack === 'all' ||
                    exhibit.planet === quizState.activeTrack;
                  return (
                    <button
                      key={exhibit.id}
                      type="button"
                      onClick={() =>
                        onNavigate({
                          page: 'artifact',
                          planet: exhibit.planet,
                          artifactId: exhibit.id,
                        })
                      }
                      className={`rounded-2xl p-4 border-2 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer hover:-translate-y-0.5 ${
                        earned
                          ? 'bg-[#064E3B]/45 border-[#34D399]'
                          : 'bg-[#172052]/80 border-white/15 hover:border-[#38BDF8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-sky-200/80">
                          {exhibit.planet === 'moon' ? 'The Moon' : 'Mars'}
                        </span>
                        {earned ? (
                          <Award className="w-5 h-5 text-[#FACC15]" aria-label="Stamp earned" />
                        ) : (
                          <Compass className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-white leading-snug">
                          {exhibit.shortLabel}
                        </p>
                        <p className="text-xs mt-1 text-slate-300">
                          {earned
                            ? 'Stamped!'
                            : inCurrentTrack
                              ? 'Tap to review story'
                              : 'Switch to All Exhibits'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clean Hairline Question Review */}
            <div className="rounded-3xl bg-[#172052]/90 border-2 border-white/15 p-6">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Question Review
              </h3>
              <ul className="divide-y divide-white/10">
                {questions.map((q, idx) => {
                  const record = quizState.answers[idx];
                  return (
                    <li
                      key={q.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {record?.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-[#6EE7B7]">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              <span>Correct</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#FDBA74]">
                              <Lightbulb className="w-4 h-4" aria-hidden="true" />
                              <span>Reviewed</span>
                            </span>
                          )}
                          <span className="text-slate-400" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-sky-200/85">{q.relatedArtifactName}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{q.prompt}</p>
                        <p className="text-xs text-slate-300">
                          Answer:{' '}
                          <span className="text-white font-medium">
                            {record?.correctAnswerSummary ?? getCorrectSummary(q)}
                          </span>
                          {record && !record.isCorrect && (
                            <> · Your pick: {record.userAnswerSummary}</>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onNavigate({
                            page: 'artifact',
                            planet: q.planet,
                            artifactId: q.relatedArtifactId,
                          })
                        }
                        className="text-xs font-semibold text-[#38BDF8] hover:text-[#7DD3FC] whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
                      >
                        Visit Exhibit →
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
