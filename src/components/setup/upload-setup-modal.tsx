'use client';

import type React from 'react';

import { createSetup } from '@/actions/setup/create-setup';
import { editSetup } from '@/actions/setup/edit-setup';
import { updateSetupImage } from '@/actions/setup/update-setup-image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createBrowserClient } from '@supabase/ssr';
import { AlertCircle, Check, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface UploadSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (setupData: any) => void;
  refetch: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  userId: string;
  setupToEdit?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  };
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

export default function UploadSetupModal({
  open,
  onOpenChange,
  userId,
  refetch,
  setupToEdit,
}: UploadSetupModalProps) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(setupToEdit?.imageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Efecto para actualizar los estados cuando setupToEdit cambia
  useEffect(() => {
    if (setupToEdit) {
      setTitleLength(setupToEdit.title.length);
      setDescriptionLength(setupToEdit.description.length);
      setPreview(setupToEdit.imageUrl);
    } else {
      setTitleLength(0);
      setDescriptionLength(0);
      setPreview(null);
    }
  }, [setupToEdit]);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Formato no válido. Solo se aceptan JPG, PNG y WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo es muy grande. Máximo 5MB.';
    }
    return null;
  };

  const handleFile = async (file: File) => {
    if (!userId) {
      setError('Debes iniciar sesión para subir imágenes');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Error al procesar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true);
    try {
      startTransition(async () => {
        if (setupToEdit) {
          let imageUrl = setupToEdit.imageUrl;

          if (selectedFile) {
            const supabase = createClient();
            const { data, error } = await supabase.storage
              .from('setups')
              .upload(`${setupToEdit.id}`, selectedFile, {
                upsert: true,
                contentType: selectedFile.type,
              });

            // Añadimos el timestamp a la URL
            const timestamp = new Date().getTime();
            imageUrl = `${setupToEdit.imageUrl}?t=${timestamp}`;
          }
          await editSetup({ id: setupToEdit.id, formData, imageUrl });
        } else {
          // Primero creamos el setup con una URL temporal
          const setupId = await createSetup(formData, 'https://placehold.co/600x400/png');

          const supabase = createClient();
          // Subimos la imagen a supabase storage usando el ID del setup
          const { data, error } = await supabase.storage
            .from('setups')
            .upload(`${setupId}`, selectedFile!, {
              upsert: true,
              contentType: selectedFile!.type,
            });
          if (error) {
            console.log({ error });
            return;
          }

          // Obtenemos la URL pública de la imagen
          const { data: publicUrlData } = supabase.storage.from('setups').getPublicUrl(data.path);

          // Actualizamos el setup con la URL real de la imagen
          await updateSetupImage(setupId, publicUrlData.publicUrl);
        }

        resetForm();
        onOpenChange(false);
        refetch();
        toast.success(
          setupToEdit ? 'Setup actualizado exitosamente! 🎉' : 'Setup subido exitosamente! 🎉',
        );
      });
    } catch (error) {
      setError('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setIsUploading(false);
    setTitleLength(0);
    setDescriptionLength(0);
    formRef.current?.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {setupToEdit ? 'Editar setup' : 'Comparte tu setup'}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                name="title"
                placeholder="Título de la publicación"
                className="text-lg font-medium transition-all duration-200 focus:scale-[1.01]"
                maxLength={45}
                required
                defaultValue={setupToEdit?.title}
                onChange={(e) => setTitleLength(e.target.value.length)}
              />
              <p className="mt-3 text-xs text-gray-500">{titleLength}/45</p>
            </div>

            <div>
              <Textarea
                name="description"
                placeholder="Describe tu setup, componentes, inspiración..."
                className="min-h-[100px] transition-all duration-200 focus:scale-[1.01]"
                maxLength={250}
                defaultValue={setupToEdit?.description}
                onChange={(e) => setDescriptionLength(e.target.value.length)}
              />
              <p className="mt-3 text-xs text-gray-500">{descriptionLength}/250</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'scale-105 border-blue-500 bg-blue-50'
                  : preview
                    ? 'border-green-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="group relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    onClick={() => {
                      setPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                      dragActive ? 'scale-110 bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <Upload
                      className={`h-8 w-8 transition-colors duration-300 ${
                        dragActive ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Sube una imagen de tu setup
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      o haz clic para explorar (5 MB máx.)
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-300">
                      Formatos: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                required={!setupToEdit}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-600 duration-300 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between border-t pt-4">
              <Button
                type="submit"
                disabled={isPending || !preview}
                className="w-full bg-blue-500 py-4 transition-all duration-200 hover:scale-105 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Compartir ahora
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
