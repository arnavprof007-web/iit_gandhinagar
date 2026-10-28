import { WeatherEnergyInsight } from '../types';
import { MOCK_WEATHER_DATA } from '../mocks/mockWeatherData';

export const weatherService = {
  getAvailableLocations(): { key: string; label: string }[] {
    return [
      { key: 'Gandhinagar', label: 'Gandhinagar, Gujarat' },
      { key: 'Pune', label: 'Pune, Maharashtra' },
      { key: 'Bengaluru', label: 'Bengaluru, Karnataka' },
      { key: 'Delhi', label: 'New Delhi, NCR' },
    ];
  },

  getWeatherInsight(cityKey = 'Gandhinagar'): WeatherEnergyInsight {
    return MOCK_WEATHER_DATA[cityKey] || MOCK_WEATHER_DATA['Gandhinagar'];
  },
};
