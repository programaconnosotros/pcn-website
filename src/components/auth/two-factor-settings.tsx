'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Download, KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
} from '@/actions/auth/two-factor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Step =
  | { kind: 'idle' }
  | { kind: 'setup'; secret: string; qr: string }
  | { kind: 'codes'; codes: string[] }
  | { kind: 'confirm'; action: 'disable' | 'regenerate' };

const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' });

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const text = codes.join('\n');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground/90">
        Guardá estos códigos en un lugar seguro. Cada uno sirve <strong>una sola vez</strong> para
        entrar si perdés el teléfono, y no los vas a volver a ver.
      </p>
      <ol className="grid grid-cols-2 gap-x-6 gap-y-1 border border-dashed border-pcnGreen-200 p-3 font-mono text-sm sm:grid-cols-5 sm:gap-x-4">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            navigator.clipboard
              .writeText(text)
              .then(() => toast.success('Códigos copiados'))
              .catch(() => toast.error('No se pudieron copiar'))
          }
        >
          <Copy className="mr-1.5 size-3.5" />
          copiar
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(`programaConNosotros — códigos de recuperación\n\n${text}\n`)}`}
            download="pcn-codigos-de-recuperacion.txt"
          >
            <Download className="mr-1.5 size-3.5" />
            descargar .txt
          </a>
        </Button>
        <Button type="button" variant="pcn" size="sm" onClick={onDone} className="ml-auto">
          ya los guardé
        </Button>
      </div>
    </div>
  );
}

// The account's optional second factor: set it up with an authenticator app, see how many
// recovery codes are left, get new ones or turn it off.
export function TwoFactorSettings({
  enabledAt,
  recoveryCodesLeft,
}: {
  enabledAt: string | null;
  recoveryCodesLeft: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const run = (work: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await work();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo completar la acción'));
      }
    });

  const finish = () => {
    setStep({ kind: 'idle' });
    setCode('');
    router.refresh();
  };

  const codeInput = (label: string, placeholder = '123456') => (
    <Input
      aria-label={label}
      value={code}
      onChange={(event) => setCode(event.target.value)}
      inputMode={placeholder === '123456' ? 'numeric' : 'text'}
      autoComplete="one-time-code"
      placeholder={placeholder}
      maxLength={20}
      className="h-9 w-40 font-mono"
    />
  );

  return (
    <section aria-labelledby="two-factor-title" className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        {enabledAt ? (
          <ShieldCheck className="size-4 text-pcnGreen" aria-hidden />
        ) : (
          <ShieldOff className="size-4 text-muted-foreground" aria-hidden />
        )}
        <h2 id="two-factor-title" className="font-mono text-sm text-foreground">
          verificación en dos pasos
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {enabledAt
            ? `activada desde el ${dateFormat.format(new Date(enabledAt))}`
            : 'desactivada'}
        </span>
      </header>

      {step.kind === 'codes' && <RecoveryCodes codes={step.codes} onDone={finish} />}

      {step.kind === 'setup' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- an inline SVG data URL */}
          <img
            src={step.qr}
            alt="Código QR para la app de autenticación"
            width={176}
            height={176}
            className="size-44 shrink-0 bg-white p-2"
          />
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              run(async () => {
                const { recoveryCodes } = await confirmTwoFactorSetup(code);
                setCode('');
                setStep({ kind: 'codes', codes: recoveryCodes });
                toast.success('Verificación en dos pasos activada');
              });
            }}
          >
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-foreground/90">
              <li>Escaneá el QR con Google Authenticator, 1Password, Authy o la que uses.</li>
              <li>
                ¿No podés escanearlo? Cargá esta clave a mano:{' '}
                <code className="bg-pcnGreen/10 px-1 font-mono text-xs break-all text-pcnGreen">
                  {step.secret}
                </code>
              </li>
              <li>Ingresá el código de 6 dígitos que muestra la app.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              {codeInput('Código de la app')}
              <Button
                type="submit"
                variant="pcn"
                size="sm"
                loading={isPending}
                loadingText="verificando..."
              >
                activar();
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={finish}>
                cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {step.kind === 'confirm' && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            run(async () => {
              if (step.action === 'disable') {
                await disableTwoFactor(code);
                toast.success('Verificación en dos pasos desactivada');
                finish();
              } else {
                const { recoveryCodes } = await regenerateRecoveryCodes(code);
                setCode('');
                setStep({ kind: 'codes', codes: recoveryCodes });
              }
            });
          }}
        >
          <p className="text-sm text-muted-foreground">
            {step.action === 'disable'
              ? 'Para desactivarla, ingresá un código de la app o uno de recuperación.'
              : 'Ingresá un código de la app: los códigos de recuperación viejos dejan de servir.'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {codeInput(
              step.action === 'disable' ? 'Código de la app o de recuperación' : 'Código de la app',
              step.action === 'disable' ? '123456 o abcd-efgh' : '123456',
            )}
            <Button
              type="submit"
              variant={step.action === 'disable' ? 'destructive' : 'pcn'}
              size="sm"
              loading={isPending}
              loadingText="verificando..."
            >
              {step.action === 'disable' ? 'desactivar();' : 'generarCódigos();'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={finish}>
              cancelar
            </Button>
          </div>
        </form>
      )}

      {step.kind === 'idle' &&
        (enabledAt ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <KeyRound className="size-3.5" aria-hidden />
              {recoveryCodesLeft} {recoveryCodesLeft === 1 ? 'código' : 'códigos'} de recuperación
              disponibles
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep({ kind: 'confirm', action: 'regenerate' })}
            >
              generar códigos nuevos
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep({ kind: 'confirm', action: 'disable' })}
            >
              desactivar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              Opcional. Además de la contraseña, al iniciar sesión te vamos a pedir un código de una
              app de autenticación en tu teléfono.
            </p>
            <Button
              type="button"
              variant="pcn"
              size="sm"
              loading={isPending}
              loadingText="preparando..."
              onClick={() =>
                run(async () => {
                  const { secret, qr } = await startTwoFactorSetup();
                  setStep({ kind: 'setup', secret, qr });
                })
              }
            >
              activar();
            </Button>
          </div>
        ))}
    </section>
  );
}
