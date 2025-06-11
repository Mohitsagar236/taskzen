import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import { Button } from './ui/Button';
import { Plus, Trophy, Trash2, Award, Target, Bell, Palette } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export function HabitTracker() {
  const { habits, completions, addHabit, completeHabit, archiveHabit, getStreak, calculatePoints } = useHabitStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
    target: 1,
    unit: '',
    color: '#3b82f6',
    reminderTime: '',
  });

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert the habit data to JSON and set the Content-Type header
      const habitData = {
        ...newHabit,
        created_at: new Date().toISOString(),
      };

      await addHabit(habitData);
      
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        target: 1,
        unit: '',
        color: '#3b82f6',
        reminderTime: '',
      });
      setShowAddForm(false);
      toast.success('Habit created successfully! 🎯');
    } catch (error) {
      console.error('Failed to add habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      await completeHabit(habitId, 1);
      const streak = getStreak(habitId);
      
      if (streak % 7 === 0) { // Celebrate weekly streaks
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
        toast.success(`🔥 ${streak} day streak! Keep it up!`);
      } else {
        toast.success('Habit completed! 💪');
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
      toast.error('Failed to complete habit');
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  const getCompletionData = (habitId: string) => {
    const habitCompletions = completions[habitId] || [];
    return weekDays.map(day => {
      const isCompleted = habitCompletions.some(c => 
        isSameDay(new Date(c.date), day)
      );

      return {
        date: format(day, 'EEE'),
        completed: isCompleted ? 1 : 0,
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Habits</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newHabit.description}
              onChange={e => setNewHabit({ ...newHabit, description: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={newHabit.frequency}
                onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value as 'daily' | 'weekly' })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Target
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={newHabit.target}
                  onChange={e => setNewHabit({ ...newHabit, target: parseInt(e.target.value) })}
                  className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  value={newHabit.unit}
                  onChange={e => setNewHabit({ ...newHabit, unit: e.target.value })}
                  placeholder="Unit (optional)"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={newHabit.color}
                  onChange={e => setNewHabit({ ...newHabit, color: e.target.value })}
                  className="h-10 w-20 rounded-lg border-gray-300"
                />
                <Palette className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Reminder Time
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={e => setNewHabit({ ...newHabit, reminderTime: e.target.value })}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Habit</Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {habits.map(habit => (
          <div
            key={habit.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all hover:scale-[1.02]"
            style={{ borderLeft: `4px solid ${habit.color}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold dark:text-white flex items-center">
                  {habit.name}
                  {habit.target > 1 && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {habit.target} {habit.unit}
                    </span>
                  )}
                </h3>
                {habit.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {habit.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-yellow-500" title="Points">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">{calculatePoints(habit.id)}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-500" title="Current Streak">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">{getStreak(habit.id)} days</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveHabit(habit.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getCompletionData(habit.id)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    domain={[0, 1]}
                    ticks={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={habit.color}
                    strokeWidth={2}
                    dot={{ fill: habit.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {weekDays.map(day => {
                  const isCompleted = (completions[habit.id] || []).some(c =>
                    isSameDay(new Date(c.date), day)
                  );
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        h-10 rounded-lg flex items-center justify-center text-sm
                        transition-all duration-200 transform
                        ${isCompleted
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }
                        ${isToday && !isCompleted && 'ring-2 ring-blue-500'}
                      `}
                    >
                      {format(day, 'dd')}
                    </div>
                  );
                })}
              </div>
              <Button
                onClick={() => handleComplete(habit.id)}
                className="ml-4"
                disabled={
                  (completions[habit.id] || []).some(c =>
                    isSameDay(new Date(c.date), new Date())
                  )
                }
              >
                Complete
              </Button>
            </div>
          </div>
        ))}

        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No habits yet. Start building good habits today!</p>
          </div>
        )}
      </div>
    </div>
  );
}