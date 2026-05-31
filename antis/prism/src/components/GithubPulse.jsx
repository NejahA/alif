import React, { useState, useEffect } from 'react';
import { ExternalLink, GitCommit, GitPullRequest, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GithubPulse = ({ username = 'antigravity-ai' }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGithub = async () => {
        try {
            const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=5`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
            }
            setLoading(false);
        } catch (error) {
            console.error("GithubPulse Fetch Failure", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGithub();
    }, [username]);

    const getIcon = (type) => {
        switch(type) {
            case 'PushEvent': return <GitCommit size={14} color="var(--s-primary)" />;
            case 'PullRequestEvent': return <GitPullRequest size={14} color="var(--s-glow)" />;
            case 'CreateEvent': return <GitBranch size={14} color="var(--s-secondary)" />;
            default: return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
            );
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ 
                flex: 1, 
                minWidth: '320px', 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        padding: '8px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>GITHUB_PULSE</h3>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--s-glow)', letterSpacing: '1px', fontWeight: 600 }}>LIVE_ACTIVITY</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="shimmer" style={{ height: '50px', borderRadius: '12px' }} />
                    ))
                ) : (
                    events.map((event) => (
                        <div key={event.id} style={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: 'rgba(5,5,10,0.4)', 
                            border: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                {getIcon(event.type)}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{event.type.replace('Event', '')}</span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                    {event.repo.name}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && events.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', opacity: 0.5 }}>NO_GH_ACTIVITY_SINK</p>
            )}

            <button className="btn-prism" style={{ marginTop: 'auto', padding: '10px', fontSize: '0.65rem' }}>
                VIEW_FULL_GRAPH
            </button>
        </motion.div>
    );
};

export default GithubPulse;
