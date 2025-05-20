import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import os
import argparse # For command-line arguments

# --- Configuration ---
# The API key will be fetched from the environment variable HF_API_KEY
# The model URL is for object detection
MODEL_API_URL = "https://api-inference.huggingface.co/models/facebook/detr-resnet-50"

# --- Helper Functions ---

def get_api_key():
    """Retrieves the Hugging Face API key from the environment variable."""
    api_key = os.getenv("HF_API_KEY")
    if not api_key:
        print("Error: HF_API_KEY environment variable not found or is empty.")
        print("Please set it before running the script.")
        print("Example (PowerShell): $env:HF_API_KEY = 'hf_YourActualKey'")
        print("Example (Bash/Zsh): export HF_API_KEY='hf_YourActualKey'")
        return None
    return api_key

def query_huggingface_api(api_key, image_base64_data):
    """
    Sends a request to the Hugging Face Inference API for object detection.
    Args:
        api_key (str): The Hugging Face API key.
        image_base64_data (str): Base64 encoded string of the image.
    Returns:
        dict: The JSON response from the API, or a dict with an 'error' key if failed.
    """
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {"inputs": image_base64_data}

    try:
        response = requests.post(MODEL_API_URL, headers=headers, json=payload, timeout=30) # Added timeout
        response.raise_for_status() # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err} - {response.text}"
        print(error_message)
        try:
            return response.json() # Sometimes error details are in JSON
        except requests.exceptions.JSONDecodeError:
            return {"error": error_message, "details": response.text}
    except requests.exceptions.RequestException as req_err:
        error_message = f"Request exception occurred: {req_err}"
        print(error_message)
        return {"error": error_message}
    except Exception as e:
        error_message = f"An unexpected error occurred during API query: {e}"
        print(error_message)
        return {"error": error_message}


def detect_objects_in_image(api_key, image_path):
    """
    Encodes an image, sends it for object detection, and returns the detections.
    Args:
        api_key (str): The Hugging Face API key.
        image_path (str): Path to the image file.
    Returns:
        list: A list of detection dictionaries, or None if an error occurred.
    """
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None
    except IOError:
        print(f"Error: Could not read image file at {image_path}")
        return None

    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    print("Sending image to Hugging Face API for detection...")
    response_json = query_huggingface_api(api_key, image_base64)

    if not response_json: # Handles case where query_huggingface_api returned None or empty
        print("Error: No response from API.")
        return None

    if 'error' in response_json:
        # Error details should have already been printed by query_huggingface_api
        # but we can add a summary here.
        print(f"API returned an error for image {image_path}: {response_json.get('error')}")
        if 'details' in response_json:
             print(f"Details: {response_json.get('details')}")
        return None
    
    if not isinstance(response_json, list):
        print(f"Error: Unexpected API response format. Expected a list of detections, got: {type(response_json)}")
        print(f"Response content: {response_json}")
        return None
        
    return response_json


def draw_bounding_boxes(image_path, detections, output_path="output_with_boxes.jpg"):
    """
    Draws bounding boxes and labels on an image based on detection results.
    Args:
        image_path (str): Path to the original image.
        detections (list): List of detection dictionaries from the API.
        output_path (str): Path to save the image with drawn boxes.
    """
    try:
        image = Image.open(image_path).convert("RGB") # Convert to RGB to handle various formats
        draw = ImageDraw.Draw(image)
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path} for drawing.")
        return
    except IOError:
        print(f"Error: Could not open or read image file at {image_path} for drawing.")
        return

    try:
        # Try to use a common system font, adjust size as necessary
        font = ImageFont.truetype("arial.ttf", 15)
    except IOError:
        print("Arial font not found, using default PIL font.")
        font = ImageFont.load_default()

    if not detections:
        print("No detections to draw.")
        image.save(output_path) # Save the original image if no detections
        print(f"Original image saved to {output_path} as no detections were provided.")
        return

    for detection in detections:
        if not all(k in detection for k in ['box', 'label', 'score']):
            print(f"Warning: Skipping invalid detection object: {detection}")
            continue

        box = detection['box']
        label = detection['label']
        score = detection['score']
        
        if not all(k in box for k in ['xmin', 'ymin', 'xmax', 'ymax']):
            print(f"Warning: Skipping detection with invalid box: {box}")
            continue

        xmin, ymin, xmax, ymax = box['xmin'], box['ymin'], box['xmax'], box['ymax']
        
        draw.rectangle([(xmin, ymin), (xmax, ymax)], outline="red", width=3)
        
        text = f"{label} ({score:.2f})"
        
        # Get text bounding box to draw a background for better visibility
        try:
            # For Pillow 10.0.0+ textbbox is preferred, for older textsize
            if hasattr(draw, 'textbbox'):
                text_bbox = draw.textbbox((0,0), text, font=font) # (0,0) as origin for size calculation
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
            else: # Fallback for older Pillow versions
                text_width, text_height = draw.textsize(text, font=font)
        except Exception as e:
            print(f"Warning: Could not determine text size for '{text}'. Error: {e}")
            text_width, text_height = 50, 10 # Default fallback sizes

        text_x = xmin
        text_y = ymin - text_height - 2 # Position text slightly above the box

        # Ensure text background doesn't go off-image (top)
        if text_y < 0:
            text_y = ymin + 2 # Place text inside the box if no space above

        draw.rectangle([(text_x, text_y), (text_x + text_width + 4, text_y + text_height)], fill="red")
        draw.text((text_x + 2, text_y), text, fill="white", font=font)

    try:
        image.save(output_path)
        print(f"Image with bounding boxes saved as '{output_path}'")
    except IOError:
        print(f"Error: Could not save output image to '{output_path}'.")
    except SystemError:
        print(f"Error: System error while trying to save image to '{output_path}'. Image might be too large or format issue.")


# --- Main Execution ---

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Detect objects in an image using Hugging Face API and draw bounding boxes."
    )
    parser.add_argument(
        "image_path", 
        help="Path to the input image file."
    )
    parser.add_argument(
        "-o", "--output_path", 
        default="output_with_boxes.jpg", 
        help="Path to save the output image with boxes (default: output_with_boxes.jpg)."
    )
    
    args = parser.parse_args()

    # --- Get API Key ---
    hf_api_key = get_api_key()
    if not hf_api_key:
        exit(1) # Exit if API key is not available

    # --- Process Image ---
    if not os.path.exists(args.image_path):
        print(f"Error: Input image file '{args.image_path}' not found.")
        exit(1)
    
    print(f"Processing image: {args.image_path}")
    detection_results = detect_objects_in_image(hf_api_key, args.image_path)

    if detection_results:
        if len(detection_results) == 0:
            print("No objects were detected in the image by the API.")
            # Optionally, save the original image to the output path if you want
            # from shutil import copyfile
            # copyfile(args.image_path, args.output_path)
            # print(f"Original image copied to {args.output_path} as no objects were detected.")
        else:
            print(f"Successfully detected {len(detection_results)} object(s). Drawing boxes...")
            draw_bounding_boxes(args.image_path, detection_results, args.output_path)
    else:
        # Error messages should have been printed by detect_objects_in_image or query_huggingface_api
        print("Object detection process failed or returned no results.")