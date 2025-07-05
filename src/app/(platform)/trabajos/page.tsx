'use server';

import { JobsWrapper } from '@/components/jobs/jobs-wrapper';
import { fetchJobs } from '@/actions/jobs/get-jobs';

export default async function JobBoardPage() {
  const initialJobs = await fetchJobs();

  return <JobsWrapper initialJobs={initialJobs} totalJobs={initialJobs.length} />;
}
