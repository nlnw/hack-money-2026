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
    // Polling Version - Reduced Frequence
    const fetchState = useCallback(async () => {
        try {
            const res = await fetch('/api/gameState');
            const data = await res.json() as FrontendGameState;
            setState(data);
            setConnected(true);
        } catch (e) {
            console.error("Polling error", e);
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        // Initial Fetch
        fetchState();

        // Slow Poll fallback (every 5 seconds instead of 1s)
        const interval = setInterval(fetchState, 5000);

        // Subscribe to Yellow Service for "Push" updates
        // In a real implementation, yellowService would pass the new state directly
        // Here we just trigger a fetch when it says something changed
        const unsubscribe = (import('../services/YellowService').then(({ yellowService }) => {
            return yellowService.subscribe(() => {
                fetchState();
            });
        }));

        return () => {
            clearInterval(interval);
            unsubscribe.then(unsub => unsub && unsub());
        };
    }, [fetchState]);

    const placeBet = useCallback(async (address: string, prediction: BetType, amount: number, ensName?: string) => {
        const payload = {
            userAddress: address,
            amount,
            prediction,
            ensName
        };
        const res = await fetch('/api/gameState', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'BET', payload })
        });
        return await res.json();
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
