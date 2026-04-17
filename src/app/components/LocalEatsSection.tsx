import { useState } from 'react';
import { MapPin, Clock, DollarSign, Star, Coffee, UtensilsCrossed, Sandwich, Pizza, IceCream, Heart, Navigation, Filter } from 'lucide-react';

interface LocalEat {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'quick-bites' | 'dessert';
  emoji: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  distance: number; // in miles
  walkTime: number; // in minutes
  address: string;
  hours: string;
  description: string;
  isOpen: boolean;
  isFavorite: boolean;
  cuisineType: string;
  image?: string;
}

interface LocalEatsSectionProps {
  streakCount: number;
  onTimeRate: number;
}

const MOCK_EATS: LocalEat[] = [
  {
    id: '1',
    name: 'Yali\'s Cafe',
    type: 'cafe',
    emoji: '☕',
    rating: 4.7,
    priceLevel: 2,
    distance: 0.2,
    walkTime: 4,
    address: '2375 Shattuck Ave',
    hours: '7am - 6pm',
    description: 'Cozy spot for coffee and pastries near campus',
    isOpen: true,
    isFavorite: true,
    cuisineType: 'Coffee & Tea'
  },
  {
    id: '2',
    name: 'Artis Coffee',
    type: 'cafe',
    emoji: '☕',
    rating: 4.9,
    priceLevel: 2,
    distance: 0.3,
    walkTime: 6,
    address: '1717 University Ave',
    hours: '7am - 5pm',
    description: 'Specialty coffee roaster with great study vibes',
    isOpen: true,
    isFavorite: true,
    cuisineType: 'Coffee & Tea'
  },
  {
    id: '3',
    name: 'Babette',
    type: 'cafe',
    emoji: '🥐',
    rating: 4.7,
    priceLevel: 2,
    distance: 0.8,
    walkTime: 16,
    address: '1700 San Pablo Ave',
    hours: '7am - 3pm',
    description: 'French-inspired cafe with amazing pastries',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'French Cafe'
  },
  {
    id: '4',
    name: 'Cafe Strada',
    type: 'cafe',
    emoji: '☕',
    rating: 4.5,
    priceLevel: 2,
    distance: 0.1,
    walkTime: 2,
    address: '2300 College Ave',
    hours: '6:30am - 7pm',
    description: 'Classic Berkeley cafe with outdoor seating',
    isOpen: true,
    isFavorite: true,
    cuisineType: 'Coffee & Tea'
  },
  {
    id: '5',
    name: 'Blue Bottle Coffee',
    type: 'cafe',
    emoji: '☕',
    rating: 4.6,
    priceLevel: 3,
    distance: 0.5,
    walkTime: 10,
    address: '2139 University Ave',
    hours: '7am - 6pm',
    description: 'Premium coffee with minimalist aesthetic',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Coffee & Tea'
  },
  {
    id: '6',
    name: 'Philz Coffee',
    type: 'cafe',
    emoji: '☕',
    rating: 4.5,
    priceLevel: 2,
    distance: 0.4,
    walkTime: 8,
    address: '2400 Durant Ave',
    hours: '6am - 7pm',
    description: 'Customized coffee blends brewed fresh',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Coffee & Tea'
  },
  {
    id: '7',
    name: 'Nefeli Caffe',
    type: 'cafe',
    emoji: '🍰',
    rating: 4.6,
    priceLevel: 2,
    distance: 0.3,
    walkTime: 6,
    address: '1854 Euclid Ave',
    hours: '7am - 8pm',
    description: 'Mediterranean-inspired cafe with homemade desserts',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Mediterranean Cafe'
  },
  {
    id: '8',
    name: 'The Local Butcher Shop',
    type: 'cafe',
    emoji: '🥪',
    rating: 4.8,
    priceLevel: 2,
    distance: 0.6,
    walkTime: 12,
    address: '1600 Shattuck Ave',
    hours: '9am - 5pm',
    description: 'Cafe serving artisan sandwiches and coffee',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Sandwich Cafe'
  },
  {
    id: '9',
    name: 'Sweetgreen',
    type: 'quick-bites',
    emoji: '🥗',
    rating: 4.5,
    priceLevel: 2,
    distance: 0.3,
    walkTime: 6,
    address: '2498 Telegraph Ave',
    hours: '10:30am - 9pm',
    description: 'Fresh salads and healthy bowls',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Salads & Bowls'
  },
  {
    id: '10',
    name: 'Cream',
    type: 'dessert',
    emoji: '🍦',
    rating: 4.6,
    priceLevel: 2,
    distance: 0.3,
    walkTime: 6,
    address: '2399 Telegraph Ave',
    hours: '12pm - 11pm',
    description: 'Ice cream sandwiches made fresh',
    isOpen: true,
    isFavorite: false,
    cuisineType: 'Ice Cream'
  },
];

