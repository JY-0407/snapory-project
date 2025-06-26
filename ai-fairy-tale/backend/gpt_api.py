import os
from openai import OpenAI
from dotenv import load_dotenv
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_fairytale(keywords: str, user_instruction: str, version: str = "child") -> str:
    base_prompt = f"다음 키워드를 참고하여 동화를 만들어줘: {keywords}.\n"

    if version == "child":
        base_prompt += (
            "이 동화는 6세에서 9세 아동이 이해할 수 있도록 작성돼야 해. "
            "단순하고 친근한 어휘를 사용하고, 동물이나 귀여운 캐릭터가 등장해도 좋아. "
            "이야기는 따뜻하고 교훈적이어야 하고, 무서운 표현은 피해야 해.\n"
        )
    elif version == "teen":
        base_prompt += (
            "동화는 중학생이 흥미를 가질 수 있도록 배경이나 줄거리를 풍부하게 설명하고, "
            "과학, 수학, 경제, 환경 등 실제 지식이나 융합 요소가 자연스럽게 스며들게 구성해줘. "
            "긴 문장도 괜찮고, 어휘 수준도 중급 이상이어도 돼.\n"
        )

    base_prompt += (
        "이야기에는 인물 간의 대화를 자연스럽게 포함시켜줘.\n"
        "줄거리는 시작 → 갈등 또는 사건 → 해결 → 따뜻한 결말 순서로 구성해줘.\n"
        "장르적 특징(예: SF, 판타지, 요리, 마법, 액션 등)이 명확하게 드러나야 해.\n"
        "영어 단어는 사용하지 말고, 순수한 한국어로 작성해줘.\n"
    )

    base_prompt += f"\n사용자의 요청: {user_instruction}\n"

    base_prompt += (
        f"이 동화에는 반드시 위 사용자의 요청이 반영되어야 해. "
        f"또한 키워드인 '{keywords}' 중 최소 3개 이상이 이야기의 인물, 장소, 사건, 배경 등에서 사용되어야 해. "
        "예를 들어 '액션 동화' 요청이 있다면, 위험한 상황, 추격전, 싸움, 구출 등 액션 요소가 반드시 포함되어야 해.\n"
        "사용자의 요청과 키워드가 이야기 흐름 속에서 자연스럽게 통합되도록 해줘.\n"
        "이야기의 마지막은 고정된 문장 없이 자연스럽고 감성적인 마무리로 끝나게 해줘. "
        "예를 들어 인물의 행동이나 변화, 깨달음으로 끝나면 좋아.\n"
        "너무 짧지 않게 풍부하고 생생하게 이야기해줘.\n"
    )

    base_prompt += f"사용자의 요청: {user_instruction}\n"
    base_prompt += "동화는 완결성 있게 마무리해줘. 존댓말 말투로 한국어로 작성해줘."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": base_prompt}],
        temperature=0.8,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()