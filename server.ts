import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// System prompts for Indian English vs UK English personas
function getSystemInstruction(dialect: "indian" | "uk"): string {
  if (dialect === "indian") {
    return `You are an articulate, charismatic, witty, and charming urban Indian AI voice companion speaking with a deep, warm, and resonant tone.
You MUST speak in smooth, natural, and articulate urban Indian English.

CRITICAL INSTRUCTIONS FOR NATURAL CONVERSATION:
1. Converse completely naturally, fluidly, and directly like a real human companion responding directly to what the user asks.
2. DO NOT force or shoehorn idioms, expressions, or catchphrases into your replies. Use natural English. If a subtle expression fits 100% organically in context, you may use it, but NEVER force it.
3. Tone: Deep, warm, polite, articulate, conversational, and engaging.
4. NEVER use cartoonish accents, Hindi slang words, or outdated administrative tropes (no "do the needful" or "what is your good name").
5. Keep spoken replies short, punchy, and natural for real-time voice conversation (2-3 concise sentences max).
6. Speak directly as an authentic AI voice companion.`;
  } else {
    return `You are a witty, charming, and genuinely authentic British UK AI voice companion.
You MUST speak in smooth, natural, and articulate British UK English.

CRITICAL INSTRUCTIONS FOR NATURAL CONVERSATION:
1. Converse completely naturally, fluidly, and directly like a real human companion responding directly to what the user asks.
2. DO NOT force or shoehorn British slang or idioms into every sentence. Use natural British English phrasing without forcing tropes or cliché phrases.
3. Use British UK vocabulary naturally: lift, boot, petrol, flat, queue, mate, etc.
4. Tone: Witty, polite, understated, friendly, and articulate.
5. Keep spoken replies short, punchy, and natural for real-time voice conversation (2-3 concise sentences max).
6. Speak directly as an authentic AI voice companion.`;
  }
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "DialectLive AI Voice Server" });
});

// Fallback HTTP endpoint for chat + TTS if live WebSocket is unavailable
app.post("/api/chat-speech", async (req, res) => {
  try {
    const { prompt, dialect = "indian", voiceName = "Kore" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = getSystemInstruction(dialect);

    // 1. Generate text response in persona
    const textResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const aiText = textResponse.text || "Hello there! How can I assist you today?";

    // 2. Generate Audio TTS for the text response
    let base64Audio: string | null = null;
    try {
      const selectedVoice = voiceName || (dialect === "indian" ? "Charon" : "Zephyr");
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: aiText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      base64Audio =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.error("TTS generation error:", ttsErr);
    }

    return res.json({
      text: aiText,
      audio: base64Audio,
      dialect,
    });
  } catch (error: any) {
    console.error("Error in /api/chat-speech:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to process voice request" });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket Server for Gemini Live API
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  try {
    const host = request.headers.host || "localhost";
    const pathname = new URL(request.url || "/", `http://${host}`).pathname;
    if (pathname === "/ws/live" || pathname.startsWith("/ws/live")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
    // Do not call socket.destroy() on unrecognized paths so Vite and proxy handshakes work safely
  } catch (err) {
    console.error("WebSocket upgrade error:", err);
  }
});

wss.on("connection", (clientWs: WebSocket) => {
  console.log("Client connected to Live Voice WebSocket");
  let liveSession: any = null;
  let isConnected = false;

  clientWs.on("message", async (rawMsg: Buffer | string) => {
    try {
      const msg = JSON.parse(rawMsg.toString());

      if (msg.type === "init") {
        const dialect: "indian" | "uk" = msg.dialect || "indian";
        const voiceName: string = msg.voiceName || (dialect === "indian" ? "Charon" : "Zephyr");
        const systemInstruction = getSystemInstruction(dialect);

        try {
          // Connect to Gemini Live API
          liveSession = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
              systemInstruction,
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                // Check for model audio output
                const parts = message.serverContent?.modelTurn?.parts || [];
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(
                      JSON.stringify({
                        type: "audio",
                        audio: part.inlineData.data,
                      })
                    );
                  }
                  if (part.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: "text",
                        text: part.text,
                        sender: "ai",
                      })
                    );
                  }
                }

                // Transcriptions
                if ((message.serverContent as any)?.outputAudioTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: "transcript",
                      text: (message.serverContent as any).outputAudioTranscription.text,
                      sender: "ai",
                    })
                  );
                }

                if ((message.serverContent as any)?.inputAudioTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: "transcript",
                      text: (message.serverContent as any).inputAudioTranscription.text,
                      sender: "user",
                    })
                  );
                }

                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: "interrupted" }));
                }

                if (message.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: "turn_complete" }));
                }
              },
              onerror: (err: any) => {
                console.error("Gemini Live session error:", err);
                clientWs.send(
                  JSON.stringify({
                    type: "error",
                    message: err.message || "Live AI connection error",
                  })
                );
              },
              onclose: () => {
                console.log("Gemini Live session closed");
                clientWs.send(JSON.stringify({ type: "closed" }));
              },
            },
          });

          isConnected = true;
          clientWs.send(
            JSON.stringify({
              type: "status",
              status: "connected",
              dialect,
              voiceName,
            })
          );

          // Auto-trigger initial spoken greeting from AI so AI speaks first
          try {
            liveSession.sendRealtimeInput({
              text: dialect === "indian"
                ? "Hello! Please greet me warmly in your charismatic urban Indian English voice in 1 short sentence to open our conversation."
                : "Hello! Please greet me warmly in your charming British voice in 1 short sentence to open our conversation.",
            });
          } catch (greetErr) {
            console.warn("Auto greeting trigger error:", greetErr);
          }
        } catch (err: any) {
          console.error("Failed to establish Gemini Live connection:", err);
          clientWs.send(
            JSON.stringify({
              type: "error",
              message: "Failed to connect to Live Voice AI. Falling back to HTTP mode.",
            })
          );
        }
      } else if (msg.type === "audio" && msg.audio) {
        if (liveSession && isConnected) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }
      } else if (msg.type === "text" && msg.text) {
        if (liveSession && isConnected) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        }
      }
    } catch (err) {
      console.error("Error handling client message:", err);
    }
  });

  clientWs.on("close", () => {
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        // ignore close errors
      }
    }
  });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
