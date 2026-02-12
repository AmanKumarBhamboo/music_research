import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      setAudioBlob(null); // Clear previous recording
      const streamData = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(streamData);
      
      mediaRecorderRef.current = new MediaRecorder(streamData);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // or audio/wav via external lib, usually webm is default
        setAudioBlob(blob);
        // Stop all tracks to release microphone
        streamData.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Could allow passing an onError callback
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    stream // Exposed for visualizer
  };
};
