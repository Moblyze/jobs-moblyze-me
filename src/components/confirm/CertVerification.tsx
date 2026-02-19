'use client';

import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Placeholder certifications shown in the verify UI.
 *
 * TODO: In a future phase, pull these from the candidate's actual
 * profile/wizard state — certs claimed during onboarding or
 * extracted from uploaded CV.
 */
const PLACEHOLDER_CERTS = [
  { id: '1', name: 'Red Seal Electrician' },
  { id: '2', name: 'WHMIS 2015' },
  { id: '3', name: 'H2S Alive' },
];

/**
 * Deferred cert verification UI.
 *
 * Shows claimed certifications with an "Unverified" badge and
 * disabled "Verify" buttons. Verification is not yet wired to
 * the API — this is a placeholder to set expectations and
 * collect interest for the feature.
 *
 * TODO: Wire "Verify" buttons to uploadCertVerification mutation
 * once that API endpoint exists on the backend.
 *
 * Audience: skilled trades workers who expect plain, direct language.
 */
export function CertVerification() {
  // Only render when there are certs to show
  // TODO: Replace placeholder with real candidate cert data from wizard state or API
  const certs = PLACEHOLDER_CERTS;

  if (certs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" />
          Verify Your Tickets
        </CardTitle>
        <CardDescription>
          Verified tickets increase your chances of getting called. We&apos;ll let you
          know when verification is available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {certs.map((cert) => (
            <li
              key={cert.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">{cert.name}</span>
                <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">
                  Unverified
                </Badge>
              </div>

              {/* Disabled verify button — coming soon tooltip */}
              <div
                className="shrink-0"
                title="Verification coming soon"
                aria-label="Verification coming soon"
              >
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  aria-disabled="true"
                >
                  Verify
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-muted-foreground">
          Upload a photo of your ticket to verify. This feature is coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
