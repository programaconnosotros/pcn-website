'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {} from 'altcha/types/react';
import { cn } from '@/lib/utils';

// The captcha of the sign-in forms (src/lib/captcha.ts): the ALTCHA widget solves a proof of work
// in the background as soon as the form shows, so people only see a terminal line saying so. It
// hands the payload to the form once solved, and null while it isn't.
//
// A payload works once: remount it (change its `key`) after every submit to get a new one.

type CaptchaState = 'loading' | 'verifying' | 'verified' | 'error';

// The widget's own checkbox looks nothing like the site, and there's nothing to click (it solves
// on load): it stays in the page, out of sight, and this line tells how it's going instead.
const hiddenWidgetClassName =
  'pointer-events-none absolute size-px overflow-hidden opacity-0 [clip-path:inset(50%)]';

const STATUS: Record<CaptchaState, { mark: string; text: string; className: string }> = {
  loading: {
    mark: '[··]',
    text: 'verificando que no sos un bot…',
    className: 'text-muted-foreground',
  },
  verifying: {
    mark: '[··]',
    text: 'verificando que no sos un bot…',
    className: 'text-muted-foreground',
  },
  verified: {
    mark: '[ok]',
    text: 'humano verificado',
    className: 'text-pcnGreen',
  },
  error: {
    mark: '[!!]',
    text: 'no pudimos verificarte',
    className: 'text-amber-400',
  },
};

export function CaptchaField({
  onChange,
  onRetry,
}: {
  onChange: (_payload: string | null) => void;
  /** Starts over with a new challenge, after an error or when the solved one expired. */
  onRetry?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<CaptchaState>('loading');

  // A web component: it only exists in the browser.
  useEffect(() => {
    let cancelled = false;
    import('altcha')
      .then(() => import('altcha/i18n/es-419'))
      .then(() => !cancelled && setLoaded(true))
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const widget = ref.current;
    if (!loaded || !widget) return;
    const onStateChange = (event: Event) => {
      const { state: next, payload } = (
        event as CustomEvent<{ state: string; payload: string | null }>
      ).detail;
      onChange(next === 'verified' ? payload : null);
      if (next === 'verified') setState('verified');
      else if (next === 'error') setState('error');
      // A solved challenge that expired is solved again right away.
      else if (next === 'expired' && onRetry) onRetry();
      else setState('verifying');
    };
    widget.addEventListener('statechange', onStateChange);
    return () => widget.removeEventListener('statechange', onStateChange);
  }, [loaded, onChange, onRetry]);

  const status = STATUS[state];
  const working = state === 'loading' || state === 'verifying';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative flex h-9 items-center gap-2 rounded-sm border bg-black/40 px-3 font-mono text-[11px] transition-colors',
        state === 'verified'
          ? 'border-pcnGreen-500 shadow-[0_0_16px_-8px_rgba(4,244,190,0.8)]'
          : state === 'error'
            ? 'border-amber-400/50'
            : 'border-dashed border-pcnGreen-200',
      )}
    >
      <span aria-hidden className="text-pcnGreen-500 select-none">
        $
      </span>
      <span
        aria-hidden
        className={cn('tabular-nums', status.className, working && 'animate-pulse')}
      >
        {status.mark}
      </span>
      <span className={status.className}>{status.text}</span>
      {state === 'verified' && (
        <span className="ml-auto text-[10px] text-muted-foreground">proof-of-work</span>
      )}
      {state === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto text-pcnGreen-700 underline-offset-2 hover:text-pcnGreen hover:underline"
        >
          reintentar
        </button>
      )}
      {loaded && (
        <altcha-widget
          ref={ref}
          challenge="/api/captcha"
          auto="onload"
          language="es-419"
          configuration={JSON.stringify({ hideLogo: true, hideFooter: true })}
          aria-hidden
          className={hiddenWidgetClassName}
        />
      )}
    </div>
  );
}

/** Message for a CAPTCHA_FAILED result (the server rejected the payload). */
export const CAPTCHA_FAILED_MESSAGE =
  'No pudimos verificar que no sos un bot. Esperá a que se verifique y probá de nuevo.';

/**
 * The captcha state of a form: the `field` to render, the solved `payload` (null until it's
 * ready, so the form can wait for it) and `renew`, to call after every submit.
 */
export function useCaptcha() {
  const [payload, setPayload] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const renew = useCallback(() => {
    setPayload(null);
    setAttempt((current) => current + 1);
  }, []);

  return {
    payload,
    renew,
    field: <CaptchaField key={attempt} onChange={setPayload} onRetry={renew} />,
  };
}
