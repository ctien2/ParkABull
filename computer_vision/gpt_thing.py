# detect_parking_spots.py
# Runs multiple Roboflow parking models, handles different label formats,
# outputs summary text + separate JSON outputs per model.

import os
import json
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

load_dotenv()

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

# -----------------------------
# ✅ ADD ALL MODELS HERE
# -----------------------------
MODEL_IDS = [
    "parking-lot-j4ojc/1",
    "parking-space-ipm1b/4",
    "parking-poang/1",
    "parking-edoqv/1",
    "parking-d1qyt/1",
    "parking-lot-9sjil/2",
]

IMAGE_PATH = "images/test_img.png"
SUMMARY_OUTPUT = "walmart_lot.txt"

# Reset summary file
with open(SUMMARY_OUTPUT, "w") as f:
    f.write("Parking Spot Detection - Model Comparison\n")
    f.write("=" * 60 + "\n\n")

# ---------------------------------------
# ✅ Model-specific class interpretation
# ---------------------------------------
def parse_prediction(model_id, pred):
    """
    Return 'free' or 'occupied' depending on model type and class names.
    """

    label = pred["class"].lower().strip()

    # MODEL: parking-lot-j4ojc/1
    if "parking-lot-j4ojc" in model_id:
        if label == "free":
            return "free"
        if label == "car":
            return "occupied"

    # MODEL: parking-space-ipm1b/4
    if "parking-space-ipm1b" in model_id:
        if label == "free":
            return "free"
        if label in ["car", "occupied"]:
            return "occupied"

    # MODEL: parking-poang/1
    if "parking-poang" in model_id:
        if label == "free":
            return "free"
        if label == "occupied":
            return "occupied"

    # MODEL: parking-edoqv/1
    if "parking-edoqv" in model_id:
        if label == "empty":
            return "free"
        if label == "occupied":
            return "occupied"

    # MODEL: parking-d1qyt/1
    if "parking-d1qyt" in model_id:
        if label == "free":
            return "free"
        if label in ["car", "occupied"]:
            return "occupied"

    # MODEL: parking-lot-9sjil/2
    if "parking-lot-9sjil" in model_id:
        if label == "empty":
            return "free"
        if label == "occupied":
            return "occupied"

    # Default fallback
    if label in ["empty", "free"]:
        return "free"
    return "occupied"


# -----------------------------
# ✅ Process each model
# -----------------------------
for model_id in MODEL_IDS:
    print("\n" + "="*60)
    print(f"Testing model: {model_id}")
    print("="*60)

    # Run inference
    result = CLIENT.infer(IMAGE_PATH, model_id=model_id)

    # Save JSON output
    file_name = "walmart_lot" + model_id.replace("/", "_") + "_output.json"
    with open(file_name, "w") as jf:
        json.dump(result, jf, indent=4)

    free = 0
    occupied = 0
    free_spots = []
    occupied_spots = []

    # -----------------------------
    # ✅ Handle all prediction formats
    # -----------------------------
    for pred in result.get("predictions", []):
        status = parse_prediction(model_id, pred)
        x, y = pred["x"], pred["y"]

        if status == "free":
            free += 1
            free_spots.append((x, y))
        else:
            occupied += 1
            occupied_spots.append((x, y))

    total = free + occupied

    # -----------------------------
    # ✅ Print summary to terminal
    # -----------------------------
    print(f"Free spots: {free}")
    print(f"Occupied spots: {occupied}")
    print(f"Total: {total}")

    # -----------------------------
    # ✅ Append summary to file
    # -----------------------------
    with open(SUMMARY_OUTPUT, "a") as f:
        f.write(f"{model_id}: {{free: {free}, occupied: {occupied}, total: {total}}}\n")

print("\n" + "="*60)
print(f"✅ Summary saved to: {SUMMARY_OUTPUT}")
print("✅ Individual JSON outputs generated for each model.")
print("="*60)
