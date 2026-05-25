import "dotenv/config";
import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WS upgrade route
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
    if (pathname === "/api/ws-live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Keep track of WS connection to Gemini Live session
  wss.on("connection", (ws: WebSocket) => {
    let geminiSession: any = null;
    let isClosed = false;

    console.log("Client connected to Sona server-side WebSocket proxy");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "connect") {
          const { voiceName, systemInstruction } = message.config || {};
          
          const geminiApiKey = process.env.GEMINI_API_KEY;
          if (!geminiApiKey) {
            ws.send(JSON.stringify({ type: "error", message: "GEMINI_API_KEY is not configured on the server." }));
            ws.close();
            return;
          }

          // Initialize Gemini AI Client securely on the server
          const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          console.log("Connecting to Gemini Live API...");
          try {
            geminiSession = await ai.live.connect({
              model: "gemini-3.1-flash-live-preview",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName || "Zephyr" } },
                },
                candidateCount: 1,
                maxOutputTokens: 2048,
                temperature: 0.7,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                systemInstruction: systemInstruction || "You are a helpful assistant.",
                tools: [
                  {
                    functionDeclarations: [
                      {
                        name: "openApplication",
                        description: "Open specific apps like youtube, spotify, whatsapp, gmail, google_maps.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            appName: { type: "STRING", description: "The application to open, e.g. youtube, spotify, whatsapp, gmail, google_maps" }
                          },
                          required: ["appName"]
                        }
                      },
                      {
                        name: "openWebsite",
                        description: "Open any custom URL or website.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            url: { type: "STRING", description: "Full URL e.g. https://google.com" }
                          },
                          required: ["url"]
                        }
                      },
                      {
                        name: "searchWeb",
                        description: "Searches Google Web for a given search query.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            query: { type: "STRING", description: "The search query text" }
                          },
                          required: ["query"]
                        }
                      },
                      {
                        name: "updateVibe",
                        description: "Updates Sona's emotional state / vibe.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            vibe: { type: "STRING", description: "The new vibe, can be happy, sassy, flirty, angry, default" }
                          },
                          required: ["vibe"]
                        }
                      },
                      {
                        name: "saveMemory",
                        description: "Saves a personal fact about Boss (Raj) into Sona's memories.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            content: { type: "STRING", description: "Fact to remember about Raj" }
                          },
                          required: ["content"]
                        }
                      },
                      {
                        name: "searchMemories",
                        description: "Searches Sona's saved memories for facts about Raj.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            query: { type: "STRING", description: "Fact or keyword to find" }
                          },
                          required: ["query"]
                        }
                      },
                      {
                        name: "setMuteState",
                        description: "Mutes or unmutes Sona's output voice.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            muted: { type: "BOOLEAN", description: "true to mute, false to unmute" }
                          },
                          required: ["muted"]
                        }
                      },
                      {
                        name: "toggleDeviceFeature",
                        description: "Verbally toggle device services: flashlight (torch), wifi, or bluetooth.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            feature: { type: "STRING", description: "The feature: 'flashlight', 'wifi', or 'bluetooth'" },
                            state: { type: "BOOLEAN", description: "true to turn ON, false to turn OFF" }
                          },
                          required: ["feature", "state"]
                        }
                      },
                      {
                        name: "adjustDeviceSetting",
                        description: "Adjust volume multiplier or simulated brightness percentage.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            setting: { type: "STRING", description: "The setting: 'volume' or 'brightness'" },
                            value: { type: "INTEGER", description: "The target numerical value from 0 to 100" }
                          },
                          required: ["setting", "value"]
                        }
                      },
                      {
                        name: "setReminderAndAlert",
                        description: "Set a reminder alert with sound for a specific task. E.g. 'drink water in 1 minute'.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            title: { type: "STRING", description: "Reminder memo title (short)" },
                            minutes: { type: "INTEGER", description: "Number of minutes from now to sound the alarm" }
                          },
                          required: ["title", "minutes"]
                        }
                      },
                      {
                        name: "startPhoneCallSim",
                        description: "Initiates a hands-free simulated live cellular phone call override.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            name: { type: "STRING", description: "Sender or receiver's name to dial, e.g. Papa, Simran, Boss, etc." }
                          },
                          required: ["name"]
                        }
                      },
                      {
                        name: "sendWhatsAppMessageSim",
                        description: "Simulates hands-free WhatsApp message dispatching or triggers the real wa.me link directly.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            phoneNumber: { type: "STRING", description: "A phone number or name to message" },
                            message: { type: "STRING", description: "The message body" }
                          },
                          required: ["phoneNumber", "message"]
                        }
                      },
                      {
                        name: "searchYouTubeOrSpotifySim",
                        description: "Searches and plays a specific song, video or artist in the user's Spotify or YouTube dashboard.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            query: { type: "STRING", description: "Song, artist, or query to play" },
                            service: { type: "STRING", description: "Platform: 'youtube' or 'spotify' (default: youtube)" }
                          },
                          required: ["query", "service"]
                        }
                      },
                      {
                        name: "fetchCurrentWeather",
                        description: "Fetches live weather reports.",
                        parameters: {
                          type: "OBJECT",
                          properties: {
                            city: { type: "STRING", description: "Optional city, otherwise defaults to local context" }
                          }
                        }
                      }
                    ]
                  }
                ]
              } as any,
              callbacks: {
                onopen: () => {
                  console.log("Gemini Live API connection established.");
                  if (!isClosed) {
                    ws.send(JSON.stringify({ type: "open" }));
                  }
                },
                onmessage: (msg) => {
                  if (!isClosed) {
                    ws.send(JSON.stringify({ type: "message", payload: msg }));
                  }
                },
                onerror: (err) => {
                  console.error("Gemini Live error:", err);
                  if (!isClosed) {
                    ws.send(JSON.stringify({ type: "error", message: err.message || String(err) }));
                  }
                },
                onclose: () => {
                  console.log("Gemini Live connection closed.");
                  if (!isClosed) {
                    ws.send(JSON.stringify({ type: "close" }));
                  }
                }
              }
            });
          } catch (connErr: any) {
            console.error("Failed to connect to Gemini Live:", connErr);
            ws.send(JSON.stringify({ type: "error", message: `Failed to connect to Gemini: ${connErr.message || connErr}` }));
            ws.close();
          }
        } else if (geminiSession) {
          // Forward inputs to active Gemini Session
          if (message.type === "audio") {
            geminiSession.sendRealtimeInput({
              audio: { data: message.data, mimeType: "audio/pcm;rate=16000" }
            });
          } else if (message.type === "text") {
            geminiSession.sendRealtimeInput({
              text: message.text
            });
          } else if (message.type === "toolResponse") {
            geminiSession.sendToolResponse({
              functionResponses: message.functionResponses
            });
          }
        }
      } catch (err: any) {
        console.error("Error processing websocket message:", err);
      }
    });

    ws.on("close", () => {
      isClosed = true;
      console.log("Client disconnected from server WebSocket proxy.");
      if (geminiSession) {
        try {
          geminiSession.close();
        } catch (e) {
          // Ignore
        }
        geminiSession = null;
      }
    });

    ws.on("error", (err) => {
      console.error("Client WS error:", err);
    });
  });

  // API Health status
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", port: PORT });
  });

  // Explicitly serve service worker and web manifest directly without any redirects
  app.get("/sw.js", (req, res) => {
    const filePath = process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "sw.js")
      : path.join(process.cwd(), "public", "sw.js");
    res.setHeader("Content-Type", "application/javascript");
    res.sendFile(filePath);
  });

  app.get("/manifest.json", (req, res) => {
    const filePath = process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "manifest.json")
      : path.join(process.cwd(), "public", "manifest.json");
    res.setHeader("Content-Type", "application/json");
    res.sendFile(filePath);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    // In development mode, use Vite's dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve pre-built static assets from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
