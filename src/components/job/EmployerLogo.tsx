import { cn } from '@/lib/utils';

interface EmployerLogoProps {
  logoUrl?: string | null;
  employerName: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-14 w-14 text-xl',
} as const;

/**
 * Deterministic background color from employer name.
 * Returns a muted teal/slate palette that pairs well with Moblyze branding.
 */
const FALLBACK_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-slate-100 text-slate-700',
  'bg-cyan-100 text-cyan-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-stone-100 text-stone-700',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

/**
 * Employer logo with initial-letter fallback.
 * Used in JobDetail header and JobCard list items.
 */
export function EmployerLogo({ logoUrl, employerName, size = 'md' }: EmployerLogoProps) {
  const sizeClass = SIZE_MAP[size];
  const initial = employerName.charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <div className={cn('shrink-0 rounded-lg border border-border overflow-hidden', sizeClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${employerName} logo`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'shrink-0 rounded-lg flex items-center justify-center font-semibold',
        sizeClass,
        getColorFromName(employerName),
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
