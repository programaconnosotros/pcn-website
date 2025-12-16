import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CircleDollarSign, MapPin } from 'lucide-react';
import { JobOffers } from '@prisma/client';

export function JobCard({ job }: { job: JobOffers }) {
  return (
    <Card className="flex h-full w-full flex-col bg-gray-50 dark:bg-transparent">
      <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0">
            <img
              src={job.logoPath || '/placeholder.svg'}
              alt={`Logo of ${job.enterprise}`}
              className="h-12 w-12 rounded-full border bg-white object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xs leading-tight">{job.enterprise}</p>
            <h3 className="text-lg font-semibold leading-tight">{job.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col px-4 py-3">
        <p className="mb-4 flex-grow text-sm">{job.description}</p>
        <div className="mb-2 mt-1 flex flex-wrap gap-1">
          {job.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-red-900" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <CircleDollarSign className="h-4 w-4 text-green-500" />
            <span>
              {job.currency && job.salaryAmount
                ? `${job.currency} ${job.salaryAmount}`
                : 'No disponible'}
            </span>
          </div>
        </div>
        <div>
          <Button className="w-full" variant="outline" disabled={!job.available}>
            {job.available ? 'Aplica ahora!' : 'Posición cubierta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
