import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Award,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Send,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  DestinationId,
  EXPERIENCE_CATEGORY_COLORS,
  PALETTE_NAVIGATION,
  PROFILE_DATA,
  PROJECT_INSTALLATIONS,
  ProjectInstallation,
  SKILL_CATEGORIES,
  SPATIAL_DESTINATIONS,
  TIMELINE_ENTRIES,
} from '../data/portfolioData';
import {
  computeDevicePerformanceProfile,
  filterProjects,
  filterTimelineEntries,
  getDestinationByScrollProgress,
  getDestinationWaypoint,
  getProjectExecutiveBreakdown,
} from '../utils/atelierLogic';
import { checkWebGLSupport, isSoftwareGl } from '../three/studioEngine';
import { CameraController } from './CameraController';
import { EnvironmentManager } from './EnvironmentManager';
import { HeroInstallation } from './HeroInstallation';
import { AboutEnvironment3D } from './AboutEnvironment3D';
import { NeuralSculpture } from './NeuralSculpture';
import { ProjectGallery } from './ProjectGallery';
import { ExperienceTimeline } from './ExperienceTimeline';
import { ContactEnvironment } from './ContactEnvironment';
import { PaletteNavigation3D } from './PaletteNavigation3D';
import { TopNavHeader } from '../components/TopNavHeader';
import { WelcomeEntryOverlay } from '../components/WelcomeEntryOverlay';
import { QuickProfileModal } from '../components/QuickProfileModal';
import { ProjectCaseStudyModal } from '../components/ProjectCaseStudyModal';
import { FullscreenImageViewer } from '../components/FullscreenImageViewer';
import { AtelierLoadingScreen } from '../components/AtelierLoadingScreen';
import { WebGLErrorBoundary } from '../components/WebGLErrorBoundary';
import { AtelierNon3DFallback } from '../components/AtelierNon3DFallback';

/**
 * Signals to the loading screen as soon as the first 3D frame has rendered.
 */
const SceneReadyBeacon: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const firedRef = useRef(false);
  useFrame(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      onReady();
    }
  });
  return null;
};

