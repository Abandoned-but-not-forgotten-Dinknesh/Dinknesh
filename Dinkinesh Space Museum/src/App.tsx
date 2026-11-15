import { useCallback, useEffect, useState } from 'react';
import type { PlanetId } from './data/artifacts';
import { TopBar, type RouteView } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { LaunchSequence } from './components/LaunchSequence';
import { PlanetExplorer } from './components/PlanetExplorer';
import { ArtifactDetailPage } from './components/ArtifactDetailPage';
import { AllExhibitsPage } from './components/AllExhibitsPage';
import { QuizPage } from './components/QuizPage';

function routeToHash(route: RouteView): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'planet':
      return `#/${route.planet}`;
    case 'artifact':
      return `#/${route.planet}/${route.artifactId}`;
    case 'exhibits':
      return '#/exhibits';
    case 'quiz':
      return '#/quiz';
  }
}

function hashToRoute(hash: string): RouteView {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) return { page: 'home' };
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'exhibits') return { page: 'exhibits' };
  if (parts[0] === 'quiz') return { page: 'quiz' };
  if (parts[0] === 'moon' || parts[0] === 'mars') {
    const planet = parts[0] as PlanetId;
    if (parts[1]) {
      return { page: 'artifact', planet, artifactId: parts[1] };
    }
    return { page: 'planet', planet };
  }
  return { page: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<RouteView>(() =>
    typeof window !== 'undefined' ? hashToRoute(window.location.hash) : { page: 'home' }
  );
  const [launchingTo, setLaunchingTo] = useState<PlanetId | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(hashToRoute(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((nextRoute: RouteView) => {
    setRoute(nextRoute);
    const nextHash = routeToHash(nextRoute);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    window.scrollTo(0, 0);
  }, []);

  const handleLaunchPlanet = useCallback((planet: PlanetId) => {
    setLaunchingTo(planet);
  }, []);

  const handleLaunchComplete = useCallback(
    (planet: PlanetId) => {
      setLaunchingTo(null);
      navigate({ page: 'planet', planet });
    },
    [navigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0C1232]">
      <TopBar currentRoute={route} onNavigate={navigate} darkTheme={true} />

      {route.page === 'home' && (
        <HomePage
          isLaunching={launchingTo !== null}
          onLaunchPlanet={handleLaunchPlanet}
          onNavigate={navigate}
        />
      )}

      {route.page === 'planet' && (
        <PlanetExplorer planet={route.planet} onNavigate={navigate} />
      )}

      {route.page === 'artifact' && (
        <ArtifactDetailPage
          planet={route.planet}
          artifactId={route.artifactId}
          onNavigate={navigate}
        />
      )}

      {route.page === 'exhibits' && (
        <AllExhibitsPage onNavigate={navigate} onLaunchPlanet={handleLaunchPlanet} />
      )}

      {route.page === 'quiz' && <QuizPage onNavigate={navigate} />}

      <LaunchSequence targetPlanet={launchingTo} onComplete={handleLaunchComplete} />
    </div>
  );
}
