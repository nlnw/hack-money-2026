import { useAccount, useWalletClient, useEnsName, useEnsAvatar } from 'wagmi';
import { useGameState } from '../hooks/useGameState';
import { useEffect, useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { yellowService } from '../services/YellowService';
import toast, { Toaster } from 'react-hot-toast';

// CSS styles as objects for responsive design
const styles = {
    container: {
        position: 'relative' as const,
        padding: '1rem',
        maxWidth: '100%',
        minHeight: 'auto', // Let app-container handle height
    },
    yellowBadge: (connected: boolean) => ({
        position: 'fixed' as const,
        top: '70px', // Raised slightly
        left: '50%',
        transform: 'translateX(-50%)',
        background: connected ? 'linear-gradient(135deg, #FFE600 0%, #FFA500 100%)' : 'rgba(60,60,60,0.9)',
        color: connected ? '#000' : '#888',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: connected ? '0 0 20px rgba(255,230,0,0.4)' : 'none',
        zIndex: 1000,
        animation: 'badgePulse 2s ease-in-out infinite',
    }),
    statusDot: (connected: boolean) => ({
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: connected ? '#00FF00' : '#666',
        boxShadow: connected ? '0 0 6px #00FF00' : 'none',
    }),
    mainCard: {
        background: 'linear-gradient(180deg, rgba(20,20,35,0.95) 0%, rgba(10,10,20,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        maxWidth: '500px',
        margin: '60px auto 20px', // Reduced top margin
        textAlign: 'center' as const,
    },
    statsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        marginBottom: '1rem',
        flexWrap: 'wrap' as const,
        gap: '0.5rem',
    },
    statItem: {
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    timerContainer: {
        margin: '1.5rem 0',
    },
    timerText: (urgent: boolean) => ({
        fontSize: 'clamp(3rem, 15vw, 6rem)',
        fontWeight: 900,
        margin: 0,
        color: urgent ? '#FF4D4D' : '#fff',
        textShadow: urgent ? '0 0 30px rgba(255,77,77,0.5)' : '0 0 30px rgba(255,255,255,0.1)',
        letterSpacing: '-2px',
        animation: urgent ? 'timerPulse 0.5s ease-in-out infinite' : 'none',
    }),
    statusLabel: {
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase' as const,
        letterSpacing: '2px',
        marginTop: '-10px',
    },
    potSection: {
        margin: '1.5rem 0',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(0,255,148,0.1) 0%, rgba(0,200,100,0.05) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(0,255,148,0.2)',
    },
    potLabel: {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase' as const,
        letterSpacing: '2px',
        margin: 0,
    },
    potValue: {
        fontSize: 'clamp(2rem, 10vw, 4rem)',
        fontWeight: 900,
        color: '#00FF94',
        margin: '0.25rem 0',
        textShadow: '0 0 30px rgba(0,255,148,0.4)',
    },
    bettingSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    betButton: (type: 'run' | 'pass', disabled: boolean) => ({
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        fontSize: 'clamp(1rem, 4vw, 1.4rem)',
        fontWeight: 800,
        border: 'none',
        borderRadius: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        background: type === 'run'
            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        boxShadow: type === 'run'
            ? '0 8px 30px rgba(59,130,246,0.4)'
            : '0 8px 30px rgba(239,68,68,0.4)',
        color: '#fff',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    }),
    liveStats: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginTop: '1.5rem',
    },
    liveStat: (type: 'run' | 'pass') => ({
        padding: '1rem',
        background: type === 'run' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
        borderRadius: '12px',
        border: `1px solid ${type === 'run' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }),
    liveStatLabel: {
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase' as const,
        margin: 0,
    },
    liveStatValue: (type: 'run' | 'pass') => ({
        fontSize: '1.5rem',
        fontWeight: 700,
        color: type === 'run' ? '#60a5fa' : '#f87171',
        margin: '0.25rem 0 0',
    }),
    resultOverlay: (result: string) => ({
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' as const,
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out',
    }),
    resultText: (result: string) => ({
        fontSize: 'clamp(4rem, 20vw, 10rem)',
        fontWeight: 900,
        color: result === 'RUN' ? '#3b82f6' : '#ef4444',
        textShadow: `0 0 60px ${result === 'RUN' ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)'}`,
        animation: 'resultBounce 0.5s ease-out',
    }),
    welcomeCard: {
        background: 'linear-gradient(180deg, rgba(20,20,35,0.95) 0%, rgba(10,10,20,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        maxWidth: '400px',
        margin: '100px auto',
        textAlign: 'center' as const,
    },
    welcomeTitle: {
        fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
        fontWeight: 900,
        margin: '0 0 0.5rem',
        background: 'linear-gradient(135deg, #FFE600 0%, #FFA500 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    welcomeSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '1.5rem',
    },
    balanceDisplay: {
        background: 'linear-gradient(135deg, rgba(255,230,0,0.1) 0%, rgba(255,165,0,0.05) 100%)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontWeight: 700,
        color: '#FFE600',
        fontSize: '1.1rem',
        border: '1px solid rgba(255,230,0,0.2)',
    },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.8)',
    },
    roundBadge: {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)',
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
    },
};

