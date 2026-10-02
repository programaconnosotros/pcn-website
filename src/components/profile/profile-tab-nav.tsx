'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { TabBrackets, tabsListClassName, tabsTriggerClassName } from '@/components/ui/tab-styles';
import { PROFILE_TABS, isProfileTab, profileTabHref, type ProfileTab } from './profile-tabs';
import { ProfileTabSkeleton } from './profile-tab-skeleton';

type ProfileTabsState = {
  userId: string;
  /** The tab being shown, or the one just clicked while the server renders it. */
  activeTab: ProfileTab;
  /** A different tab was clicked and its content hasn't arrived yet. */
  isSwitching: boolean;
  goTo: (_tab: ProfileTab, _href: string) => void;
  counts: Partial<Record<ProfileTab, number>>;
  setCounts: (_counts: Partial<Record<ProfileTab, number>>) => void;
};

const ProfileTabsContext = createContext<ProfileTabsState | null>(null);

// Switching tabs is a server navigation (each tab has its own URL), so the clicked tab lights up
// and its skeleton shows right away instead of the old tab lingering until the new one is ready.
export function ProfileTabsProvider({
  userId,
  active,
  children,
}: {
  userId: string;
  active: ProfileTab;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useOptimistic(active);
  // Kept here so the counts streamed with each tab don't blink out while the next one loads.
  const [counts, setCounts] = useState<Partial<Record<ProfileTab, number>>>({});

  const goTo = (tab: ProfileTab, href: string) =>
    startTransition(() => {
      setActiveTab(tab);
      router.push(href, { scroll: false });
    });

  return (
    <ProfileTabsContext.Provider
      value={{
        userId,
        activeTab,
        isSwitching: isPending && activeTab !== active,
        goTo,
        counts,
        setCounts,
      }}
    >
      {children}
    </ProfileTabsContext.Provider>
  );
}

const useProfileTabs = () => useContext(ProfileTabsContext);

/** Hands the counts, fetched in a streamed server component, to the tab bar. */
export function ProfileTabCounts({ counts }: { counts: Partial<Record<ProfileTab, number>> }) {
  const setCounts = useProfileTabs()?.setCounts;
  const key = JSON.stringify(counts);
  useEffect(() => {
    setCounts?.(JSON.parse(key));
  }, [key, setCounts]);
  return null;
}

const tabOf = (href: string): ProfileTab => {
  const tab = new URL(href, 'http://pcn').searchParams.get('tab');
  return isProfileTab(tab) ? tab : 'resumen';
};

/** A link to one of the profile's tabs that switches to it instantly. */
export function ProfileTabLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const tabs = useProfileTabs();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Let the browser handle new-tab clicks; plain clicks switch in place.
    if (!tabs || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const tab = tabOf(href);
    if (tab !== tabs.activeTab) tabs.goTo(tab, href);
  };
  return <Link href={href} scroll={false} onClick={handleClick} {...props} />;
}

// The HUD tab strip from `ui/tabs`, but as a row of links so each tab has its own URL.
// The bar scrolls sideways on narrow screens; the 1px padding keeps its corner ticks unclipped.
export function ProfileTabs() {
  const tabs = useProfileTabs();
  if (!tabs) return null;
  return (
    <div className="-mx-4 overflow-x-auto px-4 py-px [scrollbar-width:none] lg:mx-0 lg:px-px">
      <nav aria-label="Secciones del perfil" className={cn(tabsListClassName, 'h-8')}>
        {PROFILE_TABS.map((tab) => {
          const isActive = tab.id === tabs.activeTab;
          const count = tabs.counts[tab.id];
          return (
            <ProfileTabLink
              key={tab.id}
              href={profileTabHref(tabs.userId, tab.id)}
              aria-current={isActive ? 'page' : undefined}
              data-state={isActive ? 'active' : 'inactive'}
              className={tabsTriggerClassName}
            >
              <TabBrackets>
                {tab.label}
                {count !== undefined && <span className="tabular-nums opacity-60">({count})</span>}
              </TabBrackets>
            </ProfileTabLink>
          );
        })}
      </nav>
    </div>
  );
}

/** The selected tab's content, or its skeleton while a newly clicked tab loads. */
export function ProfileTabPanel({ children }: { children: ReactNode }) {
  const tabs = useProfileTabs();
  if (tabs?.isSwitching) return <ProfileTabSkeleton tab={tabs.activeTab} />;
  return <>{children}</>;
}
