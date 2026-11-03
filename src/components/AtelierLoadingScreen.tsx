import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { PROFILE_DATA } from '../data/portfolioData';

interface AtelierLoadingScreenProps {
  sceneReady: boolean;
}

export const AtelierLoadingScreen: React.FC<AtelierLoadingScreenProps> = ({
  sceneReady,
}) => {
  const { active, progress, loaded, total } = useProgress();
  const [dismissed, setDismissed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const computedProgress = sceneReady
    ? 100
    : total > 0
      ? Math.min(99, Math.round((loaded / total) * 100))
      : Math.min(90, Math.round(progress || 48));

  useEffect(() => {
    if (sceneReady && !active) {
      setFadingOut(true);
      const timer = window.setTimeout(() => {
        setDismissed(true);
      }, 280);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [sceneReady, active]);

  useEffect(() => {
    const safetyTimer = window.setTimeout(() => {
      setFadingOut(true);
      const hideTimer = window.setTimeout(() => {
        setDismissed(true);
      }, 220);
      return () => window.clearTimeout(hideTimer);
    }, 1800);
    return () => window.clearTimeout(safetyTimer);
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading The Data Atelier 3D environment"
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#101112] text-[#F1EEE7] px-6 transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <p className="font-mono-tabular text-xs text-[#B9A078]">
            {PROFILE_DATA.displayName}
          </p>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1EEE7]">
            {PROFILE_DATA.atelierTitle}
          </h2>
          <p className="text-xs text-[#A5A39D]">
            {PROFILE_DATA.atelierTagline}
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-[2px] w-full bg-[#1D1E20] overflow-hidden rounded-full">
            <div
              className="h-full bg-[#B9A078] transition-all duration-200 ease-out"
              style={{ width: `${Math.max(12, computedProgress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[#A5A39D]">
            <span>Preparing 3D Exhibition</span>
            <span className="text-[#B9A078]">{computedProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
