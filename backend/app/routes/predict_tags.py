from flask import Blueprint, request, jsonify
import tensorflow as tf
import numpy as np
import requests
from PIL import Image
import io
import pickle

predict_bp = Blueprint('predict_bp', __name__)

# Load the model and the encoders for type, color, and pattern
model = tf.keras.models.load_model('wearwell_mobilenetv2.h5')

with open('type_encoder.pkl', 'rb') as f:
    type_encoder = pickle.load(f)

with open('color_encoder.pkl', 'rb') as f:
    color_encoder = pickle.load(f)

with open('pattern_encoder.pkl', 'rb') as f:
    pattern_encoder = pickle.load(f)

# preprocessing 
def preprocess_image(url):
    response = requests.get(url)
    img = Image.open(io.BytesIO(response.content)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0 
    img_array = np.expand_dims(img_array, axis=0)  
    return img_array

@predict_bp.route('/predict_tags', methods=['POST'])
def predict_tags():
    data = request.get_json()
    image_url = data.get('imageUrl')
    
    if not image_url:
        return jsonify({"error": "No image URL provided."}), 400

    try:
        img_array = preprocess_image(image_url)
        
        predictions = model.predict(img_array)
        
        type_pred = np.argmax(predictions[0], axis=1)
        color_pred = np.argmax(predictions[1], axis=1)
        pattern_pred = np.argmax(predictions[2], axis=1)
        
        predicted_type = type_encoder.inverse_transform(type_pred)[0]
        predicted_color = color_encoder.inverse_transform(color_pred)[0]
        predicted_pattern = pattern_encoder.inverse_transform(pattern_pred)[0]
        
        return jsonify({
            "type": predicted_type,
            "color": predicted_color,
            "pattern": predicted_pattern
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
