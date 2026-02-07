import { useAccount, useWalletClient, useEnsName } from 'wagmi';
import { useGameState } from '../hooks/useGameState';
import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { yellowService } from '../services/YellowService';
import toast, { Toaster } from 'react-hot-toast';

export function GameArena() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: walletClient } = useWalletClient();
    const { state, connected, placeBet } = useGameState();
    const [localPot, setLocalPot] = useState(0);
    const [balance, setBalance] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [customName, setCustomName] = useState<string>('');
    const [yellowConnected, setYellowConnected] = useState(false);

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

    // Connect to Yellow SDK when wallet is available
    useEffect(() => {
        if (walletClient && address) {
            yellowService.connect(walletClient, address).then(() => {
                setYellowConnected(yellowService.isConnected);
            });
        }
    }, [walletClient, address]);

    if (!connected) return <div className="card">Connecting to Game Server...</div>;
    if (!state) return <div className="card">Loading Game State...</div>;

    const isLocked = state.status === 'LOCKED' || state.status === 'RESOLVING';
    const isBettingDisabled = state.status !== 'OPEN';

    const handleBet = async (type: 'RUN' | 'PASS') => {
        if (!address) return;
        if (balance === null || balance < 5) {
            toast.error("Insufficient Funds!");
            return;
        }

        // Yellow SDK Flow - State channel bet
        const yellowPromise = yellowService.placeBet(5, type);
        toast.promise(yellowPromise, {
            loading: '🟡 Yellow: Processing state channel...',
            success: '🟡 Yellow: Bet recorded on-chain!',
            error: '🟡 Yellow: State channel error'
        });

        // Update Backend
        const displayName = customName || ensName || undefined;
        try {
            const res: any = await placeBet(address, type, 5, displayName);

            if (res.error) {
                toast.error(res.error);
                return;
            }

            // Calculate new balance
            let delta = -5;
            if (res && res.refund) {
                delta += res.refund;
                toast.success(res.message);
            } else if (res.message) {
                toast.success(res.message);
            }

            // Update balance in D1
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
            <div className="card">
                <h2>Welcome to SnapBet</h2>
                <p>Connect your wallet to join the high-speed betting action.</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    const displayName = customName || ensName || (address.slice(0, 6) + '...' + address.slice(-4));

    return (
        <div className="game-arena-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* React Hot Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                }}
            />

            {/* Yellow Network Badge */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: yellowConnected ? 'linear-gradient(135deg, #FFE600 0%, #FFA500 100%)' : 'rgba(100,100,100,0.5)',
                color: yellowConnected ? '#000' : '#888',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: yellowConnected ? '0 0 20px rgba(255,230,0,0.3)' : 'none',
                zIndex: 100
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: yellowConnected ? '#00FF00' : '#666',
                    boxShadow: yellowConnected ? '0 0 6px #00FF00' : 'none'
                }} />
                🟡 Yellow Network {yellowConnected ? 'Connected' : 'Connecting...'}
            </div>

            <div className="stats-bar" style={{
                marginBottom: '1rem',
                marginTop: '60px',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span>👤 {displayName}</span>
                    {(!ensName && !customName) && (
                        <button
                            onClick={() => {
                                const name = prompt("Enter a Game Name (Mock ENS):");
                                if (name) setCustomName(name.endsWith('.eth') ? name : name + '.eth');
                            }}
                            style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}
                        >
                            Set Name
                        </button>
                    )}
                </div>
                <span>🏁 Round #{state.roundId}</span>
                <span style={{ color: '#FFE600', fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 0 10px rgba(255, 230, 0, 0.3)' }}>
                    💰 ${balance !== null ? balance : '...'}
                </span>
            </div>

            <div className="timer-section">
                <h2 style={{ fontSize: '4rem', margin: '0', color: state.timeLeft < 5 ? '#FF4D4D' : '#fff' }}>
                    {state.timeLeft}s
                </h2>
                <p>{state.status === 'IDLE' ? 'WAITING FOR NEXT SNAP' : 'TO SNAP'}</p>
            </div>

            <div className="pot-display">
                <h3>CURRENT POT</h3>
                <h1 style={{ color: '#00FF94' }}>${localPot}</h1>
            </div>

            <div className="betting-controls" style={{
                opacity: isBettingDisabled ? 0.5 : 1,
                pointerEvents: isBettingDisabled ? 'none' : 'auto',
                display: 'flex',
                gap: '2rem',
                justifyContent: 'center',
                marginTop: '2rem'
            }}>
                <button
                    className="bet-btn run"
                    onClick={() => handleBet('RUN')}
                    disabled={isBettingDisabled}
                    style={{
                        background: '#3b82f6',
                        fontSize: '1.5rem',
                        padding: '2rem 4rem',
                        border: 'none',
                        opacity: isBettingDisabled ? 0.5 : 1,
                        cursor: isBettingDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    RUN 🏃
                </button>
                <button
                    className="bet-btn pass"
                    onClick={() => handleBet('PASS')}
                    disabled={isBettingDisabled}
                    style={{
                        background: '#ef4444',
                        fontSize: '1.5rem',
                        padding: '2rem 4rem',
                        border: 'none',
                        opacity: isBettingDisabled ? 0.5 : 1,
                        cursor: isBettingDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    PASS 🏈
                </button>
            </div>

            {state.lastResult && state.status === 'RESOLVING' && (
                <div className="result-overlay" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.9)',
                    padding: '2rem',
                    borderRadius: '20px',
                    border: `4px solid ${state.lastResult === 'RUN' ? '#3b82f6' : '#ef4444'}`
                }}>
                    <h1 style={{ fontSize: '5rem', margin: 0 }}>
                        {state.lastResult}
                    </h1>
                </div>
            )}
        </div>
    );
}
