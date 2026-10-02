/** Sube `file` a S3 con un formulario firmado (presigned POST), que es el que limita el tamaño. */
export async function postUploadForm(url: string, fields: Record<string, string>, file: File) {
  const form = new FormData();
  Object.entries(fields).forEach(([name, value]) => form.append(name, value));
  form.append('file', file);

  const response = await fetch(url, { method: 'POST', body: form });
  if (!response.ok) throw new Error('Error al subir el archivo');
}
