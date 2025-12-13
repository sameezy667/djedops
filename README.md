# DjedOps Command Center

## Project Description
A real-time stability analytics dashboard for the Djed Protocol on the Ergo Blockchain. It provides deep insights into Reserve Ratios, Whale movements, and Arbitrage opportunities.

## Features

### Core Monitoring
- **Live DSI Monitor:** Real-time tracking of the Djed Stability Index with dynamic reserve ratio calculation
- **Transaction Feed:** Live blockchain transaction monitoring for MINT/REDEEM operations (SigUSD & SigRSV)
- **Oracle Consensus:** Real-time ERG/USD price from Ergo blockchain oracles
- **Reactive 3D Visualization:** Dynamic Reserve Sun that transforms based on system health (SAFE/NORMAL/CRITICAL states)

### Trading & Risk Management
- **Arbitrage Sniper:** Live DEX price monitoring from Spectrum Finance with automated opportunity detection (±0.5% threshold)
- **Sentinel Mode:** Automated guardian with configurable triggers for reserve ratio alerts, volatility warnings, and balance monitoring
- **Risk Scenarios:** One-click stress tests (Flash Crash, Oracle Freeze, Bank Run) for protocol resilience testing

### Wallet Integration
- **Nautilus Wallet:** Full dApp connector integration with auto-reconnect and balance polling
- **Real-Time Balance:** Live ERG balance display with 30-second refresh

### Mobile Experience
- **React Native App:** Complete mobile companion app with Expo/EAS build support
- **Responsive Design:** Mobile-first web dashboard with touch-optimized controls and adaptive layouts

## Project Maturity
- [x] Prototype
- [x] MVP
- [x] Alpha
- [ ] Beta
- [ ] Production
- [ ] Audited

## What's New

### Latest Updates (December 2025)
- ✅ **Live DEX Price Integration**: Real-time arbitrage monitoring from Spectrum Finance
- ✅ **Live Transaction Feed**: Blockchain transaction monitoring with type detection
- ✅ **Nautilus Wallet**: Full dApp connector integration with auto-reconnect
- ✅ **Reactive Reserve Sun**: Three-state visualization (SAFE/NORMAL/CRITICAL)
- ✅ **Performance Mode**: Optimized mode for low-end devices
- ✅ **Sentinel Mode**: Automated monitoring with multi-channel alerts
- ✅ **Risk Scenarios**: Flash Crash, Oracle Freeze, Bank Run stress tests
- ✅ **Mobile App**: Complete React Native companion app
- ✅ **Responsive Design**: Touch-optimized mobile-first layouts
- ✅ **41 Tests**: Comprehensive test coverage with Jest + RTL

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Visuals:** React Three Fiber (Three.js)
- **Data:** Ergo Explorer API

## 🚀 Getting Started

### Web Dashboard
```bash
# Clone the repo
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Mobile App
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build:android  # or build:ios
```

### Demo Mode
For environments without external API access:
```
http://localhost:3000?demo=true
```

## 🧪 Testing

