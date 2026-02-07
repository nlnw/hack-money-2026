import { useGameState } from '../hooks/useGameState';

export function Leaderboard() {
    const { state } = useGameState();

    if (!state) return null;

    return (
        <div className="leaderboard" style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            width: '300px',
            background: 'rgba(20,20,20,0.9)',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1rem',
            maxHeight: '400px',
            overflowY: 'auto'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FFE600', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                🏆 Top Degens
            </h3>

            <div className="list">
                {state.leaderboard.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No players yet</p>}

                {state.leaderboard.map((entry, i) => (
                    <div key={entry.address} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: '#666', width: '20px' }}>#{i + 1}</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {entry.ensName || `${entry.address.slice(0, 6)}...`}
                            </span>
                        </div>
                        <div style={{
                            color: entry.profit >= 0 ? '#00FF94' : '#FF4D4D',
                            fontWeight: 'bold'
                        }}>
                            {entry.profit >= 0 ? '+' : ''}{entry.profit}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
