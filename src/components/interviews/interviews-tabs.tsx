import { TabBrackets, tabsListClassName, tabsTriggerClassName } from '@/components/ui/tab-styles';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TABS = [
  { id: 'simulador', label: 'simulador', href: '/entrevistas' },
  { id: 'guias', label: 'guías', href: '/entrevistas/guias' },
] as const;

/** Switches between the interview simulator and the preparation guides. */
export const InterviewsTabs = ({ active }: { active: (typeof TABS)[number]['id'] }) => (
  <nav aria-label="Entrevistas" className={cn(tabsListClassName, 'h-8')}>
    {TABS.map((tab) => (
      <Link
        key={tab.id}
        href={tab.href}
        data-state={tab.id === active ? 'active' : 'inactive'}
        aria-current={tab.id === active ? 'page' : undefined}
        className={tabsTriggerClassName}
      >
        <TabBrackets>{tab.label}</TabBrackets>
      </Link>
    ))}
  </nav>
);
