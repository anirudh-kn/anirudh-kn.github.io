import React, { useRef } from 'react';
import { Compass, Layers, UserCheck, X } from 'lucide-react';
import { PROFILE_DATA } from '../data/portfolioData';
import { useModalFocus } from '../utils/useModalFocus';

interface WelcomeEntryOverlayProps {
  isOpen: boolean;
  onExploreFreely: () => void;
  onJumpToProjects: () => void;
  onOpenQuickProfile: () => void;
}

export const WelcomeEntryOverlay: React.FC<WelcomeEntryOverlayProps> = ({
  isOpen,
  onExploreFreely,
  onJumpToProjects,
  onOpenQuickProfile,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);

  useModalFocus({
    isOpen,
    onClose: onExploreFreely,
    containerRef,
    initialFocusRef: primaryButtonRef,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-atelier-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-[#101112]/80 backdrop-blur-xl animate-fadeIn"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-xl bg-[#171819] border border-white/[0.09] rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden p-6 sm:p-10"
      >
        {/* Top Champagne Hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B9A078]/60 to-transparent" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onExploreFreely}
          aria-label="Enter portfolio"
          className="absolute top-5 right-5 p-2 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] hover:border-[#B9A078]/40 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              {PROFILE_DATA.atelierTitle} · {PROFILE_DATA.location}
            </p>
            <h2
              id="welcome-atelier-title"
              className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F1EEE7] tracking-tight"
            >
              {PROFILE_DATA.displayName}
            </h2>
            <p className="text-sm font-medium text-[#A5A39D]">
              Data Science, Data Analytics &amp; Machine Learning Portfolio
            </p>
          </div>

          <p className="text-sm text-[#F1EEE7]/85 leading-relaxed">
            Welcome to an interactive 3D exhibition presenting verified work in
            Python, SQL, Power BI, and Scikit-learn across six connected
            gallery spaces.
          </p>

          {/* Streamlined Entry Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onExploreFreely}
              className="p-4 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-left transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <Compass className="w-4 h-4 text-[#101112]" />
              <div>
                <span className="text-xs font-semibold block">
                  Enter 3D Studio
                </span>
                <span className="text-[11px] text-[#101112]/75 block mt-0.5">
                  Explore all 6 spaces
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onJumpToProjects}
              className="p-4 rounded bg-[#1D1E20] hover:bg-[#242629] border border-white/[0.09] hover:border-[#B9A078]/40 text-left transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <Layers className="w-4 h-4 text-[#B9A078]" />
              <div>
                <span className="text-xs font-semibold text-[#F1EEE7] block">
                  View Projects
                </span>
                <span className="text-[11px] text-[#A5A39D] block mt-0.5">
                  4 verified case studies
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenQuickProfile}
              className="p-4 rounded bg-[#1D1E20] hover:bg-[#242629] border border-white/[0.09] hover:border-[#B9A078]/40 text-left transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <UserCheck className="w-4 h-4 text-[#B9A078]" />
              <div>
                <span className="text-xs font-semibold text-[#F1EEE7] block">
                  Quick Profile
                </span>
                <span className="text-[11px] text-[#A5A39D] block mt-0.5">
                  Compact summary &amp; CV
                </span>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.09] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A5A39D]">
            <span>Navigate via scroll, arrow keys, or the 3D palette</span>
            <span className="font-mono-tabular text-[11px]">
              Press Esc to continue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
