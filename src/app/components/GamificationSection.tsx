import { useState, useEffect } from 'react';
import { Hammer, Sparkles, TrendingUp, AlertTriangle, Trophy, Store, UtensilsCrossed, Clapperboard, Coffee, Flower2, Music, Sandwich, BookOpen, Croissant, Palette, PawPrint, Guitar } from 'lucide-react';

interface DreamShop {
  id: string;
  type: 'ice-cream' | 'restaurant' | 'theater' | 'cat-cafe' | 'flower-shop' | 'jazz-bar' | 'fast-food' | 'bookstore' | 'bakery' | 'art-gallery' | 'music-store' | 'pet-shop';
  name: string;
  emoji: string;
  progress: number; // 0-100
  isActive: boolean;
}

interface GamificationSectionProps {
  streakCount: number;
  onTimeRate: number;
  onShowDailySummary?: () => void;
  onShowSemesterWrapped?: () => void;
}

// CSS Illustrations for each shop type
function IceCreamShopIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Ice cream sign */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 -mt-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[#f4a261] to-[#e76f51] rounded-tl-full rounded-tr-full"></div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-br from-[#ff6b9d] to-[#c9184a] rounded-full"></div>
      </div>
      {/* Awning */}
      <div className="absolute top-2 left-0 right-0 h-8 bg-gradient-to-b from-[#ff6b9d] to-[#ff85ab] rounded-t-lg overflow-hidden">
        <div className="flex h-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white/40' : ''}`}></div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-[#c9184a]/30 rounded-b-full"></div>
      </div>
      {/* Cart body */}
      <div className="absolute top-10 left-1 right-1 h-10 bg-gradient-to-br from-[#ffd60a] to-[#fca311] rounded-lg border-2 border-[#d4a373]"></div>
      {/* Wheels */}
      <div className="absolute bottom-1 left-2 w-5 h-5 rounded-full bg-[#6b4423] border-2 border-[#d4a373] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#8b6939]"></div>
      </div>
      <div className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-[#6b4423] border-2 border-[#d4a373] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#8b6939]"></div>
      </div>
    </div>
  );
}

function RestaurantIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#f4a261] to-[#e76f51] rounded-lg border-2 border-[#d4a373]">
        {/* Windows */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#ffd60a] rounded-sm"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#ffd60a] rounded-sm"></div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 bg-[#6b4423] rounded-t-lg border-2 border-[#8b6939]"></div>
      </div>
      {/* Awning */}
      <div className="absolute top-6 left-0 right-0 h-4 bg-gradient-to-b from-[#e63946] to-[#c9184a] rounded-sm">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-transparent to-black/20 rounded-b-full"></div>
      </div>
      {/* Utensils decoration */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1">
        <UtensilsCrossed className="w-4 h-4 text-[#ffd60a]" />
      </div>
    </div>
  );
}

function MovieTheaterIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Screen */}
      <div className="absolute top-4 left-3 right-3 h-12 bg-gradient-to-br from-[#a8dadc] to-[#457b9d] rounded-lg border-2 border-[#1d3557]">
        {/* Screen reflection */}
        <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-3 left-2 w-8 h-1 bg-white/20 rounded-full rotate-12"></div>
      </div>
      {/* Curtains */}
      <div className="absolute top-2 left-0 w-6 h-16 bg-gradient-to-br from-[#e63946] to-[#c9184a] rounded-r-full opacity-90"></div>
      <div className="absolute top-2 right-0 w-6 h-16 bg-gradient-to-bl from-[#e63946] to-[#c9184a] rounded-l-full opacity-90"></div>
      {/* Seats */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gradient-to-b from-[#e63946] to-[#c9184a] rounded-t-lg"></div>
        ))}
      </div>
    </div>
  );
}

function CatCafeIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#f4a5f5] to-[#d896d8] rounded-lg border-2 border-[#b87bb8]">
        {/* Window */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-8 bg-[#ffd6ff] rounded-lg border-2 border-[#e0aaff]">
          <div className="absolute inset-1 grid grid-cols-2 gap-1">
            <div className="border border-[#e0aaff]"></div>
            <div className="border border-[#e0aaff]"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#b87bb8] rounded-t-lg"></div>
      </div>
      {/* Awning */}
      <div className="absolute top-6 left-0 right-0 h-3 bg-gradient-to-b from-[#ff85ab] to-[#ff6b9d] rounded-sm"></div>
      {/* Cat ears decoration */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-3">
        <div className="w-3 h-3 bg-[#ff85ab] rounded-full"></div>
        <div className="w-3 h-3 bg-[#ff85ab] rounded-full"></div>
      </div>
      {/* Coffee cup */}
      <div className="absolute top-1 right-1 w-4 h-4">
        <Coffee className="w-full h-full text-[#ffd60a]" />
      </div>
    </div>
  );
}

function FlowerShopIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Shop front */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#ffd6a5] to-[#fdcb6e] rounded-lg border-2 border-[#d4a373]">
        {/* Display window */}
        <div className="absolute top-2 left-2 right-2 h-10 bg-[#e8f4f0] rounded-lg border-2 border-[#a8c5b8]">
          {/* Flowers in window */}
          <div className="absolute bottom-1 left-1 flex gap-1">
            <div className="w-3 h-4 bg-[#ff6b9d] rounded-full"></div>
            <div className="w-3 h-4 bg-[#c9b8d4] rounded-full"></div>
            <div className="w-3 h-4 bg-[#ffd60a] rounded-full"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#8b6939] rounded-t-lg"></div>
      </div>
      {/* Awning */}
      <div className="absolute top-6 left-0 right-0 h-4 bg-gradient-to-b from-[#6b9d8e] to-[#5a8a7b] rounded-sm"></div>
      {/* Flower decoration */}
      <div className="absolute top-0 right-1">
        <Flower2 className="w-5 h-5 text-[#ff6b9d]" />
      </div>
    </div>
  );
}

function JazzBarIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-lg border-2 border-[#1a252f]">
        {/* Neon sign window */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-6 bg-[#e63946] rounded-md border-2 border-[#c9184a] shadow-lg shadow-[#e63946]/50">
          <div className="absolute top-1 left-1 right-1 h-0.5 bg-white/60 rounded-full"></div>
        </div>
        {/* Windows */}
        <div className="absolute bottom-4 left-2 w-4 h-4 bg-[#ffd60a] rounded-sm opacity-70"></div>
        <div className="absolute bottom-4 right-2 w-4 h-4 bg-[#ffd60a] rounded-sm opacity-70"></div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#1a252f] rounded-t-lg"></div>
      </div>
      {/* Music note decoration */}
      <div className="absolute top-0 left-1">
        <Music className="w-5 h-5 text-[#e63946]" />
      </div>
    </div>
  );
}

function FastFoodIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#e63946] to-[#c9184a] rounded-lg border-2 border-[#a01628]">
        {/* Menu board window */}
        <div className="absolute top-2 left-2 right-2 h-8 bg-[#1a252f] rounded-lg border-2 border-[#ffd60a]">
          <div className="flex gap-1 p-1">
            <div className="flex-1 h-1 bg-[#ffd60a] rounded-full"></div>
            <div className="flex-1 h-1 bg-[#ffd60a] rounded-full"></div>
          </div>
          <div className="flex gap-1 p-1">
            <div className="flex-1 h-1 bg-[#ffd60a] rounded-full"></div>
            <div className="flex-1 h-1 bg-[#ffd60a] rounded-full"></div>
          </div>
        </div>
        {/* Counter */}
        <div className="absolute bottom-2 left-2 right-2 h-3 bg-white rounded-sm"></div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-[#6b4423] rounded-t-md"></div>
      </div>
      {/* Sandwich icon */}
      <div className="absolute top-0 right-0">
        <Sandwich className="w-5 h-5 text-[#ffd60a]" />
      </div>
    </div>
  );
}

function BookstoreIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#6b4423] to-[#8b6939] rounded-lg border-2 border-[#5a3a1e]">
        {/* Large display window */}
        <div className="absolute top-2 left-2 right-2 h-12 bg-[#faf8f6] rounded-lg border-2 border-[#d4a373]">
          {/* Books in window */}
          <div className="absolute inset-1 flex gap-0.5">
            <div className="w-2 bg-[#e63946] rounded-sm"></div>
            <div className="w-2 bg-[#457b9d] rounded-sm"></div>
            <div className="w-2 bg-[#6b9d8e] rounded-sm"></div>
            <div className="w-2 bg-[#c9b8d4] rounded-sm"></div>
            <div className="w-2 bg-[#e8c7a6] rounded-sm"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#5a3a1e] rounded-t-lg"></div>
      </div>
      {/* Book icon */}
      <div className="absolute top-0 left-0">
        <BookOpen className="w-5 h-5 text-[#e8c7a6]" />
      </div>
    </div>
  );
}

function BakeryIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#fef3e8] to-[#fdd9b5] rounded-lg border-2 border-[#e8c7a6]">
        {/* Window with baked goods */}
        <div className="absolute top-2 left-2 right-2 h-10 bg-white rounded-lg border-2 border-[#fca311]">
          {/* Pastries */}
          <div className="absolute bottom-1 left-1 flex gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-[#fca311] to-[#f48c06] rounded-full"></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#e8c7a6] to-[#d4a896] rounded-t-full"></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#fca311] to-[#f48c06] rounded-full"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#d4a373] rounded-t-lg"></div>
      </div>
      {/* Striped awning */}
      <div className="absolute top-6 left-0 right-0 h-4 bg-gradient-to-b from-[#fca311] to-[#f48c06] rounded-sm overflow-hidden">
        <div className="flex h-full">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white/40' : ''}`}></div>
          ))}
        </div>
      </div>
      {/* Croissant icon */}
      <div className="absolute top-0 right-0">
        <Croissant className="w-5 h-5 text-[#fca311]" />
      </div>
    </div>
  );
}

function ArtGalleryIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#f5f0f5] to-[#e0d5e8] rounded-lg border-2 border-[#c9b8d4]">
        {/* Large gallery window */}
        <div className="absolute top-2 left-2 right-2 h-12 bg-white rounded-lg border-2 border-[#b8a8c4]">
          {/* Art pieces */}
          <div className="absolute inset-2 grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-[#e63946] to-[#ff6b9d] rounded-sm"></div>
            <div className="bg-gradient-to-br from-[#457b9d] to-[#a8dadc] rounded-sm"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#8b7a98] rounded-t-lg"></div>
      </div>
      {/* Palette icon */}
      <div className="absolute top-0 left-0">
        <Palette className="w-5 h-5 text-[#c9b8d4]" />
      </div>
    </div>
  );
}

function MusicStoreIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#457b9d] to-[#1d3557] rounded-lg border-2 border-[#2b4f6d]">
        {/* Display window with guitars */}
        <div className="absolute top-2 left-2 right-2 h-10 bg-[#a8dadc] rounded-lg border-2 border-[#6b9db8]">
          {/* Guitar silhouettes */}
          <div className="absolute inset-1 flex gap-2 justify-center items-end">
            <div className="w-2 h-6 bg-[#e76f51] rounded-t-full rounded-b-lg"></div>
            <div className="w-2 h-7 bg-[#f4a261] rounded-t-full rounded-b-lg"></div>
            <div className="w-2 h-6 bg-[#e9c46a] rounded-t-full rounded-b-lg"></div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#1a2938] rounded-t-lg"></div>
      </div>
      {/* Guitar icon */}
      <div className="absolute top-0 right-0">
        <Guitar className="w-5 h-5 text-[#f4a261]" />
      </div>
    </div>
  );
}

