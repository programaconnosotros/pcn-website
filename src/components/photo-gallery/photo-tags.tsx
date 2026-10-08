'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Crosshair, Users } from 'lucide-react';
import { toast } from 'sonner';
import { setGalleryTagPosition } from '@/actions/gallery/gallery-tags';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

export interface TagPosition {
  x: number;
  y: number;
}

export interface PlacedTag {
  id: string;
  name: string;
  position: TagPosition | null;
}

interface PhotoTagsContextValue {
  tags: Record<string, PlacedTag>;
  /** Who is being placed: the next click on the photo sets where they are. */
  placing: PlacedTag | null;
  startPlacing: (_person: { id: string; name: string }) => void;
  cancelPlacing: () => void;
  place: (_position: TagPosition) => Promise<void>;
  clear: (_id: string) => Promise<void>;
  /** A tag was added or removed in the people list. */
  sync: (_person: { id: string; name: string }, _tagged: boolean) => void;
  highlighted: string | null;
  setHighlighted: (_id: string | null) => void;
}

const PhotoTagsContext = createContext<PhotoTagsContextValue | null>(null);

export const usePhotoTags = () => useContext(PhotoTagsContext);

/**
 * Shares where each tagged person is in the photo between the photo itself (markers, and the
 * click that places someone) and the people list (the "ubicar" buttons).
 */
export function PhotoTagsProvider({
  photoId,
  initial,
  children,
}: {
  photoId: string;
  initial: PlacedTag[];
  children: ReactNode;
}) {
  const toMap = (list: PlacedTag[]) => Object.fromEntries(list.map((tag) => [tag.id, tag]));
  const [tags, setTags] = useState<Record<string, PlacedTag>>(() => toMap(initial));
  const [synced, setSynced] = useState(initial);
  const [placing, setPlacing] = useState<PlacedTag | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  // Moving to another photo brings a fresh list from the server.
  if (synced !== initial) {
    setSynced(initial);
    setTags(toMap(initial));
    setPlacing(null);
  }

  const save = async (id: string, position: TagPosition | null) => {
    const before = tags[id];
    setTags((current) => ({ ...current, [id]: { ...current[id], position } }));
    try {
      await setGalleryTagPosition(photoId, id, position);
    } catch (error) {
      setTags((current) => ({ ...current, [id]: before }));
      toast.error(actionErrorMessage(error, 'No se pudo guardar', true));
    }
  };

  const value: PhotoTagsContextValue = {
    tags,
    placing,
    startPlacing: (person) =>
      setPlacing({ ...person, position: tags[person.id]?.position ?? null }),
    cancelPlacing: () => setPlacing(null),
    place: async (position) => {
      if (!placing) return;
      const person = placing;
      setPlacing(null);
      await save(person.id, position);
    },
    clear: (id) => save(id, null),
    sync: (person, tagged) =>
      setTags((current) => {
        if (tagged) return { ...current, [person.id]: { ...person, position: null } };
        const next = { ...current };
        delete next[person.id];
        return next;
      }),
    highlighted,
    setHighlighted,
  };

  return <PhotoTagsContext.Provider value={value}>{children}</PhotoTagsContext.Provider>;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Touch screens have no hover: there the markers start hidden and a tap on the photo toggles them.
const isTouchScreen = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches;

/**
 * The photo with a marker where each placed person is (shown on hover, or always while placing
 * someone; on touch screens, after tapping the photo). While placing, a click on the photo sets
 * where that person is.
 */
export function PhotoTagCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = usePhotoTags();
  const [revealed, setRevealed] = useState(false);
  if (!context) return <>{children}</>;
  const { tags, placing, place, cancelPlacing, highlighted, setHighlighted } = context;
  const placed = Object.values(tags).filter((tag) => tag.position);

  return (
    <div
      className={cn(
        'group/tags relative inline-block max-w-full align-middle',
        placing && 'cursor-crosshair',
        className,
      )}
      onClick={(event) => {
        if (!placing) {
          if (placed.length && isTouchScreen()) setRevealed((shown) => !shown);
          return;
        }
        const box = event.currentTarget.getBoundingClientRect();
        void place({
          x: clamp((event.clientX - box.left) / box.width),
          y: clamp((event.clientY - box.top) / box.height),
        });
      }}
      onKeyDown={(event) => event.key === 'Escape' && cancelPlacing()}
    >
      {children}

      {placing && (
        <p className="pointer-events-none absolute inset-x-0 top-0 bg-black/75 px-3 py-1.5 text-center font-mono text-xs text-pcnGreen backdrop-blur-xs">
          <Crosshair className="mr-1.5 inline size-3.5" />
          tocá dónde está {placing.name} en la foto ·{' '}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              cancelPlacing();
            }}
            className="pointer-events-auto underline"
          >
            cancelar
          </button>
        </p>
      )}

      {placed.length > 0 && !placing && !revealed && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 hidden items-center gap-1 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-pcnGreen backdrop-blur-xs [@media(hover:none)]:flex"
        >
          <Users className="size-3" />
          {placed.length} · tocá para ver
        </span>
      )}

      {placed.map((tag) => (
        <Link
          key={tag.id}
          href={`/perfil/${tag.id}`}
          onClick={(event) => {
            // A tap on a marker opens the profile; it doesn't also hide the markers.
            event.stopPropagation();
            if (placing) event.preventDefault();
          }}
          onMouseEnter={() => setHighlighted(tag.id)}
          onMouseLeave={() => setHighlighted(null)}
          style={{ left: `${tag.position!.x * 100}%`, top: `${tag.position!.y * 100}%` }}
          className={cn(
            'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-opacity duration-200',
            placing || revealed || highlighted === tag.id
              ? 'opacity-100'
              : 'opacity-0 group-hover/tags:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:pointer-events-none',
          )}
        >
          <span
            className={cn(
              'size-6 rounded-full border-2 border-pcnGreen bg-pcnGreen/10 shadow-[0_0_12px_rgba(4,244,190,0.7)]',
              highlighted === tag.id && 'scale-125 bg-pcnGreen/30',
            )}
          />
          <span className="rounded-sm bg-black/80 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-pcnGreen backdrop-blur-xs">
            {tag.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
