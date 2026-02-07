import { useGameState } from '../hooks/useGameState';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { useEffect, useState } from 'react';

function LeaderboardItem({ entry, rank }: { entry: any, rank: number }) {
    // If we don't have a name from the backend, try to reverse resolve it
    const { data: ensName } = useEnsName({
        address: entry.address as `0x${string}`,
        query: { enabled: !entry.ensName }
    });

    const displayName = entry.ensName || ensName || `${entry.address.slice(0, 6)}...`;

    // Resolve avatar for the name we have
    const { data: avatar } = useEnsAvatar({
        name: displayName,
        query: { enabled: !!displayName && displayName.includes('.') }
    });

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            padding: '0.5rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#666', width: '20px', fontSize: '0.8rem' }}>#{rank}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {avatar ? (
                        <img src={avatar} alt={displayName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFE600 0%, #FFA500 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', fontWeight: 'bold' }}>
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                        {displayName}
                    </span>
                </div>
            </div>
            <div style={{
                color: entry.profit >= 0 ? '#00FF94' : '#FF4D4D',
                fontWeight: 'bold',
                fontFamily: 'monospace'
            }}>
                {entry.profit >= 0 ? '+' : ''}{entry.profit}
            </div>
        </div>
    );
}

export function Leaderboard() {
    const { state } = useGameState();

    if (!state) return null;

    return (
        <div className="leaderboard" style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            width: '320px',
            background: 'rgba(20,20,25,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.25rem',
            maxHeight: '500px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 100
        }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FFE600', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏆 Top Degens
            </h3>

            <div className="list">
                {state.leaderboard.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>No players yet</p>}

                {state.leaderboard.map((entry, i) => (
                    <LeaderboardItem key={entry.address} entry={entry} rank={i + 1} />
                ))}
            </div>
        </div>
    );
}
