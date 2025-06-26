import os
from google.cloud import vision
from dotenv import load_dotenv

load_dotenv()

vision_client = vision.ImageAnnotatorClient()

def extract_labels(image_path):
    with open(image_path, "rb") as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    # 정확도 높은 키워드만 추출
    response = vision_client.label_detection(image=image)
    labels = [
        label.description
        for label in response.label_annotations
        if label.score > 0.80  # 정확도 80% 이상
    ][:15]  # 최대 15개까지

    return labels
