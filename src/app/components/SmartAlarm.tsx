import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Zap, Calendar, Settings } from 'lucide-react';

interface AlarmSettings {
  enabled: boolean;
  reminderTime: number; // minutes before class
  smartMode: boolean; // AI mode that considers traffic, bus delays
  notificationSound: boolean;
}

interface SmartAlarmProps {
  nextClass: {
    id: string;
    name: string;
    code: string;
    startTime: Date;
    emoji?: string;
  } | null;
  onSettingsChange: (settings: AlarmSettings) => void;
}

export function SmartAlarm({ nextClass, onSettingsChange }: SmartAlarmProps) {
  const [settings, setSettings] = useState<AlarmSettings>({
    enabled: true,
    reminderTime: 15,
    smartMode: true,
    notificationSound: true
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [alarmScheduled, setAlarmScheduled] = useState(false);

  useEffect(() => {
    // Check notification permission on mount
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('smartAlarmSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      onSettingsChange(parsed);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('smartAlarmSettings', JSON.stringify(settings));
    onSettingsChange(settings);
  }, [settings]);

  useEffect(() => {
    // Schedule notification for next class
    if (!settings.enabled || !nextClass || notificationPermission !== 'granted') {
      setAlarmScheduled(false);
      return;
    }

    const now = new Date();
    const minutesUntilClass = Math.floor((nextClass.startTime.getTime() - now.getTime()) / 60000);
    const notificationTime = minutesUntilClass - settings.reminderTime;

    if (notificationTime > 0 && notificationTime <= 60) {
      setAlarmScheduled(true);

      const timeoutId = setTimeout(() => {
        sendNotification(nextClass);
      }, notificationTime * 60 * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [settings, nextClass, notificationPermission]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendNotification = (classInfo: typeof nextClass) => {
    if (!classInfo) return;

    const emoji = classInfo.emoji || '📚';
    const notification = new Notification(`${emoji} Time to head to ${classInfo.code}!`, {
      body: `${classInfo.name} starts soon. Check the bus schedule now.`,
      icon: '/notification-icon.png',
      badge: '/badge-icon.png',
      tag: `class-${classInfo.id}`,
      requireInteraction: false,
      silent: !settings.notificationSound
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  const toggleSetting = (key: keyof AlarmSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateReminderTime = (minutes: number) => {
    setSettings(prev => ({ ...prev, reminderTime: minutes }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${settings.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {settings.enabled ? (
              <Bell className={`w-6 h-6 ${settings.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Smart Alarms</h3>
            <p className="text-sm text-gray-600">Set & forget notifications</p>
          </div>
        </div>

        <button
          onClick={() => toggleSetting('enabled')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Notification Permission */}
      {notificationPermission !== 'granted' && settings.enabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Enable browser notifications to receive alarms
          </p>
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Alarm Status */}
      {settings.enabled && alarmScheduled && nextClass && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">
            Alarm set for <span className="font-medium">{settings.reminderTime} min</span> before {nextClass.code}
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-4">
        {/* Reminder Time */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            Reminder Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={settings.reminderTime}
              onChange={(e) => updateReminderTime(parseInt(e.target.value))}
              disabled={!settings.enabled}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-900 w-16 text-right">
              {settings.reminderTime} min
            </span>
          </div>
        </div>

        {/* Smart Mode */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">AI Smart Mode</p>
              <p className="text-xs text-gray-600">Adjusts timing based on delays & traffic</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('smartMode')}
            disabled={!settings.enabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.smartMode && settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.smartMode && settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Notification Sound</p>
              <p className="text-xs text-gray-600">Play sound with notification</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('notificationSound')}
            disabled={!settings.enabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notificationSound && settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notificationSound && settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Calendar Sync Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Calendar Sync</p>
              <p className="text-xs text-blue-700 mt-1">
                Connect bCourses, Canvas, or Google Calendar for automatic schedule updates
              </p>
              <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                Set up sync →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
