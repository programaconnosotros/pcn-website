import { render, screen } from '@testing-library/react';
import AuthLayout from './layout';
import SignInLayout, { metadata as signIn } from './iniciar-sesion/layout';
import ResetLayout, { metadata as reset } from './recuperar-clave/layout';
import SignUpLayout, { metadata as signUp } from './registro/layout';
import VerifyLayout, { metadata as verify } from './verificar-email/layout';

describe('authentication layouts', () => {
  it('draws the terminal backdrop behind every auth screen', () => {
    const { container } = render(
      <AuthLayout>
        <h1>ingresar</h1>
      </AuthLayout>,
    );

    expect(screen.getByRole('heading', { name: 'ingresar' })).toBeInTheDocument();
    // The glow and grid are decoration only, hidden from assistive technology.
    expect(container.querySelector('[aria-hidden]')).toHaveTextContent('');
    expect(container.querySelector('[aria-hidden]')).not.toContainElement(
      screen.getByRole('heading'),
    );
  });

  it.each([
    ['iniciar-sesion', SignInLayout, signIn, 'login'],
    ['recuperar-clave', ResetLayout, reset, 'passwd'],
    ['registro', SignUpLayout, signUp, 'useradd'],
    ['verificar-email', VerifyLayout, verify, 'gpg --verify'],
  ])(
    '%s sets the tab title of its client page and renders it as is',
    (_, Layout, metadata, title) => {
      expect(metadata).toEqual({ title });
      render(<Layout>formulario</Layout>);
      expect(screen.getByText('formulario')).toBeInTheDocument();
    },
  );
});
