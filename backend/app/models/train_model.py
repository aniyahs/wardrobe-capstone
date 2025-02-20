# train and save model
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.utils import to_categorical

import numpy as np
import os
from preprocess import load_annotations, process_image
from sklearn.model_selection import train_test_split

IMG_SIZE = 224
BATCH_SIZE = 32
NUM_CLASSES = 13
DATASET_PATH = "/path/to/deepfashion2"

# Load images & labels
images, labels = load_annotations(DATASET_PATH)
images = np.array([process_image(img) for img in images])
labels = tf.to_categorical(labels, NUM_CLASSES)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(images, labels, test_size=0.2)

# Load MobileNetV2
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False

# Add custom classification layers
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(NUM_CLASSES, activation="softmax")
])

model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# Train model
model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=10, batch_size=BATCH_SIZE)

# Save model
model.save("../models/mobilenetv2_fashion")
