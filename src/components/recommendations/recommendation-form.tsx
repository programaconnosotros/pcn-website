'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { checkboxClassName } from '@/components/ui/field-surface';
import { dialogFormActionBarClassName } from '@/components/ui/form-action-bar';
import { cn } from '@/lib/utils';
import {
  ADMIN_FIELDS,
  REQUIRED_TO_SUBMIT,
  SUBMIT_FIELDS,
  fieldLabel,
  type RecommendationFieldName,
  type RecommendationFormValues,
  type RecommendationKindValue,
} from '@/schemas/recommendation-schema';

const CHECKBOXES = new Set<RecommendationFieldName>([
  'isTalk',
  'isMadeByCommunity',
  'acceptDonations',
]);
const TEXTAREAS = new Set<RecommendationFieldName>(['description', 'note', 'youtubeUrls']);
// Long values get the whole row; the short ones pair up two per row.
const FULL_WIDTH = new Set<RecommendationFieldName>([
  'url',
  'title',
  'categories',
  'imageUrl',
  ...TEXTAREAS,
]);

const PLACEHOLDERS: Partial<Record<RecommendationFieldName, string>> = {
  url: 'https://',
  coauthors: 'separados por coma',
  categories: 'IA, Arquitectura…',
  duration: '34:31',
  hours: '12',
  year: '2024',
  isbn: '0132350882',
  imageUrl: 'https:// o /lectura/tapa.webp',
  youtubeUrls: 'un link de youtube por línea',
  description: 'de qué trata, en una o dos oraciones',
  note: 'contale a los admins por qué vale la pena (opcional)',
};

const KIND_PLACEHOLDERS: Partial<
  Record<RecommendationKindValue, Partial<Record<RecommendationFieldName, string>>>
> = {
  VIDEO: {
    url: 'https://www.youtube.com/watch?v=…',
    source: 'se completa solo',
    author: 'opcional',
  },
};

type Props = {
  kind: RecommendationKindValue;
  initialValues: RecommendationFormValues;
  /** Admins see and edit every field of the listing, members only what they recommend. */
  asAdmin?: boolean;
  submitLabel: string;
  /** Resolves to an error message to show, or null when it worked. */
  onSubmit: (_values: RecommendationFormValues) => Promise<string | null>;
  onCancel?: () => void;
};

/** The fields of one kind of recommendation, in the terminal form style. */
export function RecommendationForm({
  kind,
  initialValues,
  asAdmin = false,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fields = [...SUBMIT_FIELDS[kind], ...(asAdmin ? ADMIN_FIELDS[kind] : [])];
  // The note is the last thing a member writes; for admins it goes after everything else.
  const ordered = [...fields.filter((field) => field !== 'note'), 'note' as const];
  const required = new Set(REQUIRED_TO_SUBMIT[kind]);

  const set = <K extends RecommendationFieldName>(field: K, value: RecommendationFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      setError(await onSubmit(values));
    } finally {
      setSaving(false);
    }
  };

  const renderControl = (field: RecommendationFieldName, id: string) => {
    const placeholder = KIND_PLACEHOLDERS[kind]?.[field] ?? PLACEHOLDERS[field];
    if (field === 'language') {
      return (
        <Select
          value={values.language}
          onValueChange={(value) => set('language', value as 'es' | 'en')}
        >
          <SelectTrigger id={id} aria-label={fieldLabel(kind, field)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">español</SelectItem>
            <SelectItem value="en">inglés</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    if (field === 'publishedAt') {
      return (
        <DateInput
          id={id}
          value={values.publishedAt}
          onChange={(value) => set('publishedAt', value)}
          aria-label={fieldLabel(kind, field)}
        />
      );
    }
    const value = values[field] as string;
    if (TEXTAREAS.has(field)) {
      return (
        <Textarea
          id={id}
          value={value}
          rows={field === 'youtubeUrls' ? 3 : 2}
          placeholder={placeholder}
          onChange={(event) => set(field, event.target.value)}
          className="min-h-0"
        />
      );
    }
    return (
      <Input
        id={id}
        value={value}
        type={field === 'url' || field === 'imageUrl' ? 'url' : 'text'}
        inputMode={['year', 'hours'].includes(field) ? 'numeric' : undefined}
        placeholder={placeholder}
        required={required.has(field)}
        onChange={(event) => set(field, event.target.value)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
        {ordered
          .filter((field) => !CHECKBOXES.has(field))
          .map((field) => {
            const id = `recommendation-${kind}-${field}`;
            return (
              <div
                key={field}
                className={cn(
                  'group/field flex min-w-0 flex-col gap-1.5',
                  FULL_WIDTH.has(field) && 'sm:col-span-2',
                )}
              >
                <Label htmlFor={id} className="max-w-full truncate whitespace-nowrap">
                  {fieldLabel(kind, field)}
                  {required.has(field) && <span className="text-pcnGreen">*</span>}
                </Label>
                {renderControl(field, id)}
              </div>
            );
          })}
      </div>

      {ordered.some((field) => CHECKBOXES.has(field)) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {ordered
            .filter((field) => CHECKBOXES.has(field))
            .map((field) => (
              <label
                key={field}
                className="flex cursor-pointer items-center gap-2 font-mono text-xs text-muted-foreground"
              >
                <input
                  type="checkbox"
                  className={checkboxClassName}
                  checked={values[field] as boolean}
                  onChange={(event) => set(field, event.target.checked)}
                />
                {fieldLabel(kind, field)}
              </label>
            ))}
        </div>
      )}

      {error && (
        <p role="alert" className="font-mono text-xs text-red-400">
          <span className="text-red-500">error:</span> {error}
        </p>
      )}

      <div className={cn(dialogFormActionBarClassName, 'flex justify-end gap-2')}>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            cancelar
          </Button>
        )}
        <Button type="submit" variant="pcn" size="sm" disabled={saving}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {saving ? 'enviando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
