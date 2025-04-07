'use client';

import { UserProgrammingLanguage } from '@/types/programming-language';
import { LanguageCoin } from './language-coin';

interface LanguageCoinsContainerProps {
  languages: UserProgrammingLanguage[];
  editable?: boolean;
  onRemoveLanguage?: (languageId: string) => void;
}

export function LanguageCoinsContainer({
  languages,
  editable = false,
  onRemoveLanguage,
}: LanguageCoinsContainerProps) {
  if (!languages || languages.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        No hay lenguajes de programación añadidos
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-4">
      {languages.map((language) => (
        <LanguageCoin
          key={language.languageId}
          language={language}
          editable={editable}
          onRemove={onRemoveLanguage ? () => onRemoveLanguage(language.languageId) : undefined}
        />
      ))}
    </div>
  );
}
