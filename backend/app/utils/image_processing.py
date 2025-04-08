import torch
import torchvision.transforms as transforms
from PIL import Image
import torchvision.models as models
import requests
from io import BytesIO

# Load MobileNetV2 (pretrained on ImageNet)
mobilenet_v2 = models.mobilenet_v2(pretrained=True)
mobilenet_v2.eval()

# Define Image Preprocessing
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    image = Image.open(image_path).convert("RGB")
    return transform(image).unsqueeze(0)

# Function to Predict Clothing Category
def predict_clothing(image_url):
    try:
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content)).convert("RGB")
        image_tensor = preprocess_image(image)
        
        # Forward pass through MobileNetV2
        with torch.no_grad():
            outputs = mobilenet_v2(image_tensor)
            _, predicted_class = outputs.max(1)
        
        # Map predicted class to clothing type (placeholder mapping)
        category_map = {0: "T-shirt", 1: "Shirt", 2: "Jeans", 3: "Sneakers", 4: "Jacket"}
        category = category_map.get(predicted_class.item(), "Unknown")
        
        return {"category": category, "tags": [category.lower()]}
    except Exception as e:
        return {"error": str(e)}
