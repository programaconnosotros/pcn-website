import { act, render, screen, waitFor } from '@testing-library/react';
import { CaptchaField, useCaptcha } from './captcha-field';

// The real widget is a web component that runs a proof of work in workers: here it's a plain tag.
jest.mock('altcha', () => ({}));
jest.mock('altcha/i18n/es-419', () => ({}), { virtual: true });

const widget = () => document.querySelector('altcha-widget')!;
const changeState = (state: string, payload: string | null) =>
  act(() => {
    widget().dispatchEvent(new CustomEvent('statechange', { detail: { state, payload } }));
  });

describe('CaptchaField', () => {
  it('shows it is checking until the widget loads, then solves the challenge on its own', async () => {
    render(<CaptchaField onChange={jest.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('verificando que no sos un bot');
    await waitFor(() => expect(widget()).toBeInTheDocument());
    expect(widget()).toHaveAttribute('challenge', '/api/captcha');
    expect(widget()).toHaveAttribute('auto', 'onload');
    expect(widget()).toHaveAttribute('language', 'es-419');
  });

  it('hands over the payload only once it is verified', async () => {
    const onChange = jest.fn();
    render(<CaptchaField onChange={onChange} />);
    await waitFor(() => expect(widget()).toBeInTheDocument());

    changeState('verifying', null);
    expect(onChange).toHaveBeenLastCalledWith(null);
    changeState('verified', 'payload-1');
    expect(onChange).toHaveBeenLastCalledWith('payload-1');
    changeState('expired', 'payload-1');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('tells how it is going in a terminal line instead of the widget checkbox', async () => {
    const onRetry = jest.fn();
    render(<CaptchaField onChange={jest.fn()} onRetry={onRetry} />);
    await waitFor(() => expect(widget()).toBeInTheDocument());
    expect(widget()).toHaveAttribute('aria-hidden');

    changeState('verified', 'payload-1');
    expect(screen.getByRole('status')).toHaveTextContent('humano verificado');

    changeState('error', null);
    expect(screen.getByRole('status')).toHaveTextContent('no pudimos verificarte');
    act(() => screen.getByRole('button', { name: 'reintentar' }).click());
    expect(onRetry).toHaveBeenCalledTimes(1);

    // An expired solution starts over on its own.
    changeState('expired', null);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});

describe('useCaptcha', () => {
  const Form = () => {
    const captcha = useCaptcha();
    return (
      <>
        {captcha.field}
        <p>payload: {captcha.payload ?? 'ninguno'}</p>
        <button type="button" onClick={captcha.renew}>
          renovar
        </button>
      </>
    );
  };

  it('keeps the solved payload and starts over with a new widget on renew', async () => {
    render(<Form />);
    await waitFor(() => expect(widget()).toBeInTheDocument());
    const first = widget();

    changeState('verified', 'payload-1');
    expect(screen.getByText('payload: payload-1')).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: 'renovar' }).click());

    expect(screen.getByText('payload: ninguno')).toBeInTheDocument();
    await waitFor(() => expect(widget()).not.toBe(first));
  });
});
