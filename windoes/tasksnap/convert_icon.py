from PIL import Image

# Open the write.png file and convert to .ico
img = Image.open('write.png')
img.save('dought_icon.ico', format='ICO', sizes=[(256, 256)])
print("Icon converted successfully!")
