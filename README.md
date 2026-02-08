# 🍒 Mark Vinicius Cherry Tycoon

A decentralized farming simulation game built on the Internet Computer Protocol (ICP). Manage your cherry orchards, expand your farm, and become a cherry tycoon!

![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Platform](https://img.shields.io/badge/platform-Internet%20Computer-blue)
![Frontend](https://img.shields.io/badge/frontend-React%2018-61dafb)
![Backend](https://img.shields.io/badge/backend-Motoko-purple)

## 🎮 Features

### Core Gameplay
- 🚜 **Farm Management** - Manage multiple parcels across 16 Polish provinces
- 🌳 **Tree Lifecycle** - Realistic 0-40 year tree progression system
- 🍒 **Harvest System** - Dynamic yield calculation based on soil, water, and tree age
- ♻️ **Organic Farming** - 2-season organic conversion with 40% price premium
- 💰 **Market Trading** - Sell cherries via retail or wholesale channels
- 📈 **Progression System** - Level up through experience points

### Advanced Features
- **Tree Age Modifier** - Trees produce different yields at different ages
- **Soil Chemistry** - pH levels, fertility, and soil types affect yields
- **Water Management** - Irrigation system with depletion over seasons
- **Infrastructure** - Upgradeable facilities (warehouses, cold storage, tractors)
- **Seasonal Costs** - Realistic operating expenses each season
- **Tree Density Limits** - Maximum 400 trees per hectare

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Vite + TypeScript + Tailwind)
└────────┬────────┘
         │
    ┌────▼─────┐
    │ ICP SDK  │ (@dfinity/agent)
    └────┬─────┘
         │
┌────────▼────────┐
│ Motoko Backend  │ (Internet Computer Canister)
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Stable  │
    │ Storage  │
    └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **DFX** (Internet Computer SDK)
- **Git**

See [Environment Setup Guide](docs/environment_setup.md) for detailed installation instructions.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mark-vinicius-cherry-tycoon.git
   cd mark-vinicius-cherry-tycoon
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start local ICP replica** (in WSL/Linux)
   ```bash
   dfx start --background --clean
   ```

4. **Deploy backend canister**
   ```bash
   dfx deploy backend
   ```

5. **Start frontend dev server**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
mark-vinicius-cherry-tycoon/
├── backend/                 # Motoko backend
│   ├── main.mo             # Main canister (803 lines)
│   ├── types.mo            # Type definitions
│   ├── game_logic.mo       # Game formulas
│   └── old_main.mo         # Reference (Caffeine AI)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # UI pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   ├── types/         # TypeScript types
│   │   └── providers/     # Context providers
│   └── package.json
├── docs/                   # Documentation
├── dfx.json               # ICP configuration
├── test-backend.ps1       # Test script (20 tests)
└── README.md
```

## 🎯 Game Mechanics

### Starting Conditions
- **Cash**: 50,000 PLN
- **Parcel**: 0.5 hectares in Opole Province
- **Trees**: 50 cherry trees (5 years old)
- **Soil**: Sandy-clay (optimal)

### Pricing
- **Tree Planting**: 50 PLN per tree
- **Watering**: 200 PLN per action
- **New Parcel**: 60,000 PLN per hectare
- **Cherry Prices**: 10-25 PLN/kg (varies by type/channel)
- **Organic Premium**: +40% price

### Tree Lifecycle
- **Year 0**: Newly planted (no harvest)
- **Year 1-2**: Reduced yield (33%, 66%)
- **Year 3-40**: Peak production (100%)
- **Year 40+**: Trees die (must replant)

## 🧪 Testing

Run comprehensive backend tests:

```powershell
.\test-backend.ps1
```

This runs 20 tests covering:
- Player initialization
- Parcel operations (harvest, water, fertilize, plant)
- Market transactions
- Organic conversion
- Tree density validation
- Season progression

## 📚 Documentation

- [Setup Guide](docs/setup_guide.md) - Deployment instructions
- [Environment Setup](docs/environment_setup.md) - Prerequisites installation
- [Project Summary](docs/project_summary.md) - Complete overview
- [Game Design Document](Mark_Vinicius_V1.md) - Full GDD

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - State management
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Motoko** - Smart contract language
- **Internet Computer** - Blockchain platform
- **Stable Storage** - Data persistence

### Integration
- **@dfinity/agent** - ICP SDK
- **@dfinity/auth-client** - Internet Identity (ready)

## 🎨 UI Features

- ✅ Mobile-first responsive design
- ✅ Vibrant gradients and animations
- ✅ Loading states with spinners
- ✅ Error handling with retry
- ✅ Real-time data updates
- ✅ Color-coded status indicators
- ✅ Progress bars (water, fertility)
- ✅ Interactive sliders

## 📊 Stats

- **2,537 lines** of code
- **25 files** created
- **18+ backend functions**
- **3 UI pages**
- **20 comprehensive tests**

## 🗺️ Roadmap

### ✅ Phase 1: Core Engine (Complete)
- Backend with all game mechanics
- Caffeine AI integration
- Frontend UI
- Backend integration

### 🔄 Phase 2: Polish (In Progress)
- [ ] Toast notifications
- [ ] Modals and dialogs
- [ ] Animations
- [ ] Internet Identity auth

### 📋 Phase 3: Advanced Features
- [ ] Weather system
- [ ] Market dynamics
- [ ] AI competitors
- [ ] Sports management
- [ ] Achievements

### 🚀 Phase 4: Deployment
- [ ] IC mainnet deployment
- [ ] Custom domain
- [ ] Analytics
- [ ] Performance optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Internet Computer ecosystem
- Inspired by classic farming simulation games
- Special thanks to the Caffeine AI project for valuable game mechanics

## 📞 Contact

- **GitHub**: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- **Project**: [Mark Vinicius Cherry Tycoon](https://github.com/YOUR_USERNAME/mark-vinicius-cherry-tycoon)

---

**Ready to play!** 🍒🚜
