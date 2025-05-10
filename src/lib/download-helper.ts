/**
 * Función para descargar una imagen desde una URL
 * @param imageUrl URL de la imagen a descargar
 * @param fileName Nombre del archivo para la descarga
 */
export async function downloadImage(imageUrl: string, fileName: string) {
  try {
    // Si la URL es una URL de placeholder, no podemos descargarla directamente
    if (imageUrl.startsWith('/placeholder.svg')) {
      console.error('No se puede descargar una imagen de placeholder');
      return;
    }

    // Obtener la imagen como blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear un elemento <a> temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'foto.jpg';
    document.body.appendChild(link);

    // Simular un clic en el enlace para iniciar la descarga
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar la imagen:', error);
  }
}
