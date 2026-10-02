import { UserProgrammingLanguage } from '@/types/programming-language';
import { LanguageChip } from './language-chip';

/** The languages a user marked on their profile, as terminal tokens. */
export function LanguageCoinsContainer({ languages }: { languages: UserProgrammingLanguage[] }) {
  if (!languages || languages.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        No hay lenguajes de programación añadidos
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {languages.map((language) => (
        <LanguageChip key={language.languageId} languageId={language.languageId} />
      ))}
    </div>
  );
}
