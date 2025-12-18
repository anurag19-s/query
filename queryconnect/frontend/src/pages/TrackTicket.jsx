import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TrackTicket() {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setTicket(null);

    if (!ticketId.trim()) {
      setError("Please enter a valid Ticket ID");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/track/${ticketId.trim()}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div className="header">
          <h1>Track Ticket</h1>
          <button
            className="themeToggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀︎" : "☾"}
          </button>
        </div>

        <p className="subtitle">
          Enter your ticket ID to check the latest status.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="form">
          <input
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
            placeholder="Ticket ID (e.g. GUEST-AB123)"
            autoFocus
          />

          {error && <div className="error">{error}</div>}

          <button className="primary" disabled={loading}>
            {loading ? "Searching…" : "Track Ticket"}
          </button>
        </form>

        {/* Ticket Result */}
        {ticket && (
          <div className="ticket">
            <div className="ticketHeader">
              <span className={`status ${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
              <span className="dept">{ticket.department}</span>
            </div>

            <h2>{ticket.title}</h2>

            <p className="desc">{ticket.description}</p>

            <div className="timeline">
              <div>Created: {formatDate(ticket.createdAt)}</div>
              {ticket.resolvedAt && (
                <div>Resolved: {formatDate(ticket.resolvedAt)}</div>
              )}
              {ticket.closedAt && (
                <div>Closed: {formatDate(ticket.closedAt)}</div>
              )}
            </div>

            {ticket.aiSuggestion && (
              <div className="ai">
                <strong>System Suggestion</strong>
                <p>{ticket.aiSuggestion}</p>
              </div>
            )}

            {ticket.comments?.length > 0 && (
              <div className="comments">
                <h4>Comments</h4>
                {ticket.comments.map((c, i) => (
                  <div key={i} className="comment">
                    <div className="meta">
                      <strong>{c.by}</strong>
                      <span>{c.role}</span>
                    </div>
                    <p>{c.text}</p>
                    <small>{formatDate(c.createdAt)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="nav">
          <button onClick={() => navigate("/guest")}>Guest Page</button>
          <button onClick={() => navigate("/")}>Login</button>
        </div>
      </div>

      {/* ===== INLINE CSS ===== */}
      <style>{`
        :root {
          --bg: #f5f6f8;
          --card: #ffffff;
          --text: #0f172a;
          --muted: #6b7280;
          --primary: #6366f1;
          --border: #e5e7eb;
        }

        [data-theme="dark"] {
          --bg: radial-gradient(circle at top, #1e2230, #0b0d14);
          --card: #151822;
          --text: #e5e7eb;
          --muted: #9ca3af;
          --border: #1f2937;
        }

        * {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro", Inter, sans-serif;
        }

        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg);
          padding: 20px;
        }

        .card {
          width: 100%;
          max-width: 620px;
          background: var(--card);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 30px 80px rgba(0,0,0,.35);
          animation: enter .45s ease;
        }

        @keyframes enter {
          from { opacity: 0; transform: scale(.97) translateY(12px); }
          to { opacity: 1; transform: none; }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h1 {
          margin: 0;
          font-size: 24px;
        }

        .subtitle {
          margin: 8px 0 22px;
          color: var(--muted);
          font-size: 14px;
        }

        .themeToggle {
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
          color: var(--text);
        }

        .form input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          margin-bottom: 12px;
        }

        .primary {
          width: 100%;
          padding: 12px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform .15s ease, opacity .15s;
        }

        .primary:hover { transform: translateY(-1px); }
        .primary:disabled { opacity: .7; }

        .error {
          background: rgba(239,68,68,.15);
          color: #ef4444;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .ticket {
          margin-top: 26px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(255,255,255,.03);
          animation: fade .35s ease;
        }

        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ticketHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .status {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(99,102,241,.15);
          color: var(--primary);
        }

        h2 { margin: 10px 0; }

        .desc {
          color: var(--muted);
          font-size: 14px;
        }

        .timeline {
          margin: 14px 0;
          font-size: 12px;
          color: var(--muted);
          display: grid;
          gap: 4px;
        }

        .ai {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(99,102,241,.12);
          font-size: 13px;
        }

        .comments {
          margin-top: 16px;
        }

        .comment {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-top: 8px;
          font-size: 13px;
        }

        .comment .meta {
          display: flex;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
        }

        .nav {
          display: flex;
          gap: 10px;
          margin-top: 26px;
        }

        .nav button {
          flex: 1;
          padding: 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default TrackTicket;
