import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import Link from 'next/link';

const PCN = () => (
  <code className="font-bold text-green-700 dark:text-pcnGreen">programaConNosotros</code>
);

const PCNStory = () => (
  <div className="xl:mr-120 flex flex-col gap-4 md:mr-96">
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink href="/posts/pcn-story">Historia de PCN</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>Historia de programaConNosotros</Heading2>

    <p>
      Hola! Soy Agustín Sánchez, uno de los fundadores de nuestra comunidad, y en este artículo
      quiero contarte cómo llegamos a crear <PCN />, y casi todos los pasos que dimos para ser lo
      que somos hoy. Espero que te guste!
    </p>

    <Heading3>
      Todo empezó en la{' '}
      <Link
        href="https://www.frt.utn.edu.ar/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        UTN-FRT
      </Link>
    </Heading3>

    <p>
      En el año 2015, empecé a estudiar ingeniería en sistemas de información en la UTN (Universidad
      Tecnológica Nacional), en la provincia de Tucumán, Argentina. Rápidamente, me di cuenta de que
      estudiar las cosas que tocaban en la universidad no era suficiente, asi que empecé a estudiar
      por mi cuenta los temas que más me interesaban e intenté participar en actividades
      extracurriculares lo más posible.
    </p>

    <Heading3>Descubrimos la programación competitiva</Heading3>

    <p>
      En el año 2016, cursando el segundo año de la carrera, me enteré de suerte que había una
      competencia de programación a nivel nacional de la UTN, y que había un grupo de estudiantes
      que iban a viajar a competir. Armamos team con <b>Germán Navarro</b> (también co-fundador de{' '}
      <PCN />) y <b>Nicolás Nisoria</b>.
    </p>

    <p>
      En aquel momento, sentíamos que programábamos muy bien, muchísimos escalones por encima de
      nuestros compañeros de la universidad, y sentíamos que podíamos dar pelea a nivel nacional.
      Fuimos a Santa Fé a competir y... perdimos. De hecho, no pudimos resolver ningún problema de
      la competencia. Pero hasta el día de hoy, sigo pensando que fue lo mejor que nos pudo pasar,
      porque nos dejó una enseñanza muy valiosa:{' '}
      <b className="font-bold text-green-700 dark:text-pcnGreen">
        hay demasiadas cosas para aprender y siempre hay gente que sabe mucho más que vos.
      </b>{' '}
    </p>

    <p>
      Tenés que moverte para encontrar ese tipo de gente, lo cual no es sencillo. Y cuando los
      encontrás, tenés que aprender y crecer lo más que puedas. Desde aquel momento, siempre trato
      de rodearme de gente que sabe más que yo y trato de crecer un poco más cada día. También sé
      que puedo ser de ayuda a muchas personas para que sigan creciendo, lo cual me gusta hacer y me
      llena de satisfacción.
    </p>

    <Heading3>Fuimos voluntarios en el IEEE</Heading3>

    <p>
      En el año 2017, nos enteramos de que el IEEE (Institute of Electrical and Electronics
      Engineers) tenía un programa de voluntariado y que en nuestra universidad, había un grupo de
      alumnos que organizaban actividades muy copadas, como congresos de ingeniería, talleres de
      programación y demás.
    </p>

    <p>
      Nos daba vergüenza sumarnos al grupo porque había estudiantes más avanzados que nosotros, pero
      nos armamos de valor con Germán, fuimos a una reunión informativa y nos sumaron al grupo. Poco
      a poco, fuimos participando más en las actividades. Viajamos a Catamarca a la Reunión Nacional
      de Ramas Estudiantiles (RNR), a conocer estudiantes de toda Argentina.
    </p>
  </div>
);
export default PCNStory;
