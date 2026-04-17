import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface CapacityIndicatorProps {
  capacity: number;
}

export function CapacityIndicator({ capacity }: CapacityIndicatorProps) {
  const getStatus = () => {
    if (capacity >= 95) return 'boarding-unlikely';
    if (capacity >= 80) return 'standing-only';
    return 'seats-available';
  };

  const status = getStatus();

  const statusConfig = {
    'seats-available': {
      icon: CheckCircle,
      label: 'Seats Available',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    'standing-only': {
      icon: AlertTriangle,
      label: 'Standing Room Only',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    'boarding-unlikely': {
      icon: XCircle,
      label: 'Boarding Unlikely',
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl px-4 py-3 ${config.bg} flex items-center gap-3`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
      <span className={`font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
