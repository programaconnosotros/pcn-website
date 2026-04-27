'use client';

import { FileUpload } from '@/components/ui/file-upload';

type MultiFileUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
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

  const handleAdd = (url: string) => {
    if (url !== '') {
      onChange([...value, url]);
    }
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
        key={value.length}
        value=""
        onChange={handleAdd}
        folder={folder}
        disabled={disabled}
      />
    </div>
  );
}
