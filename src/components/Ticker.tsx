import { useGameState } from '../hooks/useGameState';

export function Ticker() {
    const { state } = useGameState();

    if (!state || state.bets.length === 0) {
        return (
            <footer className="ticker">
                <p style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>Waiting for bets... Get in the game!</p>
            </footer>
        );
    }

    // Get last 10 bets reversed
    const recentBets = [...state.bets].reverse().slice(0, 10);

    return (
        <footer className="ticker">
            <div className="ticker-content" style={{ display: 'flex', gap: '2rem', animation: 'scroll 20s linear infinite' }}>
                {recentBets.map((bet, i) => (
                    <span key={i} style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#FFE600' }}>
                            {bet.ensName || `${bet.userAddress.slice(0, 6)}...`}
                        </span>
                        <span style={{ margin: '0 0.5rem' }}>bet ${bet.amount} on</span>
                        <span style={{
                            fontWeight: 'bold',
                            color: bet.prediction === 'RUN' ? '#3b82f6' : '#ef4444'
                        }}>
                            {bet.prediction} {bet.prediction === 'RUN' ? '🏃' : '🏈'}
                        </span>
                    </span>
                ))}
            </div>
        </footer>
    );
}
