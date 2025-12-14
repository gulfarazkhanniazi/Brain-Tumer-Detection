import os
import warnings
import logging

# Suppress TensorFlow / absl logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=all logs, 1=info, 2=warning, 3=error
warnings.filterwarnings('ignore')  # Suppress other warnings
logging.getLogger('absl').setLevel(logging.ERROR)

from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import json
import os
import config

# Load constants from config
IMAGE_SIZE = config.IMAGE_SIZE
MODEL_PATH = config.MODEL_PATH
LABELS_PATH = config.LABELS_PATH

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Check if model exists
if not os.path.exists(MODEL_PATH):
    logger.error(f"Model not found at {MODEL_PATH}")
    logger.info("Please run train_and_test.py to train the model first.")
    model = None
else:
    logger.info("Loading model...")
    try:
        model = load_model(MODEL_PATH)
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None

# Load labels if exist
if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH, 'r') as f:
        unique_labels = json.load(f)
else:
    unique_labels = []


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
CORS(app)  # Allow React frontend to access this API

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_header(stream):
    """
    Reads the first few bytes of the file stream to verify it's a valid image.
    Resets stream position after reading.
    """
    header = stream.read(512)
    stream.seek(0)
    
    if len(header) < 8:
        return False
        
    # JPEG/JPG: FF D8 FF
    if header.startswith(b'\xff\xd8\xff'):
        return True
    # PNG: 89 50 4E 47 0D 0A 1A 0A
    if header.startswith(b'\x89PNG\r\n\x1a\n'):
        return True
    return False

def preprocess_image(img_path):
    img = load_img(img_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route("/", methods=["GET"])
def index():
    return "Hello, World!"

@app.route("/predict", methods=["POST"])
def predict():
    # 1. Check if model is loaded
    if model is None:
        return jsonify({
            "error": "Model not loaded",
            "message": "The model is currently unavailable. Please ensure it has been trained and saved correctly."
        }), 503

    # 2. Check if file is in request
    if "file" not in request.files:
        return jsonify({"error": "No file part", "message": "No file was included in the request."}), 400
    
    file = request.files["file"]

    # 3. Check if user selected a file
    if file.filename == "":
        return jsonify({"error": "No selected file", "message": "No file was selected for upload."}), 400

    # 4. Check file extension
    if not allowed_file(file.filename):
        return jsonify({
            "error": "Invalid file type", 
            "message": f"Allowed extensions are: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    # 5. Check magic bytes (Content Validation)
    if not validate_image_header(file.stream):
        return jsonify({
            "error": "Invalid file content", 
            "message": "The file does not appear to be a valid image."
        }), 400

    try:
        # 6. Save securely
        filename = secure_filename(file.filename)
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", filename)
        file.save(file_path)
        logger.info(f"File saved to {file_path}")

        # 7. Predict
        try:
            img_array = preprocess_image(file_path)
            prediction = model.predict(img_array)
            predicted_idx = int(np.argmax(prediction))
            confidence = float(np.max(prediction))

            result = {
                "predicted_label": unique_labels[predicted_idx] if unique_labels else f"Class {predicted_idx}",
                "confidence": round(confidence * 100, 2)
            }
            logger.info(f"Prediction success: {result}")
            return jsonify(result)
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify({"error": "Prediction failed", "message": str(e)}), 500
        
        finally:
            # 8. Cleanup
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up file {file_path}")

    except Exception as e:
        logger.error(f"System error: {e}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, port=5001)
