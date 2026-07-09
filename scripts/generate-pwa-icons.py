import os
from PIL import Image

def generate_icons():
    logo_path = 'public/logo.webp'
    if not os.path.exists(logo_path):
        print(f"Error: No se encontró el logo en {logo_path}")
        return

    logo = Image.open(logo_path)
    print(f"Logotipo cargado: {logo_path} ({logo.size}, {logo.mode})")

    # Tamaños requeridos
    sizes = [192, 512]
    
    # Color de fondo para iconos maskables (coincide con el background oscuro de la app: Zinc 950 / Slate 950)
    bg_color = (9, 9, 11, 255) # #09090b

    for size in sizes:
        # 1. Icono Estándar (Fondo transparente, logo ocupa 80% del contenedor)
        standard_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        
        # Calcular escala
        max_dim = int(size * 0.8)
        ratio = min(max_dim / logo.width, max_dim / logo.height)
        new_width = int(logo.width * ratio)
        new_height = int(logo.height * ratio)
        
        resized_logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Centrar
        offset = ((size - new_width) // 2, (size - new_height) // 2)
        standard_img.paste(resized_logo, offset, resized_logo)
        
        standard_out = f"public/pwa-icon-{size}.png"
        standard_img.save(standard_out, "PNG")
        print(f"Creado icono estándar: {standard_out}")

        # 2. Icono Maskable (Fondo sólido, logo ocupa 55% del contenedor para estar dentro de la zona segura de recorte)
        maskable_img = Image.new("RGBA", (size, size), bg_color)
        
        max_dim_maskable = int(size * 0.55)
        ratio_maskable = min(max_dim_maskable / logo.width, max_dim_maskable / logo.height)
        new_width_maskable = int(logo.width * ratio_maskable)
        new_height_maskable = int(logo.height * ratio_maskable)
        
        resized_logo_maskable = logo.resize((new_width_maskable, new_height_maskable), Image.Resampling.LANCZOS)
        
        # Centrar
        offset_maskable = ((size - new_width_maskable) // 2, (size - new_height_maskable) // 2)
        maskable_img.paste(resized_logo_maskable, offset_maskable, resized_logo_maskable)
        
        # Convertir a RGB ya que no necesita transparencia (y es mejor para maskable)
        maskable_rgb = maskable_img.convert("RGB")
        
        maskable_out = f"public/pwa-icon-{size}-maskable.png"
        maskable_rgb.save(maskable_out, "PNG")
        print(f"Creado icono maskable: {maskable_out}")

if __name__ == "__main__":
    generate_icons()
