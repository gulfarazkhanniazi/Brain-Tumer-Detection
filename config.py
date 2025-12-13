import os

# Configuration Constants
IMAGE_SIZE = 128
MODEL_PATH = "model2.h5"
LABELS_PATH = "labels.json"
DATASET_PATH = "dataset"
TRAIN_DIR = os.path.join(DATASET_PATH, "Training")
TEST_DIR = os.path.join(DATASET_PATH, "Testing")
