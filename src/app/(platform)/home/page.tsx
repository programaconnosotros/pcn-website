import { AdvisesCard } from '@components/home/advises-card';
import { ActiveMembersCard } from '@components/home/active-members-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { LightningTalksCard } from '@components/home/lightning-talks-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Heading2 } from '@/components/ui/heading-2';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackgroundOverlayCard } from '@/components/ui/background-overlay-card';
import { SquareArrowOutUpRight } from 'lucide-react';
import { ContentCard } from '@/components/ui/content-card';
import { Heading3 } from '@/components/ui/heading-3';

const Home = async () => {
  const session = await auth();

  return (
    <div className="mt-4 md:px-20">
      <div className="mb-6 flex flex-col">
        <Heading2>
          {session?.user?.name ? `Hola ${session.user.name.split(' ')[0]}!` : 'Hola!'}
        </Heading2>
        <MotivationalQuotes />
      </div>

      <section className="mb-6 w-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdvisesCard />
          <ActiveMembersCard />
          <UpcomingEventsCard />
          <LightningTalksCard />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <UpcomingEventsSection />
          <MainSponsorCard />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6 xl:flex-row">
            <BackgroundOverlayCard
              title="¿Sabías que podés sumarte al team de desarrollo de este website?"
              description="Avisanos por Discord!"
            />

            <ContentCard
              author="Agustín Sánchez"
              description="Te cuento por qué decidimos crear la comunidad y todos los pasos que hicimos para llegar a donde estamos hoy."
              image="/pre-lightning-talks.jpeg"
              timeToRead="Lectura de 5 minutos"
              title="Historia de programaConNosotros"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex h-fit flex-col rounded-md border p-6">
              <Heading3>No te pierdas de nada</Heading3>

              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                En Discord tenemos más de 500 miembros con los que podés interactuar por chat, por
                llamadas de voz y video, compartir pantalla, chusmear sesiones de pair-programming y
                mucho más. Sumate y lleva tu carrera al siguiente nivel!
              </p>

              <img alt="Discord" src="/discord-demo.png" className="w-full object-cover" />

              <div className="flex justify-center">
                <Link href="https://discord.gg/dTQexKw56S" target="_blank">
                  <Button className="flex flex-row gap-2">
                    Ir a Discord <SquareArrowOutUpRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex h-fit flex-col rounded-md border p-6">
              <Heading3>PCN Podcast</Heading3>
              <p className="text-sm text-muted-foreground">Próximamente.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
