import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PCN = () => (
  <code className="font-bold text-green-700 dark:text-pcnGreen">programaConNosotros</code>
);

const PCNStory = () => (
  <>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Historia</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo.webp" alt="programaConNosotros" className="mb-4 w-16 md:w-24" />
            <Heading2 className="m-0 text-center">Historia de programaConNosotros</Heading2>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle className="text-center">Introducción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Hola! Gracias por visitar la historia de la comunidad, esperamos te sirva para entender
                el contexto y los valores de lo que creamos, y también motivarte a colaborar en la
                comunidad y ayudarnos a seguir creciendo entre todos!
              </p>
              <p className="text-muted-foreground">
                <b>programaConNosotros</b> es una comunidad de profesionales y estudiantes de ingeniería
                de software, fundada en el año 2020 en Tucumán (Argentina), en plena cuarentena por la
                pandemia del COVID-19. Los co-fundadores son los hermanos Sánchez (Agustín, Mauricio y
                Esteban) junto a Germán Navarro, Marcelo Núñez e Iván Taddei.
              </p>
              <p className="text-muted-foreground">
                Si bien la comunidad fue fundada en 2020, los co-fundadores y las personas más
                destacadas de la comunidad se conocieron varios años atrás, y queremos contar toda la
                historia.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Comienzos en la UTN-FRT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                En el año 2015, en la Universidad Tecnológica de Tucumán (Argentina), se conocieron
                Agustín Sánchez y Germán Navarro, estudiando Ingeniería en Sistemas de Información. La
                gran pasión que tenían por la ingeniería de software, particularmente por la
                programación, los llevó a estudiar mucho más de lo que se enseñaba en la universidad y a
                participar de actividades extracurriculares como charlas y competencias de programación.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Voluntariado en el IEEE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En el año 2017, Agus y Germán se sumaron al IEEE para participar del programa de
                voluntariado, que tiene como objetivo hacer networking, organizar y participar de
                eventos técnicos.
              </p>
              <p className="text-muted-foreground">
                Viajaron a un evento en Catamarca llamado <b>Reunión Nacional de Ramas (RNR)</b>, y se
                hicieron amigos de Facu Gelatti y Franco Mirada. Facu y Franco ya estaban terminando de
                cursar la carrera y fueron mentores muy importantes para Agus y Germán. Compartieron
                muchos eventos técnicos, destacandose los congresos de Smalltalks, por la gran pasión
                que tenían por la programación orientada a objetos.
              </p>
              {/* // TODO: Agregar fotos de los congresos de Smalltalks. */}
              <p className="text-muted-foreground">
                Los 4 ayudaban en la organización de algunas actividades técnicas dentro del IEEE. Facu
                estaba dando sus primeras charlas, en aquel momento sobre Java, Git y refactorización de
                código. Agus y Germán por su lado dieron su primera charla en septiembre del 2017:
                Introducción a la Programación Competitiva.
              </p>
              {/* // TODO: Agregar flyer de la charla */}
              <p className="text-muted-foreground">
                Les apasionaba mucho la programación competitiva asi que daban clases ad-honorem sobre
                algoritmos y estructuras de datos avanzadas aparte de cursar la carrera de ingeniería. A
                estas clases se sumaban varios estudiantes apasionados por la programación. El profesor
                Augusto Nasrallah y el ingeniero Jorge Buabud de la UTN-FRT colaboraban prestando un
                laboratorio de computación de la universidad para dictar estas clases.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Code Warfare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A finales de 2017, organizaron un torneo de programación en la UTN de Tucumán, lo
                llamaron Code Warfare. Se anotaron muchos equipos y estuvo muy divertido.
              </p>
              {/* TODO: Agregar fotos del Code Warfare. */}
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>IEEE Computer Society</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                En el año 2018, Agus y Germán dieron un paso importante presidiendo el Capítulo
                Estudiantil de IEEE Computer Society en la Universidad Nacional de Tucumán.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Club de Algoritmos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Agus creó un club de algoritmos que se juntaban todos los viernes desde las 18.00 hasta
                las 23.00 en un laboratorio del departamento de ingeniería en sistemas de información de
                la UTN-FRT.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Actividades con Tucumán Hacking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En abril del 2018, organizaron el Tucumán Hack Weekend, un congreso internacional de
                seguridad informática llevado a cabo en la UTN de Tucumán. El evento fue organizado
                también por la organización Tucumán Hacking, presidida por Victor Figueredo (ahora CEO
                de Endpoint Consulting).
              </p>
              {/* // TODO: Agregar fotos del Tucumán Hack Weekend. */}
              <p className="text-muted-foreground">
                Organizaron varios talleres de seguridad informática en conjunto con la organización
                Tucumán Hacking, destacándose los talleres de pentesting y hacking ofensivo.
              </p>
              {/* // TODO: Agregar fotos de los cursos de seguridad informática */}
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Nibble</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                En el año 2019, Agus y Germán conocieron 2 personas en la UTN-FRT que se convirtieron en
                grandes compañeros y amigos: Iván Taddei y Marcelo "Chelo" Núñez. El grupo de los 4,
                bautizado por el Chelo como "Nibble", fue un grupo destacado en la facultad, más que
                nada por la pasión que tenían por la ingeniería del software. Nunca fueron a la facultad
                solo para aprobar materias y ya, sino que realmente querían entender cómo funcionan las
                cosas, cómo se relacionan, cómo se aplican, y estudiar mucho más de lo que adentro de
                las aulas se enseñaba.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>El nacimiento de programaConNosotros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En el año 2020, en la Rama Estudiantil IEEE de la UTN-FRT se renovaron las autoridades.
                Agus y Germán dieron otro paso más en su carrera del voluntariado y Mauricio Sánchez se
                sumó también. Agus era presidente, Germán vicepresidente y Mauri tesorero. Se sumaron
                aquel año también Chelo, Iván y Esteban para colaborar en la organización de las
                actividades.
              </p>
              <p className="text-muted-foreground">
                2020 estuvo marcado por la cuarentena por la pandemia del COVID-19, por lo que todos los
                eventos organizados eran virtuales, nada presencial. El evento estrella eran las
                Lightning Talks, jornada de charlas rápidas sobre ingeniería de software.
              </p>
              <p className="text-muted-foreground">
                El IEEE tenía muchas limitaciones que nos impedían crecer por el rumbo que queríamos y
                dedicarnos 100% a la programación y crear la comunidad que visionabamos, por lo cual,
                decidimos dar un paso al costado y crear nuestro propio espacio de voluntariado. Es así
                como nace programaConNosotros (PCN para los amigos).
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Cursos de Git & GitHub con la cátedra de AED</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La cátedra de Algoritmos y Estructuras de Datos (AED) de la UTN-FRT le dio lugar a la
                comunidad para dar algunos talleres de Git y GitHub, con los cuales se sumó mucha gente
                a la comunidad, entre los cuales estaban Tobias Paz Posse, Jeremias Ivanoff y Lucas
                Pérez. Tobi, Jere (alias Lunai) y Lucas le pusieron mucha energía y buena onda a la
                comunidad, y han crecido mucho desde que entraron.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Lightning Talks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organizamos varias jornadas de Lightning Talks, donde muchos miembros de la comunidad
                comparten su conocimiento y experiencias. Al principio eran todas virtuales por Discord,
                y cuando se terminó la cuarentena y se pudo volver a la vida de antes, organizamos
                varias ediciones de Lightning Talks presenciales.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>PCN & Global Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                En 2023, colaboramos con Global Learning dando charlas sobre arquitectura de software e
                ingeniería de software en la última clase de sus cursos.
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl transition-colors hover:border-pcnGreen">
            <CardHeader>
              <CardTitle>Empezamos a desarrollar el website</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En 2024, Agus empezó el proyecto del website de PCN. Al principio iba a ser solo un
                website institucional, pero después se transformó en una red social más compleja, en la
                que los miembros de la comunidad pueden crear un usuario para interactuar en el sitio.
              </p>
              <p className="text-muted-foreground">
                El proyecto es open-source y cualquier persona de la comunidad puede participar en el
                desarrollo y testing de la plataforma. Los miembros de la comunidad que colaboraron en
                el desarrollo de la primera versión del website fueron Germán Navarro, Mauricio Chaile,
                Matías Gutierrez, Nicolas Fuentes, Facundo Bazán, Vicky Grillo, Emiliano Grillo, Carlos
                Spagnolo, Alejo Boga, Tobías Paz Posse, Marcelo Núñez y Benjamin Cortes. El equipo fue
                liderado por Agustín Sánchez.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </>
);
export default PCNStory;
