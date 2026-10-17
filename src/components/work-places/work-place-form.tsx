'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createWorkPlace, updateWorkPlace } from '@/actions/work-places/work-places';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  workPlaceSchema,
  type WorkPlaceData,
  type WorkPlaceInput,
} from '@/schemas/work-place-schema';

const Error = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

/** Five buttons to pick a 1–5 score, like `[1][2][3][4][5]`. */
const RatingPicker = ({
  label,
  hint,
  value,
  onChange,
  error,
}: {
  label: string;
  hint: string;
  value: number | null | undefined;
  onChange: (_value: number) => void;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <p className="flex items-baseline justify-between gap-2">
      <span className="font-mono text-xs">{label}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>
    </p>
    <div role="radiogroup" aria-label={label} className="flex h-8 gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${label}: ${score}`}
          onClick={() => onChange(score)}
          className={cn(
            'h-full flex-1 rounded-sm border font-mono text-xs transition-colors',
            value && score <= value
              ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
              : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500',
          )}
        >
          {score}
        </button>
      ))}
    </div>
    <Error message={error} />
  </div>
);

const EMPTY: WorkPlaceInput = {
  name: '',
  city: '',
  address: '',
  googleMapsUrl: '',
  wifi: 0,
  plugs: 0,
  calls: 0,
  // With food (the default) both scores are required: 0 is "not picked yet".
  foodQuality: 0,
  foodVariety: 0,
  notes: '',
  photoUrl: '',
};

export function WorkPlaceForm({
  place,
  onDone,
}: {
  /** The place to edit; without it the form adds a new one. */
  place?: { id: string } & WorkPlaceInput;
  onDone: () => void;
}) {
  const [hasFood, setHasFood] = useState(place ? place.foodQuality !== null : true);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkPlaceInput, unknown, WorkPlaceData>({
    resolver: zodResolver(workPlaceSchema),
    defaultValues: place ?? EMPTY,
  });

  const onSubmit = async (data: WorkPlaceData) => {
    try {
      if (place) {
        await updateWorkPlace(place.id, data);
        toast.success('Lugar actualizado');
      } else {
        await createWorkPlace(data);
        toast.success('¡Gracias! Ya está en la lista');
      }
      onDone();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al guardar el lugar'));
    }
  };

  const rating = (
    name: 'wifi' | 'plugs' | 'calls' | 'foodQuality' | 'foodVariety',
    label: string,
    hint: string,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RatingPicker
          label={label}
          hint={hint}
          value={field.value}
          onChange={field.onChange}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="work-place-name">nombre</Label>
          <Input id="work-place-name" placeholder="Ej: Café Tortoni" {...register('name')} />
          <Error message={errors.name?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="work-place-city">ciudad</Label>
          <Input
            id="work-place-city"
            placeholder="Ej: San Miguel de Tucumán"
            {...register('city')}
          />
          <Error message={errors.city?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="work-place-address">dirección</Label>
          <Input id="work-place-address" placeholder="Opcional" {...register('address')} />
          <Error message={errors.address?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="work-place-maps">google maps</Label>
          <Input
            id="work-place-maps"
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            {...register('googleMapsUrl')}
          />
          <Error message={errors.googleMapsUrl?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {rating('wifi', 'wifi', 'qué tan bueno es')}
        {rating('plugs', 'enchufes', 'mesas con enchufe')}
        {rating('calls', 'para llamadas', 'qué tan tranquilo')}
      </div>

      <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="accent-pcnGreen"
          checked={hasFood}
          onChange={(event) => {
            setHasFood(event.target.checked);
            setValue('foodQuality', event.target.checked ? 0 : null);
            setValue('foodVariety', event.target.checked ? 0 : null);
          }}
        />
        tiene comida
      </label>
      {hasFood && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rating('foodQuality', 'comida', 'qué tan rica')}
          {rating('foodVariety', 'variedad', 'cuántas opciones')}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="work-place-notes">comentarios</Label>
        <Textarea
          id="work-place-notes"
          rows={3}
          placeholder="Horarios, si te dejan quedarte horas, qué pedir…"
          {...register('notes')}
        />
        <Error message={errors.notes?.message} />
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-xs">foto (opcional)</p>
        <Controller
          control={control}
          name="photoUrl"
          render={({ field }) => (
            <FileUpload value={field.value ?? ''} onChange={field.onChange} folder="work-places" />
          )}
        />
        <Error message={errors.photoUrl?.message} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting} loadingText="guardando...">
          {place ? 'guardar();' : 'sumarLugar();'}
        </Button>
      </div>
    </form>
  );
}
