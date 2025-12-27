import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CircleDollarSign, MapPin, ExternalLink } from 'lucide-react';
import { JobOffers } from '@prisma/client';

export function JobCard({ job }: { job: JobOffers }) {
  const initial = job.enterprise?.charAt(0).toUpperCase() || '?';

  return (
    <Card className="flex h-full w-full flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-xl">
              <AvatarFallback className="rounded-xl bg-pcnPurple text-lg font-semibold text-white dark:bg-pcnGreen dark:text-black">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">{job.enterprise}</p>
              <h3 className="text-lg font-semibold leading-tight">{job.title}</h3>
            </div>
          </div>
          {!job.available && (
            <Badge variant="secondary" className="text-xs">
              Cubierta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm text-muted-foreground">{job.description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {job.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-red-500" />
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

        <Button className="w-full" disabled={!job.available}>
          {job.available ? (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Visitar
            </>
          ) : (
            'Posición cubierta'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
