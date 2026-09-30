'use client';

import { FileUpload } from '@/components/ui/file-upload';

type MultiFileUploadProps = {
  value: string[];
  onChange: (_urls: string[]) => void;
  folder?: string;
  disabled?: boolean;
};

export function MultiFileUpload({
  value,
  onChange,
  folder = 'events',
  disabled = false,
}: MultiFileUploadProps) {
  const handleChange = (index: number, url: string) => {
    if (url === '') {
      onChange(value.filter((_, i) => i !== index));
    } else {
      const next = [...value];
      next[index] = url;
      onChange(next);
    }
  };

  const handleAdd = (urls: string[]) => {
    onChange([...value, ...urls]);
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {value.map((url, i) => (
        <FileUpload
          key={i}
          value={url}
          onChange={(newUrl) => handleChange(i, newUrl)}
          folder={folder}
          disabled={disabled}
        />
      ))}
      <FileUpload
        value=""
        onChange={() => {}}
        onChangeMultiple={handleAdd}
        folder={folder}
        disabled={disabled}
      />
    </div>
  );
}
