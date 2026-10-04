import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import type { UserWithoutPassword } from '@/actions/users/get-users';
import { setAmbassador } from '@/actions/users/set-ambassador';
import { setCofounder } from '@/actions/users/set-cofounder';
import { setUserRole } from '@/actions/users/set-user-role';
import { PersonLink } from '@/components/people/person-link';
import { renderInPlatform } from '@/test/platform';
import { DataTable } from './data-table';
import UserCard from './user-card';
import { UserFlagToggle } from './user-flag-toggle';
import { columns } from './users-columns';

jest.mock('@/actions/users/set-ambassador', () => ({ setAmbassador: jest.fn() }));
jest.mock('@/actions/users/set-cofounder', () => ({ setCofounder: jest.fn() }));
jest.mock('@/actions/users/set-user-role', () => ({ setUserRole: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

// Role queries over a wide table are slow
jest.setTimeout(20_000);

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

const user = (overrides: Partial<UserWithoutPassword>): UserWithoutPassword => ({
  id: 'u',
  name: 'Usuario',
  email: 'u@x.com',
  emailVerified: false,
  phoneNumber: null,
  role: 'REGULAR',
  isAmbassador: false,
  isCofounder: false,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: daysAgo(3),
  updatedAt: daysAgo(1),
  languages: [],
  ...overrides,
});

const users = [
  user({
    id: 'u1',
    name: 'Ana Gómez',
    email: 'ana@x.com',
    emailVerified: true,
    role: 'ADMIN',
    isCofounder: true,
    phoneNumber: '+5491100000000',
    countryOfOrigin: 'Argentina',
    province: 'Córdoba',
    jobTitle: 'Dev',
    enterprise: 'PCN',
    career: 'Sistemas',
    studyPlace: 'UTN',
    slogan: 'Programá',
    gitHubUrl: 'https://github.com/ana',
    linkedinUrl: 'https://www.linkedin.com/in/ana',
    languages: [
      { language: 'TypeScript', color: '#000', logo: '' },
      { language: 'Raro', color: '#123', logo: '' },
    ],
    createdAt: daysAgo(400),
  }),
  user({
    id: 'u2',
    name: 'Bruno Díaz',
    email: 'bruno@x.com',
    enterprise: 'Acme',
    createdAt: daysAgo(45),
  }),
];

const rowNames = () =>
  Array.from(
    document.querySelectorAll('tbody tr td:first-child span.font-medium'),
    (span) => span.textContent,
  );

describe('users table', () => {
  it('renders every visible column for each user', () => {
    renderInPlatform(
      <DataTable columns={columns} data={users} header={<h1>usuarios</h1>} intro={<p>intro</p>} />,
    );

    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(rowNames()).toEqual(['Ana Gómez', 'Bruno Díaz']);
    const [ana, bruno] = Array.from(document.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(within(ana).getByText('Ana Gómez').closest('a')).toHaveAttribute('href', '/perfil/u1');
    expect(within(ana).getByText('verificado')).toBeInTheDocument();
    expect(within(ana).getByText('Córdoba, Argentina')).toBeInTheDocument();
    expect(within(ana).getByText('Dev @ PCN')).toBeInTheDocument();
    expect(within(ana).getByText('Sistemas · UTN')).toBeInTheDocument();
    expect(within(ana).getByText('Programá')).toBeInTheDocument();
    expect(within(ana).getByTitle('TypeScript, Raro')).toHaveTextContent('2');
    expect(within(ana).getByTitle('GitHub')).toHaveAttribute('href', 'https://github.com/ana');
    expect(within(ana).getByText('+5491100000000')).toHaveAttribute('href', 'tel:+5491100000000');
    expect(within(ana).getByTitle('Quitar admin a Ana Gómez')).toBeInTheDocument();
    expect(within(ana).getByTitle('Quitar co-founder a Ana Gómez')).toBeInTheDocument();
    expect(within(bruno).getByText('sin verificar')).toBeInTheDocument();
    expect(within(bruno).getByText('Acme')).toBeInTheDocument();
    expect(within(bruno).getAllByText('—').length).toBeGreaterThan(3);
    expect(within(bruno).getByTitle('Dar admin a Bruno Díaz')).toBeInTheDocument();
  });

  it('searches users and shows when nothing matches', async () => {
    const userEv = userEvent.setup();
    renderInPlatform(<DataTable columns={columns} data={users} />);
    const search = screen.getByRole('textbox', { name: 'Buscar usuario' });

    await userEv.type(search, 'bruno');
    expect(rowNames()).toEqual(['Bruno Díaz']);

    await userEv.type(search, 'zzz');
    expect(screen.getByText(/grep: 0 usuarios/)).toBeInTheDocument();
  });

  it('sorts by a column in both directions', async () => {
    const userEv = userEvent.setup();
    renderInPlatform(<DataTable columns={columns} data={users} />);

    await userEv.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(rowNames()).toEqual(['Ana Gómez', 'Bruno Díaz']);
    await userEv.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(rowNames()).toEqual(['Bruno Díaz', 'Ana Gómez']);
  });

  it('shows hidden columns from the columns menu', async () => {
    const userEv = userEvent.setup();
    renderInPlatform(<DataTable columns={columns} data={users} />);

    for (const name of ['ID', 'Verificado', 'LinkedIn']) {
      await userEv.click(screen.getByText('--columnas'));
      await userEv.click(screen.getByText(name, { selector: '[role="menuitemcheckbox"]' }));
    }

    const [ana] = Array.from(document.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(within(ana).getByText('u1')).toBeInTheDocument();
    expect(within(ana).getByText('sí')).toBeInTheDocument();
    expect(within(ana).getByText('linkedin.com/in/ana')).toBeInTheDocument();
  });

  it('paginates long lists', () => {
    const many = Array.from({ length: 101 }, (_, i) =>
      user({ id: `m${i}`, name: `Miembro ${String(i).padStart(3, '0')}`, email: `m${i}@x.com` }),
    );
    renderInPlatform(<DataTable columns={columns} data={many} />);
    const page = () => screen.getByText(/^página/).textContent;

    expect(page()).toBe('página 1/2');
    fireEvent.click(screen.getByLabelText('Página siguiente'));
    expect(page()).toBe('página 2/2');
    expect(rowNames()).toEqual(['Miembro 100']);
    fireEvent.click(screen.getByLabelText('Página anterior'));
    expect(page()).toBe('página 1/2');
  });
});

describe('UserFlagToggle', () => {
  it.each([
    ['admin', setUserRole, ['u1', 'ADMIN'], 'Ana ahora es admin'],
    ['ambassador', setAmbassador, ['u1', true], 'Ana ahora es ambassador'],
    ['cofounder', setCofounder, ['u1', true], 'Ana ahora figura como co-founder'],
  ] as const)('turns the %s flag on', async (flag, action, args, message) => {
    (action as jest.Mock).mockResolvedValue(undefined);
    render(<UserFlagToggle flag={flag} userId="u1" userName="Ana" active={false} />);

    await userEvent.click(screen.getByRole('button'));

    expect(action).toHaveBeenCalledWith(...args);
    expect(toast.success).toHaveBeenCalledWith(message);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['admin', setUserRole, ['u1', 'REGULAR'], 'Ana ya no es admin'],
    ['ambassador', setAmbassador, ['u1', false], 'Ana ya no es ambassador'],
    ['cofounder', setCofounder, ['u1', false], 'Ana ya no figura como co-founder'],
  ] as const)('turns the %s flag off', async (flag, action, args, message) => {
    (action as jest.Mock).mockResolvedValue(undefined);
    render(<UserFlagToggle flag={flag} userId="u1" userName="Ana" active />);

    await userEvent.click(screen.getByRole('button'));

    expect(action).toHaveBeenCalledWith(...args);
    expect(toast.success).toHaveBeenCalledWith(message);
    expect(screen.getByRole('button')).toHaveTextContent('no');
  });

  it.each([
    [new Error('No podés quitarte el admin'), 'No podés quitarte el admin'],
    ['raro', 'No se pudo actualizar'],
  ])('reverts and reports a failure (%s)', async (error, message) => {
    (setUserRole as jest.Mock).mockRejectedValue(error);
    render(<UserFlagToggle flag="admin" userId="u1" userName="Ana" active />);

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('ignores clicks while saving', async () => {
    (setAmbassador as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<UserFlagToggle flag="ambassador" userId="u1" userName="Ana" active={false} />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button'));

    expect(setAmbassador).toHaveBeenCalledTimes(1);
  });
});

describe('UserCard and PersonLink', () => {
  it('shows a member with facts, languages and links', () => {
    render(
      <UserCard
        calcMembershipTime="1 año"
        user={{
          ...users[0],
          xAccountUrl: 'https://x.com/ana',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Ana Gómez' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('Argentina · PCN · Sistemas')).toBeInTheDocument();
    expect(screen.getByText(/TypeScript · Raro/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'x↗' })).toHaveAttribute('href', 'https://x.com/ana');
    expect(screen.getByText('AG')).toBeInTheDocument();
  });

  it('shows a bare member', () => {
    render(
      <UserCard
        calcMembershipTime=""
        user={{ ...users[1], studyPlace: 'UNC', enterprise: null }}
      />,
    );

    expect(screen.getByText('UNC')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /↗/ })).not.toBeInTheDocument();
  });

  it('links a person to their profile', () => {
    render(<PersonLink person={{ id: 'p1', name: 'carla', image: null }} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/perfil/p1');
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});
