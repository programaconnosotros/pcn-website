'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { cn } from '@/lib/utils';

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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {value.map((url, i) => (
        <div
          key={url}
          draggable={!disabled}
          onDragStart={(e) => {
            setDragIndex(i);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => {
            if (dragIndex === null) return;
            e.preventDefault();
            setOverIndex(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) move(dragIndex, i);
            handleDragEnd();
          }}
          onDragEnd={handleDragEnd}
          className={cn(
            'relative group cursor-grab rounded-lg transition-opacity active:cursor-grabbing',
            dragIndex === i && 'opacity-40',
            overIndex === i && dragIndex !== i && 'ring-2 ring-primary ring-offset-2',
          )}
        >
          <FileUpload
            value={url}
            onChange={(newUrl) => handleChange(i, newUrl)}
            folder={folder}
            disabled={disabled}
          />
          {value.length > 1 && !disabled && (
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md bg-background/90 p-0.5 shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Mover a la izquierda"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => move(i, i + 1)}
                disabled={i === value.length - 1}
                aria-label="Mover a la derecha"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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
