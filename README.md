# 📰 Veritas AI — Fake News Sentinel Web App

[![Live Demo](https://img.shields.io/badge/Demo-Live_on_Vercel-teal?style=for-the-badge)](https://veritas-ai-sentinel.vercel.app)
*Live Frontend URL: https://veritas-ai-sentinel.vercel.app*  
*Live Backend API URL: https://veritas-ai-api.onrender.com*

A full-stack, stateless machine learning web application that classifies news articles as **REAL** or **FAKE** in real-time. Built to deploy a pre-trained scikit-learn NLP pipeline for professional portfolio representation.

---

## 🏗️ Architecture

```
                  +----------------------------------------------+
                  |                  FRONTEND                    |
                  |           React + Vite + Tailwind            |
                  +----------------------+-----------------------+
                                         |
                                         |  POST /predict (JSON)
                                         v
                  +----------------------------------------------+
                  |                  BACKEND                     |
                  |             FastAPI (Python 3.12)            |
                  +----------------------+-----------------------+
                                         |
                                         |  Inference Pipeline
                                         v
                  +----------------------------------------------+
                  |       1. Text Cleaning & Normalization       |
                  |       2. TF-IDF Vectorizer (50k vocabulary)  |
                  |       3. Logistic Regression Classifier      |
                  +----------------------------------------------+
```

---

## 📊 Model Performance Summary

The model is trained on the benchmark **ISOT Fake News Dataset** (containing **44,898 articles** shuffled and stratify-split 80/20 into train/test sets). Feature extraction uses a sublinear TF-IDF Vectorizer with a unigram and bigram range (`ngram_range=(1,2)`) capped at the top 50,000 features.

| Model | Accuracy | F1-Score | Precision | Recall | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Production)** | **99.39%** | **99.36%** | **99.23%** | **99.49%** | **0.9996** |
| Random Forest | 99.57% | 99.54% | 99.58% | 99.51% | 0.9997 |

*Note: While Random Forest has a slightly higher accuracy (99.57%), Logistic Regression (99.39%) was chosen for production deployment due to its significantly smaller file size (~400 KB vs ~400 MB) and sub-millisecond inference speeds.*

---

## ⚙️ Local Development Setup

### Prerequisite
Ensure you have **Node.js (v18+)** and **Python (v3.10+)** installed.

### 1. Backend Setup (FastAPI)

Navigate to the backend directory, create a virtual environment, and install dependencies:

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install requirements (pins scikit-learn to 1.6.1 to match model training)
pip install -r requirements.txt

# Start the uvicorn development server
python -m uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite)

Open a new terminal, navigate to the frontend directory, install npm packages, and run the Vite dev server:

```bash
# Navigate to frontend
cd frontend

# Install package dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will run at `http://localhost:5173`. Make sure the `frontend/.env` file exists and has the correct API path:
```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Deployed Environments

### Backend Deployment (Render or Railway)
- **Runtime**: Python Web Service
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment variables**:
  - `FRONTEND_URL`: `https://veritas-ai-sentinel.vercel.app` (for CORS permissions)

### Frontend Deployment (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment variables**:
  - `VITE_API_URL`: `https://veritas-ai-api.onrender.com` (your live backend endpoint)