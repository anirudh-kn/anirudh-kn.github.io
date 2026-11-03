import React, { useRef } from 'react';
import {
  Award,
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import {
  DestinationId,
  PROFILE_DATA,
  PROJECT_INSTALLATIONS,
  QUICK_PROFILE_SKILL_GROUPS,
  TIMELINE_ENTRIES,
} from '../data/portfolioData';
import { useModalFocus } from '../utils/useModalFocus';

interface QuickProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (dest: DestinationId) => void;
  onSelectProjectCaseStudy: (projectId: string) => void;
}

export const QuickProfileModal: React.FC<QuickProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  onSelectProjectCaseStudy,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useModalFocus({
    isOpen,
    onClose,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  if (!isOpen) return null;

  const internships = TIMELINE_ENTRIES.filter((e) => e.type === 'internship');
  const credentials = TIMELINE_ENTRIES.filter(
    (e) => e.type === 'forage' || e.type === 'certification',
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-profile-modal-title"
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 bg-[#101112]/85 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#171819] border border-white/[0.09] rounded-lg shadow-[0_28px_90px_rgba(0,0,0,0.88)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 bg-[#101112] border-b border-white/[0.09] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={PROFILE_DATA.portraitImageUrl}
              alt={PROFILE_DATA.displayName}
              className="w-12 h-12 rounded object-cover object-top bg-[#1D1E20] border border-white/[0.09] shrink-0"
            />
            <div>
              <p className="font-mono-tabular text-[11px] text-[#B9A078]">
                Executive Candidate Summary
              </p>
              <h2
                id="quick-profile-modal-title"
                className="font-serif-display text-xl sm:text-2xl font-semibold text-[#F1EEE7] tracking-tight"
              >
                {PROFILE_DATA.displayName}
              </h2>
              <p className="text-xs text-[#A5A39D]">
                {PROFILE_DATA.recruiterHeadline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={PROFILE_DATA.resumePdfUrl}
              download="Anirudh_KN_Resume.pdf"
              aria-label="Download Resume PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-colors duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Resume</span>
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close Quick Profile"
              className="p-2 rounded bg-[#1D1E20] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] hover:border-[#B9A078]/40 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Professional Summary & Education Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <h3 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                Professional Summary
              </h3>
              <p className="text-sm text-[#A5A39D] leading-relaxed">
                {PROFILE_DATA.summary}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#A5A39D]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B9A078]" />
                  {PROFILE_DATA.location}
                </span>
                <a
                  href={PROFILE_DATA.emailHref}
                  className="inline-flex items-center gap-1.5 hover:text-[#F1EEE7] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#B9A078]" />
                  {PROFILE_DATA.email}
                </a>
                <a
                  href={PROFILE_DATA.phoneHref}
                  className="inline-flex items-center gap-1.5 hover:text-[#F1EEE7] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B9A078]" />
                  {PROFILE_DATA.phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-[11px] text-[#B9A078] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Education
                </span>
                <span className="font-mono-tabular text-xs font-medium text-[#F1EEE7]">
                  CGPA {PROFILE_DATA.education.cgpa} / 10
                </span>
              </div>
              <h4 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                {PROFILE_DATA.education.degree}
              </h4>
              <p className="text-xs text-[#A5A39D]">
                {PROFILE_DATA.education.institution},{' '}
                {PROFILE_DATA.education.university}
              </p>
              <p className="font-mono-tabular text-[11px] text-[#A5A39D]">
                {PROFILE_DATA.education.period} · {PROFILE_DATA.education.location}
              </p>
            </div>
          </div>

          {/* Core Technical Skills */}
          <div className="space-y-4 pt-6 border-t border-white/[0.09]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7]">
                Technical Skills
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToSection('skills');
                }}
                className="text-xs text-[#B9A078] hover:underline"
              >
                Explore 3D Skills Sculpture →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {QUICK_PROFILE_SKILL_GROUPS.map((group) => (
                <div
                  key={group.category}
                  className="p-4 rounded bg-[#1D1E20] border border-white/[0.09] space-y-2.5"
                >
                  <h4 className="font-mono-tabular text-xs font-medium text-[#B9A078]">
                    {group.category}
                  </h4>
                  <ul className="space-y-1.5">
                    {group.items.map((skill) => (
                      <li
                        key={skill}
                        className="text-xs text-[#F1EEE7]/90 leading-snug"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Projects */}
          <div className="space-y-4 pt-6 border-t border-white/[0.09]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B9A078]" />
                <span>Selected Projects (4 Verified)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToSection('projects');
                }}
                className="text-xs text-[#B9A078] hover:underline"
              >
                Open 3D Exhibition Hall →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_INSTALLATIONS.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded bg-[#1D1E20] border border-white/[0.09] hover:border-[#B9A078]/40 transition-colors duration-200 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-tabular text-[11px] text-[#B9A078]">
                        {proj.categoryLabel}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#A5A39D]">
                        {proj.date}
                      </span>
                    </div>
                    <h4 className="font-serif-display text-base font-semibold text-[#F1EEE7]">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-[#A5A39D] leading-relaxed">
                      {proj.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/[0.07]">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="font-mono-tabular text-[11px] px-2 py-0.5 rounded bg-[#171819] text-[#A5A39D] border border-white/[0.06]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProjectCaseStudy(proj.id);
                        }}
                        className="text-xs font-medium text-[#F1EEE7] hover:text-[#B9A078] transition-colors"
                      >
                        Read Case Study →
                      </button>
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#A5A39D] hover:text-[#F1EEE7] transition-colors"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internships & Credentials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-white/[0.09]">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#B9A078]" />
                <span>Internship Experience</span>
              </h3>
              <div className="space-y-3">
                {internships.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded bg-[#1D1E20] border border-white/[0.09] space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                        {item.roleOrTitle} ·{' '}
                        <span className="text-[#B9A078] font-normal">
                          {item.organization}
                        </span>
                      </h4>
                      <span className="font-mono-tabular text-[11px] text-[#A5A39D]">
                        {item.period}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-[#A5A39D] leading-relaxed">
                      {item.highlights.map((hl, i) => (
                        <li key={i}>• {hl}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#B9A078]" />
                <span>Simulations &amp; Certifications</span>
              </h3>
              <div className="space-y-2.5">
                {credentials.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded bg-[#1D1E20] border border-white/[0.09] flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-[#F1EEE7]">
                        {cert.roleOrTitle}
                      </h4>
                      <p className="text-[11px] text-[#A5A39D] mt-0.5">
                        {cert.organization} · {cert.period}
                      </p>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 rounded bg-[#171819] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] hover:border-[#B9A078]/40 transition-colors"
                        title={cert.credentialLabel || 'Verify Credential'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 bg-[#101112] border-t border-white/[0.09] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href={PROFILE_DATA.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A5A39D] hover:text-[#F1EEE7] inline-flex items-center gap-1 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={PROFILE_DATA.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A5A39D] hover:text-[#F1EEE7] inline-flex items-center gap-1 transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={PROFILE_DATA.emailHref}
              className="text-[#A5A39D] hover:text-[#F1EEE7] transition-colors"
            >
              {PROFILE_DATA.email}
            </a>
            <a
              href={PROFILE_DATA.resumePdfUrl}
              download="Anirudh_KN_Resume.pdf"
              className="text-[#B9A078] hover:text-[#F1EEE7] inline-flex items-center gap-1 font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download PDF</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#1D1E20] hover:bg-[#26282B] border border-white/[0.09] text-xs font-medium text-[#F1EEE7] transition-colors duration-200"
          >
            Return to 3D Exhibition
          </button>
        </div>
      </div>
    </div>
  );
};
