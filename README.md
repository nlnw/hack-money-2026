# SnapBet ⚡

> High-speed crypto betting powered by Yellow Network state channels

![Hero](public/hero.png)

## 🎮 What is SnapBet?

SnapBet is a fast-paced prediction game where players bet on whether the quarterback will **RUN** or **PASS**. Built for ETHGlobal, it demonstrates real-time betting with instant settlements using Yellow Network's state channel technology.

## ✨ Features

- **⚡ Instant Bets** - Place bets in seconds with gasless transactions
- **🟡 Yellow Network** - State channel technology for instant settlements
- **💰 Persistent Balances** - Your balance is stored on Cloudflare D1
- **📱 Mobile First** - Fully responsive design for any device
- **🏆 Live Stats** - See real-time betting activity
- **🔐 Admin Panel** - Manage users and balances at `/admin`

## 🛠 Tech Stack

### Ethereum Developer Tools
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - A great wallet connector
- **Viem** - TypeScript Interface for Ethereum
- **Yellow Network SDK** - State channel integration

### Blockchains
- **Yellow Network** - High-speed state channels
- **Ethereum** - L1 settlement

### Programming Languages
- **TypeScript** - Core application logic
- **CSS** - Styling and animations
- **SQL** - Database schema

### Web Frameworks
- **Astro** - Static site generator and SSR
- **React** - UI Components

### Databases
- **Cloudflare D1** - SQL database for user balances
- **Cloudflare KV** - Session management

### Infrastructure
- **Cloudflare Pages** - Hosting and serverless functions
- **Bun** - Fast JavaScript runtime & package manager

### AI Tools
- **Google Gemini** - Used for full-stack code generation, debugging, UI/UX design, and generating visual assets (logo, hero image).

## 🏆 Prize Qualifications

### Integrate ENS ($3,500) & Yellow Network ($15,000)

#### Yellow - $15,000

**How are you using this Protocol / API?**
We use Yellow Network's state channel infrastructure to enable high-frequency, gasless betting. The `YellowService` manages the lifecycle of state channels—opening, updating with signed bets, and closing with final settlements—allowing for a seamless, instant user experience that traditional on-chain transactions cannot match.

**Code Links**
https://github.com/nlnw/hack-money-2026/blob/main/src/services/YellowService.ts#L13
https://github.com/nlnw/hack-money-2026/blob/main/src/services/YellowService.ts#L29
https://github.com/nlnw/hack-money-2026/blob/main/src/services/YellowService.ts#L56

**How easy is it to use the API / Protocol? (1 - very difficult, 10 - very easy)**
8

#### ENS - $5,000

**How are you using this Protocol / API?**
We integrated ENS to provide a social identity layer. The application uses `wagmi` hooks (`useEnsName`, `useEnsAvatar`) to reverse-resolve user addresses to their primary ENS names and avatars. This is displayed in the user's profile badge and on the live leaderboard, making the game more engaging and personal.

**Code Links**
https://github.com/nlnw/hack-money-2026/blob/main/src/components/GameArena.tsx#L238
https://github.com/nlnw/hack-money-2026/blob/main/src/components/Leaderboard.tsx#L15
https://github.com/nlnw/hack-money-2026/blob/main/src/components/GameArena.tsx#L411

**How easy is it to use the API / Protocol? (1 - very difficult, 10 - very easy)**
10

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run locally
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare
bunx wrangler pages deploy ./dist
```

## 📁 Project Structure

```
src/
├── components/
│   ├── App.tsx          # Main app wrapper with RainbowKit
│   └── GameArena.tsx    # Game UI with betting controls
├── hooks/
│   └── useGameState.ts  # Real-time game state polling
├── pages/
│   ├── index.astro      # Main page
│   ├── admin.astro      # Admin dashboard
│   └── api/
│       ├── balance.ts   # D1 balance operations
│       ├── admin.ts     # Admin API
│       └── gameState.ts # Game state API
├── services/
│   └── YellowService.ts # Yellow Network integration
└── styles/
    └── global.css       # Global styles & animations
```

## 🔐 Admin Setup

Set the admin password as a Cloudflare secret:

```bash
bunx wrangler pages secret put ADMIN_PASSWORD --project-name snapbet
```

Access the admin panel at `/admin`.

## 📜 License

MIT