'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fieldClassName } from './field-surface';
import { menuContentClassName } from './menu-surface';

// The site's own date picker, in place of the browser's (which looks different, and out of
// place, on every device). Values are the same strings native inputs use, `YYYY-MM-DD` or, with
// `withTime`, `YYYY-MM-DDTHH:mm`, so forms and filters keep their state and validation as is.

const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const pad = (n: number) => String(n).padStart(2, '0');
/** `YYYY-MM-DD` of a local date. */
export const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Splits a native-input value into its date and `HH:mm` time, ignoring anything malformed. */
export const parseDateValue = (value: string | null | undefined) => {
  const [date = '', time = ''] = (value ?? '').trim().split(/T|\s+/);
  return {
    date: DATE_RE.test(date) ? date : null,
    time: /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : null,
  };
};

/** The 6 weeks (Monday first) shown for a month. */
const monthGrid = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i));
};

const addDays = (value: string, days: number) => {
  const date = fromDateValue(value);
  date.setDate(date.getDate() + days);
  return toDateValue(date);
};

const addMonths = (value: string, months: number) => {
  const date = fromDateValue(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  // Jan 31 + 1 month lands on the last day of February, not in March.
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return toDateValue(date);
};

export interface DateInputProps {
  value: string | null | undefined;
  onChange: (_value: string) => void;
  onBlur?: () => void;
  /** Also pick a time: the value becomes `YYYY-MM-DDTHH:mm`. */
  withTime?: boolean;
  /** Earliest and latest selectable day, as `YYYY-MM-DD`. */
  min?: string;
  max?: string;
  /** Hides the "limpiar" action. */
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Inline trigger without the field box, for compact filter bars. */
  bare?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

const navButtonClassName =
  'flex size-7 items-center justify-center rounded-sm border border-pcnGreen-200 text-pcnGreen-600 transition-colors hover:border-pcnGreen-500 hover:bg-pcnGreen/10 hover:text-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen';

const footerButtonClassName =
  'rounded-sm px-1.5 py-0.5 text-[11px] text-pcnGreen-700 transition-colors hover:bg-pcnGreen/10 hover:text-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen';

/** A scrollable column of two-digit values (hours or minutes) that keeps the chosen one in view. */
function TimeColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string | null;
  onSelect: (_value: string) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && selected)
      list.scrollTop = selected.offsetTop - list.clientHeight / 2 + selected.clientHeight / 2;
  }, [value]);

  return (
    <div className="flex min-w-0 flex-col">
      <span className="border-b border-pcnGreen-200 px-1 py-1 text-center text-[10px] uppercase tracking-widest text-pcnGreen-600">
        {label}
      </span>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="relative h-[13.5rem] overflow-y-auto overscroll-contain [scrollbar-width:none]"
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(option)}
              className={cn(
                'block w-full px-2 py-1 text-center text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-pcnGreen',
                selected
                  ? 'bg-pcnGreen font-semibold text-black shadow-[0_0_12px_rgba(4,244,190,0.6)]'
                  : 'text-muted-foreground hover:bg-pcnGreen/10 hover:text-pcnGreen',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  {
    value,
    onChange,
    onBlur,
    withTime = false,
    min,
    max,
    required = false,
    disabled = false,
    placeholder,
    bare = false,
    id,
    name,
    className,
    ...aria
  },
  ref,
) {
  const parsed = parseDateValue(value);
  const today = toDateValue(new Date());
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'days' | 'months'>('days');
  // The day the keyboard is on; the calendar shows its month.
  const [cursor, setCursor] = React.useState(parsed.date ?? today);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const focusOnRender = React.useRef(false);
  const shown = parsed.date
    ? withTime
      ? `${parsed.date} ${parsed.time ?? '00:00'}`
      : parsed.date
    : '';
  // What's typed in the field; it's only emitted once it reads as a full, valid date.
  const [draft, setDraft] = React.useState<string | null>(null);

  const cursorDate = fromDateValue(cursor);
  const viewYear = cursorDate.getFullYear();
  const viewMonth = cursorDate.getMonth();
  const isOutOfRange = (day: string) => (!!min && day < min) || (!!max && day > max);
  const clamp = (day: string) => (min && day < min ? min : max && day > max ? max : day);

  const emit = (date: string, time = parsed.time) =>
    onChange(withTime ? `${date}T${time ?? '00:00'}` : date);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setCursor(clamp(parsed.date ?? today));
      setMode('days');
      focusOnRender.current = true;
    } else onBlur?.();
    setOpen(next);
  };

  // Moving with the keyboard focuses the new day once it's rendered (it may be in another month).
  React.useEffect(() => {
    if (!open || mode !== 'days' || !focusOnRender.current) return;
    focusOnRender.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${cursor}"]`)?.focus();
  }, [open, mode, cursor]);

  const moveCursor = (next: string) => {
    focusOnRender.current = true;
    setCursor(clamp(next));
  };

  const pickDay = (day: string) => {
    if (isOutOfRange(day)) return;
    setCursor(day);
    emit(day);
    if (!withTime) handleOpenChange(false);
  };

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(cursor, -1),
      ArrowRight: () => addDays(cursor, 1),
      ArrowUp: () => addDays(cursor, -7),
      ArrowDown: () => addDays(cursor, 7),
      PageUp: () => addMonths(cursor, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(cursor, event.shiftKey ? 12 : 1),
      Home: () => addDays(cursor, -((cursorDate.getDay() + 6) % 7)),
      End: () => addDays(cursor, 6 - ((cursorDate.getDay() + 6) % 7)),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveCursor(move());
  };

  const onType = (text: string) => {
    setDraft(text);
    const typed = parseDateValue(text);
    // min and max only grey out days in the calendar: typed dates are left to the form to check.
    if (!typed.date) return;
    // A real day: 2026-02-31 rolls over in Date, so it reads back different.
    if (toDateValue(fromDateValue(typed.date)) !== typed.date) return;
    if (withTime && !typed.time) return;
    setCursor(typed.date);
    emit(typed.date, typed.time);
  };

  const onFieldBlur = (event: React.FocusEvent) => {
    if (draft !== null && !draft.trim() && !required) onChange('');
    setDraft(null);
    // Focus moving into the open calendar isn't leaving the field.
    if (!open && !fieldRef.current?.contains(event.relatedTarget as Node | null)) onBlur?.();
  };

  const display = parsed.date ? fromDateValue(parsed.date) : null;
  const isoPreview = parsed.date
    ? withTime
      ? `${parsed.date}T${parsed.time ?? '00:00'}`
      : parsed.date
    : null;

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : handleOpenChange}>
      <Popover.Anchor asChild>
        <div
          ref={fieldRef}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'group/date flex items-center gap-1.5 font-mono tabular-nums',
            bare
              ? 'h-6 text-muted-foreground focus-within:text-foreground data-[state=open]:text-pcnGreen'
              : cn(
                  fieldClassName,
                  'flex h-9 py-0 pl-1.5 pr-3 focus-within:border-pcnGreen-500 data-[state=open]:border-pcnGreen-500',
                ),
            disabled && 'pointer-events-none opacity-60',
            className,
          )}
        >
          <Popover.Trigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label={withTime ? 'Abrir el calendario y la hora' : 'Abrir el calendario'}
              className="flex size-6 shrink-0 items-center justify-center rounded-sm text-pcnGreen-600 transition-colors hover:bg-pcnGreen/10 hover:text-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen group-data-[state=open]/date:text-pcnGreen"
            >
              <CalendarDays aria-hidden className="size-3.5" />
            </button>
          </Popover.Trigger>
          <input
            ref={ref}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            value={draft ?? shown}
            placeholder={placeholder ?? (withTime ? 'aaaa-mm-dd hh:mm' : 'aaaa-mm-dd')}
            onChange={(event) => onType(event.target.value)}
            onClick={() => !open && handleOpenChange(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && !open) {
                event.preventDefault();
                handleOpenChange(true);
              }
            }}
            onBlur={onFieldBlur}
            {...aria}
            className={cn(
              'min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50',
              bare ? 'w-[5.5rem] flex-none' : 'h-full',
            )}
          />
          {!bare && display && (
            <span aria-hidden className="shrink-0 text-[11px] text-muted-foreground/60">
              {format(display, 'EEE', { locale: es })}
            </span>
          )}
        </div>
      </Popover.Anchor>
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          aria-label={withTime ? 'Elegir fecha y hora' : 'Elegir fecha'}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (fieldRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className={cn(menuContentClassName, 'z-[60] p-0 text-xs')}
        >
          <header className="flex items-center gap-2 border-b border-pcnGreen-200 px-2 py-1.5">
            <span className="text-[10px] text-pcnGreen-600">
              <span className="text-pcnGreen">$</span> cal
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'days' ? 'months' : 'days')}
              aria-label={mode === 'days' ? 'Elegir mes y año' : 'Volver a los días'}
              className="text-glow flex-1 rounded-sm px-1 py-0.5 text-center text-[13px] font-semibold uppercase tracking-widest text-pcnGreen transition-colors hover:bg-pcnGreen/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
            >
              {mode === 'days' ? `${MONTHS[viewMonth]} ${viewYear}` : viewYear}
              <span aria-hidden className="ml-1 text-pcnGreen-600">
                {mode === 'days' ? '▾' : '▴'}
              </span>
            </button>
            <button
              type="button"
              aria-label={mode === 'days' ? 'Mes anterior' : 'Año anterior'}
              onClick={() => setCursor(addMonths(cursor, mode === 'days' ? -1 : -12))}
              className={navButtonClassName}
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label={mode === 'days' ? 'Mes siguiente' : 'Año siguiente'}
              onClick={() => setCursor(addMonths(cursor, mode === 'days' ? 1 : 12))}
              className={navButtonClassName}
            >
              <ChevronRight className="size-3.5" />
            </button>
          </header>

          <div className="flex">
            {mode === 'days' ? (
              <div
                key={`${viewYear}-${viewMonth}`}
                ref={gridRef}
                role="grid"
                aria-label={`${MONTHS[viewMonth]} ${viewYear}`}
                onKeyDown={onGridKeyDown}
                className="date-grid-in w-[16.5rem] p-2"
              >
                <div role="row" className="mb-1 grid grid-cols-7">
                  {WEEKDAYS.map((weekday, i) => (
                    <span
                      key={weekday}
                      role="columnheader"
                      className={cn(
                        'py-1 text-center text-[10px] uppercase tracking-wider',
                        i >= 5 ? 'text-pcnGreen-700' : 'text-pcnGreen-500',
                      )}
                    >
                      {weekday}
                    </span>
                  ))}
                </div>
                {/* Days share their hairlines: the gaps show the grid's color behind them. */}
                <div className="grid grid-cols-7 gap-px border border-pcnGreen-200 bg-pcnGreen-200">
                  {monthGrid(viewYear, viewMonth).map((date) => {
                    const day = toDateValue(date);
                    const inMonth = date.getMonth() === viewMonth;
                    const selected = day === parsed.date;
                    const isToday = day === today;
                    const outOfRange = isOutOfRange(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        role="gridcell"
                        data-day={day}
                        tabIndex={day === cursor ? 0 : -1}
                        aria-selected={selected}
                        aria-current={isToday ? 'date' : undefined}
                        aria-disabled={outOfRange || undefined}
                        aria-label={format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                        onClick={() => pickDay(day)}
                        onFocus={() => setCursor(day)}
                        className={cn(
                          'relative flex aspect-square items-center justify-center bg-black text-xs tabular-nums transition-colors duration-150 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-pcnGreen',
                          inMonth ? 'text-foreground/85' : 'text-muted-foreground/30',
                          !selected &&
                            !outOfRange &&
                            'hover:bg-pcnGreen/15 hover:text-pcnGreen hover:[text-shadow:0_0_8px_rgba(4,244,190,0.7)]',
                          selected &&
                            'z-10 bg-pcnGreen font-bold text-black shadow-[0_0_16px_rgba(4,244,190,0.75)]',
                          outOfRange &&
                            'cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgba(4,244,190,0.07)_3px_4px)] text-muted-foreground/25 line-through',
                        )}
                      >
                        {date.getDate()}
                        {isToday && !selected && (
                          <>
                            <span
                              aria-hidden
                              className="pointer-events-none absolute left-0.5 top-0.5 size-1.5 border-l border-t border-pcnGreen"
                            />
                            <span
                              aria-hidden
                              className="pointer-events-none absolute bottom-0.5 right-0.5 size-1.5 border-b border-r border-pcnGreen"
                            />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                key={`months-${viewYear}`}
                className="date-grid-in grid w-[16.5rem] grid-cols-3 gap-px border-pcnGreen-200 p-2"
              >
                {MONTHS.map((month, i) => {
                  const current = i === viewMonth;
                  return (
                    <button
                      key={month}
                      type="button"
                      aria-pressed={current}
                      onClick={() => {
                        setCursor(clamp(toDateValue(new Date(viewYear, i, 1))));
                        setMode('days');
                        focusOnRender.current = true;
                      }}
                      className={cn(
                        'rounded-sm border py-3 text-xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
                        current
                          ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen shadow-[0_0_12px_-2px_rgba(4,244,190,0.6)]'
                          : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
                      )}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            )}

            {withTime && (
              <div className="grid w-[6.5rem] grid-cols-2 border-l border-pcnGreen-200">
                <TimeColumn
                  label="hh"
                  options={HOURS}
                  value={parsed.time?.slice(0, 2) ?? null}
                  onSelect={(hour) =>
                    emit(parsed.date ?? clamp(today), `${hour}:${parsed.time?.slice(3) ?? '00'}`)
                  }
                />
                <div className="border-l border-pcnGreen-200">
                  <TimeColumn
                    label="mm"
                    options={MINUTES}
                    value={parsed.time?.slice(3) ?? null}
                    onSelect={(minute) =>
                      emit(
                        parsed.date ?? clamp(today),
                        `${parsed.time?.slice(0, 2) ?? '00'}:${minute}`,
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <footer className="flex items-center gap-1 border-t border-pcnGreen-200 px-2 py-1">
            <span className="mr-auto truncate text-[10px] tabular-nums text-muted-foreground/70">
              <span className="text-pcnGreen-500">→ </span>
              {isoPreview ?? 'sin fecha'}
              <span className="animate-blink text-pcnGreen">_</span>
            </span>
            {!isOutOfRange(today) && (
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCursor(today);
                  emit(today, `${pad(now.getHours())}:${pad(now.getMinutes())}`);
                  if (!withTime) handleOpenChange(false);
                }}
                className={footerButtonClassName}
              >
                [hoy]
              </button>
            )}
            {!required && parsed.date && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  handleOpenChange(false);
                }}
                className={cn(footerButtonClassName, 'hover:text-red-400')}
              >
                <X aria-hidden className="mr-0.5 inline size-3" />
                limpiar
              </button>
            )}
            {withTime && (
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className={cn(footerButtonClassName, 'border border-pcnGreen-400 text-pcnGreen')}
              >
                ok
              </button>
            )}
          </footer>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
