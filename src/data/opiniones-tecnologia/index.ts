import { conversations } from '@/data/whatsapp-conversations';
import { conversationHref, shortHash } from '@/components/conversations/conversation-utils';
import raw from './opiniones.json';

// How the group's opinion of the technologies it talks about changed over time, taken from the
// /conversaciones summaries. Always about "el grupo", never about a person.

export type Stance = 'positiva' | 'negativa' | 'mixta';

export type RawTechnologyOpinions = {
  slug: string;
  name: string;
  summary: string;
  opinions: { date: string; title: string; stance: Stance; text: string }[];
};

export type TechnologyOpinion = {
  date: string;
  stance: Stance;
  text: string;
  conversation: { title: string; hash: string; href: string };
};

export type TechnologyTimeline = {
  slug: string;
  name: string;
  summary: string;
  opinions: TechnologyOpinion[];
};

export const rawTechnologyOpinions = raw as RawTechnologyOpinions[];

/** Every technology with its opinions oldest first; opinions whose conversation is gone drop out. */
export const technologyTimelines: TechnologyTimeline[] = rawTechnologyOpinions.map((tech) => ({
  slug: tech.slug,
  name: tech.name,
  summary: tech.summary,
  opinions: tech.opinions
    .flatMap((opinion) => {
      const conversation = conversations.find(
        ({ date, title }) => date === opinion.date && title === opinion.title,
      );
      if (!conversation) return [];
      return [
        {
          date: opinion.date,
          stance: opinion.stance,
          text: opinion.text,
          conversation: {
            title: conversation.title,
            hash: shortHash(conversation),
            href: conversationHref(conversation),
          },
        },
      ];
    })
    .sort((a, b) => a.date.localeCompare(b.date)),
}));
