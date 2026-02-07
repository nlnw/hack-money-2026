# SnapBet 🏈

## Short description
High-speed decentralized football prediction. Bet on "Run" vs "Pass" in real-time!

## Description
SnapBet is a fast-paced prediction platform for high-frequency betting on live game outcomes. Built for speed, it allows users to wager on the next play—"Run" vs "Pass"—during 15-second windows. The project leverages state-channel technology for near-instant transaction signing, featuring a real-time leaderboard, persistent balance management via Cloudflare D1, and a unique "switching sides" penalty mechanic. It delivers a competitive environment for sports fans and traders seeking a gamified, high-frequency format.

## How it's made
SnapBet uses a low-latency architecture with Astro, React, and Tailwind CSS. Web3 connectivity is handled by RainbowKit and Wagmi. It integrates the Yellow SDK (Nitrolite) to utilize state-channel-inspired signed updates via ClearNode for fast, secure betting. The backend runs on Cloudflare Workers and D1 for persistence. A notable "hacky" feature is our trade bot script that maintains pot liquidity and leaderboard activity, while server-side timers ensure fair play during the rapid 15-second betting cycles.