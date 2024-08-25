import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

export const ActiveMembersCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Miembros activos</CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>

    <CardContent>
      <div className="text-2xl font-bold">50</div>

      <p className="text-xs text-muted-foreground">
        Seguimos creciendo a paso firme todos los meses.
      </p>
    </CardContent>
  </Card>
);
