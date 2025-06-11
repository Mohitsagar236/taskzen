import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProgressStore } from '../store/progressStore';
import { CheckCircle, Clock, AlertCircle, Calendar, Target, Award, TrendingUp } from 'lucide-react';
import { isWithinInterval, subWeeks } from 'date-fns';

export function DashboardSummary() {
  const tasks = useTaskStore((state) => state.tasks);
  const progress = useProgressStore((state) => state.progress);

  // Calculate completion metrics
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate tasks due soon
  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.setDate(now.getDate() + 3));
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) <= threeDaysFromNow
    ).length;
  }, [tasks]);

  // Calculate high priority tasks
  const highPriorityTasks = useMemo(() => 
    tasks.filter(task => task.priority === 'high' && !task.completed).length
  , [tasks]);

  // Calculate productivity score and trends
  const productivityMetrics = useMemo(() => {
    const now = new Date();
    const lastWeek = subWeeks(now, 1);

    // This week's metrics
    const thisWeekTasks = tasks.filter(task => 
      task.createdAt && isWithinInterval(new Date(task.createdAt), {
        start: lastWeek,
        end: now
      })
    );

    const thisWeekCompleted = thisWeekTasks.filter(task => task.completed).length;
    const thisWeekOnTime = thisWeekTasks.filter(task => 
      task.completed && task.dueDate && new Date(task.completedAt!) <= new Date(task.dueDate)
    ).length;

    // Last week's metrics for comparison
    const twoWeeksAgo = subWeeks(lastWeek, 1);
    const lastWeekTasks = tasks.filter(task => 
      task.createdAt && isWithinInterval(new Date(task.createdAt), {
        start: twoWeeksAgo,
        end: lastWeek
      })
    );

    const lastWeekCompleted = lastWeekTasks.filter(task => task.completed).length;
    const lastWeekOnTime = lastWeekTasks.filter(task => 
      task.completed && task.dueDate && new Date(task.completedAt!) <= new Date(task.dueDate)
    ).length;

    // Calculate productivity score (0-100)
    const scoreComponents = {
      completionRate: thisWeekCompleted / Math.max(thisWeekTasks.length, 1) * 40, // 40% weight
      onTimeRate: thisWeekOnTime / Math.max(thisWeekCompleted, 1) * 30, // 30% weight
      consistencyScore: Math.min(thisWeekTasks.length, 5) / 5 * 20, // 20% weight
      streakBonus: Math.min(progress?.streakDays || 0, 7) / 7 * 10 // 10% weight
    };

    const currentScore = Object.values(scoreComponents).reduce((a, b) => a + b, 0);
    
    // Calculate last week's score for comparison
    const lastWeekScore = (lastWeekCompleted / Math.max(lastWeekTasks.length, 1) * 40) +
      (lastWeekOnTime / Math.max(lastWeekCompleted, 1) * 30) +
      (Math.min(lastWeekTasks.length, 5) / 5 * 20);

    // Calculate improvement percentage
    const improvement = lastWeekScore > 0 
      ? ((currentScore - lastWeekScore) / lastWeekScore) * 100 
      : 0;

    // Calculate percentile (simplified version - you might want to fetch this from backend)
    const estimatedPercentile = currentScore > 90 ? 95 : 
      currentScore > 80 ? 85 : 
      currentScore > 70 ? 75 : 
      currentScore > 60 ? 65 : 50;

    return {
      score: Math.round(currentScore),
      improvement: Math.round(improvement),
      percentile: estimatedPercentile
    };
  }, [tasks, progress]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Task Progress */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Task Progress</h3>
            <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm opacity-90">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
      </div>

      {/* Time Management */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Time Management</h3>
            <p className="text-3xl font-bold">{dueSoonTasks}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Tasks due soon</span>
          </div>
          <p className="text-sm opacity-90">
            {dueSoonTasks} tasks due in the next 3 days
          </p>
        </div>
      </div>

      {/* Priority Tasks */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Priority Tasks</h3>
            <p className="text-3xl font-bold">{highPriorityTasks}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>High priority tasks</span>
          </div>
          <p className="text-sm opacity-90">
            {highPriorityTasks} tasks need immediate attention
          </p>
        </div>
      </div>

      {/* Productivity Score */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Productivity Score</h3>
            <p className="text-3xl font-bold">{productivityMetrics.score}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Top {100 - productivityMetrics.percentile}% of users</span>
          </div>
          <p className="text-sm opacity-90">
            {productivityMetrics.improvement > 0 
              ? `${productivityMetrics.improvement}% improvement from last week`
              : productivityMetrics.improvement < 0 
                ? `${Math.abs(productivityMetrics.improvement)}% decrease from last week`
                : 'Same performance as last week'}
          </p>
        </div>
      </div>
    </div>
  );
}