from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
from preprocess import process_image

app = Flask(__name__)

# Load trained model
model = tf.keras.models.load_model("../models/mobilenetv2_fashion")
LABELS = ["t-shirt", "pants", "shoes", "..."]  # Replace with DeepFashion2 categories

@app.route("/detect", methods=["POST"])
def detect_clothing():
    file = request.files["image"]
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    image = process_image(image)

    # Expand dims for model
    image = np.expand_dims(image, axis=0)
    predictions = model.predict(image)
    predicted_label = LABELS[np.argmax(predictions)]

    return jsonify({"category": predicted_label})

if __name__ == "__main__":
    app.run(debug=True)
