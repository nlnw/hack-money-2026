import { useGameState } from '../hooks/useGameState';

export function AdminPanel() {
    const { adminStart, adminResolve, state, connected } = useGameState();

    if (!state) return null;

    return (
        <div className="admin-panel" style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            border: '1px solid yellow',
            borderRadius: '10px'
        }}>
            <h3>Admin Panel {connected ? '🟢' : '🔴'}</h3>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button onClick={adminStart} disabled={state.status === 'OPEN'}>
                    Start New Round
                </button>
                <button onClick={() => adminResolve('RUN')} disabled={state.status !== 'OPEN' && state.status !== 'LOCKED'}>
                    Resolve: RUN 🏃
                </button>
                <button onClick={() => adminResolve('PASS')} disabled={state.status !== 'OPEN' && state.status !== 'LOCKED'}>
                    Resolve: PASS 🏈
                </button>
            </div>
            <div>
                Status: {state.status} <br />
                Time: {state.timeLeft}s
            </div>
        </div>
    );
}
