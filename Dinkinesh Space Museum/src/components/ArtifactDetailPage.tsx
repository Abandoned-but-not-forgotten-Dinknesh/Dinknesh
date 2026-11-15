import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PLANETS, getArtifactById, type PlanetId } from '../data/artifacts';
import { ArtifactIllustration } from './ArtifactIllustration';
import { LucyAvatar } from './LucyAvatar';
import type { RouteView } from './TopBar';

interface ArtifactDetailPageProps {
  planet: PlanetId;
  artifactId: string;
  onNavigate: (route: RouteView) => void;
}

export const ArtifactDetailPage: React.FC<ArtifactDetailPageProps> = ({
  planet,
  artifactId,
  onNavigate,
}) => {
  const artifact = getArtifactById(planet, artifactId) ?? PLANETS[planet].artifacts[0];
  const siblings = PLANETS[planet].artifacts;
  const currentIndex = siblings.findIndex((a) => a.id === artifact.id);
  const nextArtifact = siblings[(currentIndex + 1) % siblings.length];
  const isMoon = planet === 'moon';

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] text-white transition-colors ${
        isMoon
          ? 'bg-gradient-to-b from-[#0C1232] via-[#131C48] to-[#192356]'
          : 'bg-gradient-to-b from-[#170F29] via-[#28163A] to-[#3B1D36]'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'planet', planet })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#38BDF8] hover:text-[#FACC15] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to {isMoon ? 'The Moon' : 'Mars'} Surface</span>
          </button>

          <div className="text-xs font-medium text-slate-300 flex flex-wrap items-center gap-2">
            <span>ድንቅነሽ Space Museum Archive</span>
            <span aria-hidden="true">·</span>
            <span>{isMoon ? 'Lunar Wing' : 'Martian Wing'}</span>
            <span aria-hidden="true">·</span>
            <span>{artifact.missionName}</span>
          </div>
        </div>

        {/* Hero Exhibition Marquee */}
        <header className="border-b border-white/15 pb-8 mb-10">
          <h1
            className="font-display font-bold text-white leading-[1.12] tracking-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', textWrap: 'balance' }}
          >
            {artifact.name}
          </h1>
          <p className="font-editorial italic text-xl sm:text-2xl text-slate-200 mt-3 max-w-3xl">
            {artifact.broaderStory.headline}
          </p>
        </header>

        {/* Two-Column Editorial & Museum Accession Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Narrative Column (70%) */}
          <article className="lg:col-span-8 space-y-8">
            {/* Framed Artifact Remnants Viewer */}
            <figure className="rounded-3xl overflow-hidden border-[3px] border-[#38BDF8]/55 shadow-[0_8px_0_#070B1E] bg-[#090D24]">
              <ArtifactIllustration
                artifactId={artifact.id}
                variant="photo"
                className="w-full aspect-[4/3] max-h-[420px] object-cover block"
              />
              <figcaption className="bg-[#0B102B] px-5 py-3 text-xs font-editorial italic text-slate-300 border-t border-white/15">
                Fig. 1 — Archival view of {artifact.name} at {artifact.landingSite} ({artifact.coordinates}).
              </figcaption>
            </figure>

            {/* Lead Paragraph with Editorial Drop Cap */}
            <p className="text-lg text-slate-100 leading-relaxed font-medium max-w-prose first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#FACC15]">
              {artifact.broaderStory.lead}
            </p>

            {/* Detailed Story Sections */}
            <div className="space-y-8 pt-2">
              {artifact.broaderStory.sections.map((section, index) => (
                <section key={section.title} className="border-t border-white/15 pt-6">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-3">
                    0{index + 1}. {section.title}
                  </h2>
                  <p className="text-base text-slate-200 leading-relaxed max-w-prose">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {/* Why It Changed History Callout */}
            <section className="rounded-3xl bg-[#172052]/90 border-2 border-[#38BDF8]/55 p-6 shadow-[0_6px_0_#070B1E]">
              <h2 className="font-display text-lg font-bold text-[#FACC15] mb-2">
                Why This Invention Matters
              </h2>
              <p className="text-base text-slate-100 leading-relaxed">
                {artifact.broaderStory.whyItMatters}
              </p>
            </section>
          </article>

          {/* Right Curatorial Margin Rail (30%) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Lucy's Guide Corner */}
            <div className="rounded-3xl bg-[#172052] border-[3px] border-[#FACC15]/85 shadow-[0_6px_0_#070B1E] p-5 flex flex-col items-center text-center">
              <LucyAvatar mode="idle" size={100} showSpeechBubble={false} />
              <h3 className="font-display text-lg font-bold text-[#FACC15] mt-2">
                Lucy’s Museum Note
              </h3>
              <p className="text-sm text-slate-100 mt-2 leading-relaxed">
                {artifact.lucyNote}
              </p>
            </div>

            {/* Accession Specifications Table */}
            <div className="rounded-3xl bg-[#172052]/90 border-2 border-white/15 p-5 shadow-[0_6px_0_#070B1E]">
              <h3 className="font-display text-lg font-bold text-white mb-4">
                Exhibition Facts
              </h3>
              <dl className="divide-y divide-white/10 text-sm">
                {artifact.broaderStory.engineeringFacts.map((fact) => (
                  <div key={fact.label} className="py-2.5 flex flex-col gap-0.5">
                    <dt className="text-xs font-semibold text-sky-200/80">{fact.label}</dt>
                    <dd className="font-mono-tabular font-medium text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Next Exhibit Link */}
            {nextArtifact && nextArtifact.id !== artifact.id && (
              <div className="rounded-3xl bg-[#172052]/90 border-2 border-[#38BDF8]/55 p-5 shadow-[0_6px_0_#070B1E]">
                <p className="text-xs font-semibold text-sky-200/80">
                  Next on {isMoon ? 'The Moon' : 'Mars'}
                </p>
                <p className="font-display text-lg font-bold text-white mt-1">
                  {nextArtifact.name}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({
                      page: 'artifact',
                      planet,
                      artifactId: nextArtifact.id,
                    })
                  }
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] transition-all cursor-pointer"
                >
                  <span>Visit {nextArtifact.shortLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Quiz Link */}
            <div className="rounded-3xl bg-[#172052]/90 border-2 border-[#FACC15]/60 p-5 shadow-[0_6px_0_#070B1E]">
              <p className="text-xs font-semibold text-[#FACC15]">
                Finished reading?
              </p>
              <p className="font-display text-lg font-bold text-white mt-1">
                Try Lucy’s Space Quiz
              </p>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'quiz' })}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] transition-all cursor-pointer"
              >
                <span>Test Your Knowledge</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
