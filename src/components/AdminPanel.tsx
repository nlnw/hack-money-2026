import { useGameState } from '../hooks/useGameState';

export function AdminPanel() {
    const { adminStart, adminResolve, state, connected } = useGameState();

    if (!state) return null;

    return (
        <div className="admin-panel" style={{
            background: 'rgba(20,20,35,0.95)',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h3 style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: connected ? '#00FF94' : '#ef4444' 
            }}>
                {connected ? '🟢' : '🔴'} Admin Panel
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button 
                    onClick={adminStart} 
                    disabled={state.status === 'OPEN'}
                    style={{
                        padding: '10px',
                        background: state.status !== 'OPEN' ? 'rgba(255, 230, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${state.status !== 'OPEN' ? 'rgba(255, 230, 0, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: state.status !== 'OPEN' ? '#FFE600' : 'rgba(255,255,255,0.3)',
                        cursor: state.status !== 'OPEN' ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    Start New Round
                </button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button 
                        onClick={() => adminResolve('RUN')} 
                        disabled={state.status !== 'OPEN' && state.status !== 'LOCKED'}
                        style={{
                            padding: '10px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#60a5fa',
                            cursor: (state.status === 'OPEN' || state.status === 'LOCKED') ? 'pointer' : 'not-allowed',
                            opacity: (state.status === 'OPEN' || state.status === 'LOCKED') ? 1 : 0.5,
                            fontWeight: 'bold'
                        }}
                    >
                        Resolve: RUN 🏃
                    </button>
                    <button 
                        onClick={() => adminResolve('PASS')} 
                        disabled={state.status !== 'OPEN' && state.status !== 'LOCKED'}
                        style={{
                            padding: '10px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#f87171',
                            cursor: (state.status === 'OPEN' || state.status === 'LOCKED') ? 'pointer' : 'not-allowed',
                            opacity: (state.status === 'OPEN' || state.status === 'LOCKED') ? 1 : 0.5,
                            fontWeight: 'bold'
                        }}
                    >
                        Resolve: PASS 🏈
                    </button>
                </div>
            </div>
            
            <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.7)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{state.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Time Left:</span>
                    <span style={{ fontWeight: 'bold', color: state.timeLeft < 10 ? '#ff4d4d' : '#fff' }}>{state.timeLeft}s</span>
                </div>
            </div>
        </div>
    );
}
