import json
import os
import cv2

IMG_SIZE = 224

def load_annotations(dataset_path):
    images, labels = [], []
    annotation_path = os.path.join(dataset_path, "train_annos")
    
    for json_file in os.listdir(annotation_path):
        with open(os.path.join(annotation_path, json_file)) as f:
            annotation = json.load(f)
            images.append(annotation["image_name"])
            labels.append(annotation["category_id"])
    
    return images, labels

def process_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0  # Normalize
    return img