export const AtelierWorld: React.FC = () => {
  const [webglStatus, setWebglStatus] = useState<{
    supported: boolean;
    reason?: string;
  }>(() => checkWebGLSupport());
  const [sceneReady, setSceneReady] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () =>
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
  );

  const [activeDestination, setActiveDestination] =
    useState<DestinationId>('home');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const targetProgressRef = useRef<number>(0);

  // Welcome overlay & Recruiter Quick Profile Modal
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('atelier_welcome_seen') !== '1';
    } catch {
      return true;
    }
  });
  const [quickProfileOpen, setQuickProfileOpen] = useState<boolean>(false);

  // Shared explanation panel expand/collapse state across desktop, tablet, and mobile
  const [panelExpanded, setPanelExpanded] = useState<boolean>(true);

  // Skills room state
  const [selectedSkillCatId, setSelectedSkillCatId] =
    useState<string>('programming');

  // Projects room state
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<
    'all' | 'ml' | 'bi'
  >('all');
  const [focusedProjectId, setFocusedProjectId] = useState<
    ProjectInstallation['id'] | null
  >('seismos');
  const [screenshotIndices, setScreenshotIndices] = useState<
    Record<string, number>
  >({
    seismos: 0,
    'sales-dashboard': 0,
    'churn-analysis': 0,
    'marketing-funnel': 0,
  });

  // Modals for Project Case Study & Fullscreen Screenshot Lightbox
  const [caseStudyModalProject, setCaseStudyModalProject] =
    useState<ProjectInstallation | null>(null);
  const [fullscreenViewerState, setFullscreenViewerState] = useState<{
    project: ProjectInstallation;
    index: number;
  } | null>(null);

  // Experience room state
  const [timelineFilter, setTimelineFilter] = useState<
    'all' | 'internship' | 'education' | 'forage' | 'certification'
  >('all');
  const [selectedExperienceId, setSelectedExperienceId] =
    useState<string>('exp-future-interns');

  // Contact room state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const performanceProfile = useMemo(() => {
    const nav =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & { deviceMemory?: number })
        : undefined;
    return computeDevicePerformanceProfile({
      width: viewportWidth,
      isSoftwareGl,
      deviceMemory: nav?.deviceMemory,
      hardwareConcurrency: nav?.hardwareConcurrency,
      prefersReducedMotion,
    });
  }, [viewportWidth, prefersReducedMotion]);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try {
      window.sessionStorage.setItem('atelier_welcome_seen', '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleHoverPigment = useCallback(() => {}, []);

  const handleSelectProject = useCallback((project: ProjectInstallation) => {
    setFocusedProjectId(project.id);
  }, []);

  const handleOpenFullscreenFromGallery = useCallback(
    (project: ProjectInstallation, shotIdx: number) => {
      setFullscreenViewerState({
        project,
        index: shotIdx,
      });
    },
    [],
  );

  // Navigate to a specific 3D destination while preserving the user's panel expand/collapse state
  const handleSelectDestination = useCallback((id: DestinationId) => {
    const wp = getDestinationWaypoint(id);
    targetProgressRef.current = wp.scrollProgress;
    setScrollProgress(wp.scrollProgress);
    setActiveDestination(id);
    if (id !== 'projects') {
      setFocusedProjectId(null);
    } else {
      setFocusedProjectId((prev) => prev || 'seismos');
    }
  }, []);

  // Wheel & keyboard navigation when no modal is open
  const isAnyOverlayBlockingScroll =
    welcomeOpen ||
    quickProfileOpen ||
    Boolean(caseStudyModalProject) ||
    Boolean(fullscreenViewerState);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnyOverlayBlockingScroll) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-scrollable-hud="true"]')) {
        return;
      }
      const delta = e.deltaY * 0.00028;
      const next = Math.max(
        0,
        Math.min(1, targetProgressRef.current + delta),
      );
      if (Math.abs(next - targetProgressRef.current) < 0.0001) return;

      targetProgressRef.current = next;
      setScrollProgress(next);
      const dest = getDestinationByScrollProgress(next);
      setActiveDestination(dest);

      // Release focused project zoom when scrolling along the spatial corridor away from the Projects waypoint
      if (Math.abs(next - 0.6) > 0.035) {
        setFocusedProjectId((prev) => (prev !== null ? null : prev));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyOverlayBlockingScroll) return;
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const currIdx = SPATIAL_DESTINATIONS.findIndex(
          (d) => d.id === activeDestination,
        );
        const nextDest =
          SPATIAL_DESTINATIONS[
            Math.min(SPATIAL_DESTINATIONS.length - 1, currIdx + 1)
          ];
        handleSelectDestination(nextDest.id);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const currIdx = SPATIAL_DESTINATIONS.findIndex(
          (d) => d.id === activeDestination,
        );
        const prevDest = SPATIAL_DESTINATIONS[Math.max(0, currIdx - 1)];
        handleSelectDestination(prevDest.id);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeDestination,
    handleSelectDestination,
    isAnyOverlayBlockingScroll,
  ]);

  const currentWaypoint = useMemo(
    () => getDestinationWaypoint(activeDestination),
    [activeDestination],
  );

  const selectedSkillCategory = useMemo(
    () =>
      SKILL_CATEGORIES.find((c) => c.id === selectedSkillCatId) ||
      SKILL_CATEGORIES[0],
    [selectedSkillCatId],
  );

  const filteredProjects = useMemo(
    () => filterProjects(projectCategoryFilter),
    [projectCategoryFilter],
  );

  const activeProject = useMemo(
    () =>
      PROJECT_INSTALLATIONS.find((p) => p.id === focusedProjectId) ||
      filteredProjects[0] ||
      PROJECT_INSTALLATIONS[0],
    [focusedProjectId, filteredProjects],
  );

  const activeProjectBreakdown = useMemo(
    () => getProjectExecutiveBreakdown(activeProject),
    [activeProject],
  );

  const activeProjectShotIndex = screenshotIndices[activeProject.id] || 0;
  const activeProjectScreenshot =
    activeProject.screenshots[activeProjectShotIndex] ||
    activeProject.screenshots[0];

  const handleCycleScreenshot = useCallback(
    (projectId: string, delta: number) => {
      const proj = PROJECT_INSTALLATIONS.find((p) => p.id === projectId);
      if (!proj || proj.screenshots.length <= 1) return;
      setScreenshotIndices((prev) => {
        const curr = prev[projectId] || 0;
        const next =
          (curr + delta + proj.screenshots.length) % proj.screenshots.length;
        return { ...prev, [projectId]: next };
      });
    },
    [],
  );

  const filteredTimeline = useMemo(
    () => filterTimelineEntries(timelineFilter),
    [timelineFilter],
  );

  const activeExperience = useMemo(
    () =>
      filteredTimeline.find((e) => e.id === selectedExperienceId) ||
      filteredTimeline[0] ||
      TIMELINE_ENTRIES[0],
    [filteredTimeline, selectedExperienceId],
  );

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PROFILE_DATA.email).catch(() => {});
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    setContactSubmitted(true);
  };

  const currentDestIndex = SPATIAL_DESTINATIONS.findIndex(
    (d) => d.id === activeDestination,
  );
  const prevDestination =
    currentDestIndex > 0 ? SPATIAL_DESTINATIONS[currentDestIndex - 1] : null;
  const nextDestination =
    currentDestIndex < SPATIAL_DESTINATIONS.length - 1
      ? SPATIAL_DESTINATIONS[currentDestIndex + 1]
      : null;

  if (!webglStatus.supported) {
    return (
      <AtelierNon3DFallback
        reason={webglStatus.reason}
        onRetry3D={() => setWebglStatus(checkWebGLSupport())}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#101112] text-[#F1EEE7] select-none">
      {/* Stage 3 Loading Screen */}
      <AtelierLoadingScreen sceneReady={sceneReady} />

      {/* Top Navigation Header */}
      <TopNavHeader
        activeDestination={activeDestination}
        scrollProgress={scrollProgress}
        onSelectDestination={handleSelectDestination}
        onOpenQuickProfile={() => {
          dismissWelcome();
          setQuickProfileOpen(true);
        }}
      />

      {/* Persistent Fullscreen 3D World */}
      <div className="fixed inset-0 z-0">
        <WebGLErrorBoundary
          fallback={({ error, onRetry }) => (
            <AtelierNon3DFallback
              reason={
                error?.message ||
                'WebGL rendering encountered an unexpected context error.'
              }
              onRetry3D={onRetry}
            />
          )}
        >
          <Canvas
            dpr={performanceProfile.dpr}
            camera={{ position: [0, 0.55, 7.2], fov: 44, near: 0.1, far: 210 }}
            gl={{
              antialias: performanceProfile.antialias,
              powerPreference: 'high-performance',
              alpha: false,
            }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                'webglcontextlost',
                (event) => {
                  event.preventDefault();
                  setWebglStatus({
                    supported: false,
                    reason: 'WebGL graphics context was lost.',
                  });
                },
                false,
              );
            }}
          >
            <color attach="background" args={['#101112']} />
            <fog attach="fog" args={['#101112', 16, 48]} />

            <SceneReadyBeacon onReady={handleSceneReady} />

            <CameraController
              scrollProgress={scrollProgress}
              activeDestination={activeDestination}
              focusedProjectId={
                activeDestination === 'projects' ? focusedProjectId : null
              }
              hudExpanded={panelExpanded}
            />

            <Suspense fallback={null}>
              <EnvironmentManager
                activeDestination={activeDestination}
                onSelectDestination={handleSelectDestination}
                particleCount={performanceProfile.particleCount}
                enableEnvironmentMap={performanceProfile.enableEnvironmentMap}
                animationScale={performanceProfile.animationScale}
              />

              {/* Room 1: Home — The Artist's Studio & 3D Palette */}
              <HeroInstallation />
              <PaletteNavigation3D
                activeDestination={activeDestination}
                onSelectDestination={handleSelectDestination}
                onHoverPigment={handleHoverPigment}
                hudExpanded={panelExpanded}
              />

              {/* Room 2: About — The Creator's Space */}
              <AboutEnvironment3D />

              {/* Room 3: Skills — The Neural Sculpture */}
              <NeuralSculpture
                activeCategoryId={selectedSkillCatId}
                onSelectCategory={setSelectedSkillCatId}
              />

              {/* Room 4: Projects — The Digital Exhibition */}
              <ProjectGallery
                projectFilter={projectCategoryFilter}
                focusedProjectId={focusedProjectId}
                activeScreenshotIndex={activeProjectShotIndex}
                onSelectProject={handleSelectProject}
                onOpenFullscreenScreenshot={handleOpenFullscreenFromGallery}
              />

              {/* Room 5: Experience — The Creative Timeline */}
              <ExperienceTimeline
                selectedEntryId={selectedExperienceId}
                onSelectEntry={setSelectedExperienceId}
                activeFilter={timelineFilter}
                hudExpanded={panelExpanded}
              />

              {/* Room 6: Contact — The Final Signature */}
              <ContactEnvironment hudExpanded={panelExpanded} />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      </div>

      {/* Left Spatial Editorial Panel (Consistent Desktop, Tablet & Mobile Collapse) */}
      <aside
        aria-label={`${currentWaypoint.sectionTitle} Exhibition Details`}
        data-scrollable-hud="true"
        className={`fixed z-30 left-3 right-3 sm:left-6 sm:right-auto bottom-3 sm:bottom-auto sm:top-20 sm:w-[410px] lg:w-[436px] transition-all duration-300 ease-out ${
          panelExpanded
            ? 'max-h-[60vh] sm:max-h-[calc(100vh-7.5rem)]'
            : 'max-h-[50px] sm:max-h-[50px]'
        } bg-[#101112]/94 border border-white/[0.09] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden`}
      >
        {/* Top Room Header Bar */}
        <div
          className={`px-4 sm:px-5 h-[50px] bg-[#171819] ${
            panelExpanded ? 'border-b border-white/[0.09]' : ''
          } flex items-center justify-between gap-2 shrink-0`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentWaypoint.hex }}
            />
            <span className="font-mono-tabular text-xs font-medium text-[#B9A078] shrink-0">
              0{currentWaypoint.index + 1} · {currentWaypoint.sectionTitle}
            </span>
            <span className="text-xs text-[#A5A39D] hidden sm:inline truncate">
              — {currentWaypoint.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {prevDestination && (
              <button
                type="button"
                onClick={() => handleSelectDestination(prevDestination.id)}
                title={`Previous: ${prevDestination.sectionTitle}`}
                aria-label={`Go to previous room: ${prevDestination.sectionTitle}`}
                className="p-1.5 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {nextDestination && (
              <button
                type="button"
                onClick={() => handleSelectDestination(nextDestination.id)}
                title={`Next: ${nextDestination.sectionTitle}`}
                aria-label={`Go to next room: ${nextDestination.sectionTitle}`}
                className="p-1.5 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanelExpanded((prev) => !prev)}
              aria-expanded={panelExpanded}
              aria-controls="atelier-room-explanation-body"
              aria-label={
                panelExpanded
                  ? 'Collapse explanation panel'
                  : 'Expand explanation panel'
              }
              title={
                panelExpanded
                  ? 'Collapse explanation panel'
                  : 'Expand explanation panel'
              }
              className="px-2.5 py-1 rounded bg-[#1D1E20] hover:bg-[#252629] border border-white/[0.09] hover:border-[#B9A078]/50 text-[#A5A39D] hover:text-[#F1EEE7] text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>{panelExpanded ? 'Collapse' : 'Expand'}</span>
              {panelExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#B9A078]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#B9A078]" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Room Content */}
        <div
          id="atelier-room-explanation-body"
          data-scrollable-hud="true"
          aria-hidden={!panelExpanded}
          className={`p-5 sm:p-6 overflow-y-auto space-y-6 ${
            panelExpanded ? 'block' : 'hidden'
          }`}
        >
          {/* ================= ROOM 01: HOME ================= */}
          {activeDestination === 'home' && (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <p className="font-mono-tabular text-xs text-[#B9A078]">
                  {PROFILE_DATA.atelierTitle} · {PROFILE_DATA.location}
                </p>
                <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F1EEE7] tracking-tight leading-tight">
                  {PROFILE_DATA.displayName}
                </h1>
                <p className="text-sm font-medium text-[#B9A078]">
                  Data Science, Data Analytics &amp; Machine Learning
                </p>
                <p className="text-xs sm:text-sm text-[#A5A39D] leading-relaxed">
                  {PROFILE_DATA.heroHeadline} Building analytical dashboards in
                  Power BI and predictive machine learning pipelines in Python,
                  SQL, and Scikit-learn.
                </p>
              </div>

              {/* Clean Key Highlights Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded bg-[#171819] border border-white/[0.09]">
                  <span className="font-serif-display text-base font-semibold text-[#F1EEE7] block">
                    4 Works
                  </span>
                  <span className="text-[11px] text-[#A5A39D] block mt-0.5">
                    ML &amp; Power BI
                  </span>
                </div>
                <div className="p-3 rounded bg-[#171819] border border-white/[0.09]">
                  <span className="font-serif-display text-base font-semibold text-[#F1EEE7] block">
                    3 Roles
                  </span>
                  <span className="text-[11px] text-[#A5A39D] block mt-0.5">
                    Data Internships
                  </span>
                </div>
                <div className="p-3 rounded bg-[#171819] border border-white/[0.09]">
                  <span className="font-serif-display text-base font-semibold text-[#F1EEE7] block">
                    8.5 CGPA
                  </span>
                  <span className="text-[11px] text-[#A5A39D] block mt-0.5">
                    BCA Graduate
                  </span>
                </div>
              </div>

              {/* Core Stack Pills */}
              <div className="space-y-2">
                <span className="font-mono-tabular text-[11px] text-[#A5A39D] block">
                  Core Technical Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Python',
                    'SQL',
                    'Power BI',
                    'DAX',
                    'Scikit-learn',
                    'Pandas',
                    'Streamlit',
                    'Power Query',
                  ].map((item) => (
                    <span
                      key={item}
                      className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectDestination('projects')}
                  className="px-4 py-2.5 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Explore Projects</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickProfileOpen(true)}
                  className="px-4 py-2.5 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] hover:border-[#B9A078]/40 text-[#F1EEE7] text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#B9A078]" />
                  <span>Quick Profile</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.09] flex items-center justify-between text-xs text-[#A5A39D]">
                <a
                  href={PROFILE_DATA.resumePdfUrl}
                  download="Anirudh_KN_Resume.pdf"
                  className="inline-flex items-center gap-1.5 text-[#F1EEE7] hover:text-[#B9A078] font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B9A078]" />
                  <span>Download Resume</span>
                </a>
                <div className="flex items-center gap-3">
                  <a
                    href={PROFILE_DATA.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F1EEE7] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={PROFILE_DATA.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F1EEE7] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ================= ROOM 02: ABOUT ================= */}
          {activeDestination === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={PROFILE_DATA.portraitImageUrl}
                  alt={PROFILE_DATA.displayName}
                  className="w-16 h-16 rounded-lg object-cover object-top bg-[#171819] border border-white/[0.09] shrink-0"
                />
                <div className="space-y-1">
                  <p className="font-mono-tabular text-xs text-[#B9A078]">
                    {PROFILE_DATA.location}
                  </p>
                  <h2 className="font-serif-display text-xl font-semibold text-[#F1EEE7]">
                    {PROFILE_DATA.displayName}
                  </h2>
                  <p className="text-xs text-[#A5A39D]">
                    {PROFILE_DATA.education.degree} · CGPA{' '}
                    {PROFILE_DATA.education.cgpa}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F1EEE7]/90 leading-relaxed">
                {PROFILE_DATA.summary}
              </p>

              <div className="p-4 rounded bg-[#171819] border border-white/[0.09] space-y-2">
                <span className="font-mono-tabular text-xs text-[#B9A078] block">
                  Academic Foundation
                </span>
                <h3 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                  {PROFILE_DATA.education.degree}
                </h3>
                <p className="text-xs text-[#A5A39D]">
                  {PROFILE_DATA.education.institution},{' '}
                  {PROFILE_DATA.education.university}
                </p>
                <p className="font-mono-tabular text-[11px] text-[#A5A39D]">
                  {PROFILE_DATA.education.period} · CGPA{' '}
                  {PROFILE_DATA.education.cgpa} / 10.0
                </p>
              </div>

              <p className="text-xs text-[#A5A39D] leading-relaxed border-l-2 border-[#B9A078]/60 pl-3.5">
                {PROFILE_DATA.artPhilosophy}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectDestination('skills')}
                  className="px-4 py-2.5 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-colors"
                >
                  Explore Skills →
                </button>
                <a
                  href={PROFILE_DATA.resumePdfUrl}
                  download="Anirudh_KN_Resume.pdf"
                  className="px-4 py-2.5 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B9A078]" />
                  <span>Download CV</span>
                </a>
              </div>
            </div>
          )}

          {/* ================= ROOM 03: SKILLS ================= */}
          {activeDestination === 'skills' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-serif-display text-xl font-semibold text-[#F1EEE7] tracking-tight">
                  Technical Architecture
                </h2>
                <p className="text-xs text-[#A5A39D] leading-relaxed">
                  Select a node on the 3D installation or choose a discipline
                  below.
                </p>
              </div>

              {/* Compact Category Selector Grid (Simple A–F Identifiers, Clear Active State) */}
              <div
                role="tablist"
                aria-label="Skill Categories"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              >
                {SKILL_CATEGORIES.map((cat) => {
                  const isSelected = cat.id === selectedSkillCategory.id;
                  const shortLabelMap: Record<string, string> = {
                    programming: 'Programming',
                    analytics: 'Data Analytics',
                    'machine-learning': 'Machine Learning',
                    visualization: 'BI & Visuals',
                    frameworks: 'Frameworks',
                    'cloud-ai-foundations': 'AI & Cloud',
                  };
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedSkillCatId(cat.id)}
                      className={`px-2 py-2 rounded border text-left transition-all duration-200 flex items-center gap-1.5 min-w-0 ${
                        isSelected
                          ? 'bg-[#1D1E20] border-[#B9A078]/75 text-[#F1EEE7] shadow-[inset_2px_0_0_0_#B9A078]'
                          : 'bg-[#151618] border-white/[0.07] text-[#A5A39D] hover:bg-[#191A1D] hover:text-[#F1EEE7]'
                      }`}
                    >
                      <span
                        className="font-mono-tabular text-[10px] font-semibold shrink-0"
                        style={{
                          color: isSelected ? cat.color : '#8E8D88',
                        }}
                      >
                        {cat.code}
                      </span>
                      <span
                        className={`text-[11px] leading-tight truncate ${
                          isSelected ? 'font-semibold text-[#F1EEE7]' : 'font-medium'
                        }`}
                      >
                        {shortLabelMap[cat.id] || cat.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Category Editorial Detail (Reduced Nested Borders, Clear Hierarchy) */}
              <div className="pt-4 border-t border-white/[0.09] space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: selectedSkillCategory.color }}
                    />
                    <span className="font-mono-tabular text-[11px] font-medium text-[#B9A078] tracking-wide uppercase">
                      {selectedSkillCategory.code} ·{' '}
                      {selectedSkillCategory.pigmentName}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] leading-snug">
                    {selectedSkillCategory.title}
                  </h3>
                  <p className="text-xs text-[#A5A39D] leading-relaxed">
                    {selectedSkillCategory.description}
                  </p>
                </div>

                <div className="divide-y divide-white/[0.07] border-t border-white/[0.08]">
                  {selectedSkillCategory.skills.map((skill) => (
                    <div key={skill.name} className="py-3 first:pt-3 last:pb-0.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-sm shrink-0"
                          style={{ backgroundColor: selectedSkillCategory.color }}
                        />
                        <span className="text-[13px] font-semibold text-[#F1EEE7] leading-snug">
                          {skill.name}
                        </span>
                      </div>
                      <p className="text-xs text-[#A5A39D] leading-relaxed pl-3.5">
                        {skill.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= ROOM 04: PROJECTS ================= */}
          {activeDestination === 'projects' && (
            <div className="space-y-5">
              {/* Filter + Project Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif-display text-lg font-semibold text-[#F1EEE7]">
                    Project Exhibitions
                  </h2>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'all', label: 'All (4)' },
                        { id: 'ml', label: 'ML / AI' },
                        { id: 'bi', label: 'Power BI' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setProjectCategoryFilter(tab.id);
                          const list = filterProjects(tab.id);
                          if (
                            list.length > 0 &&
                            !list.some((p) => p.id === focusedProjectId)
                          ) {
                            setFocusedProjectId(list[0].id);
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          projectCategoryFilter === tab.id
                            ? 'bg-[#B9A078] text-[#101112] font-semibold'
                            : 'bg-[#171819] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {filteredProjects.map((proj) => {
                    const isSelected = proj.id === activeProject.id;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setFocusedProjectId(proj.id)}
                        className={`px-3 py-2 rounded border text-left transition-colors duration-200 ${
                          isSelected
                            ? 'bg-[#1D1E20] border-[#B9A078]/60 text-[#F1EEE7]'
                            : 'bg-[#171819] border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7]'
                        }`}
                      >
                        <span className="text-xs font-medium truncate block">
                          {proj.shortTitle}
                        </span>
                        <span className="font-mono-tabular text-[10px] text-[#B9A078] truncate block mt-0.5">
                          {proj.highlightMetric.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Project Showcase */}
              <div className="space-y-4 pt-2 border-t border-white/[0.09]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[#B9A078]">
                    <span>{activeProject.categoryLabel}</span>
                    <span className="text-[#A5A39D]">{activeProject.date}</span>
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#F1EEE7]">
                    {activeProject.title}
                  </h3>
                </div>

                {/* Framed Screenshot Preview */}
                {activeProjectScreenshot && (
                  <div className="rounded-lg bg-[#171819] border border-white/[0.09] overflow-hidden">
                    <div className="relative bg-[#101112] p-2.5 flex items-center justify-center">
                      <img
                        src={activeProjectScreenshot.url}
                        alt={activeProjectScreenshot.title}
                        className="w-full h-40 object-contain rounded cursor-pointer"
                        onClick={() =>
                          setFullscreenViewerState({
                            project: activeProject,
                            index: activeProjectShotIndex,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFullscreenViewerState({
                            project: activeProject,
                            index: activeProjectShotIndex,
                          })
                        }
                        aria-label="Inspect project screenshot in fullscreen"
                        className="absolute top-4 right-4 px-2.5 py-1 rounded bg-[#101112]/90 border border-white/[0.12] hover:border-[#B9A078] text-[11px] font-medium text-[#F1EEE7] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Maximize2 className="w-3 h-3 text-[#B9A078]" />
                        <span>Fullscreen</span>
                      </button>
                    </div>

                    {activeProject.screenshots.length > 1 && (
                      <div className="px-3 py-2 bg-[#171819] border-t border-white/[0.09] flex items-center justify-between gap-2">
                        <span className="font-mono-tabular text-[11px] text-[#A5A39D] truncate">
                          Plate 0{activeProjectShotIndex + 1} / 0
                          {activeProject.screenshots.length}:{' '}
                          {activeProjectScreenshot.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCycleScreenshot(activeProject.id, -1)
                            }
                            aria-label="Previous project screenshot"
                            className="p-1 rounded bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] hover:border-[#B9A078]"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCycleScreenshot(activeProject.id, 1)
                            }
                            aria-label="Next project screenshot"
                            className="p-1 rounded bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] hover:border-[#B9A078]"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Concise Problem & Outcome */}
                <div className="space-y-2.5 text-xs">
                  <p className="text-[#A5A39D] leading-relaxed">
                    <strong className="text-[#F1EEE7] font-semibold">
                      Summary:{' '}
                    </strong>
                    {activeProject.shortDescription}
                  </p>
                  <p className="text-[#A5A39D] leading-relaxed">
                    <strong className="text-[#F1EEE7] font-semibold">
                      Key Outcome:{' '}
                    </strong>
                    {activeProjectBreakdown.primaryOutcome}
                  </p>
                </div>

                {/* Technology Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono-tabular text-[11px] px-2 py-0.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCaseStudyModalProject(activeProject)}
                    className="px-3.5 py-2.5 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Case Study</span>
                  </button>
                  <a
                    href={activeProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>GitHub Repo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#B9A078]" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ================= ROOM 05: EXPERIENCE ================= */}
          {activeDestination === 'experience' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-serif-display text-lg font-semibold text-[#F1EEE7] tracking-tight">
                    Experience &amp; Credentials
                  </h2>
                  <span className="font-mono-tabular text-[11px] text-[#A5A39D]">
                    {filteredTimeline.length} / {TIMELINE_ENTRIES.length} Milestones
                  </span>
                </div>

                {/* Single-Row Horizontal Filter Bar (Scrollable on Narrow Viewports) */}
                <div
                  role="tablist"
                  aria-label="Experience Category Filters"
                  className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5"
                >
                  {(
                    [
                      { id: 'all', label: 'All (12)', dot: null },
                      {
                        id: 'internship',
                        label: 'Internships (3)',
                        dot: EXPERIENCE_CATEGORY_COLORS.internship,
                      },
                      {
                        id: 'education',
                        label: 'BCA Degree',
                        dot: EXPERIENCE_CATEGORY_COLORS.education,
                      },
                      {
                        id: 'forage',
                        label: 'Forage (4)',
                        dot: EXPERIENCE_CATEGORY_COLORS.forage,
                      },
                      {
                        id: 'certification',
                        label: 'Certifications (4)',
                        dot: EXPERIENCE_CATEGORY_COLORS.certification,
                      },
                    ] as const
                  ).map((tab) => {
                    const isActive = timelineFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setTimelineFilter(tab.id);
                          const list = filterTimelineEntries(tab.id);
                          if (
                            list.length > 0 &&
                            !list.some((item) => item.id === selectedExperienceId)
                          ) {
                            setSelectedExperienceId(list[0].id);
                          }
                        }}
                        className={`px-1.5 py-1.5 rounded border text-[10px] tracking-tight leading-none whitespace-nowrap shrink-0 inline-flex items-center gap-1 transition-all duration-200 ${
                          isActive
                            ? 'bg-[#B9A078] border-[#B9A078] text-[#101112] font-semibold'
                            : 'bg-[#151618] border-white/[0.08] text-[#A5A39D] hover:bg-[#1A1B1E] hover:text-[#F1EEE7] font-medium'
                        }`}
                      >
                        {tab.dot && (
                          <span
                            className="w-1 h-1 rounded-full shrink-0"
                            style={{
                              backgroundColor: isActive ? '#101112' : tab.dot,
                            }}
                          />
                        )}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Milestone Editorial Details (Subtle Separators, Clear Hierarchy) */}
              <div className="pt-3.5 border-t border-white/[0.09] space-y-3">
                <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px]">
                  <span className="inline-flex items-center gap-1.5 uppercase tracking-wide font-medium text-[#F1EEE7]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          EXPERIENCE_CATEGORY_COLORS[activeExperience.type],
                      }}
                    />
                    {activeExperience.type === 'internship' && (
                      <Briefcase className="w-3.5 h-3.5 text-[#B9A078]" />
                    )}
                    {activeExperience.type === 'education' && (
                      <GraduationCap className="w-3.5 h-3.5 text-[#B9A078]" />
                    )}
                    {(activeExperience.type === 'forage' ||
                      activeExperience.type === 'certification') && (
                      <Award className="w-3.5 h-3.5 text-[#B9A078]" />
                    )}
                    <span>{activeExperience.type}</span>
                  </span>
                  <span className="text-[#B9A078] font-medium shrink-0">
                    {activeExperience.period}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif-display text-base sm:text-[17px] font-semibold text-[#F1EEE7] leading-snug">
                    {activeExperience.roleOrTitle}
                  </h3>
                  <p className="text-xs text-[#A5A39D] leading-relaxed">
                    <span className="text-[#F1EEE7]/90 font-medium">
                      {activeExperience.organization}
                    </span>{' '}
                    · <span>{activeExperience.location}</span>
                  </p>
                </div>

                <ul className="space-y-2 pt-2.5 border-t border-white/[0.07] text-xs text-[#A5A39D] leading-relaxed">
                  {activeExperience.highlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-sm mt-1.5 shrink-0"
                        style={{
                          backgroundColor:
                            EXPERIENCE_CATEGORY_COLORS[activeExperience.type],
                        }}
                      />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>

                {activeExperience.credentialUrl && (
                  <div className="pt-1">
                    <a
                      href={activeExperience.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] hover:border-[#B9A078]/60 text-xs font-medium text-[#B9A078] transition-colors"
                    >
                      <span>
                        {activeExperience.credentialLabel ||
                          'Verify Credential'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Milestone Selector List (Independently Scrollable) */}
              <div className="pt-3 border-t border-white/[0.09] space-y-2">
                <div className="flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-wider text-[#A5A39D]">
                  <span>Select Milestone</span>
                  <span>Chronology</span>
                </div>
                <div
                  data-scrollable-hud="true"
                  className="space-y-1.5 max-h-44 overflow-y-auto pr-1"
                >
                  {filteredTimeline.map((entry) => {
                    const isSelected = entry.id === activeExperience.id;
                    const entryColor = EXPERIENCE_CATEGORY_COLORS[entry.type];
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedExperienceId(entry.id)}
                        className={`w-full px-3 py-2 rounded border text-left flex items-center justify-between gap-2.5 transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#1D1E20] border-[#B9A078]/75 text-[#F1EEE7] shadow-[inset_2px_0_0_0_#B9A078]'
                            : 'bg-[#151618] border-white/[0.07] text-[#A5A39D] hover:bg-[#191A1D] hover:text-[#F1EEE7]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: entryColor }}
                          />
                          <div className="min-w-0">
                            <span
                              className={`text-xs truncate block ${
                                isSelected
                                  ? 'font-semibold text-[#F1EEE7]'
                                  : 'font-medium text-[#F1EEE7]/90'
                              }`}
                            >
                              {entry.roleOrTitle}
                            </span>
                            <span className="text-[11px] text-[#A5A39D] truncate block mt-0.5">
                              {entry.organization}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-mono-tabular text-[10px] shrink-0 ${
                            isSelected ? 'text-[#B9A078] font-medium' : 'text-[#A5A39D]'
                          }`}
                        >
                          {entry.period.split('–')[0].trim()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= ROOM 06: CONTACT ================= */}
          {activeDestination === 'contact' && (
            <div className="space-y-5">
              {/* Heading & Editorial Introduction */}
              <div className="space-y-1.5">
                <h2 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#F1EEE7] tracking-tight">
                  Let&apos;s Connect
                </h2>
                <p className="text-xs text-[#A5A39D] leading-relaxed">
                  Open to full-time roles and collaborations in Data Analytics,
                  Business Intelligence, Data Science, and AI/ML.
                </p>
              </div>

              {/* Primary Contact Element — Direct Email */}
              <div className="py-3.5 px-4 rounded-md bg-[#16171A] border border-[#B9A078]/35 hover:border-[#B9A078]/65 transition-colors space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[10px] uppercase tracking-wider text-[#B9A078] flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#B9A078]" />
                    <span>Primary Email</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    className="px-2.5 py-1 rounded bg-[#1F2024] hover:bg-[#27292E] border border-white/[0.1] hover:border-[#B9A078]/50 text-[11px] font-medium text-[#F1EEE7] inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3 h-3 text-[#B9A078]" />
                        <span className="text-[#B9A078]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#B9A078]" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
                <a
                  href={PROFILE_DATA.emailHref}
                  className="font-mono-tabular text-sm sm:text-[15px] font-medium text-[#F1EEE7] hover:text-[#B9A078] transition-colors block truncate"
                >
                  {PROFILE_DATA.email}
                </a>
              </div>

              {/* Secondary Contact Metadata (Phone & Location — Compact Editorial Strip) */}
              <div className="py-2.5 border-y border-white/[0.08] flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs">
                <a
                  href={PROFILE_DATA.phoneHref}
                  className="inline-flex items-center gap-2 text-[#F1EEE7]/90 hover:text-[#B9A078] transition-colors font-mono-tabular"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B9A078] shrink-0" />
                  <span>{PROFILE_DATA.phone}</span>
                </a>
                <span className="inline-flex items-center gap-1.5 text-[#A5A39D]">
                  <MapPin className="w-3.5 h-3.5 text-[#B9A078] shrink-0" />
                  <span>{PROFILE_DATA.location}</span>
                </span>
              </div>

              {/* Resume Download Action & Restrained Social Links */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <a
                  href={PROFILE_DATA.resumePdfUrl}
                  download="Anirudh_KN_Resume.pdf"
                  className="col-span-2 sm:flex-1 h-10 px-3.5 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Download Resume</span>
                </a>
                <a
                  href={PROFILE_DATA.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded bg-[#151618] hover:bg-[#1C1D20] border border-white/[0.08] hover:border-[#B9A078]/45 text-xs font-medium text-[#F1EEE7] inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#B9A078]" />
                </a>
                <a
                  href={PROFILE_DATA.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded bg-[#151618] hover:bg-[#1C1D20] border border-white/[0.08] hover:border-[#B9A078]/45 text-xs font-medium text-[#F1EEE7] inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-[#B9A078]" />
                </a>
              </div>

              {/* Refined Direct Inquiry Form */}
              <form
                onSubmit={handleContactSubmit}
                className="pt-4 border-t border-white/[0.09] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#B9A078] font-medium">
                    Send a Direct Note
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#A5A39D]">
                    Inquiry Form
                  </span>
                </div>
                {contactSubmitted ? (
                  <div className="p-3.5 rounded bg-[#16171A] border border-[#B9A078]/45 text-xs text-[#F1EEE7] space-y-1.5">
                    <p className="font-semibold text-[#B9A078]">
                      Thank you, {contactName}.
                    </p>
                    <p className="text-[#A5A39D] leading-relaxed">
                      Your note is ready. You can also reach out directly at{' '}
                      <a
                        href={PROFILE_DATA.emailHref}
                        className="text-[#F1EEE7] underline hover:text-[#B9A078]"
                      >
                        {PROFILE_DATA.email}
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        aria-label="Your name"
                        placeholder="Your name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full h-10 px-3.5 rounded bg-[#141517] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#B9A078] focus:outline-none text-xs text-[#F1EEE7] placeholder:text-[#A5A39D]/55 transition-colors"
                      />
                      <input
                        type="email"
                        required
                        aria-label="Your email"
                        placeholder="Your email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full h-10 px-3.5 rounded bg-[#141517] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#B9A078] focus:outline-none text-xs text-[#F1EEE7] placeholder:text-[#A5A39D]/55 transition-colors"
                      />
                    </div>
                    <textarea
                      rows={3}
                      aria-label="Role, project, or inquiry"
                      placeholder="Role, project, or inquiry..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded bg-[#141517] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#B9A078] focus:outline-none text-xs text-[#F1EEE7] placeholder:text-[#A5A39D]/55 resize-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="w-full h-10 rounded bg-[#1D1E22] hover:bg-[#B9A078] text-[#F1EEE7] hover:text-[#101112] border border-[#B9A078]/45 hover:border-[#B9A078] text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Inquiry</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom Desktop Spatial Wayfinding Bar */}
      <div className="hidden md:flex fixed bottom-5 right-6 z-30 items-center gap-1.5 px-3 py-2 rounded-lg bg-[#101112]/88 backdrop-blur-xl border border-white/[0.09]">
        <Sparkles className="w-3.5 h-3.5 text-[#B9A078] mr-1" />
        {PALETTE_NAVIGATION.map((dest) => {
          const isCurrent = dest.id === activeDestination;
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => handleSelectDestination(dest.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#1D1E20] text-[#F1EEE7] border border-[#B9A078]/50'
                  : 'text-[#A5A39D] hover:text-[#F1EEE7]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dest.hex }}
              />
              <span>{dest.sectionTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Welcome Entry Overlay */}
      <WelcomeEntryOverlay
        isOpen={welcomeOpen}
        onExploreFreely={dismissWelcome}
        onJumpToProjects={() => {
          dismissWelcome();
          handleSelectDestination('projects');
        }}
        onOpenQuickProfile={() => {
          dismissWelcome();
          setQuickProfileOpen(true);
        }}
      />

      {/* Recruiter Quick Profile Modal */}
      <QuickProfileModal
        isOpen={quickProfileOpen}
        onClose={() => setQuickProfileOpen(false)}
        onNavigateToSection={(dest) => handleSelectDestination(dest)}
        onSelectProjectCaseStudy={(projId) => {
          const found = PROJECT_INSTALLATIONS.find((p) => p.id === projId);
          if (found) {
            handleSelectDestination('projects');
            setFocusedProjectId(found.id);
            setCaseStudyModalProject(found);
          }
        }}
      />

      {/* Project Case Study Modal */}
      <ProjectCaseStudyModal
        project={caseStudyModalProject}
        onClose={() => setCaseStudyModalProject(null)}
        onOpenFullscreenImage={(idx) => {
          if (caseStudyModalProject) {
            setFullscreenViewerState({
              project: caseStudyModalProject,
              index: idx,
            });
          }
        }}
      />

      {/* Fullscreen Image Lightbox Viewer */}
      {fullscreenViewerState && (
        <FullscreenImageViewer
          projectTitle={fullscreenViewerState.project.title}
          githubUrl={fullscreenViewerState.project.githubUrl}
          screenshots={fullscreenViewerState.project.screenshots}
          activeIndex={fullscreenViewerState.index}
          onChangeIndex={(newIdx) => {
            setFullscreenViewerState((prev) =>
              prev ? { ...prev, index: newIdx } : null,
            );
          }}
          onClose={() => setFullscreenViewerState(null)}
        />
      )}
    </div>
  );
};
