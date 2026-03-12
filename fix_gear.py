from PIL import Image

def make_transparent():
    # Load image and convert to RGBA
    img = Image.open('frontend/public/assets/textures/brass_gear_dial.png').convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is near white
        # If r, g, b > 230, make transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save('frontend/public/assets/textures/brass_gear_dial.png', "PNG")

make_transparent()
print("Gear background made transparent successfully!")
