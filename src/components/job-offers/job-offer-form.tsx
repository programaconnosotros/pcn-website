'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createJobOffer, updateJobOffer } from '@/actions/job-offers/job-offers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  JOB_MODALITIES,
  JOB_SENIORITIES,
  JOB_TYPES,
  jobOfferSchema,
  type JobOfferData,
  type JobOfferInput,
} from '@/schemas/job-offer-schema';

const Error = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

/** One button per option, like the rest of the site's pickers: `[remoto][híbrido][presencial]`. */
const OptionPicker = ({
  label,
  options,
  value,
  onChange,
  optional,
  error,
}: {
  label: string;
  options: Record<string, string>;
  value: string | null | undefined;
  onChange: (_value: string | null) => void;
  optional?: boolean;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <p className="flex w-fit items-center gap-1.5 font-mono text-[11px] leading-none font-medium tracking-[0.14em] text-pcnGreen-800 uppercase before:text-pcnGreen-500 before:content-['>']">
      {label}
      {optional && (
        <span className="tracking-normal text-muted-foreground normal-case">(opcional)</span>
      )}
    </p>
    <div role="radiogroup" aria-label={label} className="flex min-h-8 flex-wrap gap-1">
      {Object.entries(options).map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(optional && value === id ? null : id)}
          className={cn(
            'h-8 rounded-sm border px-2.5 font-mono text-xs transition-colors',
            value === id
              ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
              : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500',
          )}
        >
          {text}
        </button>
      ))}
    </div>
    <Error message={error} />
  </div>
);

const EMPTY: JobOfferInput = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  modality: 'remoto',
  seniority: null,
  description: '',
  tags: [],
  applyUrl: '',
};

export function JobOfferForm({
  offer,
  onDone,
}: {
  /** The offer to edit; without it the form posts a new one. */
  offer?: { id: string } & JobOfferInput;
  onDone: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobOfferInput, unknown, JobOfferData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: offer ?? EMPTY,
  });

  const onSubmit = async (data: JobOfferData) => {
    try {
      if (offer) {
        await updateJobOffer(offer.id, data);
        toast.success('Oferta actualizada');
      } else {
        await createJobOffer(data);
        toast.success('¡Publicada! Ya la ve toda la comunidad');
      }
      onDone();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al guardar la oferta'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="job-title">puesto</Label>
          <Input id="job-title" placeholder="Ej: Frontend developer" {...register('title')} />
          <Error message={errors.title?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job-company">empresa</Label>
          <Input id="job-company" placeholder="Ej: Acme" {...register('company')} />
          <Error message={errors.company?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job-location">dónde</Label>
          <Input
            id="job-location"
            placeholder="Ej: Córdoba, Argentina o LATAM"
            {...register('location')}
          />
          <Error message={errors.location?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job-apply">cómo postularse</Label>
          <Input
            id="job-apply"
            placeholder="https://… o email"
            autoComplete="off"
            {...register('applyUrl')}
          />
          <Error message={errors.applyUrl?.message} />
        </div>
      </div>

      <Controller
        control={control}
        name="modality"
        render={({ field }) => (
          <OptionPicker
            label="modalidad"
            options={JOB_MODALITIES}
            value={field.value}
            onChange={field.onChange}
            error={errors.modality?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <OptionPicker
            label="jornada"
            options={JOB_TYPES}
            value={field.value}
            onChange={field.onChange}
            error={errors.type?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="seniority"
        render={({ field }) => (
          <OptionPicker
            label="seniority"
            options={JOB_SENIORITIES}
            value={field.value}
            onChange={field.onChange}
            optional
          />
        )}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <div className="space-y-1.5">
            <Label htmlFor="job-tags">tecnologías</Label>
            <Input
              id="job-tags"
              placeholder="React, TypeScript, AWS (separadas por coma)"
              defaultValue={field.value.join(', ')}
              onChange={(event) =>
                field.onChange(
                  event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
            />
            <Error message={errors.tags?.message ?? errors.tags?.root?.message} />
          </div>
        )}
      />

      <div className="space-y-1.5">
        <Label htmlFor="job-description">descripción</Label>
        <Textarea
          id="job-description"
          rows={6}
          placeholder="Qué vas a hacer, qué buscan, beneficios, rango salarial si lo podés compartir…"
          {...register('description')}
        />
        <Error message={errors.description?.message} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting} loadingText="publicando...">
          {offer ? 'guardar();' : 'publicarOferta();'}
        </Button>
      </div>
    </form>
  );
}