### Run All Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report
```

### Test Suites
- **Unit Tests**: Calculation functions with edge cases (calculations.test.ts)
- **Component Tests**: React component rendering (TerminalFeed.test.ts)
- **Integration Tests**: Wallet and simulation behavior
- **Property-Based Tests**: Using fast-check for exhaustive coverage

**Status**: All 41 tests passing ✅

## 📚 Documentation

- **[NEW_FEATURES_TESTING.md](./NEW_FEATURES_TESTING.md)** - Complete guide for testing new features
- **[LIVE_DEX_PRICE.md](./LIVE_DEX_PRICE.md)** - DEX integration documentation
- **[LIVE_TRANSACTION_FEED.md](./LIVE_TRANSACTION_FEED.md)** - Transaction monitoring implementation
- **[WALLET_INTEGRATION.md](./WALLET_INTEGRATION.md)** - Nautilus wallet integration guide
- **[REACTIVE_RESERVE_SUN.md](./REACTIVE_RESERVE_SUN.md)** - Reserve Sun visualization details
- **[PERFORMANCE_MODE.md](./PERFORMANCE_MODE.md)** - Performance optimization guide
- **[MOBILE_APP_SUMMARY.md](./MOBILE_APP_SUMMARY.md)** - Mobile app documentation
- **[CODE_QUALITY.md](./CODE_QUALITY.md)** - Architecture and code standards
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete implementation details

## License
GPL v3 - See LICENSE.md

## Copyright
© 2025 The Stable Order

Run tests in watch mode:

```bash
npm test -- --watch
```

### Production Build

```bash
npm run build
npm start
```

## 📊 Features

### Real-Time Monitoring
- **Reserve Ratio Display**: Live calculation of `(Base Reserves × ERG Price) / (SigUSD Supply × 100)` with detailed console logging
- **System Status**: Dynamic visual indicator with three states (SAFE ≥800% | NORMAL 400-800% | CRITICAL <400%)
- **Price Oracle**: Current ERG/USD price from Ergo Explorer API with 15-second polling
- **Transaction Feed**: Live blockchain transaction monitoring with type detection (MINT_DJED, REDEEM_DJED, MINT_SHEN, REDEEM_SHEN)
- **API Health**: Status indicators with error banners and automatic retry
- **Page Visibility API**: Pauses polling when tab is inactive to conserve resources

### 🎯 Arbitrage Sniper (Market Opportunity Detection)
Automated detection of arbitrage opportunities between protocol and DEX prices:

- **Live DEX Integration**: Real-time price data from Spectrum Finance (Ergo's main DEX)
- **Smart Signals**:
  - 🟢 **MINT DJED**: DEX price >0.5% above protocol (buy ERG, mint DJED, sell on DEX)
  - 🔴 **REDEEM DJED**: DEX price >0.5% below protocol (buy DJED on DEX, redeem for ERG)
  - ⚪ **NO CLEAR EDGE**: Spread within threshold
- **Visual Feedback**: Pulsing glow effects on profitable opportunities
- **Spread Calculation**: Live display of absolute and percentage differences
- **15-Second Polling**: Automatic refresh for real-time opportunity detection
- **Liquidity Display**: Shows TVL and data source for transparency

### 🛡️ Sentinel Mode (Peg Protection Bot)
Automated guardian that monitors critical conditions and triggers emergency protocols:

- **Configurable Triggers**:
  - Auto-redeem when reserve ratio < 400%
  - Volatility alerts on rapid price movements (±5% threshold)
  - Custom balance monitoring
  - Wallet disconnection alerts
- **Multi-Channel Notifications**:
  - Prominent in-app banner with pulsing alert
  - Browser notifications (if permitted)
  - Terminal feed event logging with timestamps
  - Border flash visual effect
  - Sound alerts (optional)
- **Visual Indicators**: 
  - Pulsing green shield icon when armed
  - Red alert mode during trigger events
  - Modal configuration panel with real-time status
- **Persistence**: Settings saved to localStorage with auto-restore
- **Simulation Mode**: All actions are front-end only (no real transactions)

### 💥 Risk Scenarios (Preset Stress Tests)
One-click stress test scenarios for realistic failure mode testing:

- **FLASH CRASH**: Instant 50% price drop simulation
  - Tests protocol behavior during extreme market crashes
  - Immediate ratio recalculation
  - Reserve Sun transforms to critical state
  
- **ORACLE FREEZE**: Simulate oracle feed failure
  - Locks price at current value
  - Disables manual slider
  - Warning banner: "ORACLE FEED UNRESPONSIVE"
  - Tests system resilience without price updates
  
- **BANK RUN**: Force reserve ratio below 400%
  - Instant CRITICAL state trigger
  - Full theme switch to red alert mode
  - Triggers Sentinel (if armed)
  - Tests emergency protocols and user response
  - Reserve Sun transforms to "spiky ball of death"

- **Reset to Live**: One-click return to normal state with smooth transitions
- **Terminal Logging**: All scenarios logged with timestamps and details
- **Visual Feedback**: Scenario badges and active state indicators

### Interactive Price Simulation (Enhanced)
Click **"LAUNCH SIMULATION"** to access enhanced simulation tools:

1. **Manual Slider**: Adjust ERG price ($0.10 - $10.00)
2. **Risk Scenarios**: Three preset stress tests (see above)
3. **Real-Time Calculation**: See how different prices affect the reserve ratio
4. **Visual Feedback**: Watch the system status change between NORMAL (green) and CRITICAL (red)
5. **Keyboard Controls**: Use arrow keys to fine-tune the slider
6. **Mode Indicators**: Clear labeling of active scenarios

**Formula Verification:**
- Open browser console to see detailed calculation logs
- Format: `(baseReserves * price) / (sigUsdSupply * 100)`
- All intermediate values are displayed for transparency

### 🎨 Reactive Reserve Sun Visualization
Dynamic 3D visualization that transforms based on protocol health:

- **🔵 SAFE State (>800%)**: Cyan sphere with slow rotation, no pulse - over-collateralized
- **🟢 NORMAL State (400-800%)**: Matrix green sphere with gentle breathing - adequately collateralized
- **🔴 CRITICAL State (<400%)**: Red "spiky ball of death" with fast erratic rotation and aggressive pulse - under-collateralized
- **Real-Time Transformation**: Instantly responds to reserve ratio changes
- **Performance Mode**: Toggle between full visual quality and optimized mode (50% fewer rings/lines, 2x slower rotation)
- **Page Visibility Integration**: Pauses animations when tab is inactive

### 💼 Wallet Integration
Complete Nautilus wallet integration using Ergo dApp Connector standard:

- **One-Click Connect**: Seamless wallet connection with read access request
- **Auto-Reconnect**: Persists connection in localStorage across sessions
- **Live Balance**: ERG balance with 30-second refresh polling
- **Address Display**: Shortened wallet address with full copy functionality
- **Disconnect**: Clean wallet disconnection with state reset
- **Error Handling**: Graceful fallback for missing Nautilus extension
- **Sentinel Integration**: Wallet balance monitoring for low balance alerts

### ⚡ Performance Mode
Optimized experience for low-end devices and battery conservation:

- **Toggle Control**: Easy switch between Visual and Performance modes
- **Reserve Sun Optimization**:
  - 50% fewer outer rings (4 → 2)
  - 50% fewer grid lines (8 → 4)
  - 2x slower rotation speed
  - Disabled glow effects
  - Reduced pulse animations
- **LocalStorage Persistence**: Remembers user preference
- **Visual Indicator**: ⚡ Performance / ✨ Visual mode icons

### 📱 Mobile App
Full-featured React Native mobile app built with Expo:

- **Native Features**:
  - Home screen with Reserve Sun visualization
  - Diagnostics screen with algorithmic logic display
  - Live transaction feed with color-coded events
  - Statistics cards with animated progress bars
  - Oracle status indicator (6/6 active oracles)
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: Zustand for global state
- **Animations**: React Native Reanimated for smooth 60fps animations
- **Build Support**: EAS Build configuration for iOS and Android
- **Platform**: Supports iOS, Android, and Web via Expo

### Responsive Design
- **Mobile-First**: Touch-optimized controls with 44px minimum touch targets
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Adaptive Layouts**: DataGrid adjusts from 1 → 2 → 3 columns across breakpoints
- **Touch Optimizations**: Larger slider thumbs (28px), active:scale feedback
- **Accessibility**: WCAG AA compliant, keyboard navigation, ARIA labels, reduced motion support

## 🎨 Design System

### Financial Brutalism Philosophy
High contrast, monospace data, terminal-inspired aesthetics with zero fluff.

#### Colors
- **Deep Void Black** (`#050505`) - Background
- **Obsidian** (`#080808`) - Surface
- **Neon Terminal Green** (`#39FF14`) - Primary/NORMAL state
- **Alert Red** (`#FF2A2A`) - CRITICAL state
- **Off-white** (`#E5E5E5`) - Primary text
- **Steel Grey** (`#888888`) - Secondary text

