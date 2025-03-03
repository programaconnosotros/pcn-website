import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

const events = [
  { name: 'PCN Checkpoint', date: 'Jueves 13 de marzo a las 19.00', location: 'Discord de PCN' },
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
              <p className="mb-1 text-sm font-medium leading-none">{event.name}</p>

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
