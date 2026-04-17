export interface Trip {
  id: string;
  date: Date;
  classCode: string;
  className: string;
  scheduledTime: Date;
  actualArrivalTime: Date;
  wasOnTime: boolean; // Berkeley time: 10 min grace period
  mode: 'bus' | 'walk';
  busLine?: string;
  distance: number; // km
  steps?: number;
  caloriesBurned?: number;
}

const STORAGE_KEY = 'campus_transit_trips';
const BERKELEY_TIME_BUFFER = 10; // minutes grace period

// Calculate if arrival was on time (with Berkeley time)
export function wasOnTime(scheduledTime: Date, actualArrival: Date): boolean {
  const bufferTime = new Date(scheduledTime.getTime() + BERKELEY_TIME_BUFFER * 60000);
  return actualArrival <= bufferTime;
}

// Calculate steps based on distance (average: 1,250 steps per km)
export function calculateSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1250);
}

// Calculate calories based on distance (average: 65 calories per km walking)
export function calculateCalories(distanceKm: number, mode: 'bus' | 'walk'): number {
  if (mode === 'walk') {
    return Math.round(distanceKm * 65);
  }
  // Standing/light activity on bus
  return Math.round(distanceKm * 15);
}

// Save trips to localStorage
export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

// Load trips from localStorage
export function loadTrips(): Trip[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const trips = JSON.parse(stored);
  // Convert date strings back to Date objects
  return trips.map((trip: any) => ({
    ...trip,
    date: new Date(trip.date),
    scheduledTime: new Date(trip.scheduledTime),
    actualArrivalTime: new Date(trip.actualArrivalTime)
  }));
}

// Add a new trip
export function addTrip(trip: Omit<Trip, 'id'>): Trip {
  const trips = loadTrips();
  const newTrip: Trip = {
    ...trip,
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  trips.push(newTrip);
  saveTrips(trips);
  return newTrip;
}

// Get trips for a specific date range
export function getTripsInRange(startDate: Date, endDate: Date): Trip[] {
  const trips = loadTrips();
  return trips.filter(trip => {
    const tripDate = new Date(trip.date);
    return tripDate >= startDate && tripDate <= endDate;
  });
}

// Get today's trips
export function getTodaysTrips(): Trip[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTripsInRange(today, tomorrow);
}

// Calculate current streak
export function calculateStreak(): number {
  const trips = loadTrips();
  if (trips.length === 0) return 0;

  // Sort by date descending
  const sortedTrips = trips.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group trips by day
  const tripsByDay = new Map<string, Trip[]>();
  sortedTrips.forEach(trip => {
    const dateKey = new Date(trip.date).toDateString();
    if (!tripsByDay.has(dateKey)) {
      tripsByDay.set(dateKey, []);
    }
    tripsByDay.get(dateKey)!.push(trip);
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dateKey = currentDate.toDateString();
    const dayTrips = tripsByDay.get(dateKey);

    if (!dayTrips || dayTrips.length === 0) {
      // No trips this day, but check if it's today (might not have classes yet)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (currentDate.getTime() === today.getTime()) {
        // Continue checking yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }

    // Check if all trips this day were on time
    const allOnTime = dayTrips.every(trip => trip.wasOnTime);
    if (allOnTime && dayTrips.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Generate mock trip data for demonstration
export function generateMockTrips(daysBack: number = 30): Trip[] {
  const trips: Trip[] = [];
  const now = new Date();
  
  const classes = [
    { code: 'CS 61B', name: 'Data Structures', location: 'Soda Hall 310' },
    { code: 'MATH 1B', name: 'Calculus II', location: 'Evans Hall 10' },
    { code: 'PSYCH 1', name: 'Intro to Psychology', location: 'Wheeler Hall 150' }
  ];

  const busLines = ['51B', 'F', '52', '79'];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Random number of classes per day (1-3)
    const numClasses = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < numClasses; j++) {
      const classInfo = classes[j % classes.length];
      const mode: 'bus' | 'walk' = Math.random() > 0.3 ? 'bus' : 'walk';
      const distance = 1.2 + Math.random() * 2; // 1.2-3.2 km
      
      // Scheduled time
      const scheduledTime = new Date(date);
      scheduledTime.setHours(9 + j * 3, 0, 0, 0);
      
      // Actual arrival (mostly on time, sometimes late)
      const actualArrivalTime = new Date(scheduledTime);
      const variance = Math.random() > 0.8 ? 
        Math.floor(Math.random() * 20) - 5 : // Sometimes late
        -Math.floor(Math.random() * 10); // Usually early
      actualArrivalTime.setMinutes(actualArrivalTime.getMinutes() + variance);
      
      const onTime = wasOnTime(scheduledTime, actualArrivalTime);
      const steps = mode === 'walk' ? calculateSteps(distance) : 0;
      const calories = calculateCalories(distance, mode);

      trips.push({
        id: `mock_${i}_${j}`,
        date,
        classCode: classInfo.code,
        className: classInfo.name,
        scheduledTime,
        actualArrivalTime,
        wasOnTime: onTime,
        mode,
        busLine: mode === 'bus' ? busLines[Math.floor(Math.random() * busLines.length)] : undefined,
        distance,
        steps,
        caloriesBurned: calories
      });
    }
  }

  return trips;
}

// Initialize with mock data if no trips exist
export function initializeMockDataIfNeeded(): void {
  const existingTrips = loadTrips();
  if (existingTrips.length === 0) {
    const mockTrips = generateMockTrips(60); // 60 days of data
    saveTrips(mockTrips);
  }
}
