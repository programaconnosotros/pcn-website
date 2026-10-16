import { UserProgrammingLanguage } from '@/types/programming-language';
import { LanguageChip } from './language-chip';

/** The languages a user marked on their profile, as terminal tokens. */
export function LanguageCoinsContainer({ languages }: { languages: UserProgrammingLanguage[] }) {
  if (!languages || languages.length === 0) {
    return (
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>todavía no sumó lenguajes de programación
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
