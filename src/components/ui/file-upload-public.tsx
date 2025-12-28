'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPresignedUrlPublic } from '@/actions/upload/get-presigned-url-public';

type FileUploadPublicProps = {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // en bytes
  className?: string;
  disabled?: boolean;
};

/**
 * Componente de subida de archivos para uso público (sin autenticación).
 * Solo permite subir imágenes a la carpeta 'registration-profiles'.
 */
export function FileUploadPublic({
  value,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  className,
  disabled = false,
}: FileUploadPublicProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview con value cuando cambie
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
      // 1. Obtener presigned URL usando Server Action pública
      const { uploadUrl, fileUrl } = await getPresignedUrlPublic({
        fileName: file.name,
        contentType: file.type,
      });

      // 2. Subir directamente a S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo');
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
        <div className="relative inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-xl border bg-muted">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-1 -top-1 z-10 h-6 w-6"
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
            'flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted',
            disabled && 'cursor-not-allowed opacity-50',
            isUploading && 'cursor-wait',
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Camera className="h-8 w-8 text-muted-foreground" />
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP (máx. {Math.round(maxSize / 1024 / 1024)}MB)
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && <input type="hidden" value={value} />}
    </div>
  );
}
