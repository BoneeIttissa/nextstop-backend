import { useState } from 'react';
import { Star, Plus, X, MapPin, Edit2, Trash2, Search } from 'lucide-react';
import { EmojiPicker } from './EmojiCustomizer';

export interface StarredLocation {
  id: string;
  name: string;
  address: string;
  emoji: string;
  notes?: string;
  lat: number;
  lng: number;
}

interface StarredLocationsProps {
  locations: StarredLocation[];
  onAdd: (location: Omit<StarredLocation, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, location: Partial<StarredLocation>) => void;
}

export function StarredLocations({ locations, onAdd, onRemove, onUpdate }: StarredLocationsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | 'new'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    emoji: '📍',
    notes: '',
    lat: 37.8719,
    lng: -122.2585
  });

  // Mock campus locations (will be replaced with Google Places Autocomplete API)
  const mockLocations = [
    { name: 'Doe Memorial Library', address: '101 Doe Memorial Library, Berkeley, CA 94720', lat: 37.8725, lng: -122.2597 },
    { name: 'MLK Student Union', address: '2495 Bancroft Way, Berkeley, CA 94720', lat: 37.8690, lng: -122.2601 },
    { name: 'Recreational Sports Facility (RSF)', address: '2301 Bancroft Way, Berkeley, CA 94720', lat: 37.8686, lng: -122.2626 },
    { name: 'Zellerbach Hall', address: '101 Zellerbach Hall, Berkeley, CA 94720', lat: 37.8713, lng: -122.2623 },
    { name: 'Haas Pavilion', address: '2227 Piedmont Ave, Berkeley, CA 94720', lat: 37.8693, lng: -122.2621 },
    { name: 'Botanical Garden', address: '200 Centennial Dr, Berkeley, CA 94720', lat: 37.8755, lng: -122.2394 },
    { name: 'Campanile (Sather Tower)', address: 'Campanile Way, Berkeley, CA 94720', lat: 37.8720, lng: -122.2576 },
    { name: 'International House', address: '2299 Piedmont Ave, Berkeley, CA 94720', lat: 37.8700, lng: -122.2540 },
    { name: 'Li Ka Shing Center', address: '1951 Oxford St, Berkeley, CA 94704', lat: 37.8747, lng: -122.2653 },
    { name: 'Café 3', address: '2329 Piedmont Ave, Berkeley, CA 94720', lat: 37.8705, lng: -122.2526 }
  ];

  const filteredSuggestions = mockLocations.filter(loc =>
    searchQuery.length > 0 &&
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSuggestion = (suggestion: typeof mockLocations[0]) => {
    setNewLocation({
      name: suggestion.name,
      address: suggestion.address,
      emoji: newLocation.emoji,
      notes: newLocation.notes,
      lat: suggestion.lat,
      lng: suggestion.lng
    });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (newLocation.name && newLocation.address) {
      onAdd(newLocation);
      setNewLocation({
        name: '',
        address: '',
        emoji: '📍',
        notes: '',
        lat: 37.8719,
        lng: -122.2585
      });
      setShowAddForm(false);
    }
  };

  const handleEmojiSelect = (locationId: string | 'new', emoji: string) => {
    if (locationId === 'new') {
      setNewLocation(prev => ({ ...prev, emoji }));
    } else {
      onUpdate(locationId, { emoji });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e3ddd5] shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-[#e3ddd5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#e8c7a6] fill-[#e8c7a6]" />
            <h2 className="font-semibold text-[#4a4a4a]">Starred Locations</h2>
            <span className="px-2 py-0.5 bg-[#f5f1ec] text-[#8b8680] text-xs rounded-full">
              {locations.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#f0e8e8] text-[#d4a5a5] rounded-lg hover:bg-[#e8dfd6] transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-[#faf8f6] border-b border-[#e3ddd5]">
          <div className="space-y-3">
            {/* Search Location Input with Autocomplete */}
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2 border border-[#d4cec4] rounded-lg bg-white">
                <Search className="w-5 h-5 text-[#8b8680]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for a location..."
                  className="flex-1 focus:outline-none text-sm"
                />
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e3ddd5] rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-[#faf8f6] transition-colors border-b border-[#e3ddd5] last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#8b8680] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#4a4a4a] text-sm">{suggestion.name}</p>
                          <p className="text-xs text-[#8b8680] mt-0.5">{suggestion.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* API Integration Note */}
              <p className="text-xs text-[#b8c5d6] mt-1.5 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-[#b8c5d6] rounded-full"></span>
                Will use Google Places Autocomplete API
              </p>
            </div>

            {/* Selected Location Display */}
            {newLocation.name && (
              <div className="bg-white border border-[#e3ddd5] rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setEmojiPickerFor('new');
                      setShowEmojiPicker(true);
                    }}
                    className="text-3xl p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {newLocation.emoji}
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-[#4a4a4a]">{newLocation.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-[#8b8680] mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{newLocation.address}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewLocation({
                        name: '',
                        address: '',
                        emoji: '📍',
                        notes: '',
                        lat: 37.8719,
                        lng: -122.2585
                      });
                      setSearchQuery('');
                    }}
                    className="p-1 rounded-lg hover:bg-[#f5f1ec] text-[#8b8680]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Notes Input */}
            <input
              type="text"
              value={newLocation.notes}
              onChange={(e) => setNewLocation(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes (optional)"
              className="w-full px-4 py-2 border border-[#e3ddd5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] text-sm"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newLocation.name || !newLocation.address}
                className="flex-1 px-4 py-2 bg-[#d4a5a5] text-white rounded-lg hover:bg-[#c69595] transition-colors disabled:bg-[#d4cec4] disabled:cursor-not-allowed font-medium"
              >
                Add Location
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewLocation({
                    name: '',
                    address: '',
                    emoji: '📍',
                    notes: '',
                    lat: 37.8719,
                    lng: -122.2585
                  });
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#ede9e4] text-[#6a6a6a] rounded-lg hover:bg-[#e3ddd5] transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="divide-y divide-[#e3ddd5]">
        {locations.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 text-[#d4cec4] mx-auto mb-3" />
            <p className="text-[#8b8680] mb-1">No starred locations yet</p>
            <p className="text-sm text-[#aba59a]">
              Save places you want to visit but don't need daily routes for
            </p>
          </div>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className={`p-4 hover:bg-[#faf8f6] transition-colors ${
                editingId === location.id ? 'bg-[#f5f1ec]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    setEmojiPickerFor(location.id);
                    setShowEmojiPicker(true);
                  }}
                  className="text-2xl p-1 rounded-lg hover:bg-[#ede9e4] transition-colors"
                >
                  {location.emoji}
                </button>
                <div className="flex-1">
                  {editingId === location.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => onUpdate(location.id, { name: e.target.value })}
                        className="w-full px-3 py-1.5 border border-[#e3ddd5] rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => onUpdate(location.id, { address: e.target.value })}
                        className="w-full px-3 py-1.5 border border-[#e3ddd5] rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={location.notes || ''}
                        onChange={(e) => onUpdate(location.id, { notes: e.target.value })}
                        placeholder="Notes (optional)"
                        className="w-full px-3 py-1.5 border border-[#e3ddd5] rounded-lg text-sm"
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-[#d4a5a5] text-white rounded-lg text-sm font-medium"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-[#4a4a4a]">{location.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-[#8b8680] mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{location.address}</span>
                      </div>
                      {location.notes && (
                        <p className="text-sm text-[#8b8680] mt-1">{location.notes}</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(editingId === location.id ? null : location.id)}
                    className="p-1.5 rounded-lg hover:bg-[#ede9e4] text-[#8b8680] hover:text-[#b8c5d6] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemove(location.id)}
                    className="p-1.5 rounded-lg hover:bg-[#ede9e4] text-[#8b8680] hover:text-[#d4a5a5] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          currentEmoji={emojiPickerFor === 'new' ? newLocation.emoji : locations.find(l => l.id === emojiPickerFor)?.emoji || '📍'}
          onSelect={(emoji) => handleEmojiSelect(emojiPickerFor, emoji)}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
