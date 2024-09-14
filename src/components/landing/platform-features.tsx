import { Lightbulb, Share2, UserPlus, Calendar } from 'lucide-react';
import { Card, CardContent } from '@components/ui/card';

export const PlatformFeatures = () => (
  <section className="mt-36 w-full dark:bg-black">
    <div className="container px-4 md:px-32">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl md:px-40">
        Nuestra plataforma
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Lightbulb className="h-12 w-12 text-primary" />
            <h3 className="text-center text-xl font-bold">Compartir consejos</h3>

            <p className="text-center text-gray-500 dark:text-gray-400">
              Intercambia consejos valiosos de otros profesionales y estudiantes para mejorar tus
              habilidades.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Share2 className="h-12 w-12 text-primary" />
            <h3 className="text-center text-xl font-bold">Compartir motivación</h3>

            <p className="text-center text-gray-500 dark:text-gray-400">
              Inspira y motiva a otros miembros de la comunidad compartiendo tus experiencias y
              logros.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <UserPlus className="h-12 w-12 text-primary" />
            <h3 className="text-center text-xl font-bold">Perfil profesional</h3>

            <p className="text-center text-gray-500 dark:text-gray-400">
              Crea y gestiona tu perfil profesional para destacar tus habilidades ante potenciales
              empleadores.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Calendar className="h-12 w-12 text-primary" />
            <h3 className="text-center text-xl font-bold">Actividades detalladas</h3>

            <p className="text-center text-gray-500 dark:text-gray-400">
              Accede a información detallada sobre nuestras actividades.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);
