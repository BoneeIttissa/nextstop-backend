import { useState, useEffect } from 'react';
import { Users, Clock, MapPin, Navigation2, TrendingUp, AlertCircle, CalendarClock } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { WelcomeSection } from './components/WelcomeSection';
import { LocalEatsSection } from './components/LocalEatsSection';
import { SettingsSection } from './components/SettingsSection';
import { DailySummary } from './components/DailySummary';
import { SemesterWrapped } from './components/SemesterWrapped';
import { BusMap } from './components/BusMap';
import { CapacityIndicator } from './components/CapacityIndicator';
import { StarredLocations } from './components/StarredLocations';
import { initializeMockDataIfNeeded, loadTrips, calculateStreak, getTodaysTrips, Trip } from './utils/tripTracking';

interface StarredLocation {
  id: string;
  name: string;
  address: string;
  category: 'class' | 'dining' | 'library' | 'gym' | 'other';
  emoji?: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
  location: string;
  startTime: Date;
  endTime: Date;
  buildingCode: string;
  emoji?: string;
}

interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  currentStop: string;
  nextStop: string;
  eta: number; // minutes
  capacity: number; // percentage
  delay: number; // minutes (0 if on time)
  distance: number; // km
  walkTime: number; // minutes if you walk
  destinationWalkTime: number; // minutes to walk from bus stop to class
}

interface Recommendation {
  action: 'wait' | 'walk' | 'alternate' | 'walk-to-class';
  message: string;
  color: string;
  willBeOnTime: boolean;
  arrivalTime: number; // minutes until arrival at class
}

function getRecommendation(bus: BusRoute, nextClass: Class | null, currentTime: Date): Recommendation {
  const { capacity, delay, eta, walkTime, destinationWalkTime } = bus;

  if (!nextClass) {
    // No class scheduled - use basic logic
    if (capacity >= 95) {
      return {
        action: 'alternate',
        message: `Bus is at ${capacity}% capacity. Consider the next bus or alternate route.`,
        color: 'bg-red-50 border-red-200',
        willBeOnTime: true,
        arrivalTime: 0
      };
    }
    return {
      action: 'wait',
      message: 'Bus has available space. Safe to board.',
      color: 'bg-green-50 border-green-200',
      willBeOnTime: true,
      arrivalTime: 0
    };
  }

  // Calculate time until class starts
  const minutesUntilClass = Math.floor((nextClass.startTime.getTime() - currentTime.getTime()) / 60000);

  // Time to arrive at class via bus (wait + ride + walk from stop)
  const busArrivalTime = eta + destinationWalkTime;

  // Time to arrive at class by walking
  const walkArrivalTime = walkTime;

  const willBeOnTimeByBus = busArrivalTime < minutesUntilClass;
  const willBeOnTimeByWalking = walkArrivalTime < minutesUntilClass;

  // Critical capacity - recommend alternatives
  if (capacity >= 95) {
    if (willBeOnTimeByWalking) {
      return {
        action: 'walk-to-class',
        message: `Bus is at ${capacity}% capacity. Walk to ${nextClass.buildingCode} now (${walkTime} min) to arrive on time.`,
        color: 'bg-red-50 border-red-200',
        willBeOnTime: true,
        arrivalTime: walkArrivalTime
      };
    }
    return {
      action: 'alternate',
      message: `Bus is at ${capacity}% capacity. Wait for next bus or walk immediately.`,
      color: 'bg-red-50 border-red-200',
      willBeOnTime: false,
      arrivalTime: busArrivalTime
    };
  }

  // If bus won't get you there on time
  if (!willBeOnTimeByBus) {
    if (willBeOnTimeByWalking) {
      return {
        action: 'walk-to-class',
        message: `Walk to ${nextClass.buildingCode} now (${walkTime} min). Bus won't get you there on time.`,
        color: 'bg-red-50 border-red-200',
        willBeOnTime: true,
        arrivalTime: walkArrivalTime
      };
    }
    return {
      action: 'walk-to-class',
      message: `You'll be late either way. Walking (${walkTime} min) is ${busArrivalTime - walkArrivalTime} min faster.`,
      color: 'bg-red-50 border-red-200',
      willBeOnTime: false,
      arrivalTime: walkArrivalTime
    };
  }

  // High capacity or significant delay but will still make it
  if (capacity >= 80 || delay > 5) {
    if (willBeOnTimeByWalking && walkArrivalTime < busArrivalTime) {
      return {
        action: 'walk',
        message: capacity >= 80
          ? `Bus is ${capacity}% full. Walking gets you to ${nextClass.buildingCode} ${busArrivalTime - walkArrivalTime} min earlier.`
          : `Bus is delayed ${delay} min. Walking gets you to ${nextClass.buildingCode} ${busArrivalTime - walkArrivalTime} min earlier.`,
        color: 'bg-yellow-50 border-yellow-200',
        willBeOnTime: true,
        arrivalTime: walkArrivalTime
      };
    }
    return {
      action: 'wait',
      message: capacity >= 80
        ? `Bus is ${capacity}% full but gets you to ${nextClass.buildingCode} on time. Board quickly.`
        : `Bus is ${delay} min delayed but still gets you to ${nextClass.buildingCode} on time.`,
      color: 'bg-yellow-50 border-yellow-200',
      willBeOnTime: true,
      arrivalTime: busArrivalTime
    };
  }

  // Good to go - plenty of time
  const bufferTime = minutesUntilClass - busArrivalTime;
  return {
    action: 'wait',
    message: delay > 0
      ? `Bus is ${delay} min delayed but has space. You'll arrive ${bufferTime} min early to ${nextClass.buildingCode}.`
      : `Bus is on time with space. You'll arrive ${bufferTime} min early to ${nextClass.buildingCode}.`,
    color: 'bg-green-50 border-green-200',
    willBeOnTime: true,
    arrivalTime: busArrivalTime
  };
}

