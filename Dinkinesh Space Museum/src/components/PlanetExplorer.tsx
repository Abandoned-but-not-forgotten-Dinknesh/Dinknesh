import React, { useEffect, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Move,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { PLANETS, type ArtifactInfo, type PlanetId } from '../data/artifacts';
import { ArtifactIllustration } from './ArtifactIllustration';
import { Moon3DCanvas } from './Moon3DCanvas';
import { Mars3DCanvas } from './Mars3DCanvas';
import type { RouteView } from './TopBar';

interface PlanetExplorerProps {
  planet: PlanetId;
  onNavigate: (route: RouteView) => void;
}

export const PlanetExplorer: React.FC<PlanetExplorerProps> = ({ planet, onNavigate }) => {
  const config = PLANETS[planet];
  const isMoon = planet === 'moon';

  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFullView, setIsFullView] = useState(false);

  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactInfo | null>(null);
  const [zoomCommand, setZoomCommand] = useState<{ seq: number; delta: number } | null>(null);
  const [resetSeq, setResetSeq] = useState(0);

  useEffect(() => {
    setSelectedArtifact(null);
    setZoomCommand(null);
    setResetSeq(0);
  }, [planet]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullView((prev) => (prev ? false : prev));
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullView && !document.fullscreenElement) {
        setIsFullView(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullView]);

  const handleToggleFullView = async () => {
    const next = !isFullView;
    setIsFullView(next);
    const el = stageWrapperRef.current;
    if (!el) return;
    try {
      if (next && el.requestFullscreen && !document.fullscreenElement) {
        await el.requestFullscreen();
      } else if (!next && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Embedded iframe fallback handles full-viewport sizing via fixed CSS
    }
  };

  const handleSelectSpot = (artifact: ArtifactInfo) => {
    setSelectedArtifact(artifact);
  };

  const handleZoomOutReset = () => {
    setSelectedArtifact(null);
    setResetSeq((s) => s + 1);
  };

  const handleManualZoom = (delta: number) => {
    setZoomCommand((prev) => ({ seq: (prev?.seq ?? 0) + 1, delta }));
  };

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] text-white transition-colors ${
        isMoon
          ? 'bg-gradient-to-b from-[#0C1232] via-[#131C48] to-[#192356]'
          : 'bg-gradient-to-b from-[#170F29] via-[#28163A] to-[#3B1D36]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-1">
              <span>ድንቅነሽ Space Gallery</span>
              <span aria-hidden="true">·</span>
              <span>{config.gravityNote}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Explore {config.title} with Lucy
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-1 max-w-2xl">
              {config.subtitle}
            </p>
          </div>

          {/* Interactive 3D Stage Controls + Full View Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 mr-2">
              <Move className="w-3.5 h-3.5" aria-hidden="true" />
              {isMoon ? 'Drag to rotate 3D Moon' : 'Drag to rotate 3D Mars'}
            </span>
            <button
              type="button"
              onClick={() => handleManualZoom(0.35)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
              aria-label="Zoom in on planet"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
              Zoom In
            </button>
            <button
              type="button"
              onClick={() => handleManualZoom(-0.35)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
              aria-label="Zoom out on planet"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
              Zoom Out
            </button>
            <button
              type="button"
              onClick={handleZoomOutReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reset View
            </button>
            <button
              type="button"
              onClick={handleToggleFullView}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] border border-white/40 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              {isFullView ? (
                <>
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                  Exit Full View
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                  Full View
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Interactive Stage (Always Full Width) */}
        <div
          ref={stageWrapperRef}
          className={`${
            isFullView
              ? 'fixed inset-0 z-50 rounded-none bg-[#070B1E] flex flex-col'
              : 'w-full relative rounded-3xl border border-white/15 bg-[#090D24]/85 overflow-hidden shadow-2xl'
          }`}
        >
          {isFullView && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#090D24] border-b border-white/15 shrink-0">
              <span className="font-display text-lg font-bold text-white">
                {config.title} — Full View
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleManualZoom(0.35)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer text-white whitespace-nowrap"
                >
                  <ZoomIn className="w-4 h-4" aria-hidden="true" />
                  Zoom In
                </button>
                <button
                  type="button"
                  onClick={() => handleManualZoom(-0.35)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer text-white whitespace-nowrap"
                >
                  <ZoomOut className="w-4 h-4" aria-hidden="true" />
                  Zoom Out
                </button>
                <button
                  type="button"
                  onClick={handleZoomOutReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium cursor-pointer text-white whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Reset View
                </button>
                <button
                  type="button"
                  onClick={handleToggleFullView}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0E1538] text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                  Exit Full View
                </button>
              </div>
            </div>
          )}

          {/* 3D Planet Viewport + In-Card Explainer Popup */}
          <div className={`relative w-full ${isFullView ? 'flex-1 min-h-0' : 'h-[480px] sm:h-[560px]'}`}>
            {isMoon ? (
              <Moon3DCanvas
                artifacts={config.artifacts}
                selectedArtifact={selectedArtifact}
                onSelectArtifact={handleSelectSpot}
                zoomCommand={zoomCommand}
                resetSeq={resetSeq}
              />
            ) : (
              <Mars3DCanvas
                artifacts={config.artifacts}
                selectedArtifact={selectedArtifact}
                onSelectArtifact={handleSelectSpot}
                zoomCommand={zoomCommand}
                resetSeq={resetSeq}
              />
            )}

            {/* Compact Explainer Card Popup Inside the View Card */}
            {selectedArtifact && (
              <aside
                aria-live="polite"
                className="absolute bottom-3 left-3 right-3 sm:left-auto sm:bottom-auto sm:top-4 sm:right-4 sm:w-[288px] md:w-[310px] max-h-[calc(100%-1.5rem)] overflow-y-auto z-30 rounded-2xl bg-[#FFFBF2] text-[#1E255E] border-[3px] border-[#1E255E] shadow-[0_8px_0_#1E255E] p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg sm:text-xl font-bold leading-tight text-[#1E255E]">
                      {selectedArtifact.name}
                    </h2>
                    <p className="text-xs font-medium text-[#64748B] mt-0.5">
                      {selectedArtifact.landingDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleZoomOutReset}
                    aria-label="Close explainer card and zoom out"
                    className="shrink-0 w-8 h-8 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E255E] border border-[#1E255E]/20 flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-[#1E255E]/20 bg-[#0F172A] shrink-0">
                  <ArtifactIllustration
                    artifactId={selectedArtifact.id}
                    variant="photo"
                    className="w-full h-36 sm:h-auto sm:aspect-[4/3] object-cover block"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#334155] leading-snug">
                  {selectedArtifact.shortSummary}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      void document.exitFullscreen().catch(() => {});
                    }
                    setIsFullView(false);
                    onNavigate({
                      page: 'artifact',
                      planet: selectedArtifact.planet,
                      artifactId: selectedArtifact.id,
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#EA580C] text-white font-display font-bold text-sm border-2 border-[#1E255E] shadow-[0_3px_0_#1E255E] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Broader Story</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </aside>
            )}
          </div>

          {/* Centered Artifact Switcher Bar along bottom of Planet View Card */}
          <div className="px-4 sm:px-6 py-3.5 bg-[#0B102B] border-t border-white/15 flex flex-wrap items-center justify-center gap-3 sm:gap-4 shrink-0">
            {config.artifacts.map((a) => {
              const isSelected = selectedArtifact?.id === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelectSpot(a)}
                  className={`px-5 py-2 rounded-2xl font-display text-sm tracking-tight transition-all cursor-pointer whitespace-nowrap border-2 ${
                    isSelected
                      ? 'bg-[#FACC15] text-[#1E255E] font-bold border-[#1E255E] shadow-[0_3px_0_#1E255E] -translate-y-0.5'
                      : 'bg-[#172052] hover:bg-[#1F2C6E] text-white font-semibold border-[#38BDF8]/45 hover:border-[#38BDF8] shadow-[0_3px_0_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
