'use client';

import { useRouter } from 'next/navigation';
import { GlobalSearch } from './global-search';

/** Global search for the classic layout (phones, tablets and pages inside PCN OS windows). */
export function ClassicGlobalSearch() {
  const router = useRouter();
  return <GlobalSearch onNavigate={(path) => router.push(path)} />;
}
