"use client"

import type React from "react"

import { createSetup } from "@/actions/setup/create-setup"
import { updateSetupImage } from "@/actions/setup/update-setup-image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createBrowserClient } from "@supabase/ssr"
import { AlertCircle, Check, Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

interface UploadSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (setupData: any) => void
  refetch: () => void
  isAuthenticated: boolean
  onAuthRequired: () => void
  userId: string
}

const ACCEPTED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const createClient = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

export default function UploadSetupModal({ 
  open, 
  onOpenChange, 
  onSubmit,
  isAuthenticated,
  userId,
  onAuthRequired,
  refetch
}: UploadSetupModalProps) {
  const [isPending, startTransition] = useTransition()
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [titleLength, setTitleLength] = useState(0)
  const [descriptionLength, setDescriptionLength] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return "Formato no válido. Solo se aceptan JPG, PNG y WebP."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo es muy grande. Máximo 5MB."
    }
    return null
  }

  const handleFile = async (file: File) => {
    if (!userId) {
      setError("Debes iniciar sesión para subir imágenes")
      return
    }

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError('Error al procesar la imagen')
    } finally {
      setIsUploading(false)
    }
  }
  

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true)
    try {
      startTransition(async () => {
        // Primero creamos el setup con una URL temporal
        const setupId = await createSetup(formData, "https://placehold.co/600x400/png")
        
        const supabase = createClient()
        // Subimos la imagen a supabase storage usando el ID del setup
        const { data, error } = await supabase.storage.from('setups').upload(`${setupId}`, selectedFile!,{
          upsert: true,
          contentType: selectedFile!.type,
        })
        if (error) {
          console.log({error});
          return
        } 

        // Obtenemos la URL pública de la imagen
        const { data: publicUrlData } = supabase
          .storage
          .from('setups')
          .getPublicUrl(data.path)
        
        // Actualizamos el setup con la URL real de la imagen
        await updateSetupImage(setupId, publicUrlData.publicUrl)

        resetForm()
        onOpenChange(false)
        refetch()
        toast.success('Setup subido exitosamente! 🎉')
      })
    } catch (error) {
      setError('Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  console.log({isPending, isUploading})

  const resetForm = () => {
    setPreview(null)
    setSelectedFile(null)
    setError(null)
    setIsUploading(false)
    setTitleLength(0)
    setDescriptionLength(0)
    formRef.current?.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm()
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Comparte tu setup</DialogTitle>
        </DialogHeader>

        <form 
          ref={formRef}
          action={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div>
              <Input
                name="title"
                placeholder="Título de la publicación"
                className="text-lg font-medium transition-all duration-200 focus:scale-[1.01]"
                maxLength={45}
                required
                onChange={(e) => setTitleLength(e.target.value.length)}
              />
              <p className="text-xs text-gray-500 mt-3">
                {titleLength}/45
              </p>
            </div>

            <div>
              <Textarea
                name="description"
                placeholder="Describe tu setup, componentes, inspiración..."
                className="min-h-[100px] transition-all duration-200 focus:scale-[1.01]"
                maxLength={250}
                onChange={(e) => setDescriptionLength(e.target.value.length)}
              />
              <p className="text-xs text-gray-500 mt-3">
                {descriptionLength}/250
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : preview
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative group">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="mx-auto rounded-lg max-h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => {
                      setPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      dragActive ? "bg-blue-100 scale-110" : "bg-gray-100"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 transition-colors duration-300 ${
                        dragActive ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Sube una imagen de tu setup</p>
                    <p className="text-sm text-gray-500">o haz clic para explorar (5 MB máx.)</p>
                    <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, WebP</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="submit"
                disabled={isPending || !preview}
                className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isPending) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Compartir ahora
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
