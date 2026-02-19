import { getApolloClient } from '@/lib/apollo-client';
import { SIMILAR_JOBS_QUERY } from '@/lib/graphql/queries';
import type { PublicJobCard } from '@/types';
import { JobCard } from './JobCard';

interface SimilarJobsProps {
  jobId: string;
}

/**
 * Server Component — fetches and renders similar job recommendations.
 * No 'use client' — data fetched server-side at render time.
 *
 * Two-tier logic is handled server-side (API ring-fence check):
 *   tier 1: same employer
 *   tier 2: cross-employer (blocked when employer is ring-fenced)
 */
export async function SimilarJobs({ jobId }: SimilarJobsProps) {
  const client = getApolloClient();
  const { data } = await client.query<{ similarJobs: PublicJobCard[] }>({
    query: SIMILAR_JOBS_QUERY,
    variables: { jobId, limit: 6 },
  });

  const jobs = data?.similarJobs ?? [];

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Similar Jobs</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
