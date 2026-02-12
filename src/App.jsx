import { useState, useEffect } from 'react'
import { Mic, Square, Music } from 'lucide-react'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import AudioVisualizer from './components/AudioVisualizer'
import { identifyTrack } from './services/shazamService'

function App() {
  const { isRecording, startRecording, stopRecording, audioBlob, stream } = useAudioRecorder();
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      // handleIdentify will be triggered by useEffect when audioBlob is ready
    } else {
      await startRecording();
      setResult(null);
    }
  };

  useEffect(() => {
    if (!isRecording && audioBlob) {
      handleIdentify();
    }
  }, [audioBlob, isRecording]);

  const handleIdentify = async () => {
    if (!audioBlob) return;
    
    setIsRecognizing(true);
    setResult(null);
    try {
        const data = await identifyTrack(audioBlob, apiKey);
        console.log("API Response:", data);
        
        if (data && data.track) {
            setResult({
                title: data.track.title,
                subtitle: data.track.subtitle,
                image: data.track.images?.coverart || data.track.images?.background
            });
        } else {
             // Sometimes no match found
             alert("No match found. Try again.");
        }
    } catch (error) {
        console.error(error);
        alert("Error identifying song. Check console/API Key.");
    } finally {
        setIsRecognizing(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-neutral-950 text-white selection:bg-pink-500/30">
        
      {/* Header / Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Music className="w-6 h-6 text-pink-500" />
        <span className="font-bold text-lg tracking-tight">MusicIdentify</span>
      </div>

      <div className="max-w-md w-full flex flex-col items-center gap-12">
        
        {/* Main Action Area */}
        <div className="relative group">
          {isRecording && (
             <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          )}
          
          <button 
            onClick={handleToggleRecording}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110' 
                : 'bg-neutral-900 border border-neutral-800 hover:border-pink-500/50 hover:shadow-[0_0_30px_-5px_var(--color-pink-500)]'
            }`}
          >
            {isRecording ? (
                <Square className="w-12 h-12 text-white fill-current" />
            ) : (
                <Mic className="w-12 h-12 text-pink-500" />
            )}
          </button>
        </div>

        {/* Status / Visualizer */}
        <div className="h-24 w-full flex items-center justify-center">
            {isRecording ? (
                <div className="w-full">
                    <p className="text-pink-400 font-medium mb-4 animate-pulse">Listening...</p>
                    <AudioVisualizer stream={stream} isRecording={isRecording} />
                </div>
            ) : isRecognizing ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-400">Identifying...</p>
                </div>
            ) : result ? (
                 <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 w-full animate-in fade-in slide-in-from-bottom-4 flex items-center gap-4 text-left">
                    {result.image && (
                        <img src={result.image} alt="Album Art" className="w-16 h-16 rounded-lg object-cover shadow-lg" />
                    )}
                    <div>
                        <h3 className="font-bold text-xl leading-tight">{result.title}</h3>
                        <p className="text-pink-400 font-medium">{result.subtitle}</p>
                    </div>
                 </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                        Tap to Identify
                    </h1>
                    <p className="mt-2 text-neutral-500 text-sm">
                        Make sure your microphone is accessible
                    </p>
                </div>
            )}
        </div>

        {/* API Key Input (Temporary) */}
        {!apiKey && (
            <div className="mt-8 w-full max-w-xs">
                <input 
                    type="password" 
                    placeholder="Enter RapidAPI Key" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-center focus:border-pink-500 outline-none transition-colors"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
        )}
      </div>
    </div>
  )
}

export default App
