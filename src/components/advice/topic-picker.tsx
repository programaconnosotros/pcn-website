'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CONSEJO_TOPICS, MAX_CONSEJO_TOPICS, toTopicSlug } from '@/lib/consejos';

// Every category in use on /consejos (the built-in topics plus the ones members created), so the
// publish and edit dialogs, wherever they open, suggest the same list.
const ConsejoTopicsContext = createContext<string[]>(Object.keys(CONSEJO_TOPICS));

export const ConsejoTopicsProvider = ({
  topics,
  children,
}: {
  topics: string[];
  children: ReactNode;
}) => <ConsejoTopicsContext.Provider value={topics}>{children}</ConsejoTopicsContext.Provider>;

export const useConsejoTopics = () => useContext(ConsejoTopicsContext);

/** Pick up to three categories for a consejo, or create a new one. */
export function TopicPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (_topics: string[]) => void;
}) {
  const suggestions = useConsejoTopics();
  const [draft, setDraft] = useState('');
  const full = value.length >= MAX_CONSEJO_TOPICS;
  const options = [...new Set([...suggestions, ...value])];

  const toggle = (topic: string) =>
    onChange(value.includes(topic) ? value.filter((t) => t !== topic) : [...value, topic]);

  const create = () => {
    const topic = toTopicSlug(draft);
    if (topic.length < 2 || full) return;
    if (!value.includes(topic)) onChange([...value, topic]);
    setDraft('');
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex w-full items-center justify-between font-mono text-xs text-muted-foreground">
        <span>
          <span className="text-pcnGreen">--categorias</span> (opcional)
        </span>
        <span aria-live="polite">
          {value.length}/{MAX_CONSEJO_TOPICS}
        </span>
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((topic) => {
          const selected = value.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={selected}
              disabled={!selected && full}
              onClick={() => toggle(topic)}
              className={cn(
                'border px-2 py-0.5 font-mono text-[11px] transition-colors disabled:opacity-40',
                selected
                  ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen'
                  : 'border-border text-muted-foreground hover:border-pcnGreen/60 hover:text-foreground',
              )}
            >
              #{topic}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            create();
          }}
          placeholder="nueva categoría"
          aria-label="Nueva categoría"
          maxLength={24}
          disabled={full}
          className="h-8 font-mono text-xs"
        />
        <button
          type="button"
          onClick={create}
          disabled={full || toTopicSlug(draft).length < 2}
          className="flex h-8 shrink-0 items-center gap-1 border border-border px-2 font-mono text-xs text-muted-foreground hover:border-pcnGreen hover:text-pcnGreen disabled:opacity-40"
        >
          <Plus className="size-3" aria-hidden />
          crear
        </button>
      </div>
    </fieldset>
  );
}
