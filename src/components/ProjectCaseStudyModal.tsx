import React, { useRef } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Layers,
  Maximize2,
  X,
} from 'lucide-react';
import { ProjectInstallation } from '../data/portfolioData';
import { useModalFocus } from '../utils/useModalFocus';

interface ProjectCaseStudyModalProps {
  project: ProjectInstallation | null;
  onClose: () => void;
  onOpenFullscreenImage: (screenshotIndex: number) => void;
}

export const ProjectCaseStudyModal: React.FC<ProjectCaseStudyModalProps> = ({
  project,
  onClose,
  onOpenFullscreenImage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useModalFocus({
    isOpen: Boolean(project),
    onClose,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-modal-title"
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 bg-[#101112]/85 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#171819] border border-white/[0.09] rounded-lg shadow-[0_28px_90px_rgba(0,0,0,0.88)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-5 bg-[#101112] border-b border-white/[0.09] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs text-[#B9A078]">
              <span>{project.categoryLabel}</span>
              <span className="text-[#A5A39D]">·</span>
              <span className="text-[#A5A39D]">{project.date}</span>
            </div>
            <h2
              id="case-study-modal-title"
              className="font-serif-display text-xl sm:text-2xl font-semibold text-[#F1EEE7] tracking-tight"
            >
              {project.fullTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-colors duration-200"
            >
              <span>{project.githubLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close Case Study Modal"
              className="p-2 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] hover:border-[#B9A078]/40 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Verified Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {project.displayedMetrics.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded bg-[#1D1E20] border border-white/[0.09] space-y-1"
              >
                <span className="font-mono-tabular text-[11px] text-[#A5A39D] block">
                  {metric.label}
                </span>
                <span className="font-serif-display text-lg font-semibold text-[#F1EEE7] block">
                  {metric.value}
                </span>
                {metric.detail && (
                  <span className="text-[11px] text-[#A5A39D] block leading-snug">
                    {metric.detail}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Executive Breakdown: Problem, Objective, Dataset */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2">
              <span className="font-mono-tabular text-xs text-[#B9A078] block">
                01 · Problem Statement
              </span>
              <p className="text-xs sm:text-sm text-[#A5A39D] leading-relaxed">
                {project.problemStatement}
              </p>
            </div>
            <div className="p-5 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2">
              <span className="font-mono-tabular text-xs text-[#B9A078] block">
                02 · Analytical Objective
              </span>
              <p className="text-xs sm:text-sm text-[#A5A39D] leading-relaxed">
                {project.objective}
              </p>
            </div>
            <div className="p-5 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2">
              <span className="font-mono-tabular text-xs text-[#B9A078] block">
                03 · Dataset &amp; Source
              </span>
              <p className="text-xs sm:text-sm text-[#A5A39D] leading-relaxed">
                {project.dataset}
              </p>
            </div>
          </div>

          {/* Authentic Project Screenshots Gallery */}
          <div className="space-y-4 pt-4 border-t border-white/[0.09]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7]">
                Project Evidence ({project.screenshots.length}{' '}
                {project.screenshots.length === 1 ? 'Plate' : 'Plates'})
              </h3>
              <span className="text-xs text-[#A5A39D]">
                Select any screenshot to inspect in fullscreen
              </span>
            </div>

            <div
              className={`grid gap-5 ${
                project.screenshots.length > 1
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {project.screenshots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className="group rounded bg-[#101112] border border-white/[0.09] hover:border-[#B9A078]/50 overflow-hidden transition-colors duration-200 flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => onOpenFullscreenImage(idx)}
                    className="relative w-full bg-[#101112] p-3 flex items-center justify-center overflow-hidden text-left"
                  >
                    <img
                      src={shot.url}
                      alt={shot.title}
                      className="w-full h-auto max-h-[300px] object-contain rounded transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                    <span className="absolute top-5 right-5 px-2.5 py-1 rounded bg-[#101112]/90 border border-white/[0.12] text-[11px] font-medium text-[#F1EEE7] inline-flex items-center gap-1.5 opacity-90 group-hover:border-[#B9A078]">
                      <Maximize2 className="w-3 h-3 text-[#B9A078]" />
                      <span>Inspect</span>
                    </span>
                  </button>
                  <div className="p-4 bg-[#1D1E20] border-t border-white/[0.09] space-y-1">
                    <h4 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                      {shot.title}
                    </h4>
                    <p className="text-xs text-[#A5A39D] leading-relaxed">
                      {shot.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies & Key Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-white/[0.09]">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B9A078]" />
                <span>Tools &amp; Methods</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="space-y-1.5 pt-1">
                {project.methods.map((method) => (
                  <li
                    key={method}
                    className="text-xs text-[#A5A39D] flex items-start gap-2"
                  >
                    <span className="text-[#B9A078]">•</span>
                    <span>{method}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B9A078]" />
                <span>Verified Outcomes</span>
              </h3>
              <div className="space-y-2.5">
                {project.outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded bg-[#1D1E20] border border-white/[0.09] text-xs sm:text-sm text-[#F1EEE7]/90 leading-relaxed"
                  >
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Case Study Sections */}
          <div className="space-y-4 pt-4 border-t border-white/[0.09]">
            <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7]">
              Technical Case Study Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.caseStudySections.map((sec) => (
                <div
                  key={sec.heading}
                  className="p-5 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2"
                >
                  <h4 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                    {sec.heading}
                  </h4>
                  <p className="text-xs text-[#A5A39D] leading-relaxed">
                    {sec.content}
                  </p>
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-1 pt-1 text-xs text-[#A5A39D]">
                      {sec.bullets.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-[#101112] border-t border-white/[0.09] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#B9A078] hover:underline"
          >
            <span>{project.githubLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#1D1E20] hover:bg-[#26282B] border border-white/[0.09] text-xs font-medium text-[#F1EEE7] transition-colors duration-200"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
};
