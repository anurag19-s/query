// FULL REPLACEMENT FILE – LOGIC UNCHANGED, UI/UX REDESIGNED (APPLE-ISH)

import { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [filterDept, setFilterDept] = useState("All");
  const [expandedTickets, setExpandedTickets] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const departments = [
    "All",
    "Academics",
    "Hostel",
    "Library",
    "IT",
    "Administration",
    "Sports",
    "Transport",
  ];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchTickets();
    fetchAnalytics();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalytics(res.data);
  };

  const filteredTickets =
    filterDept === "All"
      ? tickets
      : tickets.filter((t) => t.department === filterDept);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>

        <div className="headerActions">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button className="danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Analytics */}
      <section className="stats">
        {[
          ["Total Tickets", analytics.total],
          ["Pending", analytics.pending],
          ["In Progress", analytics.inProgress],
          ["Resolved", analytics.resolved],
        ].map(([label, value]) => (
          <div key={label} className="statCard">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* Filter */}
      <section className="filter">
        <label>Department</label>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </section>

      {/* Tickets */}
      <section className="tickets">
        {filteredTickets.map((ticket) => (
          <div key={ticket._id} className="ticketCard">
            <div className="ticketTop">
              <h3>{ticket.title}</h3>
              <span className={`status ${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
            </div>

            <p className="meta">{ticket.department}</p>

            <p className="desc">
              {expandedTickets[ticket._id]
                ? ticket.description
                : ticket.description.slice(0, 140) + "..."}
            </p>

            <button
              className="link"
              onClick={() =>
                setExpandedTickets((p) => ({
                  ...p,
                  [ticket._id]: !p[ticket._id],
                }))
              }
            >
              {expandedTickets[ticket._id] ? "Show less" : "Show more"}
            </button>
          </div>
        ))}
      </section>

      {/* ===== INLINE CSS ===== */}
      <style>{`
        :root {
          --bg: #f5f6f8;
          --card: #ffffff;
          --text: #0f172a;
          --muted: #6b7280;
          --border: #e5e7eb;
          --primary: #6366f1;
          --danger: #ef4444;
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
          background: var(--bg);
          padding: 28px;
          color: var(--text);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        h1 {
          margin: 0;
          font-size: 26px;
        }

        .header p {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--muted);
        }

        .headerActions {
          display: flex;
          gap: 10px;
        }

        .headerActions button {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          color: var(--text);
        }

        .danger {
          color: var(--danger);
          border-color: rgba(239,68,68,.4);
        }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .statCard {
          background: var(--card);
          padding: 18px;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(0,0,0,.12);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .statCard strong {
          font-size: 26px;
        }

        .statCard span {
          font-size: 13px;
          color: var(--muted);
        }

        /* Filter */
        .filter {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 22px;
        }

        .filter select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
        }

        /* Tickets */
        .tickets {
          display: grid;
          gap: 16px;
        }

        .ticketCard {
          background: var(--card);
          padding: 18px;
          border-radius: 18px;
          box-shadow: 0 14px 36px rgba(0,0,0,.15);
          animation: fadeUp .35s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }

        .ticketTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h3 {
          margin: 0;
          font-size: 16px;
        }

        .status {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(99,102,241,.15);
          color: var(--primary);
        }

        .meta {
          margin: 6px 0;
          font-size: 13px;
          color: var(--muted);
        }

        .desc {
          font-size: 14px;
          line-height: 1.5;
        }

        .link {
          margin-top: 6px;
          background: none;
          border: none;
          padding: 0;
          color: var(--primary);
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
