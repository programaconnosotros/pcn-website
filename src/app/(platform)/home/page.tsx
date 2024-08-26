import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@headlessui/react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { ExternalLink } from 'lucide-react';
import { AdvisesCard } from '@components/home/advises-card';
import { ActiveMembersCard } from '@components/home/active-members-card';
import { UpcomingEventsCard } from '@/components/home/upcoming-events-card';
import { CommunityGrowthCard } from '@/components/home/community-growth-card';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';

const Home = async () => {
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Hola!</h1>
      </div>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <AdvisesCard />
            <ActiveMembersCard />
            <UpcomingEventsCard />
            <CommunityGrowthCard />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UpcomingEventsSection />

            <Card>
              <CardHeader>
                <CardTitle>Main Sponsor</CardTitle>
                <CardDescription>Empowering developers since 2010</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold">TechCorp</div>
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
                <Button className="mt-4" variant="outline">
                  Visit Sponsor
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Blog Posts</CardTitle>
                <CardDescription>Stay updated with our community's insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: 'The Future of AI in Development',
                      author: 'DevPro1',
                      readTime: '5 min',
                    },
                    {
                      title: 'Mastering Microservices Architecture',
                      author: 'DevPro2',
                      readTime: '7 min',
                    },
                    { title: 'Frontend Trends for 2023', author: 'DevPro3', readTime: '4 min' },
                  ].map((post, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-medium leading-none">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {post.author} • {post.readTime} read
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
