import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Calendar, Building2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { PublicJob } from '@/types';

interface JobDetailProps {
  job: PublicJob;
}

/**
 * Server Component — no 'use client'.
 * Displays full job detail with mobile-first layout and sticky Apply CTA.
 */
export function JobDetail({ job }: JobDetailProps) {
  const postedAgo = formatDistanceToNow(new Date(job.createdAt), {
    addSuffix: true,
  });

  const applyHref = `/apply/${job.id}?slug=${job.slug}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Employer logo if available */}
          {job.employerLogoUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.employerLogoUrl}
                alt={`${job.employerName} logo`}
                className="h-12 w-auto object-contain"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>

          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{job.employerName}</span>
          </div>

          {/* Meta row */}
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
            {job.startDateText && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Starts {job.startDateText}</span>
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

          <p className="mt-4 text-xs text-muted-foreground">Posted {postedAgo}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Requirements */}
        {job.requirementsDescription && (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">Requirements</h2>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div
                className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
                dangerouslySetInnerHTML={{ __html: job.requirementsDescription }}
              />
            </CardContent>
          </Card>
        )}

        {/* Responsibilities */}
        {job.responsibilitiesDescription && (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">Responsibilities</h2>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div
                className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
                dangerouslySetInnerHTML={{
                  __html: job.responsibilitiesDescription,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Other / Additional info */}
        {job.otherDescription && (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div
                className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
                dangerouslySetInnerHTML={{ __html: job.otherDescription }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky bottom Apply CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground truncate">{job.employerName}</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href={applyHref}>Apply Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
