import { Recommendation, UserProfile } from '../types';
import { INITIAL_RECOMMENDATIONS } from '../mocks/mockRecommendations';
import { getStoredItem, setStoredItem } from './storage';

const RECS_KEY = 'sustainability_recommendations';

export const recommendationService = {
  getRecommendations(): Recommendation[] {
    return getStoredItem<Recommendation[]>(RECS_KEY, INITIAL_RECOMMENDATIONS);
  },

  updateStatus(id: string, status: 'pending' | 'completed' | 'saved'): Recommendation | undefined {
    const list = this.getRecommendations();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const updated: Recommendation = {
      ...list[index],
      status,
    };
    const updatedList = [...list];
    updatedList[index] = updated;
    setStoredItem(RECS_KEY, updatedList);
    return updated;
  },

  /**
   * Rule-based recommendation generator based on user habits and consumption levels
   */
  getDynamicRecommendationsForUser(user: UserProfile): Recommendation[] {
    const base = this.getRecommendations();
    const results = [...base];

    // Rule 1: High electricity (>250 kWh) -> Boost Solar & BLDC recommendations
    if (user.electricityKwh > 250) {
      const solarRec = results.find((r) => r.category === 'solar');
      if (solarRec) {
        solarRec.reason = `Your consumption of ${user.electricityKwh} kWh/month puts you in higher tariff tiers where rooftop solar yields faster returns.`;
      }
    }

    // Rule 2: Petrol two-wheeler commuter -> EV transition recommendation
    if (user.primaryTransport === 'two_wheeler' && user.commuteDistanceKmDaily >= 10) {
      const evRec = results.find((r) => r.category === 'transport');
      if (evRec) {
        evRec.impactKgPerMonth = Math.round(user.commuteDistanceKmDaily * 25 * 0.035);
      }
    }

    return results;
  },
};
