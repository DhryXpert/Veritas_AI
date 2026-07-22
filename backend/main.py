import os
from dotenv import load_dotenv

load_dotenv()
import joblib
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from utils import clean_text

app = FastAPI(title="Fake News Detector API", version="1.0.0")

# Setup CORS middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.strip().rstrip("/"))

# Allow wildcard origins if explicitly specified or in non-prod fallback
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and vectorizer at startup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "fake_news_model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")

try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("SUCCESS: Model and TF-IDF vectorizer loaded successfully!")
except Exception as e:
    print(f"ERROR: Error loading models: {e}")
    # In some production environments, we might want to delay loading or handle it gracefully
    model = None
    vectorizer = None


class PredictRequest(BaseModel):
    text: str = Field(..., description="The article content to analyze")


class PredictResponse(BaseModel):
    label: str
    confidence: float
    cleaned_length: int


@app.get("/status")
def health_check():
    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model or vectorizer not loaded",
        )
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is currently unavailable. Please check backend health.",
        )

    # Validate input: reject empty or whitespace-only text
    raw_text = request.text
    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input text cannot be empty or contain only whitespace.",
        )

    # Cap input length to 20,000 characters to prevent abuse
    if len(raw_text) > 20000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input text exceeds the limit of 20,000 characters (length: {len(raw_text)}).",
        )

    # Preprocess text
    cleaned = clean_text(raw_text)

    # If text is too short after cleaning, reject or handle
    if len(cleaned) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input text has no meaningful alphanumeric content after cleaning.",
        )

    # Transform text using loaded TF-IDF vectorizer
    tfidf_vector = vectorizer.transform([cleaned])

    # Predict probability and class label
    prediction = int(model.predict(tfidf_vector)[0])
    probabilities = model.predict_proba(tfidf_vector)[0]

    # Map prediction: 1 = Real, 0 = Fake
    if prediction == 1:
        label_str = "REAL"
        confidence_val = float(probabilities[1] * 100)
    else:
        label_str = "FAKE"
        confidence_val = float(probabilities[0] * 100)

    return PredictResponse(
        label=label_str,
        confidence=round(confidence_val, 2),
        cleaned_length=len(cleaned),
    )
