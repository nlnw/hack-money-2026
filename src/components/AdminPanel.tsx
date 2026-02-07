import { useGameState } from '../hooks/useGameState';

export function AdminPanel() {
    const { adminStart, adminResolve, state, connected } = useGameState();

    if (!state) return null;

    return (
        <div className="admin-panel">
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
