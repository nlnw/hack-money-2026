import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Providers } from './Providers';
import { GameArena } from './GameArena';
import { AdminPanel } from './AdminPanel';
import { Leaderboard } from './Leaderboard';
import { Ticker } from './Ticker';
import { yellowService } from '../services/YellowService';
import { useWalletClient, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export function App() {
    // We need to track yellow connection here to show it in the header
    // Ideally this state should be global or in a hook, but for now we'll duplicate the listener logic or just use a hook if available.
    // Since YellowService is a singleton, we can just subscribe.
    const [yellowConnected, setYellowConnected] = useState(false);

    useEffect(() => {
        const unsub = yellowService.subscribe((state: any) => {
            if (state.connected !== undefined) {
                setYellowConnected(state.connected);
            }
        });
        return unsub;
    }, []);

    return (
        <Providers>
            <div className="app-container">
                <header className="app-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <a href="/" className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
                            <img src="/logo.png" alt="SnapBet Logo" style={{ height: '40px' }} />
                            <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(135deg, #FFE600 0%, #00C6FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SnapBet</h1>
                        </a>

                        {/* Ticker integrated in header */}
                        <div style={{ flex: 1, maxWidth: '600px', overflow: 'hidden', position: 'relative', height: '30px' }}>
                             {/* We reuse the Ticker component but might need to adjust its styling to fit here. 
                                 Since Ticker has fixed positioning in CSS, we should override it or wrap it.
                                 Actually, Ticker component has `footer` tag and fixed pos. We should probably inline the content 
                                 or pass a prop to Ticker to be "inline". 
                                 For now, let's just assume Ticker needs to be refactored or we use a wrapper that forces it?
                                 No, CSS classes on Ticker are specific. 
                                 Let's modify Ticker.tsx next to support "inline" mode. 
                                 But for this step, I'll place it here and assume I'll fix Ticker.tsx momentarily.
                             */}
                             <Ticker inline={true} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Yellow Status Indicator */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px', /* Increased gap */
                            background: yellowConnected ? 'rgba(255, 230, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            padding: '8px 16px', /* Better padding */
                            borderRadius: '24px',
                            border: `1px solid ${yellowConnected ? 'rgba(255, 230, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: yellowConnected ? '#FFE600' : '#888',
                            whiteSpace: 'nowrap'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: yellowConnected ? '#00FF00' : '#666',
                                boxShadow: yellowConnected ? '0 0 6px #00FF00' : 'none'
                            }} />
                            Yellow Network
                        </div>

                        <ConnectButton showBalance={false} chainStatus="none" accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} />
                    </div>
                </header>
                
                {/* Ticker removed from here */}

                <main className="game-arena-wrapper">
                    <GameArena />
                </main>

                <Leaderboard />
                <AdminPanel />
            </div>
        </Providers>
    );
}
