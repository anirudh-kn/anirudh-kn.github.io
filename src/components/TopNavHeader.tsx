import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Code2,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Mail,
  Menu,
  UserCheck,
  X,
} from 'lucide-react';
import {
  DestinationId,
  PROFILE_DATA,
  SPATIAL_DESTINATIONS,
} from '../data/portfolioData';

interface TopNavHeaderProps {
  activeDestination: DestinationId;
  scrollProgress: number;
  onSelectDestination: (id: DestinationId) => void;
  onOpenQuickProfile: () => void;
}

export const TopNavHeader: React.FC<TopNavHeaderProps> = ({
  activeDestination,
  scrollProgress,
  onSelectDestination,
  onOpenQuickProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: DestinationId) => {
    onSelectDestination(id);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#101112]/88 backdrop-blur-xl border-b border-white/[0.09] transition-colors duration-200">
      {/* Subtle 1px Top Progress Hairline */}
      <div className="h-[1px] w-full bg-white/[0.05] overflow-hidden">
        <div
          className="h-full bg-[#B9A078] transition-all duration-200"
          style={{
            width: `${Math.max(6, Math.min(100, scrollProgress * 100))}%`,
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-label="Return to Home studio"
          className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded bg-[#171819] border border-white/[0.09] flex items-center justify-center group-hover:border-[#B9A078]/60 transition-colors duration-200">
            <Compass className="w-4 h-4 text-[#B9A078]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-display text-sm sm:text-[15px] font-semibold tracking-tight text-[#F1EEE7]">
                Anirudh K N
              </span>
              <span className="hidden xl:inline-block font-mono-tabular text-[11px] text-[#A5A39D]">
                · The Data Atelier
              </span>
            </div>
            <p className="text-[11px] text-[#A5A39D] hidden sm:block leading-tight">
              Data Science, Analytics &amp; AI/ML
            </p>
          </div>
        </button>

        {/* Desktop Spatial Navigation */}
        <nav
          aria-label="Spatial Exhibition Navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {SPATIAL_DESTINATIONS.map((item) => {
            const isActive = activeDestination === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 flex items-center gap-2 rounded ${
                  isActive
                    ? 'text-[#F1EEE7] bg-[#1D1E20]'
                    : 'text-[#A5A39D] hover:text-[#F1EEE7] hover:bg-[#171819]/70'
                }`}
              >
                <span
                  className={`font-mono-tabular text-[11px] ${
                    isActive ? 'text-[#B9A078]' : 'text-[#A5A39D]/70'
                  }`}
                >
                  0{item.index + 1}
                </span>
                <span>{item.sectionTitle}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[1.5px] bg-[#B9A078]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Utility Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickProfile}
            aria-label="Open Recruiter Quick Profile"
            className="px-3.5 py-2 rounded bg-[#171819] hover:bg-[#1D1E20] border border-white/[0.09] hover:border-[#B9A078]/40 text-[#F1EEE7] text-xs font-medium transition-all duration-200 flex items-center gap-2"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#B9A078]" />
            <span>Quick Profile</span>
          </button>

          <a
            href={PROFILE_DATA.resumePdfUrl}
            download="Anirudh_KN_Resume.pdf"
            aria-label="Download Resume PDF"
            className="px-3.5 py-2 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Resume</span>
          </a>
        </div>

        {/* Mobile Actions + Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickProfile}
            aria-label="Open Recruiter Quick Profile"
            className="px-2.5 py-1.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#B9A078]" />
            <span className="hidden xs:inline">Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-[#F1EEE7] bg-[#171819] border border-white/[0.09] rounded hover:border-[#B9A078]/50 transition-colors duration-200"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101112]/98 backdrop-blur-2xl border-b border-white/[0.09] px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {SPATIAL_DESTINATIONS.map((item) => {
              const isActive = activeDestination === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded border text-left transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#1D1E20] border-[#B9A078]/50 text-[#F1EEE7]'
                      : 'bg-[#171819] border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7]'
                  }`}
                >
                  <div>
                    <span className="font-mono-tabular text-[10px] text-[#B9A078] block">
                      0{item.index + 1}
                    </span>
                    <span className="text-xs font-medium text-[#F1EEE7] block mt-0.5">
                      {item.sectionTitle}
                    </span>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Actions */}
          <div className="pt-3 border-t border-white/[0.09] grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('projects')}
              className="px-3 py-2.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>Projects</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('skills')}
              className="px-3 py-2.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-2"
            >
              <Code2 className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>Skills</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('experience')}
              className="px-3 py-2.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-2"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>Experience</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="px-3 py-2.5 rounded bg-[#171819] border border-white/[0.09] text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-[#B9A078]" />
              <span>Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={PROFILE_DATA.resumePdfUrl}
              download="Anirudh_KN_Resume.pdf"
              className="col-span-2 px-3.5 py-2.5 rounded bg-[#B9A078] hover:bg-[#c6ae87] text-[#101112] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Resume</span>
            </a>
            <a
              href={PROFILE_DATA.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-[#171819] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={PROFILE_DATA.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-[#171819] border border-white/[0.09] text-[#A5A39D] hover:text-[#F1EEE7] text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
