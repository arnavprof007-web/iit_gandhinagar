import { ChatMessage } from '../types';

export const SUGGESTED_ASSISTANT_PROMPTS = [
  'How can I reduce my electricity consumption?',
  'Explain my footprint results.',
  'What should my next green challenge be?',
  'Is rooftop solar worth exploring for my house?',
  'Why has my monthly footprint changed?',
  'What are the key pillars of Mission LiFE?',
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: 'Namaste! I am GreenPulse Smart Assistant — your personal guide for sustainable living under the Mission LiFE philosophy. How can I help you analyze your footprint, optimize energy consumption, or explore solar options today?',
    timestamp: 'Just now',
    quickLinks: [
      { label: 'Check Footprint', url: '/footprint' },
      { label: 'Explore Solar Calculator', url: '/solar' },
      { label: 'Browse Challenges', url: '/challenges' },
    ],
  },
];

export const ASSISTANT_KNOWLEDGE_BASE: {
  keywords: string[];
  reply: string;
  contextCard?: {
    title: string;
    metric: string;
    description: string;
    linkUrl: string;
  };
  quickLinks?: { label: string; url: string }[];
}[] = [
  {
    keywords: ['reduce', 'electricity', 'power', 'consumption', 'bill', 'save energy', 'kwh'],
    reply: 'To reduce your household electricity consumption in India, target your high-draw appliances first:\n\n1. **AC at 24°C**: Increases cooling efficiency by ~6% for every degree above 18°C.\n2. **BLDC Ceiling Fans**: Standard fans consume 75W, while 5-star BLDC fans consume just 28–30W.\n3. **Phantom Power**: Turn off TV set-top boxes, gaming consoles, and microwave outlets at the wall switch.\n4. **Washing Machine Wash Cycle**: Wash with cold water (30°C or tap temperature) rather than 60°C heated cycles to save up to 80% of washer electricity.',
    contextCard: {
      title: 'Current Monthly Electricity',
      metric: '248 kWh (-32% vs Baseline)',
      description: 'Your household is saving ~₹472/month compared to your November baseline.',
      linkUrl: '/dashboard',
    },
    quickLinks: [
      { label: 'View Recommendations', url: '/recommendations' },
      { label: 'Start 24°C AC Challenge', url: '/challenges' },
    ],
  },
  {
    keywords: ['footprint', 'explain', 'results', 'emissions', 'co2', 'carbon'],
    reply: 'Your estimated carbon footprint is calculated across three primary household sources:\n\n1. **Grid Electricity**: ~0.716 kg CO2e per kWh (based on CEA India grid intensity). At 248 kWh, this generates ~177.6 kg CO2e.\n2. **Transport**: Your daily commute mode and distance. Electric transit or two-wheelers emit significantly less than petrol cars.\n3. **Cooking Fuel**: Piped natural gas (PNG) generates ~1.95 kg CO2e per SCM consumed.\n\nYour total estimated footprint this month is 247.8 kg CO2e, representing a 32.1% reduction from your baseline!',
    contextCard: {
      title: 'Monthly Carbon Footprint',
      metric: '247.8 kg CO₂e',
      description: 'Down 32.1% compared to your historical baseline of 365 kg.',
      linkUrl: '/footprint',
    },
    quickLinks: [
      { label: 'Open Footprint Tracker', url: '/footprint' },
      { label: 'Progress History', url: '/progress' },
    ],
  },
  {
    keywords: ['solar', 'rooftop', 'worth', 'feasible', 'cost', 'subsidy', 'surya ghar'],
    reply: 'Rooftop solar is exceptionally viable for your residence! For a typical consumption of ~250–260 kWh per month:\n\n- **Recommended System**: 2.5 kWp requiring ~250 sq. ft. of shadow-free rooftop.\n- **Annual Generation**: ~3,380 kWh of clean power.\n- **Capital Cost**: ~₹1,37,500 before subsidy.\n- **Government Subsidy**: Up to ₹78,000 under PM Surya Ghar Muft Bijli Yojana guidelines.\n- **Net Cost**: ~₹59,500 with a payback period of ~3.4 years!',
    contextCard: {
      title: 'Solar Feasibility Summary',
      metric: '3.4 Years Payback',
      description: 'Est. lifetime savings of over ₹3.8 Lakhs over 25 years.',
      linkUrl: '/solar',
    },
    quickLinks: [
      { label: 'Run Solar Assessment', url: '/solar' },
      { label: 'Read Solar Guide', url: '/resources' },
    ],
  },
  {
    keywords: ['challenge', 'next', 'green points', 'streak', 'mission life'],
    reply: 'Based on your current progress, here are the top 2 recommended challenges to tackle right now:\n\n1. **AC 24°C Comfort Standard** (+25 pts) — Easy daily challenge to optimize air conditioning.\n2. **Clean Wheels Commute** (+80 pts) — Replace solo petrol rides with metro or cycling for 3 commutes.\n\nCompleting these will elevate your Green Score from 78 towards Level 5 (Eco Champion)!',
    contextCard: {
      title: 'Daily Streak',
      metric: '12 Days Active 🔥',
      description: 'Complete 1 more challenge today to maintain your multiplier.',
      linkUrl: '/challenges',
    },
    quickLinks: [
      { label: 'Go to Challenges', url: '/challenges' },
      { label: 'View Leaderboard', url: '/community' },
    ],
  },
  {
    keywords: ['why', 'changed', 'monthly footprint', 'trend', 'increase', 'decrease'],
    reply: 'Your footprint decreased by 6.4% this month primarily due to two factors:\n\n1. **Lower AC run time**: Cooler seasonal autumn weather in Gandhinagar reduced your electricity draw by 17 kWh.\n2. **Active Transit**: You logged two metro commutes and one bicycle commute, avoiding ~6.3 kg of direct tailpipe emissions.\n\nKeep up this momentum to achieve your personal target of under 200 kg CO2e monthly!',
    contextCard: {
      title: 'October Month Delta',
      metric: '-16.8 kg CO₂e Saved',
      description: 'Main driver: 17 kWh electricity conservation + 2 metro commutes.',
      linkUrl: '/footprint',
    },
    quickLinks: [
      { label: 'Review Activity Log', url: '/footprint' },
    ],
  },
  {
    keywords: ['mission life', 'philosophy', 'pillars', 'what is', 'concept'],
    reply: 'Mission LiFE (Lifestyle for Environment) is India’s global initiative introduced at COP26. It champions mindful and deliberate utilization instead of mindless and destructive consumption.\n\nIt revolves around 7 key themes:\n1. Energy Conservation\n2. Water Conservation\n3. Single-Use Plastic Elimination\n4. Sustainable Food Systems\n5. Waste Segregation & Circularity\n6. Healthy Lifestyles & Non-Motorized Transit\n7. E-Waste Management',
    quickLinks: [
      { label: 'Learn More in Resources', url: '/resources' },
      { label: 'Join Community Initiatives', url: '/community' },
    ],
  },
];
