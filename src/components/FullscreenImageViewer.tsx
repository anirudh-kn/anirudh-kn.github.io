import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { ProjectScreenshot } from '../data/portfolioData';
import { useModalFocus } from '../utils/useModalFocus';

interface FullscreenImageViewerProps {
  projectTitle: string;
  githubUrl: string;
  screenshots: ProjectScreenshot[];
  activeIndex: number;
  onChangeIndex: (newIndex: number) => void;
  onClose: () => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  projectTitle,
  githubUrl,
  screenshots,
  activeIndex,
  onChangeIndex,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useModalFocus({
    isOpen: screenshots.length > 0,
    onClose,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && screenshots.length > 1) {
        onChangeIndex((activeIndex + 1) % screenshots.length);
      } else if (e.key === 'ArrowLeft' && screenshots.length > 1) {
        onChangeIndex(
          (activeIndex - 1 + screenshots.length) % screenshots.length,
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, screenshots.length, onChangeIndex]);

  if (!screenshots.length) return null;
  const current = screenshots[activeIndex] || screenshots[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-viewer-title"
      className="fixed inset-0 z-[85] bg-[#101112]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.09] shrink-0">
          <div>
            <span className="font-mono-tabular text-xs text-[#B9A078] block">
              {projectTitle} · Plate {activeIndex + 1} of {screenshots.length}
            </span>
            <h2
              id="fullscreen-viewer-title"
              className="font-serif-display text-lg sm:text-xl font-semibold text-[#F1EEE7]"
            >
              {current.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] text-xs font-medium text-[#F1EEE7] transition-colors"
            >
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B9A078]" />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close Fullscreen Image Viewer"
              className="p-2 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] hover:border-[#B9A078]/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 min-h-0 my-4 flex items-center justify-center bg-[#171819] border border-white/[0.09] rounded-lg p-3 sm:p-6 overflow-hidden">
          {screenshots.length > 1 && (
            <button
              type="button"
              onClick={() =>
                onChangeIndex(
                  (activeIndex - 1 + screenshots.length) % screenshots.length,
                )
              }
              aria-label="Previous screenshot"
              className="absolute left-4 z-10 p-2.5 rounded-full bg-[#101112]/90 border border-white/[0.12] text-[#F1EEE7] hover:border-[#B9A078] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <img
            src={current.url}
            alt={current.title}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded shadow-2xl"
          />

          {screenshots.length > 1 && (
            <button
              type="button"
              onClick={() =>
                onChangeIndex((activeIndex + 1) % screenshots.length)
              }
              aria-label="Next screenshot"
              className="absolute right-4 z-10 p-2.5 rounded-full bg-[#101112]/90 border border-white/[0.12] text-[#F1EEE7] hover:border-[#B9A078] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom Caption & Plate Selector */}
        <div className="pt-3 border-t border-white/[0.09] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <p className="text-xs text-[#A5A39D] max-w-3xl leading-relaxed">
            {current.caption}
          </p>

          {screenshots.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              {screenshots.map((shot, idx) => (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => onChangeIndex(idx)}
                  className={`px-3 py-1.5 rounded font-mono-tabular text-xs transition-colors ${
                    idx === activeIndex
                      ? 'bg-[#B9A078] text-[#101112] font-semibold'
                      : 'bg-[#171819] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7]'
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
