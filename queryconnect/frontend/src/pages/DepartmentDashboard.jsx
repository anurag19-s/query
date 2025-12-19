import React, { useState, useEffect } from "react";
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
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isDark, setIsDark] = useState(true);

  // NEW: State for toggling security key visibility
  const [showKeys, setShowKeys] = useState(false);

  // The security keys used by Department Dashboards
  const departmentKeys = {
    IT: "IT-2025",
    Hostel: "HOSTEL-2025",
    Academics: "ACAD-2025",
    Library: "LIB-2025",
    Sports: "SPORTS-2025",
    Administration: "ADMIN-2025",
    Transport: "TRANS-2025",
  };

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
    fetchTickets();
    fetchAnalytics();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const filteredTickets =
    filterDept === "All"
      ? tickets
      : tickets.filter((t) => t.department === filterDept);

  const palette = {
    darkest: "#1B3C53",
    deep: "#234C6A",
    muted: "#456882",
    light: "#E3E3E3",
    white: "#FFFFFF",
  };

  const theme = {
    bg: isDark ? palette.darkest : palette.light,
    card: isDark ? palette.deep : palette.white,
    text: isDark ? palette.light : palette.darkest,
    subText: isDark ? "#A0B3C1" : palette.muted,
    border: isDark ? "rgba(227, 227, 227, 0.1)" : "rgba(27, 60, 83, 0.1)",
    input: isDark ? palette.darkest : "#F0F0F0",
  };

  return (
    <div style={{ ...styles.container, background: theme.bg }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; box-sizing: border-box; transition: all 0.3s ease; }
          body { margin: 0; padding: 0; overflow-x: hidden; }
          .hover-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
          @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr !important; } }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: ${theme.bg}; }
          ::-webkit-scrollbar-thumb { background: ${palette.muted}; border-radius: 10px; }
        `}
      </style>

      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div>
            <h1
              style={{
                ...styles.logo,
                color: isDark ? palette.white : palette.darkest,
              }}
            >
              QueryConnect
            </h1>
            <p style={{ color: theme.subText, margin: 0, fontSize: "12px" }}>
              Admin Control Center
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.toggleTrack} onClick={() => setIsDark(!isDark)}>
              <div
                style={{
                  ...styles.toggleKnob,
                  transform: isDark ? "translateX(24px)" : "translateX(0px)",
                  background: palette.light,
                }}
              >
                {isDark ? "🌙" : "☀️"}
              </div>
            </div>
            <div style={styles.adminBox}>
              <span style={{ color: theme.text, fontWeight: "700" }}>
                {user.name}
              </span>
              <button onClick={onLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div style={styles.statsRow}>
          {[
            { label: "Total Tickets", value: analytics.total },
            { label: "Pending", value: analytics.pending },
            { label: "In Progress", value: analytics.inProgress },
            { label: "Resolved", value: analytics.resolved },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.statCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
              className="hover-card"
            >
              <p
                style={{
                  color: theme.subText,
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </p>
              <h2
                style={{
                  color: isDark ? palette.white : palette.deep,
                  fontSize: "32px",
                  margin: 0,
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        <div style={styles.grid} className="main-grid">
          <aside style={styles.sidebar}>
            {/* Broadcast Card */}
            <div
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <h3
                style={{
                  color: theme.text,
                  fontSize: "16px",
                  marginBottom: "15px",
                }}
              >
                Broadcast
              </h3>
              <input
                style={{
                  ...styles.input,
                  background: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                }}
                placeholder="Notice Title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
              />
              <textarea
                style={{
                  ...styles.textarea,
                  background: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                }}
                placeholder="Write message..."
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
              />
              <button
                style={{ ...styles.primaryBtn, background: palette.muted }}
              >
                Send Notice
              </button>
            </div>

            {/* NEW: Security Keys Card */}
            <div
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ color: theme.text, fontSize: "16px", margin: 0 }}>
                  Dept Keys
                </h3>
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  style={{
                    background: "none",
                    border: "none",
                    color: palette.muted,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {showKeys ? "🙈 Hide" : "👁️ Show"}
                </button>
              </div>
              <div
                style={{ maxHeight: "150px", overflowY: "auto" }}
                className="custom-scroll"
              >
                {Object.entries(departmentKeys).map(([dept, key]) => (
                  <div
                    key={dept}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <span style={{ fontSize: "12px", color: theme.subText }}>
                      {dept}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: theme.text,
                        fontWeight: "600",
                        filter: showKeys ? "none" : "blur(4px)",
                      }}
                    >
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                marginTop: "20px",
              }}
            >
              <h3
                style={{
                  color: theme.text,
                  fontSize: "16px",
                  marginBottom: "15px",
                }}
              >
                Filter by Dept
              </h3>
              <select
                style={{
                  ...styles.input,
                  background: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                }}
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <main
            style={{
              ...styles.mainContent,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.feedHeader}>
              <h2 style={{ color: theme.text, margin: 0 }}>Ticket Feed</h2>
              <button
                onClick={fetchTickets}
                style={{
                  color: palette.muted,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sync Feed
              </button>
            </div>

            <div style={styles.scrollArea}>
              {filteredTickets.length === 0 ? (
                <div
                  style={{
                    color: theme.subText,
                    textAlign: "center",
                    padding: "50px",
                  }}
                >
                  No tickets found.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    style={{
                      ...styles.ticket,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={styles.ticketTop}>
                      <span
                        style={{
                          ...styles.badge,
                          background: palette.darkest,
                          color: palette.light,
                        }}
                      >
                        {ticket.department}
                      </span>
                      <span
                        style={{
                          color:
                            ticket.status === "Resolved"
                              ? "#81C784"
                              : "#FFB74D",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <h4 style={{ color: theme.text, margin: "10px 0 5px 0" }}>
                      {ticket.title}
                    </h4>
                    <p
                      style={{
                        color: theme.subText,
                        fontSize: "14px",
                        margin: "0 0 10px 0",
                      }}
                    >
                      {ticket.description}
                    </p>
                    <div style={{ color: theme.subText, fontSize: "12px" }}>
                      {ticket.studentName} •{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    padding: "30px",
    boxSizing: "border-box",
  },
  wrapper: { width: "100%", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "30px" },
  logo: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-1px",
  },
  toggleTrack: {
    width: "52px",
    height: "28px",
    background: "#1B3C53",
    borderRadius: "20px",
    padding: "2px",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  toggleKnob: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  adminBox: { display: "flex", alignItems: "center", gap: "15px" },
  logoutBtn: {
    background: "#E57373",
    color: "white",
    border: "none",
    padding: "6px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: { padding: "25px", borderRadius: "15px" },
  grid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: "25px" },
  sidebar: { display: "flex", flexDirection: "column" },
  card: { padding: "25px", borderRadius: "15px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid",
    marginBottom: "10px",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid",
    marginBottom: "15px",
    height: "100px",
    resize: "none",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  mainContent: {
    padding: "30px",
    borderRadius: "20px",
    height: "calc(100vh - 300px)",
    display: "flex",
    flexDirection: "column",
  },
  feedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  scrollArea: { flex: 1, overflowY: "auto", paddingRight: "15px" },
  ticket: { padding: "20px 0" },
  ticketTop: { display: "flex", justifyContent: "space-between" },
  badge: {
    padding: "3px 10px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
