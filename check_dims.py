from PIL import Image
import os

try:
    img_path = r'd:\WeedingInvitation\Images\Butterfly.png'
    with Image.open(img_path) as img:
        print(f"Width: {img.width}, Height: {img.height}")
except Exception as e:
    print(f"Error: {e}")
