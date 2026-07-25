# Dual-Dialect Voice AI Research Platform

A psychological research tool to study user interactions with different AI dialects (UK English vs Indian English).

## Architecture

This project is split into two parts:
1. **Frontend (`/frontend`)**: A static HTML/JS/CSS Single Page Application.
2. **Backend (`/backend`)**: A Python FastAPI server that handles STT, LLM generation, TTS, and securely stores your API keys.

**Why a backend is required:**
If you put your AI API keys directly into the frontend code (like GitHub Pages), anyone who visits the website can steal them and run up a massive bill on your account. The backend acts as a secure middleman.

## Deployment Guide (Zero Cost)

### 1. Deploy the Backend (Render)
Render offers a free tier for Python backends.
1. Create a free account at [Render.com](https://render.com).
2. Click "New" -> "Web Service".
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and configure your app.
5. In the Render dashboard for your new service, go to **Environment Variables** and add:
   - `GROQ_API_KEY`: Your key from console.groq.com
   - `GEMINI_API_KEY`: Your key from aistudio.google.com
   - `GOOGLE_SHEETS_WEBHOOK_URL`: (Optional) Your Google Apps Script webhook URL
   - `ALLOWED_ORIGINS`: `https://dev-is-dev.github.io` (your GitHub Pages URL)

### 2. Deploy the Frontend (GitHub Pages)
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the left sidebar.
3. Under "Build and deployment", set Source to **Deploy from a branch**.
4. Set the branch to `main` and the folder to `/frontend`.
5. Click Save.

### 3. Connect Them
1. Once Render finishes building your backend, copy its URL (e.g., `https://voice-ai-backend.onrender.com`).
2. Update the `CONFIG.BACKEND_URL` in `frontend/js/app.js` to match your new Render URL.
3. Commit and push the change to GitHub.

## Local Development
To run locally, you need two terminal windows.

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Copy .env.example to .env and add your keys
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
python -m http.server 5500
```
Then visit `http://localhost:5500` in your browser.
