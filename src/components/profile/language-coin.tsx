'use client';

import { UserProgrammingLanguage } from '@/types/programming-language';
import Image from 'next/image';
import { programmingLanguages } from '@/types/programming-language';

interface LanguageCoinProps {
  language: UserProgrammingLanguage;
  editable?: boolean;
  onRemove?: () => void;
}

export function LanguageCoin({ language, editable = false, onRemove }: LanguageCoinProps) {
  const languageInfo = programmingLanguages.find((lang) => lang.id === language.languageId);

  return (
    <div className="group relative" title={languageInfo?.name}>
      <div className="language-coin flex items-center justify-center overflow-hidden rounded-full border-2 border-gray-700 transition-all duration-200 hover:border-gray-500">
        <div
          className="relative flex h-12 w-12 items-center justify-center p-2"
          style={{ backgroundColor: language.color || languageInfo?.color || '#333' }}
        >
          <Image
            src={language.logo || languageInfo?.logo || '/placeholder.svg'}
            alt={languageInfo?.name || language.languageId}
            width={32}
            height={32}
            className="object-contain p-1"
          />
        </div>
      </div>

      {/* Remove button - only visible when editable */}
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${languageInfo?.name || language.languageId}`}
        >
          ×
        </button>
      )}

      {/* Tooltip with language name */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {languageInfo?.name || language.languageId}
      </div>
    </div>
  );
}
