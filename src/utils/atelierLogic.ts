import {
  DestinationId,
  PROJECT_INSTALLATIONS,
  ProjectInstallation,
  QUICK_PROFILE_SKILL_GROUPS,
  SKILL_CATEGORIES,
  SPATIAL_DESTINATIONS,
  SpatialDestination,
  TIMELINE_ENTRIES,
  TimelineEntry,
} from '../data/portfolioData';

/**
 * Converts geographic latitude and longitude (in degrees) into 3D Cartesian coordinates on a sphere of radius R.
 */
export function latLonToCartesian(
  latDeg: number,
  lonDeg: number,
  radius: number,
): [number, number, number] {
  const phi = ((90 - latDeg) * Math.PI) / 180;
  const theta = ((lonDeg + 180) * Math.PI) / 180;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [Number(x.toFixed(4)), Number(y.toFixed(4)), Number(z.toFixed(4))];
}

/**
 * Filters timeline entries by category ('all' | 'internship' | 'education' | 'forage' | 'certification').
 */
export function filterTimelineEntries(
  category: 'all' | TimelineEntry['type'],
): TimelineEntry[] {
  if (category === 'all') {
    return TIMELINE_ENTRIES;
  }
  return TIMELINE_ENTRIES.filter((entry) => entry.type === category);
}

/**
 * Filters project installations by category ('all' | 'ml' | 'bi').
 */
export function filterProjects(
  category: 'all' | ProjectInstallation['category'],
): ProjectInstallation[] {
  if (category === 'all') {
    return PROJECT_INSTALLATIONS;
  }
  return PROJECT_INSTALLATIONS.filter((proj) => proj.category === category);
}

/**
 * Validates that a URL string is a genuine external link or verified local asset (never '#' or placeholder).
 */
export function isValidVerifiedUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === '#' ||
    trimmed.startsWith('javascript:') ||
    trimmed.includes('example.com') ||
    trimmed.includes('localhost')
  ) {
    return false;
  }
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/assets/') ||
    trimmed === '/Anirudh_KN_Resume.pdf'
  );
}

/**
 * Computes non-stretched width and height for a 3D or 2D exhibition frame given an image aspect ratio
 * and a maximum bounding width/height. Preserves original aspect ratio cleanly.
 */
export function computeAspectPreservedDimensions(
  aspectRatio: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number; aspectRatio: number } {
  const safeAspect = aspectRatio > 0 ? aspectRatio : 16 / 9;
  const safeMaxW = Math.max(0.1, maxWidth);
  const safeMaxH = Math.max(0.1, maxHeight);

  let width = safeMaxW;
  let height = width / safeAspect;

  if (height > safeMaxH) {
    height = safeMaxH;
    width = height * safeAspect;
  }

  return {
    width: Number(width.toFixed(4)),
    height: Number(height.toFixed(4)),
    aspectRatio: Number((width / height).toFixed(4)),
  };
}

/**
 * Maps a normalized scroll progress value [0, 1] to the active spatial destination ID.
 */
export function getDestinationByScrollProgress(progress: number): DestinationId {
  const clamped = Math.max(0, Math.min(1, progress));
  let closest: SpatialDestination = SPATIAL_DESTINATIONS[0];
  let minDistance = Math.abs(clamped - closest.scrollProgress);

  for (const dest of SPATIAL_DESTINATIONS) {
    const dist = Math.abs(clamped - dest.scrollProgress);
    if (dist < minDistance) {
      minDistance = dist;
      closest = dest;
    }
  }
  return closest.id;
}

/**
 * Interpolates the 3D camera position and lookAt target between spatial destinations for a given scroll progress [0, 1].
 */
export function interpolateSpatialCamera(progress: number): {
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  activeDestination: DestinationId;
} {
  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegments = SPATIAL_DESTINATIONS.length - 1;
  const scaled = clamped * totalSegments;
  const lowerIdx = Math.min(Math.floor(scaled), totalSegments - 1);
  const upperIdx = Math.min(lowerIdx + 1, totalSegments);
  const t = scaled - lowerIdx;

  // Smoothstep easing for cinematic transitions between rooms
  const smoothT = t * t * (3 - 2 * t);

  const from = SPATIAL_DESTINATIONS[lowerIdx];
  const to = SPATIAL_DESTINATIONS[upperIdx];

  const lerp = (a: number, b: number, factor: number) =>
    Number((a + (b - a) * factor).toFixed(4));

  const cameraPos: [number, number, number] = [
    lerp(from.cameraPos[0], to.cameraPos[0], smoothT),
    lerp(from.cameraPos[1], to.cameraPos[1], smoothT),
    lerp(from.cameraPos[2], to.cameraPos[2], smoothT),
  ];

  const cameraTarget: [number, number, number] = [
    lerp(from.cameraTarget[0], to.cameraTarget[0], smoothT),
    lerp(from.cameraTarget[1], to.cameraTarget[1], smoothT),
    lerp(from.cameraTarget[2], to.cameraTarget[2], smoothT),
  ];

  return {
    cameraPos,
    cameraTarget,
    activeDestination: getDestinationByScrollProgress(clamped),
  };
}

