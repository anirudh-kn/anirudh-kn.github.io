import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAspectPreservedDimensions,
  computeDevicePerformanceProfile,
  computeResponsiveCameraFrame,
  filterProjects,
  filterTimelineEntries,
  getDestinationByScrollProgress,
  getDestinationWaypoint,
  getFlightDurationSeconds,
  getProjectExecutiveBreakdown,
  interpolateSpatialCamera,
  isValidVerifiedUrl,
  latLonToCartesian,
  verifyPortfolioIntegrity,
} from './atelierLogic';
import {
  CONTACT_GALLERY_ARTWORKS,
  EXPERIENCE_CATEGORY_COLORS,
  EXPERIENCE_GALLERY_ARTWORKS,
  HOME_GALLERY_ARTWORKS,
  PROFILE_DATA,
  PROJECT_INSTALLATIONS,
  QUICK_PROFILE_SKILL_GROUPS,
  SKILL_CATEGORIES,
  SKILLS_GALLERY_ARTWORKS,
  SPATIAL_DESTINATIONS,
  TIMELINE_ENTRIES,
} from '../data/portfolioData';

test('verifyPortfolioIntegrity confirms 6 spatial destinations, 4 verified projects, 7 real screenshots, 5 Quick Profile skill groups, and zero excluded projects', () => {
  const status = verifyPortfolioIntegrity();
  assert.equal(status.valid, true);
  assert.equal(status.destinationCount, 6);
  assert.equal(status.skillCategoryCount, 6);
  assert.equal(status.projectCount, 4);
  assert.equal(status.totalProjectScreenshots, 7);
  assert.equal(status.internshipCount, 3);
  assert.equal(status.quickProfileSkillGroupCount, 5);
  assert.equal(status.hasExcludedProjects, false);
  assert.equal(QUICK_PROFILE_SKILL_GROUPS.length, 5);

  const expectedColors: Record<string, string> = {
    programming: '#7894D4',
    analytics: '#D1846D',
    'machine-learning': '#A997C8',
    visualization: '#73A99E',
    frameworks: '#AEB7C3',
    'cloud-ai-foundations': '#C7B9A3',
  };
  for (let i = 0; i < SKILL_CATEGORIES.length; i++) {
    const cat = SKILL_CATEGORIES[i];
    assert.equal(cat.color, expectedColors[cat.id]);
    assert.equal(cat.skills.length >= 4, true);
    const [x, y, z] = cat.nodePosition;
    const distFromNucleus = Math.sqrt(x * x + y * y + z * z);
    assert.equal(distFromNucleus > 1.5, true);
    for (let j = i + 1; j < SKILL_CATEGORIES.length; j++) {
      const other = SKILL_CATEGORIES[j].nodePosition;
      const dx = x - other[0];
      const dy = y - other[1];
      const dz = z - other[2];
      const pairDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      assert.equal(pairDist > 1.4, true);
    }
  }
});

