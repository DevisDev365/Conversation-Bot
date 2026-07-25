import React, { useEffect, useRef } from 'react';
import { DialectMode } from '../types';

interface AudioVisualizerProps {
  volume: number;
  isAiSpeaking: boolean;
  isListening: boolean;
  dialect: DialectMode;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  volume,
  isAiSpeaking,
  isListening,
  dialect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const amplitude = isAiSpeaking
        ? Math.max(0.3, volume * 2.5)
        : isListening
        ? Math.max(0.15, volume * 1.8)
        : 0.05;

      phase += isAiSpeaking ? 0.08 : 0.04;

      // Color scheme based on Natural Tones
      const primaryColor = 'rgba(212, 163, 115, '; // Terracotta #D4A373
      const secondaryColor =
        dialect === 'indian' ? 'rgba(204, 213, 174, ' : 'rgba(45, 41, 38, '; // Olive #CCD5AE or Charcoal

      // Draw 3 layered sine waves
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.lineWidth = wave === 0 ? 3.5 : 1.8;

        const colorBase = wave % 2 === 0 ? primaryColor : secondaryColor;
        const opacity = (0.85 - wave * 0.2).toFixed(2);
        ctx.strokeStyle = `${colorBase}${opacity})`;

        const centerY = height / 2;
        const frequency = 0.025 + wave * 0.008;

        for (let x = 0; x < width; x++) {
          const distanceToCenter = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * frequency + phase + wave) *
              amplitude *
              60 *
              distanceToCenter;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [volume, isAiSpeaking, isListening, dialect]);

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-3xl bg-[#F5F2E9]/80 border border-[#E6E2D3] shadow-inner">
      <canvas
        ref={canvasRef}
        width={600}
        height={128}
        className="w-full h-full"
      />
      
      {/* Central Visual Glow Ring */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isAiSpeaking || isListening ? 'opacity-100' : 'opacity-40'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(212,163,115,0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
