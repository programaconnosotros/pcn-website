import { GitHubSVG } from '@/components/logos/GitHubSVG';
import { NextJsSVG } from '@/components/logos/NextJsSVG';
import { ReactSVG } from '@/components/logos/ReactSVG';
import { TailwindSVG } from '@/components/logos/TailwindSVG';
import { TypescriptSVG } from '@/components/logos/TypescriptSVG';
import { Button } from '@/components/ui/button';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowUpRight, Lightbulb, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const CONTACT_URL = 'https://wa.me/5493815777562';
const REPO_URL = 'https://github.com/programaconnosotros/pcn-website';

const stack = [
  { name: 'Next.js', Logo: NextJsSVG },
  { name: 'React', Logo: ReactSVG },
  { name: 'TypeScript', Logo: TypescriptSVG },
  { name: 'Tailwind', Logo: TailwindSVG },
];

const Card = ({
  index,
  icon,
  title,
  description,
  children,
  className,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn(ruledCellClassName, 'group relative flex flex-col p-4', className)}>
    <div className="flex items-start justify-between">
      <span className="flex size-5 items-center justify-center text-pcnGreen [&_svg]:size-4">
        {icon}
      </span>
      <span className={cn(GeistMono.className, 'text-xs text-muted-foreground/50')}>{index}</span>
    </div>
    <h3 className="mt-3 font-mono text-base font-semibold tracking-tight text-foreground">
      {title}
    </h3>
    <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    <div className="mt-4">{children}</div>
  </div>
);

export const JoinSection = () => (
  <section>
    <SectionHeader
      eyebrow="Sumate"
      title="Todos pueden crear y aportar en la comunidad"
      description="PCN la construimos entre todos. Si tenés ganas de hacer algo, tenemos lugar para vos."
    />

    <RuledGrid className="lg:grid-cols-3">
      <Card
        index="01"
        icon={<MapPin className="size-5" strokeWidth={1.75} />}
        title="Sé referente en tu ciudad o universidad"
        description="Si compartís los valores de PCN y donde estás todavía no hay muchos miembros, armamos un plan juntos para que la comunidad crezca ahí."
      >
        <Button asChild size="sm" variant="outline" code>
          <Link href={CONTACT_URL} target="_blank" rel="noreferrer">
            <MessageSquare className="mr-2 size-4" />
            contactarnos();
          </Link>
        </Button>
      </Card>

      <Card
        index="02"
        icon={<Lightbulb className="size-5" strokeWidth={1.75} />}
        title="Proponé una iniciativa"
        description="¿Una idea buena para la comunidad? ¿Ganas de organizar un evento o dar una charla? Contanos y vemos la forma de llevarla a cabo."
      >
        <Button asChild size="sm" variant="outline" code>
          <Link href={CONTACT_URL} target="_blank" rel="noreferrer">
            <MessageSquare className="mr-2 size-4" />
            proponerAlgo();
          </Link>
        </Button>
      </Card>

      <Card
        index="03"
        icon={<GitHubSVG className="size-5" />}
        title="Colaborá en el código"
        description="Esta plataforma es open-source. Explorá los issues, asignate uno y mandá tu primer PR. Aprendés con código real y fortalecés tu portafolio."
      >
        <div className="flex flex-col gap-3">
          <ul className="flex items-center gap-2">
            {stack.map(({ name, Logo }) => (
              <li
                key={name}
                title={name}
                className="flex size-7 items-center justify-center rounded-sm ring-1 ring-inset ring-pcnGreen-300 [&_svg]:size-4"
              >
                <Logo className="size-4" />
              </li>
            ))}
            <li className={cn(GeistMono.className, 'ml-1 text-[11px] text-muted-foreground')}>
              + Prisma
            </li>
          </ul>
          <Button asChild size="sm" className="w-fit" code>
            <Link href={REPO_URL} target="_blank" rel="noreferrer">
              verRepositorio();
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </RuledGrid>
  </section>
);
