# DialectLive AI Voice

DialectLive is a natural-tones Voice Studio demonstrating low-latency, bidirectional audio-to-audio conversations using the **Gemini Live API**.

## Tech Stack
*   **Frontend**: React, Vite, TailwindCSS
*   **Backend**: Node.js, Express, WebSockets
*   **AI**: Google GenAI SDK (`gemini-3.1-flash-live-preview`)

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your Gemini API Key:
   ```bash
   GEMINI_API_KEY="your-api-key-here"
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deploying on Render (Web Service)

This project can be deployed easily on Render's Free Tier. 

1. Connect this GitHub repository to Render.
2. Set the following configuration:
   *   **Runtime**: `Node`
   *   **Build Command**: `npm install && npm run build`
   *   **Start Command**: `npm run start`
3. Add the following **Environment Variable**:
   *   `GEMINI_API_KEY`: Your Google AI Studio API key.

Render supports WebSockets natively on Web Services, so the Live API will function correctly over the `wss://` protocol.
