'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { toast } from 'sonner';
import { AtSign, Unlink } from 'lucide-react';
import { setIdentityLink } from '@/actions/identity-links/set-identity-link';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LinkedUser } from '@/lib/identity-links';
import { cn } from '@/lib/utils';
import { HISTORIA_PEOPLE, type HistoriaPersonName } from './people';

type HistoriaPeopleContextValue = {
  links: Record<string, LinkedUser>;
  isAdmin: boolean;
  tagging: boolean;
  setTagging: (_tagging: boolean) => void;
  save: (_name: HistoriaPersonName, _user: LinkedUser | null) => Promise<void>;
};

const HistoriaPeopleContext = createContext<HistoriaPeopleContextValue>({
  links: {},
  isAdmin: false,
  tagging: false,
  setTagging: () => {},
  save: async () => {},
});

interface HistoriaPeopleProviderProps {
  /** Person mentioned in /historia → the platform user an admin tagged them as. */
  links: Record<string, LinkedUser>;
  isAdmin: boolean;
  children: ReactNode;
}

/** Holds who each mention is tagged as, and lets admins tag them right on the page. */
export function HistoriaPeopleProvider({
  links: initialLinks,
  isAdmin,
  children,
}: HistoriaPeopleProviderProps) {
  const [links, setLinks] = useState(initialLinks);
  const [tagging, setTagging] = useState(false);

  const save = async (name: HistoriaPersonName, user: LinkedUser | null) => {
    const previous = links;
    setLinks((current) => {
      const next = { ...current };
      if (user) next[name] = user;
      else delete next[name];
      return next;
    });
    try {
      await setIdentityLink({ source: 'historia', externalName: name, userId: user?.id ?? null });
      toast.success(user ? `${name} → ${user.name}` : `${name} sin etiquetar`);
    } catch (error) {
      setLinks(previous);
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la etiqueta');
    }
  };

  return (
    <HistoriaPeopleContext.Provider value={{ links, isAdmin, tagging, setTagging, save }}>
      {children}
    </HistoriaPeopleContext.Provider>
  );
}

/** Admin-only bar that turns tagging on and shows how many people are tagged. */
export function HistoriaTaggingBar() {
  const { links, isAdmin, tagging, setTagging } = useContext(HistoriaPeopleContext);
  if (!isAdmin) return null;

  const tagged = HISTORIA_PEOPLE.filter((name) => links[name]).length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-pcnGreen-200 px-4 py-2 font-mono text-xs">
      <span className="text-muted-foreground">
        <span className="text-pcnGreen-600">$ </span>
        personas etiquetadas{' '}
        <span className="tabular-nums">
          <span className="text-pcnGreen">{tagged}</span>/{HISTORIA_PEOPLE.length}
        </span>
      </span>
      <button
        type="button"
        aria-pressed={tagging}
        onClick={() => setTagging(!tagging)}
        className={cn(
          'ml-auto h-7 border px-2 transition-colors',
          tagging
            ? 'border-pcnGreen-600 bg-pcnGreen/15 text-pcnGreen'
            : 'border-pcnGreen-200 text-muted-foreground hover:text-foreground',
        )}
      >
        {tagging ? 'listo' : '--etiquetar'}
      </button>
    </div>
  );
}

interface HistoriaPersonProps {
  /** Who is mentioned; tagging one mention tags all of them. */
  name: HistoriaPersonName;
  /** How the text calls them, e.g. "Agus". Defaults to `name`. */
  children?: ReactNode;
}

/**
 * A person mentioned in the story: a link to their profile once an admin tags them as a platform
 * user, plain text otherwise. In tagging mode admins get an `@` button next to it to pick the user.
 */
export function HistoriaPerson({ name, children }: HistoriaPersonProps) {
  const { links, isAdmin, tagging } = useContext(HistoriaPeopleContext);
  const user = links[name];
  const label = children ?? name;

  return (
    <>
      {user ? (
        <Link
          href={`/perfil/${user.id}`}
          title={`Ver el perfil de ${user.name}`}
          // A mention chip, so it reads as a link to someone and not as a spelling mark.
          className="inline-flex items-baseline gap-1 whitespace-nowrap rounded-sm bg-pcnGreen/[0.08] px-1 font-medium text-pcnGreen transition-colors hover:bg-pcnGreen/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
        >
          <Avatar className="size-3.5 self-center rounded-full">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback className="rounded-full text-[8px]">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {label}
        </Link>
      ) : (
        label
      )}
      {isAdmin && tagging && <TagButton name={name} user={user ?? null} />}
    </>
  );
}

function TagButton({ name, user }: { name: HistoriaPersonName; user: LinkedUser | null }) {
  const { save } = useContext(HistoriaPeopleContext);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The panel lives in a portal (the combobox's blocks can't sit inside the story's <p>), fixed
  // right under the button.
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        top: rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 264)),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pick = (next: LinkedUser | null) =>
    startTransition(async () => {
      await save(name, next);
      setOpen(false);
    });

  return (
    <span className="ml-0.5 inline-block align-middle">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={user ? `${name} → ${user.name}` : `Etiquetar a ${name}`}
        className={cn(
          'flex size-4 items-center justify-center rounded-sm border transition-colors',
          user
            ? 'border-pcnGreen-600 bg-pcnGreen/15 text-pcnGreen'
            : 'border-dashed border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
          isPending && 'animate-pulse',
        )}
      >
        <AtSign className="size-2.5" />
        <span className="sr-only">Etiquetar a {name}</span>
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            style={position}
            className="fixed z-50 w-64 space-y-2 border border-pcnGreen-400 bg-background/95 p-2 font-mono text-xs shadow-[0_0_24px_-8px_rgba(4,244,190,0.6)] backdrop-blur"
          >
            <span className="block text-[10px] uppercase tracking-wider text-pcnGreen-500">
              {name}
            </span>
            {user && (
              <span className="flex items-center gap-2">
                <Avatar className="size-5 rounded-sm">
                  <AvatarImage src={user.image ?? undefined} alt="" />
                  <AvatarFallback className="rounded-sm text-[9px]">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-pcnGreen">{user.name}</span>
                <button
                  type="button"
                  onClick={() => pick(null)}
                  disabled={isPending}
                  title="Quitar etiqueta"
                  className="ml-auto shrink-0 rounded-sm p-1 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                >
                  <Unlink className="size-3.5" />
                  <span className="sr-only">Quitar etiqueta de {name}</span>
                </button>
              </span>
            )}
            <UserCombobox
              search={searchCommunityMembers}
              excludeIds={user ? [user.id] : undefined}
              placeholder={user ? 'cambiar usuario…' : 'etiquetar a…'}
              disabled={isPending}
              onSelect={(picked) => pick({ id: picked.id, name: picked.name, image: picked.image })}
            />
          </div>,
          document.body,
        )}
    </span>
  );
}
