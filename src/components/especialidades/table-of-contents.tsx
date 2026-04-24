'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Globe,
  Server,
  Layers,
  Smartphone,
  Smartphone as AndroidIcon,
  Tablet,
  Cloud,
  BarChart3,
  Brain,
  Shield,
  Gamepad2,
  TestTube,
  Coins,
  Palette,
  Network,
  ClipboardList,
  UserCog,
  Briefcase,
  Building2,
  type LucideIcon,
} from 'lucide-react';

const sections: { id: string; title: string; icon: LucideIcon }[] = [
  { id: 'web-frontend', title: 'Web Frontend Development', icon: Globe },
  { id: 'backend', title: 'Backend Development', icon: Server },
  { id: 'fullstack', title: 'Full Stack Development', icon: Layers },
  { id: 'ios-mobile', title: 'iOS Mobile Development', icon: Smartphone },
  { id: 'android-mobile', title: 'Android Mobile Development', icon: AndroidIcon },
  { id: 'mobile-development', title: 'Mobile Development (Cross-Platform)', icon: Tablet },
  { id: 'devops', title: 'DevOps & Cloud Engineering', icon: Cloud },
  { id: 'data-science', title: 'Data Science & Analytics', icon: BarChart3 },
  { id: 'machine-learning', title: 'Machine Learning & AI', icon: Brain },
  { id: 'cybersecurity', title: 'Cybersecurity', icon: Shield },
  { id: 'game-dev', title: 'Game Development', icon: Gamepad2 },
  { id: 'qa', title: 'QA & Testing', icon: TestTube },
  { id: 'blockchain', title: 'Blockchain & Web3', icon: Coins },
  { id: 'ui-ux-design', title: 'UI/UX Design', icon: Palette },
  { id: 'networking', title: 'Networking & Infrastructure', icon: Network },
  { id: 'project-management', title: 'Project Management', icon: ClipboardList },
  { id: 'tech-lead', title: 'Tech Lead', icon: UserCog },
  { id: 'engineering-management', title: 'Engineering Management', icon: Briefcase },
  { id: 'software-architect', title: 'Software Architect', icon: Building2 },
];

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Check for hash in URL on mount
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash && sections.some((s) => s.id === hash)) {
        setActiveSection(hash);
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);

      // Clear scrolling flag after scroll ends
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Reference point: 150px from top of viewport (accounts for header)
      const referencePoint = 150;
      let bestSection = '';
      let bestScore = -Infinity;

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const sectionTop = rect.top;
          const sectionBottom = rect.bottom;
          const sectionHeight = rect.height;

          // Calculate how much of the section is above the reference point
          const visibleAbove = Math.max(0, referencePoint - sectionTop);
          const visibleBelow = Math.max(0, sectionBottom - referencePoint);
          const totalVisible = Math.min(visibleAbove + visibleBelow, sectionHeight);

          // Score based on visibility and position
          // Higher score for sections that are well-positioned at the reference point
          let score = 0;

          if (sectionTop <= referencePoint && sectionBottom >= referencePoint) {
            // Section spans the reference point - this is ideal
            const distanceFromTop = referencePoint - sectionTop;
            score = 1000 + (sectionHeight - distanceFromTop);
          } else if (sectionTop > referencePoint && sectionTop < referencePoint + 100) {
            // Section is just below reference point
            score = 500 - (sectionTop - referencePoint);
          } else if (sectionBottom < referencePoint && sectionBottom > referencePoint - 100) {
            // Section is just above reference point
            score = 300 - (referencePoint - sectionBottom);
          }

          // Bonus for sections that are more visible
          score += totalVisible * 0.1;

          if (score > bestScore) {
            bestScore = score;
            bestSection = section.id;
          }
        }
      });

      if (bestSection) {
        setActiveSection(bestSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 overflow-y-auto pr-4 lg:block">
      <div className="space-y-2">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contenido
        </h3>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section.id);
              const element = document.getElementById(section.id);
              if (element) {
                // Update URL hash
                window.history.pushState(null, '', `#${section.id}`);
                // Scroll to element with proper offset
                const yOffset = -150; // Account for header
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              activeSection === section.id
                ? 'bg-pcnPurple/10 font-medium text-pcnPurple dark:bg-pcnGreen/10 dark:text-pcnGreen'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <section.icon className="h-4 w-4 shrink-0" />
            <span>{section.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
