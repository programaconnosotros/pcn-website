import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { updateProfile } from '@actions/update-profile';
import { ProfileForm } from './profile-form';

jest.mock('@actions/update-profile', () => ({ updateProfile: jest.fn() }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ value, onChange }: { value: string; onChange: (_v: string) => void }) => (
    <button type="button" onClick={() => onChange('https://cdn.dev/me.png')}>
      foto {value || 'vacía'}
    </button>
  ),
}));

type PromiseOptions = { error: (_e: unknown) => string };
const mockPromise = toast.promise as unknown as jest.Mock;

const baseUser = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@x.dev',
  phoneNumber: null,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: 'https://github.com/ada',
  instagramUrl: null,
  youtubeUrl: null,
  twitchUrl: null,
  kickUrl: null,
  slogan: null,
  jobTitle: 'Dev',
  enterprise: 'Acme',
  career: null,
  studyPlace: null,
  positions: [],
};
const ts = { languageId: 'typescript', color: '#4aa3ff', logo: 'ts', experienceLevel: 100 };

const renderForm = (user = {}, languages = [ts]) =>
  render(<ProfileForm user={{ ...baseUser, ...user } as never} languages={languages} />);

const form = () => screen.getByRole('button', { name: 'guardarCambios();' }).closest('form')!;

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('ProfileForm', () => {
  beforeEach(() => mockPromise.mockImplementation((promise: Promise<unknown>) => promise));

  it('starts from the saved profile, with the old job as first position', () => {
    renderForm();

    expect(screen.getByLabelText('nombre')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('email')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Cargo del puesto 1')).toHaveValue('Dev');
    expect(screen.getByLabelText('Empresa del puesto 1')).toHaveValue('Acme');
    expect(screen.getByLabelText('github')).toHaveValue('https://github.com/ada');
    expect(screen.getByRole('button', { name: /TypeScript/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // name and stack, of photo, name, country, slogan and stack
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('todo guardado')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('github↗')).toBeInTheDocument();
  });

  it('prefers the saved positions and shows the empty work state without any', async () => {
    renderForm({ positions: [{ jobTitle: 'CTO', enterprise: null }] });

    expect(screen.getByLabelText('Cargo del puesto 1')).toHaveValue('CTO');
    await userEvent.click(screen.getByRole('button', { name: 'Quitar puesto 1' }));
    expect(screen.getByText(/vacío por ahora, no pasa nada/)).toBeInTheDocument();
    expect(screen.getByText('sin trabajo cargado, y está bien')).toBeInTheDocument();
  });

  it('validates the name and the links', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('nombre'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('linkedin'), { target: { value: 'no es url' } });
    fireEvent.submit(form());

    expect(
      await screen.findByText('El nombre debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('La URL debe ser válida')).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('saves the profile and resets the change counter', async () => {
    jest.mocked(updateProfile).mockResolvedValue(undefined as never);
    renderForm();

    fireEvent.change(screen.getByLabelText('slogan'), { target: { value: 'Hola mundo' } });
    expect(screen.getByText('10/160')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('carrera'), { target: { value: 'Sistemas' } });
    fireEvent.change(screen.getByLabelText('github'), { target: { value: '' } });
    expect(screen.getByText('3 campos modificados')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'agregar puesto' }));
    fireEvent.change(screen.getByLabelText('Cargo del puesto 2'), { target: { value: 'Mentora' } });
    await userEvent.click(screen.getByRole('button', { name: /foto vacía/ }));

    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));

    await waitFor(() => expect(screen.getByText('todo guardado')).toBeInTheDocument());
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ada Lovelace',
        slogan: 'Hola mundo',
        career: 'Sistemas',
        gitHubUrl: null,
        image: 'https://cdn.dev/me.png',
        positions: [
          { jobTitle: 'Dev', enterprise: 'Acme' },
          { jobTitle: 'Mentora', enterprise: '' },
        ],
        programmingLanguages: [ts],
      }),
    );
  });

  it('saves with Ctrl+S / ⌘S from anywhere', async () => {
    jest.mocked(updateProfile).mockResolvedValue(undefined as never);
    renderForm();

    await act(async () => {
      fireEvent.keyDown(window, { key: 's', metaKey: true });
    });
    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    await act(async () => {
      fireEvent.keyDown(window, { key: 'S', ctrlKey: true });
    });
    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(2));
    fireEvent.keyDown(window, { key: 's' });
    expect(updateProfile).toHaveBeenCalledTimes(2);
  });

  it('keeps the changes when saving fails and maps the error', async () => {
    jest.mocked(updateProfile).mockRejectedValue(new Error('x'));
    renderForm();

    fireEvent.change(screen.getByLabelText('carrera'), { target: { value: 'Sistemas' } });
    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'guardarCambios();' })).toBeEnabled(),
    );
    expect(screen.getByText('1 campo modificado')).toBeInTheDocument();
    const { error } = mockPromise.mock.calls[0][1] as PromiseOptions;
    expect(error(new Error('x'))).toBe('Error al actualizar el perfil');
  });

  it('asks for the province only for Argentina and clears it when the country changes', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('combobox', { name: 'país' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Argentina' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'provincia' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Córdoba' }));
    expect(screen.getByRole('combobox', { name: 'provincia' })).toHaveTextContent('Córdoba');

    await userEvent.click(screen.getByRole('combobox', { name: 'país' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Chile' }));
    expect(screen.queryByRole('combobox', { name: 'provincia' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox', { name: 'país' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Argentina' }));
    expect(screen.getByRole('combobox', { name: 'provincia' })).toHaveTextContent(
      'Selecciona tu provincia',
    );
  });

  it('marks languages and splits the experience evenly when one is removed', async () => {
    jest.mocked(updateProfile).mockResolvedValue(undefined as never);
    renderForm({}, []);

    expect(screen.getByRole('navigation', { name: 'Secciones' })).toHaveTextContent('stack0/1');
    await userEvent.click(screen.getByRole('button', { name: /JavaScript/ }));
    await userEvent.click(screen.getByRole('button', { name: /TypeScript/ }));
    await userEvent.click(screen.getByRole('button', { name: /Python/ }));
    await userEvent.click(screen.getByRole('button', { name: /JavaScript/ }));
    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    expect(jest.mocked(updateProfile).mock.calls[0][0].programmingLanguages).toEqual([
      expect.objectContaining({ languageId: 'typescript', experienceLevel: 50 }),
      expect.objectContaining({ languageId: 'python', experienceLevel: 50 }),
    ]);

    await userEvent.click(screen.getByRole('button', { name: /TypeScript/ }));
    await userEvent.click(screen.getByRole('button', { name: /Python/ }));
    expect(screen.getByRole('button', { name: /Python/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reaches 100% with photo, name, country, slogan and stack', async () => {
    renderForm({ image: 'https://cdn.dev/a.png', countryOfOrigin: 'Uruguay', slogan: 'Hola' });

    expect(screen.getByText('100%')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Secciones' });
    expect(within(nav).getByRole('link', { name: /identidad/ })).toHaveTextContent('✓');
    expect(within(nav).getByRole('link', { name: /estudios/ })).toHaveTextContent('opcional');
    expect(within(nav).getByRole('link', { name: /enlaces/ })).toHaveTextContent('1/7');
  });

  it('allows at most five positions', async () => {
    renderForm();

    for (let i = 0; i < 4; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'agregar puesto' }));
    }

    expect(screen.getByLabelText('Cargo del puesto 5')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'agregar puesto' })).not.toBeInTheDocument();
  });

  it('shows the position errors', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Empresa del puesto 1'), {
      target: { value: 'x'.repeat(81) },
    });
    fireEvent.submit(form());

    expect(await screen.findByText('Máximo 80 caracteres')).toBeInTheDocument();
  });
});
