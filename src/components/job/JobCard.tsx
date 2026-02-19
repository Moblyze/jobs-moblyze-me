import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PublicJobCard } from '@/types';

interface JobCardProps {
  job: PublicJobCard;
}

/**
 * Server Component — compact job card for listing and similar-jobs views.
 * Links to /jobs/{slug}.
 */
export function JobCard({ job }: JobCardProps) {
  const postedAgo = formatDistanceToNow(new Date(job.createdAt), {
    addSuffix: true,
  });

  return (
    <Link href={`/jobs/${job.slug}`} className="block group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="p-4">
          <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{job.employerName}</p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{job.location}</span>
              </div>
            )}
            {job.employmentTypeText && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{job.employmentTypeText}</span>
              </div>
            )}
            {job.payRateText && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 shrink-0" />
                <span>{job.payRateText}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {job.employmentTypeText ?? 'Full-time'}
            </Badge>
            <span className="text-xs text-muted-foreground">{postedAgo}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
