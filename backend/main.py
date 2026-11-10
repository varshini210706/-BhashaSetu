from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from io import BytesIO
import tempfile
import os

import edge_tts
import numpy as np
import av
import sherpa_onnx

from faster_whisper import WhisperModel


# ==========================================
# 1. FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="BhashaSetu API",
    description="AI-Powered Multilingual Government Service Assistant"
)


# ==========================================
# 2. WHISPER MODEL
# ==========================================

whisper_model = None


def get_whisper_model():
    global whisper_model

    if whisper_model is None:
        whisper_model = WhisperModel(
            "base",
            device="cpu",
            compute_type="int8",
            cpu_threads=4,
            num_workers=1
        )

    return whisper_model


# ==========================================
# 3. KANNADA INDICCONFORMER MODEL
# ==========================================

kannada_recognizer = None

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

KANNADA_MODEL = os.path.join(
    BASE_DIR, "asr_models", "kn", "model.int8.onnx"
)

KANNADA_TOKENS = os.path.join(
    BASE_DIR, "asr_models", "tokens.txt"
)


def get_kannada_recognizer():
    global kannada_recognizer

    if kannada_recognizer is None:

        if not os.path.exists(KANNADA_MODEL):
            raise FileNotFoundError("Kannada model not found")

        if not os.path.exists(KANNADA_TOKENS):
            raise FileNotFoundError("Tokens file not found")

        print("Loading Kannada IndicConformer model...")

        kannada_recognizer = (
            sherpa_onnx.OfflineRecognizer.from_nemo_ctc(
                model=KANNADA_MODEL,
                tokens=KANNADA_TOKENS,
                num_threads=2,
                decoding_method="greedy_search"
            )
        )

        print("Kannada model loaded successfully!")

    return kannada_recognizer


# ==========================================
# 4. KANNADA SPEECH RECOGNITION
# ==========================================

def recognize_kannada(audio_data):

    container = av.open(BytesIO(audio_data))

    if not container.streams.audio:
        container.close()
        raise ValueError("No audio stream found")

    resampler = av.AudioResampler(
        format="fltp",
        layout="mono",
        rate=16000
    )

    audio_chunks = []

    for frame in container.decode(audio=0):

        converted_frames = resampler.resample(frame)

        for converted_frame in converted_frames:
            audio_chunks.append(
                converted_frame.to_ndarray().reshape(-1)
            )

    for converted_frame in resampler.resample(None):
        audio_chunks.append(
            converted_frame.to_ndarray().reshape(-1)
        )

    container.close()

    if not audio_chunks:
        raise ValueError("Could not decode audio")

    audio = np.concatenate(audio_chunks).astype(np.float32)

    recognizer = get_kannada_recognizer()

    stream = recognizer.create_stream()

    stream.accept_waveform(16000, audio)

    recognizer.decode_stream(stream)

    return stream.result.text.strip()


# ==========================================
# 5. CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# 6. SUPPORTED LANGUAGES
# ==========================================

languages = [
    {"code": "en", "name": "English"},
    {"code": "kn", "name": "Kannada"},
    {"code": "hi", "name": "Hindi"}
]


# ==========================================
# 7. GOVERNMENT SERVICES
# ==========================================

services = [
    {
        "id": 1,
        "name": "Income Certificate",
        "keywords": [
            "income", "salary", "income certificate",
            "ಆದಾಯ", "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
            "आय", "आय प्रमाण पत्र"
        ],
        "description": "An Income Certificate is an official document that provides information about a person's or family's income.",
        "steps": [
            "Visit the Karnataka Nadakacheri portal.",
            "Find the Income Certificate service.",
            "Check eligibility and required documents.",
            "Follow the official application instructions."
        ],
        "url": "https://nadakacheri.karnataka.gov.in/"
    },
    {
        "id": 2,
        "name": "Caste Certificate",
        "keywords": [
            "caste", "community", "caste certificate",
            "ಜಾತಿ", "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
            "जाति", "जाति प्रमाण पत्र"
        ],
        "description": "A Caste Certificate is an official document that certifies a person's caste or community.",
        "steps": [
            "Visit the Karnataka Nadakacheri portal.",
            "Find the Caste Certificate service.",
            "Check eligibility and required documents.",
            "Follow the official application instructions."
        ],
        "url": "https://nadakacheri.karnataka.gov.in/"
    },
    {
        "id": 3,
        "name": "Scholarship",
        "keywords": [
            "scholarship", "student", "education",
            "ವಿದ್ಯಾರ್ಥಿವೇತನ", "ವಿದ್ಯಾರ್ಥಿ",
            "छात्रवृत्ति", "विद्यार्थी"
        ],
        "description": "Students can explore government scholarship opportunities through official scholarship portals.",
        "steps": [
            "Visit the Karnataka State Scholarship Portal.",
            "Check available scholarship schemes.",
            "Read the eligibility conditions.",
            "Follow the official application instructions."
        ],
        "url": "https://ssp.postmatric.karnataka.gov.in/"
    }
]


