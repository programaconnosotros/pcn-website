import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { HISTORIA_ORGANIZATIONS, type HistoriaOrganizationName } from './organizations';

interface HistoriaOrganizationProps {
  name: HistoriaOrganizationName;
  /** How the text calls it, e.g. "la UTN de Tucumán". Defaults to `name`. */
  children?: ReactNode;
}

/** An organization or company mentioned in the story, linked to its site in a new tab. */
export const HistoriaOrganization = ({ name, children }: HistoriaOrganizationProps) => (
  <a
    href={HISTORIA_ORGANIZATIONS[name]}
    target="_blank"
    rel="noopener noreferrer"
    title={`Ir al sitio de ${name}`}
    className="font-medium whitespace-nowrap text-foreground transition-colors hover:text-pcnGreen focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:outline-hidden"
  >
    {children ?? name}
    <ArrowUpRight className="inline size-3 align-[1px] text-pcnGreen-500" />
  </a>
);
