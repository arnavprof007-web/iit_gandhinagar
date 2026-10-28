import { AdminAnalytics } from '../types';

export const INITIAL_ADMIN_ANALYTICS: AdminAnalytics = {
  totalCitizens: 4892,
  activeChallenges: 28,
  co2AvoidedTons: 142.8,
  kwhSolarGeneratedMwh: 318.5,
  monthlySignups: [
    { month: 'Jun', users: 520 },
    { month: 'Jul', users: 780 },
    { month: 'Aug', users: 1120 },
    { month: 'Sep', users: 1450 },
    { month: 'Oct', users: 1840 },
  ],
  challengeCompletionByCategory: [
    { category: 'Energy Conservation', count: 3240 },
    { category: 'Clean Mobility', count: 2110 },
    { category: 'Waste Segregation', count: 1890 },
    { category: 'Water Saving', count: 1450 },
    { category: 'Sustainable Lifestyle', count: 1220 },
  ],
  campaigns: [
    {
      id: 'cmp_1',
      title: 'Mission LiFE Gandhinagar Clean Air October',
      status: 'active',
      targetCitizens: 2500,
      enrolledCitizens: 1842,
      co2TargetTons: 50,
    },
    {
      id: 'cmp_2',
      title: 'Solar Rooftop Awareness Sprint 2026',
      status: 'active',
      targetCitizens: 1000,
      enrolledCitizens: 730,
      co2TargetTons: 80,
    },
    {
      id: 'cmp_3',
      title: 'Zero Food Waste Diwali Festivities',
      status: 'upcoming',
      targetCitizens: 3000,
      enrolledCitizens: 412,
      co2TargetTons: 25,
    },
  ],
  moderationReports: [
    {
      id: 'rep_1',
      type: 'Challenge Completion Proof',
      reportedBy: 'System Auto-Flag',
      itemTitle: 'Suspicious 1000 km cycling entry',
      date: '2026-10-25',
      status: 'pending',
    },
    {
      id: 'rep_2',
      type: 'Community Team Name',
      reportedBy: 'Citizen Moderator',
      itemTitle: 'Duplicate Sector 7 Group',
      date: '2026-10-22',
      status: 'resolved',
    },
  ],
};
