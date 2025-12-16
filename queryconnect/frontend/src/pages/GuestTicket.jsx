import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GuestTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('Academics');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // tracking id coming from backend (GUEST-XXXXXX)
    const [trackingId, setTrackingId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/guest-tickets', {
                title,
                description,
                department
            });

            console.log('Guest ticket response:', res.data);
            console.log('Tracking ID from backend:', res.data.trackingId);

            const tid = res.data && res.data.trackingId ? res.data.trackingId : '';
            setTrackingId(tid);
            setSubmitted(true);

            setTitle('');
            setDescription('');
        } catch (err) {
            console.error(err);
            setMessage('Failed to submit query. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!trackingId) return;
        navigator.clipboard.writeText(trackingId);
        alert('Tracking ID copied to clipboard!');
    };

    const handleTrack = () => {
        if (!trackingId) return;
        navigate('/track', { state: { trackingId } });
    };

    const handleSubmitAnother = () => {
        setSubmitted(false);
        setTrackingId('');
        setMessage('');
    };

    // ============== SUCCESS SCREEN ==============
    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconCircle}>✓</div>
                    <h1 style={styles.title}>Query Submitted Successfully!</h1>
                    <p style={styles.subtitle}>
                        Your query has been received anonymously. Use the tracking ID below to check its status.
                    </p>

                    <div style={styles.trackingBox}>
                        <p style={styles.trackingLabel}>Your Tracking ID</p>
                        <div style={styles.trackingRow}>
                            <input
                                style={styles.trackingInput}
                                value={trackingId}
                                readOnly
                            />
                            <button
                                type="button"
                                style={styles.copyButton}
                                onClick={handleCopy}
                            >
                                📋 Copy
                            </button>
                        </div>
                        <p style={styles.trackingHint}>
                            💡 Save this ID. You will need it to track your query later.
                        </p>
                    </div>

                    <button style={styles.primaryButton} onClick={handleTrack}>
                        Track This Query
                    </button>
                    <button style={styles.secondaryButton} onClick={handleSubmitAnother}>
                        Submit Another Query
                    </button>
                    <button style={styles.tertiaryButton} onClick={() => navigate('/')}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // ============== FORM SCREEN ==============
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>QueryConnect</h1>
                <p style={styles.subtitle}>Submit an anonymous query</p>
                
                <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                        🔒 <strong>Fully Anonymous:</strong> No personal information required. 
                        You'll receive a tracking ID to check your query status.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Title</label>
                        <input
                            style={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Short title for your issue"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your query or complaint in detail"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Department</label>
                        <select
                            style={styles.input}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="Academics">Academics</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Library">Library</option>
                            <option value="IT">IT</option>
                            <option value="Administration">Administration</option>
                            <option value="Sports">Sports</option>
                            <option value="Transport">Transport</option>
                        </select>
                    </div>

                    {message && <div style={styles.message}>{message}</div>}

                    <button type="submit" style={styles.primaryButton} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Anonymous Query'}
                    </button>
                </form>

                {/* Track existing guest ticket */}
                <div style={styles.trackSection}>
                    <p style={styles.trackTitle}>
                        Already have a tracking ID?
                    </p>
                    <div style={styles.trackRow}>
                        <input
                            style={{ ...styles.input, flex: 1 }}
                            placeholder="Enter your tracking ID (e.g., GUEST-ABC123)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                        />
                        <button
                            type="button"
                            style={styles.trackButton}
                            onClick={() => {
                                if (!trackingId.trim()) {
                                    alert('Please enter a tracking ID');
                                    return;
                                }
                                navigate('/track', { state: { trackingId: trackingId.trim().toUpperCase() } });
                            }}
                        >
                            Track
                        </button>
                    </div>
                </div>

                {/* Back to Login link */}
                <div style={styles.loginLink}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={styles.linkButton}
                    >
                        ← Back to Login
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
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px 24px 24px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
        textAlign: 'center',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '9999px',
        backgroundColor: '#22c55e',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        margin: '0 auto 12px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
        color: '#111827',
    },
    subtitle: {
        fontSize: '14px',
        marginTop: '6px',
        marginBottom: '12px',
        color: '#6b7280',
    },
    infoBox: {
        marginBottom: '18px',
        padding: '12px 14px',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        border: '1px solid #bfdbfe',
    },
    infoText: {
        fontSize: '13px',
        color: '#1e40af',
        margin: 0,
        textAlign: 'left',
        lineHeight: '1.5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
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
    message: {
        fontSize: '13px',
        color: '#b91c1c',
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        padding: '8px 10px',
    },
    primaryButton: {
        marginTop: '10px',
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
    secondaryButton: {
        marginTop: '10px',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        color: '#111827',
        backgroundColor: '#e5e7eb',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    tertiaryButton: {
        marginTop: '10px',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    trackingBox: {
        marginTop: '18px',
        padding: '14px 12px',
        borderRadius: '12px',
        border: '1px dashed #e5e7eb',
        backgroundColor: '#f9fafb',
        textAlign: 'left',
    },
    trackingLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px',
    },
    trackingRow: {
        display: 'flex',
        gap: '8px',
    },
    trackingInput: {
        flex: 1,
        padding: '10px 12px',
        borderRadius: '9999px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        color: '#111827',
    },
    copyButton: {
        padding: '10px 14px',
        borderRadius: '9999px',
        border: 'none',
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.2s',
    },
    trackingHint: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '6px',
    },
    trackSection: {
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'left',
    },
    trackTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: '8px',
    },
    trackRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    trackButton: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#4f46e5',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.2s',
    },
    loginLink: {
        marginTop: '16px',
        textAlign: 'center',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#6366f1',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        textDecoration: 'none',
        padding: '4px 8px',
    },
};

export default GuestTicket;