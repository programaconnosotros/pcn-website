import { render, screen } from '@testing-library/react';
import {
  EmailButton,
  EmailCode,
  EmailHighlight,
  EmailLayout,
  EmailMeta,
  EmailPanel,
  EmailText,
  emailColors,
} from './email-layout';

describe('EmailLayout', () => {
  it('renders the path prompt, title, body and footer', () => {
    render(
      <EmailLayout path="eventos" title="Te anotaste" preview="Vista previa">
        <EmailText>
          Hola <EmailHighlight>Ada</EmailHighlight>
        </EmailText>
      </EmailLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Te anotaste' })).toBeInTheDocument();
    expect(screen.getByText('eventos')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Vista previa')).toHaveStyle({ display: 'none' });
    expect(
      screen.getByText(String(new Date().getFullYear()), { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'programaConNosotros' })).toHaveAttribute('href');
  });

  it('omits the preview block when there is no preview', () => {
    const { container } = render(
      <EmailLayout path="x" title="t">
        body
      </EmailLayout>,
    );
    expect(container.querySelector('div > div[style*="display: none"]')).toBeNull();
  });

  it('renders the panel, code and button helpers', () => {
    render(
      <>
        <EmailPanel command="cat evento.txt">
          <span>detalle</span>
        </EmailPanel>
        <EmailCode code="123456" />
        <EmailButton href="https://example.com/x" label="verEvento();" />
      </>,
    );

    expect(screen.getByText('cat evento.txt', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('detalle')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'verEvento();' })).toHaveAttribute(
      'href',
      'https://example.com/x',
    );
    expect(emailColors.green).toMatch(/^#/);
  });

  it('renders the boot log and the meta rows', () => {
    render(
      <>
        <EmailLayout path="x" title="t" log={['código generado']}>
          body
        </EmailLayout>
        <EmailMeta
          rows={[
            { label: 'expira', value: 'en 15 minutos' },
            { label: 'estado', value: 'pendiente', tone: 'amber' },
          ]}
        />
      </>,
    );

    expect(screen.getByText('código generado')).toBeInTheDocument();
    expect(screen.getByText('expira')).toBeInTheDocument();
    expect(screen.getByText('pendiente')).toHaveStyle({ color: emailColors.amber });
  });
});
