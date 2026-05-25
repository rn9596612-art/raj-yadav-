
export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private inputSampleRate = 16000;
  private outputSampleRate = 24000;
  private micStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onAudioInput: (base64Audio: string) => void;
  private onSilence?: () => void;
  private nextStartTime = 0;
  private isMuted = false;
  private volume = 0.5; // Even lower default gain
  private silenceThreshold = 0.005; // Lower threshold to detect speech faster
  private activeSources: AudioBufferSourceNode[] = [];
  private silenceFrames = 0;
  private userHasSpoken = false;
  private voiceEnhancer = true;
  private fastReplyMode = false;
  private micSensitivity = 6; // Range: 1 (Very noisy room / Heavy noise gate) to 10 (Quiet room / High sensitivity)
  private speakToReplyOnly = true; // Default true as requested, Sona speaks only on user's real voice
  private noiseFloor = 0.002; // Dynamic background noise gate
  private startTime = 0; // Capture connection timestamp to prevent static on start
  public speakerVolume = 85; // Default speech volume
  
  public onAcousticEvent?: (event: 'cough' | 'heavy_breathing' | 'crying') => void;
  private acousticTracker = {
    lastEventTime: 0,
    coughTriggered: false,
    breathFrames: 0,
    cryFrames: 0,
    continuousRmsHistory: [] as number[],
  };

  private bgAudioElement: HTMLAudioElement | null = null;
  private isBgPlaying = false;

  constructor(onAudioInput: (base64Audio: string) => void, onSilence?: () => void) {
    this.onAudioInput = onAudioInput;
    this.onSilence = onSilence;
  }

  private createSilentAudioBlobUrl(): string {
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 8;
    const duration = 1; // 1 second
    
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = duration * byteRate;
    const chunkSize = 36 + dataSize;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, chunkSize, true);
    // WAVE identifier
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // FMT sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // Data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);
    
    // Fill silence (8-bit PCM silence is 128)
    for (let i = 0; i < dataSize; i++) {
      view.setUint8(44 + i, 128);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  startBgSilentPlayer() {
    if (this.bgAudioElement) return;
    try {
      const audioUrl = this.createSilentAudioBlobUrl();
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.01;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      
      audio.play().then(() => {
        this.isBgPlaying = true;
        console.log("Persistent audio keepalive loop started.");
      }).catch(err => {
        console.warn("Auto-play permission required or failed for persistent silent audio loop:", err);
      });
      
      this.bgAudioElement = audio;
    } catch (e) {
      console.error("Error creating baseline quiet tracker:", e);
    }
  }

  stopBgSilentPlayer() {
    if (this.bgAudioElement) {
      try {
        this.bgAudioElement.pause();
        this.bgAudioElement.src = "";
        this.bgAudioElement = null;
        this.isBgPlaying = false;
        console.log("Background quiet tracker stopped.");
      } catch (e) {
        console.error("Error cleaning up baseline silent audio loop:", e);
      }
    }
  }

  setVoiceEnhancer(enabled: boolean) {
    this.voiceEnhancer = enabled;
  }

  setFastReplyMode(enabled: boolean) {
    this.fastReplyMode = enabled;
  }

  setMicSensitivity(value: number) {
    this.micSensitivity = Math.max(1, Math.min(10, value));
  }

  setSpeakToReplyOnly(enabled: boolean) {
    this.speakToReplyOnly = enabled;
  }

  resetSilenceDetection() {
    this.userHasSpoken = false;
    this.silenceFrames = 0;
  }

  async start() {
    this.startTime = Date.now();
    this.audioContext = new AudioContext({ sampleRate: this.inputSampleRate });
    this.startBgSilentPlayer();
    
    this.micStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: this.inputSampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false, // Pure manual gain for clarity
      } 
    });

    this.source = this.audioContext.createMediaStreamSource(this.micStream);
    
    // Apply real-time vocal enhancement pipeline if enabled
    let lastNode: AudioNode = this.source;
    if (this.voiceEnhancer) {
      // 1. High-Pass filter: filters out low-frequency noise (AC hum, desk rumble, laptop fans) < 120Hz
      const hpFilter = this.audioContext.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(120, this.audioContext.currentTime);

      // 2. Vocal Presence Boost peaking filter: enhances frequencies around 2.2 kHz (where vocals are clearest)
      const presenceFilter = this.audioContext.createBiquadFilter();
      presenceFilter.type = 'peaking';
      presenceFilter.frequency.setValueAtTime(2200, this.audioContext.currentTime);
      presenceFilter.Q.setValueAtTime(1.2, this.audioContext.currentTime);
      presenceFilter.gain.setValueAtTime(4.0, this.audioContext.currentTime); // +4dB boost

      // 3. Dynamics Compressor: levels the vocals, making faint whispering louder and louder sounds safe
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(8, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(4.0, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.005, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.20, this.audioContext.currentTime);

      lastNode.connect(hpFilter);
      hpFilter.connect(presenceFilter);
      presenceFilter.connect(compressor);
      lastNode = compressor;
    }

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 2.5; // Balanced gain for clarity without clipping
    lastNode.connect(this.gainNode);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    // 2048 buffer size for better stability vs latency trade-off
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

    // silence trigger count: ~1.5s (12 frames) normally, ~640ms (5 frames) if Fast Reply is enabled
    this.processor.onaudioprocess = (e) => {
      if (this.isMuted) return;
      const inputData = e.inputBuffer.getChannelData(0);
      
      const currentSilenceTriggerCount = this.fastReplyMode ? 5 : 12;

      // Calculate dynamic thresholds based on micSensitivity property (1 equals extremely filtered, 10 equals highly sensitive)
      const sensFactor = 11 - this.micSensitivity;
      const rmsSpeechThreshold = 0.007 * Math.pow(sensFactor, 1.25);
      const rmsSilenceThreshold = rmsSpeechThreshold * 0.45;

      // Calculate buffer energy (RMS) to determine speech vs silence
      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < inputData.length; i++) {
        const absVal = Math.abs(inputData[i]);
        if (absVal > peak) peak = absVal;
        sumSquares += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sumSquares / inputData.length);

      // Acoustic Event Detection (Coughs, Heavy breathing, Crying)
      const now = Date.now();
      const hasWarmingUpEnded = (now - this.startTime > 8000);
      if (this.onAcousticEvent && hasWarmingUpEnded && (now - this.acousticTracker.lastEventTime > 5000)) {
        const crestFactor = rms > 0 ? (peak / rms) : 0;

        // Fetch frequency spectrum features from analyzer if available
        let highFreqSum = 0;
        let lowFreqSum = 0;
        if (this.analyser) {
          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          this.analyser.getByteFrequencyData(dataArray);
          // High frequencies (1k-4kHz) vs Low frequencies (0-400Hz)
          for (let i = 0; i < 6; i++) lowFreqSum += dataArray[i];
          for (let i = 16; i < 64; i++) highFreqSum += dataArray[i];
        }

        // 1. Coughing (Khasna) Detection
        // Sudden extremely loud explosive peak with large energy and steep rise
        if (peak > 0.85 && rms > 0.22 && crestFactor > 5.5) {
          this.acousticTracker.lastEventTime = now;
          this.acousticTracker.breathFrames = 0;
          this.acousticTracker.cryFrames = 0;
          this.onAcousticEvent('cough');
        }
        // 2. Heavy Breathing (Jyada sans lena) or Sighing Detection
        // Slower continuous low-to-mid wind patterns with minimal articulation spikes
        else if (rms > 0.038 && rms < 0.12 && peak < 0.28) {
          let hasWindSpectralProfile = false;
          if (this.analyser) {
            // Wind profile populates mid-high bounds relatively higher compared to harmonic speech peaks
            if (highFreqSum > lowFreqSum * 0.7 && highFreqSum > 300) {
              hasWindSpectralProfile = true;
            }
          } else {
            // Fallback to simple RMS continuity
            hasWindSpectralProfile = true;
          }

          if (hasWindSpectralProfile) {
            this.acousticTracker.breathFrames++;
            if (this.acousticTracker.breathFrames >= 7) { // ~1 second of steady air flow
              this.acousticTracker.breathFrames = 0;
              this.acousticTracker.lastEventTime = now;
              this.onAcousticEvent('heavy_breathing');
            }
          } else {
            this.acousticTracker.breathFrames = Math.max(0, this.acousticTracker.breathFrames - 1);
          }
        }
        // 3. Crying (Rou) / Trembling weeps
        // Characterized by continuous wave of trembling energy
        else if (rms > 0.065 && rms < 0.22 && peak < 0.42) {
          this.acousticTracker.continuousRmsHistory.push(rms);
          if (this.acousticTracker.continuousRmsHistory.length > 8) {
            this.acousticTracker.continuousRmsHistory.shift();
          }

          if (this.acousticTracker.continuousRmsHistory.length === 8) {
            let trembleCount = 0;
            for (let i = 1; i < 8; i++) {
              const diff = Math.abs(this.acousticTracker.continuousRmsHistory[i] - this.acousticTracker.continuousRmsHistory[i - 1]);
              if (diff > 0.012) trembleCount++;
            }

            if (trembleCount >= 5) {
              this.acousticTracker.cryFrames++;
              if (this.acousticTracker.cryFrames >= 3) { // Consistent sobbing fluctuations
                this.acousticTracker.cryFrames = 0;
                this.acousticTracker.continuousRmsHistory = [];
                this.acousticTracker.lastEventTime = now;
                this.onAcousticEvent('crying');
              }
            } else {
              this.acousticTracker.cryFrames = Math.max(0, this.acousticTracker.cryFrames - 1);
            }
          }
        } else {
          this.acousticTracker.breathFrames = Math.max(0, this.acousticTracker.breathFrames - 1);
          this.acousticTracker.cryFrames = Math.max(0, this.acousticTracker.cryFrames - 1);
        }
      }

      // Dynamically track the room's noise floor during silence / near-silence
      if (rms < 0.012) {
        this.noiseFloor = this.noiseFloor * 0.985 + rms * 0.015;
      }

      // Speech detection: did the user genuinely speak (VAD check)?
      let isPeakSpeech = false;
      if (this.speakToReplyOnly) {
        // Require rms to exceed threshold and exceed room noise floor distinctly
        isPeakSpeech = rms > Math.max(rmsSpeechThreshold * 1.5, this.noiseFloor * 2.8);
      } else {
        isPeakSpeech = rms > rmsSpeechThreshold;
      }

      if (isPeakSpeech) {
        this.userHasSpoken = true;
      }

      // Silence detection (only count silence if we have detected speech in this turn first)
      if (rms < rmsSilenceThreshold) {
        this.silenceFrames++;
        if (this.silenceFrames >= currentSilenceTriggerCount) {
          if (this.userHasSpoken) {
            this.onSilence?.();
            this.resetSilenceDetection();
          } else {
            // Clamping to avoid indefinite overflow
            this.silenceFrames = currentSilenceTriggerCount;
          }
        }
      } else {
        this.silenceFrames = 0;
      }

      const pcm16 = this.float32ToPcm16(inputData);
      const base64 = this.arrayBufferToBase64(pcm16.buffer);
      this.onAudioInput(base64);
    };

    this.gainNode.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    
    // Connect to analyzer for silence detection / visualization
    this.source.connect(this.analyser);
    
    this.nextStartTime = this.audioContext.currentTime;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  setSpeakerVolume(value: number) {
    this.speakerVolume = Math.max(0, Math.min(100, value));
  }

  stop() {
    this.stopPlayback();
    this.stopBgSilentPlayer();
    this.micStream?.getTracks().forEach(track => track.stop());
    this.source?.disconnect();
    this.processor?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
  }

  stopPlayback() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources = [];
    this.nextStartTime = this.audioContext?.currentTime || 0;
  }

  async playAudio(base64Audio: string) {
    if (!this.audioContext) return;

    const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
    const pcm16 = new Int16Array(arrayBuffer);
    const float32 = this.pcm16ToFloat32(pcm16);

    // Apply speech playback speakerVolume scaling
    const volMultiplier = this.speakerVolume / 100;
    for (let i = 0; i < float32.length; i++) {
      float32[i] *= volMultiplier;
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32.length, this.outputSampleRate);
    audioBuffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    if (this.analyser) {
      source.connect(this.analyser);
    }

    // Track active sources to stop them on interruption
    this.activeSources.push(source);
    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);
    };

    // Schedule playback for gapless streaming
    const startTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;
  }

  private float32ToPcm16(float32: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16;
  }

  private pcm16ToFloat32(pcm16: Int16Array): Float32Array {
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 0x8000;
    }
    return float32;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}
