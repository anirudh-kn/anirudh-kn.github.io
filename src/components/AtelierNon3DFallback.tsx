import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Compass,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  Maximize2,
  Phone,
} from 'lucide-react';
import {
  PROFILE_DATA,
  PROJECT_INSTALLATIONS,
  ProjectInstallation,
  SKILL_CATEGORIES,
  TIMELINE_ENTRIES,
} from '../data/portfolioData';
import { ProjectCaseStudyModal } from './ProjectCaseStudyModal';
import { FullscreenImageViewer } from './FullscreenImageViewer';
import { QuickProfileModal } from './QuickProfileModal';

interface AtelierNon3DFallbackProps {
  reason?: string;
  onRetry3D?: () => void;
}

export const AtelierNon3DFallback: React.FC<AtelierNon3DFallbackProps> = ({
  reason,
  onRetry3D,
}) => {
  const [quickProfileOpen, setQuickProfileOpen] = useState(false);
  const [caseStudyProject, setCaseStudyProject] =
    useState<ProjectInstallation | null>(null);
  const [fullscreenShot, setFullscreenShot] = useState<{
    project: ProjectInstallation;
    index: number;
  } | null>(null);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`fallback-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#101112] text-[#F1EEE7] selection:bg-[#B9A078]/25">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#101112]/90 backdrop-blur-xl border-b border-white/[0.09]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#171819] border border-white/[0.09] flex items-center justify-center">
              <Compass className="w-4 h-4 text-[#B9A078]" />
            </div>
            <div>
              <span className="font-serif-display text-sm font-semibold text-[#F1EEE7] block">
                {PROFILE_DATA.displayName} · {PROFILE_DATA.atelierTitle}
              </span>
              <span className="font-mono-tabular text-[11px] text-[#A5A39D] block">
                Editorial Portfolio Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setQuickProfileOpen(true)}
              className="px-3.5 py-2 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] text-xs font-medium text-[#F1EEE7] transition-colors"
            >
              Quick Profile
            </button>
            <a
              href={PROFILE_DATA.resumePdfUrl}
              download="Anirudh_KN_Resume.pdf"
              className="px-3.5 py-2 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Resume</span>
            </a>
            {onRetry3D && (
              <button
                type="button"
                onClick={onRetry3D}
                className="hidden sm:inline-flex px-3 py-2 rounded bg-[#171819] border border-white/[0.09] text-xs text-[#A5A39D] hover:text-[#F1EEE7]"
              >
                Retry 3D
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section
          id="fallback-home"
          className="p-8 sm:p-12 rounded-lg bg-[#171819] border border-white/[0.09] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-8 space-y-5">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              {PROFILE_DATA.atelierTitle} — {PROFILE_DATA.atelierTagline}
            </p>
            <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#F1EEE7] tracking-tight">
              {PROFILE_DATA.displayName}
            </h1>
            <p className="text-base sm:text-lg text-[#B9A078] font-medium">
              {PROFILE_DATA.heroSubtitle}
            </p>
            <p className="text-sm sm:text-base text-[#A5A39D] leading-relaxed max-w-2xl">
              {PROFILE_DATA.summary}
            </p>
            {reason && (
              <p className="font-mono-tabular text-[11px] text-[#A5A39D]">
                Note: Presenting accessible editorial view ({reason})
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('projects')}
                className="px-5 py-2.5 rounded bg-[#B9A078] text-[#101112] text-xs font-semibold"
              >
                Explore Projects
              </button>
              <a
                href={PROFILE_DATA.resumePdfUrl}
                download="Anirudh_KN_Resume.pdf"
                className="px-5 py-2.5 rounded bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#B9A078]" />
                <span>Download Resume</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="w-56 sm:w-64 rounded-lg bg-[#1D1E20] border border-white/[0.09] p-4 text-center space-y-3">
              <img
                src={PROFILE_DATA.portraitImageUrl}
                alt={PROFILE_DATA.displayName}
                className="w-full h-64 object-contain rounded bg-[#101112]"
              />
              <div>
                <p className="font-serif-display text-sm font-semibold text-[#F1EEE7]">
                  {PROFILE_DATA.education.degree}
                </p>
                <p className="font-mono-tabular text-xs text-[#B9A078]">
                  CGPA {PROFILE_DATA.education.cgpa} / 10
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="fallback-projects" className="space-y-6">
          <div className="space-y-1">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              04 · Selected Works
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F1EEE7]">
              Project Exhibitions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECT_INSTALLATIONS.map((proj) => {
              const primaryShot = proj.screenshots[0];
              return (
                <article
                  key={proj.id}
                  className="rounded-lg bg-[#171819] border border-white/[0.09] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {primaryShot && (
                      <button
                        type="button"
                        onClick={() =>
                          setFullscreenShot({ project: proj, index: 0 })
                        }
                        className="relative w-full bg-[#101112] p-4 border-b border-white/[0.09] group text-left"
                      >
                        <img
                          src={primaryShot.url}
                          alt={primaryShot.title}
                          className="w-full h-52 object-contain rounded"
                        />
                        <span className="absolute top-6 right-6 px-2.5 py-1 rounded bg-[#101112]/90 border border-white/[0.12] text-[11px] text-[#F1EEE7] inline-flex items-center gap-1.5">
                          <Maximize2 className="w-3 h-3 text-[#B9A078]" />
                          <span>Fullscreen</span>
                        </span>
                      </button>
                    )}

                    <div className="p-6 space-y-3">
                      <span className="font-mono-tabular text-xs text-[#B9A078]">
                        {proj.categoryLabel} · {proj.date}
                      </span>
                      <h3 className="font-serif-display text-xl font-semibold text-[#F1EEE7]">
                        {proj.title}
                      </h3>
                      <p className="text-sm text-[#A5A39D] leading-relaxed">
                        {proj.shortDescription}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="font-mono-tabular text-[11px] px-2.5 py-0.5 rounded bg-[#1D1E20] border border-white/[0.08] text-[#F1EEE7]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#1D1E20] border-t border-white/[0.09] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCaseStudyProject(proj)}
                      className="text-xs font-semibold text-[#B9A078] hover:underline inline-flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Full Case Study</span>
                    </button>
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#A5A39D] hover:text-[#F1EEE7] inline-flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Skills Section */}
        <section id="fallback-skills" className="space-y-6">
          <div className="space-y-1">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              03 · Technical Capabilities
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F1EEE7]">
              Skills &amp; Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-6 rounded-lg bg-[#171819] border border-white/[0.09] space-y-3"
              >
                <span className="font-mono-tabular text-xs text-[#B9A078]">
                  Category {cat.code}
                </span>
                <h3 className="font-serif-display text-lg font-semibold text-[#F1EEE7]">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#A5A39D] leading-relaxed">
                  {cat.description}
                </p>
                <ul className="space-y-2 pt-2 border-t border-white/[0.08]">
                  {cat.skills.map((s) => (
                    <li key={s.name} className="text-xs">
                      <span className="font-medium text-[#F1EEE7] block">
                        {s.name}
                      </span>
                      <span className="text-[#A5A39D]">{s.context}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience & Credentials */}
        <section id="fallback-experience" className="space-y-6">
          <div className="space-y-1">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              05 · Career &amp; Credentials
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F1EEE7]">
              Internships, Education &amp; Certifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIMELINE_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-lg bg-[#171819] border border-white/[0.09] space-y-2"
              >
                <div className="flex items-center justify-between gap-2 font-mono-tabular text-xs text-[#B9A078]">
                  <span className="inline-flex items-center gap-1.5">
                    {entry.type === 'internship' && (
                      <Briefcase className="w-3.5 h-3.5" />
                    )}
                    {entry.type === 'education' && (
                      <GraduationCap className="w-3.5 h-3.5" />
                    )}
                    {(entry.type === 'forage' ||
                      entry.type === 'certification') && (
                      <Award className="w-3.5 h-3.5" />
                    )}
                    <span className="capitalize">{entry.type}</span>
                  </span>
                  <span className="text-[#A5A39D]">{entry.period}</span>
                </div>
                <h3 className="font-serif-display text-base font-semibold text-[#F1EEE7]">
                  {entry.roleOrTitle}
                </h3>
                <p className="text-xs text-[#A5A39D]">
                  {entry.organization} · {entry.location}
                </p>
                <ul className="space-y-1 text-xs text-[#A5A39D] pt-1">
                  {entry.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="fallback-contact"
          className="p-8 rounded-lg bg-[#171819] border border-white/[0.09] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <p className="font-mono-tabular text-xs text-[#B9A078]">
              06 · Direct Connection
            </p>
            <h2 className="font-serif-display text-2xl font-semibold text-[#F1EEE7]">
              Connect with {PROFILE_DATA.displayName}
            </h2>
            <p className="text-sm text-[#A5A39D]">
              Available for Data Analyst, Business Intelligence, Data Science,
              and AI/ML roles.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={PROFILE_DATA.emailHref}
              className="px-4 py-2.5 rounded bg-[#B9A078] text-[#101112] text-xs font-semibold inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{PROFILE_DATA.email}</span>
            </a>
            <a
              href={PROFILE_DATA.phoneHref}
              className="px-4 py-2.5 rounded bg-[#1D1E20] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>{PROFILE_DATA.phone}</span>
            </a>
            <a
              href={PROFILE_DATA.resumePdfUrl}
              download="Anirudh_KN_Resume.pdf"
              className="px-4 py-2.5 rounded bg-[#1D1E20] border border-[#B9A078]/40 text-[#F1EEE7] text-xs font-semibold inline-flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>Download Resume</span>
            </a>
          </div>
        </section>
      </main>

      <QuickProfileModal
        isOpen={quickProfileOpen}
        onClose={() => setQuickProfileOpen(false)}
        onNavigateToSection={(dest) => scrollToSection(dest)}
        onSelectProjectCaseStudy={(projId) => {
          const found = PROJECT_INSTALLATIONS.find((p) => p.id === projId);
          if (found) setCaseStudyProject(found);
        }}
      />

      <ProjectCaseStudyModal
        project={caseStudyProject}
        onClose={() => setCaseStudyProject(null)}
        onOpenFullscreenImage={(idx) => {
          if (caseStudyProject) {
            setFullscreenShot({ project: caseStudyProject, index: idx });
          }
        }}
      />

      {fullscreenShot && (
        <FullscreenImageViewer
          projectTitle={fullscreenShot.project.title}
          githubUrl={fullscreenShot.project.githubUrl}
          screenshots={fullscreenShot.project.screenshots}
          activeIndex={fullscreenShot.index}
          onChangeIndex={(newIdx) =>
            setFullscreenShot((prev) =>
              prev ? { ...prev, index: newIdx } : null,
            )
          }
          onClose={() => setFullscreenShot(null)}
        />
      )}
    </div>
  );
};
