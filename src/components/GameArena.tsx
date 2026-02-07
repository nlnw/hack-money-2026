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
            alert("Insufficient Funds!");
            return;
        }

        // Yellow SDK Flow
        await yellowService.placeBet(5, type);

        // Update Backend
        placeBet(address, type, 5, ensName || undefined);

        // Update Local State
        setBalance(prev => prev - 5);
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

    return (
        <div className="game-arena-container">
            <div className="stats-bar" style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
            }}>
                <span>🏁 Round #{state.roundId}</span>
                <span style={{ color: '#FFE600', fontWeight: 'bold' }}>💰 Balance: ${balance}</span>
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
                    style={{ background: '#3b82f6', fontSize: '1.5rem', padding: '2rem 4rem', border: 'none' }}
                >
                    RUN 🏃
                </button>
                <button
                    className="bet-btn pass"
                    onClick={() => handleBet('PASS')}
                    style={{ background: '#ef4444', fontSize: '1.5rem', padding: '2rem 4rem', border: 'none' }}
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