/**
 * Returns the spatial destination configuration for a given destination ID.
 */
export function getDestinationWaypoint(id: DestinationId): SpatialDestination {
  return (
    SPATIAL_DESTINATIONS.find((d) => d.id === id) || SPATIAL_DESTINATIONS[0]
  );
}

/**
 * Computes aspect-ratio-aware camera position, lookAt target, and field-of-view (FOV)
 * so desktop, tablet, and mobile portrait viewports (360px+) frame each 3D installation cleanly.
 */
export function computeResponsiveCameraFrame(
  basePos: [number, number, number],
  baseTarget: [number, number, number],
  viewportWidth: number,
  viewportHeight: number,
  hudExpanded: boolean,
  isFocusedProject = false,
): {
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  fov: number;
  isMobilePortrait: boolean;
} {
  const safeW = Math.max(320, viewportWidth || 1440);
  const safeH = Math.max(480, viewportHeight || 900);
  const aspect = safeW / safeH;
  const isMobilePortrait = safeW < 768 || aspect < 0.85;

  if (isMobilePortrait) {
    // On portrait mobile screens, pull the camera back along Z based on how narrow the aspect ratio is,
    // and shift the lookAt target slightly downward so the 3D installation sits in the upper-center
    // viewport above the 3D walnut palette and collapsible bottom sheet.
    const narrowness = Math.max(0, Math.min(1.4, (0.85 - aspect) * 2.2));
    const pullBackZ = (isFocusedProject ? 2.1 : 3.2) + narrowness * 2.2;
    const verticalTargetOffset = hudExpanded ? -0.52 : -0.26;
    const cameraHeightOffset = hudExpanded ? 0.22 : 0.12;

    return {
      cameraPos: [
        Number(basePos[0].toFixed(4)),
        Number((basePos[1] + cameraHeightOffset).toFixed(4)),
        Number((basePos[2] + pullBackZ).toFixed(4)),
      ],
      cameraTarget: [
        Number(baseTarget[0].toFixed(4)),
        Number((baseTarget[1] + verticalTargetOffset).toFixed(4)),
        Number(baseTarget[2].toFixed(4)),
      ],
      fov: safeW <= 390 ? 54 : 50,
      isMobilePortrait: true,
    };
  }

  // Desktop / landscape tablet framing:
  // When the left explanation panel is expanded (hudExpanded === true), shift the camera and lookAt
  // target toward -X so the 3D installation and surrounding gallery context sit centered in the
  // unobstructed right-hand viewport stage. When collapsed (hudExpanded === false), center in full viewport.
  const isCompactDesktop = safeW < 1100;
  const xTargetShift = !hudExpanded
    ? 0
    : isFocusedProject
      ? isCompactDesktop
        ? -1.45
        : -1.85
      : isCompactDesktop
        ? -0.85
        : -1.15;
  const xPosShift = !hudExpanded
    ? 0
    : isFocusedProject
      ? isCompactDesktop
        ? -1.35
        : -1.75
      : isCompactDesktop
        ? -0.65
        : -0.95;
  const desktopPullBack = isCompactDesktop
    ? isFocusedProject
      ? 1.85
      : 0.85
    : isFocusedProject
      ? hudExpanded
        ? 1.15
        : 0.65
      : 0;

  return {
    cameraPos: [
      Number((basePos[0] + xPosShift).toFixed(4)),
      Number(basePos[1].toFixed(4)),
      Number((basePos[2] + desktopPullBack).toFixed(4)),
    ],
    cameraTarget: [
      Number((baseTarget[0] + xTargetShift).toFixed(4)),
      Number(baseTarget[1].toFixed(4)),
      Number(baseTarget[2].toFixed(4)),
    ],
    fov: 44,
    isMobilePortrait: false,
  };
}

/**
 * Verifies portfolio data integrity so unit tests can assert zero unverified projects exist
 * and all 7 project screenshots, case studies, and Quick Profile groups are valid.
 */
