# firebase cloud function for inference
import functions_framework
import tensorflow as tf
import numpy as np
import cv2
import json
from google.cloud import storage

# Load model from Firebase Storage
BUCKET_NAME = "your-firebase-bucket"
MODEL_PATH = "mobilenetv2_fashion"

storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)
blob = bucket.blob(MODEL_PATH)
blob.download_to_filename("/tmp/mobilenetv2_fashion")

# Load the model
model = tf.keras.models.load_model("/tmp/mobilenetv2_fashion")

LABELS = ["t-shirt", "pants", "shoes", "..."]

@functions_framework.http
def detect_clothing(request):
    file = request.files["image"]
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    image = cv2.resize(image, (224, 224)) / 255.0  # Normalize

    # Expand dims
    image = np.expand_dims(image, axis=0)
    predictions = model.predict(image)
    predicted_label = LABELS[np.argmax(predictions)]

    return json.dumps({"category": predicted_label})
