import { members } from './members';

export interface Conversation {
  title: string;
  date: string;
  summary: string;
  /** The event the conversation happened at (e.g. a virtual meetup), when it isn't from the chat. */
  eventId?: string;
  /** Community members named in the summary, in order of first mention. */
  participants: string[];
  /** Links shared in the thread itself (articles, repos, tools discussed), most relevant first. */
  links?: string[];
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
import m202607 from './2026-07.json';
import m202608 from './2026-08.json';
import m202609 from './2026-09.json';
import m202610 from './2026-10.json';

// Lowercase without accents, so `Nuñez` matches `Nunez` and `Pérez` matches `Perez`.
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const memberPatterns = members.map((member) => ({
  name: member.name,
  patterns: [member.name, ...(member.aliases ?? [])].map(
    (alias) => new RegExp(`(^|[^a-z])${normalize(alias)}(?![a-z])`),
  ),
}));

const findParticipants = (summary: string): string[] => {
  const text = normalize(summary);
  return memberPatterns
    .map(({ name, patterns }) => ({
      name,
      at: Math.min(...patterns.map((pattern) => text.search(pattern)).filter((i) => i >= 0)),
    }))
    .filter(({ at }) => Number.isFinite(at))
    .sort((a, b) => a.at - b.at)
    .map(({ name }) => name);
};

const rawConversations: Omit<Conversation, 'participants'>[] = [
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
  ...m202607,
  ...m202608,
  ...m202609,
  ...m202610,
];

export const conversations: Conversation[] = rawConversations.map((conversation) => ({
  ...conversation,
  participants: findParticipants(conversation.summary),
}));