test('all profile, portrait, project screenshot, GitHub, and credential URLs are authentic and non-placeholder', () => {
  assert.equal(
    PROFILE_DATA.portraitImageUrl,
    '/assets/anirudh-profile-cutout.webp',
  );
  assert.equal(isValidVerifiedUrl(PROFILE_DATA.portraitImageUrl), true);
  assert.equal(isValidVerifiedUrl(PROFILE_DATA.githubUrl), true);
  assert.equal(isValidVerifiedUrl(PROFILE_DATA.linkedinUrl), true);
  assert.equal(isValidVerifiedUrl(PROFILE_DATA.emailHref), true);
  assert.equal(PROFILE_DATA.resumePdfUrl, '/Anirudh_KN_Resume.pdf');
  assert.equal(isValidVerifiedUrl(PROFILE_DATA.resumePdfUrl), true);
  assert.equal(
    HOME_GALLERY_ARTWORKS.left.url,
    '/assets/artworks/home-landscape-painting.jpg',
  );
  assert.equal(
    HOME_GALLERY_ARTWORKS.right.url,
    '/assets/artworks/home-pencil-portrait.jpg',
  );
  assert.equal(HOME_GALLERY_ARTWORKS.left.wallSide, 'left');
  assert.equal(HOME_GALLERY_ARTWORKS.right.wallSide, 'right');
  assert.equal(isValidVerifiedUrl(HOME_GALLERY_ARTWORKS.left.url), true);
  assert.equal(isValidVerifiedUrl(HOME_GALLERY_ARTWORKS.right.url), true);
  assert.equal(
    SKILLS_GALLERY_ARTWORKS.left.url,
    '/assets/artworks/skills-misty-meadow.jpg',
  );
  assert.equal(
    SKILLS_GALLERY_ARTWORKS.right.url,
    '/assets/artworks/skills-golden-reflection.jpg',
  );
  assert.equal(isValidVerifiedUrl(SKILLS_GALLERY_ARTWORKS.left.url), true);
  assert.equal(isValidVerifiedUrl(SKILLS_GALLERY_ARTWORKS.right.url), true);
  assert.equal(
    EXPERIENCE_GALLERY_ARTWORKS.left.url,
    '/assets/artworks/experience-pencil-portrait-2021.jpg',
  );
  assert.equal(
    EXPERIENCE_GALLERY_ARTWORKS.right.url,
    '/assets/artworks/experience-pencil-portrait-2022.jpg',
  );
  assert.equal(EXPERIENCE_GALLERY_ARTWORKS.left.wallSide, 'left');
  assert.equal(EXPERIENCE_GALLERY_ARTWORKS.right.wallSide, 'right');
  assert.equal(isValidVerifiedUrl(EXPERIENCE_GALLERY_ARTWORKS.left.url), true);
  assert.equal(isValidVerifiedUrl(EXPERIENCE_GALLERY_ARTWORKS.right.url), true);
  assert.equal(
    CONTACT_GALLERY_ARTWORKS.left.url,
    '/assets/artworks/contact-golden-lake-sunset.jpg',
  );
  assert.equal(
    CONTACT_GALLERY_ARTWORKS.right.url,
    '/assets/artworks/contact-blue-mountain-meadow.jpg',
  );
  assert.equal(CONTACT_GALLERY_ARTWORKS.left.wallSide, 'left');
  assert.equal(CONTACT_GALLERY_ARTWORKS.right.wallSide, 'right');
  assert.equal(isValidVerifiedUrl(CONTACT_GALLERY_ARTWORKS.left.url), true);
  assert.equal(isValidVerifiedUrl(CONTACT_GALLERY_ARTWORKS.right.url), true);
  assert.equal(isValidVerifiedUrl('#'), false);
  assert.equal(isValidVerifiedUrl('https://example.com/demo'), false);

  for (const project of PROJECT_INSTALLATIONS) {
    assert.equal(
      isValidVerifiedUrl(project.githubUrl),
      true,
      `Invalid GitHub URL for ${project.id}`,
    );
    assert.equal(
      project.screenshots.length > 0,
      true,
      `Missing screenshots for ${project.id}`,
    );
    for (const shot of project.screenshots) {
      assert.equal(
        isValidVerifiedUrl(shot.url),
        true,
        `Invalid screenshot URL ${shot.url} for ${project.id}`,
      );
      assert.equal(
        shot.url.startsWith('/assets/projects/'),
        true,
        `Screenshot ${shot.url} must live in /assets/projects/`,
      );
      assert.equal(shot.aspectRatio > 1.2, true);
    }
  }

  for (const entry of TIMELINE_ENTRIES) {
    if (entry.credentialUrl) {
      assert.equal(
        isValidVerifiedUrl(entry.credentialUrl),
        true,
        `Invalid credential URL for ${entry.id}`,
      );
    }
  }
});

