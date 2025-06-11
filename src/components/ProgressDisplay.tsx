import React from 'react';
import { useProgressStore } from '../store/progressStore';
import { Trophy, Star, Award, Zap, Crown, Target, TrendingUp } from 'lucide-react';

export function ProgressDisplay() {
  const { progress, leaderboard } = useProgressStore();

  if (!progress) return null;

  const xpToNextLevel = (progress.level * 100) ** 2;
  const xpProgress = (progress.xp / xpToNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Level and XP */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Level {progress.level}</h3>
            <p className="text-3xl font-bold">{progress.xp} XP</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-sm opacity-90">
            {xpToNextLevel - progress.xp} XP to next level
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Current Streak</h3>
            <p className="text-3xl font-bold">{progress.streakDays || 0} days</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <Target className="w-4 h-4 mr-1" />
          <span className="text-sm opacity-90">Keep it up!</span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Badges ({(progress.badges || []).length})
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {(progress.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="bg-white/10 p-3 rounded-lg flex items-center"
            >
              <span className="text-2xl mr-3">{badge.icon}</span>
              <div>
                <h4 className="font-medium text-sm">{badge.name}</h4>
                <p className="text-xs opacity-90">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Top Performers
        </h3>        <div className="space-y-3">
          {(leaderboard || []).slice(0, 5).map((entry, index) => (
            <div
              key={`${entry.userId}-${index}`}
              className="bg-white/10 p-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  {entry.rank <= 3 ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{entry.userName}</p>
                  <div className="flex items-center text-xs opacity-90">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Level {entry.level}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-bold">{entry.xp}</p>
                  <p className="text-xs opacity-90">XP</p>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span className="ml-1 text-sm">{entry.badges}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}