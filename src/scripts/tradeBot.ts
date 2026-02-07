
import fetch from 'cross-fetch';

const API_URL = 'http://localhost:4321/api/gameState';
const BOTS = [
    { address: '0x1111111111111111111111111111111111111111', name: 'bot_alpha.eth' },
    { address: '0x2222222222222222222222222222222222222222', name: 'bot_beta.eth' },
    { address: '0x3333333333333333333333333333333333333333', name: 'degengamer.eth' },
    { address: '0x4444444444444444444444444444444444444444', name: 'whale_watch.eth' },
];

async function getGameState() {
    try {
        const res = await fetch(API_URL);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch game state");
        return null;
    }
}

async function placeBet(bot: any, prediction: 'RUN' | 'PASS') {
    const payload = {
        userAddress: bot.address,
        amount: 10 + Math.floor(Math.random() * 90), // Random amount 10-100
        prediction,
        ensName: bot.name
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'BET', payload })
        });
        console.log(`🤖 ${bot.name} bet ${payload.amount} on ${prediction}`);
    } catch (e) {
        console.error(`Error placing bet for ${bot.name}`, e);
    }
}

async function runBot() {
    console.log("Starting Trade Bot...");

    // Check state every 2 seconds
    setInterval(async () => {
        const state: any = await getGameState();
        if (!state) return;

        if (state.status === 'OPEN') {
            // 30% chance to place a bet if open
            if (Math.random() < 0.3) {
                const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
                const prediction = Math.random() > 0.5 ? 'RUN' : 'PASS';
                await placeBet(bot, prediction);
            }
        }
    }, 2000);
}

runBot();
