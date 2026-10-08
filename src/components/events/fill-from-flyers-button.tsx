'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  fillEventFromFlyers,
  type EventFlyerValues,
} from '@/actions/events/fill-event-from-flyers';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import type { EventFormData } from '@/schemas/event-schema';

type TextField = Exclude<keyof EventFlyerValues, 'isOnline' | 'sponsors'>;

const TEXT_FIELDS: TextField[] = [
  'name',
  'description',
  'date',
  'endDate',
  'city',
  'placeName',
  'address',
  'googleMapsUrl',
  'streamingUrl',
  'externalRegistrationUrl',
  'capacity',
];

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

/**
 * Completa el form del evento con lo que un agente lee de los flyers adjuntos. Solo llena lo que
 * está vacío y agrega los sponsors que faltan: nunca pisa lo que el admin ya escribió.
 */
export function FillFromFlyersButton() {
  const form = useFormContext<EventFormData>();
  const flyers = useWatch({ control: form.control, name: 'flyerImages' }) ?? [];
  const [isRunning, setIsRunning] = useState(false);

  const apply = (values: EventFlyerValues) => {
    const options = { shouldDirty: true, shouldValidate: true };
    let filled = 0;

    for (const field of TEXT_FIELDS) {
      const value = values[field];
      if (value === undefined || !isEmpty(form.getValues(field))) continue;
      form.setValue(field, value, options);
      filled++;
    }

    if (values.isOnline && !form.getValues('isOnline')) {
      form.setValue('isOnline', true, options);
      filled++;
    }

    const sponsors = form.getValues('sponsors') ?? [];
    const known = new Set(sponsors.map((s) => s.name.trim().toLowerCase()));
    const newSponsors = (values.sponsors ?? []).filter(
      (s) => !known.has(s.name.trim().toLowerCase()),
    );
    if (newSponsors.length) {
      form.setValue('sponsors', [...sponsors, ...newSponsors], options);
      filled += newSponsors.length;
    }

    return filled;
  };

  const run = async () => {
    setIsRunning(true);
    try {
      const result = await fillEventFromFlyers(flyers);
      if (result.status === 'failed') {
        toast.error(result.reason);
        return;
      }
      const filled = apply(result.values);
      if (filled) {
        toast.success(
          filled === 1
            ? 'Completé 1 campo con los flyers'
            : `Completé ${filled} campos con los flyers`,
          { description: `${result.notes} Revisalos antes de guardar.` },
        );
      } else {
        toast.info('Los campos que se leen en los flyers ya estaban completos', {
          description: result.notes,
        });
      }
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudieron leer los flyers'));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void run()}
        disabled={!flyers.length || isRunning}
      >
        {isRunning ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-1.5 h-4 w-4" />
        )}
        {isRunning ? 'leyendo flyers…' : 'completarConFlyers();'}
      </Button>
      <p className="font-mono text-xs text-muted-foreground">
        {flyers.length
          ? 'Un agente de IA lee los flyers y completa los campos vacíos del evento.'
          : 'Subí los flyers para completar el evento con IA.'}
      </p>
    </div>
  );
}