# ==========================================
# 8. TRANSLATIONS
# ==========================================

translations = {
    1: {
        "kn": {
            "name": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
            "description": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವು ವ್ಯಕ್ತಿಯ ಅಥವಾ ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯವನ್ನು ದೃಢೀಕರಿಸುವ ಅಧಿಕೃತ ದಾಖಲೆಯಾಗಿದೆ.",
            "steps": [
                "ಕರ್ನಾಟಕ ನಾಡಕಚೇರಿ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ.",
                "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆಯನ್ನು ಹುಡುಕಿ.",
                "ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "ಅಧಿಕೃತ ಸೂಚನೆಗಳ ಪ್ರಕಾರ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ."
            ]
        },
        "hi": {
            "name": "आय प्रमाण पत्र",
            "description": "आय प्रमाण पत्र एक आधिकारिक दस्तावेज है जो व्यक्ति या परिवार की वार्षिक आय की पुष्टि करता है।",
            "steps": [
                "कर्नाटक नाडकचेरी पोर्टल पर जाएं।",
                "आय प्रमाण पत्र सेवा खोजें।",
                "पात्रता और आवश्यक दस्तावेज जांचें।",
                "आधिकारिक निर्देशों के अनुसार आवेदन करें।"
            ]
        }
    },
    2: {
        "kn": {
            "name": "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
            "description": "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರವು ವ್ಯಕ್ತಿಯ ಜಾತಿ ಅಥವಾ ಸಮುದಾಯವನ್ನು ದೃಢೀಕರಿಸುವ ಅಧಿಕೃತ ದಾಖಲೆಯಾಗಿದೆ.",
            "steps": [
                "ಕರ್ನಾಟಕ ನಾಡಕಚೇರಿ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ.",
                "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆಯನ್ನು ಹುಡುಕಿ.",
                "ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "ಅಧಿಕೃತ ಸೂಚನೆಗಳ ಪ್ರಕಾರ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ."
            ]
        },
        "hi": {
            "name": "जाति प्रमाण पत्र",
            "description": "जाति प्रमाण पत्र एक आधिकारिक दस्तावेज है जो किसी व्यक्ति की जाति या समुदाय की पुष्टि करता है।",
            "steps": [
                "कर्नाटक नाडकचेरी पोर्टल पर जाएं।",
                "जाति प्रमाण पत्र सेवा खोजें।",
                "पात्रता और आवश्यक दस्तावेज जांचें।",
                "आधिकारिक निर्देशों के अनुसार आवेदन करें।"
            ]
        }
    },
    3: {
        "kn": {
            "name": "ವಿದ್ಯಾರ್ಥಿವೇತನ",
            "description": "ವಿದ್ಯಾರ್ಥಿಗಳು ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳು ನೀಡುವ ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಬಹುದು.",
            "steps": [
                "ಕರ್ನಾಟಕ ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ.",
                "ಲಭ್ಯವಿರುವ ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "ಅರ್ಹತಾ ಷರತ್ತುಗಳನ್ನು ಓದಿ.",
                "ಅಧಿಕೃತ ಸೂಚನೆಗಳ ಪ್ರಕಾರ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ."
            ]
        },
        "hi": {
            "name": "छात्रवृत्ति",
            "description": "विद्यार्थी सरकारी विभागों द्वारा प्रदान की जाने वाली छात्रवृत्ति योजनाओं की जानकारी प्राप्त कर सकते हैं।",
            "steps": [
                "कर्नाटक राज्य छात्रवृत्ति पोर्टल पर जाएं।",
                "उपलब्ध छात्रवृत्ति योजनाएं देखें।",
                "पात्रता की शर्तें पढ़ें।",
                "आधिकारिक निर्देशों के अनुसार आवेदन करें।"
            ]
        }
    }
}


