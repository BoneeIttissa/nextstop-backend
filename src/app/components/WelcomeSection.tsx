import { Calendar, MapPin, Clock, TrendingUp, Footprints, Leaf, Award, X, Sparkles } from 'lucide-react';
import type { StarredLocation } from './StarredLocations';
import { useState } from 'react';

interface Trip {
  id: string;
  date: Date;
  classCode: string;
  className: string;
  scheduledTime: Date;
  actualArrivalTime: Date;
  wasOnTime: boolean;
  mode: 'bus' | 'walk';
  busLine?: string;
  distance: number;
  steps?: number;
  caloriesBurned?: number;
}

interface WelcomeSectionProps {
  currentTime: Date;
  nextClass: Class | null;
  schedule: Class[];
  starredLocations: StarredLocation[];
  onTimeRate: number;
  trips: Trip[];
  showDailySummaryPopup: boolean;
  onCloseDailySummary: () => void;
  showNightModePreview?: boolean;
  onToggleNightMode?: () => void;
}

export function WelcomeSection({
  currentTime,
  nextClass,
  schedule,
  starredLocations,
  onTimeRate,
  trips,
  showDailySummaryPopup,
  onCloseDailySummary,
  showNightModePreview,
  onToggleNightMode
}: WelcomeSectionProps) {
  const dayOfWeek = currentTime.toLocaleString('default', { weekday: 'long' });
  const streakCount = trips.filter(trip => trip.wasOnTime).length;

  const fastestBusETA = 3; // minutes until fastest bus arrives
  const onNavigateToRoutes = () => {
    // Implement navigation to routes
  };

  // Calculate today's trip stats for the popup
  const todaysTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date);
    const now = new Date();
    return tripDate.toDateString() === now.toDateString();
  });

  const onTimeCount = todaysTrips.filter(t => t.wasOnTime).length;
  const totalTrips = todaysTrips.length;
  const todayOnTimeRate = totalTrips > 0 ? Math.round((onTimeCount / totalTrips) * 100) : 0;

  // Calculate weekly stats
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    return new Date(d.setDate(diff));
  };

  const weekStart = getStartOfWeek(new Date());
  const weeklyTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date);
    return tripDate >= weekStart;
  });

  const weeklyOnTimeCount = weeklyTrips.filter(t => t.wasOnTime).length;
  const weeklyTotalTrips = weeklyTrips.length;
  const weeklyOnTimeRate = weeklyTotalTrips > 0 ? Math.round((weeklyOnTimeCount / weeklyTotalTrips) * 100) : 0;

  // Calculate Arrival Confidence (% of trips arriving 5+ minutes early)
  const earlyArrivals = todaysTrips.filter(trip => {
    const arrivalDiff = trip.scheduledTime.getTime() - trip.actualArrivalTime.getTime();
    const minutesEarly = Math.floor(arrivalDiff / 60000);
    return minutesEarly >= 5;
  });
  const arrivalConfidence = totalTrips > 0 ? Math.round((earlyArrivals.length / totalTrips) * 100) : 0;

  // Calculate Avg Leave In (average minutes before class to leave based on historical performance)
  const avgLeaveIn = todaysTrips.length > 0
    ? Math.round(
        todaysTrips.reduce((sum, trip) => {
          const leaveTime = new Date(trip.actualArrivalTime.getTime() - trip.distance * 10 * 60000); // Estimate travel time
          const minutesBeforeClass = Math.floor((trip.scheduledTime.getTime() - leaveTime.getTime()) / 60000);
          return sum + minutesBeforeClass;
        }, 0) / todaysTrips.length
      )
    : 15; // Default to 15 minutes

  // Calculate recommended "Leave In" time for next class
  const leaveInMinutes = nextClass 
    ? Math.max(0, Math.floor((nextClass.startTime.getTime() - currentTime.getTime()) / 60000) - avgLeaveIn)
    : 0;

  const totalSteps = todaysTrips.reduce((sum, trip) => sum + (trip.steps || 0), 0);
  const totalCalories = todaysTrips.reduce((sum, trip) => sum + (trip.caloriesBurned || 0), 0);
  const totalDistance = todaysTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const co2Saved = Math.round((totalDistance * 0.621371) * (404 - 105)); // grams

  const getEncouragingMessage = () => {
    if (totalTrips === 0) {
      return {
        message: "Rest day, recharge! 🌙",
        emoji: "😌"
      };
    }

    if (todayOnTimeRate === 100) {
      return {
        message: "Perfect day! You crushed it! 🎉",
        emoji: "🌟"
      };
    }

    if (todayOnTimeRate >= 80) {
      return {
        message: "Great job staying on track today! 💪",
        emoji: "🎯"
      };
    }

    if (todayOnTimeRate >= 50) {
      return {
        message: "Good effort! Tomorrow you'll do even better! 🌱",
        emoji: "💚"
      };
    }

    return {
        message: "Every journey starts somewhere. You've got this! 🚀",
        emoji: "💙"
      };
  };

  const encouragement = getEncouragingMessage();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section - More Compact */}
      <div className="bg-gradient-to-br from-[#d4a5a5] to-[#b8c5d6] rounded-3xl p-6 text-white mb-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-white/80 text-xs font-medium">Good morning</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Happy {dayOfWeek}!</h1>
          <p className="text-white/80 text-sm">
            Ready to conquer your day on campus? 🚀
          </p>
        </div>
      </div>

      {/* Quick Stats - Compact Layout */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 border border-[#e3ddd5] shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-[#e8f4f0] rounded-lg flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 text-[#6b9d8e]" />
            </div>
            <p className="text-xl font-bold text-[#4a4a4a]">3</p>
            <p className="text-xs text-[#8b8680] mt-0.5">Classes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e3ddd5] shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-[#f0f5f8] rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-[#b8c5d6]" />
            </div>
            <p className="text-xl font-bold text-[#4a4a4a]">{arrivalConfidence}%</p>
            <p className="text-xs text-[#8b8680] mt-0.5 leading-tight">Arrival<br />Confidence</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e3ddd5] shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-[#fce7e7] rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-[#d4a5a5]" />
            </div>
            <p className="text-xl font-bold text-[#4a4a4a]">{leaveInMinutes}</p>
            <p className="text-xs text-[#8b8680] mt-0.5">Leave In</p>
          </div>
        </div>
      </div>

      {/* Next Class CTA - More Compact */}
      {nextClass && (
        <div className="bg-white rounded-2xl p-5 border-2 border-[#d4cec4] shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-[#8b8680] mb-1">Up Next</p>
              <h2 className="text-xl font-bold text-[#4a4a4a] mb-0.5">{nextClass.code}</h2>
              <p className="text-sm text-[#8b8680]">{nextClass.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
            </div>
            <button
              onClick={onNavigateToRoutes}
              className="px-5 py-2.5 bg-[#d4a5a5] text-white rounded-xl text-sm font-medium hover:bg-[#c69595] transition-colors shadow-md hover:shadow-lg"
            >
              View Routes
            </button>
          </div>
        </div>
      )}

      {/* Tips Section - More Compact */}
      <div className="bg-gradient-to-br from-[#fef3e8] to-[#fcf6ee] rounded-2xl p-5 border border-[#e8dfd6]">
        <h3 className="font-semibold text-[#4a4a4a] mb-2.5 flex items-center gap-2 text-sm">
          <span>💡</span>
          Today's Tips
        </h3>
        <ul className="space-y-1.5 text-xs text-[#6a6a6a]">
          <li className="flex items-start gap-2">
            <span className="text-[#d4a896] mt-0.5">•</span>
            <span>Bus F is running 2 minutes behind schedule</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a896] mt-0.5">•</span>
            <span>Check out Artis Coffee on University Ave - great study spot!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a896] mt-0.5">•</span>
            <span>Consider walking to Soda Hall - you'll arrive 5 minutes earlier</span>
          </li>
        </ul>
      </div>

      {/* Daily Summary Popup */}
      {showDailySummaryPopup && totalTrips > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCloseDailySummary}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-br from-[#d4a5a5] to-[#b8c5d6] rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{encouragement.emoji}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Day Complete!</h3>
                  <p className="text-white/90 text-sm">Here's your daily summary</p>
                </div>
              </div>
              <button
                onClick={onCloseDailySummary}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Encouragement Message */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/30">
              <p className="text-white font-semibold text-center">{encouragement.message}</p>
              <p className="text-white/80 text-sm text-center mt-1">
                {onTimeCount} of {totalTrips} classes on time
              </p>
            </div>

            {/* Growth Tracker - Streak */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>🔥</span>
                  Growth Tracker
                </h4>
                <div className="text-right">
                  <p className="text-white font-bold text-2xl">{streakCount}</p>
                  <p className="text-white/70 text-xs">day streak</p>
                </div>
              </div>
              <p className="text-white/80 text-xs text-center mt-3">
                Keep up the momentum! You've been on time {streakCount} times this semester 🚀
              </p>
            </div>

            {/* Weekly Progress Tracker */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>📊</span>
                  This Week's Progress
                </h4>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{weeklyOnTimeCount}/{weeklyTotalTrips}</p>
                  <p className="text-white/70 text-xs">on time</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${weeklyOnTimeRate}%` }}
                />
              </div>
              <p className="text-white/80 text-xs text-center mt-2">
                {weeklyOnTimeRate}% on-time arrival rate this week
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Steps */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Footprints className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-purple-700 font-medium">Steps Walked</p>
                </div>
                <p className="text-2xl font-bold text-purple-700">{totalSteps.toLocaleString()}</p>
              </div>

              {/* CO2 Saved */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">CO₂ Saved</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{co2Saved}g</p>
              </div>
            </div>

            {/* Today's Trips Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mb-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>📍</span>
                Today's Trips ({totalTrips})
              </h4>
              <div className="space-y-2">
                {todaysTrips.slice(0, 3).map((trip) => (
                  <div 
                    key={trip.id}
                    className="flex items-center justify-between bg-white/20 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{trip.wasOnTime ? '✅' : '⏰'}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{trip.classCode}</p>
                        <p className="text-xs text-white/70">
                          {trip.mode === 'bus' ? `Bus ${trip.busLine}` : 'Walked'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {new Date(trip.actualArrivalTime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onCloseDailySummary}
              className="w-full bg-white text-[#d4a5a5] font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}