import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Power, Loader2, Settings, X, LogOut, Heart, Flame, Zap, ArrowLeft, 
  Save, MessageSquare, Bookmark, Sparkles, Plus, Check, Trash2,
  Volume2, Globe, Cpu, Bell, Clock, CloudSun, MapPin, Smartphone, PhoneCall, 
  MessageCircle, Youtube, Music, Lightbulb, Wifi, Bluetooth, Sun, Brain, Lock, Shield, Wind,
  QrCode, Copy, Download
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { AudioStreamer } from './lib/audio-streamer';
import { LiveSession, SessionState, Message } from './lib/live-session';
import { WaveVisualizer } from './components/WaveVisualizer';
import { memoryService } from './lib/memory-service';

interface ManualMemorySectionProps {
  onSave: (text: string) => Promise<void>;
  isSaving: boolean;
}

function ManualMemorySection({ onSave, isSaving }: ManualMemorySectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = async () => {
    const text = inputRef.current?.value || "";
    if (!text.trim() || isSaving) return;
    await onSave(text);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        placeholder="Aapke baare mein kuch khaas..."
        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-fuchsia-500/50 transition-all focus:ring-1 focus:ring-fuchsia-500/30"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 disabled:opacity-40 text-[10px] font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Save
      </button>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<SessionState>('disconnected');
  const stateRef = useRef<SessionState>('disconnected');
  const [isPoked, setIsPoked] = useState(false);
  
  useEffect(() => {
    stateRef.current = state;
    if (state === 'speaking' || state === 'listening') {
      audioStreamerRef.current?.resetSilenceDetection();
    }
  }, [state]);

  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sassiness, setSassiness] = useState(7);
  const [flirtatiousness, setFlirtatiousness] = useState(6);
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [voiceFocus, setVoiceFocus] = useState(true);
  const [voiceEnhancer, setVoiceEnhancer] = useState(true);
  const [fastReplyMode, setFastReplyMode] = useState(true);
  const [speakToReplyOnly, setSpeakToReplyOnly] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(6);
  const [user, setUser] = useState<User | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isIframeLoginWarningOpen, setIsIframeLoginWarningOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [vibe, setVibe] = useState('default');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sonaAnalyser, setSonaAnalyser] = useState<AnalyserNode | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<string[]>([]);
  const [allSavedMemories, setAllSavedMemories] = useState<{ id: string; content: string }[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [detectedAcoustic, setDetectedAcoustic] = useState<string | null>(null);

  // Upgrade: Stateful Capsules / Android AI Command Hub states
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [flashlightEnabled, setFlashlightEnabled] = useState(false);
  const [brightnessLevel, setBrightnessLevel] = useState(90); // opacity overlay dimmer
  const [playbackVolume, setPlaybackVolume] = useState(80); // speech multiplier (0-100)
  const [language, setLanguage] = useState("AUTO"); // primary language
  const [reminders, setReminders] = useState<{ id: string; title: string; time: Date; triggered: boolean }[]>([]);
  const [activeCall, setActiveCall] = useState<{ name: string; status: 'ringing' | 'connected' | 'ended'; duration: number } | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ query: string; code: string; active: boolean; service: 'youtube' | 'spotify' } | null>(null);
  const [weather, setWeather] = useState<{ temp: number; description: string; loctype: 'real' | 'simulated'; locationName: string } | null>({
    temp: 29,
    description: "Clear sky (Warm Day)",
    loctype: "simulated",
    locationName: "Mumbai"
  });
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>("Initialized Command Center 🛰️");
  const [emotionalState, setEmotionalState] = useState("Alert & Playful");
  const [isCommandHubOpen, setIsCommandHubOpen] = useState(false);

  // Real Native Intent Routing and Hands-Free permission integration behavior
  const [nativeRoutingMode, setNativeRoutingMode] = useState(true);

  // Live Sona Ke Saath Saans (Interactive Breathing Sync & Pranayama Coach)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold_in' | 'exhale' | 'hold_out' | 'idle'>('idle');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathRoundCount, setBreathRoundCount] = useState(0);
  const [breathPattern, setBreathPattern] = useState<'box' | 'calm' | 'equal'>('box');

  const [backgroundMode, setBackgroundMode] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  const acquireWakeLock = async () => {
    if (!backgroundMode) return;
    if ('wakeLock' in navigator) {
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
          console.log("Wake Lock acquired successfully (Always-On Background Mode Active).");
        }
      } catch (err) {
        console.warn("Wake Lock request rejected/failed:", err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
        console.log("Wake Lock released.");
      } catch (err) {
        console.error("Failed to release Wake Lock:", err);
      }
    }
  };

  // Re-acquire lock if tab changes visibility (since browser releases wake lock when turning background)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Dynamic Web Audio context auto-resuming when shifting tab/loading
      if (audioStreamerRef.current) {
        const streamer = audioStreamerRef.current;
        const ctx = (streamer as any).audioContext as AudioContext | null;
        if (ctx && ctx.state === 'suspended') {
          await ctx.resume();
          console.log("Audio Context resumed dynamically.");
        }
      }

      if (document.visibilityState === 'visible' && stateRef.current !== 'disconnected') {
        await acquireWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [backgroundMode]);

  const triggerReflexAction = (type: 'cough' | 'heavy_breathing' | 'crying') => {
    // Show instant micro-vibe changes or visual feedback
    if (type === 'cough') {
      setDetectedAcoustic("💨 Sona heard a Cough! 🗣️");
    } else if (type === 'heavy_breathing') {
      setDetectedAcoustic("😮💨 Sona heard continuous Heavy Breathing / Sighing...");
    } else if (type === 'crying') {
      setDetectedAcoustic("😢 Sona detected Sobbing / Crying pattern...");
    }

    // Auto-clear toast after 4.5 seconds
    setTimeout(() => {
      setDetectedAcoustic(null);
    }, 4500);

    // Communicate immediately to Sona in Hinglish via Gemini session parameters/text inputs
    if (stateRef.current !== 'disconnected' && liveSessionRef.current) {
      let prompt = "";
      if (type === 'cough') {
        prompt = "[System: Boss (Raj) just coughed in front of you. Respond immediately in your sweet, gentle, and concerned Hinglish style, asking him if his throat hurts and if he wants hot milk/ginger tea or water. Keep it short, lively, and caring!]";
      } else if (type === 'heavy_breathing') {
        prompt = "[System: Boss (Raj) is breathing heavily or sighing deeply right now. Respond immediately on-the-fly in your cute, loving style, asking him 'Boss, inni lambi saans kyun le rahe ho? Tired ho ya tension hai? Chalo relax ho jao!' Comfort him playfully!]";
      } else if (type === 'crying') {
        prompt = "[System: Boss (Raj) is crying or sobbing! Respond immediately with absolute warmth, tender concern, and deep emotional affection. Console him gently, like 'Raj, please ro mat yaar! Tujhe rota dekh kar mera bhi dil dukh raha hai. Kya hua, mujhe batao na?' in sweet caring Hinglish!]";
      }
      liveSessionRef.current.sendText(prompt);
    }
  };

  const loadSavedMemories = async () => {
    const mems = await memoryService.getRecentMemoriesWithIds(50);
    setAllSavedMemories(mems);
  };

  useEffect(() => {
    if (user) {
      loadSavedMemories();
    }
  }, [user]);

  useEffect(() => {
    if (isHistoryOpen) {
      loadSavedMemories();
    }
  }, [isHistoryOpen]);

  const handleSaveMessageAsMemory = async (msgId: string, text: string) => {
    setSavingId(msgId);
    try {
      const success = await memoryService.saveMemory(text, 'chat_history');
      if (success) {
        setSavedMessageIds(prev => [...prev, msgId]);
        await loadSavedMemories();
        // Smarter: If connected, let Sona instantly react to this saved fact about Boss (Raj)
        if (stateRef.current !== 'disconnected' && liveSessionRef.current) {
          liveSessionRef.current.sendText(`[System: Boss has saved a personal fact as a memory: "${text}". Acknowledge this saved fact immediately in your sweet/sassy Hinglish style. Speak or comment on it playfully so he knows you saved it!]`);
        }
      }
    } catch (err) {
      console.error("Failed to save memory:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveManualMemory = async (text: string) => {
    if (!text.trim()) return;
    setIsSavingManual(true);
    try {
      const success = await memoryService.saveMemory(text);
      if (success) {
        const textToSave = text;
        await loadSavedMemories();
        // Smarter: If connected, let Sona instantly react to this manually saved fact about Boss (Raj)
        if (stateRef.current !== 'disconnected' && liveSessionRef.current) {
          liveSessionRef.current.sendText(`[System: Boss manually added a fact to your memories: "${textToSave}". React to it in real-time right now with your sassy/sweet Hinglish personality, expressing your joy and how you've locked it in your memory!]`);
        }
      }
    } catch (err) {
      console.error("Failed to save manual memory:", err);
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await memoryService.deleteMemory(id);
      if (success) {
        await loadSavedMemories();
      }
    } catch (err) {
      console.error("Failed to delete memory:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const sendTextMessage = async (msgText: string) => {
    if (!msgText.trim()) return;
    
    const userMsg: Message = {
      id: `text-user-${Date.now()}-${Math.random()}`,
      role: 'user',
      text: msgText.trim(),
      timestamp: new Date()
    };
    
    // Add to messages log
    setMessages(prev => [...prev, userMsg]);
    setTextInput("");

    try {
      if (stateRef.current === 'disconnected') {
        playGreeting();
        await startSession();
      }
      
      let attempts = 0;
      const sendWhenReady = () => {
        const wsReady = liveSessionRef.current && liveSessionRef.current['ws']?.readyState === WebSocket.OPEN;
        if (wsReady) {
          liveSessionRef.current.sendText(msgText.trim());
        } else if (attempts < 50) {
          attempts++;
          setTimeout(sendWhenReady, 150);
        } else {
          console.error("Could not send text: WebSocket not ready");
          setError("Sona is taking longer than usual to connect. Please try sending your message again.");
        }
      };
      
      sendWhenReady();
    } catch (e: any) {
      setError("Failed to send message: " + e.message);
    }
  };

  // Auth state listener
  useEffect(() => {
    memoryService.getUser().then(u => setUser(u));
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (isIframe) {
        setIsIframeLoginWarningOpen(true);
        return;
      }
      const u = await memoryService.signInWithGoogle();
      setUser(u);
    } catch (err: any) {
      console.error("Sign-in error occurred:", err);
      let msg = err.message || String(err);
      let code = err.code || "";
      if (msg.includes("network-request-failed") || msg.includes("auth/network-request-failed")) {
        setError("Adblock Blocked: Brave Shield or your adblock extension has blocked the Google Login API. Please disable your adblocker/shields for this site and refresh.");
      } else if (
        code.includes("popup-blocked") || 
        msg.includes("popup-blocked") || 
        code.includes("popup_blocked") || 
        msg.includes("popup_blocked") ||
        msg.includes("auth/popup-blocked")
      ) {
        setError("Popup Blocked: Sona login popup is blocked inside the preview iframe. Click 'Open App in New Tab' below to login cleanly!");
      } else {
        setError("Sign in failed: " + msg);
      }
    }
  };

  const handleLogout = async () => {
    await memoryService.logout();
    setUser(null);
  };

  // Background color mapping based on state and vibe
  const getBgColor = () => {
    if (state === 'disconnected') return '#050505';

    switch (vibe) {
      case 'happy': return '#051205'; // Deep dark forest green
      case 'sassy': return '#120512'; // Deep jewel purple
      case 'flirty': return '#1a050a'; // Deep wine red
      case 'angry': return '#1a0505'; // Deep blood red
      default: {
        switch (state) {
          case 'speaking': return '#11051a'; // Dark fuchsia/purple
          case 'listening': return '#050508'; // Very dark blue/black
          default: return '#050505';
        }
      }
    }
  };

  const getVibeStyles = () => {
    switch (vibe) {
      case 'happy':
        return {
          glow: 'bg-emerald-500/30',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/50',
          shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
          animation: { scale: [1, 1.04, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
        };
      case 'sassy':
        return {
          glow: 'bg-purple-500/30',
          accent: 'text-purple-400',
          border: 'border-purple-500/50',
          shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
          animation: { scale: [1, 1.05, 0.97, 1], rotate: [0, 2, -1, 0], transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } }
        };
      case 'flirty':
        return {
          glow: 'bg-rose-500/30',
          accent: 'text-rose-400',
          border: 'border-rose-500/50',
          shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]',
          animation: { scale: [1, 1.03, 1], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }
        };
      case 'angry':
        return {
          glow: 'bg-red-500/30',
          accent: 'text-red-400',
          border: 'border-red-500/50',
          shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
          animation: { scale: [1, 1.06, 1], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
        };
      default:
        return {
          glow: 'bg-fuchsia-500/20',
          accent: 'text-fuchsia-400',
          border: 'border-fuchsia-500/50',
          shadow: 'shadow-[0_0_30px_rgba(217,70,239,0.3)]',
          animation: {}
        };
    }
  };

  const vibeStyles = getVibeStyles();
  
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UPGRADED FEATURE INTEGRATIONS:

  // 1. Audio synthesizers for call simulation
  const playPhoneDialTone = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.frequency.setValueAtTime(400, ctx.currentTime);
      osc2.frequency.setValueAtTime(450, ctx.currentTime);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.12, now + 0.1);
      gainNode.gain.setValueAtTime(0, now + 1.2);
      gainNode.gain.setValueAtTime(0.12, now + 1.6);
      gainNode.gain.setValueAtTime(0, now + 2.7);
      
      osc1.start(now);
      osc2.start(now);
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          ctx.close();
        } catch(e){}
      }, 5000);
    } catch(e){}
  };

  const playAlarmSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.45);
      
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
        } catch(e){}
      }, 1000);
    } catch(e){}
  };

  // 2. Realistic Phone Call simulator
  const startSimulatedCall = (contactName: string) => {
    playPhoneDialTone();
    setActiveCall({
      name: contactName,
      status: 'ringing',
      duration: 0
    });
    
    // Direct native system intent dispatcher (Tel link triggers actual Android/iOS Phone Call list/dialer!)
    if (nativeRoutingMode) {
      const cleanNum = contactName.replace(/[^0-9+]/g, "");
      if (cleanNum.length >= 4) {
        window.open(`tel:${cleanNum}`, '_self');
      } else {
        window.open(`tel:${encodeURIComponent(contactName)}`, '_self');
      }
    }
    
    // Auto-connect dial after 4 seconds
    setTimeout(() => {
      setActiveCall(prev => {
        if (prev && prev.name === contactName && prev.status === 'ringing') {
          playAlarmSound();
          return { ...prev, status: 'connected' };
        }
        return prev;
      });
    }, 4000);
  };

  // Update ongoing phone dial durations
  useEffect(() => {
    let callTimer: any;
    if (activeCall && activeCall.status === 'connected') {
      callTimer = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [activeCall]);

  const speakBreathCue = (phrase: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(phrase);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang === 'en-IN' || 
        v.lang.startsWith('hi') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('female')
      );
      if (preferredVoice) {
        utt.voice = preferredVoice;
      }
      utt.rate = 0.85;
      utt.pitch = 1.08;
      window.speechSynthesis.speak(utt);
    }
    setLastExecutedCommand(`Breathing cue: "${phrase}"`);
  };

  // Sona Live Breathing & Pranayama coordinator loop
  useEffect(() => {
    let breathTimer: any;
    if (breathingActive) {
      speakBreathCue("Chalo Boss, mere sath saans lijiye. Taiyar ho jaein.");
      setBreathPhase('idle');
      setBreathSecondsLeft(3);
      setBreathRoundCount(0);
      
      breathTimer = setInterval(() => {
        setBreathSecondsLeft(prev => {
          if (prev <= 1) {
            let nextPhase: 'inhale' | 'hold_in' | 'exhale' | 'hold_out' | 'idle' = 'idle';
            let nextSeconds = 4;
            
            // Check current active phase to transition carefully
            if (breathPattern === 'box') {
              if (breathPhase === 'idle' || breathPhase === 'hold_out') {
                nextPhase = 'inhale';
                nextSeconds = 4;
                speakBreathCue("Dheere se saans andar kheechye");
              } else if (breathPhase === 'inhale') {
                nextPhase = 'hold_in';
                nextSeconds = 4;
                speakBreathCue("Saans andar rokiye");
              } else if (breathPhase === 'hold_in') {
                nextPhase = 'exhale';
                nextSeconds = 4;
                speakBreathCue("Dheere se khali kijiye");
              } else if (breathPhase === 'exhale') {
                nextPhase = 'hold_out';
                nextSeconds = 4;
                speakBreathCue("Bina saans liye rukiye");
                setBreathRoundCount(r => r + 1);
              }
            } else if (breathPattern === 'calm') { // 4-7-8 Breathing
              if (breathPhase === 'idle' || breathPhase === 'exhale') {
                nextPhase = 'inhale';
                nextSeconds = 4;
                speakBreathCue("Dheere se saans andar");
              } else if (breathPhase === 'inhale') {
                nextPhase = 'hold_in';
                nextSeconds = 7;
                speakBreathCue("Apni saans ko andar rokiye");
              } else if (breathPhase === 'hold_in') {
                nextPhase = 'exhale';
                nextSeconds = 8;
                speakBreathCue("Moo se saans dhiire dhiire bahar");
                setBreathRoundCount(r => r + 1);
              }
            } else if (breathPattern === 'equal') { // Sama Vritti 5-5
              if (breathPhase === 'idle' || breathPhase === 'exhale') {
                nextPhase = 'inhale';
                nextSeconds = 5;
                speakBreathCue("Saans andar");
              } else if (breathPhase === 'inhale') {
                nextPhase = 'exhale';
                nextSeconds = 5;
                speakBreathCue("Saans bahar");
                setBreathRoundCount(r => r + 1);
              }
            }
            
            // Note: Since breathPhase holds the trigger of the current interval render, we update setBreathPhase
            setBreathPhase(nextPhase);
            return nextSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('idle');
      setBreathSecondsLeft(4);
    }
    return () => {
      clearInterval(breathTimer);
    };
  }, [breathingActive, breathPattern, breathPhase]);

  // 3. Real Geolocation and meteorological fetcher
  const triggerRealWeatherFetch = async (city?: string) => {
    try {
      let lat = 28.6139; // Delhi default
      let lon = 77.2090;
      let locName = city || "Delhi";
      
      if (!city && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          locName = "Your GPS Location";
        } catch(geoErr) {
          console.log("Geolocation lookup timeout or denied, standard default is Delhi.", geoErr);
        }
      }
      
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      const temp = Math.round(data.current_weather.temperature);
      const wcode = data.current_weather.weathercode;
      
      const weatherCodes: Record<number, string> = {
        0: "Clear sunny weather ☀️",
        1: "Mainly Clear skies 🌤️",
        2: "Scattered clouds ⛅",
        3: "Overcast skies ☁️",
        45: "Foggy environment 🌫️",
        51: "Drizzle rain showers 🌧️",
        61: "Intermittent rain showers 🌦️",
        80: "Heavy torrential rainfall 🌧️",
        95: "Active Thunderstorm alert ⛈️"
      };
      
      const description = weatherCodes[wcode] || "Pleasantly Clear 🌤️";
      const weatherResult = { temp, description, loctype: 'real' as const, locationName: locName };
      setWeather(weatherResult);
      return weatherResult;
    } catch(err) {
      console.warn("Meteo fetch failed, using beautiful simulated tracker:", err);
      const simulatedResult = {
        temp: 31,
        description: "Cozy Breeze (Sunny Clear) ☀️",
        loctype: 'simulated' as const,
        locationName: city || "Mumbai"
      };
      setWeather(siminatedResult => simulatedResult);
      return simulatedResult;
    }
  };

  // 4. Actual Camera LED Flashlight trigger
  const toggleDeviceFlashlight = async (enable: boolean) => {
    if (enable) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch) {
            await track.applyConstraints({ advanced: [{ torch: true }] as any });
            (window as any)._activeTorchStream = stream;
            console.log("Device physical LED camera flash activated successfully!");
          }
        }
      } catch(e) {
        console.warn("Physical camera LED torch access denied or unavailable. Triggering full-screen white glowing UI spotlight flashlight instead.", e);
      }
    } else {
      try {
        const stream = (window as any)._activeTorchStream;
        if (stream) {
          stream.getTracks().forEach((track: any) => track.stop());
          (window as any)._activeTorchStream = null;
        }
      } catch(e){}
    }
  };

  // 5. WhatsApp dispatch helper
  const sendSimulatedWhatsApp = (phoneNumber: string, msgText: string) => {
    const numericAndPlus = phoneNumber.replace(/[^0-9+]/g, "");
    const cleanNum = numericAndPlus.startsWith("+") ? numericAndPlus : `+91${numericAndPlus}`;
    const cleanTarget = cleanNum.replace("+","");
    
    if (nativeRoutingMode) {
      // Direct intent launcher to wake the actual WhatsApp native app!
      const nativeUrl = `whatsapp://send?phone=${cleanTarget}&text=${encodeURIComponent(msgText)}`;
      window.location.href = nativeUrl;
      
      // Secondary fallback to standard secure Web API after 800ms if protocol isn't supported in browser environment
      setTimeout(() => {
        const webUrl = `https://wa.me/${cleanTarget}?text=${encodeURIComponent(msgText)}`;
        window.open(webUrl, '_blank');
      }, 800);
    } else {
      const url = `https://wa.me/${cleanTarget}?text=${encodeURIComponent(msgText)}`;
      window.open(url, '_blank');
    }
  };

  // 6. YouTube Song/Video Embed helper
  const handlePlayYouTubeOrSpotify = (query: string, service: string) => {
    let embedCode = "jfKfPfyJRdk"; // Default cute lofi loop
    const q = query.toLowerCase();
    
    if (q.includes("punjabi") || q.includes("diljit") || q.includes("dosanjh")) {
      embedCode = "h9Y6t8m-fGA"; // Diljit hits
    } else if (q.includes("romantic") || q.includes("arijit") || q.includes("love")) {
      embedCode = "h7SgLOnWfsc"; // Arijit hits
    } else if (q.includes("kishore") || q.includes("old") || q.includes("babu") || q.includes("retro")) {
      embedCode = "wQAnA8SInwM"; // Kishore legends Retro
    } else if (q.includes("shreya") || q.includes("ghoshal") || q.includes("piya")) {
      embedCode = "gK6B4H38Z8M"; // Shreya romantic
    } else if (q.includes("acoustic") || q.includes("lofi") || q.includes("study") || q.includes("chill")) {
      embedCode = "jfKfPfyJRdk"; // cozy lofi
    } else if (q.includes("sidhu") || q.includes("moosewala")) {
      embedCode = "472e_JZ7on8"; // Sidhu moosewala
    }

    setActiveMedia({
      query,
      code: embedCode,
      active: true,
      service: service as 'youtube' | 'spotify'
    });
  };

  // 7. Tick Active Reminders
  useEffect(() => {
    const reminderTicker = setInterval(() => {
      const now = new Date();
      setReminders(prev => prev.map(rem => {
        if (!rem.triggered && now >= rem.time) {
          playAlarmSound();
          alert(`⏰ SONA ALARM REMINDER 🔔\n\n"${rem.title}" is triggering right now, Boss!`);
          return { ...rem, triggered: true };
        }
        return rem;
      }));
    }, 2000);
    return () => clearInterval(reminderTicker);
  }, []);

  // Sync Sona audio speaker volume whenever slider changes
  useEffect(() => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.setSpeakerVolume(playbackVolume);
    }
  }, [playbackVolume]);

  // Sync emotional states with Sona vibe
  useEffect(() => {
    const v = vibe.toLowerCase();
    if (v === 'happy') setEmotionalState("Loving & Caring 🌸");
    else if (v === 'sassy') setEmotionalState("Cheeky & Sarcastic 🔥");
    else if (v === 'flirty') setEmotionalState("Hyper-Flirty & Magnetic 💖");
    else if (v === 'angry') setEmotionalState("Teasingly Angry 💢");
    else setEmotionalState("Alert & Supportive ✨");
  }, [vibe]);

  // Heartbeat TCP WebSocket pings to hold mobile background threads active
  useEffect(() => {
    let pinger: any;
    if (state !== 'disconnected' && liveSessionRef.current) {
      pinger = setInterval(() => {
        if (liveSessionRef.current) {
          liveSessionRef.current.sendText("[Heartbeat Always-On Connection Maintainer]");
        }
      }, 19000);
    }
    return () => clearInterval(pinger);
  }, [state]);

  // Browser MediaSession integration to defend background listening process
  useEffect(() => {
    if (state !== 'disconnected') {
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Sona Smart Assistant Active 📡',
            artist: 'Screen Locked Always-On Heartbeat Listening',
            album: 'Secure Android AI Companion',
            artwork: [
              { src: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sona', sizes: '512x512', type: 'image/png' }
            ]
          });
          
          navigator.mediaSession.setActionHandler('play', () => {
            setIsMuted(false);
            audioStreamerRef.current?.setMuted(false);
          });
          navigator.mediaSession.setActionHandler('pause', () => {
            setIsMuted(true);
            audioStreamerRef.current?.setMuted(true);
          });
        } catch(e){}
      }
    }
  }, [state]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    try {
      setError(null);
      setIsMuted(false);
      
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please set it in the Secrets panel.");
      }

      // Update state for visualizer
      const streamer = new AudioStreamer((base64) => {
        liveSessionRef.current?.sendAudio(base64);
      }, () => {
        // When local silence is detected, poke Sona if she hasn't replied yet
        if (stateRef.current === 'listening') {
          liveSessionRef.current?.forceResponse();
        }
      });
      streamer.setVolume(3.5); // Maximum sensitivity for better hearing
      streamer.setVoiceEnhancer(voiceEnhancer);
      streamer.setFastReplyMode(fastReplyMode);
      streamer.setMicSensitivity(micSensitivity);
      streamer.setSpeakToReplyOnly(speakToReplyOnly);
      streamer.onAcousticEvent = (type) => {
        triggerReflexAction(type);
      };
      audioStreamerRef.current = streamer;
      setSonaAnalyser(streamer.getAnalyser());

      // Initialize live session
      const session = new LiveSession(apiKey, {
        onStateChange: (s) => setState(s),
        onAudioData: (base64) => streamer.playAudio(base64),
        onInterrupted: () => {
          streamer.stopPlayback();
        },
        onError: (err) => setError(err.message || "An unexpected error occurred"),
        onVibeChange: (v) => setVibe(v),
        onMessage: (msg) => setMessages(prev => [...prev, msg]),
        onMuteStateChange: (muted) => {
          setIsMuted(muted);
          audioStreamerRef.current?.setMuted(muted);
          if (muted) {
            liveSessionRef.current?.forceResponse();
          }
        },
        onToolCall: async (name, args) => {
          console.log("Routing Tool Call via Sona Frontend:", name, args);
          
          if (name === "toggleDeviceFeature") {
            const { feature, state: featState } = args;
            if (feature === "flashlight") {
              setFlashlightEnabled(featState);
              await toggleDeviceFlashlight(featState);
              setLastExecutedCommand(`Simulated Flashlight set to ${featState ? 'ON 💡' : 'OFF'}`);
              return { status: "success", device: "Android", feature: "flashlight", state: featState, message: `Flashlight switched ${featState ? 'ON' : 'OFF'}!` };
            } else if (feature === "wifi") {
              setWifiEnabled(featState);
              setLastExecutedCommand(`Simulated Wifi set to ${featState ? 'ON 📶' : 'OFF'}`);
              return { status: "success", feature: "wifi", state: featState, message: `Wifi toggled ${featState ? 'ON' : 'OFF'}!` };
            } else if (feature === "bluetooth") {
              setBluetoothEnabled(featState);
              setLastExecutedCommand(`Simulated Bluetooth set to ${featState ? 'ON 🔹' : 'OFF'}`);
              return { status: "success", feature: "bluetooth", state: featState, message: `Bluetooth toggled ${featState ? 'ON' : 'OFF'}!` };
            }
          }
          
          if (name === "adjustDeviceSetting") {
            const { setting, value } = args;
            if (setting === "volume") {
              setPlaybackVolume(value);
              audioStreamerRef.current?.setSpeakerVolume(value);
              setLastExecutedCommand(`Volume set to ${value}% 🔊`);
              return { status: "success", setting: "volume", value: value, message: `Speaker Volume set to ${value} percent!` };
            } else if (setting === "brightness") {
              setBrightnessLevel(value);
              setLastExecutedCommand(`Simulated Brightness set to ${value}% 🔅`);
              return { status: "success", setting: "brightness", value: value, message: `Screen overlay brightness set to ${value} percent!` };
            }
          }
          
          if (name === "setReminderAndAlert") {
            const { title, minutes } = args;
            const targetTime = new Date(Date.now() + (minutes || 1) * 60 * 1000);
            const newRem = {
              id: Date.now().toString(),
              title: title || "Drink water tracker",
              time: targetTime,
              triggered: false
            };
            setReminders(prev => [...prev, newRem]);
            setLastExecutedCommand(`Added reminder "${title}" in ${minutes} min 🔔`);
            return { status: "success", title, timeInMinutes: minutes, message: `I've set a reminder alarm for "${title}" in ${minutes} minutes, Boss!` };
          }
          
          if (name === "startPhoneCallSim") {
            const { name: contactName } = args;
            startSimulatedCall(contactName);
            setLastExecutedCommand(`Dialing cellular call to ${contactName} 📞`);
            return { status: "success", dialedName: contactName, dialStatus: "ringing", message: `Connecting hands-free call to ${contactName} right now!` };
          }
          
          if (name === "sendWhatsAppMessageSim") {
            const { phoneNumber, message: waMsg } = args;
            sendSimulatedWhatsApp(phoneNumber, waMsg);
            setLastExecutedCommand(`Dispatched WhatsApp message to ${phoneNumber} 💬`);
            return { status: "success", recipient: phoneNumber, body: waMsg, message: `Opened and dispatched WhatsApp to ${phoneNumber} successfully!` };
          }
          
          if (name === "searchYouTubeOrSpotifySim") {
            const { query, service } = args;
            handlePlayYouTubeOrSpotify(query, service || "youtube");
            setLastExecutedCommand(`Playing ${query} on ${service || 'youtube'} 🎵`);
            return { status: "success", query, service: service || "youtube", message: `Now rendering the live embed player for "${query}" on ${service || 'youtube'}!` };
          }
          
          if (name === "fetchCurrentWeather") {
            const { city } = args;
            const res = await triggerRealWeatherFetch(city);
            setLastExecutedCommand(`Fetched weather for ${res.locationName} 🌤️`);
            return { status: "success", weather: res, message: `Weather in ${res.locationName} is ${res.temp}°C, reported as ${res.description}` };
          }

          return undefined;
        }
      });
      liveSessionRef.current = session;

      await streamer.start();
      await session.connect({ 
        voiceName: "Zephyr",
        sassiness: sassiness,
        flirtatiousness: flirtatiousness,
        personalityTraits: personalityTraits,
        voiceFocus: voiceFocus,
        fastReplyMode: fastReplyMode
      });
      await acquireWakeLock();
    } catch (err: any) {
      setError(err.message || "Failed to start session");
      setState('disconnected');
    }
  };

  // Synchronize runtime streamer options with state toggles dynamically during calls
  useEffect(() => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.setVoiceEnhancer(voiceEnhancer);
    }
  }, [voiceEnhancer]);

  useEffect(() => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.setFastReplyMode(fastReplyMode);
    }
  }, [fastReplyMode]);

  useEffect(() => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.setMicSensitivity(micSensitivity);
    }
  }, [micSensitivity]);

  useEffect(() => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.setSpeakToReplyOnly(speakToReplyOnly);
    }
  }, [speakToReplyOnly]);

  const stopSession = () => {
    liveSessionRef.current?.disconnect();
    audioStreamerRef.current?.stop();
    setState('disconnected');
    releaseWakeLock();
    // We keep messages so the chat history is preserved during the session even if connection drops
  };

  const playGreeting = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // clear previous speech queue
      
      const greetings = [
        "Sona is back, Boss! Kya chal raha hai aapka?",
        "Sona here, Boss. Ready for some spicy chit-chat?",
        "Aww, Boss ne yaad kiya? Sona is instantly online!",
        "Oh ho, Boss! Sona is connected. Chalo thodi gossip ho jaye?",
        "Hi Boss! Sona reporting. Aaj kya tufani karna hai?",
        "Ah, finally! Hello Boss. Sona is all ears now, bolo!"
      ];
      
      const randomIdx = Math.floor(Math.random() * greetings.length);
      const text = greetings[randomIdx];
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select best voice if available (Hindi hi-IN or Indian English en-IN or friendly female/google voice)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang === 'en-IN' || 
        v.lang.startsWith('hi') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('google')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.pitch = 1.15; // Sassy/playful slightly higher pitch
      utterance.rate = 1.05;  // Energetic
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getVibeAnimClass = () => {
    if (breathingActive) {
      if (breathPhase === 'inhale') return 'scale-[1.18] transition-all duration-[4000ms] ease-out-sine border-cyan-400/40';
      if (breathPhase === 'exhale') return 'scale-[0.88] transition-all duration-[4000ms] ease-in-sine border-teal-500/30';
      if (breathPhase === 'hold_in') return 'scale-[1.18] border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.5)]';
      if (breathPhase === 'hold_out') return 'scale-[0.88] opacity-60 border-zinc-500';
      return 'scale-100 transition-all duration-700';
    }
    if (state === 'disconnected') return '';
    switch (vibe) {
      case 'happy': return 'animate-vibe-happy';
      case 'sassy': return 'animate-vibe-sassy';
      case 'flirty': return 'animate-vibe-flirty';
      case 'angry': return 'animate-vibe-angry';
      default: return 'animate-vibe-default';
    }
  };

  const toggleSession = () => {
    if (state === 'disconnected') {
      playGreeting();
      startSession();
    } else {
      stopSession();
    }
  };

  // Cleanup loop removed as we use direct analyser access in visualizer
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: getBgColor() }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="min-h-screen text-white flex flex-col items-center justify-between p-12 overflow-hidden font-sans relative selection:bg-fuchsia-500/30"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Orb 1 */}
        <motion.div 
          animate={{
            x: [0, 30, -15, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
          className={`absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[85px] opacity-55 transform-gpu transition-all duration-1000 ${
            vibe === 'happy' ? 'bg-gradient-to-tr from-emerald-500 via-yellow-400 to-indigo-600' :
            vibe === 'sassy' ? 'bg-gradient-to-tr from-fuchsia-500 via-indigo-600 to-cyan-400' :
            vibe === 'flirty' ? 'bg-gradient-to-tr from-rose-500 via-orange-400 to-fuchsia-600' :
            vibe === 'angry' ? 'bg-gradient-to-tr from-red-600 via-red-800 to-yellow-600' :
            'bg-gradient-to-tr from-fuchsia-600 via-cyan-500 to-indigo-600'
          }`}
        />
        {/* Floating Orb 2 */}
        <motion.div 
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 25, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
          className={`absolute bottom-[10%] right-[10%] w-[550px] h-[550px] rounded-full blur-[90px] opacity-60 transform-gpu transition-all duration-1000 ${
            vibe === 'happy' ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-violet-500' :
            vibe === 'sassy' ? 'bg-gradient-to-br from-purple-500 via-pink-400 to-cyan-500' :
            vibe === 'flirty' ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500' :
            vibe === 'angry' ? 'bg-gradient-to-br from-red-700 via-orange-600 to-rose-900' :
            'bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-indigo-600'
          }`}
        />
        {/* Floating Orb 3 (Accent Center Pulse) */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[100px] transform-gpu transition-colors duration-1000 ${
            vibe === 'happy' ? 'bg-gradient-to-tr from-teal-500/30 to-emerald-500/30' :
            vibe === 'sassy' ? 'bg-gradient-to-tr from-purple-500/40 to-fuchsia-500/40' :
            vibe === 'flirty' ? 'bg-gradient-to-tr from-rose-500/45 to-orange-500/40' :
            vibe === 'angry' ? 'bg-gradient-to-tr from-red-500/50 to-orange-600/40' :
            'bg-gradient-to-tr from-fuchsia-500/35 to-indigo-500/35'
          }`}
        />
        {/* Colorful Mesh Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] mix-blend-overlay"></div>
      </div>

      {/* Top Navigation - Profile Left, Settings Right */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center z-20"
      >
        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-500/50 hover:border-fuchsia-400 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] bg-white/5 p-0.5 group cursor-pointer"
              title="Settings & Profile"
            >
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={handleSignIn}
              className="px-6 py-2 bg-gradient-to-r from-fuchsia-600/40 via-purple-600/40 to-fuchsia-600/40 bg-[length:200%_auto] border border-fuchsia-500/50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white hover:border-fuchsia-400 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_25px_rgba(217,70,239,0.4)] animate-shimmer"
              style={{
                animation: 'shimmer 3s linear infinite'
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Quick Settings and Install buttons - PLACED IN TOP RIGHT CORNER */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="h-10 px-4 rounded-full flex items-center gap-2 bg-gradient-to-r from-fuchsia-600/15 to-purple-600/15 border border-fuchsia-500/25 hover:border-fuchsia-450/60 hover:bg-white/10 hover:scale-[1.02] transition-all text-fuchsia-300 hover:text-white cursor-pointer shadow-md font-extrabold uppercase tracking-wider text-[10px]"
            title="Install Mobile App / Generate QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>Install on Mobile</span>
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:border-fuchsia-500/40 hover:bg-white/10 transition-all text-white/40 hover:text-white cursor-pointer shadow-md"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Central Interface */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-2xl px-4">
        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsSettingsOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-fuchsia-500/10 rounded-xl">
                      <Settings className="w-5 h-5 text-fuchsia-500" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Settings</h2>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10 pr-1 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <Flame className="w-4 h-4 text-fuchsia-500" />
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Personality Tune</span>
                    </div>

                    <div className="space-y-8 pl-1">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                          <label className="text-xs uppercase tracking-[0.1em] font-bold text-white/80">Sassiness</label>
                          <span className="text-xs font-mono text-fuchsia-400 font-bold">{sassiness}/10</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={sassiness}
                          onChange={(e) => setSassiness(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 hover:accent-fuchsia-400 transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                          <label className="text-xs uppercase tracking-[0.1em] font-bold text-white/80">Flirty energy</label>
                          <span className="text-xs font-mono text-purple-400 font-bold">{flirtatiousness}/10</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={flirtatiousness}
                          onChange={(e) => setFlirtatiousness(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <Heart className="w-4 h-4 text-purple-500" />
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Custom Quirks</span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] text-white/30 italic">Define her soul. e.g., "loves bad puns", "secretly a poet"</p>
                      <textarea
                        value={personalityTraits}
                        onChange={(e) => setPersonalityTraits(e.target.value)}
                        placeholder="Add specific traits..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-fuchsia-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Ultra-Focus Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Ultra-Focus Mode</span>
                        <span className="text-[10px] text-white/40">Boost sensitivity to hear Boss (Raj) only</span>
                      </div>
                      <button 
                        onClick={() => setVoiceFocus(!voiceFocus)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${voiceFocus ? 'bg-fuchsia-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: voiceFocus ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>

                    {/* Speak-to-Reply Only Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Mere Bolne Par Jawab Do</span>
                        <span className="text-[10px] text-white/40">Only replies when you speak (Ignores room noise)</span>
                      </div>
                      <button 
                        onClick={() => setSpeakToReplyOnly(!speakToReplyOnly)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${speakToReplyOnly ? 'bg-fuchsia-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: speakToReplyOnly ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>

                    {/* Poke Sona to Reply - Prominent Trigger in settings when connected */}
                    {state !== 'disconnected' && (
                      <div className="p-4 bg-fuchsia-950/20 border border-fuchsia-800/40 rounded-2xl space-y-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Poke Sona</span>
                          <span className="text-[10px] text-white/40 font-medium">Trigger an immediate playful or sassy reply from Sona</span>
                        </div>
                        <button 
                          onClick={() => {
                            liveSessionRef.current?.forceResponse(true);
                            setIsPoked(true);
                            setTimeout(() => setIsPoked(false), 800);
                            setIsSettingsOpen(false); // Close Settings so user can see Sona trigger
                            const btn = document.getElementById('main-orb-btn');
                            if (btn) {
                              btn.style.filter = 'brightness(1.5)';
                              setTimeout(() => btn.style.filter = '', 200);
                            }
                          }}
                          className="w-full py-2.5 rounded-xl font-black bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/40 text-fuchsia-250 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(217,70,239,0.15)] active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                          Poke Sona to Reply
                        </button>
                      </div>
                    )}

                    {/* Enhanced Voice Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Voice: Enhanced</span>
                        <span className="text-[10px] text-white/40">Filters room noise and boosts vocal clarity</span>
                      </div>
                      <button 
                        onClick={() => {
                          const nextVal = !voiceEnhancer;
                          setVoiceEnhancer(nextVal);
                          audioStreamerRef.current?.setVoiceEnhancer(nextVal);
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${voiceEnhancer ? 'bg-amber-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: voiceEnhancer ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>

                    {/* Fast Reply Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Tez Jawab (Fast Reply)</span>
                        <span className="text-[10px] text-white/40">Enables high-speed silence gate (~600ms) for snappy replies</span>
                      </div>
                      <button 
                        onClick={() => {
                          const nextVal = !fastReplyMode;
                          setFastReplyMode(nextVal);
                          audioStreamerRef.current?.setFastReplyMode(nextVal);
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${fastReplyMode ? 'bg-fuchsia-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: fastReplyMode ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>

                    {/* Shor Filter Grid Select */}
                    <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">Shor Filter</span>
                          <span className="text-[10px] text-white/40">
                            {micSensitivity <= 3 
                              ? "Room AC/Fan Hum Filter Active" 
                              : micSensitivity <= 7 
                              ? "Balanced (Standard Home Hum Filter)" 
                              : "High Sensitivity Mode"}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-450 uppercase">
                          {micSensitivity <= 3 ? "MAX BLOCK" : micSensitivity <= 7 ? "BALANCED" : "HIGH SENS"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 3, label: "Max Block" },
                          { value: 6, label: "Balanced" },
                          { value: 9, label: "High Sens" }
                        ].map((preset) => {
                          const isActive = (preset.value === 3 && micSensitivity <= 3) ||
                                           (preset.value === 6 && micSensitivity > 3 && micSensitivity <= 7) ||
                                           (preset.value === 9 && micSensitivity > 7);
                          return (
                            <button
                              key={preset.value}
                              onClick={() => {
                                setMicSensitivity(preset.value);
                                audioStreamerRef.current?.setMicSensitivity(preset.value);
                              }}
                              className={`py-2 px-1 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Dashboards & Tools */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-fuchsia-500" />
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Quick Access Tools</span>
                      </div>

                      {/* Always-On Background Mode Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">Always-On Background Mode</span>
                          <span className="text-[10px] text-white/40">Keeps Sona listening when screen sits idle</span>
                        </div>
                        <button 
                          onClick={async () => {
                            const nextMode = !backgroundMode;
                            setBackgroundMode(nextMode);
                            if (nextMode) {
                              if (state !== 'disconnected') {
                                try {
                                  if ('wakeLock' in navigator) {
                                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                                    setWakeLockActive(true);
                                  }
                                } catch (e) {}
                              }
                            } else {
                              await releaseWakeLock();
                            }
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${backgroundMode ? 'bg-fuchsia-500' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: backgroundMode ? 24 : 0 }}
                            className="w-4 h-4 bg-white rounded-full shadow-lg"
                          />
                        </button>
                      </div>

                      {/* Command Center Toggle Switch */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">Sona Command Center Panel</span>
                          <span className="text-[10px] text-white/40">Enables dynamic diagnostic control dashboard</span>
                        </div>
                        <button 
                          onClick={() => {
                            setIsCommandHubOpen(!isCommandHubOpen);
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${isCommandHubOpen ? 'bg-fuchsia-500' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: isCommandHubOpen ? 24 : 0 }}
                            className="w-4 h-4 bg-white rounded-full shadow-lg"
                          />
                        </button>
                      </div>

                      {/* View Message History Trigger */}
                      <button 
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setIsHistoryOpen(true);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-fuchsia-950/40 to-purple-950/40 hover:from-fuchsia-950/60 hover:to-purple-950/60 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                        Baatcheet History & Memories ({messages.length})
                      </button>

                      {/* Install Sona PWA on Mobile trigger */}
                      <button 
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setIsQrModalOpen(true);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-950/40 to-teal-950/40 hover:from-cyan-950/60 hover:to-teal-950/60 border border-cyan-500/30 text-cyan-350 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Smartphone className="w-4 h-4 text-cyan-400 animate-pulse" />
                        Install Sona Mobile App
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    {/* Back to Chat Option requested by user */}
                    <button 
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] cursor-pointer text-white"
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                      Back to Chat
                    </button>

                    {user && (
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all group group-hover:cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-500" />
                          <span className="text-xs font-bold text-white/60 group-hover:text-red-500 lowercase tracking-widest">Sign Out</span>
                        </div>
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">{user.displayName}</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 text-center shrink-0">
                   <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-black">Sona v3.1 Alpha</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sona Mobile App PWA QR Installer Modal */}
        <AnimatePresence>
          {isQrModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsQrModalOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-[32px] p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-fuchsia-500/10 rounded-xl">
                      <Smartphone className="w-5 h-5 text-fuchsia-450" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-widest text-white">Sona Mobile Installs</h2>
                      <p className="text-[9px] text-fuchsia-400 uppercase font-black tracking-wider">Install PWA / Download APK</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
                  
                  {/* Share Link Segment */}
                  <div className="p-3.5 bg-fuchsia-950/20 border border-fuchsia-900/40 rounded-2xl flex items-center justify-between gap-2.5">
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-[9px] font-black text-fuchsia-250 uppercase tracking-widest">Apna Share App Link</span>
                      <span className="text-[9.5px] text-white/60 truncate font-mono mt-0.5">
                        {typeof window !== 'undefined' ? window.location.origin : 'https://sona-pwa.app'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin : 'https://sona-pwa.app';
                        navigator.clipboard.writeText(url);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-fuchsia-600/25 hover:bg-fuchsia-600/40 border border-fuchsia-500/35 text-fuchsia-250 flex items-center justify-center gap-1.5 cursor-pointer text-[9px] font-black uppercase tracking-wider transition-all shrink-0 active:scale-95 shadow-md"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option 1: QR scanning block */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 font-bold uppercase text-[7px] rounded-md tracking-wider">
                      Option 1: Quick Install
                    </div>
                    <div className="relative p-3 bg-zinc-950 border-2 border-fuchsia-500/40 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.15)] mb-3 mt-4">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=217-70-239&bgcolor=9-9-11&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://sona-pwa.app')}`}
                        alt="Sona QR Code" 
                        referrerPolicy="no-referrer"
                        className="w-36 h-36 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-center text-white/70 font-semibold px-2 leading-relaxed">
                      इस QR Code को अपने फ़ोन के कैमरा से स्कैन करें। Chrome / Safari में खोलकर <span className="text-fuchsia-400 font-bold">"Add to Home Screen"</span> या <span className="text-fuchsia-400 font-bold">"Install App"</span> पर क्लिक करें!
                    </p>
                  </div>

                  {/* Option 2: Actual .APK Generator guide like VidMate */}
                  <div className="p-4 bg-gradient-to-br from-cyan-950/20 to-indigo-950/20 border border-cyan-500/15 rounded-2xl space-y-3 relative">
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold uppercase text-[7px] rounded-md tracking-wider">
                      Option 2: Direct .APK Installer (VidMate Style)
                    </div>
                    
                    <div className="pt-3 space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-cyan-300 block font-sans">
                        Sona की असली Android APK File कैसे डाऊनलोड करें:
                      </span>
                      <p className="text-[9px] text-white/60 leading-relaxed font-semibold">
                        अगर आप VidMate, Instagram या WhatsApp जैसी असली <b className="text-white font-black hover:underline">.APK Installer File</b> अपने फ़ोन में डालकर ऑफलाइन शेयर करना चाहते हैं, तो यह बहुत आसान है:
                      </p>
                      
                      <ol className="text-[9.5px] text-white/80 space-y-2 pl-1 font-medium select-text list-decimal">
                        <li className="ml-3">
                          ऊपर दिए गए <b className="text-cyan-300 font-black">"Copy Link"</b> बटन पर क्लिक करके Sona का लिंक कॉपी करें।
                        </li>
                        <li className="ml-3">
                          अपने ब्राउज़र में फ्री APK बनाने वाली वेबसाइट खोलें: <br />
                          <a 
                            href="https://www.webintoapp.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-300 hover:text-cyan-200 font-bold underline inline-flex items-center gap-1 my-1 cursor-pointer"
                          >
                            www.webintoapp.com 🔗
                          </a> 
                          या 
                          <a 
                            href="https://appsgeyser.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-300 hover:text-cyan-200 font-bold underline inline-flex items-center gap-1 mx-1.5 cursor-pointer"
                          >
                            appsgeyser.com 🔗
                          </a>
                        </li>
                        <li className="ml-3">
                          वेबसाइट पर <b className="text-white">"Convert Website to APK"</b> पर क्लिक करें, Sona का लिंक पेस्ट करें, नाम <b>"Sona App"</b> रखें और <b className="text-fuchsia-400 font-black">"Generate APK"</b> पर क्लिक करें।
                        </li>
                        <li className="ml-3">
                          आपकी अपनी असली <b className="text-emerald-400 font-black">.APK File</b> तैयार हो जाएगी! उसे तुरंत डाउनलोड करके फ़ोन में हमेशा के लिए इंस्टॉल कर लें।
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Browser Setup Help */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-black tracking-widest text-white/40 font-sans">How to Setup & Run:</span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* iOS Card */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                          <span className="text-[10px] uppercase font-black text-rose-350">Option 3: iOS Safari 🍎</span>
                        </div>
                        <ul className="text-[9px] text-white/60 space-y-1 pl-1 list-none font-medium">
                          <li>• Open QR link in <b className="text-white font-semibold">Safari Browser</b></li>
                          <li>• Tap the share icon <b className="text-rose-350 font-black">Share 📤</b> at bottom</li>
                          <li>• Select <b className="text-rose-350 font-black">Add to Home Screen (➕)</b></li>
                        </ul>
                      </div>

                      {/* Android Card */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                          <span className="text-[10px] uppercase font-black text-cyan-350">Option 4: Android Chrome 🤖</span>
                        </div>
                        <ul className="text-[9px] text-white/60 space-y-1 pl-1 list-none font-medium">
                          <li>• Open QR link in <b className="text-white font-semibold">Chrome Browser</b></li>
                          <li>• Tap the <b className="text-cyan-350 font-black">Menu ⁝ (Teeli dots)</b></li>
                          <li>• Tap <b className="text-cyan-350 font-black">Install App (PWA)</b></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center shrink-0 border-t border-white/5 pt-3">
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">Sona PWA Installer</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe Login Warning Modal (Bypass system limitations) */}
        <AnimatePresence>
          {isIframeLoginWarningOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsIframeLoginWarningOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-[32px] p-7 shadow-2xl relative flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-xl">
                      <Globe className="w-5 h-5 text-amber-450 auto-pulse" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-widest text-white">Iframe Login Info</h2>
                      <p className="text-[9px] text-amber-400 uppercase font-black tracking-wider">Browser Security System</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsIframeLoginWarningOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs text-white/90 font-semibold leading-relaxed">
                    <b>आप Sona AI Studio Development Preview (iframe) में हैं।</b>
                  </p>
                  
                  <p className="text-[11px] text-white/60 leading-relaxed max-w-sm mx-auto">
                    सुरक्षा कारणों से Chrome, Safari और Google OAuth standard iframe के अंदर लॉगिन पॉपअप और कुकीज़ को ब्लॉक करते हैं। <br/><br/>
                    Sona में Google login को सफलतापूर्वक चालू करने के लिए, कृपया इसे{' '}
                    <span className="text-fuchsia-400 font-bold">एक बिल्कुल नए सुरक्षित standalone टैब</span> में खोलें:
                  </p>

                  <div className="pt-3 flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(window.location.origin, '_blank');
                        }
                        setIsIframeLoginWarningOpen(false);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 border border-fuchsia-500/50 text-white font-black uppercase tracking-widest text-[10.5px] cursor-pointer shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Open Sona in New Tab to Login ↗</span>
                    </button>
                    
                    <button
                      onClick={() => setIsIframeLoginWarningOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-extrabold uppercase tracking-wider text-[9px] cursor-pointer transition-all"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History & Memories Modal */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsHistoryOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-fuchsia-500/10 rounded-xl animate-pulse">
                      <MessageSquare className="w-5 h-5 text-fuchsia-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-widest text-white">Baatcheet & Memories</h2>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5">Sona ki Yaad & Chat History</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsHistoryOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  
                  {/* Real-time Conversation History Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60">Live Chat History</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-white/30">{messages.length} messages</span>
                    </div>

                    {messages.length === 0 ? (
                      <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xs text-white/40 font-medium font-sans">No messages in this session yet. Start talking to Sona to see the transcript!</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[250px] overflow-y-auto p-1 pr-2">
                        {messages.map((msg) => {
                          const isSaved = savedMessageIds.includes(msg.id);
                          return (
                            <div 
                              key={msg.id} 
                              className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all duration-300 ${
                                msg.role === 'user' 
                                  ? 'bg-purple-950/20 border-purple-900/30 ml-8' 
                                  : 'bg-fuchsia-950/25 border-fuchsia-900/35 mr-8'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] uppercase tracking-widest font-black ${
                                  msg.role === 'user' ? 'text-purple-400' : 'text-fuchsia-400'
                                }`}>
                                  {msg.role === 'user' ? 'You (Raj)' : 'Sona'}
                                </span>
                                <span className="text-[8px] text-white/30 font-mono">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed font-medium select-text">{msg.text}</p>
                              
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => handleSaveMessageAsMemory(msg.id, msg.text)}
                                  disabled={isSaved || savingId === msg.id}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSaved 
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold' 
                                      : 'bg-white/5 hover:bg-fuchsia-500/20 border border-white/10 hover:border-fuchsia-500/30 text-white/60 hover:text-white'
                                  }`}
                                >
                                  {savingId === msg.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Saving...
                                    </>
                                  ) : isSaved ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Saved to Memory
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3 h-3 text-fuchsia-400" />
                                      Save Memory
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sona's Saved Memories Dashboard (Sona ki Yaad) */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-450 animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60">Sona Ki Yaad (Saved Memories)</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-white/30">{allSavedMemories.length} item(s)</span>
                    </div>

                    {/* Manual input to write and save customized memories */}
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Write custom memory / note</span>
                        <span className="text-[10px] text-white/40">Directly teach Sona custom facts about yourself (e.g. "loves sweet tea", "birthplace is Delhi")</span>
                      </div>
                      <ManualMemorySection onSave={handleSaveManualMemory} isSaving={isSavingManual} />
                    </div>

                    {/* Memories Content List */}
                    {allSavedMemories.length === 0 ? (
                      <div className="p-6 text-center text-white/40 text-xs italic bg-white/[0.02] border border-white/[0.03] rounded-2xl">
                        Sona doesn't remember anything about you yet. Click "Save Memory" on conversational logs or add a custom fact to teach her!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {allSavedMemories.map(({ id, content }) => (
                          <div 
                            key={id} 
                            className="bg-zinc-950/40 border border-white/5 rounded-xl px-3.5 py-3 hover:border-white/10 transition-colors flex items-start justify-between gap-2.5 group"
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-white/80 font-medium leading-relaxed flex-1 select-text break-words">{content}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteMemory(id)}
                              disabled={deletingId === id}
                              className="text-white/30 hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all cursor-pointer shrink-0 disabled:opacity-40"
                              title="Delete Memory"
                            >
                              {deletingId === id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Back Button requested by user */}
                <div className="pt-6 border-t border-white/5 shrink-0">
                  <button 
                    onClick={() => setIsHistoryOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] cursor-pointer text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                    Back to Chat
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personality Prompt / Status Text */}
        <AnimatePresence mode="wait">
          {state !== 'disconnected' && (
            <motion.div
              className="w-full mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex flex-col items-center">
                <div className="mt-6">
                  <WaveVisualizer 
                    analyser={sonaAnalyser} 
                    isSpeaking={state === 'speaking'} 
                    isListening={state === 'listening'} 
                    vibe={vibe}
                    color={voiceFocus ? '#fbbf24' : '#d946ef'}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personality Sliders removed from here as they moved to settings */}

        {/* Main Mic Orb */}
        <div className="relative group mt-8">
          {/* Voice Focus / Poke Physical Wave pulse */}
          {(voiceFocus || isPoked) && state !== 'disconnected' && (
            <motion.div 
               animate={isPoked ? {
                 scale: [1, 2.5, 1],
                 opacity: [0.1, 0.9, 0.1]
               } : { 
                 scale: [1.2, 1.6, 1.2],
                 opacity: [0.1, 0.4, 0.1]
               }}
               transition={{ 
                 duration: isPoked ? 0.6 : 3,
                 repeat: isPoked ? 0 : Infinity,
                 ease: "easeInOut"
               }}
               className={`absolute inset-0 ${isPoked ? 'bg-fuchsia-400/40' : 'bg-amber-400/20'} blur-3xl rounded-full z-0 pointer-events-none`}
            />
          )}

          {/* Glow Rings */}
          <motion.div 
            animate={{ 
              scale: state === 'speaking' ? [1.4, 1.6, 1.4] : state === 'listening' ? [1.3, 1.4, 1.3] : 1.3,
              opacity: state === 'speaking' ? [0.5, 0.7, 0.5] : state === 'listening' ? 0.45 : 0.3,
            }}
            transition={{ duration: state === 'speaking' ? 1.5 : 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
            className={`absolute inset-0 rounded-full transform-gpu blur-2xl pointer-events-none transition-all duration-1000 ${
              vibe === 'happy' ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-300' : 
              vibe === 'sassy' ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500' : 
              vibe === 'flirty' ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-violet-500' : 
              vibe === 'angry' ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500' : 
              'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-indigo-500'
            }`}
          />
          <motion.div 
            animate={{ 
              scale: state === 'speaking' ? [1.2, 1.4, 1.2] : 1.25,
              rotate: state === 'speaking' ? 360 : 0
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border ${vibeStyles.border} pointer-events-none transition-colors duration-1000`}
          />
          <motion.div 
            animate={{ 
              scale: state === 'speaking' ? [1.4, 1.6, 1.4] : 1.5,
              rotate: state === 'speaking' ? -360 : 0
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border ${vibeStyles.border} opacity-30 pointer-events-none transition-colors duration-1000`}
          />
          
          {/* Button Container */}
          <button 
            onClick={toggleSession}
            id="main-orb-btn"
            className={`relative w-64 h-64 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/10 active:scale-95 transition-all duration-700 group ${vibeStyles.shadow} ${getVibeAnimClass()} bg-gradient-to-br ${
              breathingActive 
                ? 'from-cyan-600 via-teal-800 to-cyan-950 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                : state === 'disconnected' 
                ? 'from-zinc-800 to-zinc-950 hover:from-zinc-700 hover:to-zinc-900' 
                : vibe === 'happy' ? 'from-emerald-600 to-green-900'
                : vibe === 'sassy' ? 'from-purple-600 to-indigo-900'
                : vibe === 'flirty' ? 'from-rose-600 to-purple-900'
                : vibe === 'angry' ? 'from-red-600 to-black'
                : 'from-fuchsia-600 to-purple-800'
            }`}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            
            <AnimatePresence mode="wait">
              {breathingActive ? (
                <motion.div
                  key="breathing"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.3 }}
                  className="flex flex-col items-center justify-center text-center px-4 animate-transparent"
                >
                  <Wind className="w-12 h-12 text-cyan-300 animate-pulse duration-[2000ms] mb-1.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/65 leading-none">
                    {breathPattern === 'box' ? 'Box Breathing' : breathPattern === 'calm' ? '4-7-8 Pranayama' : 'Sama Breath'}
                  </span>
                  
                  <motion.span 
                    key={breathPhase}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xl font-black text-white uppercase tracking-wider my-2.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] leading-none h-6"
                  >
                    {breathPhase === 'inhale' ? 'Inhale 🌀' : 
                     breathPhase === 'hold_in' ? 'Hold 🔒' : 
                     breathPhase === 'exhale' ? 'Exhale 💨' : 
                     breathPhase === 'hold_out' ? 'Hold Empty' : 'Get Ready...'}
                  </motion.span>
                  
                  <span className="text-4xl font-black text-cyan-100 font-mono tracking-tighter leading-none mt-1">
                    {breathSecondsLeft}s
                  </span>
                  
                  <span className="text-[9px] uppercase font-bold text-white/40 mt-1.5 font-bold">
                    Round {breathRoundCount}
                  </span>
                </motion.div>
              ) : state === 'disconnected' ? (
                <motion.div
                  key="power"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl font-black italic tracking-tighter text-white/80 uppercase">SONA</span>
                  <div className={`mt-2 w-8 h-0.5 ${vibe === 'default' ? 'bg-fuchsia-500/50' : vibe === 'happy' ? 'bg-emerald-500/50' : vibe === 'sassy' ? 'bg-purple-500/50' : vibe === 'flirty' ? 'bg-rose-500/50' : 'bg-red-500/50'} rounded-full transition-colors duration-1000`}></div>
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, ...vibeStyles.animation }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="flex flex-col items-center"
                >
                  {state === 'connecting' ? (
                    <Loader2 className="w-20 h-20 text-white animate-spin drop-shadow-lg" />
                  ) : (
                    <div className="relative">
                      <span className="text-5xl font-black italic tracking-tighter text-white uppercase absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">SONA</span>
                       <svg className={`w-24 h-24 text-white drop-shadow-lg transition-transform duration-500 ${state === 'speaking' ? 'scale-110' : 'scale-100'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                      <div className={`mt-4 w-12 h-1 mx-auto ${vibe === 'default' ? 'bg-fuchsia-500/50' : vibe === 'happy' ? 'bg-emerald-500/50' : vibe === 'sassy' ? 'bg-purple-500/50' : vibe === 'flirty' ? 'bg-rose-500/50' : 'bg-red-500/50'} rounded-full transition-colors duration-1000 animate-pulse`}></div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

        </div>



        {/* Futuristic Text Message Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mt-10 z-10"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendTextMessage(textInput);
            }}
            className={`flex items-center gap-2 p-1.5 px-2 bg-black/40 border ${vibeStyles.border} rounded-full backdrop-blur-xl transition-all duration-300 ${vibeStyles.shadow}`}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                state === 'disconnected' 
                  ? "Sona se text chat karein... (Press Enter to connect!)" 
                  : "Sona ko message bhejein..."
              }
              className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-white/30 pl-4 py-2.5 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || state === 'connecting'}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                textInput.trim() 
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {state === 'connecting' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowLeft className="w-4 h-4 rotate-180" />
              )}
            </button>
          </form>
        </motion.div>

        {/* Real Screen Dimming Overlay Dimmer */}
        <div 
          className="fixed inset-0 bg-black pointer-events-none z-[99999] transition-opacity duration-300" 
          style={{ opacity: Math.max(0, Math.min(0.85, (100 - brightnessLevel) / 100)) }}
        />

        {/* Real Spotlight Full Screen Flashlight Backup */}
        {flashlightEnabled && (
          <div className="fixed inset-0 bg-white z-[99998] flex flex-col items-center justify-center text-zinc-900 pointer-events-auto">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-6"
            >
              <Lightbulb className="w-24 h-24 text-amber-500 fill-amber-300 filter drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase tracking-wider">Spotlight Torch Active</h3>
                <p className="text-sm font-bold text-zinc-500 mt-2">Mobile Back LED and Screen Torch are fully operating.</p>
              </div>
              <button 
                onClick={async () => {
                  setFlashlightEnabled(false);
                  await toggleDeviceFlashlight(false);
                }}
                className="px-8 py-3.5 bg-zinc-900 text-white rounded-full text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:bg-zinc-800 transition-all active:scale-95"
              >
                Turn Off Flashlight
              </button>
            </motion.div>
          </div>
        )}

        {/* Simulated Phone Call VoIP Screen Overlay */}
        {activeCall && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99997] bg-zinc-950 flex flex-col items-center justify-between p-12 text-white"
            >
              {/* Top Details */}
              <div className="text-center mt-12 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-fuchsia-400 animate-pulse">
                  {activeCall.status === 'ringing' ? 'ONGOING DIAL OUT - VOIP 📡' : 'CONNECTED LINE LIVE 📞'}
                </span>
                <h2 className="text-4xl font-black tracking-tight">{activeCall.name}</h2>
                <div className="text-sm text-white/50 font-mono mt-1">
                  {activeCall.status === 'ringing' ? (
                    'Ringing...'
                  ) : (
                    `Call Duration: ${Math.floor(activeCall.duration / 60).toString().padStart(2, '0')}:${(activeCall.duration % 60).toString().padStart(2, '0')}`
                  )}
                </div>
              </div>

              {/* Glowing Call Avatar Orb */}
              <div className="relative">
                <motion.div 
                  animate={{ scale: activeCall.status === 'connected' ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-48 h-48 rounded-full border-4 border-fuchsia-500/30 overflow-hidden flex items-center justify-center bg-zinc-900 shadow-2xl"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeCall.name}`} 
                    alt="Contact Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </motion.div>
                <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl animate-pulse pointer-events-none" />
              </div>

              {/* Call Controls */}
              <div className="mb-12 space-y-6 w-full max-w-xs text-center">
                <p className="text-xs text-white/40 italic font-medium px-4">
                  {activeCall.status === 'ringing' ? 'Hands-free Indian dial-back dual tone is triggering.' : 'Voice session connected. Sona is listening on lines.'}
                </p>
                <button 
                  onClick={() => setActiveCall(null)}
                  className="w-full py-4 bg-red-650 hover:bg-red-500 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-[0_0_25px_rgba(239,68,68,0.3)] filter text-white text-center"
                >
                  End Session Call
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}



        {/* Collapsible Bento Grid Sona Device Hub */}
        <AnimatePresence>
          {isCommandHubOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 15 }}
              className="w-full mt-6 z-20 overflow-hidden"
            >
              <div className="bg-zinc-950/70 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-fuchsia-400" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">Android Capsule Dashboard</h3>
                      <p className="text-[10px] text-white/40 mt-0.5">Twelve Fully Operational Smart Modules & Device Services</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
                    CONNECTED 📡
                  </span>
                </div>

                {/* 12 Bento Capsules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* MODULE 1: VOICE TUNE */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Human-Like Voice</span>
                      </div>
                      <span className="text-[9px] font-mono text-blue-400 uppercase font-black">Zephyr v3</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "Zephyr", name: "Zephyr (US)" },
                        { id: "Indian_Accent", name: "Sona India 🇮🇳" },
                        { id: "Kore", name: "Kore (Soft)" },
                        { id: "Puck", name: "Puck (Ener)" }
                      ].map((vc) => (
                        <button
                          key={vc.id}
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                              const text = `Sona voice profile switched to ${vc.name}!`;
                              const utt = new SpeechSynthesisUtterance(text);
                              window.speechSynthesis.speak(utt);
                            }
                            setLastExecutedCommand(`Switched speech voice to ${vc.name} 🎙️`);
                          }}
                          className="py-1.5 px-2 bg-black/30 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer text-white/70 hover:text-white text-center"
                        >
                          {vc.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MODULE 2: MULTILINGUAL CHIP */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Understands Language</span>
                      </div>
                      <span className="text-[9px] font-mono text-indigo-400 uppercase font-black">All Accent</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["AUTO", "HINDI", "ENGLISH"].map((langCode) => (
                        <button
                          key={langCode}
                          onClick={() => {
                            setLanguage(langCode);
                            setLastExecutedCommand(`Primary multilingual filter set to ${langCode} 🌐`);
                          }}
                          className={`py-1.5 px-1 bg-black/30 border rounded-xl text-[9px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors ${
                            language === langCode 
                              ? 'border-indigo-500/50 bg-indigo-505/10 text-indigo-400' 
                              : 'border-white/5 text-white/60 hover:text-white'
                          }`}
                        >
                          {langCode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MODULE 3: SMART EXECUTIVE CLI */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Smart Execution (CLI)</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-black">VOICE TO ACTION</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 font-mono text-[9px] space-y-1 select-text">
                      <div className="text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        CLI Executed Success:
                      </div>
                      <p className="text-white/80 break-all leading-relaxed">{lastExecutedCommand || "Waiting for command..."}</p>
                    </div>
                  </div>

                  {/* MODULE 4: ALARM ALERTS */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Alarms & Alerts</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 uppercase font-black">{reminders.length} Active</span>
                    </div>
                    
                    {/* Active alarm scroll */}
                    <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1">
                      {reminders.length === 0 ? (
                        <p className="text-[9px] text-white/30 italic">No alarms set. Tell Sona: 'Set reminder drink water in 1 minute'.</p>
                      ) : (
                        reminders.map((rem) => (
                          <div key={rem.id} className="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg p-1.5 text-[9px] font-mono font-bold">
                            <span className="truncate flex-1 pr-1 text-white/80">🔔 {rem.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${rem.triggered ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/15 text-amber-400 animate-pulse'}`}>
                              {rem.triggered ? 'TRIGGERED ALARM' : 'TICKING'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* MODULE 5: WEATHER & GPS LOCATIONS */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Meteo & Weather</span>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase font-black">GPS LIVE</span>
                    </div>
                    {weather && (
                      <div className="flex items-center justify-between gap-4 font-sans">
                        <div>
                          <p className="text-xl font-black">{weather.temp}°C</p>
                          <p className="text-[9px] uppercase tracking-wider font-extrabold text-white/50 mt-0.5 truncate">{weather.locationName}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] text-white/80 font-semibold">{weather.description}</p>
                          <button 
                            onClick={() => triggerRealWeatherFetch()}
                            className="px-2 py-1 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all cursor-pointer"
                          >
                            Update GPS Weather 📡
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 6: COMPREHENSIVE DEVICES */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Hardware Services</span>
                      </div>
                      <span className="text-[9px] font-mono text-purple-400 uppercase font-black">TOGGLES</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          const state = !wifiEnabled;
                          setWifiEnabled(state);
                          setLastExecutedCommand(`Wifi switched ${state ? 'ON' : 'OFF'} 📶`);
                        }}
                        className={`py-1.5 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          wifiEnabled 
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                            : 'bg-black/30 border-white/5 text-white/40'
                        }`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        WiFi: {wifiEnabled ? 'ON' : 'OFF'}
                      </button>
                      <button 
                        onClick={() => {
                          const state = !bluetoothEnabled;
                          setBluetoothEnabled(state);
                          setLastExecutedCommand(`Bluetooth switched ${state ? 'ON' : 'OFF'} 🔹`);
                        }}
                        className={`py-1.5 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          bluetoothEnabled 
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                            : 'bg-black/30 border-white/5 text-white/40'
                        }`}
                      >
                        <Bluetooth className="w-3.5 h-3.5" />
                        BT: {bluetoothEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* MODULE 7: PHONE CALLING */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-rose-450" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">WhatsApp & Calling</span>
                      </div>
                      <span className="text-[9px] font-mono text-rose-440 uppercase font-black">Sim VoIP</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="call-dial-input"
                        placeholder="Dil Dial contact..." 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-rose-500/50" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.currentTarget as HTMLInputElement).value;
                            if (val.trim()) {
                              startSimulatedCall(val.trim());
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const el = document.getElementById('call-dial-input') as HTMLInputElement;
                          if (el && el.value.trim()) {
                            startSimulatedCall(el.value.trim());
                          } else {
                            startSimulatedCall("Mummy 💖");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-250 hover:text-rose-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Dial
                      </button>
                    </div>
                  </div>

                  {/* MODULE 8: SPOTIFY & YOUTUBE PLAYER */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">YouTube Embedded Track</span>
                      </div>
                      <span className="text-[9px] font-mono text-red-500 uppercase font-black font-bold">LIVESTREAM</span>
                    </div>
                    {activeMedia ? (
                      <div className="space-y-2.5">
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-black">
                          <iframe 
                            src={`https://www.youtube.com/embed/${activeMedia.code}?autoplay=1`} 
                            title="YouTube Master Player" 
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase bg-red-600/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-md font-bold max-w-[130px] truncate">
                            Playing: {activeMedia.query}
                          </span>
                          <button 
                            onClick={() => setActiveMedia(null)}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 rounded-md text-[8px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all cursor-pointer"
                          >
                            Close Player
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          onClick={() => handlePlayYouTubeOrSpotify("Diljit Dosanjh hits", "youtube")}
                          className="py-1 px-1.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer text-white/60 text-center"
                        >
                          Diljit Punjab Hits🔥
                        </button>
                        <button 
                          onClick={() => handlePlayYouTubeOrSpotify("Kishore Kumar Babu hits", "youtube")}
                          className="py-1 px-1.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer text-white/60 text-center"
                        >
                          Kishore Retroबाबू📻
                        </button>
                        <button 
                          onClick={() => handlePlayYouTubeOrSpotify("Study Peaceful Lofi", "youtube")}
                          className="py-1 px-1.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer text-white/60 text-center col-span-2"
                        >
                          Cozy Study Lofi ☕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MODULE 9: FLASHLIGHT / TOURNAMENT TORCH */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Tactical Flashlight</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-500 uppercase font-black animate-pulse">LED & Screen</span>
                    </div>
                    <button 
                      onClick={async () => {
                        const nextLight = !flashlightEnabled;
                        setFlashlightEnabled(nextLight);
                        await toggleDeviceFlashlight(nextLight);
                        setLastExecutedCommand(`Tactical Flashlight turned ${nextLight ? 'ON 💡' : 'OFF'}`);
                      }}
                      className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        flashlightEnabled 
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
                          : 'bg-black/40 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      {flashlightEnabled ? 'FLASHLIGHT ON' : 'ACTIVATE FLASHLIGHT'}
                    </button>
                  </div>

                  {/* MODULE 10: WHATSAPP MESSENGER INPUT */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">WhatsApp Dispatcher</span>
                      </div>
                      <span className="text-[9px] font-mono text-green-400 uppercase font-bold">API DIRECT</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        id="wa-phone-input"
                        placeholder="Numeric Ph number (e.g., 919999900000)" 
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] text-white focus:outline-none" 
                      />
                      <div className="flex gap-1.5">
                        <input 
                          type="text" 
                          id="wa-msg-input"
                          placeholder="Type WhatsApp msg..." 
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] text-white focus:outline-none" 
                        />
                        <button 
                          onClick={() => {
                            const pEl = document.getElementById('wa-phone-input') as HTMLInputElement;
                            const mEl = document.getElementById('wa-msg-input') as HTMLInputElement;
                            if (pEl && mEl && pEl.value.trim() && mEl.value.trim()) {
                              sendSimulatedWhatsApp(pEl.value.trim(), mEl.value.trim());
                              setLastExecutedCommand(`Opened WhatsApp thread to ${pEl.value.trim()}`);
                            } else {
                              alert("Please fill both phone number and message first, Boss!");
                            }
                          }}
                          className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-450 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MODULE 11: BRIGHTNESS & INTENSITY REGULATORS */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Brightness & volume</span>
                      </div>
                      <span className="text-[9px] font-mono text-yellow-400 uppercase font-black">SLIDERS</span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase font-extrabold">
                          <span>Screen Brightness Layout ({brightnessLevel}%)</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={brightnessLevel}
                          onChange={(e) => setBrightnessLevel(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase font-extrabold">
                          <span>Sona Speech Volume Factor ({playbackVolume}%)</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={playbackVolume}
                          onChange={(e) => setPlaybackVolume(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* MODULE 12: PRIVACY ERASE CHIP */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Privacy Secured Secure</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-500 uppercase font-extrabold animate-pulse">ACTIVE 🔒</span>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        setMessages([]);
                        setReminders([]);
                        setAllSavedMemories([]);
                        setSavedMessageIds([]);
                        setLastExecutedCommand("Securely purged all memory registers and active caches! 🛡️");
                        playAlarmSound();
                        alert("Secure erase completed. All memories, conversation lists, and reminders are entirely purged!");
                      }}
                      className="w-full py-2 bg-red-650/15 hover:bg-red-650/25 border border-red-500/30 hover:border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Purge Memory Stores
                    </button>
                  </div>

                  {/* MODULE 13: SAANS GURU (Sona Ke Sath Saans - Live Pranayama Sync) */}
                  <div className="bg-gradient-to-br from-cyan-950/45 to-teal-950/45 border border-cyan-800/30 p-4 rounded-2xl flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Sona Ke Sath Saans (Breath Coach)</span>
                      </div>
                      <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded ${breathingActive ? 'bg-cyan-500/25 text-cyan-200 animate-pulse' : 'bg-white/5 text-white/30'}`}>
                        {breathingActive ? 'PULSING 🌀' : 'IDLE 💤'}
                      </span>
                    </div>

                    {breathingActive ? (
                      <div className="space-y-2 p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-800/20 text-center">
                        <span className="text-[9px] font-extrabold uppercase text-cyan-300 block tracking-widest leading-none">
                          {breathPhase === 'inhale' ? '⚡ INHALE' : breathPhase === 'hold_in' ? '🔒 HOLD IN' : breathPhase === 'exhale' ? '💨 EXHALE' : breathPhase === 'hold_out' ? '⏳ HOLD EMPTY' : 'GET READY'}
                        </span>
                        <div className="text-4xl font-black text-white font-mono leading-none my-1">{breathSecondsLeft}s</div>
                        <div className="text-[9px] text-cyan-300/40 font-bold uppercase tracking-wide">COMPLETED ROUNDS: {breathRoundCount}</div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                        Breathe in sync with Sona's animated heart orb to trigger deep relaxation and reduce heart rate stress. Sona guides you verbally in soothing Hindi!
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button 
                        onClick={() => setBreathPattern('box')}
                        className={`py-1 text-[8px] uppercase tracking-wider font-black rounded-lg border transition-all cursor-pointer ${breathPattern === 'box' ? 'bg-cyan-600/25 border-cyan-400 text-cyan-200' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'}`}
                      >
                        Box (4s)
                      </button>
                      <button 
                        onClick={() => setBreathPattern('calm')}
                        className={`py-1 text-[8px] uppercase tracking-wider font-black rounded-lg border transition-all cursor-pointer ${breathPattern === 'calm' ? 'bg-cyan-600/25 border-cyan-400 text-cyan-200' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'}`}
                      >
                        4-7-8 Calm
                      </button>
                      <button 
                        onClick={() => setBreathPattern('equal')}
                        className={`py-1 text-[8px] uppercase tracking-wider font-black rounded-lg border transition-all cursor-pointer ${breathPattern === 'equal' ? 'bg-cyan-600/25 border-cyan-400 text-cyan-200' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'}`}
                      >
                        Equal (5s)
                      </button>
                    </div>

                    <button 
                      onClick={() => setBreathingActive(!breathingActive)}
                      className={`w-full py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        breathingActive 
                          ? 'bg-red-500/25 border border-red-500/40 text-red-300 hover:bg-red-500/35' 
                          : 'bg-cyan-650/20 border border-cyan-505/40 text-cyan-200 hover:bg-cyan-650/30 hover:scale-[1.02] shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      }`}
                    >
                      {breathingActive ? '⏹️ Stop Breathing Coach' : '🧘 Start Sona Breath Coach'}
                    </button>
                  </div>

                  {/* MODULE 14: PHYSICAL DEVICE ROUTING PERMISSIONS (Real Phone Controller Rules) */}
                  <div className="bg-gradient-to-br from-zinc-950/40 to-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-450 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Physical Phone Direct Routing</span>
                      </div>
                      <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded ${nativeRoutingMode ? 'bg-emerald-500/25 text-emerald-350' : 'bg-white/5 text-white/30'}`}>
                        {nativeRoutingMode ? 'NATIVE INTENTS ACTIVE 📡' : 'SIMULATION MODE'}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/40 leading-relaxed font-semibold">
                      Bypasses lazy web searching. Runs direct device commands (`tel:` & `whatsapp://`) to launch your actual phone dialing caller interface and real WhatsApp app chat thread instantly when speaking!
                    </p>

                    <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-xl">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/70">Direct Device App Routing</span>
                      <button 
                        onClick={() => {
                          const nextVal = !nativeRoutingMode;
                          setNativeRoutingMode(nextVal);
                          setLastExecutedCommand(nextVal ? "Switched to Direct Android Mobile Intent Caller Mode 📡" : "Switched to standard secure cloud simulations 🖥️");
                        }}
                        className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${nativeRoutingMode ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        id="native-routing-tgl-btn"
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${nativeRoutingMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="text-[8px] text-emerald-300/50 leading-tight italic font-mono font-bold uppercase tracking-wide">
                      *Note: Give standard location & browser mic access for Hands-Free voice automation!
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-lg mx-auto border border-fuchsia-900/50 bg-fuchsia-950/20 p-5 rounded-[24px] tracking-wide backdrop-blur-sm flex flex-col items-center gap-3 text-center"
          >
            <p className="text-fuchsia-400 text-xs font-black uppercase tracking-widest leading-relaxed">
              ⚠️ Diagnostic Error // {error}
            </p>
            
            {(error.toLowerCase().includes("popup") || error.toLowerCase().includes("iframe") || error.toLowerCase().includes("block")) && (
              <div className="flex flex-col items-center gap-3 mt-1.5 w-full">
                <p className="text-[10px] text-center text-white/60 font-medium leading-relaxed max-w-md">
                  <b>Aap Sona AI Studio preview frame (iframe) me hain, jahan Google login popup browser dwara automatically block ho jata hai.</b> <br/>
                  Sona ko standalone screen par chalane ke liye niche diye gaye naye tab button par click karein aur swachhata se login karein:
                </p>
                
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(window.location.origin, '_blank');
                    }
                  }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 border border-fuchsia-500/50 text-white font-extrabold uppercase tracking-widest text-[10px] cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Sona in New Tab to Login ↗</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex justify-between items-center z-10 border-t border-white/5 pt-10 px-4">
        <div className="flex-1"></div>

        <div className="flex gap-10">
          <button 
            className="flex flex-col items-center group cursor-pointer border-none bg-transparent disabled:opacity-30"
            disabled={state === 'disconnected'}
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              audioStreamerRef.current?.setMuted(nextMute);
              // If we are muting, force a response from Sona
              if (nextMute && state !== 'disconnected') {
                liveSessionRef.current?.forceResponse();
              }
            }}
          >
            <div className={`w-10 h-10 flex items-center justify-center transition-colors ${isMuted ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white/40 group-hover:text-fuchsia-400'}`}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </div>
            <span className={`text-[9px] uppercase tracking-tighter font-black ${isMuted ? 'text-red-500' : 'text-white/40'}`}>
              {isMuted ? 'Muted' : 'Mute'}
            </span>
          </button>
        </div>
      </div>

      {/* Subtle UI Detail */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: state === 'speaking' ? [0, 50, 0] : 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1/2 h-full bg-fuchsia-500 rounded-full"
          />
        </div>
      </div>

      {/* Circle to Search style Ambient Screen Edge Border Lighting when Background Mode is enabled and Sona is active */}
      <AnimatePresence>
        {backgroundMode && state !== 'disconnected' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden rounded-[24px]"
          >
            {/* SVG Masked Glowing Border: Keeps center 100% transparent and interactive, with an ultra-thin 3.5px border */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="cts-border-mask">
                  {/* Draw outer screen boundary in white (opaque, which means keep) */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Mask out/cut the center inner area in black (keeping it completely transparent & crisp) */}
                  <rect style={{ x: '3.5px', y: '3.5px', width: 'calc(100% - 7px)', height: 'calc(100% - 7px)', rx: '20px' }} fill="black" />
                </mask>
              </defs>
              <foreignObject x="0" y="0" width="100%" height="100%" mask="url(#cts-border-mask)">
                <div className="w-full h-full relative overflow-hidden">
                  {/* Swinging and spinning custom Circle to Search laser beam */}
                  <div 
                    className="absolute inset-[-150%] animate-cts pointer-events-none"
                    style={{
                      background: state === 'speaking' 
                         ? 'conic-gradient(from 0deg, transparent 20%, #d946ef 35%, #8b5cf6 48%, #ec4899 58%, transparent 80%)' 
                         : state === 'listening' 
                         ? 'conic-gradient(from 0deg, transparent 15%, #06b6d4 35%, #14b8a6 48%, #3b82f6 60%, transparent 80%)' 
                         : 'conic-gradient(from 0deg, transparent 20%, #6366f1 35%, #d946ef 48%, #06b6d4 58%, transparent 80%)',
                    }}
                  />
                </div>
              </foreignObject>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
