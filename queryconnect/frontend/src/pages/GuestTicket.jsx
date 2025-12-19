import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function GuestTicket() {
  const [isDark, setIsDark] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "Academics",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const palette = {
    bg: isDark ? "#122330" : "#E5E5EA", // Deepest layer
    card: isDark ? "#1B3C53" : "#FFFFFF", // Floating layer
    text: isDark ? "#E3E3E3" : "#1B3C53",
    inputBg: isDark ? "rgba(0, 0, 0, 0.2)" : "#F2F2F7",
    accent: "#456882",
    btnPrimary: "#234C6A",
    appleBlue: "#007AFF",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/guest-tickets",
        formData
      );
      setTrackingId(res.data?.trackingId || "GUEST-ERROR");
      setSubmitted(true);
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
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
          * { font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif; box-sizing: border-box; transition: background 0.3s ease; }
          
          .compact-card {
            background: ${palette.card};
            width: 100%;
            max-width: 440px; /* More compact width */
            padding: 35px 40px;
            border-radius: 28px;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45);
            border: 1px solid ${
              isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
            };
            animation: slideUp 0.5s ease-out;
          }

          .apple-input {
            width: 100%;
            background: ${palette.inputBg};
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 12px 14px;
            color: ${palette.text};
            font-size: 14px;
            outline: none;
            transition: border 0.2s ease;
          }
          .apple-input:focus { border-color: ${
            palette.appleBlue
          }; background: ${isDark ? "#000" : "#FFF"}; }

          .btn-login {
            width: 100%;
            background: ${palette.btnPrimary};
            color: white;
            border: none;
            border-radius: 14px;
            padding: 14px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 8px;
            transition: all 0.2s ease;
          }
          .btn-login:hover { filter: brightness(1.2); transform: scale(0.99); }

          .toggle-btn {
            position: absolute;
            top: 30px;
            right: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            opacity: 0.7;
          }
          .switch {
            width: 40px;
            height: 22px;
            background: ${isDark ? palette.appleBlue : "#D1D1D6"};
            border-radius: 20px;
            position: relative;
          }
          .knob {
            width: 18px;
            height: 18px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: ${isDark ? "20px" : "2px"};
            transition: 0.2s;
          }

          @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      {/* THEME TOGGLE */}
      <div className="toggle-btn" onClick={() => setIsDark(!isDark)}>
        <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
        <div className="switch">
          <div className="knob" />
        </div>
      </div>

      <div className="compact-card">
        {!submitted ? (
          <>
            <h1 style={styles.logo}>QueryConnect</h1>
            <p style={styles.subtitle}>Welcome back!</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "25px" }}>
              <input
                className="apple-input"
                placeholder="Title"
                style={{ marginBottom: "12px" }}
                required
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <div style={{ position: "relative", marginBottom: "12px" }}>
                <textarea
                  className="apple-input"
                  style={{ height: "90px", resize: "none" }}
                  placeholder="Describe your query..."
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <span style={styles.showText}>Show</span>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "..." : "Login"}
              </button>
            </form>

            <div style={styles.footer}>
              <div style={styles.footerLink}>
                New here? <b style={{ color: palette.text }}>Register</b>
              </div>
              <div style={styles.footerLink} onClick={() => navigate("/")}>
                Or <b style={{ color: palette.text }}>Back to login</b>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.4,
                  marginTop: "12px",
                  cursor: "pointer",
                }}
              >
                Show test accounts
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={styles.successBadge}>✓</div>
            <h3 style={{ margin: "10px 0" }}>Query Sent</h3>
            <div style={styles.trackCode}>{trackingId}</div>
            <button className="btn-login" onClick={() => navigate("/track")}>
              Track Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  viewport: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    textAlign: "center",
    letterSpacing: "-0.8px",
  },
  subtitle: {
    fontSize: "14px",
    opacity: 0.5,
    textAlign: "center",
    marginTop: "4px",
  },
  showText: {
    position: "absolute",
    right: "15px",
    top: "12px",
    fontSize: "12px",
    fontWeight: "700",
    opacity: 0.6,
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  footerLink: { fontSize: "13px", opacity: 0.6, cursor: "pointer" },
  successBadge: {
    width: "50px",
    height: "50px",
    background: "#34C759",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    margin: "0 auto",
  },
  trackCode: {
    fontSize: "18px",
    fontWeight: "800",
    padding: "15px",
    background: "rgba(0,0,0,0.1)",
    borderRadius: "12px",
    margin: "15px 0",
    letterSpacing: "1px",
  },
};

export default GuestTicket;
