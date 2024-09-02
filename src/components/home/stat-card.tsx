import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import Link from 'next/link';

interface StatCardProps {
  href: string;
  title: string;
  Icon: LucideIcon;
  value: number | string;
  description: string;
}

export const StatCard = ({ href, title, Icon, value, description }: StatCardProps) => (
  <Link href={href} className="block">
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);
