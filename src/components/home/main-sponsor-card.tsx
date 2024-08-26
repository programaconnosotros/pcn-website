import { Button } from '@headlessui/react';
import { ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import Link from 'next/link';

export const MainSponsorCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Sponsor principal</CardTitle>
      <CardDescription>Apoyando la comunidad desde 2024</CardDescription>
    </CardHeader>

    <CardContent className="flex flex-col items-center">
      <img
        alt="TechCorp logo"
        className="rounded-lg"
        height="100"
        src="/placeholder.svg?height=100&width=200"
        style={{
          aspectRatio: '200/100',
          objectFit: 'cover',
        }}
        width="200"
      />

      <Link href="https://www.eagerworks.com/">
        <Button className="mt-4" variant="outline">
          <div className="flex flex-row items-center gap-2 hover:underline">
            Visitar sponsor
            <ExternalLink className="ml-2 h-4 w-4" />
          </div>
        </Button>
      </Link>
    </CardContent>
  </Card>
);