#### Typography
- **Display**: Unbounded, Inter (weights: 700, 900)
- **Monospace**: JetBrains Mono, Space Mono

#### Visual Effects
- CRT scanline overlay
- Hollow text effect (stroke with transparent fill)
- Green/Red glow text shadows
- Corner L-bracket decorations
- Backdrop blur on modals

### 🔄 Live API Integrations
Real-time data from multiple sources:

- **Ergo Explorer API**: 
  - Oracle price data (`/api/v1/oracle/poolBox`)
  - Protocol reserves and metrics
  - SigmaUSD contract transactions
  - 15-second cache revalidation
  
- **Spectrum Finance DEX**:
  - Live SigUSD/ERG pool data
  - Liquidity metrics and TVL
  - Real-time arbitrage spread calculation
  
- **Transaction Monitoring**:
  - Live blockchain transaction feed
  - Type detection (MINT/REDEEM for SigUSD and SigRSV)
  - Token amount calculation with proper decimal handling
  - Filters last 20 transactions, returns top 10 relevant ones

## 🏗️ Tech Stack

- **Framework**: Next.js 14.2.33 with App Router
- **Mobile**: React Native with Expo SDK 52
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 12.23.25
- **State Management**: Zustand 5.0.9
- **Data Fetching**: SWR 2.3.7 with 10s refresh
- **Testing**: Jest + React Testing Library (41 tests passing)

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts, metadata, error boundary
│   ├── page.tsx            # Main dashboard page with demo mode toggle
│   ├── globals.css         # Global styles and design system variables
│   └── api/
│       └── djed/
│           └── route.ts    # CORS proxy for Ergo Explorer API
├── components/
│   ├── HeroSection.tsx              # Main dashboard section
│   ├── SimulationModal.tsx          # Interactive price simulation with scenarios
│   ├── ScenarioControls.tsx         # Risk scenario preset buttons (NEW)
│   ├── MarketOpportunityCard.tsx    # Arbitrage signal display (NEW)
│   ├── SentinelPanel.tsx            # Sentinel config & toggle UI (NEW)
│   ├── SentinelTrigger.tsx          # Trigger notifications & effects (NEW)
│   ├── SystemStatus.tsx             # NORMAL/CRITICAL status display
│   ├── TerminalFeed.tsx             # Transaction event log
│   ├── WalletBalance.tsx            # ERG balance display
│   ├── WalletConnect.tsx            # Wallet connection button
│   ├── ErrorBanner.tsx              # Error/warning display
│   ├── ErrorBoundary.tsx            # Global error catching
│   └── isolated/
│       ├── ReserveSun.tsx           # Health visualization (CSS-based)
│       └── DataGrid.tsx             # Data display grid
├── lib/
│   ├── calculations.ts              # Reserve ratio formulas with logging
│   ├── demo-service.ts              # Mock data management
│   ├── store.ts                     # Zustand state (+ sentinel, scenarios)
│   ├── types.ts                     # TypeScript interfaces (extended)
│   └── hooks/
│       ├── useDjedData.ts           # Data fetching hook
│       ├── useDexPrice.ts           # DEX price & arbitrage calc (NEW)
│       ├── usePageVisibility.ts     # Visibility detection
│       └── usePrefersReducedMotion.ts  # Motion preference
├── public/
│   └── mock-data.json      # Demo mode data
├── tailwind.config.ts      # Tailwind + Financial Brutalism theme
└── jest.config.js          # Testing configuration
```

## 🧪 Testing

All 41 tests passing:
- **Unit Tests**: Calculation functions with edge cases
- **Component Tests**: React component rendering and interactions
- **Integration Tests**: Simulation modal behavior
- **Property-Based Tests**: Using fast-check for exhaustive coverage

## 🔧 Development Notes

### API Integration
- **Live Mode**: Fetches from Ergo Explorer API via `/api/djed` proxy
- **Demo Mode**: Uses `public/mock-data.json` when `?demo=true`
- **CORS Handling**: Next.js API route proxies external requests
- **Error Handling**: Graceful fallback to demo data on API failures

### Performance Optimizations
- Code splitting with dynamic imports
- SWR deduplication (5s interval)
- Image optimization
- Bundle size monitoring

### Accessibility
- Keyboard navigation with visible focus indicators
- ARIA live regions for dynamic content
- Skip navigation link
- Reduced motion support
- Color contrast WCAG AA compliant

## 🧪 Testing & Documentation

### Run All Tests
```bash
npm test
```
All 41 tests passing ✅

### New Features Testing Guide
See **[NEW_FEATURES_TESTING.md](./NEW_FEATURES_TESTING.md)** for comprehensive testing guide including:
- Arbitrage Sniper usage and testing
- Sentinel Mode configuration and triggers
- Risk Scenarios step-by-step testing
- Integration test flows
- Common issues and fixes
- Demo scripts for presentations

### Quick Feature Reference

#### Arbitrage Sniper
- **Location**: Below HeroSection, titled "Arbitrage Monitor"
- **Signals**: MINT DJED (green) | REDEEM DJED (red) | NO CLEAR EDGE (gray)
- **Threshold**: ±0.5% spread between DEX and protocol price
- **Refresh**: Every 15 seconds

#### Sentinel Mode
- **Activation**: Click "SENTINEL MODE" button (top-right)
- **Config Options**: Auto-redeem, volatility alerts, balance tracking
- **Visual Indicators**: Pulsing green shield when armed
- **Trigger Conditions**: Reserve ratio < 400% (if enabled)
- **Notifications**: Banner, border flash, terminal log, browser notification

#### Risk Scenarios
- **Access**: Inside "LAUNCH SIMULATION" modal
- **FLASH CRASH**: -50% price, instant
- **ORACLE FREEZE**: Lock price, disable slider
- **BANK RUN**: Force ratio to 399%, trigger CRITICAL
- **Reset**: "RESET TO LIVE" button in scenario controls

## 🚀 Production Deployment

### Environment Variables
No environment variables required. All configuration is compile-time.

### Build Command
```bash
npm run build
```

### Output
Static export suitable for CDN deployment or Docker containerization.

### Demo Mode for Judging
For environments without external API access:
```
https://your-domain.com?demo=true
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This project follows strict Financial Brutalism design principles. All contributions should maintain:
- High contrast (3:1 minimum)
- Monospace fonts for data
- Terminal green (#39FF14) and alert red (#FF2A2A) color scheme
- Zero gradients, shadows only for functional glow effects
- Brutalist corner brackets on all containers

## 📚 Additional Documentation

- **[NEW_FEATURES_TESTING.md](./NEW_FEATURES_TESTING.md)** - Complete guide for new features
- **[SETUP.md](./SETUP.md)** - Development environment setup

## License

MIT
