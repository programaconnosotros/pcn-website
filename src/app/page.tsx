import Link from 'next/link';
import { Book, Briefcase, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <img src="/logo.png" width={40} />
        </Link>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Conectá, aprendé y crecé con nosotros!
                  </h1>

                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Unite a nuestra vibrante comunidad de desarrolladores de software y desbloqueá
                    un mundo de networking, aprendizaje y oportunidad para tu carrera.
                  </p>
                </div>

                <div className="disabled">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Unirme ahora
                  </Link>
                </div>
              </div>

              <img
                src="/pcn-header.webp"
                width="550"
                height="310"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="about" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  PCN Social Network
                </h2>

                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Estamos desarrollando una plataforma próspera para que los desarrolladores de
                  software se conecten, aprendan y crezcan. Creemos en fomentar un entorno de apoyo
                  e inclusivo donde los desarrolladores puedan compartir sus conocimientos,
                  colaborar en proyectos y explorar nuevas oportunidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Características claves
                </h2>

                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tenemos una variedad de características para ayudarte a conectar, aprender y
                  crecer como desarrollador de software.
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Users />
                  <h3 className="text-xl font-bold">Contactos</h3>

                  <p className="text-muted-foreground">
                    Conectate con profesionales y estudiantes, y construye valiosas relaciones
                    profesionales.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <Book />
                  <h3 className="text-xl font-bold">Aprendizaje</h3>

                  <p className="text-muted-foreground">
                    Aprende de expertos en la industria y comparte tus conocimientos con la
                    comunidad.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <Briefcase />
                  <h3 className="text-xl font-bold">Oportunidad profesionales</h3>

                  <p className="text-muted-foreground">
                    Descubrí nuevas oportunidades de trabajo y conectate con posibles empleadores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          Sitio web desarrollado y mantenido por miembros de programaConNosotros.
        </p>
      </footer>
    </div>
  );
}
