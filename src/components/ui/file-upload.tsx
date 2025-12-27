'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPresignedUrl } from '@/actions/upload/get-presigned-url';

type FileUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // en bytes
  className?: string;
  disabled?: boolean;
};

export function FileUpload({
  value,
  onChange,
  folder = 'events',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  className,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview con value cuando cambie (para edición)
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Mostrar preview local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Subir archivo
    setIsUploading(true);
    try {
      // 1. Obtener presigned URL usando Server Action
      const { uploadUrl, fileUrl } = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        folder,
      });

      // 2. Subir directamente a S3 con el Content-Type correcto (firmado en la URL)
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo a S3');
      }

      // 3. Usar la URL de CloudFront/S3
      onChange(fileUrl);
      setPreview(fileUrl);
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
      setPreview(null);
      onChange('');
    } finally {
      setIsUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted',
            disabled && 'cursor-not-allowed opacity-50',
            isUploading && 'cursor-wait'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Haz clic para subir una imagen
              </span>
              <span className="text-xs text-muted-foreground/70">
                JPEG, PNG, WebP, GIF (máx. {Math.round(maxSize / 1024 / 1024)}MB)
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Input oculto para mantener el valor de la URL */}
      {value && (
        <input type="hidden" value={value} />
      )}
    </div>
  );
}

