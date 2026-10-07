'use client';

import { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { UserCombobox } from '@/components/admin/user-combobox';
import { Input } from '@/components/ui/input';

export interface FlyerDesigner {
  flyerSrc: string;
  userId?: string | null;
  name: string;
}

interface FlyerDesignersFieldProps {
  flyers: string[];
  value: FlyerDesigner[];
  onChange: (_designers: FlyerDesigner[]) => void;
}

/** Who designed one flyer: chips for the people credited, a user search and a free-text name. */
function FlyerRow({
  src,
  index,
  designers,
  onAdd,
  onRemove,
}: {
  src: string;
  index: number;
  designers: FlyerDesigner[];
  onAdd: (_designer: Omit<FlyerDesigner, 'flyerSrc'>) => void;
  onRemove: (_designer: FlyerDesigner) => void;
}) {
  const [name, setName] = useState('');
  const addName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, userId: null });
    setName('');
  };

  return (
    <li className="flex gap-3 border-b border-pcnGreen-200 p-3 last:border-b-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Flyer ${index + 1}`}
        className="h-20 w-16 shrink-0 rounded-sm object-cover ring-1 ring-pcnGreen-200"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">
          flyer {index + 1} ·{' '}
          {designers.length === 0
            ? 'sin diseñador'
            : `${designers.length} ${designers.length === 1 ? 'diseñador' : 'diseñadores'}`}
        </p>
        {designers.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {designers.map((designer) => (
              <li
                key={`${designer.userId ?? ''}-${designer.name}`}
                className="flex h-7 items-center gap-1.5 rounded-sm border border-pcnGreen-400 bg-pcnGreen/10 pl-2 pr-1 font-mono text-[11px] text-pcnGreen"
              >
                <Palette className="size-3" aria-hidden />
                {designer.userId ? '@' : ''}
                {designer.name}
                <button
                  type="button"
                  onClick={() => onRemove(designer)}
                  aria-label={`Quitar a ${designer.name}`}
                  className="flex size-5 items-center justify-center rounded-sm hover:bg-pcnGreen/20"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <UserCombobox
            className="min-w-48 flex-1"
            placeholder="buscar usuario"
            excludeIds={designers.flatMap((designer) => (designer.userId ? [designer.userId] : []))}
            onSelect={(user) => onAdd({ userId: user.id, name: user.name })}
          />
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              addName();
            }}
            onBlur={addName}
            placeholder="o un nombre sin cuenta + Enter"
            aria-label={`Agregar un diseñador sin cuenta al flyer ${index + 1}`}
            maxLength={80}
            className="h-8 min-w-48 flex-1"
          />
        </div>
      </div>
    </li>
  );
}

/**
 * Credits for each uploaded flyer: none, one or several designers, people with an account or
 * just a name. Designers of a flyer that gets removed are dropped when saving.
 */
export function FlyerDesignersField({ flyers, value, onChange }: FlyerDesignersFieldProps) {
  if (flyers.length === 0)
    return (
      <p className="font-mono text-xs text-muted-foreground">
        Subí un flyer para darle crédito a quien lo diseñó.
      </p>
    );

  return (
    <ul className="rounded-sm border border-pcnGreen-200">
      {flyers.map((src, index) => {
        const designers = value.filter((designer) => designer.flyerSrc === src);
        return (
          <FlyerRow
            key={src}
            src={src}
            index={index}
            designers={designers}
            onAdd={(designer) => {
              const duplicate = designers.some((d) =>
                designer.userId
                  ? d.userId === designer.userId
                  : !d.userId && d.name.toLowerCase() === designer.name.toLowerCase(),
              );
              if (!duplicate) onChange([...value, { ...designer, flyerSrc: src }]);
            }}
            onRemove={(designer) => onChange(value.filter((d) => d !== designer))}
          />
        );
      })}
    </ul>
  );
}
