import type { MetadataRoute } from 'next';
import { getApolloClient } from '@/lib/apollo-client';
import { PUBLIC_JOBS_QUERY } from '@/lib/graphql/queries';
import type { PublicJobCard } from '@/types';

const BASE_URL = 'https://jobs.moblyze.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Dynamic job pages
  try {
    const client = getApolloClient();
    const { data } = await client.query<{ publicJobs: PublicJobCard[] }>({
      query: PUBLIC_JOBS_QUERY,
      variables: { limit: 100, offset: 0 },
    });

    const jobRoutes: MetadataRoute.Sitemap = (data?.publicJobs ?? []).map((job) => ({
      url: `${BASE_URL}/jobs/${job.slug}`,
      lastModified: new Date(job.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...jobRoutes];
  } catch {
    // If the API is unavailable, return static routes only
    return staticRoutes;
  }
}
