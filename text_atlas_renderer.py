import cv2
import numpy as np
import os

def create_letter_gif(letter):
    """Create a GIF file for a single letter"""
    # Create a white background image
    img = np.ones((256, 128, 3), dtype=np.uint8) * 255

    # Set font properties
    font = cv2.FONT_HERSHEY_DUPLEX
    font_scale = 5
    font_thickness = 16
    
    # Get text size to center it
    text_size = cv2.getTextSize(letter, font, font_scale, font_thickness)[0]
    text_x = (img.shape[1] - text_size[0]) // 2
    text_y = (img.shape[0] + text_size[1]) // 2
    
    # Draw the letter in black
    cv2.putText(img, letter, (text_x, text_y), font, 
                font_scale, (0, 0, 0), font_thickness, cv2.LINE_AA)

    # Convert BGR to RGBA for PIL
    img_rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)

    # Concatenate the bytes together into an array string
    flat_bytes = img_rgba.flatten()

    return f"'{letter}': new Uint8Array({str(flat_bytes.tolist())}),\n"

def main():
    # Generate a text atlas for all 26 letters
    array_string = "export const TEXT_ATLAS = {\n"
    for i in range(26):
        letter = chr(ord('A') + i)
        array_string += create_letter_gif(letter)
    array_string += "}\n"
    with open('./src/text_atlas.js', 'w') as f:
        f.write(array_string)

if __name__ == '__main__':
    main()
