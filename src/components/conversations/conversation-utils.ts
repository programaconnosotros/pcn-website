import type { Conversation } from '@/data/whatsapp-conversations';

/** Conversations naming at least this many members are highlighted as group threads. */
export const GROUP_THREAD_MIN = 5;

export const METER_SLOTS = 8;

export const isGroupThread = (conversation: Conversation) =>
  conversation.participants.length >= GROUP_THREAD_MIN;

// A stable, git-like short hash so every conversation gets its own id.
export const shortHash = ({ date, title }: Conversation) => {
  let hash = 5381;
  for (const char of `${date}${title}`) hash = (Math.imul(hash, 33) ^ char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0').slice(0, 7);
};

/** Links straight to a conversation: /conversaciones opens its dialog on load. */
export const CONVERSATION_PARAM = 'c';

export const conversationHref = (conversation: Conversation) =>
  `/conversaciones?${CONVERSATION_PARAM}=${shortHash(conversation)}`;

// Splits a summary into sentences for the log-style reader, without breaking on initials
// like "Robert C. Martin".
export const toSentences = (summary: string) =>
  summary.split(/(?<=[\p{Ll}\d)"”]{2}[.!?])\s+(?=[\p{Lu}¿¡"“(])/u).filter(Boolean);

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const monthName = (monthKey: string) => MONTHS_ES[Number(monthKey.slice(5, 7)) - 1];

export const formatLongDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
};
