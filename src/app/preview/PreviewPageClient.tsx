'use client';

import { useSearchParams } from 'next/navigation';
import { JobDetail } from '@/components/job/JobDetail';
import { JobCard } from '@/components/job/JobCard';
import { DEMO_JOBS } from '@/lib/demo-jobs';
import type { PublicJobCard } from '@/types';

const MOCK_JOB_WHITE_LABEL = DEMO_JOBS.get('journeyman-electrician-houston-tx-12345')!;
const MOCK_JOB_DEFAULT = DEMO_JOBS.get('pipefitter-midland-tx-22345')!;

const MOCK_SIMILAR: PublicJobCard[] = [
  {
    id: 'sim-001',
    slug: 'master-electrician-dallas-tx-12346',
    title: 'Master Electrician',
    employerName: 'Gulf Coast Energy Services',
    employerLogoUrl: MOCK_JOB_WHITE_LABEL.employerLogoUrl,
    location: 'Dallas, TX',
    employmentTypeText: 'Full-time',
    payRateText: '$48 - $55/hr',
    startDateText: 'March 10, 2026',
    whiteLabel: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sim-002',
    slug: 'apprentice-electrician-houston-tx-12347',
    title: 'Apprentice Electrician',
    employerName: 'Gulf Coast Energy Services',
    location: 'Houston, TX',
    employmentTypeText: 'Full-time',
    payRateText: '$22 - $28/hr',
    startDateText: 'March 17, 2026',
    whiteLabel: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sim-003',
    slug: 'electrician-foreman-san-antonio-tx-12348',
    title: 'Electrician Foreman',
    employerName: 'Lone Star Industrial',
    location: 'San Antonio, TX',
    employmentTypeText: 'Contract',
    payRateText: '$52 - $60/hr',
    startDateText: 'March 31, 2026',
    whiteLabel: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sim-004',
    slug: 'industrial-electrician-beaumont-tx-12349',
    title: 'Industrial Electrician — Refinery',
    employerName: 'PetroStaff Solutions',
    location: 'Beaumont, TX',
    employmentTypeText: 'Full-time',
    payRateText: '$42 - $50/hr + per diem',
    startDateText: 'April 14, 2026',
    whiteLabel: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Preview page for internal sharing.
 *
 * URL parameters:
 *   /preview                        → branded (white-label) view (default)
 *   /preview?mode=standard          → standard (non-branded) view
 *   /preview?returning=true         → simulate returning user in apply flow
 */
export default function PreviewPageClient() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') ?? undefined;
  const returning = searchParams.get('returning') ?? undefined;

  const activeJob = mode === 'standard' ? MOCK_JOB_DEFAULT : MOCK_JOB_WHITE_LABEL;
  const demoReturning = returning === 'true';

  return (
    <>
      <JobDetail job={activeJob} demo demoReturning={demoReturning} />

      {/* Similar Jobs */}
      <div className="max-w-2xl mx-auto px-5 pb-32 pt-2">
        <h2 className="text-lg font-semibold mb-4">Similar Jobs</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOCK_SIMILAR.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </>
  );
}
