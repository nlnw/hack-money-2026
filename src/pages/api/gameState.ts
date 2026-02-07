
import type { APIRoute } from 'astro';

export const prerender = false;

// --- SHARED TYPES ---
export type GameStatus = 'IDLE' | 'OPEN' | 'LOCKED' | 'RESOLVING';
export type BetType = 'RUN' | 'PASS';

export interface Bet {
    userAddress: string;
    amount: number;
    prediction: BetType;
    timestamp: number;
    ensName?: string;
}

export interface LeaderboardEntry {
    address: string;
    ensName?: string;
    profit: number;
    wins: number;
}

export interface GameState {
    status: GameStatus;
    roundId: number;
    pot: number;
    timeLeft: number;
    lastResult: BetType | null;
    bets: Bet[];
    leaderboard: LeaderboardEntry[];
}

// --- GLOBAL STATE (IN-MEMORY) ---
let state: GameState = {
    status: 'IDLE',
    roundId: 1,
    pot: 0,
    timeLeft: 15,
    lastResult: null,
    bets: [],
    leaderboard: []
};

let lastTick = Date.now();

function updateTimer() {
    const now = Date.now();
    if (state.status === 'OPEN' && now - lastTick > 1000) {
        const secondsPassed = Math.floor((now - lastTick) / 1000);
        state.timeLeft = Math.max(0, state.timeLeft - secondsPassed);
        lastTick = now;

        if (state.timeLeft === 0) {
            state.status = 'LOCKED';
        }
    } else if (state.status !== 'OPEN') {
        lastTick = now;
    }
}

// --- HANDLERS ---

export const GET: APIRoute = async () => {
    updateTimer();
    return new Response(JSON.stringify(state), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const POST: APIRoute = async ({ request }) => {
    updateTimer();

    try {
        const data = await request.json() as any;

        if (data.type === 'BET') {
            if (state.status !== 'OPEN') return new Response("Game Locked", { status: 400 });

            const { userAddress, amount, prediction, ensName } = data.payload;
            state.bets.push({
                userAddress,
                amount,
                prediction,
                ensName,
                timestamp: Date.now()
            });
            state.pot += amount;
            return new Response(JSON.stringify({ success: true, state }));
        }

        if (data.type === 'ADMIN_START') {
            state.status = 'OPEN';
            state.timeLeft = 15;
            state.pot = 0;
            state.bets = [];
            state.lastResult = null;
            state.roundId++;
            lastTick = Date.now();
            return new Response(JSON.stringify({ success: true, state }));
        }

        if (data.type === 'ADMIN_RESOLVE') {
            const result = data.payload as BetType;
            state.status = 'RESOLVING';
            state.lastResult = result;

            state.bets.forEach(bet => {
                let entry = state.leaderboard.find(e => e.address === bet.userAddress);
                if (!entry) {
                    entry = { address: bet.userAddress, ensName: bet.ensName, profit: 0, wins: 0 };
                    state.leaderboard.push(entry);
                }
                if (bet.prediction === result) {
                    entry.profit += 10;
                    entry.wins++;
                } else {
                    entry.profit -= 5;
                }
            });
            state.leaderboard.sort((a, b) => b.profit - a.profit);
            return new Response(JSON.stringify({ success: true, state }));
        }

    } catch (e) {
        return new Response("Bad Request", { status: 400 });
    }

    return new Response("Unknown Action", { status: 400 });
};
