from PIL import Image
import os

try:
    img_path = r'd:\WeedingInvitation\Images\Butterfly.png'
    out_path = r'd:\WeedingInvitation\Images\Butterfly_cursor.png'
    
    with Image.open(img_path) as img:
        # Resize to 64x64
        img.thumbnail((64, 64), Image.Resampling.LANCZOS)
        img.save(out_path)
        print(f"Resized image saved to {out_path} with size {img.size}")
except Exception as e:
    print(f"Error: {e}")
