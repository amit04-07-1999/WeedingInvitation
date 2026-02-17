from PIL import Image
import os

def resize_gif(input_path, output_path, new_size):
    try:
        im = Image.open(input_path)
    except IOError:
        print(f"Cannot open {input_path}")
        return

    frames = []
    durations = []
    try:
        while True:
            # Convert to RGBA for better resizing quality
            frame = im.convert('RGBA')
            frames.append(frame.resize(new_size, Image.Resampling.LANCZOS))
            durations.append(im.info.get('duration', 100))
            im.seek(im.tell() + 1)
    except EOFError:
        pass

    if frames:
        # Save as GIF
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            loop=im.info.get('loop', 0),
            duration=durations,
            disposal=2,
            transparency=0 
        )
        print(f"Resized GIF saved to {output_path} with {len(frames)} frames")

if __name__ == '__main__':
    img_path = r'd:\WeedingInvitation\Images\Butterfly_cursor.gif'
    out_path = r'd:\WeedingInvitation\Images\Butterfly_cursor_resized.gif'
    
    if os.path.exists(img_path):
        print(f"Processing {img_path}...")
        resize_gif(img_path, out_path, (64, 64))
    else:
        print(f"File not found: {img_path}")
