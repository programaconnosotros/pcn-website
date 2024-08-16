import { Presentation } from 'lucide-react';

const people: Array<{
  name: string;
  role: string | JSX.Element;
  imageUrl: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}> = [
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
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                    </svg>
                  </a>
                </li>
              )}

              {person.linkedinUrl && (
                <li>
                  <a href={person.linkedinUrl} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>
              )}

              {person.githubUrl && (
                <li>
                  <a href={person.githubUrl} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">GitHub</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-github"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
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
