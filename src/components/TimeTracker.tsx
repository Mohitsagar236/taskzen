import React, { useState, useEffect } from 'react';
import { Play, Store as Stop, Clock, BarChart2, Calendar, Target, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function TimeTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const selectedTask = useTaskStore((state) => state.selectedTask);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(2400); // 40 hours in minutes
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  useEffect(() => {
    // Fetch daily and weekly totals
    const fetchTotals = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const { data: dailyEntries } = await supabase
        .from('time_entries')
        .select('duration')
        .gte('start_time', today.toISOString());

      const { data: weeklyEntries } = await supabase
        .from('time_entries')
        .select('duration')
        .gte('start_time', weekStart.toISOString());

      if (dailyEntries) {
        const total = dailyEntries.reduce((sum, entry) => {
          const minutes = parseInt(entry.duration.split(' ')[0]);
          return sum + minutes;
        }, 0);
        setDailyTotal(total);
      }

      if (weeklyEntries) {
        const total = weeklyEntries.reduce((sum, entry) => {
          const minutes = parseInt(entry.duration.split(' ')[0]);
          return sum + minutes;
        }, 0);
        setWeeklyTotal(total);
      }
    };

    fetchTotals();
  }, []);

  const handleStartTracking = () => {
    if (!selectedTask) {
      toast.error('Please select a task to track time');
      return;
    }

    setStartTime(new Date());
    setIsTracking(true);
    toast.success('Time tracking started');
  };

  const handleStopTracking = async () => {
    if (!startTime || !selectedTask) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      await supabase.from('time_entries').insert({
        task_id: selectedTask.id,
        start_time: startTime,
        end_time: endTime,
        duration: `${Math.floor(duration / 60)} minutes`,
        type: 'manual',
      });

      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      setDailyTotal(prev => prev + Math.floor(duration / 60));
      setWeeklyTotal(prev => prev + Math.floor(duration / 60));
      toast.success('Time entry saved');
    } catch (error) {
      console.error('Failed to save time entry:', error);
      toast.error('Failed to save time entry');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const weeklyProgress = (weeklyTotal / weeklyGoal) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Time Tracker</h2>
            {selectedTask && (
              <p className="text-sm opacity-90 mt-1">
                Tracking: {selectedTask.title}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center py-6">
          <div className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(elapsedTime)}
          </div>
          <div className="mt-2 text-sm opacity-90">
            {isTracking ? 'Time Elapsed' : 'Ready to Start'}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isTracking ? (
            <Button
              onClick={handleStartTracking}
              className="w-32 bg-white text-purple-600 hover:bg-purple-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleStopTracking}
              className="w-32 bg-red-500 hover:bg-red-600 text-white"
            >
              <Stop className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Today</span>
              </div>
              <span className="font-semibold">{formatMinutes(dailyTotal)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-green-400 rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min((dailyTotal / 480) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                <span className="text-sm">This Week</span>
              </div>
              <span className="font-semibold">{formatMinutes(weeklyTotal)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-blue-400 rounded-full h-2 transition-all duration-300"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm">Weekly Goal</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-yellow-300" />
              <span className="font-semibold">{formatMinutes(weeklyGoal)}</span>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
          <p className="text-sm mt-2 opacity-90">
            {weeklyProgress.toFixed(0)}% of weekly goal completed
          </p>
        </div>
      </div>
    </div>
  );
}