import { ConsejosNavProvider } from '@/components/advice/consejos-nav';
import { ConsejoTopicsProvider } from '@/components/advice/topic-picker';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { CONSEJO_TOPICS } from '@/lib/consejos';
import { listAdvice } from '@/lib/consejos-server';

// `modal` is the parallel route that shows /consejos/<id> as a dialog over the list.
export default async function ConsejosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  // The categories to suggest when publishing or editing: the built-in ones, then the ones members
  // created, alphabetically.
  const advice = await listAdvice();
  const created = [
    ...advice.flatMap(({ tags }) => tags),
    ...extractedConsejos.flatMap(({ tags }) => tags),
  ];
  const builtIn = Object.keys(CONSEJO_TOPICS);
  const topics = [
    ...builtIn,
    ...[...new Set(created)].filter((tag) => !builtIn.includes(tag)).sort(),
  ];

  return (
    <ConsejoTopicsProvider topics={topics}>
      <ConsejosNavProvider>
        {children}
        {modal}
      </ConsejosNavProvider>
    </ConsejoTopicsProvider>
  );
}
