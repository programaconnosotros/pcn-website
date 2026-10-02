'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfileFormData } from '@/schemas/profile-schema';

export const MAX_POSITIONS = 5;

// Lista editable de puestos actuales: cargo + empresa por fila, hasta MAX_POSITIONS.
export const PositionsField = () => {
  const { control, register, formState } = useFormContext<ProfileFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'positions' });

  return (
    <div className="space-y-2">
      {fields.length > 0 ? (
        <div
          aria-hidden
          className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-pcnGreen-700 sm:flex"
        >
          <span className="w-5 text-right text-pcnGreen-500">#</span>
          <span className="grid flex-1 grid-cols-[1fr_auto_1fr] gap-2">
            <span>cargo</span>
            <span className="invisible">@</span>
            <span>empresa</span>
          </span>
          <span className="w-6" />
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$</span> ls ./trabajo{' '}
          <span className="text-muted-foreground/60">— vacío por ahora, no pasa nada</span>
        </p>
      )}
      <ol className="space-y-2">
        {fields.map((field, index) => {
          const errors = formState.errors.positions?.[index];
          return (
            <li key={field.id} className="group flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-pcnGreen-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <Input
                    aria-label={`Cargo del puesto ${index + 1}`}
                    placeholder="Ej: Desarrollador Frontend"
                    {...register(`positions.${index}.jobTitle`)}
                  />
                  <span className="hidden font-mono text-xs text-pcnGreen-500 sm:block">@</span>
                  <Input
                    aria-label={`Empresa del puesto ${index + 1}`}
                    placeholder="Ej: Google"
                    {...register(`positions.${index}.enterprise`)}
                  />
                </div>
                {(errors?.jobTitle || errors?.enterprise) && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.jobTitle?.message ?? errors.enterprise?.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1.5 shrink-0 p-1 text-muted-foreground transition-colors hover:text-red-500"
                aria-label={`Quitar puesto ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ol>

      {fields.length < MAX_POSITIONS && (
        <button
          type="button"
          onClick={() => append({ jobTitle: '', enterprise: '' })}
          className="ml-7 flex items-center gap-1.5 font-mono text-xs text-pcnGreen-600 transition-colors hover:text-pcnGreen"
        >
          <Plus className="h-3.5 w-3.5" />
          agregar puesto
        </button>
      )}
      {formState.errors.positions?.message && (
        <p className="text-sm text-red-500">{formState.errors.positions.message}</p>
      )}
    </div>
  );
};
