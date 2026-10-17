'use client';

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { members } from '@/data/whatsapp-conversations/members';
import { Highlight, normalize } from './highlight';
import { ProfileLinksContext } from './participant-chip';

const isLetter = (char: string | undefined) => !!char && /\p{L}/u.test(char);

const firstName = (name: string) => name.split(' ')[0];

// Turns the names of the conversation's participants who are linked to a platform user into links
// to their profile, and highlights `query` in the rest. Full names and spelling variants always
// link; a bare first name ("Agustín") only when no other participant shares it.
export function LinkedNames({
  text,
  query,
  participants,
}: {
  text: string;
  query: string;
  participants: string[];
}) {
  const profiles = useContext(ProfileLinksContext);

  const mentions = useMemo(
    () =>
      participants
        .filter((name) => profiles[name])
        .flatMap((name) => {
          const member = members.find((m) => m.name === name);
          const sharesFirstName = participants.some(
            (other) => other !== name && firstName(other) === firstName(name),
          );
          return [
            name,
            ...(member?.aliases ?? []),
            ...(sharesFirstName ? [] : [firstName(name)]),
          ].map((alias) => ({ needle: normalize(alias), name }));
        })
        // Longest first, so "Agustín Sánchez" wins over "Agustín".
        .sort((a, b) => b.needle.length - a.needle.length),
    [participants, profiles],
  );

  const parts = useMemo(() => {
    const haystack = normalize(text);
    const found: { text: string; name?: string }[] = [];
    let cursor = 0;
    for (let at = 0; at < text.length; at++) {
      if (isLetter(text[at - 1])) continue;
      const mention = mentions.find(
        ({ needle }) => haystack.startsWith(needle, at) && !isLetter(text[at + needle.length]),
      );
      if (!mention) continue;
      if (at > cursor) found.push({ text: text.slice(cursor, at) });
      found.push({ text: text.slice(at, at + mention.needle.length), name: mention.name });
      cursor = at + mention.needle.length;
      at = cursor - 1;
    }
    found.push({ text: text.slice(cursor) });
    return found;
  }, [text, mentions]);

  return (
    <>
      {parts.map((part, i) => {
        const profile = part.name ? profiles[part.name] : undefined;
        if (!profile) return <Highlight key={i} text={part.text} query={query} />;
        return (
          <Link
            key={i}
            href={`/perfil/${profile.id}`}
            title={`Ver el perfil de ${profile.name}`}
            className="underline-offset-4 transition-colors hover:text-pcnGreen hover:underline"
          >
            <Highlight text={part.text} query={query} />
          </Link>
        );
      })}
    </>
  );
}
