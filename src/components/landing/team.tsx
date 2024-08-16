import { GitHubSVG } from '../logos/GitHubSVG';
import { LinkedInSVG } from '../logos/LinkedInSVG';
import { XLogoSVG } from '../logos/XLogoSVG';

type People = {
  name: string;
  role: string | JSX.Element;
  imageUrl: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

const people: People[] = [
  {
    name: 'Agus',
    role: (
      <p>
        Team Leader & Sr. Full-Stack Engineer (JS/TS) en{' '}
        <span className="underline">Eagerworks</span>
      </p>
    ),
    imageUrl: '/agus.jpeg',
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
    imageUrl: '/mauri2.jpeg',
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
    imageUrl: '/esteban.jpeg',
    linkedinUrl: 'https://www.linkedin.com/in/esteban-nicolas-sanchez-79b428172/',
  },
  {
    name: 'Chelo',
    role: (
      <p>
        Sr. Backend Engineer (Python & Java) en <span className="underline">Bowery</span>
      </p>
    ),
    imageUrl: '/chelo.jpeg',
    linkedinUrl: 'https://www.linkedin.com/in/marcelo-de-jes%C3%BAs-nu%C3%B1ez-490b05191/',
    githubUrl: 'https://github.com/Chelo154',
  },
  {
    name: 'Germán',
    role: (
      <p>
        Sr. Backend Engineer (JS/TS) en <span className="underline">NotNini</span> &{' '}
        <span className="underline">Vortex</span>
      </p>
    ),
    imageUrl: '/german.jpeg',
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
    imageUrl: '/chino.jpeg',
    linkedinUrl: 'https://www.linkedin.com/in/ivantaddei/',
    githubUrl: 'https://github.com/ivantaddei',
  },
];

export const Team = () => (
  <div className="bg-white py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Conocé parte de nuestro equipo
        </h2>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          Contamos con excelentes profesionales y estudiantes, con los cuales podés interactuar para
          aprender y crecer juntos.
        </p>
      </div>

      <ul
        role="list"
        className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
      >
        {people.map((person) => (
          <li key={person.name}>
            <img alt="" src={person.imageUrl} className="mx-auto h-24 w-24 rounded-full" />

            <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900">
              {person.name}
            </h3>

            <p className="text-sm leading-6 text-gray-600">{person.role}</p>

            <ul role="list" className="mt-6 flex justify-center gap-x-6">
              {person.xUrl && (
                <li>
                  <a href={person.xUrl} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">X</span>
                    <XLogoSVG />
                  </a>
                </li>
              )}

              {person.linkedinUrl && (
                <li>
                  <a href={person.linkedinUrl} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">LinkedIn</span>
                    <LinkedInSVG />
                  </a>
                </li>
              )}

              {person.githubUrl && (
                <li>
                  <a href={person.githubUrl} className="text-gray-400 hover:text-gray-500">
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
