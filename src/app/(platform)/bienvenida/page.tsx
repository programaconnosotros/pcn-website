import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { getOnboardingSteps } from '@/lib/onboarding';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'bienvenida', robots: { index: false } };

const BAR_WIDTH = 24;

/** Where a new member lands after verifying their email: what to do first, checked off as done. */
export default async function WelcomePage() {
  const session = await getCurrentSession();
  if (!session) redirect('/iniciar-sesion?redirect=/bienvenida');

  const steps = await getOnboardingSteps(session.user.id);
  const done = steps.filter((step) => step.done).length;
  const filled = Math.round((done / steps.length) * BAR_WIDTH);
  const firstName = session.user.name.split(' ')[0];

  return (
    <div className="mt-4 px-4 md:px-10">
      <StickyHeader className="md:-mx-10 md:px-10">
        <PageTitle path="bienvenida" meta={`${done}/${steps.length} pasos`} />
      </StickyHeader>

      <section className="mb-6 max-w-3xl font-mono">
        <p className="text-xs text-pcnGreen-600">
          $ ./bienvenida --usuario={firstName.toLowerCase()}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          ¡Hola, {firstName}! Ya sos parte de programaConNosotros.
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Somos una comunidad sin fronteras de gente que programa. Estos pasos te ayudan a arrancar
          con el pie derecho; se van tildando solos a medida que los hacés.
        </p>
        <p aria-hidden className="mt-4 text-xs tracking-tighter whitespace-pre">
          <span className="text-pcnGreen-500">[</span>
          <span className="text-pcnGreen text-glow">{'█'.repeat(filled)}</span>
          <span className="text-pcnGreen-200">{'░'.repeat(BAR_WIDTH - filled)}</span>
          <span className="text-pcnGreen-500">]</span>{' '}
          <span className="text-muted-foreground">
            {done === steps.length ? 'listo ✓' : `${done}/${steps.length}`}
          </span>
        </p>
      </section>

      <RuledGrid className="mb-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.id} className={cn(ruledCellClassName, 'flex flex-col gap-3 p-4')}>
            <header className="flex items-center gap-2 font-mono text-xs">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-sm border',
                  step.done
                    ? 'border-pcnGreen bg-pcnGreen text-black'
                    : 'border-pcnGreen-300 text-pcnGreen-600',
                )}
              >
                {step.done ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              <h3
                className={cn('font-semibold', step.done && 'text-muted-foreground line-through')}
              >
                {step.title}
              </h3>
              <span className="sr-only">{step.done ? '(hecho)' : '(pendiente)'}</span>
            </header>
            <p className="flex-1 text-sm text-muted-foreground">{step.description}</p>
            {!step.done && (
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              </div>
            )}
          </article>
        ))}
      </RuledGrid>

      <p className="mb-14 font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>¿Ya está?{' '}
        <Link href="/" className="text-pcnGreen hover:underline">
          cd ~
        </Link>{' '}
        y explorá todo lo que pasa en la comunidad.
      </p>
    </div>
  );
}
