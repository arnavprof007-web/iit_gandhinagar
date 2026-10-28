# GreenPulse — Mission LiFE Sustainability Platform

> **HackCult '26 Track 1: Green Energy & Sustainability**  
> Organized around Prime Minister Narendra Modi’s **Mission LiFE (Lifestyle for Environment)** philosophy.

GreenPulse is a frontend-only environmental technology web application designed to empower citizens to monitor household electricity consumption, calculate estimated carbon footprints, complete rewarding sustainability challenges, evaluate rooftop solar potential with PM Surya Ghar Muft Bijli Yojana subsidies, and engage with community green squads.

---

## 🌟 Key Modules & Features

- **Public Landing Page (`/`)**:
  - Hero headline *"Small actions. Measurable impact."* with Mission LiFE philosophy pitch.
  - 4-step framework: Measure, Improve, Earn, and Inspire.
  - Aggregate citizen impact metrics (clearly labeled as illustrative demo values).
  - Previews of dashboard, challenges, and rooftop solar economics.

- **Authentication & Multi-Step Onboarding (`/login`, `/register`, `/onboarding`)**:
  - Sample citizen profile (Aarav Sharma, Gandhinagar).
  - Multi-step onboarding wizard gathering household size, location, monthly electricity kWh, bills, commute modes, and cooking fuels.
  - Review screen showing the initial baseline carbon calculation before launching the dashboard.

- **Personal Sustainability Dashboard (`/dashboard`)**:
  - Circular Green Score dial (0–100) and Level milestones.
  - Monthly electricity consumption area & bar chart (Recharts) with baseline reference lines.
  - Historical estimated carbon emissions chart (stacked by electricity, transport, cooking).
  - Category-wise proportion donut chart.
  - Active challenges with instant point completion and eco-confetti celebrations.
  - Weather-aware energy advice & rooftop solar feasibility preview cards.

- **Carbon Footprint Tracker (`/footprint`)**:
  - Forms to log electricity bills, commute legs (metro, EV, petrol car, bus, cycling), and cooking fuel (PNG/LPG).
  - Calculation engine calibrated to Central Electricity Authority (CEA) India baseline (~0.716 kg CO₂e/kWh) and IPCC transport factors.
  - Editable & deletable activity records table.
  - Full transparency disclaimers regarding estimation limits.

- **Smart Sustainability Recommendations (`/recommendations`)**:
  - Rule-based suggestion engine dynamically evaluating household consumption and commute patterns.
  - Categorized actions (Solar, Electricity, Mobility, Cooking, Consumption).
  - Estimated monthly financial savings (₹) and CO₂e abatement.
  - "Mark as completed" and "Save for later" state management.

- **Green Challenges & Gamification (`/challenges`)**:
  - Daily, weekly, and monthly challenges across 5 Mission LiFE themes (Energy, Water, Waste, Mobility, Lifestyle).
  - Daily active streak counter with point multiplier.
  - **Strict duplicate reward claim protection** (prevents unlimited point farming).
  - Achievement Badges gallery with unlock progression.
  - Full step-by-step instructions and practical BEE / energy efficiency tips modal.

- **Rooftop Solar Feasibility Calculator (`/solar`)**:
  - Interactive simulator modeling system capacity, annual generation, and rooftop space requirements.
  - Financial model calculating annual power bill savings, payback period, and 25-year lifetime savings (factoring 0.7% annual panel degradation).
  - Indicative national benchmark subsidies under PM Surya Ghar guidelines (up to ₹78,000 DBT).
  - Printable / downloadable summary report modal (`window.print()`).

- **Community & Local Impact (`/community`)**:
  - Squads for city neighbourhoods, college campuses, and workplaces.
  - Join/Leave squad interactions with member count updates.
  - Create new community squads modal.
  - Individual & squad leaderboards with podium rankings.
  - Local green events and citizen workshops with RSVP toggles.

- **Smart Green Assistant (`/assistant`)**:
  - Conversational sustainability assistant interface.
  - Deterministic knowledge base addressing energy conservation, solar economics, and Mission LiFE pillars.
  - Real-time typing indicator simulation.
  - Embedded contextual KPI cards with direct deep-links.

- **Weather & Energy Insights (`/weather`)**:
  - Multi-city selector (Gandhinagar, Pune, Bengaluru, New Delhi).
  - Current ambient temperature, wind, humidity, cloud cover, and UV index.
  - Solar generation suitability indicator and peak hours advisory.
  - 7-day forecast with daily solar generation ratings (0–100%).