test('computeAspectPreservedDimensions preserves original screenshot, Home, Skills, and Experience artwork aspect ratios without stretching', () => {
  const salesRatio = 1378 / 777;
  const dims = computeAspectPreservedDimensions(salesRatio, 2.4, 1.8);
  assert.equal(Math.abs(dims.aspectRatio - salesRatio) < 0.002, true);
  assert.equal(dims.width <= 2.4, true);
  assert.equal(dims.height <= 1.8, true);

  const seismosWideRatio = 1917 / 900;
  const wideDims = computeAspectPreservedDimensions(seismosWideRatio, 2.6, 1.5);
  assert.equal(Math.abs(wideDims.aspectRatio - seismosWideRatio) < 0.002, true);

  const leftLandscapeDims = computeAspectPreservedDimensions(
    HOME_GALLERY_ARTWORKS.left.aspectRatio,
    1.94,
    1.5,
  );
  assert.equal(
    Math.abs(
      leftLandscapeDims.aspectRatio - HOME_GALLERY_ARTWORKS.left.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(leftLandscapeDims.width > leftLandscapeDims.height, true);
  assert.equal(leftLandscapeDims.width >= 1.9 && leftLandscapeDims.width <= 1.98, true);
  assert.equal(leftLandscapeDims.height <= 1.5, true);

  const rightPortraitDims = computeAspectPreservedDimensions(
    HOME_GALLERY_ARTWORKS.right.aspectRatio,
    1.68,
    2.26,
  );
  assert.equal(
    Math.abs(
      rightPortraitDims.aspectRatio - HOME_GALLERY_ARTWORKS.right.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(rightPortraitDims.height > rightPortraitDims.width, true);
  assert.equal(rightPortraitDims.width <= 1.68, true);
  assert.equal(rightPortraitDims.height <= 2.26, true);

  const leftSkillsDims = computeAspectPreservedDimensions(
    SKILLS_GALLERY_ARTWORKS.left.aspectRatio,
    1.9,
    1.46,
  );
  assert.equal(
    Math.abs(
      leftSkillsDims.aspectRatio - SKILLS_GALLERY_ARTWORKS.left.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(leftSkillsDims.width > leftSkillsDims.height, true);
  assert.equal(leftSkillsDims.width >= 1.88 && leftSkillsDims.width <= 1.98, true);

  const rightSkillsDims = computeAspectPreservedDimensions(
    SKILLS_GALLERY_ARTWORKS.right.aspectRatio,
    1.9,
    1.46,
  );
  assert.equal(
    Math.abs(
      rightSkillsDims.aspectRatio - SKILLS_GALLERY_ARTWORKS.right.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(rightSkillsDims.width > rightSkillsDims.height, true);
  assert.equal(rightSkillsDims.width >= 1.88 && rightSkillsDims.width <= 1.98, true);
  assert.notEqual(leftSkillsDims.height, rightSkillsDims.height);

  const leftExperienceDims = computeAspectPreservedDimensions(
    EXPERIENCE_GALLERY_ARTWORKS.left.aspectRatio,
    1.68,
    2.26,
  );
  assert.equal(
    Math.abs(
      leftExperienceDims.aspectRatio -
        EXPERIENCE_GALLERY_ARTWORKS.left.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(leftExperienceDims.height > leftExperienceDims.width, true);
  assert.equal(leftExperienceDims.width <= 1.68, true);
  assert.equal(leftExperienceDims.height <= 2.26, true);

  const rightExperienceDims = computeAspectPreservedDimensions(
    EXPERIENCE_GALLERY_ARTWORKS.right.aspectRatio,
    1.68,
    2.26,
  );
  assert.equal(
    Math.abs(
      rightExperienceDims.aspectRatio -
        EXPERIENCE_GALLERY_ARTWORKS.right.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(rightExperienceDims.height > rightExperienceDims.width, true);
  assert.equal(rightExperienceDims.width <= 1.68, true);
  assert.equal(rightExperienceDims.height <= 2.26, true);

  const leftContactDims = computeAspectPreservedDimensions(
    CONTACT_GALLERY_ARTWORKS.left.aspectRatio,
    1.9,
    1.48,
  );
  assert.equal(
    Math.abs(
      leftContactDims.aspectRatio - CONTACT_GALLERY_ARTWORKS.left.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(leftContactDims.width > leftContactDims.height, true);
  assert.equal(leftContactDims.width >= 1.88 && leftContactDims.width <= 1.98, true);

  const rightContactDims = computeAspectPreservedDimensions(
    CONTACT_GALLERY_ARTWORKS.right.aspectRatio,
    1.9,
    1.48,
  );
  assert.equal(
    Math.abs(
      rightContactDims.aspectRatio - CONTACT_GALLERY_ARTWORKS.right.aspectRatio,
    ) < 0.002,
    true,
  );
  assert.equal(rightContactDims.width > rightContactDims.height, true);
  assert.equal(rightContactDims.width >= 1.88 && rightContactDims.width <= 1.98, true);
  assert.notEqual(leftContactDims.height, rightContactDims.height);
});

test('interpolateSpatialCamera and getDestinationByScrollProgress map all 6 rooms accurately', () => {
  assert.equal(getDestinationByScrollProgress(0), 'home');
  assert.equal(getDestinationByScrollProgress(0.2), 'about');
  assert.equal(getDestinationByScrollProgress(0.4), 'skills');
  assert.equal(getDestinationByScrollProgress(0.6), 'projects');
  assert.equal(getDestinationByScrollProgress(0.8), 'experience');
  assert.equal(getDestinationByScrollProgress(1.0), 'contact');

  const homeCam = interpolateSpatialCamera(0);
  assert.deepEqual(homeCam.cameraPos, SPATIAL_DESTINATIONS[0].cameraPos);
  assert.equal(homeCam.activeDestination, 'home');

  const contactCam = interpolateSpatialCamera(1);
  assert.deepEqual(contactCam.cameraPos, SPATIAL_DESTINATIONS[5].cameraPos);
  assert.equal(contactCam.activeDestination, 'contact');

  const projectsWp = getDestinationWaypoint('projects');
  assert.equal(projectsWp.roomTitle, 'THE DIGITAL EXHIBITION');
});

test('computeResponsiveCameraFrame adapts FOV and camera distance for mobile portrait (360x800, 390x844) vs desktop (1440x900) and accounts for expanded/collapsed panel states', () => {
  const home = SPATIAL_DESTINATIONS[0];
  const desktopExpandedFrame = computeResponsiveCameraFrame(
    home.cameraPos,
    home.cameraTarget,
    1440,
    900,
    true,
    false,
  );
  assert.equal(desktopExpandedFrame.isMobilePortrait, false);
  assert.equal(desktopExpandedFrame.fov, 44);
  assert.equal(desktopExpandedFrame.cameraPos[2], home.cameraPos[2]);
  assert.equal(desktopExpandedFrame.cameraTarget[0] < home.cameraTarget[0], true);

  const desktopCollapsedFrame = computeResponsiveCameraFrame(
    home.cameraPos,
    home.cameraTarget,
    1440,
    900,
    false,
    false,
  );
  assert.equal(desktopCollapsedFrame.cameraPos[0], home.cameraPos[0]);
  assert.equal(desktopCollapsedFrame.cameraTarget[0], home.cameraTarget[0]);

  const seismos = PROJECT_INSTALLATIONS[0];
  const projectExpandedDesktop = computeResponsiveCameraFrame(
    seismos.zoomCameraPos,
    seismos.zoomCameraTarget,
    1440,
    900,
    true,
    true,
  );
  const projectCollapsedDesktop = computeResponsiveCameraFrame(
    seismos.zoomCameraPos,
    seismos.zoomCameraTarget,
    1440,
    900,
    false,
    true,
  );
  assert.equal(
    projectExpandedDesktop.cameraTarget[0] < projectCollapsedDesktop.cameraTarget[0],
    true,
  );
  assert.equal(
    projectCollapsedDesktop.cameraTarget[0],
    seismos.zoomCameraTarget[0],
  );

  const mobileFrame360 = computeResponsiveCameraFrame(
    home.cameraPos,
    home.cameraTarget,
    360,
    800,
    false,
    false,
  );
  assert.equal(mobileFrame360.isMobilePortrait, true);
  assert.equal(mobileFrame360.fov, 54);
  assert.equal(mobileFrame360.cameraPos[2] > home.cameraPos[2] + 3.0, true);
  assert.equal(mobileFrame360.cameraTarget[1] < home.cameraTarget[1], true);
});

test('latLonToCartesian projects geographic coordinates onto sphere surface', () => {
  const radius = 2.0;
  const [x, y, z] = latLonToCartesian(0, 0, radius);
  const dist = Math.sqrt(x * x + y * y + z * z);
  assert.equal(Math.abs(dist - radius) < 0.01, true);
});

test('filterTimelineEntries and filterProjects return strictly verified subsets and consistent category colors', () => {
  assert.equal(TIMELINE_ENTRIES.length, 12);
  assert.equal(filterTimelineEntries('all').length, 12);
  assert.equal(filterTimelineEntries('internship').length, 3);
  assert.equal(filterTimelineEntries('education').length, 1);
  assert.equal(filterTimelineEntries('forage').length, 4);
  assert.equal(filterTimelineEntries('certification').length, 4);

  assert.equal(EXPERIENCE_CATEGORY_COLORS.internship, '#C7745C');
  assert.equal(EXPERIENCE_CATEGORY_COLORS.education, '#659B93');
  assert.equal(EXPERIENCE_CATEGORY_COLORS.forage, '#6B84C4');
  assert.equal(EXPERIENCE_CATEGORY_COLORS.certification, '#B9A078');

  for (const entry of TIMELINE_ENTRIES) {
    assert.equal(
      entry.pigmentColor,
      EXPERIENCE_CATEGORY_COLORS[entry.type],
      `Expected ${entry.id} (${entry.type}) to use category color ${EXPERIENCE_CATEGORY_COLORS[entry.type]}`,
    );
  }

  const allProjects = filterProjects('all');
  assert.equal(allProjects.length, 4);

  const mlProjects = filterProjects('ml');
  assert.equal(mlProjects.length, 1);
  assert.equal(mlProjects[0].id, 'seismos');

  const biProjects = filterProjects('bi');
  assert.equal(biProjects.length, 3);
});

test('getProjectExecutiveBreakdown structures verified Problem, Approach, Tools, and Outcomes for all 4 projects', () => {
  for (const project of PROJECT_INSTALLATIONS) {
    const breakdown = getProjectExecutiveBreakdown(project);
    assert.equal(breakdown.problem.length > 20, true);
    assert.equal(breakdown.approach.length > 20, true);
    assert.equal(breakdown.tools.length >= 3, true);
    assert.equal(breakdown.outcomes.length >= 2, true);
    assert.equal(breakdown.primaryOutcome.length > 20, true);
  }
});

test('getFlightDurationSeconds respects prefers-reduced-motion', () => {
  assert.equal(getFlightDurationSeconds(true), 0.05);
  assert.equal(getFlightDurationSeconds(false), 1.05);
});

test('computeDevicePerformanceProfile selects high, medium, and low rendering profiles intelligently', () => {
  const desktopProfile = computeDevicePerformanceProfile({
    width: 1440,
    isSoftwareGl: false,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    prefersReducedMotion: false,
  });
  assert.equal(desktopProfile.tier, 'high');
  assert.deepEqual(desktopProfile.dpr, [1, 2]);
  assert.equal(desktopProfile.particleCount, 120);
  assert.equal(desktopProfile.antialias, true);
  assert.equal(desktopProfile.enableEnvironmentMap, true);
  assert.equal(desktopProfile.animationScale, 1);

  const mobileProfile = computeDevicePerformanceProfile({
    width: 390,
    isSoftwareGl: false,
    deviceMemory: 6,
    hardwareConcurrency: 6,
    prefersReducedMotion: false,
  });
  assert.equal(mobileProfile.tier, 'medium');
  assert.deepEqual(mobileProfile.dpr, [1, 1.25]);
  assert.equal(mobileProfile.particleCount, 42);
  assert.equal(mobileProfile.antialias, true);

  const lowEndMobile = computeDevicePerformanceProfile({
    width: 360,
    isSoftwareGl: false,
    deviceMemory: 2,
    hardwareConcurrency: 2,
    prefersReducedMotion: true,
  });
  assert.equal(lowEndMobile.tier, 'low');
  assert.equal(lowEndMobile.dpr, 1);
  assert.equal(lowEndMobile.particleCount, 24);
  assert.equal(lowEndMobile.antialias, false);
  assert.equal(lowEndMobile.animationScale, 0);

  const softwareGlProfile = computeDevicePerformanceProfile({
    width: 1440,
    isSoftwareGl: true,
  });
  assert.equal(softwareGlProfile.tier, 'low');
  assert.equal(softwareGlProfile.dpr, 1);
  assert.equal(softwareGlProfile.enableEnvironmentMap, false);
});

