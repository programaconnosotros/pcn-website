'use client';

import { createContext, useContext, useState } from 'react';

// The list on /consejos shares the order it currently shows (after search and filters) with the
// detail modal, which lives in a parallel route, so ← → in the modal step through that same list.
type ConsejosNav = {
  ids: string[];
  setIds: (_ids: string[]) => void;
};

const ConsejosNavContext = createContext<ConsejosNav>({ ids: [], setIds: () => {} });

export function ConsejosNavProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  return (
    <ConsejosNavContext.Provider value={{ ids, setIds }}>{children}</ConsejosNavContext.Provider>
  );
}

export const useConsejosNav = () => useContext(ConsejosNavContext);
