import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { signUp } from '@/actions/auth/sign-up';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { mockRouter, setLocation } from '@/test/dom';
import SignUpPage from './page';

jest.mock('@/actions/auth/sign-up', () => ({ signUp: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/ui/file-upload-public', () => ({
  FileUploadPublic: ({ onChange }: { onChange: (_url: string) => void }) => (
    <button type="button" onClick={() => onChange('https://cdn/foto.png')}>
      subir foto
    </button>
  ),
}));

const signUpMock = signUp as jest.MockedFunction<typeof signUp>;

const pick = async (user: UserEvent, trigger: string, option: string) => {
  await user.click(screen.getByRole('combobox', { name: trigger }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
};

const fill = async (user: UserEvent, label: string, value: string) => {
  await user.click(screen.getByLabelText(label));
  await user.paste(value);
};

const PROVINCE_ERROR = 'La provincia es requerida si el país es Argentina';

const fillRequired = async (
  user: UserEvent,
  { country = 'Chile', confirm = 'supersecreta' } = {},
) => {
  await fill(user, 'Nombre completo', 'Ana Gomez');
  await fill(user, 'Correo electrónico', 'ana@example.com');
  await fill(user, 'Contraseña', 'supersecreta');
  await fill(user, 'Confirmar contraseña', confirm);
  await pick(user, 'País', country);
  // Choosing Argentina validates the province right away
  if (country === 'Argentina') await screen.findByText(PROVINCE_ERROR);
};

const submit = (user: UserEvent) => user.click(screen.getByRole('button', { name: /crearCuenta/ }));

const UNCONTROLLED = 'changing an uncontrolled input to be controlled';
let consoleError: jest.SpyInstance;

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('SignUpPage', () => {
  beforeEach(() => {
    setLocation('/autenticacion/registro');
    // Swallow only the known uncontrolled-password warning (see the failing test below)
    const original = console.error;
    consoleError = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes(UNCONTROLLED)) return;
      original(...args);
    });
  });
  afterEach(() => consoleError.mockRestore());

  it('keeps the password input controlled from the start', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fill(user, 'Contraseña', 'x');

    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining(UNCONTROLLED));
  });

  it('validates the form and toasts the first error', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await submit(user);

    expect(
      await screen.findByText('El nombre debe tener al menos 2 caracteres'),
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('El nombre debe tener al menos 2 caracteres');
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillRequired(user, { confirm: 'otraclave1' });
    await submit(user);

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it('requires a province for Argentina and clears it when switching country', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    await fillRequired(user, { country: 'Argentina' });

    await pick(user, 'Provincia', 'Córdoba');
    expect(screen.queryByText(PROVINCE_ERROR)).not.toBeInTheDocument();

    await pick(user, 'País', 'Uruguay');
    expect(screen.queryByRole('combobox', { name: 'Provincia' })).not.toBeInTheDocument();
  });

  it('creates the account with the optional data and redirects', async () => {
    setLocation('/autenticacion/registro', 'redirect=/eventos/2&autoRegister=true');
    signUpMock.mockResolvedValue({
      success: true,
      redirectUrl: '/autenticacion/verificar-email',
    } as never);
    const user = userEvent.setup();
    render(<SignUpPage />);

    expect(screen.getByRole('link', { name: /Ya tenés cuenta/ })).toHaveAttribute(
      'href',
      `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent('/eventos/2')}&autoRegister=true`,
    );

    await fillRequired(user, { country: 'Argentina' });
    await pick(user, 'Provincia', 'Salta');
    await fill(user, '¿De qué trabajás?', 'Dev');
    await user.click(screen.getByRole('button', { name: 'subir foto' }));
    await submit(user);

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith('/autenticacion/verificar-email'),
    );
    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana Gomez',
        email: 'ana@example.com',
        password: 'supersecreta',
        country: 'Argentina',
        province: 'Salta',
        profession: 'Dev',
        image: 'https://cdn/foto.png',
        redirectTo: '/eventos/2?autoRegister=true',
      }),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('uses & when the redirect already has a query and skips push without redirectUrl', async () => {
    setLocation('/autenticacion/registro', 'redirect=%2Feventos%3Fa%3D1&autoRegister=true');
    signUpMock.mockResolvedValue({ success: true } as never);
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillRequired(user);
    await submit(user);

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({ redirectTo: '/eventos?a=1&autoRegister=true' }),
      ),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('reports an email that already exists', async () => {
    signUpMock.mockResolvedValue({ success: false, error: 'EMAIL_ALREADY_EXISTS' } as never);
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillRequired(user);
    await submit(user);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Ya hay un usuario con ese correo electrónico.'),
    );
    expect(screen.getByRole('button', { name: /crearCuenta/ })).toBeEnabled();
  });

  it('reports other errors', async () => {
    signUpMock.mockResolvedValue({ success: false, error: 'UNKNOWN' } as never);
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillRequired(user);
    await submit(user);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Error al crear el usuario. Por favor, intentá nuevamente.',
      ),
    );
  });

  it('shows the rate-limit message when the action throws one', async () => {
    signUpMock.mockRejectedValue(
      Object.assign(new Error('x'), { digest: rateLimitDigest('signUp', 120) }),
    );
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillRequired(user);
    await submit(user);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('2 minutos')),
    );
  });
});