function getMainRecommendation(buses: BusRoute[], nextClass: Class | null, currentTime: Date): {
  title: string;
  message: string;
  color: string;
  icon: string;
} {
  if (!nextClass) {
    return {
      title: 'Ready to go',
      message: 'All buses are available. Choose any route that suits your destination.',
      color: 'bg-blue-50 border-blue-200',
      icon: '🚌'
    };
  }

  // Get all recommendations
  const recommendations = buses.map(bus => ({
    bus,
    rec: getRecommendation(bus, nextClass, currentTime)
  }));

  // Calculate time until class
  const minutesUntilClass = Math.floor((nextClass.startTime.getTime() - currentTime.getTime()) / 60000);

  // Find buses that will get you there on time with available seats
  const goodOptions = recommendations.filter(r => 
    r.rec.willBeOnTime && r.bus.capacity < 95
  );

  // Find the fastest option that gets you there on time
  const fastestOnTime = goodOptions.sort((a, b) => {
    const timeA = a.bus.eta + a.bus.destinationWalkTime;
    const timeB = b.bus.eta + b.bus.destinationWalkTime;
    return timeA - timeB;
  })[0];

  // Check if walking is better than all bus options
  const walkingOption = recommendations.find(r => 
    r.rec.action === 'walk-to-class' || r.rec.action === 'walk'
  );

  // All buses are too full
  if (recommendations.every(r => r.bus.capacity >= 95)) {
    if (walkingOption && walkingOption.rec.willBeOnTime) {
      return {
        title: 'Walk to class now',
        message: `All buses are at capacity. Walk to ${nextClass.buildingCode} (${walkingOption.bus.walkTime} min) to arrive on time.`,
        color: 'bg-red-50 border-red-200',
        icon: '🚶'
      };
    }
    return {
      title: 'Wait for next buses',
      message: `Current buses are at capacity. Wait ${Math.min(...buses.map(b => b.eta)) + 15} min for the next available bus.`,
      color: 'bg-yellow-50 border-yellow-200',
      icon: '⏰'
    };
  }

  // Will be late no matter what
  if (recommendations.every(r => !r.rec.willBeOnTime)) {
    const fastestOption = recommendations.sort((a, b) => a.rec.arrivalTime - b.rec.arrivalTime)[0];
    if (fastestOption.rec.action === 'walk-to-class' || fastestOption.rec.action === 'walk') {
      return {
        title: 'Walk immediately',
        message: `You'll be ${minutesUntilClass - fastestOption.rec.arrivalTime} min late. Walking is fastest (${fastestOption.bus.walkTime} min).`,
        color: 'bg-red-50 border-red-200',
        icon: '🚶'
      };
    }
    return {
      title: 'Take the soonest bus',
      message: `You'll be ${minutesUntilClass - fastestOption.rec.arrivalTime} min late. Board bus ${fastestOption.bus.routeNumber} (${fastestOption.bus.eta} min).`,
      color: 'bg-red-50 border-red-200',
      icon: '⚠️'
    };
  }

  // Good options available
  if (fastestOnTime) {
    const arrivalTime = fastestOnTime.bus.eta + fastestOnTime.bus.destinationWalkTime;
    const bufferTime = minutesUntilClass - arrivalTime;
    
    // Suggest walking if it's significantly faster and capacity is concerning
    if (walkingOption && walkingOption.rec.action === 'walk-to-class' && 
        (fastestOnTime.bus.capacity >= 80 || fastestOnTime.bus.delay > 5)) {
      return {
        title: 'Consider walking',
        message: `Walking to ${nextClass.buildingCode} (${walkingOption.bus.walkTime} min) avoids delays and capacity issues.`,
        color: 'bg-yellow-50 border-yellow-200',
        icon: '🚶'
      };
    }

    // Recommend the best bus
    if (bufferTime > 10) {
      return {
        title: `Take bus ${fastestOnTime.bus.routeNumber}`,
        message: `Arrives in ${fastestOnTime.bus.eta} min. You'll get to ${nextClass.buildingCode} ${bufferTime} min early with ${45 - Math.round(45 * fastestOnTime.bus.capacity / 100)} seats available.`,
        color: 'bg-green-50 border-green-200',
        icon: '✅'
      };
    } else {
      return {
        title: `Board bus ${fastestOnTime.bus.routeNumber} now`,
        message: `Arrives in ${fastestOnTime.bus.eta} min. Board quickly to reach ${nextClass.buildingCode} on time (${bufferTime} min buffer).`,
        color: 'bg-yellow-50 border-yellow-200',
        icon: '⏱️'
      };
    }
  }

  // Fallback
  return {
    title: 'Check all options below',
    message: `Review bus recommendations for ${nextClass.buildingCode}. Multiple routes available.`,
    color: 'bg-blue-50 border-blue-200',
    icon: '📋'
  };
}

