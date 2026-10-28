import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Daily Streak Milestone! 🔥',
    message: 'You have logged green habits for 12 consecutive days. Your point multiplier is active!',
    type: 'challenge',
    timestamp: '15 mins ago',
    read: false,
    link: '/challenges',
  },
  {
    id: 'notif_2',
    title: 'Optimal Solar Generation Weather ☀️',
    message: 'Gandhinagar forecasts 95% solar insolation today. Peak generation between 10:30 AM and 3:30 PM.',
    type: 'solar',
    timestamp: '2 hours ago',
    read: false,
    link: '/weather',
  },
  {
    id: 'notif_3',
    title: 'Monthly Footprint Report Available 📊',
    message: 'Your October electricity consumption dropped by 6.4%, avoiding 16.8 kg CO2e.',
    type: 'footprint',
    timestamp: 'Yesterday',
    read: true,
    link: '/footprint',
  },
  {
    id: 'notif_4',
    title: 'New Community Event Announced 🌿',
    message: 'Rooftop Solar & PM Surya Ghar Citizen Workshop scheduled for Nov 8 at Sector 11.',
    type: 'system',
    timestamp: '2 days ago',
    read: true,
    link: '/community',
  },
];
