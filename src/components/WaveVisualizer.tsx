import { useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isListening: boolean;
  color?: string;
  vibe?: string;
}

export function WaveVisualizer({ analyser, isSpeaking, isListening, color = '#d946ef', vibe = 'default' }: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const volumeDataRef = useRef(new Uint8Array(128));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use higher internal resolution for absolute retina-grade crispiness without lag
    const dpr = window.devicePixelRatio || 1;
    const width = 600;
    const height = 140;
    
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);

    let animationId: number;

    const render = () => {
      let volume = 0;
      if (analyser) {
        if (volumeDataRef.current.length !== analyser.frequencyBinCount) {
          volumeDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(volumeDataRef.current);
        let sum = 0;
        for (let i = 0; i < volumeDataRef.current.length; i++) {
          sum += volumeDataRef.current[i];
        }
        volume = sum / volumeDataRef.current.length;
      }

      ctx.clearRect(0, 0, width, height);

      // Organic wave algorithm
      const numberOfWaves = 4; // Add an extra harmonic layer for beautiful complexity
      const baseAmplitude = isSpeaking ? 28 : isListening ? 12 : 3;
      const amplitude = baseAmplitude + (volume * 0.95);
      
      phaseRef.current += isSpeaking ? 0.05 : isListening ? 0.02 : 0.008;

      // Construct dynamic linear gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (vibe === 'happy') {
        gradient.addColorStop(0, '#10b981'); // Emerald
        gradient.addColorStop(0.35, '#2dd4bf'); // Teal
        gradient.addColorStop(0.7, '#facc15'); // Yellow
        gradient.addColorStop(1, '#a7f3d0'); // Emerald ultra-light
      } else if (vibe === 'sassy') {
        gradient.addColorStop(0, '#c084fc'); // Purple light
        gradient.addColorStop(0.35, '#db2777'); // Pink deep
        gradient.addColorStop(0.7, '#3b82f6'); // Indigo / Blue
        gradient.addColorStop(1, '#22d3ee'); // Cyan
      } else if (vibe === 'flirty') {
        gradient.addColorStop(0, '#fb7185'); // Rose
        gradient.addColorStop(0.35, '#ec4899'); // Pink
        gradient.addColorStop(0.7, '#f97316'); // Orange
        gradient.addColorStop(1, '#f43f5e'); // Crimson
      } else if (vibe === 'angry') {
        gradient.addColorStop(0, '#dc2626'); // Red
        gradient.addColorStop(0.3, '#7f1d1d'); // Dark Red
        gradient.addColorStop(0.7, '#ea580c'); // Orange
        gradient.addColorStop(1, '#450a0a'); // Dark crimson
      } else {
        gradient.addColorStop(0, '#d946ef'); // Fuchsia
        gradient.addColorStop(0.35, '#3b82f6'); // Indigo
        gradient.addColorStop(0.7, '#06b6d4'); // Cyan
        gradient.addColorStop(1, '#8b5cf6'); // Violet
      }

      ctx.shadowBlur = isSpeaking ? 16 : isListening ? 10 : 4;
      ctx.shadowColor = vibe === 'happy' ? '#10b981' :
                         vibe === 'sassy' ? '#db2777' :
                         vibe === 'flirty' ? '#ec4899' :
                         vibe === 'angry' ? '#dc2626' :
                         '#d946ef';

      for (let i = 0; i < numberOfWaves; i++) {
        ctx.beginPath();
        // Stagger line widths for maximum sensory depth
        ctx.lineWidth = i === 0 ? 3.5 : i === 1 ? 2.2 : 0.8;
        
        ctx.globalAlpha = i === 0 ? 0.95 : i === 1 ? 0.65 : 0.35;
        ctx.strokeStyle = gradient;
        
        const wavePhase = phaseRef.current + (i * Math.PI / 2.5);
        
        for (let x = 0; x < width; x++) {
          const relativeX = x / width;
          // Sine wave with a touch of extra harmonious frequency modulation
          const y = height / 2 + 
            Math.sin(relativeX * 5.5 + wavePhase) * amplitude * Math.sin(relativeX * Math.PI) +
            Math.sin(relativeX * 11 + wavePhase * 1.35) * (amplitude / 3.2) * Math.sin(relativeX * Math.PI) +
            Math.sin(relativeX * 16.5 - wavePhase * 0.8) * (amplitude / 6) * Math.sin(relativeX * Math.PI);
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Reset styles for safe next iterate
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [analyser, isSpeaking, isListening, color, vibe]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', maxWidth: '440px', height: '110px' }}
      className="opacity-95 select-none touch-none pointer-events-none filter drop-shadow-[0_0_12px_rgba(255,255,255,0.05)]"
    />
  );
}