# ==========================================
# 9. REQUEST MODELS
# ==========================================

class ChatRequest(BaseModel):
    question: str
    language: str = "en"


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


# ==========================================
# 10. HOME ENDPOINT
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Welcome to BhashaSetu API",
        "status": "Running successfully"
    }


# ==========================================
# 11. LANGUAGES ENDPOINT
# ==========================================

@app.get("/languages")
def get_languages():
    return languages


# ==========================================
# 12. SERVICES ENDPOINT
# ==========================================

@app.get("/services")
def get_services():
    return services


# ==========================================
# 13. CHAT ENDPOINT
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):

    question = request.question.lower().strip()
    language = request.language

    if language not in ["en", "kn", "hi"]:
        language = "en"

    for service in services:

        matched = any(
            keyword.lower() in question
            for keyword in service["keywords"]
        )

        if matched or service["name"].lower() in question:

            service_id = service["id"]

            if language in ["kn", "hi"]:

                translated = translations[service_id][language]

                return {
                    "success": True,
                    "service": translated["name"],
                    "answer": translated["description"],
                    "steps": translated["steps"],
                    "link": service["url"],
                    "official_link": service["url"],
                    "language": language
                }

            return {
                "success": True,
                "service": service["name"],
                "answer": service["description"],
                "steps": service["steps"],
                "link": service["url"],
                "official_link": service["url"],
                "language": "en"
            }

    fallback = {
        "en": "Sorry, I could not find matching information. Please ask about Income Certificate, Caste Certificate or Scholarship.",
        "kn": "ಕ್ಷಮಿಸಿ, ಹೊಂದಾಣಿಕೆಯ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ, ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನದ ಬಗ್ಗೆ ಕೇಳಿ.",
        "hi": "क्षमा करें, मुझे संबंधित जानकारी नहीं मिली। कृपया आय प्रमाण पत्र, जाति प्रमाण पत्र या छात्रवृत्ति के बारे में पूछें।"
    }

    return {
        "success": False,
        "service": None,
        "answer": fallback[language],
        "steps": [],
        "link": None,
        "official_link": None,
        "language": language
    }


# ==========================================
# 14. TEXT TO SPEECH
# ==========================================

@app.post("/tts")
async def text_to_speech(request: TTSRequest):

    voices = {
        "en": "en-IN-NeerjaNeural",
        "kn": "kn-IN-SapnaNeural",
        "hi": "hi-IN-SwaraNeural"
    }

    if request.language not in voices:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty"
        )

    try:
        communicate = edge_tts.Communicate(
            request.text,
            voices[request.language]
        )

        audio_data = BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])

        audio_data.seek(0)

        if audio_data.getbuffer().nbytes == 0:
            raise HTTPException(
                status_code=500,
                detail="No audio was generated"
            )

        return StreamingResponse(
            audio_data,
            media_type="audio/mpeg"
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# 15. SPEECH TO TEXT
# ==========================================

@app.post("/stt")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = "en"
):

    supported_languages = ["en", "kn", "hi"]

    if language not in supported_languages:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Audio file is missing"
        )

    temp_path = None

    try:

        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )

        # KANNADA: INDICCONFORMER

        if language == "kn":

            print("Using Kannada IndicConformer...")

            transcript = recognize_kannada(audio_data)

            print("KANNADA TRANSCRIPT:", transcript)

            return {
                "success": True,
                "transcript": transcript,
                "language": "kn"
            }

        # ENGLISH AND HINDI: WHISPER

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm"
        ) as temp_file:

            temp_file.write(audio_data)
            temp_path = temp_file.name

        model = get_whisper_model()

        segments, info = model.transcribe(
            temp_path,
            language=language,
            task="transcribe",
            beam_size=3,
            best_of=3,
            vad_filter=True,
            condition_on_previous_text=False
        )

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        ).strip()

        print("SELECTED LANGUAGE:", language)
        print("WHISPER TRANSCRIPT:", transcript)

        return {
            "success": True,
            "transcript": transcript,
            "language": language
        }

    except HTTPException:
        raise

    except Exception as e:

        print("SPEECH RECOGNITION ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)