from rembg import remove
from PIL import Image

input_path = 'public/demo-before.jpg'
output_path = 'public/demo-after.png'

input_img = Image.open(input_path)
output_img = remove(input_img)
output_img.save(output_path)
print("Image successfully processed and saved!")
