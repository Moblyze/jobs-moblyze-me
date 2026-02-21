import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getApolloClient } from '@/lib/apollo-client';
import { PUBLIC_JOB_QUERY } from '@/lib/graphql/queries';
import { DEMO_JOBS, isDemoSlug } from '@/lib/demo-jobs';
import type { PublicJob } from '@/types';
import { JobDetail } from '@/components/job/JobDetail';
import { SimilarJobs } from '@/components/job/SimilarJobs';
import { AttributionCapture } from '@/components/job/AttributionCapture';

/**
 * Pre-render all demo job slugs for static export.
 */
export function generateStaticParams() {
  return Array.from(DEMO_JOBS.keys()).map((slug) => ({ slug }));
}

/**
 * Memoize job fetch so generateMetadata and the page component
 * share a single network request per render.
 */
const getJob = cache(async (slug: string): Promise<PublicJob | null> => {
  // Demo jobs resolve from static data — no API call needed
  if (isDemoSlug(slug)) {
    return DEMO_JOBS.get(slug) ?? null;
  }

  const client = getApolloClient();
  const { data } = await client.query<{ publicJob: PublicJob | null }>({
    query: PUBLIC_JOB_QUERY,
    variables: { slug },
  });
  return data?.publicJob ?? null;
});

/**
 * Dynamic metadata for SEO.
 * Note: params is a Promise in Next.js 15.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return {
      title: 'Job Not Found | Moblyze Jobs',
    };
  }

  const description = (job.requirementsDescription ?? '')
    .replace(/<[^>]+>/g, '')
    .slice(0, 160);

  return {
    title: `${job.title} at ${job.employerName} | Moblyze Jobs`,
    description,
    openGraph: {
      title: `${job.title} at ${job.employerName}`,
      description,
      type: 'website',
      url: `https://jobs.moblyze.me/jobs/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} at ${job.employerName}`,
      description,
    },
  };
}

/**
 * Job detail page — SSR React Server Component.
 * Embeds schema.org JobPosting JSON-LD for Google indexing.
 */
export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.requirementsDescription ?? job.responsibilitiesDescription ?? '',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employerName,
      ...(job.employerLogoUrl ? { logo: job.employerLogoUrl } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: job.location,
    },
    employmentType: job.employmentTypeText ?? undefined,
    datePosted: job.createdAt,
    baseSalary: job.payRateText
      ? {
          '@type': 'MonetaryAmount',
          description: job.payRateText,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <AttributionCapture />
      </Suspense>
      <JobDetail job={job} demo={isDemoSlug(slug)} />
      {!isDemoSlug(slug) && (
        <Suspense fallback={null}>
          <SimilarJobs jobId={job.id} />
        </Suspense>
      )}
    </>
  );
}
