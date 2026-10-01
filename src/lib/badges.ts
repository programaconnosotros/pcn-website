import {
  Award,
  BookOpen,
  Bug,
  Code,
  Coffee,
  Crown,
  Flame,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Lightbulb,
  Medal,
  Megaphone,
  Mic,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Íconos que un admin puede elegir para un badge custom.
export const BADGE_ICONS = {
  award: Award,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  star: Star,
  gem: Gem,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  sparkles: Sparkles,
  heart: Heart,
  shield: Shield,
  target: Target,
  lightbulb: Lightbulb,
  code: Code,
  terminal: Terminal,
  bug: Bug,
  mic: Mic,
  megaphone: Megaphone,
  users: Users,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  coffee: Coffee,
  gift: Gift,
} satisfies Record<string, LucideIcon>;

export type BadgeIcon = keyof typeof BADGE_ICONS;

// Acabados del badge: un metal con su brillo y su resplandor.
export const BADGE_TONES = {
  green: { label: 'pcn', light: '#7dffe0', base: '#04f4be', dark: '#035c48', glow: '4,244,190' },
  gold: { label: 'oro', light: '#fff1b8', base: '#f5c542', dark: '#7a5208', glow: '245,197,66' },
  purple: {
    label: 'violeta',
    light: '#ddd6ff',
    base: '#8b7cf0',
    dark: '#2c1d7a',
    glow: '139,124,240',
  },
  cyan: { label: 'cian', light: '#d2f4ff', base: '#38c8f5', dark: '#0b4a63', glow: '56,200,245' },
  red: { label: 'rojo', light: '#ffd0d0', base: '#ff5a5a', dark: '#6e1010', glow: '255,90,90' },
  silver: {
    label: 'plata',
    light: '#ffffff',
    base: '#c3c9d4',
    dark: '#4b5160',
    glow: '210,216,228',
  },
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export const isBadgeIcon = (value: string): value is BadgeIcon => value in BADGE_ICONS;
export const isBadgeTone = (value: string): value is BadgeTone => value in BADGE_TONES;

/** A badge as the UI draws it, whether built-in (ambassador, co-founder) or custom. */
export type DisplayBadge = {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
  tone: BadgeTone;
  awardedAt?: Date | null;
};

export const AMBASSADOR_BADGE: DisplayBadge = {
  id: 'ambassador',
  name: 'PCN Ambassador',
  description: 'Organiza actividades e iniciativas y hace que las cosas pasen en la comunidad.',
  icon: 'award',
  tone: 'green',
};
