export type MissionLifeCategory =
  | 'energy'
  | 'water'
  | 'waste'
  | 'mobility'
  | 'lifestyle'
  | 'solar'
  | 'consumption';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  householdSize: number;
  homeType: 'apartment' | 'independent_house' | 'villa';
  electricityKwh: number;
  monthlyBillInr: number;
  tariffInrPerKwh: number;
  primaryTransport: 'petrol_car' | 'diesel_car' | 'ev' | 'two_wheeler' | 'public_transit' | 'active_transit';
  commuteDistanceKmDaily: number;
  cookingFuel: 'lpg' | 'piped_gas' | 'electric_induction';
  dietType: 'vegetarian' | 'vegan' | 'non_vegetarian';
  greenScore: number; // 0 - 100
  greenPoints: number;
  streakDays: number;
  level: number;
  personalGoalKwh: number;
  personalGoalEmissionsKg: number;
  joinedDate: string;
  badges: UserBadge[];
  role?: 'user' | 'admin';
  emailVerified?: boolean;
  mustChangePassword?: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string | null;
  progressPct: number;
}

export interface ElectricityRecord {
  id: string;
  month: string;
  year: number;
  consumptionKwh: number;
  costInr: number;
  estimatedEmissionsKg: number;
  isBaseline?: boolean;
}

export interface TransportRecord {
  id: string;
  date: string;
  mode: 'petrol_car' | 'diesel_car' | 'ev' | 'two_wheeler_petrol' | 'two_wheeler_ev' | 'bus' | 'metro' | 'cycling' | 'walking';
  distanceKm: number;
  fuelLitres?: number;
  estimatedEmissionsKg: number;
}

export interface CookingFuelRecord {
  id: string;
  month: string;
  year: number;
  fuelType: 'lpg' | 'piped_gas' | 'electric_induction';
  quantity: number; // cylinders or SCM or kWh
  estimatedEmissionsKg: number;
}

export interface FootprintSummary {
  period: string; // e.g. "October 2026"
  month: string;
  year: number;
  electricityKg: number;
  transportKg: number;
  cookingKg: number;
  totalKg: number;
  baselineTotalKg: number;
  deltaPercentage: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'electricity' | 'transport' | 'cooking' | 'solar' | 'consumption';
  impactKgPerMonth: number;
  estimatedSavingsInrPerMonth: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string;
  status: 'pending' | 'completed' | 'saved';
  reason: string;
  missionLifeAction: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'waste' | 'water' | 'mobility' | 'lifestyle';
  cadence: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  co2AvoidedKg: number;
  completed: boolean;
  completedAt?: string;
  progress: number;
  target: number;
  unit: string;
  instructions: string[];
  tips: string[];
}

export interface SolarAssessmentInput {
  city: string;
  monthlyKwh: number;
  monthlyBillInr: number;
  tariffInrPerKwh: number;
  usableRoofSqFt: number;
  estimatedCostInr?: number;
  targetCapacityKw?: number;
}

export interface SolarAssessmentResult {
  recommendedCapacityKw: number;
  annualGenerationKwh: number;
  monthlyGenerationKwh: number;
  annualSavingsInr: number;
  monthlySavingsInr: number;
  estimatedSystemCostInr: number;
  subsidyApplicableInr: number;
  netSystemCostInr: number;
  estimatedPaybackYears: number;
  lifetimeSavingsInr: number; // 25 years
  co2OffsetTonnesPerYear: number;
  treesEquivalent: number;
  requiredRoofSqFt: number;
  monthlyProfile: { month: string; generationKwh: number; savingsInr: number }[];
  assumptions: string[];
}

export interface CommunityTeam {
  id: string;
  name: string;
  city: string;
  type: 'neighbourhood' | 'college' | 'workplace';
  description: string;
  membersCount: number;
  totalPoints: number;
  co2AvoidedKg: number;
  rank: number;
  isMember: boolean;
  avatarColor: string;
}

export interface CommunityLeaderboardItem {
  id: string;
  rank: number;
  name: string;
  type: 'individual' | 'team';
  location: string;
  points: number;
  co2AvoidedKg: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  organizer: string;
  category: string;
  description: string;
  isRegistered: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickLinks?: { label: string; url: string }[];
  contextCard?: {
    title: string;
    metric: string;
    description: string;
    linkUrl: string;
  };
}

export interface WeatherEnergyInsight {
  location: string;
  temperatureC: number;
  condition: string;
  icon: string;
  humidityPct: number;
  cloudCoverPct: number;
  windKmph: number;
  uvIndex: number;
  solarSuitability: 'Optimal' | 'Good' | 'Moderate' | 'Low';
  peakSolarHours: string;
  dailyForecast: {
    day: string;
    temp: number;
    icon: string;
    solarRating: number; // 0-100
    condition: string;
  }[];
  tips: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'info';
  }[];
  dataSource: string;
  lastUpdated: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: 'energy' | 'solar' | 'transport' | 'consumption' | 'efficiency' | 'mission_life';
  readTimeMinutes: number;
  content: string;
  keyTakeaways: string[];
  author: string;
  publishedDate: string;
  isBookmarked: boolean;
  externalUrl?: string;
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'challenge' | 'solar' | 'footprint' | 'tip' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AdminAnalytics {
  totalCitizens: number;
  activeChallenges: number;
  co2AvoidedTons: number;
  kwhSolarGeneratedMwh: number;
  monthlySignups: { month: string; users: number }[];
  challengeCompletionByCategory: { category: string; count: number }[];
  campaigns: {
    id: string;
    title: string;
    status: 'active' | 'upcoming' | 'completed';
    targetCitizens: number;
    enrolledCitizens: number;
    co2TargetTons: number;
  }[];
  moderationReports: {
    id: string;
    type: string;
    reportedBy: string;
    itemTitle: string;
    date: string;
    status: 'pending' | 'resolved' | 'dismissed';
  }[];
}
