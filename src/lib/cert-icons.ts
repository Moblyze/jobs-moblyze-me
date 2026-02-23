import {
  ShieldCheck,
  HardHat,
  Flame,
  Zap,
  Heart,
  Box,
  AlertTriangle,
  Droplet,
  Truck,
  UserCheck,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Map certification name keywords to Lucide icons.
 * First match wins — order matters for overlapping keywords.
 */
export const ICON_RULES: [RegExp, LucideIcon][] = [
  [/osha|safety/i, HardHat],
  [/h2s|gas/i, Flame],
  [/electri/i, Zap],
  [/weld/i, Flame],
  [/first aid|cpr/i, Heart],
  [/confined\s*space/i, Box],
  [/fall\s*protection/i, AlertTriangle],
  [/whmis|chemical/i, Droplet],
  [/cdl|driv/i, Truck],
  [/twic/i, UserCheck],
  [/red\s*seal|journeyman|master/i, Award],
];

export function getIconForCert(name: string): LucideIcon {
  for (const [pattern, icon] of ICON_RULES) {
    if (pattern.test(name)) return icon;
  }
  return ShieldCheck;
}
