import { useState, useEffect, useCallback, useRef } from 'react';

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

export interface FrontendGameState {
    status: GameStatus;
    roundId: number;
    pot: number;
    timeLeft: number;
    lastResult: BetType | null;
    bets: Bet[];
    leaderboard: LeaderboardEntry[];
}

export function useGameState() {
    const [state, setState] = useState<FrontendGameState | null>(null);
    const [connected, setConnected] = useState(false);

    // Polling Version
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/gameState');
                const data = await res.json() as FrontendGameState;
                setState(data);
                setConnected(true);
            } catch (e) {
                console.error("Polling error", e);
                setConnected(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const placeBet = useCallback(async (address: string, prediction: BetType, amount: number, ensName?: string) => {
        const payload = {
            userAddress: address,
            amount,
            prediction,
            ensName
        };
        await fetch('/api/gameState', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'BET', payload })
        });
    }, []);

    const adminStart = useCallback(async () => {
        await fetch('/api/gameState', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'ADMIN_START' })
        });
    }, []);

    const adminResolve = useCallback(async (result: BetType) => {
        await fetch('/api/gameState', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'ADMIN_RESOLVE', payload: result })
        });
    }, []);

    return {
        state,
        connected,
        placeBet,
        adminStart,
        adminResolve
    };
}
