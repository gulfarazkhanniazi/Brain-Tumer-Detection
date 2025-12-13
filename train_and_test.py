import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
import random
from PIL import Image, ImageEnhance
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Input, Dense, Flatten, Dropout
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import VGG16
from sklearn.utils import shuffle
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import json
import argparse
import sys

import logging
logging.getLogger('absl').setLevel(logging.ERROR)
import config

# Configuration from config.py
IMAGE_SIZE = config.IMAGE_SIZE
BATCH_SIZE = 20
EPOCHS = 10
MODEL_PATH = config.MODEL_PATH
DATASET_PATH = config.DATASET_PATH
LABELS_PATH = config.LABELS_PATH

# Reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# --- Helper Functions ---

def augment_image(image):
    image = Image.fromarray(np.uint8(image))
    image = ImageEnhance.Brightness(image).enhance(random.uniform(0.8, 1.2))
    image = ImageEnhance.Contrast(image).enhance(random.uniform(0.8, 1.2))
    image = np.array(image) / 255.0
    return image

def open_image(paths):
    images = []
    for path in paths:
        img = load_img(path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
        img = augment_image(img)
        images.append(img)
    return np.array(images)

def encoder_label(labels, unique_labels):
    encoded = [unique_labels.index(label) for label in labels]
    return np.array(encoded)

def datagen(paths, labels, unique_labels, batch_size=12, epochs=1):
    for _ in range(epochs):
        for i in range(0, len(paths), batch_size):
            batch_paths = paths[i:i + batch_size]
            batch_images = open_image(batch_paths)
            batch_labels = encoder_label(labels[i:i + batch_size], unique_labels)
            yield batch_images, batch_labels

def load_dataset(base_dir):
    paths = []
    labels = []
    if not os.path.exists(base_dir):
        return [], []
    
    unique_labels = sorted(os.listdir(base_dir))
    # Filter out hidden files like .DS_Store
    unique_labels = [label for label in unique_labels if not label.startswith('.')]

    for label in unique_labels:
        label_dir = os.path.join(base_dir, label)
        if not os.path.isdir(label_dir):
            continue
        for image in os.listdir(label_dir):
            paths.append(os.path.join(base_dir, label, image))
            labels.append(label)
    
    return shuffle(paths, labels), unique_labels

# --- Main Logic ---

def build_model(num_classes):
    print("Building VGG16 model...")
    base_model = VGG16(input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3), include_top=False, weights='imagenet')
    
    for layer in base_model.layers:
        layer.trainable = False
    
    for layer in base_model.layers[-4:-1]:
        layer.trainable = True

    model = Sequential()
    model.add(Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3)))
    model.add(base_model)
    model.add(Flatten())
    model.add(Dropout(0.3))
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(num_classes, activation='softmax'))
    
    model.compile(optimizer=Adam(learning_rate=0.0001),
                  loss='sparse_categorical_crossentropy',
                  metrics=['sparse_categorical_accuracy'])
    return model

def train():
    train_dir = config.TRAIN_DIR
    
    if not os.path.exists(train_dir):
        print(f"Error: Training dataset not found at {train_dir}")
        print("Please create a 'dataset' folder in this directory and place 'Training' and 'Testing' folders inside it.")
        return None

    print("Loading training data...")
    (train_paths, train_labels), unique_labels = load_dataset(train_dir)
    print(f"Found {len(train_paths)} training images belong to {len(unique_labels)} classes: {unique_labels}")

    if len(train_paths) == 0:
        print("No training images found.")
        return None

    model = build_model(len(unique_labels))
    
    steps = int(len(train_paths) / BATCH_SIZE)
    
    print("Starting training...")
    history = model.fit(
        datagen(train_paths, train_labels, unique_labels, batch_size=BATCH_SIZE, epochs=EPOCHS),
        epochs=EPOCHS,
        steps_per_epoch=steps
    )
    
    print(f"Saving model to {MODEL_PATH}...")
    model.save(MODEL_PATH)
    
    print(f"Saving labels to {LABELS_PATH}...")
    with open(LABELS_PATH, 'w') as f:
        json.dump(unique_labels, f)
        
    return model, unique_labels

def evaluate(model, unique_labels=None):
    test_dir = config.TEST_DIR
    if not os.path.exists(test_dir):
        print(f"Test dataset not found at {test_dir}")
        return

    print("Loading testing data...")
    (test_paths, test_labels), test_unique_labels = load_dataset(test_dir)
    
    # If unique_labels wasn't passed (data loaded from model), try to infer or use test labels
    if unique_labels is None:
        unique_labels = test_unique_labels

    if len(test_paths) == 0:
        print("No test images found.")
        return

    print("Evaluating model...")
    test_images = open_image(test_paths)
    test_labels_encoded = encoder_label(test_labels, unique_labels)
    
    loss, acc = model.evaluate(test_images, test_labels_encoded, verbose=0)
    print(f"Test Accuracy: {acc*100:.2f}%")
    
    predictions = model.predict(test_images)
    pred_labels = np.argmax(predictions, axis=1)
    
    print("\nClassification Report:")
    print(classification_report(test_labels_encoded, pred_labels, target_names=unique_labels))
    
    cm = confusion_matrix(test_labels_encoded, pred_labels)
    print("\nConfusion Matrix:")
    print(cm)

    # Optional: Plot confusion matrix if running in an environment that supports it, or save it
    # plt.figure(figsize=(8, 6))
    # sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=unique_labels, yticklabels=unique_labels)
    # plt.title("Confusion Matrix")
    # plt.savefig("confusion_matrix.png")
    # print("Confusion matrix saved to confusion_matrix.png")

def predict_single_image(model, image_path, unique_labels):
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    try:
        # Load and preprocess
        img = load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
        img_array = img_to_array(img)
        # Apply the same augmentation/normalization as training? 
        # In training we used: image = np.array(image) / 255.0. 
        # The augment_image function did this.
        # We should just normalize here.
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0) # Add batch dimension

        # Predict
        prediction = model.predict(img_array)
        predicted_class_idx = np.argmax(prediction)
        confidence = np.max(prediction)
        
        predicted_label = unique_labels[predicted_class_idx]
        
        print("-" * 30)
        print(f"Image: {image_path}")
        print(f"Prediction: {predicted_label}")
        print(f"Confidence: {confidence*100:.2f}%")
        print("-" * 30)
        
    except Exception as e:
        print(f"Error predicting image: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Brain Tumor Detection VGG16")
    parser.add_argument("--predict", type=str, help="Path to an image file to predict")
    args = parser.parse_args()

    # Always check for model existence first
    if os.path.exists(MODEL_PATH):
        # Load Model
        # print(f"Found existing model at {MODEL_PATH}. Loading...")
        model = load_model(MODEL_PATH)
        
        # Load Labels
        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH, 'r') as f:
                unique_labels = json.load(f)
        else:
            # Fallback
            unique_labels = ['glioma', 'meningioma', 'notumor', 'pituitary']

        if args.predict:
            # Predict single image
            predict_single_image(model, args.predict, unique_labels)
        else:
            # Default behavior: Evaluate on Test Set
            evaluate(model, unique_labels)
            
    else:
        if args.predict:
             print("Error: No trained model found. Please run without arguments first to train.")
        else:
            print("Model not found. Initiating training...")
            dataset_exists = os.path.exists(os.path.join(DATASET_PATH, "Training"))
            if not dataset_exists:
                 print("CANNOT TRAIN: Dataset missing.")
                 print(f"Please ensure '{os.path.join(DATASET_PATH, 'Training')}' exists.")
            else:
                 model, labels = train()
                 if model:
                     evaluate(model, labels)
