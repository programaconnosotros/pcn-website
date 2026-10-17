'use client';

import { useEffect, useState } from 'react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

type Token = { name: string; use: string };

// Semantic tokens from globals.css (`.dark`), painted with the live CSS variable.
const semanticTokens: Token[] = [
  { name: 'background', use: 'fondo de toda la pantalla' },
  { name: 'foreground', use: 'texto principal' },
  { name: 'card', use: 'paneles y popovers' },
  { name: 'primary', use: 'acento, ring de foco' },
  { name: 'secondary', use: 'botón secondary' },
  { name: 'secondary-foreground', use: 'texto sobre secondary' },
  { name: 'muted', use: 'fondos apagados' },
  { name: 'muted-foreground', use: 'meta y descripciones' },
  { name: 'accent', use: 'item resaltado' },
  { name: 'accent-foreground', use: 'texto resaltado' },
  { name: 'border', use: 'borde por defecto' },
  { name: 'input', use: 'borde de campos' },
  { name: 'destructive', use: 'errores y borrar' },
];

// The accent scale from the @theme block in globals.css: the same #04f4be at growing opacity.
const greenScale: Token[] = [
  { name: '50', use: 'fondos muy sutiles' },
  { name: '100', use: 'fondo de badge, skeleton' },
  { name: '200', use: 'hairlines' },
  { name: '300', use: 'bordes de badges' },
  { name: '400', use: 'borde de paneles y menús' },
  { name: '500', use: 'prompts: $ ## > ›' },
  { name: '600', use: 'texto de prompt' },
  { name: '700', use: 'texto secundario verde' },
  { name: '800', use: 'labels' },
  { name: '900', use: 'texto de botón outline' },
  { name: 'DEFAULT', use: 'acento puro #04f4be' },
];

const useCssVariables = (names: string[]) => {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()])));
    // The token lists are static.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return values;
};

const Swatch = ({
  color,
  name,
  value,
  use,
}: {
  color: string;
  name: string;
  value?: string;
  use: string;
}) => (
  <div className={cn(ruledCellClassName, 'flex items-center gap-3 p-2')}>
    <span
      className="size-9 shrink-0 rounded-sm border border-pcnGreen-200"
      style={{ background: color }}
    />
    <div className="min-w-0 font-mono">
      <p className="truncate text-xs text-foreground">{name}</p>
      <p className="truncate text-[10px] text-pcnGreen-600">{value || '…'}</p>
      <p className="truncate text-[10px] text-muted-foreground">{use}</p>
    </div>
  </div>
);

export const SemanticSwatches = () => {
  const values = useCssVariables(semanticTokens.map((token) => `--${token.name}`));
  return (
    <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {semanticTokens.map((token) => (
        <Swatch
          key={token.name}
          color={`hsl(var(--${token.name}))`}
          name={`--${token.name}`}
          value={values[`--${token.name}`] && `hsl(${values[`--${token.name}`]})`}
          use={token.use}
        />
      ))}
    </RuledGrid>
  );
};

const greenVariable = (step: string) => (step === 'DEFAULT' ? '--pcnGreen' : `--pcnGreen-${step}`);

export const GreenScale = () => {
  const values = useCssVariables(greenScale.map((token) => greenVariable(token.name)));
  return (
    <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {greenScale.map((token) => (
        <Swatch
          key={token.name}
          color={`var(${greenVariable(token.name)})`}
          name={token.name === 'DEFAULT' ? 'pcnGreen' : `pcnGreen-${token.name}`}
          value={values[greenVariable(token.name)]}
          use={token.use}
        />
      ))}
    </RuledGrid>
  );
};
