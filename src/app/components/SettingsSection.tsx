import { Bell, Calendar, Palette, Database, Info, Sparkles } from 'lucide-react';
import { ClassEmojiCustomizer } from './EmojiCustomizer';

interface Class {
  id: string;
  code: string;
  name: string;
  emoji?: string;
}

interface SettingsSectionProps {
  schedule: Class[];
  onEmojiChange: (classId: string, emoji: string) => void;
  onOpenSemesterWrapped?: () => void;
}

export function SettingsSection({ schedule, onEmojiChange, onOpenSemesterWrapped }: SettingsSectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">Settings</h1>
        <p className="text-[#8b8680]">Customize your NextStop experience</p>
      </div>

      {/* Class Emoji Customization */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#c9b8d4]" />
          <h2 className="text-xl font-semibold text-[#4a4a4a]">Class Emojis</h2>
        </div>
        <p className="text-sm text-[#8b8680] mb-4">
          Personalize each class with a custom emoji for easier recognition
        </p>
        <div className="space-y-2">
          {schedule.map((cls) => (
            <ClassEmojiCustomizer
              key={cls.id}
              classCode={cls.code}
              className={cls.name}
              currentEmoji={cls.emoji || '📚'}
              onEmojiChange={(emoji) => onEmojiChange(cls.id, emoji)}
            />
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[#b8c5d6]" />
          <h2 className="text-xl font-semibold text-[#4a4a4a]">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#e3ddd5]">
            <div>
              <p className="font-medium text-[#4a4a4a]">Smart Alarms</p>
              <p className="text-sm text-[#8b8680]">Get notified when to leave for class</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#e3ddd5] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f0c9c9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#d4cec4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a5a5]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#e3ddd5]">
            <div>
              <p className="font-medium text-[#4a4a4a]">Bus Capacity Alerts</p>
              <p className="text-sm text-[#8b8680]">Alert when buses are getting full</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#e3ddd5] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f0c9c9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#d4cec4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a5a5]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-[#4a4a4a]">Delay Notifications</p>
              <p className="text-sm text-[#8b8680]">Get alerts about bus delays</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#e3ddd5] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f0c9c9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#d4cec4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a5a5]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Calendar Integration */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#a8c5b8]" />
          <h2 className="text-xl font-semibold text-[#4a4a4a]">Calendar Integration</h2>
        </div>
        <p className="text-sm text-[#8b8680] mb-4">
          Connect your calendar to automatically sync class schedules
        </p>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 border-2 border-[#e3ddd5] rounded-xl hover:border-[#b8c5d6] hover:bg-[#f0f5f8] transition-all text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0f5f8] rounded-lg flex items-center justify-center">
                📅
              </div>
              <div>
                <p className="font-medium text-[#4a4a4a]">Google Calendar</p>
                <p className="text-xs text-[#8b8680]">Sync with Google Calendar</p>
              </div>
            </div>
            <span className="text-sm text-[#b8c5d6] font-medium">Connect</span>
          </button>

          <button className="w-full px-4 py-3 border-2 border-[#e3ddd5] rounded-xl hover:border-[#e8c7a6] hover:bg-[#fef3e8] transition-all text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fef3e8] rounded-lg flex items-center justify-center">
                📚
              </div>
              <div>
                <p className="font-medium text-[#4a4a4a]">bCourses/Canvas</p>
                <p className="text-xs text-[#8b8680]">Import class schedule</p>
              </div>
            </div>
            <span className="text-sm text-[#d4a896] font-medium">Connect</span>
          </button>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ddd5] shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-[#8b8680]" />
          <h2 className="text-xl font-semibold text-[#4a4a4a]">Data & Privacy</h2>
        </div>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-[#faf8f6] rounded-xl hover:bg-[#f5f1ec] transition-all text-left">
            <p className="font-medium text-[#4a4a4a]">Export Your Data</p>
            <p className="text-sm text-[#8b8680] mt-1">Download all your preferences and history</p>
          </button>
          <button className="w-full px-4 py-3 bg-[#fce7e7] rounded-xl hover:bg-[#f5d9d9] transition-all text-left">
            <p className="font-medium text-[#b88585]">Clear All Data</p>
            <p className="text-sm text-[#d4a5a5] mt-1">Reset app to default settings</p>
          </button>
        </div>
      </div>

      {/* Semester Wrapped */}
      <div className="bg-gradient-to-br from-[#d4a5a5] to-[#b8c5d6] rounded-2xl p-6 border-2 border-[#d4a5a5] shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Semester Wrapped</h2>
            </div>
            <p className="text-white/90 text-sm mb-4">
              View your semester journey! See your total trips, CO₂ saved, favorite bus lines, achievements, and more.
            </p>
            <button
              onClick={onOpenSemesterWrapped}
              className="px-6 py-3 bg-white text-[#d4a5a5] font-semibold rounded-xl hover:bg-white/90 transition-all shadow-md hover:shadow-lg"
            >
              View My Semester 🎉
            </button>
          </div>
          <div className="text-5xl ml-4">
            ✨
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-[#faf8f6] to-[#f5f1ec] rounded-2xl p-6 border border-[#e3ddd5]">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-[#b8c5d6]" />
          <h2 className="text-xl font-semibold text-[#4a4a4a]">About</h2>
        </div>
        <p className="text-sm text-[#8b8680] mb-4">
          Your smart campus transit companion, designed to help you get to class on time while making the journey fun!
        </p>
        <div className="flex items-center gap-4 text-sm text-[#8b8680]">
          <span>Version 1.0.0</span>
          <span>•</span>
          <a href="#" className="text-[#b8c5d6] hover:underline">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="text-[#b8c5d6] hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
}