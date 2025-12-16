import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TrackTicket() {
    const [ticketId, setTicketId] = useState('');
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setTicket(null);

        if (!ticketId.trim()) {
            setError('Please enter a ticket ID');
            return;
        }

        try {
            setLoading(true);
            // Guest tickets and normal tickets both use same endpoint
            const token = localStorage.getItem('token');

            const headers = token
                ? { Authorization: `Bearer ${token}` }
                : {};

            const res = await axios.get(
                `http://localhost:5000/api/track/${ticketId.trim()}`,
                { headers }
            );

            setTicket(res.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Ticket not found or access denied'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) =>
        d ? new Date(d).toLocaleString() : '-';

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Track Ticket</h1>
                <p style={styles.subtitle}>
                    Enter your ticket ID to check its current status.
                </p>

                <form onSubmit={handleSearch} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Ticket ID</label>
                        <input
                            style={styles.input}
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                            placeholder="e.g., GUEST-ABC123 or 693d9756..."
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Searching...' : 'Track Ticket'}
                    </button>
                </form>

                {ticket && (
                    <div style={styles.ticketBox}>
                        <div style={styles.statusBadge}>
                            {ticket.status}
                        </div>
                        
                        <h2 style={styles.ticketTitle}>{ticket.title}</h2>
                        
                        <div style={styles.metaRow}>
                            <span style={styles.metaItem}>
                                🏢 <strong>{ticket.department}</strong>
                            </span>
                            <span style={styles.metaItem}>
                                ⚡ <strong>{ticket.priority}</strong>
                            </span>
                        </div>

                        <div style={styles.timestampSection}>
                            <p style={styles.timestamp}>
                                📅 Created: {formatDate(ticket.createdAt)}
                            </p>
                            {ticket.resolvedAt && (
                                <p style={styles.timestamp}>
                                    ✅ Resolved: {formatDate(ticket.resolvedAt)}
                                </p>
                            )}
                            {ticket.closedAt && (
                                <p style={styles.timestamp}>
                                    🔒 Closed: {formatDate(ticket.closedAt)}
                                </p>
                            )}
                        </div>

                        <div style={styles.section}>
                            <p style={styles.sectionTitle}>📝 Description</p>
                            <p style={styles.text}>{ticket.description}</p>
                        </div>

                        {ticket.aiSuggestion && (
                            <div style={styles.section}>
                                <p style={styles.sectionTitle}>🤖 AI Suggestion</p>
                                <div style={styles.aiBox}>
                                    <p style={styles.text}>{ticket.aiSuggestion}</p>
                                </div>
                            </div>
                        )}

                        {ticket.comments && ticket.comments.length > 0 && (
                            <div style={styles.section}>
                                <p style={styles.sectionTitle}>💬 Comments ({ticket.comments.length})</p>
                                <div style={styles.commentList}>
                                    {ticket.comments.map((c, idx) => (
                                        <div key={idx} style={styles.commentItem}>
                                            <div style={styles.commentHeader}>
                                                <strong>{c.by}</strong>
                                                <span style={styles.commentRole}>({c.role})</span>
                                            </div>
                                            <p style={styles.commentTime}>
                                                {new Date(c.createdAt).toLocaleString()}
                                            </p>
                                            <p style={styles.commentText}>{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => navigate('/guest')}
                    >
                        ← Back to Guest Page
                    </button>
                    
                    <button
                        type="button"
                        style={styles.tertiaryButton}
                        onClick={() => navigate('/')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
        padding: '20px',
    },
    card: {
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px 24px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
    },
    title: {
        fontSize: '26px',
        fontWeight: '700',
        textAlign: 'center',
        margin: 0,
        color: '#4f46e5',
    },
    subtitle: {
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '6px',
        marginBottom: '18px',
        color: '#6b7280',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#4b5563',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: '#f9fafb',
        color: '#111827',
    },
    button: {
        marginTop: '4px',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#4f46e5',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '8px 10px',
        borderRadius: '8px',
        fontSize: '13px',
    },
    ticketBox: {
        marginTop: '16px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    ticketTitle: {
        fontSize: '20px',
        fontWeight: '600',
        margin: '8px 0',
        color: '#111827',
    },
    metaRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px',
        flexWrap: 'wrap',
    },
    metaItem: {
        fontSize: '14px',
        color: '#4b5563',
    },
    timestampSection: {
        padding: '10px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        marginBottom: '12px',
    },
    timestamp: {
        fontSize: '12px',
        color: '#6b7280',
        margin: '4px 0',
    },
    section: {
        marginTop: '12px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    text: {
        fontSize: '14px',
        color: '#4b5563',
        lineHeight: '1.5',
    },
    aiBox: {
        padding: '12px',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        borderLeft: '3px solid #3b82f6',
    },
    commentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    commentItem: {
        padding: '12px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    commentHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
    },
    commentRole: {
        fontSize: '12px',
        color: '#6b7280',
    },
    commentTime: {
        fontSize: '11px',
        color: '#9ca3af',
        margin: '2px 0 8px 0',
    },
    commentText: {
        fontSize: '13px',
        color: '#374151',
        margin: 0,
        lineHeight: '1.5',
    },
    buttonGroup: {
        marginTop: '20px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    secondaryButton: {
        flex: 1,
        minWidth: '200px',
        padding: '10px 16px',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#4f46e5',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    tertiaryButton: {
        flex: 1,
        minWidth: '150px',
        padding: '10px 16px',
        borderRadius: '9999px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        fontWeight: '600',
        color: '#4b5563',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

export default TrackTicket;