function BusCard({ bus, nextClass, currentTime }: { bus: BusRoute; nextClass: Class | null; currentTime: Date }) {
  const recommendation = getRecommendation(bus, nextClass, currentTime);

  // Calculate remaining seats (assuming standard bus capacity of 45 seats)
  const totalSeats = 45;
  const remainingSeats = Math.round(totalSeats * (1 - bus.capacity / 100));

  // Calculate total arrival time
  const totalArrivalTime = bus.eta + bus.destinationWalkTime;

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 95) return 'text-red-600';
    if (capacity >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDelayColor = (delay: number) => {
    if (delay > 10) return 'text-red-600';
    if (delay > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold text-[#4a4a4a]">{bus.routeNumber}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getDelayColor(bus.delay)} ${
              bus.delay > 10 ? 'bg-red-100' : bus.delay > 0 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              {bus.delay > 0 ? `+${bus.delay} min` : 'On time'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#e8dfd6] text-[#6a6a6a] font-medium">
              {totalArrivalTime} min total
            </span>
          </div>
          <p className="text-[#8b8680] mt-1">{bus.routeName}</p>
        </div>
        <div className={`text-right px-3 py-2 rounded-xl ${
          bus.capacity >= 95 ? 'bg-red-100' : bus.capacity >= 80 ? 'bg-yellow-100' : 'bg-green-100'
        }`}>
          <div className="flex items-center gap-1.5 justify-end">
            <Users className={`w-4 h-4 ${getCapacityColor(bus.capacity)}`} />
            <span className={`text-xl font-semibold ${getCapacityColor(bus.capacity)}`}>
              {bus.capacity}%
            </span>
          </div>
          <p className="text-xs text-[#8b8680] mt-0.5">capacity</p>
          <p className={`text-sm font-medium mt-1 ${getCapacityColor(bus.capacity)}`}>
            {remainingSeats} seats left
          </p>
        </div>
      </div>

      {/* Current Location */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#e3ddd5]">
        <MapPin className="w-5 h-5 text-[#b8c5d6] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-[#8b8680]">Currently at</p>
          <p className="text-[#4a4a4a] font-medium">{bus.currentStop}</p>
          <div className="flex items-center gap-2 mt-2">
            <Navigation2 className="w-4 h-4 text-[#8b8680]" />
            <p className="text-sm text-[#8b8680]">Next: {bus.nextStop}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4 text-[#8b8680]" />
            <span className="text-2xl font-semibold text-[#4a4a4a]">{bus.eta}</span>
            <span className="text-sm text-[#8b8680] mt-1">min</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-xl p-4 border-2 ${recommendation.color}`}>
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{
              color: recommendation.willBeOnTime && recommendation.action === 'wait' ? '#16a34a' :
                     !recommendation.willBeOnTime ? '#dc2626' : '#ca8a04'
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-[#4a4a4a]">
                {recommendation.action === 'wait' ? 'Wait here' :
                 recommendation.action === 'walk' ? 'Consider walking' :
                 recommendation.action === 'walk-to-class' ? 'Walk to class' : 'Find alternative'}
              </p>
              {nextClass && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  recommendation.willBeOnTime ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {recommendation.willBeOnTime ? 'On time' : 'Will be late'}
                </span>
              )}
            </div>
            <p className="text-sm text-[#6a6a6a]">{recommendation.message}</p>
            {(recommendation.action === 'walk' || recommendation.action === 'walk-to-class') && (
              <p className="text-xs text-[#8b8680] mt-2">Walking distance: {bus.distance} km • {bus.walkTime} min</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState<'welcome' | 'routes' | 'local-eats' | 'settings'>('welcome');
  const [isWalking, setIsWalking] = useState(false);
  
  // Trip tracking state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [showSemesterWrapped, setShowSemesterWrapped] = useState(false);
  const [showNightModePreview, setShowNightModePreview] = useState(false);

  // Initialize trip tracking
  useEffect(() => {
    initializeMockDataIfNeeded();
    const loadedTrips = loadTrips();
    setTrips(loadedTrips);
  }, []);

  // Check if it's time to show daily summary (after 8pm or after last class)
  useEffect(() => {
    const checkDailySummary = () => {
      const hour = currentTime.getHours();
      const hasShownToday = localStorage.getItem('dailySummaryShown');
      const today = new Date().toDateString();
      
      // Show after 8pm and haven't shown today yet
      if (hour >= 20 && hasShownToday !== today) {
        const todaysTrips = getTodaysTrips();
        if (todaysTrips.length > 0) {
          setTimeout(() => setShowDailySummary(true), 2000); // Delay for smooth UX
          localStorage.setItem('dailySummaryShown', today);
        }
      }
    };

    checkDailySummary();
  }, [currentTime]);

  // Get day of week
  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });

  // Starred locations
  const [starredLocations, setStarredLocations] = useState<StarredLocation[]>([]);

  // Load starred locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('starredLocations');
    if (saved) {
      setStarredLocations(JSON.parse(saved));
    }
  }, []);

  // Save starred locations to localStorage
  const saveStarredLocations = (locations: StarredLocation[]) => {
    setStarredLocations(locations);
    localStorage.setItem('starredLocations', JSON.stringify(locations));
  };

  const addStarredLocation = (location: Omit<StarredLocation, 'id'>) => {
    const newLocation = {
      ...location,
      id: Date.now().toString()
    };
    saveStarredLocations([...starredLocations, newLocation]);
  };

  const removeStarredLocation = (id: string) => {
    saveStarredLocations(starredLocations.filter(loc => loc.id !== id));
  };

  const updateStarredLocation = (id: string, updates: Partial<StarredLocation>) => {
    saveStarredLocations(
      starredLocations.map(loc =>
        loc.id === id ? { ...loc, ...updates } : loc
      )
    );
  };

  // Student's class schedule with emojis
  const [schedule, setSchedule] = useState<Class[]>([
    {
      id: '1',
      name: 'Data Structures',
      code: 'CS 61B',
      location: 'Soda Hall 310',
      buildingCode: 'Soda',
      startTime: new Date(currentTime.getTime() + 18 * 60000),
      endTime: new Date(currentTime.getTime() + 98 * 60000),
      emoji: '💻'
    },
    {
      id: '2',
      name: 'Calculus II',
      code: 'MATH 1B',
      location: 'Evans Hall 10',
      buildingCode: 'Evans',
      startTime: new Date(currentTime.getTime() + 140 * 60000),
      endTime: new Date(currentTime.getTime() + 230 * 60000),
      emoji: '📐'
    },
    {
      id: '3',
      name: 'Intro to Psychology',
      code: 'PSYCH 1',
      location: 'Wheeler Hall 150',
      buildingCode: 'Wheeler',
      startTime: new Date(currentTime.getTime() + 280 * 60000),
      endTime: new Date(currentTime.getTime() + 360 * 60000),
      emoji: '🧠'
    }
  ]);

  // Load emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('classEmojis');
    if (saved) {
      const emojis = JSON.parse(saved);
      setSchedule(prev => prev.map(cls => ({
        ...cls,
        emoji: emojis[cls.id] || cls.emoji
      })));
    }
  }, []);

  // Update class emoji
  const updateClassEmoji = (classId: string, emoji: string) => {
    setSchedule(prev => {
      const updated = prev.map(cls =>
        cls.id === classId ? { ...cls, emoji } : cls
      );

      // Save to localStorage
      const emojis = updated.reduce((acc, cls) => ({
        ...acc,
        [cls.id]: cls.emoji
      }), {});
      localStorage.setItem('classEmojis', JSON.stringify(emojis));

      return updated;
    });
  };

  // Get next class
  const nextClass = schedule.find(cls => cls.startTime > currentTime) || null;

  // All available buses with destination info and live positions
  const [allBuses] = useState<BusRoute[]>([
    {
      id: '1',
      routeNumber: '51B',
      routeName: 'Campus Perimeter → Downtown Berkeley',
      currentStop: 'Bancroft Way & Telegraph Ave',
      nextStop: 'Bancroft Way & College Ave',
      eta: 3,
      capacity: 45,
      delay: 0,
      distance: 1.8,
      walkTime: 22,
      destinationWalkTime: 5
    },
    {
      id: '2',
      routeNumber: 'F',
      routeName: 'UC Berkeley Perimeter Loop',
      currentStop: 'Hearst Mining Circle',
      nextStop: 'Oxford St & Center St',
      eta: 7,
      capacity: 97,
      delay: 2,
      distance: 1.5,
      walkTime: 18,
      destinationWalkTime: 3
    },
    {
      id: '3',
      routeNumber: '52',
      routeName: 'Hearst Ave → Shattuck',
      currentStop: 'Euclid Ave & Hearst Ave',
      nextStop: 'Oxford St & University Ave',
      eta: 12,
      capacity: 83,
      delay: 8,
      distance: 2.8,
      walkTime: 34,
      destinationWalkTime: 7
    },
    {
      id: '4',
      routeNumber: '79',
      routeName: 'Northside → Downtown Berkeley',
      currentStop: 'Hearst Ave & La Loma Ave',
      nextStop: 'Your stop',
      eta: 2,
      capacity: 62,
      delay: 0,
      distance: 1.2,
      walkTime: 15,
      destinationWalkTime: 4
    }
  ]);

  // Simulate bus positions for map (in real app, this would come from AC Transit API)
  const [busPositions] = useState([
    { lat: 37.8719, lng: -122.2585, routeNumber: '51B', heading: 90 },
    { lat: 37.8745, lng: -122.2595, routeNumber: 'F', heading: 180 },
    { lat: 37.8700, lng: -122.2570, routeNumber: '52', heading: 45 },
    { lat: 37.8730, lng: -122.2610, routeNumber: '79', heading: 270 }
  ]);

  // User position (would come from geolocation API)
  const userPosition = { lat: 37.8719, lng: -122.2585 };
  const busStopPosition = { lat: 37.8725, lng: -122.2590 };

  // Smart filtering: Only show buses relevant to next class destination
  // In a real app, this would use actual route data and destinations
  const getRelevantBuses = () => {
    if (!nextClass) return allBuses;

    // Map buildings to relevant bus routes (simplified logic)
    const routesByBuilding: Record<string, string[]> = {
      'Soda': ['51B', 'F', '79'], // CS building - near northside/central campus
      'Evans': ['52', 'F', '79'], // Math building - central/east campus
      'Wheeler': ['51B', '52', 'F'] // Humanities - central campus
    };

    const relevantRoutes = routesByBuilding[nextClass.buildingCode] || [];
    return allBuses.filter(bus => relevantRoutes.includes(bus.routeNumber));
  };

  const buses = getRelevantBuses();

  // Calculate on-time rate for gamification
  const onTimeRate = 92; // This would be calculated from actual trip data

  // Calculate fastest bus ETA
  const fastestBusETA = allBuses.length > 0
    ? Math.min(...allBuses.map(bus => bus.eta))
    : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Render different sections based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 'welcome':
        return (
          <WelcomeSection
            currentTime={currentTime}
            nextClass={nextClass}
            schedule={schedule}
            starredLocations={starredLocations}
            onTimeRate={onTimeRate}
            trips={trips}
            showDailySummaryPopup={showNightModePreview ? true : showDailySummary}
            onCloseDailySummary={() => {
              setShowDailySummary(false);
              setShowNightModePreview(false);
            }}
          />
        );

      case 'routes':
        const mainRec = getMainRecommendation(buses, nextClass, currentTime);
        
        // Sort buses by total arrival time (eta + walk time from stop to destination)
        const sortedBuses = [...buses].sort((a, b) => {
          const totalTimeA = a.eta + a.destinationWalkTime;
          const totalTimeB = b.eta + b.destinationWalkTime;
          return totalTimeA - totalTimeB;
        });
        
        return (
          <>
            {/* Next Class Card */}
            {nextClass && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#d4cec4] mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#f5f1ec] rounded-xl text-3xl">
                    {nextClass.emoji || '📚'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#8b8680] mb-1">Next Class</p>
                    <h2 className="text-xl font-semibold text-[#4a4a4a]">{nextClass.code}</h2>
                    <p className="text-[#8b8680] mt-0.5">{nextClass.name}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-[#6a6a6a]">
                        <MapPin className="w-4 h-4" />
                        <span>{nextClass.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6a6a6a]">
                        <CalendarClock className="w-4 h-4" />
                        <span>
                          {nextClass.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-4 py-2 bg-[#e8dfd6] rounded-xl">
                      {(() => {
                        const totalMinutes = Math.floor((nextClass.startTime.getTime() - currentTime.getTime()) / 60000);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;

                        return (
                          <>
                            <p className="text-3xl font-semibold text-[#d4a5a5]">
                              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`}
                            </p>
                            <p className="text-xs text-[#8b8680] mt-1">until class</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Recommendation - Personalized */}
            <div className={`rounded-2xl p-6 border-2 ${mainRec.color} mb-6 shadow-md`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{mainRec.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#4a4a4a] mb-2">{mainRec.title}</h3>
                  <p className="text-[#6a6a6a]">{mainRec.message}</p>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[#4a4a4a]">Live Bus Tracking</h2>
                <button
                  onClick={() => setIsWalking(!isWalking)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isWalking
                      ? 'bg-[#e8dfd6] text-[#6a6a6a]'
                      : 'bg-[#f5f1ec] text-[#6a6a6a] hover:bg-[#ede9e4]'
                  }`}
                >
                  {isWalking ? '🚶 Walking Mode' : '🚏 Waiting Mode'}
                </button>
              </div>
              <BusMap
                buses={busPositions}
                userPosition={userPosition}
                isWalking={isWalking}
                walkingDestination={isWalking ? busStopPosition : undefined}
              />
            </div>

            {/* Info Banner */}
            <div className="bg-[#f0f5f8] border border-[#d4cec4] rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#b8c5d6] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#4a4a4a]">
                  {nextClass
                    ? `${buses.length} route${buses.length !== 1 ? 's' : ''} available to ${nextClass.buildingCode}`
                    : 'Your routes for today'}
                </p>
                <p className="text-sm text-[#8b8680] mt-1">
                  {nextClass
                    ? `We automatically show buses going near ${nextClass.location}.`
                    : 'We analyze capacity and delays to help you get around campus.'}
                </p>
              </div>
            </div>

            {/* Bus Cards */}
            <div className="space-y-4 mb-6">
              {sortedBuses.map(bus => (
                <div key={bus.id}>
                  <BusCard bus={bus} nextClass={nextClass} currentTime={currentTime} />

                  {/* Capacity Indicator */}
                  <div className="mt-3">
                    <CapacityIndicator capacity={bus.capacity} />
                  </div>
                </div>
              ))}
            </div>

            {/* Starred Locations */}
            <StarredLocations
              locations={starredLocations}
              onAdd={addStarredLocation}
              onRemove={removeStarredLocation}
              onUpdate={updateStarredLocation}
            />
          </>
        );

      case 'local-eats':
        return (
          <LocalEatsSection
            onTimeRate={onTimeRate}
          />
        );

      case 'settings':
        return (
          <SettingsSection
            schedule={schedule}
            onEmojiChange={updateClassEmoji}
            onOpenSemesterWrapped={() => setShowSemesterWrapped(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] flex flex-col">
      {/* Compact Mobile Header */}
      <header className="bg-white border-b border-[#e3ddd5] sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#d4a5a5] to-[#b8c5d6] rounded-lg flex items-center justify-center text-white font-bold">
                🚌
              </div>
              <div>
                <h1 className="text-base font-bold text-[#4a4a4a]">NextStop</h1>
                <p className="text-xs text-[#8b8680]">UC Berkeley</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-[#fce7e7] rounded-full flex items-center gap-1">
                <span>🔥</span>
                <span className="text-xs font-semibold text-[#d4a5a5]">{calculateStreak()}</span>
              </div>
              {activeSection === 'welcome' && (
                <button
                  onClick={() => setShowNightModePreview(!showNightModePreview)}
                  className="px-3 py-1 bg-[#b8c5d6] hover:bg-[#a8b5c6] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {showNightModePreview ? '☀️ Real-time' : '🌙 Night Mode'}
                </button>
              )}
              <p className="text-xs text-[#8b8680]">
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          {renderSection()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        streakCount={calculateStreak()}
      />

      {/* Daily Summary Modal */}
      {showDailySummary && (
        <DailySummary
          trips={trips}
          onClose={() => setShowDailySummary(false)}
        />
      )}

      {/* Semester Wrapped Modal */}
      {showSemesterWrapped && (
        <SemesterWrapped
          trips={trips}
          semesterStart={new Date(new Date().getFullYear(), 7, 20)} // Aug 20
          semesterEnd={new Date(new Date().getFullYear(), 11, 15)} // Dec 15
          onClose={() => setShowSemesterWrapped(false)}
        />
      )}
    </div>
  );
}