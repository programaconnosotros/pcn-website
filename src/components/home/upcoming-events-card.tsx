import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

export const UpcomingEventsCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Próximos eventos</CardTitle>
      <Calendar className="h-4 w-4 text-muted-foreground" />
    </CardHeader>

    <CardContent>
      <div className="text-2xl font-bold">3</div>
      <p className="text-xs text-muted-foreground">El próximo es en 2 días.</p>
    </CardContent>
  </Card>
);
