import { useAccount, useWalletClient, useEnsName } from 'wagmi';
import { useGameState } from '../hooks/useGameState';
import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { yellowService } from '../services/YellowService';

export function GameArena() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: walletClient } = useWalletClient();
    const { state, connected, placeBet } = useGameState();
    const [localPot, setLocalPot] = useState(0);
    const [balance, setBalance] = useState(1000); // Simulated Start Balance
    const [customName, setCustomName] = useState<string>('');
    // --- Notification System ---
    interface Notification {
        id: string;
        message: string;
        type: 'success' | 'error' | 'info';
        timestamp: number;
    }

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('snapbet_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('snapbet_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const newNotif: Notification = {
            id: Date.now().toString() + Math.random().toString().slice(2),
            message,
            type,
            timestamp: Date.now()
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
    };
    // ---------------------------

    useEffect(() => {
        if (state) {
            setLocalPot(state.pot);
        }
    }, [state]);

    // Connect to Yellow SDK when wallet is available
    useEffect(() => {
        if (walletClient && address) {
            yellowService.connect(walletClient, address);
        }
    }, [walletClient, address]);

    if (!connected) return <div className="card">Connecting to Game Server...</div>;
    if (!state) return <div className="card">Loading Game State...</div>;

    const isLocked = state.status === 'LOCKED' || state.status === 'RESOLVING';
    const isBettingDisabled = state.status !== 'OPEN';

    const handleBet = async (type: 'RUN' | 'PASS') => {
        if (!address) return;
        if (balance < 5) {
            addNotification("Insufficient Funds!", 'error');
            return;
        }

        // Yellow SDK Flow
        await yellowService.placeBet(5, type);

        // Update Backend
        // Use custom name if provided, otherwise fallback to ENS or null
        const displayName = customName || ensName || undefined;
        try {
            const res: any = await placeBet(address, type, 5, displayName);

            if (res.error) {
                addNotification(res.error, 'error');
                return;
            }

            // Update Local State
            // If refund, add it back
            let newBalance = balance - 5;
            if (res && res.refund) {
                newBalance += res.refund;
                addNotification(res.message, 'success');
            } else if (res.message) {
                addNotification(res.message, 'success');
            }

            setBalance(newBalance);
        } catch (e) {
            console.error("Bet Error", e);
            addNotification("Failed to place bet. Try again.", 'error');
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

    // Register Name UI
    const displayName = customName || ensName || (address.slice(0, 6) + '...' + address.slice(-4));

    return (
        <div className="game-arena-container" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Notification Stack (Recent 3) */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 1000,
                pointerEvents: 'none' // Let clicks pass through
            }}>
                {notifications.slice(0, 3).map((note) => (
                    <div key={note.id} style={{
                        background: note.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                        animation: 'slideIn 0.3s ease-out',
                        minWidth: '250px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date(note.timestamp).toLocaleTimeString()}</div>
                        <div style={{ fontWeight: 'bold' }}>{note.message}</div>
                    </div>
                ))}
            </div>

            {/* History Panel Modal */}
            {showHistory && (
                <div style={{
                    position: 'absolute',
                    top: '70px',
                    left: '20px',
                    width: '320px',
                    maxHeight: '500px',
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    zIndex: 1100,
                    overflowY: 'auto',
                    padding: '16px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>🔔 Activity Log</h4>
                        <button
                            onClick={() => setNotifications([])}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                color: '#aaa',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                padding: '4px 8px'
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ color: '#666', textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>No recent activity</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {notifications.map(note => (
                                <div key={note.id} style={{
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${note.type === 'error' ? '#ef4444' : note.type === 'success' ? '#10b981' : '#3b82f6'}`
                                }}>
                                    <div style={{ fontSize: '0.7em', color: '#888', marginBottom: '4px' }}>{new Date(note.timestamp).toLocaleTimeString()}</div>
                                    <div style={{ color: '#eee', fontSize: '0.9rem', lineHeight: '1.4' }}>{note.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="stats-bar" style={{
                marginBottom: '1rem',
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
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        title="View History"
                        style={{
                            background: showHistory ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔔
                        {notifications.length > 0 && !showHistory && (
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%'
                            }} />
                        )}
                    </button>

                    <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div> {/* Separator */}

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
                <span style={{ color: '#FFE600', fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 0 10px rgba(255, 230, 0, 0.3)' }}>💰 ${balance}</span>
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
