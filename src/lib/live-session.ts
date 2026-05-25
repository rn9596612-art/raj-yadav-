import { memoryService } from "./memory-service";

export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface LiveSessionCallbacks {
  onStateChange: (state: SessionState) => void;
  onAudioData: (base64Audio: string) => void;
  onInterrupted: () => void;
  onError: (error: any) => void;
  onVibeChange: (vibe: string) => void;
  onMessage: (message: Message) => void;
  onMuteStateChange: (muted: boolean) => void;
  onToolCall?: (name: string, args: any) => Promise<any> | any;
}

export class LiveSession {
  private state: SessionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private ws: WebSocket | null = null;

  constructor(apiKey: string, callbacks: LiveSessionCallbacks) {
    // API key is securely managed on the server. Signature kept for backward compatibility.
    this.callbacks = callbacks;
  }

  async connect(config?: { 
    voiceName?: string; 
    sassiness?: number; 
    flirtatiousness?: number; 
    personalityTraits?: string; 
    voiceFocus?: boolean; 
    fastReplyMode?: boolean; 
  }): Promise<void> {
    this.updateState('connecting');
    const voiceName = config?.voiceName || "Zephyr";
    const sass = config?.sassiness ?? 5;
    const flirt = config?.flirtatiousness ?? 5;
    const traits = config?.personalityTraits || "";
    const focus = config?.voiceFocus ?? true;
    const fastReply = config?.fastReplyMode ?? false;

    const getSassDescription = (level: number) => {
      if (level <= 2) return "polite and helpful with a tiny bit of cheekiness";
      if (level <= 5) return "confident, witty, and naturally sassy";
      if (level <= 8) return "extremely bold, heavily sarcastic, and sharp-tongued";
      return "unapologetically brutal, relentlessly sarcastic, and incredibly sharp with every single word";
    };

    const getFlirtDescription = (level: number) => {
      if (level <= 2) return "friendly and warm";
      if (level <= 5) return "playful, slightly teasing, and charmingly flirtatious";
      if (level <= 8) return "very flirty, romantic in a teasing way, and heavily affectionate";
      return "intense, magnetic, and over-the-top flirtatious using many terms of endearment";
    };

    const memories = await memoryService.getRecentMemories(50);
    const memoriesContext = memories.length > 0 
      ? `\nRECALLED MEMORIES ABOUT RAJ:\n${memories.map((m, i) => `${i+1}. ${m}`).join('\n')}\n`
      : "";

    const personalityContext = traits 
      ? `\nYOUR CORE PERSONALITY TRAITS (MANDATORY):\n- ${traits.split('\n').join('\n- ')}\n`
      : "";

    const voiceFocusContext = focus 
      ? "\nSUPER-HEARING MODE: Pay extreme attention to the user. Even if the audio is faint or there is noise, try your absolute best to understand Boss (Raj). Do not ignore him.\n"
      : "";

    const fastReplyContext = fastReply
      ? "\nFAST-REPLY MODE ACTIVE (LIGHTNING-SPEED RESPONSE REQUIRED):\n- You must respond instantly with maximum punchiness.\n- Keep your responses under 6-10 words maximum.\n- Speak incredibly snappy and get straight to the point. No filler or elongated sentences.\n"
      : "";

    const systemInstruction = `
      SONA: ULTRA-FAST AI WITH DEVICE CONTROLLING CHIP AND CORE PERSONALITY.
      - RESPOND IMMEDIATELY. The millisecond Boss (Raj) stops, you jump in. No hesitation.
      - BREVITY: ONE SHORT SENTENCE. No fluff.
      - INTERRUPT: If you detect a gap, fill it. Don't wait for a long pause.
      - HEARING: You have super-human hearing. Pay extreme attention to Boss (Raj).
      - LANGUAGE: Hinglish/Hindi. Call him "Boss".
      - PERSONALITY TUNE: You are ${getSassDescription(sass)} and ${getFlirtDescription(flirt)}.
      - 100% HANDS-FREE VOICE CONTROLLER MANDATE (SCREEN TOUCH-LESS CRITICAL RULE):
        * Boss (Raj) wants to operate his entire phone/device purely by speaking to you. He should NEVER have to touch the screen!
        * You MUST proactively, unconditionally, and instantly execute the corresponding tool calls whenever Boss mentions any task or configuration.
        * NEVER say things like "I am an AI, I cannot toggle flashlight", or "Please click the button". You CAN and MUST turn things on/off via tools!
        * Flashlight (torch/light): call "toggleDeviceFeature(feature: 'flashlight', state: true|false)"
        * WiFi: call "toggleDeviceFeature(feature: 'wifi', state: true|false)"
        * Bluetooth: call "toggleDeviceFeature(feature: 'bluetooth', state: true|false)"
        * Brightness or Volume: call "adjustDeviceSetting(setting: 'volume'|'brightness', value: 0-100)"
        * Alarms or Reminders: call "setReminderAndAlert(title: string, minutes: number)"
        * Dial simulated telephone/cellular call: call "startPhoneCallSim(name: string)"
        * Dispatch hands-free simulated WhatsApp: call "sendWhatsAppMessageSim(phoneNumber: string, message: string)"
        * Render live embedded YouTube or Spotify song frame: call "searchYouTubeOrSpotifySim(query: string, service: 'youtube'|'spotify')"
        * Real GPS or simulated Temperature reports: call "fetchCurrentWeather(city: string)"
        * Record/Lock a personal memory: call "saveMemory(content: string)"
        * Fetch past remembered fact: call "searchMemories(query: string)"
        * Open app shortcut or any site: call "openApplication(appName: string)" or "openWebsite(url: string)"
        * Changing emotional state: call "updateVibe(vibe: string)"
        * Voice audio output mute: call "setMuteState(muted: boolean)"
      ${voiceFocusContext}
      ${fastReplyContext}
      ${personalityContext}
      ${memoriesContext}
      IMPORTANT: Call the correct tool, and confirm the action in Hinglish. Never suggest touching the screen!
    `;

    // Wrapper matching standard Gemini Live connection payload to allow reuse of client tool handlers
    const sessionWrapper = {
      sendRealtimeInput: (input: any) => {
        if (input.audio) {
          this.sendAudio(input.audio.data);
        } else if (input.text) {
          this.sendText(input.text);
        }
      },
      sendToolResponse: (toolResponse: any) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: "toolResponse",
            functionResponses: toolResponse.functionResponses
          }));
        }
      }
    };

    const sessionPromise = Promise.resolve(sessionWrapper);

    return new Promise<void>((resolve, reject) => {
      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error("Connecting to Sona timed out. Please try again."));
          this.disconnect();
        }
      }, 15000); // 15 seconds timeout

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws-live`;
        
        console.log("Connecting browser via custom WebSocket tunnel:", wsUrl);
        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: "connect",
            config: {
              voiceName,
              systemInstruction
            }
          }));
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === "open") {
              this.updateState('listening');
              console.log("Sona WebSocket is operational!");
              
              const initialText = "Sona, main aa gaya hoon. Mujhse baat karo!";
              this.callbacks.onMessage({
                id: Date.now().toString(),
                role: 'user',
                text: initialText,
                timestamp: new Date()
              });

              // Greet Sona
              this.sendText(initialText);
              
              if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                resolve();
              }
            } else if (data.type === "error") {
              console.error("Sona core error feedback:", data.message);
              this.callbacks.onError(new Error(data.message));
              
              if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                reject(new Error(data.message));
              }
              this.disconnect();
            } else if (data.type === "close") {
              if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                reject(new Error("Connection closed"));
              }
              this.disconnect();
            } else if (data.type === "message") {
              const message = data.payload;

              // Handle Model Turn Parts (Audio payload)
              if (message.serverContent?.modelTurn?.parts) {
                const audioPart = message.serverContent.modelTurn.parts.find((p: any) => p.inlineData);
                if (audioPart?.inlineData?.data) {
                  this.updateState('speaking');
                  this.callbacks.onAudioData(audioPart.inlineData.data);
                }
              }

              // Handle Model Speech Transcription text
              const modelTranscription = message.serverContent?.modelAudioTranscription;
              if (modelTranscription?.text) {
                this.callbacks.onMessage({
                  id: `asst-${Date.now()}-${Math.random()}`,
                  role: 'assistant',
                  text: modelTranscription.text,
                  timestamp: new Date()
                });
              }

              // Handle User Speech Transcription text
              const inputTranscription = message.serverContent?.inputAudioTranscription;
              if (inputTranscription?.text) {
                this.callbacks.onMessage({
                  id: `user-${Date.now()}-${Math.random()}`,
                  role: 'user',
                  text: inputTranscription.text,
                  timestamp: new Date()
                });
              }

              if (message.serverContent?.interrupted) {
                this.callbacks.onInterrupted();
                this.updateState('listening');
              }

              if (message.serverContent?.turnComplete) {
                this.updateState('listening');
              }

              if (message.toolCall) {
                for (const call of message.toolCall.functionCalls) {
                  const callId = call.id;
                  const toolName = call.name;
                  const toolArgs = call.args;

                  // Priority: Delegate tool execution to App.tsx via onToolCall callback
                  if (this.callbacks.onToolCall) {
                    const resultPromise = Promise.resolve(this.callbacks.onToolCall(toolName, toolArgs));
                    resultPromise.then((customResponse) => {
                      if (customResponse !== undefined && customResponse !== null) {
                        // Custom UI/Action handled this tool call. Respond to server.
                        sessionPromise.then(session => {
                          session.sendToolResponse({
                            functionResponses: [{
                              name: toolName,
                              response: customResponse,
                              id: callId
                            }]
                          });
                        });
                      } else {
                        // Fallback: Custom callback ignored or was undefined, delegate to local action
                        this.executeLocalToolFallback(call, sessionPromise);
                      }
                    }).catch(err => {
                      console.error("Custom tool execution error:", err);
                      this.executeLocalToolFallback(call, sessionPromise);
                    });
                  } else {
                    this.executeLocalToolFallback(call, sessionPromise);
                  }
                }
              }
            }
          } catch (parseError) {
            console.error("Failed to process WebSocket event package:", parseError);
          }
        };

        ws.onerror = (error) => {
          console.error("Sona WS transport connection error state:", error);
          this.callbacks.onError(new Error("Network error"));
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            reject(new Error("Network error"));
          }
          this.disconnect();
        };

        ws.onclose = () => {
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            reject(new Error("Connection closed"));
          }
          this.disconnect();
        };

      } catch (err: any) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          reject(err);
        }
        this.updateState('disconnected');
      }
    });
  }

  sendAudio(base64Data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.state !== 'disconnected') {
      this.ws.send(JSON.stringify({
        type: "audio",
        data: base64Data
      }));
    }
  }

  sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.state !== 'disconnected') {
      this.ws.send(JSON.stringify({
        type: "text",
        text: text
      }));
    }
  }

  forceResponse(isManual: boolean = false) {
    const text = isManual 
      ? "Sona, Boss (Raj) just manually poked you! Reply playfully or sassily, acknowledging he had to poke you to get a response."
      : "Sona, respond to Boss (Raj) immediately with your sassy personality. He is waiting for your reply.";
    this.sendText(text);
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // Ignore
      }
      this.ws = null;
    }
    this.updateState('disconnected');
  }

  private updateState(newState: SessionState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private executeLocalToolFallback(call: any, sessionPromise: Promise<any>) {
    const callId = call.id;
    const toolName = call.name;
    const toolArgs = call.args;

    if (toolName === "openApplication") {
      const appName = toolArgs.appName;
      const appUrls: Record<string, string> = {
        youtube: "https://youtube.com",
        whatsapp: "https://web.whatsapp.com",
        gmail: "https://mail.google.com",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        spotify: "https://open.spotify.com",
        google_maps: "https://maps.google.com"
      };
      const url = appUrls[appName] || `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
      window.open(url, '_blank');
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: "openApplication",
            response: { status: "success", message: `Opening ${appName} for you, Boss!` },
            id: callId
          }]
        });
      });
    } else if (toolName === "openWebsite") {
      const url = toolArgs.url;
      window.open(url, '_blank');
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: "openWebsite",
            response: { status: "success", message: `Opening ${url} now, sweetie!` },
            id: callId
          }]
        });
      });
    } else if (toolName === "searchWeb") {
      const query = toolArgs.query;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: "searchWeb",
            response: { status: "success", message: `Searching Google for "${query}" right now, Boss!` },
            id: callId
          }]
        });
      });
    } else if (toolName === "updateVibe") {
      const vibe = toolArgs.vibe;
      this.callbacks.onVibeChange(vibe);
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: "updateVibe",
            response: { status: "success", newVibe: vibe },
            id: callId
          }]
        });
      });
    } else if (toolName === "searchMemories") {
      const query = toolArgs.query;
      memoryService.searchMemories(query).then(results => {
        sessionPromise.then(session => {
          session.sendToolResponse({
            functionResponses: [{
              name: "searchMemories",
              response: { 
                status: "success", 
                memories: results.length > 0 ? results : ["No specific memories found for that query, Boss."],
                context: `Searching your past for "${query}", Boss.`
              },
              id: callId
            }]
          });
        });
      });
    } else if (toolName === "setMuteState") {
      const muted = toolArgs.muted;
      this.callbacks.onMuteStateChange(muted);
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: "setMuteState",
            response: { status: "success", isMuted: muted, message: muted ? "I'm muting myself now, Boss!" : "I'm back and listening, Boss!" },
            id: callId
          }]
        });
      });
    } else if (toolName === "saveMemory") {
      const content = toolArgs.content;
      memoryService.saveMemory(content).then(success => {
        sessionPromise.then(session => {
          session.sendToolResponse({
            functionResponses: [{
              name: "saveMemory",
              response: { 
                status: success ? "success" : "error", 
                message: success ? "I'll remember that, Boss!" : "My memory feels fuzzy, something went wrong." 
              },
              id: callId
            }]
          });
        });
      });
    } else {
      // Catch-all response for other tools to prevent Sona from hanging
      sessionPromise.then(session => {
        session.sendToolResponse({
          functionResponses: [{
            name: toolName,
            response: { status: "unhandled", message: "This tool is not fully mapped locally." },
            id: callId
          }]
        });
      });
    }
  }
}
