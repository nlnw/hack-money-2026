
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
                    <div className="logo-section">
                        <h1>⚡ SnapBet</h1>
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
