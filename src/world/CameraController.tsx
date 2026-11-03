import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  DestinationId,
  PROJECT_INSTALLATIONS,
  ProjectInstallation,
} from '../data/portfolioData';
import {
  computeResponsiveCameraFrame,
  interpolateSpatialCamera,
} from '../utils/atelierLogic';
import { isSoftwareGl } from '../three/studioEngine';

interface CameraControllerProps {
  scrollProgress: number;
  activeDestination: DestinationId;
  focusedProjectId: ProjectInstallation['id'] | null;
  hudExpanded: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  scrollProgress,
  focusedProjectId,
  hudExpanded,
}) => {
  const { camera, size, invalidate } = useThree();

  const currentLookAt = useRef(new THREE.Vector3(0, 0.15, 0));
  const rigState = useRef({
    posX: 0,
    posY: 0.55,
    posZ: 7.2,
    targetX: 0,
    targetY: 0.15,
    targetZ: 0,
    fov: 44,
  });
  const lastGoalRef = useRef<{
    posX: number;
    posY: number;
    posZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    fov: number;
  } | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Raw pointer target vs smoothed pointer state (never triggers React re-renders)
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerSmoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const nx = Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, -(e.clientY / h) * 2 + 1));
      pointerTarget.current.x = nx;
      pointerTarget.current.y = ny;
    };

    const handlePointerReset = () => {
      pointerTarget.current.x = 0;
      pointerTarget.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerReset, { passive: true });
    window.addEventListener('blur', handlePointerReset, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerReset);
      window.removeEventListener('blur', handlePointerReset);
    };
  }, []);

  // Ensure any active GSAP tween is cleaned up when unmounting
  useEffect(() => {
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, []);

  // Animate camera rig state when scrollProgress, focusedProjectId, hudExpanded, or viewport dimensions change
  useEffect(() => {
    const focusedProject = focusedProjectId
      ? PROJECT_INSTALLATIONS.find((p) => p.id === focusedProjectId)
      : null;

    let basePos: [number, number, number];
    let baseTarget: [number, number, number];

    if (focusedProject) {
      basePos = focusedProject.zoomCameraPos;
      baseTarget = focusedProject.zoomCameraTarget;
    } else {
      const interpolated = interpolateSpatialCamera(scrollProgress);
      basePos = interpolated.cameraPos;
      baseTarget = interpolated.cameraTarget;
    }

    const framed = computeResponsiveCameraFrame(
      basePos,
      baseTarget,
      size.width,
      size.height,
      hudExpanded,
      Boolean(focusedProject),
    );

    const nextGoal = {
      posX: framed.cameraPos[0],
      posY: framed.cameraPos[1],
      posZ: framed.cameraPos[2],
      targetX: framed.cameraTarget[0],
      targetY: framed.cameraTarget[1],
      targetZ: framed.cameraTarget[2],
      fov: framed.fov,
    };

    // Deduplicate identical camera goals to prevent redundant tween restarts
    const prevGoal = lastGoalRef.current;
    if (
      prevGoal &&
      Math.abs(prevGoal.posX - nextGoal.posX) < 0.0005 &&
      Math.abs(prevGoal.posY - nextGoal.posY) < 0.0005 &&
      Math.abs(prevGoal.posZ - nextGoal.posZ) < 0.0005 &&
      Math.abs(prevGoal.targetX - nextGoal.targetX) < 0.0005 &&
      Math.abs(prevGoal.targetY - nextGoal.targetY) < 0.0005 &&
      Math.abs(prevGoal.targetZ - nextGoal.targetZ) < 0.0005 &&
      Math.abs(prevGoal.fov - nextGoal.fov) < 0.05
    ) {
      return;
    }
    lastGoalRef.current = nextGoal;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    const travelDistance = Math.hypot(
      nextGoal.posX - rigState.current.posX,
      nextGoal.posY - rigState.current.posY,
      nextGoal.posZ - rigState.current.posZ,
    );

    if (prefersReducedMotion || isSoftwareGl || travelDistance < 0.002) {
      rigState.current.posX = nextGoal.posX;
      rigState.current.posY = nextGoal.posY;
      rigState.current.posZ = nextGoal.posZ;
      rigState.current.targetX = nextGoal.targetX;
      rigState.current.targetY = nextGoal.targetY;
      rigState.current.targetZ = nextGoal.targetZ;
      rigState.current.fov = nextGoal.fov;

      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        const persp = camera as THREE.PerspectiveCamera;
        if (Math.abs(persp.fov - nextGoal.fov) > 0.05) {
          persp.fov = nextGoal.fov;
          persp.updateProjectionMatrix();
        }
      }
      invalidate();
      return;
    }

    // Use responsive smoothing for incremental scroll steps and cinematic easing for room/project flights
    const isIncrementalScroll = travelDistance < 2.2 && !focusedProject;
    const duration = isIncrementalScroll
      ? 0.36
      : focusedProject
        ? 0.85
        : 0.72;
    const ease = isIncrementalScroll ? 'power2.out' : 'power3.out';

    tweenRef.current = gsap.to(rigState.current, {
      posX: nextGoal.posX,
      posY: nextGoal.posY,
      posZ: nextGoal.posZ,
      targetX: nextGoal.targetX,
      targetY: nextGoal.targetY,
      targetZ: nextGoal.targetZ,
      fov: nextGoal.fov,
      duration,
      ease,
      overwrite: 'auto',
      onUpdate: () => {
        invalidate();
      },
      onComplete: () => {
        tweenRef.current = null;
        invalidate();
      },
    });
  }, [
    scrollProgress,
    focusedProjectId,
    hudExpanded,
    size.width,
    size.height,
    camera,
    invalidate,
  ]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

    if (prefersReducedMotion) {
      pointerSmoothed.current.x = 0;
      pointerSmoothed.current.y = 0;
    } else {
      pointerSmoothed.current.x = THREE.MathUtils.damp(
        pointerSmoothed.current.x,
        pointerTarget.current.x,
        5.5,
        dt,
      );
      pointerSmoothed.current.y = THREE.MathUtils.damp(
        pointerSmoothed.current.y,
        pointerTarget.current.y,
        5.5,
        dt,
      );

      // Snap cleanly when settled so the camera comes to a complete stop
      if (
        Math.abs(pointerTarget.current.x - pointerSmoothed.current.x) < 0.0004
      ) {
        pointerSmoothed.current.x = pointerTarget.current.x;
      }
      if (
        Math.abs(pointerTarget.current.y - pointerSmoothed.current.y) < 0.0004
      ) {
        pointerSmoothed.current.y = pointerTarget.current.y;
      }
    }

    // Attenuate pointer parallax smoothly during long room-to-room transitions so parallax never fights flight motion
    const goal = lastGoalRef.current;
    const remainingFlightDist = goal
      ? Math.hypot(
          goal.posX - rigState.current.posX,
          goal.posY - rigState.current.posY,
          goal.posZ - rigState.current.posZ,
        )
      : 0;
    const flightAttenuation = 1 / (1 + remainingFlightDist * 0.25);

    const isMobile = size.width < 768;
    const parallaxScale =
      (prefersReducedMotion ? 0 : isMobile ? 0.025 : 0.11) * flightAttenuation;
    const px = pointerSmoothed.current.x * parallaxScale;
    const py = pointerSmoothed.current.y * (parallaxScale * 0.65);

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - rigState.current.fov) > 0.05) {
        persp.fov = rigState.current.fov;
        persp.updateProjectionMatrix();
      }
    }

    camera.position.set(
      rigState.current.posX + px,
      rigState.current.posY + py,
      rigState.current.posZ,
    );

    currentLookAt.current.set(
      rigState.current.targetX + px * 0.35,
      rigState.current.targetY + py * 0.35,
      rigState.current.targetZ,
    );

    camera.lookAt(currentLookAt.current);
    camera.updateMatrixWorld();
  });

  return null;
};

