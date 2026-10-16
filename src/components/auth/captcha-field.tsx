'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {} from 'altcha/types/react';

// The captcha of the sign-in forms (src/lib/captcha.ts): the ALTCHA widget solves a proof of work
// in the background as soon as the form shows, so people only see a "verificado" check. It
// hands the payload to the form once solved, and null while it isn't.
//
// A payload works once: remount it (change its `key`) after every submit to get a new one.

// The site's terminal look, through the widget's CSS variables.
const THEME = {
  '--altcha-border-color': 'rgb(4 244 190 / 0.25)',
  '--altcha-border-radius': '2px',
  '--altcha-color-base': 'transparent',
  '--altcha-color-base-content': 'rgb(161 161 170)',
  '--altcha-color-primary': '#04f4be',
  '--altcha-color-primary-content': '#000',
  '--altcha-color-success': '#04f4be',
  '--altcha-checkbox-border-color': 'rgb(4 244 190 / 0.5)',
  '--altcha-max-width': '100%',
} as React.CSSProperties;

export function CaptchaField({ onChange }: { onChange: (_payload: string | null) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A web component: it only exists in the browser.
  useEffect(() => {
    let cancelled = false;
    import('altcha')
      .then(() => import('altcha/i18n/es-419'))
      .then(() => !cancelled && setLoaded(true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const widget = ref.current;
    if (!loaded || !widget) return;
    const onStateChange = (event: Event) => {
      const { state, payload } = (event as CustomEvent<{ state: string; payload: string | null }>)
        .detail;
      onChange(state === 'verified' ? payload : null);
    };
    widget.addEventListener('statechange', onStateChange);
    return () => widget.removeEventListener('statechange', onStateChange);
  }, [loaded, onChange]);

  if (!loaded) {
    return (
      <p className="font-mono text-[11px] text-muted-foreground" role="status">
        <span className="text-pcnGreen-500">$ </span>verificando que no sos un bot…
      </p>
    );
  }

  return (
    <altcha-widget
      ref={ref}
      challenge="/api/captcha"
      auto="onload"
      language="es-419"
      configuration={JSON.stringify({ hideLogo: true, hideFooter: true })}
      style={THEME}
    />
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

  return { payload, renew, field: <CaptchaField key={attempt} onChange={setPayload} /> };
}
