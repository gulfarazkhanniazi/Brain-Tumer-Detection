import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Input, Dense, Flatten, Dropout, Rescaling
from tensorflow.keras.layers import RandomFlip, RandomRotation, RandomZoom, RandomContrast, RandomBrightness
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import VGG16
from tensorflow.keras.utils import image_dataset_from_directory, img_to_array, load_img
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import json
import argparse
import logging
import config

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
logging.getLogger('absl').setLevel(logging.ERROR)

# Configuration
IMAGE_SIZE = config.IMAGE_SIZE
BATCH_SIZE = 32
EPOCHS = 10
MODEL_PATH = config.MODEL_PATH
DATASET_PATH = config.DATASET_PATH
LABELS_PATH = config.LABELS_PATH

# Reproducibility
tf.random.set_seed(42)
np.random.seed(42)

def build_model(num_classes):
    logger.info("Building VGG16 model with augmentation layers...")
    
    # Data Augmentation Layers (Active only during training)
    data_augmentation = Sequential([
        RandomFlip("horizontal"),
        RandomRotation(0.1),
        RandomZoom(0.1),
        RandomContrast(0.1),
        RandomBrightness(0.1)
    ], name="data_augmentation")

    base_model = VGG16(input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3), include_top=False, weights='imagenet')
    
    # Freeze base model
    base_model.trainable = False
    
    # Unfreeze last block
    for layer in base_model.layers[-4:]:
        layer.trainable = True

    model = Sequential([
        Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3)),
        data_augmentation,
        Rescaling(1./255), # Normalize here instead of manually
        base_model,
        Flatten(),
        Dropout(0.3),
        Dense(128, activation='relu'),
        Dropout(0.2),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.0001),
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def train():
    train_dir = config.TRAIN_DIR
    
    if not os.path.exists(train_dir):
        logger.error(f"Training dataset not found at {train_dir}")
        print("Please check your dataset path.")
        return None, None

    logger.info(f"Loading training data from {train_dir}...")
    
    try:
        train_ds = image_dataset_from_directory(
            train_dir,
            validation_split=0.2,
            subset="training",
            seed=123,
            image_size=(IMAGE_SIZE, IMAGE_SIZE),
            batch_size=BATCH_SIZE
        )
        
        val_ds = image_dataset_from_directory(
            train_dir,
            validation_split=0.2,
            subset="validation",
            seed=123,
            image_size=(IMAGE_SIZE, IMAGE_SIZE),
            batch_size=BATCH_SIZE
        )
        
        class_names = train_ds.class_names
        logger.info(f"Classes found: {class_names}")
    except ValueError as e:
        logger.error(f"Error loading dataset: {e}")
        return None, None

    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model = build_model(len(class_names))
    
    logger.info("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS
    )
    
    logger.info(f"Saving model to {MODEL_PATH}...")
    model.save(MODEL_PATH)
    
    logger.info(f"Saving labels to {LABELS_PATH}...")
    with open(LABELS_PATH, 'w') as f:
        json.dump(class_names, f)
        
    return model, class_names

def evaluate(model, unique_labels=None):
    test_dir = config.TEST_DIR
    if not os.path.exists(test_dir):
        logger.error(f"Test dataset not found at {test_dir}")
        return

    logger.info("Loading testing data...")
    try:
        test_ds = image_dataset_from_directory(
            test_dir,
            image_size=(IMAGE_SIZE, IMAGE_SIZE),
            batch_size=BATCH_SIZE,
            shuffle=False 
        )
    except Exception as e:
        logger.error(f"Error loading test dataset: {e}")
        return
    
    if unique_labels is None:
        unique_labels = test_ds.class_names

    logger.info("Evaluating model...")
    results = model.evaluate(test_ds, verbose=0)
    logger.info(f"Test Loss: {results[0]:.4f}")
    logger.info(f"Test Accuracy: {results[1]*100:.2f}%")
    
    # Predictions
    predictions = model.predict(test_ds)
    pred_labels = np.argmax(predictions, axis=1)
    
    # Extract true labels
    true_labels = np.concatenate([y for x, y in test_ds], axis=0)
    
    print("\nClassification Report:")
    print(classification_report(true_labels, pred_labels, target_names=unique_labels))
    
    cm = confusion_matrix(true_labels, pred_labels)
    print("\nConfusion Matrix:")
    print(cm)

def predict_single_image(model, image_path, unique_labels):
    if not os.path.exists(image_path):
        logger.error(f"Image not found at {image_path}")
        return

    try:
        img = load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) 
        
        # If the model expects normalized input (old model), this might fail if we don't normalize.
        # But since we can't easily detect, we assume the model handles it (Rescaling layer) 
        # or the user expects this script to work with the NEW model.
        
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
        logger.error(f"Error predicting image: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Brain Tumor Detection VGG16")
    parser.add_argument("--predict", type=str, help="Path to an image file to predict")
    args = parser.parse_args()

    # Load Labels
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r') as f:
            unique_labels = json.load(f)
    else:
        unique_labels = None

    if args.predict:
        if os.path.exists(MODEL_PATH):
             try:
                 model = load_model(MODEL_PATH)
                 if unique_labels:
                     predict_single_image(model, args.predict, unique_labels)
                 else:
                     logger.error("Labels file not found, cannot predict safely.")
             except Exception as e:
                 logger.error(f"Failed to load model: {e}")
        else:
             logger.error("Model not found. Please train first.")
    else:
        if os.path.exists(MODEL_PATH):
            logger.info(f"Reference model found at {MODEL_PATH}.")
            model = load_model(MODEL_PATH)
            evaluate(model, unique_labels)
        else:
            logger.info("Model not found. Initiating training...")
            model, labels = train()
            if model:
                evaluate(model, labels)