export function LocalEatsSection({ streakCount, onTimeRate }: LocalEatsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cafe' | 'restaurant' | 'quick-bites' | 'dessert'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(MOCK_EATS.filter(eat => eat.isFavorite).map(eat => eat.id))
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredEats = MOCK_EATS.filter(eat => {
    const matchesFilter = selectedFilter === 'all' || eat.type === selectedFilter;
    const matchesFavorites = !showFavoritesOnly || favorites.has(eat.id);
    return matchesFilter && matchesFavorites;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const getPriceSymbol = (level: number) => {
    return '$'.repeat(level);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cafe':
        return <Coffee className="w-5 h-5" />;
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'quick-bites':
        return <Sandwich className="w-5 h-5" />;
      case 'dessert':
        return <IceCream className="w-5 h-5" />;
      default:
        return <UtensilsCrossed className="w-5 h-5" />;
    }
  };

  const filters = [
    { id: 'all', label: 'All', icon: UtensilsCrossed },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
    { id: 'quick-bites', label: 'Quick Bites', icon: Sandwich },
    { id: 'dessert', label: 'Dessert', icon: IceCream },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#d4a5a5] to-[#b8c5d6] rounded-3xl p-8 text-white mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6" />
          <span className="text-white/80 text-sm font-medium">Explore Nearby</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Local Eats</h1>
        <p className="text-white/80 text-lg">
          Discover the best cafes and restaurants around campus 🍽️
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-[#e3ddd5] shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#d4a5a5] text-white shadow-md'
                    : 'bg-[#f5f0eb] text-[#6a6a6a] hover:bg-[#e8dfd6]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            showFavoritesOnly
              ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
              : 'bg-[#f5f0eb] text-[#6a6a6a] hover:bg-[#e8dfd6]'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-pink-700' : ''}`} />
          Favorites Only
        </button>
      </div>

      {/* Results Count */}
      <div className="mb-4 px-2">
        <p className="text-sm text-[#8b8680]">
          Found {filteredEats.length} {filteredEats.length === 1 ? 'place' : 'places'}
          {showFavoritesOnly && ' in favorites'}
        </p>
      </div>

      {/* Eats List */}
      <div className="space-y-4">
        {filteredEats.map(eat => (
          <div
            key={eat.id}
            className="bg-white rounded-2xl p-5 border border-[#e3ddd5] shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {/* Emoji Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#fce7e7] to-[#f0f5f8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {eat.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#4a4a4a] truncate">{eat.name}</h3>
                    {!eat.isOpen && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Closed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8b8680] mb-2">{eat.cuisineType}</p>
                  <p className="text-sm text-[#6a6a6a] line-clamp-2">{eat.description}</p>
                </div>
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(eat.id)}
                className="ml-2 p-2 rounded-full hover:bg-pink-50 transition-colors flex-shrink-0"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(eat.id)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-[#c4beb8]'
                  }`}
                />
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-[#4a4a4a]">{eat.rating}</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-green-600">{getPriceSymbol(eat.priceLevel)}</span>
                <span className="text-xs text-[#a09a94]">{getPriceSymbol(4 - eat.priceLevel)}</span>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-[#6a6a6a]">{eat.distance} mi</span>
              </div>

              {/* Walk Time */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#d4a5a5]" />
                <span className="text-sm text-[#6a6a6a]">{eat.walkTime} min walk</span>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="pt-3 border-t border-[#e8dfd6] flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-[#8b8680]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{eat.address}</span>
              </div>
              <div className="flex items-center gap-1 text-[#8b8680]">
                <Clock className="w-3.5 h-3.5" />
                <span>{eat.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-[#4a4a4a] mb-2">No places found</h3>
          <p className="text-[#8b8680]">
            {showFavoritesOnly
              ? 'You haven\'t favorited any places yet'
              : 'Try adjusting your filters'}
          </p>
        </div>
      )}
    </div>
  );
}