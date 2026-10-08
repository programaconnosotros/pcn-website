'use client';

import { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { UserCombobox } from '@/components/admin/user-combobox';
import { Input } from '@/components/ui/input';

export interface FlyerDesigner {
  userId?: string | null;
  name: string;
}

interface FlyerDesignersFieldProps {
  flyers: string[];
  value: FlyerDesigner[];
  onChange: (_designers: FlyerDesigner[]) => void;
}

/**
 * Who designed the event's flyer, all its images at once: chips for the people credited, a user
 * search and a free-text name. Designers are dropped when saving an event without a flyer.
 */
export function FlyerDesignersField({ flyers, value, onChange }: FlyerDesignersFieldProps) {
  const [name, setName] = useState('');

  if (flyers.length === 0)
    return (
      <p className="font-mono text-xs text-muted-foreground">
        Subí un flyer para darle crédito a quien lo diseñó.
      </p>
    );

  const add = (designer: FlyerDesigner) => {
    const duplicate = value.some((d) =>
      designer.userId
        ? d.userId === designer.userId
        : !d.userId && d.name.toLowerCase() === designer.name.toLowerCase(),
    );
    if (!duplicate) onChange([...value, designer]);
  };
  const addName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    add({ name: trimmed, userId: null });
    setName('');
  };

  return (
    <div className="flex gap-3 rounded-sm border border-pcnGreen-200 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flyers[0]}
        alt="Flyer"
        className="h-20 w-16 shrink-0 rounded-sm object-cover ring-1 ring-pcnGreen-200"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">
          {flyers.length === 1 ? 'flyer' : `flyer · ${flyers.length} imágenes`} ·{' '}
          {value.length === 0
            ? 'sin diseñador'
            : `${value.length} ${value.length === 1 ? 'diseñador' : 'diseñadores'}`}
        </p>
        {value.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {value.map((designer) => (
              <li
                key={`${designer.userId ?? ''}-${designer.name}`}
                className="flex h-7 items-center gap-1.5 rounded-sm border border-pcnGreen-400 bg-pcnGreen/10 pr-1 pl-2 font-mono text-[11px] text-pcnGreen"
              >
                <Palette className="size-3" aria-hidden />
                {designer.userId ? '@' : ''}
                {designer.name}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((d) => d !== designer))}
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
            excludeIds={value.flatMap((designer) => (designer.userId ? [designer.userId] : []))}
            onSelect={(user) => add({ userId: user.id, name: user.name })}
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
            aria-label="Agregar un diseñador sin cuenta"
            maxLength={80}
            className="h-8 min-w-48 flex-1"
          />
        </div>
      </div>
    </div>
  );
}
