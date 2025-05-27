'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Search, XCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Texts for future i18n
const TEXTS = {
  pageTitle: 'Ofertas de Trabajo',
  pageDescription: 'Explore {count} available positions',
  searchPlaceholder: 'Search jobs, companies or keywords...',
  showingResults: 'Showing {filtered} of {total} jobs',
  noJobsTitle: 'No jobs found',
  noJobsDescription: 'Try adjusting your search',
  resetSearch: 'Reset search',
  applyNow: 'Apply now',
  positionFilled: 'Position filled',
  notAvailable: 'Not available',
};

// Mock job data
type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
  available: boolean;
};

const jobsData: Job[] = [
  {
    id: 1,
    title: 'Lead Engineer (LATAM)',
    company: 'Bowery',
    location: 'Remote (LATAM)',
    type: 'Full-time',
    salary: 'USD Salary',
    posted: 'hace 1 mes',
    description:
      'Lead and mentor an engineering team to build AI-powered content automation solutions for top US clients. Strong skills in APIs, Python, JavaScript & LLM workflows required.',
    tags: ['Python', 'JavaScript', 'APIs', 'AI', 'Leadership'],
    logo: '/bowery-logo.webp',
    available: false,
  },
];

export default function JobBoardPage() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const filteredJobs = jobsData.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{TEXTS.pageTitle}</h1>
          <p className="mt-2 text-muted-foreground">
            {TEXTS.pageDescription.replace('{count}', jobsData.length.toString())}
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder={TEXTS.searchPlaceholder}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results count */}
        <div>
          <p className="text-sm text-muted-foreground">
            {TEXTS.showingResults
              .replace('{filtered}', filteredJobs.length.toString())
              .replace('{total}', jobsData.length.toString())}
          </p>
        </div>

        {/* Job listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium">{TEXTS.noJobsTitle}</h3>
            <p className="mt-2 text-muted-foreground">{TEXTS.noJobsDescription}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              {TEXTS.resetSearch}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Job card component
function JobCard({ job }: { job: Job }) {
  return (
    <Card
      className={`relative flex h-full flex-col overflow-hidden transition-all hover:shadow-md ${!job.available ? 'opacity-75' : ''}`}
    >
      {!job.available && (
        <div className="absolute right-0 top-0 z-10 m-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            {TEXTS.notAvailable}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={job.logo || '/placeholder.svg'}
              alt={`Logo of ${job.company}`}
              className={`h-full w-full object-cover ${!job.available ? 'grayscale' : ''}`}
            />
          </div>
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="text-sm text-muted-foreground">{job.company}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="space-y-3">
          <div className="line-clamp-2 text-sm text-muted-foreground">{job.description}</div>
          <div className="flex flex-wrap gap-1">
            {job.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{job.posted}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-2">
        {job.available ? (
          <Button className="w-full transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-md">
            {TEXTS.applyNow}
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            {TEXTS.positionFilled}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
