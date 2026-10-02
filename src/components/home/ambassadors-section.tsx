import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { CalendarPlus, Lightbulb, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const CONTACT_URL = 'https://wa.me/5493815777562';

const duties = [
  { icon: CalendarPlus, text: 'Organizan eventos, meetups y coworks, y los publican en la web.' },
  { icon: Lightbulb, text: 'Impulsan iniciativas nuevas y las llevan de la idea a la realidad.' },
  { icon: Users, text: 'Reciben a quienes llegan y hacen crecer la comunidad donde están.' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** The PCN Ambassadors program: what ambassadors do and who they are. */
export const AmbassadorsSection = async () => {
  const ambassadors = await prisma.user.findMany({
    where: { isAmbassador: true },
    select: { id: true, name: true, image: true },
    orderBy: { name: 'asc' },
  });

  return (
    <section id="ambassadors" className="scroll-mt-20">
      <SectionHeader
        eyebrow="PCN Ambassadors"
        title={
          <>
            Los <span className="text-pcnGreen">ambassadors</span> hacen que las cosas pasen
          </>
        }
        description="Ambassadors son miembros que organizan actividades, impulsan iniciativas y mueven la comunidad todos los días."
      />

      <RuledGrid className="lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className={cn(ruledCellClassName, 'flex flex-col gap-4 p-4')}>
          <ul className="flex flex-col gap-3">
            {duties.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <Icon className="mt-0.5 size-4 shrink-0 text-pcnGreen" strokeWidth={1.75} />
                {text}
              </li>
            ))}
          </ul>
          <Button asChild size="sm" variant="outline" className="mt-auto w-fit">
            <Link href={CONTACT_URL} target="_blank" rel="noreferrer">
              <MessageSquare className="mr-2 size-4" />
              quieroSerAmbassador();
            </Link>
          </Button>
        </div>

        <div className={cn(ruledCellClassName, 'p-4')}>
          <p className={cn(GeistMono.className, 'mb-3 text-[11px] text-muted-foreground')}>
            <span className="text-pcnGreen-500">$ </span>ls ambassadors/
            {ambassadors.length > 0 && (
              <span className="text-muted-foreground/60"> — {ambassadors.length}</span>
            )}
          </p>
          {ambassadors.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {ambassadors.map((ambassador) => (
                <li key={ambassador.id}>
                  <Link
                    href={`/perfil/${ambassador.id}`}
                    className="group flex items-center gap-2.5"
                  >
                    <Avatar className="size-8 rounded-sm ring-1 ring-pcnGreen-200 group-hover:ring-pcnGreen-600">
                      <AvatarImage src={ambassador.image ?? undefined} alt="" />
                      <AvatarFallback className="rounded-sm text-[10px]">
                        {initials(ambassador.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 truncate font-mono text-sm font-medium transition-colors group-hover:text-pcnGreen">
                      {ambassador.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Estamos sumando a las primeras personas al programa. ¿Querés ser una?
            </p>
          )}
        </div>
      </RuledGrid>
    </section>
  );
};
