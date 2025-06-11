import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProgressStore } from '../store/progressStore';
import { Play, Pause, Volume2, VolumeX, X, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/Button';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c6b70540d6.mp3' },
  { id: 'forest', name: 'Forest', url: 'https://cdn.pixabay.com/download/audio/2021/10/06/audio_b89ce9ca0e.mp3' },
  { id: 'waves', name: 'Ocean', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1b4e6df4c.mp3' },
  { id: 'white-noise', name: 'White Noise', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1b4e6df4c.mp3' }
];

const MOTIVATIONAL_QUOTES = [
  "Deep work is the superpower of the 21st century.",
  "Focus is the new IQ in the age of information.",
  "The only way to do great work is to love what you do.",
  "Quality over quantity. Always.",
  "Small steps, consistently taken, create massive results."
];

interface FocusModeProps {
  taskId?: string;
  onExit?: () => void;
}

export function FocusMode({ taskId, onExit }: FocusModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [quote, setQuote] = useState('');
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const task = useTaskStore(state => state.tasks.find(t => t.id === taskId));
  const { addXP } = useProgressStore();

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        resetTimer();
      } else if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            handleTimerComplete();
          } else {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(prev => prev - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerMinutes, timerSeconds]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      addXP(50);
      toast.success('Great work! Time for a break!');
      setIsBreak(true);
      setTimerMinutes(5);
    } else {
      toast.success('Break complete! Ready to focus again?');
      setIsBreak(false);
      setTimerMinutes(25);
    }
    setTimerSeconds(0);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerMinutes(isBreak ? 5 : 25);
    setTimerSeconds(0);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
      if (sound && audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        audioRef.current.play();
        setActiveSound(soundId);
      }
    }
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now().toString(), text: '', done: false }]);
  };

  const updateChecklistItem = (id: string, text: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const progress = ((25 - (timerMinutes + timerSeconds / 60)) / 25) * 100;

  return (
    <div
      ref={containerRef}
      className={`bg-gray-50 dark:bg-gray-900 min-h-screen transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">
            {task?.title || 'Focus Mode'}
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="dark:text-gray-300"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </Button>
            {onExit && (
              <Button
                variant="outline"
                onClick={onExit}
                className="text-red-500 hover:text-red-600 hover:border-red-500"
              >
                <X size={20} className="mr-2" />
                Exit Focus Mode
              </Button>
            )}
          </div>
        </div>

        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-blue-500"
              strokeWidth="8"
              fill="none"
              strokeDasharray="553"
              strokeDashoffset={553 - (553 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-mono dark:text-white">
              {`${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? 'outline' : 'primary'}
            className="w-32"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            <span className="ml-2">{isRunning ? 'Pause' : 'Start'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={resetTimer}
            className="w-32"
          >
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Ambient Sounds</h2>
          <div className="grid grid-cols-2 gap-3">
            {AMBIENT_SOUNDS.map(sound => (
              <Button
                key={sound.id}
                variant={activeSound === sound.id ? 'primary' : 'outline'}
                onClick={() => toggleSound(sound.id)}
                className="w-full"
              >
                {activeSound === sound.id ? (
                  <Volume2 size={18} className="mr-2" />
                ) : (
                  <VolumeX size={18} className="mr-2" />
                )}
                {sound.name}
              </Button>
            ))}
          </div>
          {activeSound && (
            <div className="space-y-2">
              <label className="block text-sm font-medium dark:text-gray-300">
                Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (audioRef.current) {
                    audioRef.current.volume = newVolume;
                  }
                }}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white">Checklist</h2>
            <Button variant="outline" onClick={addChecklistItem}>
              Add Item
            </Button>
          </div>
          <div className="space-y-2">
            {checklist.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex-shrink-0"
                >
                  <CheckCircle
                    size={20}
                    className={item.done ? 'text-green-500' : 'text-gray-300'}
                  />
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                  className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-white"
                  placeholder="Enter task..."
                />
              </div>
            ))}
          </div>
        </div>

        <blockquote className="text-center italic text-gray-600 dark:text-gray-400 border-l-4 border-blue-500 pl-4">
          {quote}
        </blockquote>

        <audio ref={audioRef} />
      </div>
    </div>
  );
}