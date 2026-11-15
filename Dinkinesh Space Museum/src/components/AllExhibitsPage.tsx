import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MOON_ARTIFACTS, MARS_ARTIFACTS, type PlanetId } from '../data/artifacts';
import { ArtifactIllustration } from './ArtifactIllustration';
import type { RouteView } from './TopBar';

interface AllExhibitsPageProps {
  onNavigate: (route: RouteView) => void;
  onLaunchPlanet: (planet: PlanetId) => void;
}

export const AllExhibitsPage: React.FC<AllExhibitsPageProps> = ({
  onNavigate,
  onLaunchPlanet,
}) => {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0C1232] via-[#131C48] to-[#192356] text-white py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold text-sky-200/90 mb-2">
            ድንቅነሽ Space Museum Collection · 5 Historic Spacecraft Exhibits
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            All Moon & Mars Exhibits
          </h1>
          <p className="font-editorial italic text-lg text-slate-200 mt-2">
            Explore every invention preserved on the Moon and Mars, or launch straight to a world with Lucy.
          </p>
        </header>

        {/* Moon Wing */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-3 mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              Lunar Gallery (The Moon)
            </h2>
            <button
              type="button"
              onClick={() => onLaunchPlanet('moon')}
              className="text-sm font-semibold text-[#38BDF8] hover:text-[#7DD3FC] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Launch with Lucy to The Moon</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOON_ARTIFACTS.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-[#172052]/95 border-[2.5px] border-[#38BDF8]/55 shadow-[0_8px_0_#070B1E] overflow-hidden flex flex-col"
              >
                <div className="bg-[#090D24] overflow-hidden border-b border-white/15">
                  <ArtifactIllustration
                    artifactId={item.id}
                    variant="photo"
                    className="w-full h-52 object-cover block"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-sky-200/80 flex flex-wrap items-center gap-2">
                      <span>{item.missionName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.landingDate}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mt-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-200 mt-2 leading-relaxed">{item.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({ page: 'artifact', planet: 'moon', artifactId: item.id })
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mars Wing */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-3 mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              Martian Gallery (Mars)
            </h2>
            <button
              type="button"
              onClick={() => onLaunchPlanet('mars')}
              className="text-sm font-semibold text-[#FF8A65] hover:text-[#FFA280] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Launch with Lucy to Mars</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MARS_ARTIFACTS.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-[#172052]/95 border-[2.5px] border-[#FF6B4A]/55 shadow-[0_8px_0_#070B1E] overflow-hidden flex flex-col"
              >
                <div className="bg-[#090D24] overflow-hidden border-b border-white/15">
                  <ArtifactIllustration
                    artifactId={item.id}
                    variant="photo"
                    className="w-full h-52 object-cover block"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-orange-200/85 flex flex-wrap items-center gap-2">
                      <span>{item.missionName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.landingDate}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mt-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-200 mt-2 leading-relaxed">{item.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({ page: 'artifact', planet: 'mars', artifactId: item.id })
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#EA580C] text-white font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ready for the Quiz Callout */}
        <section className="mt-12 rounded-3xl bg-[#172052]/95 border-[2.5px] border-[#FACC15]/75 shadow-[0_8px_0_#070B1E] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Ready to test what you learned?
            </h2>
            <p className="text-sm sm:text-base text-slate-200 mt-1">
              Try Lucy’s interactive Space Detective Quiz and earn passport stamps for all 5 exhibits!
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'quiz' })}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-[#0E1538] font-bold text-sm border-2 border-[#070B1E] shadow-[0_3px_0_#070B1E] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Start Space Quiz</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </section>
      </div>
    </main>
  );
};
