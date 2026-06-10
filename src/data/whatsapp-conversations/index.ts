export interface Conversation {
  title: string;
  date: string;
  summary: string;
}

import m202504 from './2025-04.json';
import m202505 from './2025-05.json';
import m202506 from './2025-06.json';
import m202507 from './2025-07.json';
import m202508 from './2025-08.json';
import m202509 from './2025-09.json';
import m202510 from './2025-10.json';
import m202511 from './2025-11.json';
import m202512 from './2025-12.json';
import m202601 from './2026-01.json';
import m202602 from './2026-02.json';
import m202603 from './2026-03.json';
import m202604 from './2026-04.json';
import m202605 from './2026-05.json';
import m202606 from './2026-06.json';

export const conversations: Conversation[] = [
  ...m202504,
  ...m202505,
  ...m202506,
  ...m202507,
  ...m202508,
  ...m202509,
  ...m202510,
  ...m202511,
  ...m202512,
  ...m202601,
  ...m202602,
  ...m202603,
  ...m202604,
  ...m202605,
  ...m202606,
] as Conversation[];
