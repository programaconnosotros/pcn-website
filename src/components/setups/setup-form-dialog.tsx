'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUp, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createSetup, getSetupUploadForm, updateSetup } from '@/actions/setups/setup-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { dialogFormActionBarClassName } from '@/components/ui/form-action-bar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { postUploadForm } from '@/lib/upload-form';
import { cn } from '@/lib/utils';
import {
  SETUP_IMAGE_TYPES,
  SETUP_MAX_BYTES,
  setupSchema,
  type SetupFormData,
} from '@/schemas/setup-schema';

const MAX_MB = Math.round(SETUP_MAX_BYTES / 1024 / 1024);

type EditableSetup = SetupFormData & { id: string; imageUrl: string };

interface SetupFormDialogProps {
  /** The setup being edited; without it the dialog publishes a new one. */
  setup?: EditableSetup;
  /** Renders its own "share" button; leave it out to control `open` from outside. */
  withTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
}

/** Sends the original photo straight to S3 and returns its key, to be optimized on the server. */
async function uploadOriginal(file: File) {
  const { url, fields, key } = await getSetupUploadForm(file.type);
  await postUploadForm(url, fields, file);
  return key;
}

const fileError = (file: File) => {
  if (!SETUP_IMAGE_TYPES.includes(file.type)) {
    return /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
      ? 'HEIC no está soportado: exportá la foto como JPG.'
      : 'Formato no soportado. Subí JPG, PNG, WebP o AVIF.';
  }
  if (file.size > SETUP_MAX_BYTES) return `La foto pesa más de ${MAX_MB} MB.`;
  return null;
};

export function SetupFormDialog({ setup, withTrigger, open, onOpenChange }: SetupFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: { title: setup?.title ?? '', description: setup?.description ?? '' },
  });

  // Free the local preview when it's replaced or the dialog goes away.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const error = fileError(picked);
    setPhotoError(error);
    if (error) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const reset = () => {
    form.reset({ title: setup?.title ?? '', description: setup?.description ?? '' });
    setFile(null);
    setPreview(null);
    setPhotoError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    if (!next) reset();
    setOpen(next);
  };

  const onSubmit = async (data: SetupFormData) => {
    if (!setup && !file) {
      setPhotoError('Subí una foto de tu setup.');
      return;
    }

    setIsSubmitting(true);
    const save = async () => {
      const originalKey = file ? await uploadOriginal(file) : null;
      if (setup) {
        await updateSetup(setup.id, data, originalKey);
        return setup.id;
      }
      const created = await createSetup(originalKey!, data);
      return created.id;
    };

    try {
      const id = await save();
      toast.success(setup ? 'Setup actualizado' : '¡Setup publicado! 🖥️');
      reset();
      setOpen(false);
      if (!setup) router.push(`/setups/${id}`);
    } catch (error) {
      toast.error(
        actionErrorMessage(
          error,
          setup ? 'No se pudo guardar el setup' : 'No se pudo publicar el setup',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const shownImage = preview ?? setup?.imageUrl ?? null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {withTrigger && (
        <DialogTrigger asChild>
          <Button variant="pcn" size="sm">
            <Plus className="mr-1.5 size-4" />
            compartirSetup();
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{setup ? 'Editar setup' : 'Compartir tu setup'}</DialogTitle>
          <DialogDescription>
            Una foto de dónde programás y qué usás: escritorio, equipo, periféricos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setup-photo">Foto</Label>
              <input
                ref={inputRef}
                id="setup-photo"
                type="file"
                accept={SETUP_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  'group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-sm border border-dashed bg-black/40 font-mono text-xs transition-colors',
                  isDragging
                    ? 'border-pcnGreen bg-pcnGreen/[0.06]'
                    : 'border-pcnGreen-200 hover:border-pcnGreen-500',
                  photoError && 'border-destructive',
                )}
              >
                {shownImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shownImage}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-sm bg-black/75 px-1.5 py-0.5 text-[11px] text-pcnGreen opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <RefreshCw className="size-3" />
                      cambiar foto
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageUp className="size-6 text-pcnGreen-500" />
                    <span>
                      <span className="text-pcnGreen-500">$ </span>
                      soltá la foto o hacé clic
                    </span>
                    <span className="text-[10px]">JPG, PNG, WebP o AVIF · hasta {MAX_MB} MB</span>
                  </span>
                )}
              </button>
              {photoError && <p className="text-sm text-destructive">{photoError}</p>}
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi escritorio de home office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Qué equipo, monitores, teclado, silla… lo que quieras contar."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={dialogFormActionBarClassName}>
              <Button
                type="submit"
                variant="pcn"
                className="w-full"
                loading={isSubmitting}
                loadingText={file ? 'subiendo foto...' : 'guardando...'}
              >
                {setup ? 'guardar();' : 'publicar();'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
