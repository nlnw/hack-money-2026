import { useGameState } from '../hooks/useGameState';

export function Ticker({ inline }: { inline?: boolean }) {
    const { state } = useGameState();

    const containerStyle = inline ? {
        position: 'relative' as const,
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '0',
        overflow: 'hidden',
        fontSize: '0.8rem',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    } : {
        // Default fixed footer style (keeping for fallback)
        position: 'fixed' as const,
        bottom: 0,
        width: '100%',
        background: 'rgba(0, 0, 0, 0.95)',
        borderTop: '1px solid rgba(255, 230, 0, 0.15)',
        padding: '0.6rem 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap' as const,
        backdropFilter: 'blur(10px)',
        fontSize: '0.8rem',
    };

    if (!state || state.bets.length === 0) {
        if (inline) return <div style={containerStyle}><p style={{ margin: 0, opacity: 0.5 }}>Waiting for bets...</p></div>;
        return (
            <footer className="ticker" style={containerStyle as any}>
                <p style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>Waiting for bets... Get in the game!</p>
            </footer>
        );
    }

    // Get last 10 bets reversed
    const recentBets = [...state.bets].reverse().slice(0, 10);

    return (
        <div className={inline ? '' : "ticker"} style={containerStyle as any}>
            <div className="ticker-content" style={{ display: 'flex', gap: '2rem', animation: 'scroll 20s linear infinite' }}>
                {recentBets.map((bet, i) => (
                    <span key={i} style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#FFE600' }}>
                            {bet.ensName || `${bet.userAddress.slice(0, 6)}...`}
                        </span>
                        <span style={{ margin: '0 0.5rem', color: inline ? '#ccc' : 'inherit' }}>bet ${bet.amount} on</span>
                        <span style={{
                            fontWeight: 'bold',
                            color: bet.prediction === 'RUN' ? '#3b82f6' : '#ef4444'
                        }}>
                            {bet.prediction} {bet.prediction === 'RUN' ? '🏃' : '🏈'}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
