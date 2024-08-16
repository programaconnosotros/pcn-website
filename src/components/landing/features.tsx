import { Book, Briefcase, Users } from 'lucide-react';

export const Features = () => (
  <section id="features" className="w-full py-12 md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tighter sm:text-3xl">Características claves</h2>

          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Tenemos una variedad de características para ayudarte a conectar, aprender y crecer como
            desarrollador de software.
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
              Aprende de expertos en la industria y comparte tus conocimientos con la comunidad.
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
);
