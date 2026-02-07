import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Providers } from './Providers';
import { GameArena } from './GameArena';
import { AdminPanel } from './AdminPanel';
import { Leaderboard } from './Leaderboard';
import { Ticker } from './Ticker';

export function App() {
    return (
        <Providers>
            <div className="app-container">
                <header className="app-header">
                    <a href="/" className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img src="/logo.png" alt="SnapBet Logo" style={{ height: '40px' }} />
                        <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(135deg, #FFE600 0%, #00C6FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SnapBet</h1>
                    </a>
                    <div style={{ marginLeft: 'auto' }}>
                        <ConnectButton showBalance={false} chainStatus="none" accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} />
                    </div>
                </header>

                <main className="game-arena-wrapper">
                    <GameArena />
                </main>

                <Leaderboard />
                <AdminPanel />
                <Ticker />
            </div>
        </Providers>
    );
}
