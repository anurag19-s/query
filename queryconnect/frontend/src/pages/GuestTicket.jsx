import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function GuestTicket() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Academics");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [trackingId, setTrackingId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("guest-theme") || "light"
  );

  /* ===========================
     GLOBAL THEME APPLY
  ============================ */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.margin = "0";
    document.body.style.background =
      theme === "dark"
        ? "radial-gradient(circle at top, #1e2230, #0b0d14)"
        : "linear-gradient(135deg,#eef2ff,#ffffff)";
    localStorage.setItem("guest-theme", theme);
  }, [theme]);

  /* ===========================
     SUBMIT HANDLER
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/guest-tickets", {
        title,
        description,
        department,
      });

      setTrackingId(res.data.trackingId);
      setSubmitted(true);
      setTitle("");
      setDescription("");
    } catch {
      setMessage("Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.page}>
      {/* Theme Toggle */}
      <button
        style={styles.themeToggle}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={styles.card}
          >
            <div style={styles.successIcon}>✓</div>

            <h1 style={styles.title}>Query Submitted</h1>
            <p style={styles.subtitle}>
              Save this tracking ID to track your request.
            </p>

            <div style={styles.trackingBox}>
              <input style={styles.trackingInput} value={trackingId} readOnly />
              <button style={styles.copyBtn} onClick={handleCopy}>
                Copy
              </button>
            </div>

            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/track", { state: { trackingId } })}
            >
              Track Query
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setSubmitted(false)}
            >
              Submit Another
            </button>

            <button style={styles.linkBtn} onClick={() => navigate("/")}>
              Back to Login
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={styles.card}
          >
            <h1 style={styles.title}>QueryConnect</h1>
            <p style={styles.subtitle}>Anonymous Guest Query</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <textarea
                style={{ ...styles.input, height: 90 }}
                placeholder="Describe your issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <select
                style={styles.input}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {[
                  "Academics",
                  "Hostel",
                  "Library",
                  "IT",
                  "Administration",
                  "Sports",
                  "Transport",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              {message && <div style={styles.error}>{message}</div>}

              <button style={styles.primaryBtn} disabled={loading}>
                {loading ? "Submitting…" : "Submit Query"}
              </button>
            </form>

            <div style={styles.trackRow}>
              <input
                style={styles.input}
                placeholder="Tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button
                style={styles.trackBtn}
                onClick={() => navigate("/track", { state: { trackingId } })}
              >
                Track
              </button>
            </div>

            <button style={styles.linkBtn} onClick={() => navigate("/")}>
              Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===========================
   STYLES
=========================== */
function getStyles(theme) {
  const dark = theme === "dark";

  return {
    page: {
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    },
    themeToggle: {
      position: "absolute",
      top: 20,
      right: 20,
      borderRadius: 999,
      padding: "8px 14px",
      border: "1px solid #e5e7eb",
      background: dark ? "#0b0d14" : "#ffffff",
      color: dark ? "#fff" : "#111",
      cursor: "pointer",
      fontSize: 13,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      background: dark ? "#0b0d14" : "#ffffff",
      borderRadius: 20,
      padding: 28,
      boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
      textAlign: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: dark ? "#ffffff" : "#111827",
    },
    subtitle: {
      fontSize: 14,
      color: dark ? "#9ca3af" : "#6b7280",
      marginBottom: 16,
    },
    form: { display: "flex", flexDirection: "column", gap: 12 },
    input: {
      padding: 12,
      borderRadius: 12,
      border: dark ? "1px solid #1f2933" : "1px solid #e5e7eb",
      background: dark ? "#020617" : "#f9fafb",
      color: dark ? "#ffffff" : "#111",
    },
    primaryBtn: {
      marginTop: 8,
      padding: 12,
      borderRadius: 999,
      border: "none",
      background: "#4f46e5",
      color: "#ffffff",
      fontWeight: 600,
      cursor: "pointer",
    },
    secondaryBtn: {
      marginTop: 8,
      padding: 12,
      borderRadius: 999,
      border: "none",
      background: dark ? "#1f2933" : "#e5e7eb",
      color: dark ? "#fff" : "#111",
      cursor: "pointer",
    },
    linkBtn: {
      marginTop: 12,
      background: "none",
      border: "none",
      color: "#6366f1",
      cursor: "pointer",
      fontSize: 14,
    },
    trackRow: {
      display: "flex",
      gap: 8,
      marginTop: 16,
    },
    trackBtn: {
      padding: "10px 16px",
      borderRadius: 12,
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      cursor: "pointer",
    },
    successIcon: {
      width: 60,
      height: 60,
      borderRadius: "50%",
      background: "#22c55e",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 28,
      margin: "0 auto 12px",
    },
    trackingBox: {
      display: "flex",
      gap: 8,
      marginTop: 16,
    },
    trackingInput: {
      flex: 1,
      padding: 12,
      borderRadius: 999,
      border: "1px solid #e5e7eb",
    },
    copyBtn: {
      padding: "10px 14px",
      borderRadius: 999,
      background: "#4f46e5",
      color: "#ffffff",
      border: "none",
      cursor: "pointer",
    },
    error: {
      background: "#fee2e2",
      color: "#b91c1c",
      padding: 8,
      borderRadius: 8,
      fontSize: 13,
    },
  };
}

export default GuestTicket;
