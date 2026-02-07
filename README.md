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

| Layer | Technology |
|-------|------------|
| Frontend | Astro + React |
| Styling | CSS with animations |
| Web3 | wagmi + RainbowKit |
| State Channels | Yellow Network SDK |
| Database | Cloudflare D1 |
| Hosting | Cloudflare Pages |

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