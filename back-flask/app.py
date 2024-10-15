from flask import Flask, render_template, request, jsonify
from PIL import Image
import numpy as np
import io
import pytesseract
import os
from services.vocabulary import get_vocabulary_list
import time
from datetime import datetime, timedelta  # Import timedelta from datetime

app = Flask(__name__)

start_time = time.time()

UPLOAD_FOLDER = "uploads/"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Route for the main page with the canvas
@app.route("/")
def index():
    # return render_template("index.html")
    words = get_vocabulary_list()
    return render_template("vocabulary.html", words=words)


@app.route("/vocabulary")
def vocabulary():
    words = get_vocabulary_list()
    return render_template("vocabulary.html", words=words)


@app.route("/flashcards")
def flashcards():
    return render_template("flashcards.html")


@app.route("/drawing")
def drawing():
    return render_template("drawing.html")


@app.route("/chat")
def chat():
    return render_template("chat.html")


@app.route("/info")
def info():
    deploy_datetime = os.getenv("DEPLOY_DATETIME", "Unknown")

    # Calculate uptime
    current_time = time.time()
    uptime_seconds = int(current_time - start_time)
    uptime = str(timedelta(seconds=uptime_seconds))  # Use timedelta to format uptime

    # Build the info JSON
    info_data = {"deployed_datetime": deploy_datetime, "service_uptime": uptime}

    return jsonify(info_data)


from PIL import Image, ImageEnhance


# Route to handle canvas data
@app.route("/process_canvas", methods=["POST"])
def process_canvas():
    image_data = request.files["image"]

    # Open the image using PIL (or handle with OpenCV if needed)
    image = Image.open(image_data)

    image = remove_transparency(image)
    image.info["dpi"] = (300, 300)
    image = image.convert("L")  # 'L' mode is grayscale
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)  # You can adjust the contrast factor

    filename = f'canvas_image_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
    image_filename = os.path.join(UPLOAD_FOLDER, filename)
    image.save(image_filename)

    text = pytesseract.image_to_string(image_filename, lang="fas")
    # image.show()
    print(text)

    text = process_with_tesseract(image)
    print(text)

    return jsonify({"message": text, "filename": image_filename})


def remove_transparency(image, bg_color=(255, 255, 255)):
    if image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    ):
        alpha = image.convert("RGBA").split()[-1]
        background = Image.new("RGB", image.size, bg_color)
        background.paste(image, mask=alpha)
        return background
    else:
        return image


def process_with_tesseract(image):
    # Convert PIL image to grayscale if needed
    gray_image = image.convert("L")

    # Convert image to text using Tesseract
    text = pytesseract.image_to_string(gray_image, lang="fas")
    return text


# Sample list of words to display
words_list = [
    {"word": "سلام", "transliteration": "salam", "translation": "Hello"},
    {"word": "خداحافظ", "transliteration": "khodā hāfez", "translation": "Goodbye"},
    {"word": "بله", "transliteration": "baleh", "translation": "Yes"},
    {"word": "نه", "transliteration": "na", "translation": "No"},
    {"word": "لطفاً", "transliteration": "lotfan", "translation": "Please"},
    {"word": "متشکرم", "transliteration": "motashakkeram", "translation": "Thank you"},
    {"word": "آب", "transliteration": "âb", "translation": "Water"},
    {"word": "نان", "transliteration": "nân", "translation": "Bread"},
]
exo1 = [
    {"word": "سلام", "transliteration": "salam", "translation": "Hello"},
    {"word": "آب", "transliteration": "âb", "translation": "Water"},
    {"word": "آن", "transliteration": "ân", "translation": "That"},
    {"word": "نان", "transliteration": "nân", "translation": "Bread"},
    {"word": "با", "transliteration": "bâ", "translation": "With"},
    {"word": "بابا", "transliteration": "bâbâ", "translation": "Father"},
    {"word": "ناب", "transliteration": "nâb", "translation": "Pure"},
]


@app.route("/get_words", methods=["GET"])
def get_words():
    return jsonify(exo1)


if __name__ == "__main__":
    app.run()
