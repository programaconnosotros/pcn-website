import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EventRegistrationRow } from '@/actions/events/get-event-registrations';
import { RegistrationsDataTable } from './registrations-data-table';

jest.mock('@/actions/events/get-event-registrations', () => ({}));
jest.mock('@/actions/events/delete-registration', () => ({ deleteRegistration: jest.fn() }));

const row = (overrides: Partial<EventRegistrationRow>): EventRegistrationRow => ({
  id: 'r',
  name: 'Nadie',
  email: 'x@x.dev',
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  cancelledAt: null,
  createdAt: new Date('2030-01-01T12:00:00Z'),
  ...overrides,
});

const data = [
  row({ id: 'r1', name: 'Bruno', email: 'bruno@x.dev', jobTitle: 'Dev', enterprise: 'Acme' }),
  row({ id: 'r2', name: 'Ada', email: 'ada@x.dev', career: 'Sistemas', studyPlace: 'UTN' }),
  row({ id: 'r3', name: 'Carla', cancelledAt: new Date('2030-01-02T00:00:00Z') }),
];

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).getAllByRole('cell')[0].textContent);

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('RegistrationsDataTable', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('shows each registration with its info, status and delete action only when active', () => {
    render(<RegistrationsDataTable data={data} />);

    expect(screen.getByText('3 de 3')).toBeInTheDocument();
    const bruno = screen.getByRole('row', { name: /Bruno/ });
    expect(bruno).toHaveTextContent('Profesional');
    expect(bruno).toHaveTextContent('Activa');
    expect(within(bruno).getByRole('button', { name: '' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Ada/ })).toHaveTextContent('Estudiante');
    const carla = screen.getByRole('row', { name: /Carla/ });
    expect(carla).toHaveTextContent('Sin información adicional');
    expect(carla).toHaveTextContent('Cancelada');
    expect(within(carla).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
  });

  it('sorts by name and filters with the search bar', async () => {
    render(<RegistrationsDataTable data={data} />);

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(names()).toEqual(['Ada', 'Bruno', 'Carla']);
    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(names()).toEqual(['Carla', 'Bruno', 'Ada']);
    await userEvent.click(screen.getByRole('button', { name: 'Fecha de inscripción' }));

    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar inscripción' }), 'zzz');
    expect(screen.getByText('No se encontraron inscripciones.')).toBeInTheDocument();
    expect(screen.getByText('0 de 3')).toBeInTheDocument();
  });

  it('paginates every 100 rows', async () => {
    const many = Array.from({ length: 101 }, (_, i) =>
      row({ id: `r${i}`, name: `Persona ${String(i).padStart(3, '0')}` }),
    );
    render(<RegistrationsDataTable data={many} />);

    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'anterior();' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'siguiente();' }));
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'anterior();' }));
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
  });
});
