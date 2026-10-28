import { EducationalResource } from '../types';

export const INITIAL_RESOURCES: EducationalResource[] = [
  {
    id: 'res_1',
    title: 'Understanding Mission LiFE: 7 Core Environmental Action Themes',
    slug: 'understanding-mission-life',
    summary: 'A comprehensive overview of Prime Minister Narendra Modi’s Mission LiFE (Lifestyle for Environment) movement and how individual actions aggregate into global change.',
    category: 'mission_life',
    readTimeMinutes: 5,
    author: 'Ministry of Environment, Forest & Climate Change (Reference Guide)',
    publishedDate: '2026-01-10',
    isBookmarked: true,
    tags: ['Mission LiFE', 'Policy', 'Behavior Change', 'Global Impact'],
    keyTakeaways: [
      'Focuses on demand-side nudge: transforming individual behavior rather than only supply-side regulation.',
      'Encompasses 7 themes: Energy Saving, Water Saving, Single-use Plastic Elimination, Sustainable Food, Waste Reduction, Healthy Lifestyles, and E-Waste.',
      'Even saving 1 unit (1 kWh) of electricity per household per day prevents ~260 kg of CO2 emissions annually.',
    ],
    content: `
Mission LiFE (Lifestyle for Environment) was launched with the vision of mobilizing at least 1 billion citizens globally to take individual and collective action for protecting and conserving the environment.

Rather than viewing climate action purely through macroeconomic treaties, Mission LiFE recognizes that personal everyday decisions — from thermostat settings to food choices — collectively dictate planetary resource depletion.

### The 7 Key Action Pillars:
1. **Save Energy**: Switching off unneeded lights, maintaining AC at 24°C, switching to energy-efficient BLDC appliances and rooftop solar.
2. **Save Water**: Fixing dripping faucets, harvesting rainwater, opting for bucket baths over power showers.
3. **Say No to Single-Use Plastic**: Carrying reusable cloth bags, using steel bottles, avoiding disposable cutlery.
4. **Adopt Sustainable Food Systems**: Prioritizing local, seasonal, plant-rich foods and eliminating food waste.
5. **Reduce Waste (Circular Economy)**: Segregating dry and wet waste at source, home composting, recycling packaging.
6. **Adopt Healthy Lifestyles**: Preferring non-motorized transport (walking, cycling) and public transit.
7. **Reduce E-Waste**: Repairing electronics, prolonging gadget lifecycles, and handing e-waste to certified recyclers.

By tracking these micro-habits on GreenPulse, citizens can directly witness the tangible difference their choices make.
    `,
  },
  {
    id: 'res_2',
    title: 'Rooftop Solar in India: Subsidies, Net Metering & Economics Explained',
    slug: 'rooftop-solar-india-guide',
    summary: 'Step-by-step breakdown of how grid-tied rooftop solar works in Indian cities, PM Surya Ghar Muft Bijli Yojana subsidies, and payback calculations.',
    category: 'solar',
    readTimeMinutes: 7,
    author: 'National Renewable Energy Advisory Cell',
    publishedDate: '2026-02-14',
    isBookmarked: true,
    tags: ['Solar PV', 'PM Surya Ghar', 'Net Metering', 'Investment ROI'],
    keyTakeaways: [
      '1 kWp grid-tied solar system produces approximately 1,400 to 1,500 kWh (units) annually in sun-rich Indian states.',
      'PM Surya Ghar scheme provides direct DBT subsidies of up to ₹78,000 for residential capacities.',
      'Average financial payback period for residential rooftop solar is typically 3.5 to 5 years, with 25-year panel longevity.',
    ],
    content: `
Residential rooftop solar is transforming from a luxury installation into a mainstream household investment across India.

### How Grid-Tied Solar Operates:
1. **Solar PV Modules**: Mounted on your shadow-free terrace, converting sunlight into Direct Current (DC) electricity.
2. **String Inverter**: Converts DC into Alternating Current (AC) synchronized with the DISCOM grid voltage.
3. **Bi-Directional Net Meter**: Records electricity imported from the utility and excess solar energy exported into the grid.

### Economic Viability:
A standard 3 kW system costs approximately ₹1,65,000 before subsidy. With ₹78,000 central subsidy under national initiatives, the consumer's net capital outlay is roughly ₹87,000. Generating ~360 units per month saves between ₹2,200 to ₹3,000 on power bills, recovering the entire setup cost in around 3.5 to 4.5 years.
    `,
  },
  {
    id: 'res_3',
    title: 'Demystifying Household "Phantom Loads" and Standby Power',
    slug: 'demystifying-phantom-loads',
    summary: 'Why electronics consume up to 10% of household electricity even when turned off on the remote, and how to stop it.',
    category: 'energy',
    readTimeMinutes: 4,
    author: 'Bureau of Energy Efficiency Insight Team',
    publishedDate: '2026-03-05',
    isBookmarked: false,
    tags: ['Energy Efficiency', 'Vampire Draw', 'Smart Plugs', 'Home Tips'],
    keyTakeaways: [
      'Appliances on standby with digital displays or remote sensors draw continuous 2W to 20W power 24/7.',
      'TV setups (Smart TV + Set Top Box + Soundbar) often burn 15–25 kWh monthly when supposedly "off".',
      'Using switched surge protectors or smart timers can easily shave ₹150–300 off your monthly bill.',
    ],
    content: `
Many citizens assume that pressing the power button on a remote control turns an appliance off. In reality, it merely puts the device into "standby" mode.

### Top Culprits:
- **Set-Top Boxes & Cable Receivers**: Keep processors and decoders active to maintain clock synch.
- **Microwave & Oven LED Clocks**: Continuously power numeric LED matrices.
- **Laptop and Mobile Fast Chargers left plugged in**: The internal transformer draws quiescent current even with no phone attached.
- **Gaming Consoles**: Modern consoles in "Instant On" mode keep Wi-Fi, background downloads, and HDMI loops running.

### Simple Fixes:
Install master switch boards for your entertainment unit or work desk so you can kill power to all peripherals with a single toggle before heading to bed.
    `,
  },
  {
    id: 'res_4',
    title: 'The Electric Transition: Real-world Running Cost of EV vs Petrol in India',
    slug: 'ev-vs-petrol-running-cost',
    summary: 'A direct financial and environmental comparison between electric two-wheelers, cars, and traditional combustion vehicles.',
    category: 'transport',
    readTimeMinutes: 6,
    author: 'Clean Mobility Research Collaborative',
    publishedDate: '2026-03-20',
    isBookmarked: false,
    tags: ['Electric Vehicles', 'Urban Mobility', 'Emissions', 'Running Cost'],
    keyTakeaways: [
      'An electric two-wheeler costs ~₹0.30 to ₹0.40 per km to operate, compared to ₹2.40 to ₹2.80 per km for a petrol scooter.',
      'For a 20 km daily commute, transitioning to an EV saves approximately ₹14,000 to ₹18,000 annually in fuel alone.',
      'Even when charged from the coal-heavy Indian grid, EVs emit ~45% less net lifecycle CO2 per km than internal combustion vehicles.',
    ],
    content: `
Urban transportation accounts for nearly 14% of India’s overall greenhouse gas emissions.

### Operating Cost Breakdown:
For an internal combustion scooter giving 45 km/litre at ₹100/litre petrol:
- Cost per km = ₹2.22.

For an electric scooter consuming ~2.5 kWh per 100 km at ₹8 per unit:
- Cost per 100 km = ₹20.
- Cost per km = ₹0.20.

Over 10,000 km of city riding, this equals ₹20,200 saved in fuel expenses, alongside lower mechanical maintenance since EVs lack engine oil, spark plugs, clutch plates, and exhaust systems.
    `,
  },
];
