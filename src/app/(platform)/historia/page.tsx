import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';

const PCN = () => (
  <code className="font-bold text-green-700 dark:text-pcnGreen">programaConNosotros</code>
);

const PCNStory = () => (
  <div className="xl:mr-120 mb-12 mt-6 flex flex-col gap-4 md:mx-24 lg:mx-48 xl:mx-64">
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink href="/posts/historia-pcn">Historia de PCN</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>Historia de programaConNosotros</Heading2>

    <p>
      Hola! Gracias por visitar la historia de la comunidad, esperamos te sirva para entender el
      contexto y los valores de lo que creamos, y también motivarte a colaborar en la comunidad y
      ayudarnos a seguir creciendo entre todos!
    </p>

    <p>
      <b>programaConNosotros</b> es una comunidad de profesionales y estudiantes de ingeniería de
      software, fundada en el año 2020 en Tucumán (Argentina), en plena cuarentena por la pandemia
      del COVID-19. Los co-fundadores son los hermanos Sánchez (Agustín, Mauricio y Esteban) junto a
      Germán Navarro, Marcelo Núñez e Iván Taddei.
    </p>

    <p>
      Si bien la comunidad fue fundada en 2020, los co-fundadores y las personas más destacadas de
      la comunidad se conocieron varios años atrás, y queremos contar toda la historia.
    </p>

    <Heading3>Comienzos en la UTN-FRT</Heading3>

    <p>
      En el año 2015, en la Universidad Tecnológica de Tucumán (Argentina), se conocieron Agustín
      Sánchez y Germán Navarro, estudiando Ingeniería en Sistemas de Información. La gran pasión que
      tenían por la ingeniería de software, particularmente por la programación, los llevó a
      estudiar mucho más de lo que se enseñaba en la universidad y a participar de actividades
      extracurriculares como charlas y competencias de programación.
    </p>

    <Heading3>Voluntariado en el IEEE</Heading3>

    <p>
      En el año 2017, Agus y Germán se sumaron al IEEE para participar del programa de voluntariado,
      que tiene como objetivo hacer networking, organizar y participar de eventos técnicos.
    </p>

    <p>
      Viajaron a un evento en Catamarca llamado <b>Reunión Nacional de Ramas (RNR)</b>, y se
      hicieron amigos de Facu Gelatti y Franco Mirada. Facu y Franco ya estaban terminando de cursar
      la carrera y fueron mentores muy importantes para Agus y Germán. Compartieron muchos eventos
      técnicos, destacandose los congresos de Smalltalks, por la gran pasión que tenían por la
      programación orientada a objetos.
    </p>

    {/* // TODO: Agregar fotos de los congresos de Smalltalks. */}

    <p>
      Los 4 ayudaban en la organización de algunas actividades técnicas dentro del IEEE. Facu estaba
      dando sus primeras charlas, en aquel momento sobre Java, Git y refactorización de código. Agus
      y Germán por su lado dieron su primera charla en septiembre del 2017: Introducción a la
      Programación Competitiva.
    </p>

    {/* // TODO: Agregar flyer de la charla */}

    <p>
      Les apasionaba mucho la programación competitiva asi que daban clases ad-honorem sobre
      algoritmos y estructuras de datos avanzadas aparte de cursar la carrera de ingeniería. A estas
      clases se sumaban varios estudiantes apasionados por la programación. El profesor Augusto
      Nasrallah y el ingeniero Jorge Buabud de la UTN-FRT colaboraban prestando un laboratorio de
      computación de la universidad para dictar estas clases.
    </p>

    <Heading3>Code Warfare</Heading3>

    <p>
      A finales de 2017, organizaron un torneo de programación en la UTN de Tucumán, lo llamaron
      Code Warfare. Se anotaron muchos equipos y estuvo muy divertido.
    </p>

    {/* TODO: Agregar fotos del Code Warfare. */}

    <Heading3>IEEE Computer Society</Heading3>

    <p>
      En el año 2018, Agus y Germán dieron un paso importante presidiendo el Capítulo Estudiantil de
      IEEE Computer Society en la Universidad Nacional de Tucumán.
    </p>

    <Heading3>Actividades con Tucumán Hacking</Heading3>

    <p>
      En abril del 2018, organizaron el Tucumán Hack Weekend, un congreso internacional de seguridad
      informática llevado a cabo en la UTN de Tucumán. El evento fue organizado también por la
      organización Tucumán Hacking, presidida por Victor Figueredo (ahora CEO de Endpoint
      Consulting).
    </p>

    {/* // TODO: Agregar fotos del Tucumán Hack Weekend. */}

    <p>
      Organizaron varios talleres de seguridad informática en conjunto con la organización Tucumán
      Hacking, destacándose los talleres de pentesting y hacking ofensivo.
    </p>
    {/* // TODO: Agregar fotos de los cursos de seguridad informática */}

    <Heading3>Nibble</Heading3>

    <p>
      En el año 2019, Agus y Germán conocieron 2 personas en la UTN-FRT que se convirtieron en
      grandes compañeros y amigos: Iván Taddei y Marcelo “Chelo” Núñez. El grupo de los 4, bautizado
      por el Chelo como “Nibble”, fue un grupo destacado en la facultad, más que nada por la pasión
      que tenían por la ingeniería del software. Nunca fueron a la facultad solo para aprobar
      materias y ya, sino que realmente querían entender cómo funcionan las cosas, cómo se
      relacionan, cómo se aplican, y estudiar mucho más de lo que adentro de las aulas se enseñaba.
    </p>

    <Heading3>El nacimiento de programaConNosotros</Heading3>

    <p>
      En el año 2020, en la Rama Estudiantil IEEE de la UTN-FRT se renovaron las autoridades. Agus y
      Germán dieron otro paso más en su carrera del voluntariado y Mauricio Sánchez se sumó también.
      Agus era presidente, Germán vicepresidente y Mauri tesorero. Se sumaron aquel año también
      Chelo, Iván y Esteban para colaborar en la organización de las actividades.
    </p>

    <p>
      2020 estuvo marcado por la cuarentena por la pandemia del COVID-19, por lo que todos los
      eventos organizados eran virtuales, nada presencial. El evento estrella eran las Lightning
      Talks, jornada de charlas rápidas sobre ingeniería de software.
    </p>

    <p>
      El IEEE tenía muchas limitaciones que nos impedían crecer por el rumbo que queríamos y
      dedicarnos 100% a la programación y crear la comunidad que visionabamos, por lo cual,
      decidimos dar un paso al costado y crear nuestro propio espacio de voluntariado. Es así como
      nace programaConNosotros (PCN para los amigos).
    </p>

    <Heading3>Cursos de Git & GitHub con la cátedra de AED</Heading3>

    <p>
      La cátedra de Algoritmos y Estructuras de Datos (AED) de la UTN-FRT le dio lugar a la
      comunidad para dar algunos talleres de Git y GitHub, con los cuales se sumó mucha gente a la
      comunidad, entre los cuales estaban Tobias Paz Posse, Jeremias Ivanoff y Lucas Pérez. Tobi,
      Jere (alias Lunai) y Lucas le pusieron mucha energía y buena onda a la comunidad, y han
      crecido mucho desde que entraron.
    </p>

    <Heading3>Lightning Talks</Heading3>

    <p>
      Organizamos varias jornadas de Lightning Talks, donde muchos miembros de la comunidad
      comparten su conocimiento y experiencias. Al principio eran todas virtuales por Discord, y
      cuando se terminó la cuarentena y se pudo volver a la vida de antes, organizamos varias
      ediciones de Lightning Talks presenciales.
    </p>

    <Heading3>PCN & Global Learning</Heading3>

    <p>
      En 2023, colaboramos con Global Learning dando charlas sobre arquitectura de software e
      ingeniería de software en la última clase de sus cursos.
    </p>

    <Heading3>Empezamos a desarrollar el website</Heading3>

    <p>
      En 2024, Agus empezó el proyecto del website de PCN. Al principio iba a ser solo un website
      institucional, pero después se transformó en una red social más compleja, en la que los
      miembros de la comunidad pueden crear un usuario para interactuar en el sitio.
    </p>

    <p>
      El proyecto es open-source y cualquier persona de la comunidad puede participar en el
      desarrollo y testing de la plataforma. Los miembros de la comunidad que colaboraron en el
      desarrollo de la primera versión del website fueron Germán Navarro, Mauricio Chaile, Matías
      Gutierrez, Nicolas Fuentes, Facundo Bazán, Vicky Grillo, Emiliano Grillo, Carlos Spagnolo,
      Alejo Boga y Benjamin Cortes. El equipo fue liderado por Agustín Sánchez.
    </p>
  </div>
);
export default PCNStory;