export function verifyPortfolioIntegrity(): {
  valid: boolean;
  destinationCount: number;
  skillCategoryCount: number;
  projectCount: number;
  totalProjectScreenshots: number;
  internshipCount: number;
  quickProfileSkillGroupCount: number;
  hasExcludedProjects: boolean;
} {
  const serialized = JSON.stringify(PROJECT_INSTALLATIONS).toLowerCase();
  const excludedKeywords = [
    'crop recommendation',
    'diabetes prediction',
    'maternal health',
    'rag assistant',
  ];
  const hasExcludedProjects = excludedKeywords.some((kw) =>
    serialized.includes(kw),
  );
  const internshipCount = TIMELINE_ENTRIES.filter(
    (e) => e.type === 'internship',
  ).length;

  const totalProjectScreenshots = PROJECT_INSTALLATIONS.reduce(
    (acc, proj) => acc + proj.screenshots.length,
    0,
  );

  const allProjectsHaveCaseStudies = PROJECT_INSTALLATIONS.every(
    (proj) =>
      proj.screenshots.length >= 1 &&
      proj.caseStudySections.length >= 7 &&
      proj.displayedMetrics.length >= 4,
  );

  return {
    valid:
      SPATIAL_DESTINATIONS.length === 6 &&
      SKILL_CATEGORIES.length === 6 &&
      PROJECT_INSTALLATIONS.length === 4 &&
      totalProjectScreenshots === 7 &&
      allProjectsHaveCaseStudies &&
      internshipCount === 3 &&
      QUICK_PROFILE_SKILL_GROUPS.length === 5 &&
      !hasExcludedProjects,
    destinationCount: SPATIAL_DESTINATIONS.length,
    skillCategoryCount: SKILL_CATEGORIES.length,
    projectCount: PROJECT_INSTALLATIONS.length,
    totalProjectScreenshots,
    internshipCount,
    quickProfileSkillGroupCount: QUICK_PROFILE_SKILL_GROUPS.length,
    hasExcludedProjects,
  };
}

/**
 * Returns a structured Problem / Approach / Tools / Outcomes summary for a project installation
 * using strictly verified portfolio data fields.
 */
export interface ProjectExecutiveBreakdown {
  problem: string;
  approach: string;
  tools: string[];
  outcomes: string[];
  primaryOutcome: string;
}

export function getProjectExecutiveBreakdown(
  project: ProjectInstallation,
): ProjectExecutiveBreakdown {
  return {
    problem: project.problemStatement,
    approach: `${project.objective} (${project.methods.slice(0, 3).join(', ')})`,
    tools: project.technologies,
    outcomes: project.outcomes,
    primaryOutcome: project.outcomes[0] || project.shortDescription,
  };
}

/**
 * Computes camera flight duration in seconds while respecting prefers-reduced-motion.
 */
export function getFlightDurationSeconds(prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? 0.05 : 1.05;
}

export interface DevicePerformanceOptions {
  width: number;
  isSoftwareGl: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  prefersReducedMotion?: boolean;
}

export interface DevicePerformanceProfile {
  tier: 'high' | 'medium' | 'low';
  dpr: [number, number] | number;
  particleCount: number;
  antialias: boolean;
  enableEnvironmentMap: boolean;
  animationScale: number;
}

/**
 * Automatically selects a rendering quality profile based on device capabilities,
 * viewport width, software WebGL fallback status, and reduced-motion preferences.
 */
export function computeDevicePerformanceProfile(
  options: DevicePerformanceOptions,
): DevicePerformanceProfile {
  const {
    width,
    isSoftwareGl,
    deviceMemory = 8,
    hardwareConcurrency = 8,
    prefersReducedMotion = false,
  } = options;

  const animationScale = prefersReducedMotion ? 0 : 1;

  if (isSoftwareGl) {
    return {
      tier: 'low',
      dpr: 1,
      particleCount: 18,
      antialias: false,
      enableEnvironmentMap: false,
      animationScale,
    };
  }

  const isLowEndHardware = deviceMemory <= 2 || hardwareConcurrency <= 2;
  const isMidRangeHardware =
    deviceMemory <= 4 || hardwareConcurrency <= 4 || width < 768;

  if (isLowEndHardware) {
    return {
      tier: 'low',
      dpr: 1,
      particleCount: 24,
      antialias: false,
      enableEnvironmentMap: true,
      animationScale,
    };
  }

  if (isMidRangeHardware) {
    return {
      tier: 'medium',
      dpr: [1, 1.25],
      particleCount: 42,
      antialias: true,
      enableEnvironmentMap: true,
      animationScale,
    };
  }

  return {
    tier: 'high',
    dpr: [1, 2],
    particleCount: 120,
    antialias: true,
    enableEnvironmentMap: true,
    animationScale,
  };
}

