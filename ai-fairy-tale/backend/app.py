from flask import Flask, request, jsonify, send_from_directory, send_file, render_template_string
from flask_cors import CORS
from google.cloud import vision
from dotenv import load_dotenv
from gpt_api import generate_fairytale
from deep_translator import GoogleTranslator
from openai import OpenAI
import os
import uuid
import sqlite3
from datetime import datetime
import qrcode
from io import BytesIO

# credentials.json의 절대경로 설정
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "credentials.json")

# .env 파일에서 환경변수 로드
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# OpenAI 클라이언트 객체
client = OpenAI(api_key=openai_api_key)

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 업로드 폴더 설정
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Vision API 클라이언트
vision_client = vision.ImageAnnotatorClient.from_service_account_json(CREDENTIALS_PATH)

# 버전별로 DB 경로 지정
def get_db_path(version):
    if version == "child":
        return "fairytales_child.db"
    elif version == "teen":
        return "fairytales_teen.db"
    else:
        raise ValueError("Invalid version")

# DB 초기화
def init_db():
    for version in ["child", "teen"]:
        path = get_db_path(version)
        with sqlite3.connect(path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS fairytales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version TEXT,
                    keywords TEXT,
                    instruction TEXT,
                    story TEXT,
                    image_uri TEXT,
                    timestamp TEXT,
                    is_bookmarked INTEGER DEFAULT 0
                )
            """)
init_db()

# ✅ 복합 라벨 추출
def extract_labels(image_path):
    with open(image_path, "rb") as f:
        content = f.read()
    image = vision.Image(content=content)
    response = vision_client.annotate_image({
        "image": image,
        "features": [
            {"type_": vision.Feature.Type.LABEL_DETECTION, "max_results": 10},
            {"type_": vision.Feature.Type.OBJECT_LOCALIZATION},
            {"type_": vision.Feature.Type.WEB_DETECTION},
        ]
    })

    labels = []
    if response.label_annotations:
        labels += [label.description for label in response.label_annotations]
    if response.localized_object_annotations:
        labels += [obj.name for obj in response.localized_object_annotations]
    if response.web_detection and response.web_detection.web_entities:
        labels += [entity.description for entity in response.web_detection.web_entities if entity.description]

    cleaned = [label.lower() for label in labels if len(label.split()) <= 2]
    return list(dict.fromkeys(cleaned))[:5]  # 중복 제거 후 상위 5개


# ✅ 동화 프롬프트 생성
def generate_prompt(keywords, instruction, version):
    base = f"{', '.join(keywords)}\n"
    tone = "아이들을 위한 따뜻하고 상상력 넘치는 이야기로 만들어줘." if version == "baby" else "초등학생을 위한 창의적이고 짧은 이야기로 만들어줘."
    if instruction:
        base += f"\n사용자 요청: {instruction}"
    return f"{base}\n{tone}"


# ✅ GPT 호출
def generate_story(prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 창의적인 이야기 작가입니다."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=500,
            temperature=0.8,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("GPT 호출 에러:", e)
        return "GPT 호출 실패."


# ✅ 업로드 엔드포인트
@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files or "instruction" not in request.form:
        return jsonify({"error": "입력이 부족합니다."}), 400

    file = request.files["image"]
    instruction = request.form["instruction"]
    version = request.form.get("version", "child")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_FOLDER, f"{file_id}.jpg")
    file.save(file_path)
    image_url = f"{request.host_url}uploads/{file_id}.jpg"

    labels = extract_labels(file_path)
    story = generate_fairytale(", ".join(labels), instruction, version)

    # 키워드 추출
    keywords = extract_labels(file_path)

    # 프롬프트 생성 및 GPT 호출
    prompt = generate_prompt(keywords, instruction, version)
    story_ko = generate_story(prompt)

    # 번역
    try:
        story_en = GoogleTranslator(source='ko', target='en').translate(story_ko)
    except Exception as e:
        print("번역 실패:", e)
        story_en = "Translation failed."

    db_path = get_db_path(version)
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            INSERT INTO fairytales (version, keywords, instruction, story, image_uri, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (version, ", ".join(labels), instruction, story, image_url, datetime.now().isoformat()))

    return jsonify({
        "story": story_ko,
        "story_en": story_en,
        "keywords": ", ".join(labels), 
        "image_uri": image_url
    })

# 동화 목록 불러오기
@app.route("/stories", methods=["GET"])
def get_stories():
    version = request.args.get("version", "child")
    db_path = get_db_path(version)
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, version, instruction, story, keywords, image_uri, is_bookmarked FROM fairytales
            ORDER BY timestamp DESC
        """)
        rows = cursor.fetchall()

    return jsonify([
        {
            "id": row[0],
            "version": row[1],
            "instruction": row[2],
            "story": row[3],
            "keywords": row[4],
            "image_uri": row[5],
            "is_bookmarked": row[6],
        }
        for row in rows
    ])

# 동화 삭제
@app.route("/delete_story/<int:story_id>", methods=["DELETE"])
def delete_story(story_id):
    version = request.args.get("version", "child")
    db_path = get_db_path(version)
    with sqlite3.connect(db_path) as conn:
        conn.execute("DELETE FROM fairytales WHERE id = ?", (story_id,))
    return jsonify({"message": "삭제 완료"})

# 북마크 토글
@app.route("/bookmark_story/<int:story_id>", methods=["POST"])
def bookmark_story(story_id):
    version = request.args.get("version", "child")
    db_path = get_db_path(version)
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            UPDATE fairytales SET is_bookmarked = CASE is_bookmarked WHEN 0 THEN 1 ELSE 0 END
            WHERE id = ?
        """, (story_id,))
    return jsonify({"message": f"{story_id} 북마크 토글 완료"})

# 이미지 파일 제공
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# 동화 내용 업데이트
@app.route("/update_story/<int:story_id>", methods=["POST"])
def update_story(story_id):
    version = request.args.get("version", "child")
    story = request.json.get("story")
    db_path = get_db_path(version)
    with sqlite3.connect(db_path) as conn:
        conn.execute("UPDATE fairytales SET story = ? WHERE id = ?", (story, story_id))
    return jsonify({"message": "동화 내용 수정 완료"})

# QR 코드 웹페이지 (사용자용)
@app.route("/show_qr")
def show_qr():
    target_url = "https://your-fairy-tale-app-link.com"  # 이곳에 앱 실행 또는 설치 URL 넣으세요
    html = f"""
    <html>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>AI 동화 앱 QR 코드</title>
      </head>
      <body style='text-align:center; background:#fffbe6; font-family:sans-serif;'>
        <h2>📱 AI 동화 앱 실행 QR 코드</h2>
        <p>아래 QR을 스마트폰으로 스캔해서 앱을 실행하거나 설치하세요</p>
        <img src='/qr_image' width='300' />
      </body>
    </html>
    """
    return render_template_string(html)

# QR 이미지 생성
@app.route("/qr_image")
def qr_image():
    # ✅ QR 코드에 넣고 싶은 진짜 앱 실행 URL
    target_url = "exp://192.168.0.102:8081"  # 예: APK 다운로드, Firebase 앱, 웹앱 주소 등

    img = qrcode.make(target_url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


# 서버 테스트용 핑
@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong from flask!"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
