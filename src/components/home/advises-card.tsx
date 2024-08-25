import { MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import prisma from '@/lib/prisma';

export const AdvisesCard = async () => {
  const numberOfAdvises = await prisma.advise.count({});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Consejos</CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{numberOfAdvises}</div>
        <p className="text-xs text-muted-foreground">A seguir compartiendo conocimiento valioso!</p>
      </CardContent>
    </Card>
  );
};
