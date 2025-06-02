import { GitHubSVG } from '../logos/GitHubSVG';
import { LinkedInSVG } from '../logos/LinkedInSVG';
import { XLogoSVG } from '../logos/XLogoSVG';

type Person = {
  name: string;
  role: string | JSX.Element;
  imageUrl: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

const people: Person[] = [
  {
    name: 'Agus',
    role: (
      <p>
        Team Leader & Sr. Full-Stack Engineer (JS/TS) en{' '}
        <span className="underline">Eagerworks</span>
      </p>
    ),
    imageUrl: '/colaborators/agus.webp',
    linkedinUrl: 'https://www.linkedin.com/in/agustinsanc/',
    githubUrl: 'https://github.com/agustin-sanc',
  },
  {
    name: 'Mauri',
    role: (
      <p>
        Sr. Frontend Engineer (iOS) en <span className="underline">PedidosYa</span>
      </p>
    ),
    imageUrl: '/colaborators/mauris.webp',
    linkedinUrl: 'https://www.linkedin.com/in/mauriciosnchz/',
    githubUrl: 'https://github.com/mausnchz',
  },
  {
    name: 'Esteban',
    role: (
      <p>
        Sr. Frontend Engineer (iOS) en <span className="underline">Compass</span>
      </p>
    ),
    imageUrl: '/colaborators/esteban.webp',
    linkedinUrl: 'https://www.linkedin.com/in/esteban-nicolas-sanchez-79b428172/',
  },
  {
    name: 'Chelo',
    role: (
      <p>
        Sr. Backend Engineer (Python & Java) en <span className="underline">Bowery</span>
      </p>
    ),
    imageUrl: '/colaborators/chelo.webp',
    linkedinUrl: 'https://www.linkedin.com/in/marcelo-de-jes%C3%BAs-nu%C3%B1ez-490b05191/',
    githubUrl: 'https://github.com/Chelo154',
  },
  {
    name: 'Germán',
    role: (
      <p>
        Sr. Backend Engineer (JS/TS) en <span className="underline">Entropy</span>
      </p>
    ),
    imageUrl: '/colaborators/german.webp',
    linkedinUrl: 'https://www.linkedin.com/in/germanavarro/',
    githubUrl: 'https://github.com/gmanavarro',
  },
  {
    name: 'Chino',
    role: (
      <p>
        CTO & Sr. Frontend Engineer (JS/TS) en <span className="underline">NotNini</span>
      </p>
    ),
    imageUrl: '/colaborators/chino.webp',
    linkedinUrl: 'https://www.linkedin.com/in/ivantaddei/',
    githubUrl: 'https://github.com/ivantaddei',
  },
  {
    name: 'Carlos',
    role: (
      <p>
        Sr. Frontend Engineer (JS/TS) en <span className="underline">WebExport</span>
      </p>
    ),
    imageUrl: '/colaborators/carlos.webp',
    linkedinUrl: 'https://www.linkedin.com/in/carlos-spagnolo-andres/',
    githubUrl: 'https://github.com/SpagnoloCarlos',
  },
  {
    name: 'Benja',
    role: <p>Sr. Full-Stack Engineer</p>,
    imageUrl: '/colaborators/benja.webp',
    linkedinUrl: 'https://www.linkedin.com/in/jpbenjamin-cortes/',
    githubUrl: 'https://github.com/cortesjpb',
  },
  {
    name: 'Alejo',
    role: (
      <p>
        Sr. Full-Stack Engineer (TS/Python) en <span className="underline">Pendo.io</span>
      </p>
    ),
    imageUrl: '/colaborators/alejo.webp',
    linkedinUrl: 'https://www.linkedin.com/in/alejoboga/',
    githubUrl: 'https://github.com/Alejoboga20',
  },
  {
    name: 'Facu',
    role: (
      <p>
        Ssr. Backend Engineer (JS/TS) en <span className="underline">C&S Informática</span>
      </p>
    ),
    imageUrl: '/colaborators/facu.webp',
    linkedinUrl: 'https://www.linkedin.com/in/juanfacundobazanalvarez/',
    githubUrl: 'https://github.com/FacuBzn',
  },
  {
    name: 'Lemi',
    role: (
      <p>
        Jr. QA Engineer (JS/TS) en <span className="underline">ASZ Software</span>
      </p>
    ),
    imageUrl: '/colaborators/lemi.webp',
    linkedinUrl: 'https://www.linkedin.com/in/emiliano-grillo-905895296/',
  },
  {
    name: 'Vicky',
    role: (
      <p>
        Jr. QA Engineer (JS/TS) en <span className="underline">ASZ Software</span>
      </p>
    ),
    imageUrl: '/colaborators/vicky.webp',
    linkedinUrl: 'https://www.linkedin.com/in/maria-victoria-grillo/',
  },
  {
    name: 'Mati',
    role: (
      <p>
        Sr. Backend Engineer (Python) en <span className="underline">ASZ Software</span>
      </p>
    ),
    imageUrl: '/colaborators/mati.webp',
    linkedinUrl: 'https://www.linkedin.com/in/matias-daniel-gutierrez/',
    githubUrl: 'https://github.com/MatiasDG539',
  },
  {
    name: 'Mauri',
    role: (
      <p>
        Ssr. Full-Stack Engineer (JS/TS) en <span className="underline">ASZ Software</span>
      </p>
    ),
    imageUrl: '/colaborators/mauric.webp',
    linkedinUrl: 'https://www.linkedin.com/in/mauriciojavierchaile/',
    githubUrl: 'https://github.com/MauriJC',
  },
  {
    name: 'Nico',
    role: (
      <p>
        Ssr. Frontend Engineer (JS/TS) en <span className="underline">ASZ Software</span>
      </p>
    ),
    imageUrl: '/colaborators/nico.webp',
    linkedinUrl: 'https://www.linkedin.com/in/nicolas-fuentes-garcia-7997a1236/',
    githubUrl: 'https://github.com/nicofuentesg',
  },
];

export const Team = () => (
  <div className="py-8">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nuestros colaboradores</h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Conocé a las personas que hacen posible esta comunidad. Desde profesionales experimentados
          hasta estudiantes apasionados, todos contribuyen a crear un espacio de aprendizaje y
          crecimiento.
        </p>
      </div>

      <ul
        role="list"
        className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
      >
        {people.map((person) => (
          <li key={person.name}>
            <img
              alt=""
              src={person.imageUrl}
              className="mx-auto h-24 w-24 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
            />

            <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">{person.name}</h3>

            <p className="text-sm leading-6 text-muted-foreground">{person.role}</p>

            <ul role="list" className="mt-6 flex justify-center gap-x-6">
              {person.xUrl && (
                <li>
                  <a href={person.xUrl} className="text-muted-foreground hover:text-foreground">
                    <span className="sr-only">X</span>
                    <XLogoSVG />
                  </a>
                </li>
              )}

              {person.linkedinUrl && (
                <li>
                  <a
                    href={person.linkedinUrl}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <LinkedInSVG />
                  </a>
                </li>
              )}

              {person.githubUrl && (
                <li>
                  <a
                    href={person.githubUrl}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">GitHub</span>
                    <GitHubSVG />
                  </a>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
