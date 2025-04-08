import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import Link from 'next/link';
import { NumberTicker } from '@components/magicui/number-ticker';

interface StatCardProps {
  href: string;
  title: string;
  Icon: LucideIcon;
  value: number;
}

export const StatCard = ({ href, title, Icon, value }: StatCardProps) => (
  <Link href={href} className="block">
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberTicker
          value={value}
          className="whitespace-pre-wrap text-2xl font-medium tracking-tighter text-black dark:text-white"
        />
      </CardContent>
    </Card>
  </Link>
);
