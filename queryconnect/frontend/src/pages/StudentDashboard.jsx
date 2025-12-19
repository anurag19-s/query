import React, { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard({ user, onLogout }) {
  const [isDark, setIsDark] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Academics");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Round";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    fetchTickets();
    fetchNotifications();
  }, []);

  // UPDATED PALETTE: Increased contrast between BG and Card
  const palette = {
    bg: isDark ? "#080C14" : "#E2E8F0", // Deeper dark/Slightly grayer light
    card: isDark ? "#1B2535" : "#FFFFFF", // Lighter cards for "floating" effect
    text: isDark ? "#F1F5F9" : "#0F172A",
    subtext: isDark ? "#94A3B8" : "#64748B",
    accent: "#3B82F6",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getAISuggestion = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/ai-suggest",
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiSuggestion(res.data.suggestion);
      setDepartment(res.data.department);
    } catch (e) {
      setAiSuggestion("Suggestion unavailable.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/tickets",
        { title, description, department, aiSuggestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setTitle("");
      setDescription("");
      setAiSuggestion("");
      fetchTickets();
    } catch (e) {
      alert("Error");
    }
  };

  return (
    <div
      style={{
        ...styles.viewport,
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: "Plus Jakarta Sans", sans-serif; box-sizing: border-box; }
          
          .main-scroll::-webkit-scrollbar { width: 6px; }
          .main-scroll::-webkit-scrollbar-thumb { background: ${palette.border}; border-radius: 10px; }

          .hover-card { 
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            border: 1px solid ${palette.border};
          }
          .hover-card:hover { 
            transform: translateY(-6px); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border-color: ${palette.accent}66;
          }

          @keyframes reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stagger-reveal { animation: reveal 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

          .logout-text {
            background: none;
            border: none;
            color: #EF4444;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            padding: 8px 16px;
            border-radius: 8px;
            transition: 0.2s;
            letter-spacing: 0.5px;
          }
          .logout-text:hover { background: rgba(239, 68, 68, 0.1); }

          .mi-icon { font-family: 'Material Icons Round'; font-weight: normal; font-style: normal; font-size: 22px; line-height: 1; }
          .active-dot { width: 8px; height: 8px; background: #34C759; border-radius: 50%; box-shadow: 0 0 10px #34C759; }
        `}
      </style>

      {/* NAVBAR */}
      <nav style={styles.navbar(palette)}>
        <div style={styles.navContent}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="active-dot" />
            <div
              style={{
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "-0.5px",
              }}
            >
              Query <span style={{ color: palette.accent }}>Connect</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div
              onClick={() => setIsDark(!isDark)}
              style={{
                ...styles.toggle,
                background: isDark ? palette.accent : "#CBD5E1",
              }}
            >
              <div style={{ ...styles.knob, left: isDark ? "22px" : "2px" }}>
                <span
                  className="mi-icon"
                  style={{
                    fontSize: "12px",
                    color: isDark ? palette.accent : "#64748B",
                  }}
                >
                  {isDark ? "dark_mode" : "light_mode"}
                </span>
              </div>
            </div>
            <button onClick={onLogout} className="logout-text">
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <main className="main-scroll" style={styles.mainScroll}>
        <div style={styles.contentContainer}>
          {/* STATS */}
          <div style={styles.statsRibbon}>
            {[
              {
                label: "QUERIES",
                val: tickets.length,
                icon: "layers",
                color: palette.accent,
              },
              {
                label: "PENDING",
                val: tickets.filter((t) => t.status !== "Resolved").length,
                icon: "hourglass_empty",
                color: "#F59E0B",
              },
              {
                label: "RESOLVED",
                val: tickets.filter((t) => t.status === "Resolved").length,
                icon: "check_circle",
                color: "#10B981",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="hover-card stagger-reveal"
                style={{
                  ...styles.statCard,
                  animationDelay: `${i * 0.1}s`,
                  background: palette.card,
                }}
              >
                <div
                  style={{
                    ...styles.iconBox,
                    background: s.color + "15",
                    color: s.color,
                  }}
                >
                  <span className="mi-icon">{s.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 800 }}>
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: palette.subtext,
                      fontWeight: 700,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.dashboardGrid}>
            <section style={{ flex: 2 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
                  My Requests
                </h3>
                <button
                  style={{ ...styles.btnPrimary, background: palette.accent }}
                  onClick={() => setShowForm(!showForm)}
                >
                  <span className="mi-icon" style={{ fontSize: "18px" }}>
                    {showForm ? "close" : "add"}
                  </span>
                  {showForm ? "Cancel" : "New Request"}
                </button>
              </div>

              {/* FORM */}
              {showForm && (
                <div
                  className="stagger-reveal"
                  style={{ ...styles.formCard, background: palette.card }}
                >
                  <form onSubmit={handleSubmit}>
                    <input
                      className="apple-input"
                      style={styles.input(palette)}
                      placeholder="Subject"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <textarea
                      className="apple-input"
                      style={{ ...styles.input(palette), height: "100px" }}
                      placeholder="Detail your query..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    {aiSuggestion && (
                      <div style={styles.aiResult}>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: palette.accent,
                            marginBottom: "4px",
                          }}
                        >
                          AI INSIGHT
                        </div>
                        <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                          {aiSuggestion}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "12px" }}>
                      <select
                        style={styles.input(palette)}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={getAISuggestion}
                        style={styles.aiButton(palette)}
                        disabled={loading}
                      >
                        {loading ? (
                          "..."
                        ) : (
                          <span className="mi-icon">auto_awesome</span>
                        )}
                      </button>
                    </div>
                    <button
                      type="submit"
                      style={{
                        ...styles.submitBtn,
                        background: palette.accent,
                      }}
                    >
                      Submit to Department
                    </button>
                  </form>
                </div>
              )}

              {/* TICKET LIST */}
              <div style={{ display: "grid", gap: "16px" }}>
                {tickets.map((t, i) => (
                  <div
                    key={t._id}
                    className="hover-card stagger-reveal"
                    style={{
                      ...styles.ticketCard,
                      background: palette.card,
                      animationDelay: `${(i + 3) * 0.08}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          ...styles.badge,
                          background: palette.accent + "15",
                          color: palette.accent,
                        }}
                      >
                        {t.department}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color:
                            t.status === "Resolved" ? "#10B981" : "#F59E0B",
                          textTransform: "uppercase",
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {t.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: palette.subtext,
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SIDEBAR */}
            <aside style={{ flex: 1 }}>
              <div
                className="stagger-reveal"
                style={{
                  ...styles.sidebar,
                  background: palette.card,
                  animationDelay: "0.4s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <span className="mi-icon" style={{ color: palette.accent }}>
                    campaign
                  </span>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                    Notice Board
                  </h4>
                </div>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {n.title}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: palette.subtext,
                        margin: 0,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  viewport: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  navbar: (p) => ({
    height: "70px",
    display: "flex",
    justifyContent: "center",
    borderBottom: `1px solid ${p.border}`,
    background: p.bg,
    zIndex: 10,
  }),
  navContent: {
    width: "100%",
    maxWidth: "1100px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
  },
  mainScroll: { flex: 1, overflowY: "auto", padding: "40px 20px" },
  contentContainer: { maxWidth: "1100px", margin: "0 auto", width: "100%" },
  statsRibbon: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    padding: "20px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardGrid: { display: "flex", gap: "30px", alignItems: "flex-start" },
  btnPrimary: {
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  formCard: { padding: "24px", borderRadius: "24px", marginBottom: "30px" },
  input: (p) => ({
    width: "100%",
    background: p.bg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "14px",
    color: p.text,
    marginBottom: "12px",
    outline: "none",
  }),
  aiButton: (p) => ({
    background: p.bg,
    border: `1px solid ${p.border}`,
    color: p.accent,
    borderRadius: "12px",
    width: "60px",
    height: "48px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  submitBtn: {
    width: "100%",
    border: "none",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "10px",
  },
  aiResult: {
    background: "rgba(59,130,246,0.1)",
    padding: "16px",
    borderRadius: "12px",
    borderLeft: "4px solid #3B82F6",
    marginBottom: "15px",
  },
  ticketCard: { padding: "24px", borderRadius: "24px" },
  badge: {
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  sidebar: {
    padding: "24px",
    borderRadius: "24px",
    position: "sticky",
    top: "0",
  },
  toggle: {
    width: "44px",
    height: "24px",
    borderRadius: "20px",
    position: "relative",
    cursor: "pointer",
    transition: "0.3s",
  },
  knob: {
    width: "20px",
    height: "20px",
    background: "white",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default StudentDashboard;
