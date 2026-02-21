import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmployerLogo } from './EmployerLogo';
import { RequiredCerts } from './RequiredCerts';
import { StartDateCallout } from './StartDateCallout';
import type { PublicJob } from '@/types';

interface JobDetailProps {
  job: PublicJob;
  /** When true, append &demo=true to apply link so the wizard skips real API calls */
  demo?: boolean;
  /** When true in demo mode, simulate a returning user with pre-selected roles */
  demoReturning?: boolean;
}

/**
 * Server Component — no 'use client'.
 * Displays full job detail with mobile-first layout and sticky Apply CTA.
 * Supports whiteLabel mode for employer-branded layouts.
 */
export function JobDetail({ job, demo, demoReturning }: JobDetailProps) {
  const postedAgo = formatDistanceToNow(new Date(job.createdAt), {
    addSuffix: true,
  });

  const isWhiteLabel = job.whiteLabel === true;
  const applyHref = `/apply/${job.id}?slug=${job.slug}${demo ? '&demo=true' : ''}${demoReturning ? '&returning=true' : ''}${isWhiteLabel ? '&whiteLabel=true' : ''}${job.clientOrganizationId ? `&employerId=${encodeURIComponent(job.clientOrganizationId)}` : ''}`;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Teal accent bar */}
      <div className="h-1 bg-primary" />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-8">
        {/* Employer identity — layout varies by whiteLabel */}
        {isWhiteLabel ? (
          <div className="flex items-center gap-3 mb-4">
            <EmployerLogo
              logoUrl={job.employerLogoUrl}
              employerName={job.employerName}
              size="md"
            />
            <span className="font-medium text-foreground">{job.employerName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{job.employerName}</span>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>

        {/* Meta chips row (no start date — it gets its own callout) */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{job.location}</span>
            </div>
          )}
          {job.employmentTypeText && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{job.employmentTypeText}</span>
            </div>
          )}
          {job.payRateText && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{job.payRateText}</span>
            </div>
          )}
        </div>

        {/* Role badges */}
        {job.roles && job.roles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Start date callout with availability toggle */}
        {job.startDateText && (
          <StartDateCallout startDateText={job.startDateText} />
        )}

        <p className="mt-4 text-xs text-muted-foreground">Posted {postedAgo}</p>
      </div>

      {/* Body — flat sections */}
      <div className="max-w-2xl mx-auto px-5 space-y-8">
        {/* Required Certifications — above requirements for prominence */}
        {job.requiredCertifications && job.requiredCertifications.length > 0 && (
          <RequiredCerts certifications={job.requiredCertifications} />
        )}

        {/* Requirements */}
        {job.requirementsDescription && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Additional Requirements</h2>
            <div
              className="prose prose-base max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2 [&_li]:leading-relaxed [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.requirementsDescription }}
            />
          </section>
        )}

        {/* Responsibilities */}
        {job.responsibilitiesDescription && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Responsibilities</h2>
            <div
              className="prose prose-base max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2 [&_li]:leading-relaxed [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: job.responsibilitiesDescription,
              }}
            />
          </section>
        )}

        {/* Other / Additional info */}
        {job.otherDescription && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
            <div
              className="prose prose-base max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2 [&_li]:leading-relaxed [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.otherDescription }}
            />
          </section>
        )}
      </div>

      {/* Sticky bottom Apply CTA */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-2xl mx-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-3">
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground truncate">{job.employerName}</p>
          </div>
          <Button asChild size="lg" className="shrink-0 w-full sm:w-auto h-12 text-base">
            <Link href={applyHref}>Apply Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
