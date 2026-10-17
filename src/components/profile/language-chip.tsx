import { Check, Plus } from 'lucide-react';
import { findProgrammingLanguage } from '@/types/programming-language';
import { cn } from '@/lib/utils';

const hexToRgb = (hex: string) => {
  const value = parseInt(hex.replace('#', ''), 16);
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
};

/**
 * A programming language as a terminal token: its file extension in the language's color,
 * plus its name. With `selectable`, it renders as a toggle for the profile form.
 */
export function LanguageChip({
  languageId,
  selectable = false,
  selected = false,
  onToggle,
}: {
  languageId: string;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const language = findProgrammingLanguage(languageId);
  const name = language?.name ?? languageId;
  const ext = language?.ext ?? languageId.slice(0, 3);
  const rgb = hexToRgb(language?.color ?? '#04f4be');
  const lit = !selectable || selected;

  const content = (
    <>
      <span
        className="flex h-5 min-w-7 items-center justify-center px-1 text-[10px] font-bold lowercase transition-colors"
        style={{
          color: lit ? `rgb(${rgb})` : undefined,
          background: `rgba(${rgb},${lit ? 0.14 : 0.05})`,
          textShadow: lit ? `0 0 8px rgba(${rgb},0.7)` : undefined,
        }}
      >
        .{ext}
      </span>
      <span className={cn('pr-1', lit ? 'text-foreground' : 'text-muted-foreground')}>{name}</span>
      {selectable &&
        (selected ? (
          <Check className="mr-1 size-3" style={{ color: `rgb(${rgb})` }} />
        ) : (
          <Plus className="mr-1 size-3 opacity-50" />
        ))}
    </>
  );

  const className = cn(
    'inline-flex items-center gap-1.5 border p-0.5 font-mono text-[11px] transition-[border-color,box-shadow,opacity] duration-200',
    !lit && 'border-pcnGreen-200 opacity-70 hover:opacity-100',
  );
  const style = lit
    ? {
        borderColor: `rgba(${rgb},0.5)`,
        boxShadow: `0 0 12px -6px rgba(${rgb},0.9)`,
      }
    : undefined;

  if (!selectable) {
    return (
      <span className={className} style={style}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        className,
        'focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:outline-hidden',
      )}
      style={style}
    >
      {content}
    </button>
  );
}
