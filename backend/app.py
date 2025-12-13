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

# Check if model exists
if not os.path.exists(MODEL_PATH):
    print(f"Error: Model not found at {MODEL_PATH}")
    print("Please run train_and_test.py to train the model first.")
    # We won't exit here to allow the app to at least start (maybe for health checks), 
    # but we will handle the missing model in the prediction route if needed.
    # Actually, for this simple app, it's probably better to load it if it exists, or handle gracefully.
    model = None
else:
    print("Loading model...", flush=True)
    model = load_model(MODEL_PATH)
    print("Model loaded.", flush=True)

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

    # 4. Check file type validation
    if not allowed_file(file.filename):
        return jsonify({
            "error": "Invalid file type", 
            "message": f"Allowed extensions are: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        # 5. Save securely
        filename = secure_filename(file.filename)
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", filename)
        file.save(file_path)

        # 6. Predict
        try:
            img_array = preprocess_image(file_path)
            prediction = model.predict(img_array)
            predicted_idx = int(np.argmax(prediction))
            confidence = float(np.max(prediction))

            result = {
                "predicted_label": unique_labels[predicted_idx] if unique_labels else f"Class {predicted_idx}",
                "confidence": round(confidence * 100, 2)
            }
            return jsonify(result)
        
        except Exception as e:
            logging.error(f"Prediction error: {e}")
            return jsonify({"error": "Prediction failed", "message": str(e)}), 500
        
        finally:
            # 7. Cleanup
            if os.path.exists(file_path):
                os.remove(file_path)

    except Exception as e:
        logging.error(f"System error: {e}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, port=5001)
