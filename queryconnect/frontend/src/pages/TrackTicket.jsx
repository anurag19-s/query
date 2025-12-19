import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TrackTicket() {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true); // Added Theme State

  const navigate = useNavigate();

  const palette = {
    darkest: "#010101",
    deep: "#1C1C1E",
    accent: "#0071E3",
    light: "#F5F5F7",
    white: "#FFFFFF",
    gray: "#86868B",
  };

  const theme = {
    bg: isDark ? palette.darkest : palette.light,
    card: isDark ? "rgba(28, 28, 30, 0.7)" : "rgba(255, 255, 255, 0.8)",
    text: isDark ? palette.white : "#1D1D1F",
    subText: isDark ? palette.gray : "#6E6E73",
    border: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    input: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    blur: "25px",
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!ticketId.trim()) return setError("Please enter a ticket ID");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `http://localhost:5000/api/track/${ticketId.trim()}`,
        { headers }
      );
      setTicket(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Ticket not found or access denied"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, background: theme.bg }}>
      <style>{`
                * { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; }
                input:focus { border: 1px solid ${palette.accent} !important; background: transparent !important; }
                .glass { backdrop-filter: blur(${theme.blur}); -webkit-backdrop-filter: blur(${theme.blur}); }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: ${theme.border}; borderRadius: 10px; }
            `}</style>

      {/* THEME TOGGLE */}
      <div style={styles.themeTogglePos} onClick={() => setIsDark(!isDark)}>
        <div style={styles.toggleTrack(isDark)}>
          <div style={styles.toggleKnob(isDark)}>{isDark ? "🌙" : "☀️"}</div>
        </div>
      </div>

      <div
        className="glass"
        style={{
          ...styles.card,
          background: theme.card,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <h1 style={{ ...styles.title, color: theme.text }}>Track Ticket</h1>
        <p style={{ ...styles.subtitle, color: theme.subText }}>
          Enter ID to see live updates
        </p>

        <form onSubmit={handleSearch} style={styles.form}>
          <input
            style={{
              ...styles.input,
              background: theme.input,
              color: theme.text,
              borderColor: theme.border,
            }}
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
            placeholder="GUEST-ABC123..."
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {ticket && (
          <div className="custom-scroll" style={styles.ticketBox}>
            <div style={styles.headerRow}>
              <span style={styles.badge(ticket.status)}>{ticket.status}</span>
              <span style={{ fontSize: "11px", color: theme.subText }}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h2 style={styles.ticketTitle}>{ticket.title}</h2>

            <div style={styles.metaRow}>
              <span style={{ ...styles.metaItem, color: theme.subText }}>
                🏢 {ticket.department}
              </span>
              <span style={{ ...styles.metaItem, color: theme.subText }}>
                ⚡ {ticket.priority}
              </span>
            </div>

            <div style={{ ...styles.descBox, background: theme.input }}>
              <p style={{ fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                {ticket.description}
              </p>
            </div>

            {ticket.aiSuggestion && (
              <div style={styles.aiBox}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: palette.accent,
                    margin: "0 0 4px 0",
                  }}
                >
                  🤖 AI ANALYSIS
                </p>
                <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>
                  {ticket.aiSuggestion}
                </p>
              </div>
            )}

            {ticket.comments?.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  History
                </p>
                {ticket.comments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.comment,
                      borderLeft: `2px solid ${palette.accent}`,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "12px" }}>
                      {c.by}{" "}
                      <span style={{ fontWeight: 400, opacity: 0.6 }}>
                        ({c.role})
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "2px" }}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.navBtn, color: theme.subText }}
            onClick={() => navigate("/guest")}
          >
            ← Guest Page
          </button>
          <button
            style={{ ...styles.navBtn, color: theme.subText }}
            onClick={() => navigate("/")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  themeTogglePos: {
    position: "absolute",
    top: "30px",
    right: "30px",
    cursor: "pointer",
  },
  toggleTrack: (dark) => ({
    width: "48px",
    height: "26px",
    background: dark ? "#323234" : "#E5E5EA",
    borderRadius: "20px",
    padding: "2px",
  }),
  toggleKnob: (dark) => ({
    width: "22px",
    height: "22px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transform: dark ? "translateX(22px)" : "translateX(0px)",
  }),

  card: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "28px",
    border: "1px solid",
    padding: "32px 24px",
    boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    textAlign: "center",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    textAlign: "center",
    marginTop: "4px",
    marginBottom: "24px",
  },

  form: { display: "flex", gap: "8px", marginBottom: "16px" },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "0 20px",
    borderRadius: "14px",
    border: "none",
    background: "#0071E3",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },

  error: {
    background: "rgba(255, 69, 58, 0.1)",
    color: "#FF453A",
    padding: "10px",
    borderRadius: "12px",
    fontSize: "12px",
    textAlign: "center",
    marginBottom: "16px",
  },

  ticketBox: { maxHeight: "400px", overflowY: "auto", paddingRight: "4px" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  badge: (status) => ({
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "700",
    background: status === "Resolved" ? "#32D74B" : "#FF9F0A",
    color: "white",
  }),
  ticketTitle: { fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" },
  metaRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  metaItem: { fontSize: "12px", fontWeight: "500" },
  descBox: { padding: "12px", borderRadius: "14px", marginBottom: "12px" },
  aiBox: {
    padding: "12px",
    background: "rgba(0, 113, 227, 0.1)",
    borderRadius: "14px",
    borderLeft: "3px solid #0071E3",
  },
  comment: {
    padding: "8px 12px",
    margin: "8px 0",
    background: "rgba(134, 134, 139, 0.05)",
    borderRadius: "0 10px 10px 0",
  },

  buttonGroup: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  navBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default TrackTicket;