function PetShopIllustration() {
  return (
    <div className="relative w-24 h-24">
      {/* Building */}
      <div className="absolute inset-2 bg-gradient-to-br from-[#a8c5b8] to-[#6b9d8e] rounded-lg border-2 border-[#5a8a7b]">
        {/* Window with pet silhouettes */}
        <div className="absolute top-2 left-2 right-2 h-10 bg-[#e8f4f0] rounded-lg border-2 border-[#c4e0d8]">
          {/* Pet faces */}
          <div className="absolute inset-1 flex gap-2 justify-center items-center">
            <div className="relative w-5 h-5">
              {/* Dog */}
              <div className="w-5 h-5 bg-[#d4a373] rounded-full"></div>
              <div className="absolute -top-1 left-0 w-2 h-2 bg-[#d4a373] rounded-full"></div>
              <div className="absolute -top-1 right-0 w-2 h-2 bg-[#d4a373] rounded-full"></div>
            </div>
            <div className="relative w-5 h-5">
              {/* Cat */}
              <div className="w-5 h-5 bg-[#8b8680] rounded-full"></div>
              <div className="absolute -top-1 left-0 w-1.5 h-2 bg-[#8b8680] rounded-full rotate-[-20deg]"></div>
              <div className="absolute -top-1 right-0 w-1.5 h-2 bg-[#8b8680] rounded-full rotate-[20deg]"></div>
            </div>
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#4a7a6a] rounded-t-lg"></div>
      </div>
      {/* Paw icon */}
      <div className="absolute top-0 left-0">
        <PawPrint className="w-5 h-5 text-[#ffd60a]" />
      </div>
    </div>
  );
}

