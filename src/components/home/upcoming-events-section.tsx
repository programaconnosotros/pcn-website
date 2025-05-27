import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

const events: { name: string; date: string; location: string }[] = [
  {
    name: 'Semana de la Ingenería en Sistemas de Información',
    date: '2025-06-02',
    location: 'Universidad Tecnológica Tucumán (UTN-FRT)',
  },
];

export const UpcomingEventsSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Próximos eventos</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="mb-1 text-sm font-medium leading-none">{event.name}</p>

                <p className="text-sm text-muted-foreground">
                  {event.date} • {event.location}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay eventos próximos.</p>
        )}
      </div>
    </CardContent>
  </Card>
);