- **Learn & Resources Library (`/resources`, `/resources/:slug`)**:
  - Articles on Mission LiFE's 7 pillars, PM Surya Ghar economics, appliance phantom loads, and EV vs petrol running costs.
  - Category filters, keyword search, reading time, and bookmarking.

- **My Progress & Historical Impact (`/progress`)**:
  - Period toggles (weekly, monthly, yearly).
  - Separate reporting of measured electricity reduction (kWh) from estimated emissions avoided (kg CO₂e) to prevent conflation.
  - Verified activity timeline.
  - Printable progress summary.

- **Citizen Settings & Demo Controls (`/settings`)**:
  - Household profile configuration.
  - Notification and privacy preferences.
  - Data export as JSON.
  - Demo state reset modal restoring default baseline.

- **Admin Dashboard Simulation (`/admin`)**:
  - Municipal telemetry KPIs, monthly signup trends, and challenge completion charts.
  - Campaign management and moderation flag queue.
  - Publish new challenge form reflecting immediately in citizen views.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TypeScript, Vite 8 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v3, Nature-inspired palette, custom glassmorphism |
| **Data Visualisation** | Recharts (ResponsiveContainer, BarChart, AreaChart, PieChart) |
| **Icons** | Lucide React |
| **Forms & Validation** | React Hook Form, Zod, @hookform/resolvers |
| **Animations & Effects**| Canvas Confetti |
| **Testing** | Vitest |

---

## 📂 Project Architecture

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── assistant/      # ChatMessage, ChatInput
│   │   ├── challenges/     # ChallengeCard, ChallengeModal
│   │   ├── charts/         # ElectricityChart, EmissionsTrendChart, SolarGenerationChart, CategoryBreakdownChart
│   │   ├── common/         # Button, Card, Badge, Input, Select, Modal, Tabs, ProgressBar, StatCard, Alert
│   │   ├── community/      # TeamCard, CreateTeamModal, CommunityEventCard, LeaderboardTable
│   │   ├── dashboard/      # MetricsOverview, GreenScoreCard, ActiveChallengesCard, RecentActivityFeed, etc.
│   │   ├── layout/         # AppLayout, Sidebar, TopBar, Navbar, Footer
│   │   └── solar/          # SolarForm, SolarResultCards, SolarSummaryModal
│   ├── context/            # AppContext, ToastContext
│   ├── mocks/              # mockUserData, mockFootprintData, mockChallenges, mockSolarData, mockWeatherData, etc.
│   ├── pages/              # 18 Real routed pages (Dashboard, Footprint, Solar, Community, etc.)
│   ├── routes/             # AppRouter with nested layout routes
│   ├── services/           # authService, footprintService, solarService, challengeService, etc.
│   ├── types/              # Comprehensive TypeScript interfaces
│   ├── utils/              # footprintCalculations, solarCalculations, formatters, confetti
│   ├── App.tsx             # Context provider assembly
│   ├── main.tsx            # Vite root entry
│   └── index.css           # Tailwind directives & design tokens
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Running Locally (Windows / macOS / Linux)

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
# Run Vitest test suite
npm test
```
Runs 17 unit tests verifying carbon footprint calculations, rooftop solar math, challenge duplicate reward protection, and form validation schemas.

### Production Build
```bash
# Build production bundle with TypeScript validation
npm run build
```

---

## 🔌 Backend Integration Readiness (Next Phase)

While this phase is strictly **FRONTEND ONLY**, the code is architected to facilitate future integration with a FastAPI or Node backend:

1. **Dedicated Service Layer**: All data operations run through `src/services/` (`authService`, `footprintService`, `solarService`, `challengeService`, etc.). Components never manipulate raw storage or data stores directly.
2. **Clear Interface Contracts**: All API requests and responses are strongly typed in `src/types/index.ts`.
3. **Environment Config**: `.env.example` provides `VITE_API_BASE_URL` placeholder.
4. **Mock Replacement Strategy**:
   - `authService.login / register` ➡️ Replace with `axios.post('/api/v1/auth/token')`.
   - `footprintService` ➡️ Replace with `GET /api/v1/footprint` and `POST /api/v1/footprint/activities`.
   - `solarService` ➡️ Connect to backend GIS / Solar API.
   - `assistantService` ➡️ Connect to streaming SSE or WebSocket FastAPI agent endpoint.
   - `weatherService` ➡️ Proxy through backend OpenWeather / IMD API.
