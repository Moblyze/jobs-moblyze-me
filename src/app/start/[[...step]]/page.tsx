import { Suspense } from 'react';
import StartPageClient from '../StartPageClient';

/**
 * Optional catch-all route for the claim flow.
 *
 * Matches:
 *   /start              → landing
 *   /start/roles        → 'roles'
 *   /start/certs        → 'certs'
 *   /start/location     → 'location'
 *   /start/resume       → 'resume'
 *   /start/confirmation → 'confirmation'
 *   etc.
 *
 * The step is read client-side via usePathname() in StartPageClient rather
 * than from server-side params, keeping this a plain (non-async) component
 * to avoid streaming issues with the catch-all route.
 */
export function generateStaticParams() {
  return [
    { step: [] },              // /start
    { step: ['roles'] },       // /start/roles
    { step: ['certs'] },       // /start/certs
    { step: ['location'] },    // /start/location
    { step: ['resume'] },      // /start/resume
    { step: ['confirmation'] }, // /start/confirmation
  ];
}

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartPageClient />
    </Suspense>
  );
}
