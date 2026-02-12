import { useEffect, useRef } from 'react';

const AudioVisualizer = ({ stream, isRecording }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) return;

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    // Create analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Create source
    if (sourceRef.current) {
        sourceRef.current.disconnect();
    }
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down

        // Gradient color based on frequency
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#ec4899'); // Pink
        gradient.addColorStop(1, '#8b5cf6'); // Violet

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Don't close context aggressively to allowing restarting, 
      // but usually good practice to close if component unmounts for good.
      // Here we keep it mostly.
    };
  }, [stream, isRecording]);

  // Clean up context on unmount
  useEffect(() => {
    return () => {
         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close();
             audioContextRef.current = null;
         }
    }
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        width={300} 
        height={100} 
        className="w-full max-w-xs h-24 rounded-lg"
    />
  );
};

export default AudioVisualizer;
