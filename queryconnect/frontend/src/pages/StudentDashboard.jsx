import { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Academics");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const departments = [
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
    setMounted(true);
    fetchTickets();
    fetchNotifications();
  }, []);

  const fetchTickets = async () => {
    const res = await axios.get("http://localhost:5000/api/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data);
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post(
      "http://localhost:5000/api/tickets",
      { title, description, department },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle("");
    setDescription("");
    setShowForm(false);
    fetchTickets();
    setLoading(false);
  };

  return (
    <div className={`app ${mounted ? "mounted" : ""}`}>
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>Student Dashboard</h1>
          <span className="muted">Welcome, {user.name}</span>
        </div>

        <div className="actions">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="ghost"
          >
            Theme
          </button>
          <button className="danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* NOTICES */}
      <section className="card">
        <h2>Notices</h2>
        {notifications.length === 0 ? (
          <p className="muted">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="notice">
              {n.title}
            </div>
          ))
        )}
      </section>

      {/* CREATE TICKET */}
      <button
        className="primary"
        onClick={() => setShowForm((s) => !s)}
        aria-expanded={showForm}
      >
        {showForm ? "Cancel" : "New Ticket"}
      </button>

      <div
        className={`form-wrap ${showForm ? "open" : ""}`}
        aria-hidden={!showForm}
      >
        <form className="card" onSubmit={submitTicket}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <button className="primary" disabled={loading}>
            {loading ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>

      {/* TICKETS */}
      <section>
        <h2>My Tickets</h2>
        {tickets.map((t) => (
          <div key={t._id} className="card hover">
            <h3>{t.title}</h3>
            <p className="muted">{t.description}</p>
            <span className={`badge ${t.status.toLowerCase()}`}>
              {t.status}
            </span>
          </div>
        ))}
      </section>

      {/* STYLES */}
      <style>{`
        :root {
          --bg: #0f1115;
          --card: #16181d;
          --text: #f5f5f5;
          --muted: #9ca3af;
          --primary: #7c3aed;
          --danger: #ff453a;
          --border: #23262f;
        }

        [data-theme="light"] {
          --bg: #f5f6f8;
          --card: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --border: #e5e7eb;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .app {
          min-height: 100vh;
          padding: 28px;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          transition: all 0.6s ease;
        }

        .app.mounted {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 26px;
        }

        h2 {
          margin: 0 0 12px;
          font-size: 18px;
        }

        h3 {
          margin: 0 0 6px;
        }

        .actions button {
          margin-left: 8px;
        }

        button {
          border: none;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        button:focus-visible {
          outline: 3px solid rgba(124,58,237,0.5);
        }

        .primary {
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: white;
        }

        .primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(124,58,237,0.35);
        }

        .danger {
          background: var(--danger);
          color: white;
        }

        .ghost {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
        }

        .card {
          background: var(--card);
          padding: 18px;
          border-radius: 18px;
          margin-bottom: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          animation: fade 0.4s ease;
        }

        .hover:hover {
          transform: translateY(-2px);
          transition: 0.2s;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 12px;
          background: transparent;
          color: var(--text);
          font-size: 14px;
        }

        textarea {
          resize: none;
        }

        .badge {
          display: inline-block;
          margin-top: 8px;
          font-size: 12px;
          background: var(--primary);
          color: white;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .notice {
          padding: 10px 12px;
          border-left: 3px solid var(--primary);
          background: rgba(124,58,237,0.12);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .muted {
          color: var(--muted);
          font-size: 13px;
        }

        .form-wrap {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: all 0.4s ease;
        }

        .form-wrap.open {
          max-height: 500px;
          opacity: 1;
        }

        @keyframes fade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
