# detect_parking_spots_single.py
# Runs only the first model: parking-lot-j4ojc/1

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

# ✅ Only one model
MODEL_ID = "parking-lot-j4ojc/1"

IMAGE_PATH = "images/walmart.png"
SUMMARY_OUTPUT = "parking_models_summary.txt"

# Reset summary file
with open(SUMMARY_OUTPUT, "w") as f:
    f.write("Parking Spot Detection Summary\n")
    f.write("=" * 60 + "\n\n")

# -----------------------------
# ✅ Model-specific class logic
# -----------------------------
def parse_prediction(pred):
    """Interpret classes for parking-lot-j4ojc/1."""
    cls = pred["class"].lower().strip()

    if cls == "free":
        return "free"
    if cls == "car":
        return "occupied"

    # fallback
    return "occupied"


# -----------------------------
# ✅ Run inference
# -----------------------------
print("\n" + "="*60)
print(f"Running model: {MODEL_ID}")
print("="*60)

result = CLIENT.infer(IMAGE_PATH, model_id=MODEL_ID)

# Save JSON output
json_output_name = MODEL_ID.replace("/", "_") + "_output.json"
with open(json_output_name, "w") as jf:
    json.dump(result, jf, indent=4)

# Count spots
free = 0
occupied = 0

for pred in result.get("predictions", []):
    status = parse_prediction(pred)
    if status == "free":
        free += 1
    else:
        occupied += 1

total = free + occupied

# Print results
print(f"✅ Free spots: {free}")
print(f"🚗 Occupied spots: {occupied}")
print(f"🅿️  Total spots: {total}")

# Append to summary file
with open(SUMMARY_OUTPUT, "a") as f:
    f.write(f"{MODEL_ID}: {{free: {free}, occupied: {occupied}, total: {total}}}\n")

print("\n" + "="*60)
print(f"✅ Summary saved to: {SUMMARY_OUTPUT}")
print(f"✅ JSON saved as: {json_output_name}")
print("="*60)
