import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';

const events = [
  { name: 'Lightning Talks', date: 'Fecha a definir', location: 'Lugar a definir' },
  {
    name: 'Charla de introducción a la programación',
    date: 'Fecha a definir',
    location: 'Lugar a definir',
  },
  {
    name: 'Code Warfare (competencia de programación)',
    date: 'Fecha a definir',
    location: 'Lugar a definir',
  },
];

export const UpcomingEventsSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Próximos eventos</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium leading-none">{event.name}</p>

              <p className="text-sm text-muted-foreground">
                {event.date} • {event.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