export function GameArena() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: walletClient } = useWalletClient();
    const { state, connected, placeBet } = useGameState();
    const [localPot, setLocalPot] = useState(0);
    const [balance, setBalance] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [customName, setCustomName] = useState<string>('');
    const displayName = customName || ensName || (address ? `${address.slice(0, 4)}...${address.slice(-3)}` : '');
    const { data: avatar } = useEnsAvatar({ name: displayName, query: { enabled: !!displayName && displayName.includes('.') } });
    const [yellowConnected, setYellowConnected] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Auto-show and auto-dismiss result overlay
    useEffect(() => {
        if (state?.status === 'RESOLVING' && state?.lastResult) {
            setShowResult(true);
            const timer = setTimeout(() => setShowResult(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [state?.status, state?.lastResult]);

    // Live betting stats
    const bettingStats = useMemo(() => {
        if (!state?.bets) return { runCount: 0, passCount: 0, runAmount: 0, passAmount: 0 };
        return state.bets.reduce((acc, bet) => {
            if (bet.prediction === 'RUN') {
                acc.runCount++;
                acc.runAmount += bet.amount;
            } else {
                acc.passCount++;
                acc.passAmount += bet.amount;
            }
            return acc;
        }, { runCount: 0, passCount: 0, runAmount: 0, passAmount: 0 });
    }, [state?.bets]);

    // Fetch balance from D1 on mount
    useEffect(() => {
        if (address && !balanceLoading && balance === null) {
            setBalanceLoading(true);
            fetch(`/api/balance?address=${address}`)
                .then(res => res.json() as Promise<{ balance?: number }>)
                .then(data => {
                    setBalance(data.balance ?? 1000);
                    setBalanceLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch balance:', err);
                    setBalance(1000);
                    setBalanceLoading(false);
                });
        }
    }, [address, balanceLoading, balance]);

    useEffect(() => {
        if (state) {
            setLocalPot(state.pot);
        }
    }, [state]);

    useEffect(() => {
        if (walletClient && address) {
            yellowService.connect(walletClient, address).then(() => {
                setYellowConnected(yellowService.isConnected);
            });
        }
    }, [walletClient, address]);

    if (!connected) return (
        <div style={styles.welcomeCard}>
            <div className="loading-spinner" style={{ margin: '2rem auto', width: 40, height: 40, border: '3px solid rgba(255,230,0,0.2)', borderTop: '3px solid #FFE600', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connecting to Game Server...</p>
        </div>
    );

    if (!state) return (
        <div style={styles.welcomeCard}>
            <div className="loading-spinner" style={{ margin: '2rem auto', width: 40, height: 40, border: '3px solid rgba(255,230,0,0.2)', borderTop: '3px solid #FFE600', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading Game State...</p>
        </div>
    );

    const isBettingDisabled = state.status !== 'OPEN';
    const isUrgent = state.timeLeft <= 5 && state.status === 'OPEN';

    const handleBet = async (type: 'RUN' | 'PASS') => {
        if (!address) return;
        if (balance === null || balance < 5) {
            toast.error("💸 Insufficient Funds!");
            return;
        }

        const yellowPromise = yellowService.placeBet(5, type);
        toast.promise(yellowPromise, {
            loading: '🟡 Processing via Yellow Network...',
            success: `🟡 ${type} bet locked in!`,
            error: '❌ State channel error'
        });

        const displayName = customName || ensName || undefined;
        try {
            const res: any = await placeBet(address, type, 5, displayName);

            if (res.error) {
                toast.error(res.error);
                return;
            }

            let delta = -5;
            if (res && res.refund) {
                delta += res.refund;
                toast.success(`🔄 ${res.message}`);
            } else if (res.message) {
                toast.success(`✅ ${res.message}`);
            }

            const balanceRes = await fetch('/api/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, delta, ensName: displayName })
            });
            const balanceData = await balanceRes.json() as { newBalance?: number };
            if (balanceData.newBalance !== undefined) {
                setBalance(balanceData.newBalance);
            }
        } catch (e) {
            console.error("Bet Error", e);
            toast.error("Failed to place bet. Try again.");
        }
    };

    if (!address) {
        return (
            <div style={styles.container}>
                <Toaster position="top-center" />
                <div style={styles.welcomeCard}>
                    <h1 style={styles.welcomeTitle}>⚡ SnapBet</h1>
                    <p style={styles.welcomeSubtitle}>High-speed crypto betting powered by Yellow Network</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ConnectButton />
                    </div>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            🏈 Predict the play • 💰 Win the pot • 🚀 Instant settlements
                        </p>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div style={styles.container}>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(20,20,35,0.95)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                    },
                }}
            />

            {/* Yellow Network Badge */}
            <div style={styles.yellowBadge(yellowConnected)}>
                <span style={styles.statusDot(yellowConnected)} />
                🟡 Yellow {yellowConnected ? '✓' : '...'}
            </div>

            {/* Main Card */}
            <div style={styles.mainCard}>
                {/* Stats Row */}
                <div style={styles.statsRow}>
                    <div style={styles.userBadge}>
                        {avatar ? (
                            <img src={avatar} alt={displayName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        ) : (
                            <span>👤</span>
                        )}
                        <span>{displayName}</span>
                    </div>
                    <div style={styles.roundBadge}>Round #{state.roundId}</div>
                    <div style={styles.balanceDisplay}>
                        💰 ${balance !== null ? balance.toLocaleString() : '...'}
                    </div>
                </div>

                {/* Timer */}
                <div style={styles.timerContainer}>
                    <h1 style={styles.timerText(isUrgent)}>{state.timeLeft}s</h1>
                    <p style={styles.statusLabel}>
                        {state.status === 'IDLE' ? '⏳ WAITING' : state.status === 'OPEN' ? '🔥 BETTING OPEN' : '🔒 LOCKED'}
                    </p>
                </div>

                {/* Pot */}
                <div style={styles.potSection}>
                    <p style={styles.potLabel}>Current Pot</p>
                    <h2 style={styles.potValue}>${localPot}</h2>
                </div>

                {/* Live Stats */}
                <div style={styles.liveStats}>
                    <div style={styles.liveStat('run')}>
                        <p style={styles.liveStatLabel}>🏃 Run Bets</p>
                        <p style={styles.liveStatValue('run')}>{bettingStats.runCount} (${bettingStats.runAmount})</p>
                    </div>
                    <div style={styles.liveStat('pass')}>
                        <p style={styles.liveStatLabel}>🏈 Pass Bets</p>
                        <p style={styles.liveStatValue('pass')}>{bettingStats.passCount} (${bettingStats.passAmount})</p>
                    </div>
                </div>

                {/* Betting Buttons */}
                <div style={styles.bettingSection}>
                    <button
                        style={styles.betButton('run', isBettingDisabled)}
                        onClick={() => handleBet('RUN')}
                        disabled={isBettingDisabled}
                    >
                        🏃 RUN
                    </button>
                    <button
                        style={styles.betButton('pass', isBettingDisabled)}
                        onClick={() => handleBet('PASS')}
                        disabled={isBettingDisabled}
                    >
                        🏈 PASS
                    </button>
                </div>

                {/* Bet Cost Label */}
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1rem' }}>
                    Each bet costs $5
                </p>
            </div>

            {/* Result Overlay */}
            {showResult && state.lastResult && (
                <div
                    style={styles.resultOverlay(state.lastResult)}
                    onClick={() => setShowResult(false)}
                >
                    <h1 style={styles.resultText(state.lastResult)}>
                        {state.lastResult === 'RUN' ? '🏃' : '🏈'} {state.lastResult}!
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }}>
                        {state.lastResult === 'RUN' ? 'The QB ran!' : 'The QB passed!'}
                    </p>
                    <button
                        onClick={() => setShowResult(false)}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 2rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        Continue
                    </button>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1rem' }}>
                        Tap anywhere or wait to dismiss
                    </p>
                </div>
            )}
        </div>
    );
}
