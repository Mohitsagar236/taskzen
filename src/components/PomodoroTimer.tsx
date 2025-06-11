import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Zap, Trophy } from 'lucide-react';
import { Button } from './ui/Button';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

const NOTIFICATION_SOUNDS = {
  work: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1b4e6df4c.mp3',
  break: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c6b70540d6.mp3',
};

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const selectedTask = useTaskStore((state) => state.selectedTask);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playNotificationSound = (type: 'work' | 'break') => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.src = NOTIFICATION_SOUNDS[type];
      audioRef.current.play();
    }
  };

  const handleSessionComplete = async () => {
    const newSessionCount = sessionCount + 1;
    setSessionCount(newSessionCount);

    if (isBreak) {
      setTimeLeft(settings.workDuration * 60);
      setIsBreak(false);
      playNotificationSound('work');
      toast.success('Break complete! Time to focus!', {
        icon: '🎯',
      });
    } else {
      if (selectedTask) {
        try {
          await supabase.from('time_entries').insert({
            task_id: selectedTask.id,
            start_time: new Date(Date.now() - settings.workDuration * 60000),
            end_time: new Date(),
            duration: `${settings.workDuration} minutes`,
            type: 'pomodoro',
          });

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (error) {
          console.error('Failed to save time entry:', error);
        }
      }

      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreakDuration : settings.breakDuration;
      setTimeLeft(breakDuration * 60);
      setIsBreak(true);
      playNotificationSound('break');
      toast.success(
        isLongBreak ? 'Great work! Time for a long break!' : 'Focus session complete! Take a short break!',
        { icon: '☕' }
      );
    }

    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTimeLeft(settings.workDuration * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  const progress = ((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-white/20"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>

        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-white/20"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-white"
              strokeWidth="12"
              fill="none"
              strokeDasharray="553"
              strokeDashoffset={553 - (553 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? 'outline' : 'primary'}
            className="w-32 bg-white text-blue-600 hover:bg-blue-50"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            <span className="ml-2">{isRunning ? 'Pause' : 'Start'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-32 border-white text-white hover:bg-white/20"
          >
            <RotateCcw size={20} />
          </Button>
        </div>

        {selectedTask && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              <span className="font-medium">Current Task:</span>
            </div>
            <p className="mt-1 truncate">{selectedTask.title}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            <span>Session {sessionCount + 1}/{settings.sessionsUntilLongBreak}</span>
          </div>
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            <span>{settings.workDuration}m Focus / {settings.breakDuration}m Break</span>
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}