export function GamificationSection({ streakCount, onTimeRate, onShowDailySummary, onShowSemesterWrapped }: GamificationSectionProps) {
  const [selectedShopType, setSelectedShopType] = useState<DreamShop['type'] | null>(null);
  const [dreamShops, setDreamShops] = useState<DreamShop[]>([]);
  const [streakBroken, setStreakBroken] = useState(false);

  // Load dream shops from localStorage or initialize with default state
  useEffect(() => {
    const saved = localStorage.getItem('dreamShops');
    if (saved) {
      setDreamShops(JSON.parse(saved));
    } else {
      // Initialize with 3 completed shops and 1 under construction
      const defaultShops: DreamShop[] = [
        {
          id: '1',
          type: 'ice-cream',
          name: 'Ice Cream Shop',
          emoji: '🍦',
          progress: 100,
          isActive: false
        },
        {
          id: '2',
          type: 'restaurant',
          name: 'Restaurant',
          emoji: '🍽️',
          progress: 100,
          isActive: false
        },
        {
          id: '3',
          type: 'cat-cafe',
          name: 'Cat Café',
          emoji: '🐱',
          progress: 100,
          isActive: false
        },
        {
          id: '4',
          type: 'theater',
          name: 'Movie Theater',
          emoji: '🎬',
          progress: streakCount * 3,
          isActive: true
        }
      ];
      setDreamShops(defaultShops);
      localStorage.setItem('dreamShops', JSON.stringify(defaultShops));
    }
  }, []);

  // Save dream shops to localStorage
  const saveDreamShops = (shops: DreamShop[]) => {
    setDreamShops(shops);
    localStorage.setItem('dreamShops', JSON.stringify(shops));
  };

  const shopTypes = [
    {
      type: 'ice-cream' as const,
      name: 'Ice Cream Shop',
      emoji: '🍦',
      icon: Store,
      description: 'Sweet treats for everyone',
      illustration: IceCreamShopIllustration
    },
    {
      type: 'restaurant' as const,
      name: 'Restaurant',
      emoji: '🍽️',
      icon: UtensilsCrossed,
      description: 'Delicious meals and vibes',
      illustration: RestaurantIllustration
    },
    {
      type: 'theater' as const,
      name: 'Movie Theater',
      emoji: '🎬',
      icon: Clapperboard,
      description: 'Entertainment for the community',
      illustration: MovieTheaterIllustration
    },
    {
      type: 'cat-cafe' as const,
      name: 'Cat Café',
      emoji: '🐱',
      icon: Coffee,
      description: 'Cozy space with fluffy friends',
      illustration: CatCafeIllustration
    },
    {
      type: 'flower-shop' as const,
      name: 'Flower Shop',
      emoji: '🌸',
      icon: Flower2,
      description: 'Beautiful blooms and bouquets',
      illustration: FlowerShopIllustration
    },
    {
      type: 'jazz-bar' as const,
      name: 'Jazz Bar',
      emoji: '🎷',
      icon: Music,
      description: 'Smooth tunes and good times',
      illustration: JazzBarIllustration
    },
    {
      type: 'fast-food' as const,
      name: 'Fast Food',
      emoji: '🍔',
      icon: Sandwich,
      description: 'Quick bites on the go',
      illustration: FastFoodIllustration
    },
    {
      type: 'bookstore' as const,
      name: 'Bookstore',
      emoji: '📚',
      icon: BookOpen,
      description: 'Stories and knowledge for all',
      illustration: BookstoreIllustration
    },
    {
      type: 'bakery' as const,
      name: 'Bakery',
      emoji: '🥐',
      icon: Croissant,
      description: 'Fresh bread and pastries daily',
      illustration: BakeryIllustration
    },
    {
      type: 'art-gallery' as const,
      name: 'Art Gallery',
      emoji: '🎨',
      icon: Palette,
      description: 'Inspiring art and exhibitions',
      illustration: ArtGalleryIllustration
    },
    {
      type: 'music-store' as const,
      name: 'Music Store',
      emoji: '🎸',
      icon: Guitar,
      description: 'Instruments and melodies',
      illustration: MusicStoreIllustration
    },
    {
      type: 'pet-shop' as const,
      name: 'Pet Shop',
      emoji: '🐾',
      icon: PawPrint,
      description: 'Furry friends and pet supplies',
      illustration: PetShopIllustration
    }
  ];

  const getShopStatus = (type: DreamShop['type']) => {
    const shop = dreamShops.find(s => s.type === type);
    // If this shop is the active one, it's under construction
    if (shop?.isActive) return 'in-construction';
    // Otherwise, treat as completed (default state)
    return 'completed';
  };

  const createShop = (type: DreamShop['type']) => {
    const shopType = shopTypes.find(s => s.type === type)!;
    const newShop: DreamShop = {
      id: Date.now().toString(),
      type,
      name: shopType.name,
      emoji: shopType.emoji,
      progress: 0,
      isActive: true
    };

    saveDreamShops([...dreamShops, newShop]);
    setSelectedShopType(null);
  };

  const activeShop = dreamShops.find(shop => shop.isActive);

  // Calculate construction progress based on streak
  const constructionProgress = activeShop ? Math.min(streakCount * 3, 100) : 0;

  // Update active shop progress
  useEffect(() => {
    if (activeShop && constructionProgress !== activeShop.progress) {
      saveDreamShops(
        dreamShops.map(shop =>
          shop.id === activeShop.id ? { ...shop, progress: constructionProgress } : shop
        )
      );
    }
  }, [constructionProgress, activeShop, dreamShops]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#c9b8d4] to-[#d4a5a5] rounded-3xl p-8 text-white mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="w-6 h-6" />
              <span className="text-white/80 text-sm font-medium">Urban Dream Shop</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Build Your Dream</h1>
            <p className="text-white/80 text-lg">
              Keep your streak going to complete construction! 🏗️
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/30">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{streakCount}</div>
            <div className="text-xs text-white/80">days strong</div>
          </div>
        </div>
      </div>

      {/* Active Shop Construction - Horizontal Rectangle */}
      {activeShop && (
        <div className="bg-white rounded-2xl p-6 border-2 border-[#d4a5a5] shadow-sm mb-6">
          <div className="flex items-center gap-6">
            {/* Building Preview with Construction Overlay */}
            <div className="relative w-32 h-32 flex-shrink-0">
              {/* Grid pattern building */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-2 bg-[#f5f1ec] rounded-xl border-2 border-[#e3ddd5]">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-[#d4cec4] rounded-sm"></div>
                ))}
              </div>
              {/* Construction emoji overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl bg-white/40 backdrop-blur-[2px] rounded-xl">
                🚧
              </div>
            </div>

            {/* Construction Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-[#4a4a4a]">{activeShop.name}</h2>
                <span className="px-2 py-1 bg-[#fef3e8] text-[#d4a896] text-xs rounded-full font-medium">
                  Under Construction
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#6a6a6a]">Construction Progress</span>
                  <span className="text-sm font-bold text-[#d4a5a5]">{constructionProgress}%</span>
                </div>
                <div className="w-full h-3 bg-[#f5f1ec] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c9b8d4] to-[#d4a5a5] transition-all duration-500"
                    style={{ width: `${constructionProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex-1 bg-[#f5f0f5] rounded-lg p-2">
                  <p className="text-xs text-[#8b8680]">Days Left</p>
                  <p className="text-lg font-bold text-[#c9b8d4]">
                    {Math.max(0, Math.ceil((100 - constructionProgress) / 3))}
                  </p>
                </div>
                <div className="flex-1 bg-[#fce7e7] rounded-lg p-2">
                  <p className="text-xs text-[#8b8680]">Streak</p>
                  <p className="text-lg font-bold text-[#d4a5a5]">{streakCount} 🔥</p>
                </div>
                <div className="flex-1 bg-[#e8f4f0] rounded-lg p-2">
                  <p className="text-xs text-[#8b8680]">On-Time</p>
                  <p className="text-lg font-bold text-[#6b9d8e]">{onTimeRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion */}
          {constructionProgress >= 100 && (
            <div className="mt-4 bg-gradient-to-r from-[#e8f4f0] to-[#e1f0eb] border-2 border-[#c4e0d8] rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-[#4a4a4a] mb-1">Construction Complete!</h3>
              <p className="text-sm text-[#8b8680] mb-3">Your {activeShop.name} is now open for business!</p>
              <button
                onClick={() => {
                  saveDreamShops(
                    dreamShops.map(shop =>
                      shop.id === activeShop.id ? { ...shop, isActive: false } : shop
                    )
                  );
                }}
                className="px-6 py-2 bg-[#a8c5b8] text-white rounded-xl font-medium hover:bg-[#95b5a8] transition-colors text-sm"
              >
                Complete & Start New Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cute Neighborhood - Vertical Stack */}
      <div className="bg-gradient-to-b from-[#f0f5f8] to-[#faf8f6] rounded-3xl p-8 border-2 border-[#e3ddd5] shadow-sm mb-6 overflow-hidden">
        <h2 className="text-2xl font-bold text-[#4a4a4a] mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#e8c7a6]" />
          Your Neighborhood
        </h2>

        {/* Vertical stacked buildings */}
        <div className="space-y-4">
          {shopTypes.map((shop, index) => {
            const status = getShopStatus(shop.type);
            const Illustration = shop.illustration;
            const isActive = status === 'in-construction';
            const isCompleted = status === 'completed';

            // Different pastel colors for each building
            const buildingColors = [
              { bg: 'bg-[#fce7e7]', accent: 'bg-[#d4a5a5]', border: 'border-[#f0c9c9]' }, // Pink
              { bg: 'bg-[#fef3e8]', accent: 'bg-[#e8c7a6]', border: 'border-[#f5dfc4]' }, // Peach
              { bg: 'bg-[#f0f5f8]', accent: 'bg-[#b8c5d6]', border: 'border-[#d4e0ed]' }, // Blue
              { bg: 'bg-[#f5f0f5]', accent: 'bg-[#c9b8d4]', border: 'border-[#e0d5e8]' }  // Purple
            ];
            const colors = buildingColors[index % buildingColors.length];

            return (
              <div
                key={shop.type}
                className="w-full group transition-all"
              >
                {/* Building Structure */}
                <div className={`relative rounded-3xl border-4 ${colors.border} overflow-hidden shadow-lg transition-all`}>
                  {/* Roof/Awning */}
                  <div className={`h-8 ${colors.accent} relative`}>
                    <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent"></div>
                  </div>

                  {/* Main Building Content */}
                  <div className={`${colors.bg} p-6 min-h-[140px] flex items-center gap-6`}>
                    {/* Shop Illustration/Status */}
                    <div className="flex-shrink-0">
                      {isActive ? (
                        // In construction: Building grid with construction
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2 bg-[#e3ddd5] rounded-2xl border-4 border-[#d4cec4]">
                            {[...Array(16)].map((_, i) => (
                              <div key={i} className="bg-[#8b8680] rounded-sm"></div>
                            ))}
                          </div>
                          {/* Construction overlay */}
                          <div className="absolute inset-0 flex items-center justify-center text-5xl bg-white/60 backdrop-blur-sm rounded-2xl">
                            🚧
                          </div>
                        </div>
                      ) : (
                        // Completed: Show cute CSS illustration
                        <div className="relative">
                          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-md">
                            <Illustration />
                          </div>
                          {/* Open sign */}
                          <div className="absolute -top-2 -right-2 bg-[#6b9d8e] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            OPEN
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shop Details */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-[#4a4a4a]">
                          {shop.name}
                        </h3>
                        {!isActive && (
                          <span className="px-2 py-0.5 bg-[#6b9d8e] text-white text-xs rounded-full font-bold">
                            ✓
                          </span>
                        )}
                        {isActive && (
                          <span className="px-2 py-0.5 bg-[#d4a896] text-white text-xs rounded-full font-bold animate-pulse">
                            Building...
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8b8680] mb-3">{shop.description}</p>

                      {!isActive && (
                        <div className="text-sm text-[#6b9d8e] font-medium">
                          Now serving customers! 🎉
                        </div>
                      )}
                    </div>

                    {/* Window decorations for completed buildings */}
                    {!isActive && (
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#6b9d8e] animate-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-[#e8c7a6] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 rounded-full bg-[#d4a5a5] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Ground/Base */}
                  <div className="h-3 bg-gradient-to-b from-[#8b8680]/20 to-[#8b8680]/40"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-6 bg-[#faf8f6] rounded-2xl p-6 border border-[#e3ddd5]">
        <h3 className="font-semibold text-[#4a4a4a] mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-[#6a6a6a]">
          <li className="flex items-start gap-2">
            <span className="text-[#d4a5a5] mt-0.5">1.</span>
            <span>Choose your dream shop to start building</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a5a5] mt-0.5">2.</span>
            <span>Construction progresses 3% for each day you maintain your streak</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a5a5] mt-0.5">3.</span>
            <span>If you break your streak, construction is delayed until you get back on track</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#d4a5a5] mt-0.5">4.</span>
            <span>Complete the shop at 100% and start building something new!</span>
          </li>
        </ul>
      </div>

      {/* Activity Summary Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={onShowDailySummary}
          className="bg-gradient-to-r from-[#6b9d8e] to-[#5a8a7b] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left"
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold mb-1">Daily Summary</h3>
          <p className="text-xs text-white/80">View today's transit activity</p>
        </button>

        <button
          onClick={onShowSemesterWrapped}
          className="bg-gradient-to-r from-[#c9b8d4] to-[#b8a8c4] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left"
        >
          <div className="text-3xl mb-2">🎓</div>
          <h3 className="font-bold mb-1">Semester Wrapped</h3>
          <p className="text-xs text-white/80">Celebrate your achievements</p>
        </button>
      </div>
    </div>
  );
}