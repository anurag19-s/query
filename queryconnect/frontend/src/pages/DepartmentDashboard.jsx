// FULL REPLACEMENT FILE – LOGIC UNCHANGED, FINAL UI/UX POLISH
// Requires: npm install framer-motion

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function DepartmentDashboard({ user, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isVerified, setIsVerified] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const DEPARTMENT_CODES = {
    IT: "IT-DEPT-2025",
    Hostel: "HOSTEL-DEPT-2025",
    Academics: "ACADEMICS-DEPT-2025",
    Library: "LIBRARY-DEPT-2025",
    Sports: "SPORTS-DEPT-2025",
    Administration: "ADMIN-DEPT-2025",
    Transport: "TRANSPORT-DEPT-2025",
  };

  const handleVerification = () => {
    if (!selectedDepartment || !securityCode) {
      setVerificationError("Please select department and enter code");
      return;
    }

    if (DEPARTMENT_CODES[selectedDepartment] === securityCode.trim()) {
      setVerificationError("");
      setIsVerified(true);
      fetchTickets(selectedDepartment);
    } else {
      setVerificationError("Invalid security code");
    }
  };

  const fetchTickets = async (dept) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/api/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTickets(res.data.filter((t) => t.department === dept));
    setLoading(false);
  };

  /* ================= VERIFICATION SCREEN ================= */

  if (!isVerified) {
    return (
      <div className="verifyPage">
        <motion.div
          className="verifyCard"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1>Department Access</h1>
          <p className="muted">{user.name}</p>

          {verificationError && (
            <motion.div
              className="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {verificationError}
            </motion.div>
          )}

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Select department</option>
            {Object.keys(DEPARTMENT_CODES).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <input
            placeholder="Security code"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerification()}
          />

          <button onClick={handleVerification}>Verify Access</button>
        </motion.div>

        {/* CSS */}
        <Style />
      </div>
    );
  }

  /* ================= DASHBOARD ================= */

  return (
    <div className="dashPage">
      <header className="dashHeader">
        <div>
          <h2>{selectedDepartment}</h2>
          <span className="muted">Department Dashboard</span>
        </div>

        <div className="actions">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button className="danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {loading && <div className="loader" />}

      <section className="tickets">
        <AnimatePresence>
          {tickets.map((t) => (
            <motion.div
              key={t._id}
              className="ticketCard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3>{t.title}</h3>
              <p className="desc">{t.description}</p>
              <span className="status">{t.status}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && tickets.length === 0 && (
          <p className="muted">No tickets assigned</p>
        )}
      </section>

      <Style />
    </div>
  );
}

/* ================= STYLES ================= */

function Style() {
  return (
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

      [data-theme='dark'] {
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

      body {
        margin: 0;
      }

      /* Verification */
      .verifyPage {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--bg);
        color: var(--text);
      }

      .verifyCard {
        width: 360px;
        background: var(--card);
        padding: 28px;
        border-radius: 18px;
        box-shadow: 0 30px 60px rgba(0,0,0,.18);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      h1 {
        margin: 0;
        font-size: 22px;
      }

      select, input {
        padding: 11px 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text);
      }

      button {
        padding: 11px;
        border-radius: 999px;
        border: none;
        background: var(--primary);
        color: white;
        font-weight: 600;
        cursor: pointer;
      }

      .error {
        background: #fee2e2;
        color: #b91c1c;
        padding: 8px;
        border-radius: 10px;
        font-size: 13px;
      }

      /* Dashboard */
      .dashPage {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        padding: 24px;
      }

      .dashHeader {
        max-width: 1100px;
        margin: 0 auto 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .actions {
        display: flex;
        gap: 10px;
      }

      .actions button {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text);
      }

      .danger {
        color: var(--danger);
        border-color: rgba(239,68,68,.4);
      }

      .tickets {
        max-width: 1100px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
      }

      .ticketCard {
        background: var(--card);
        padding: 18px;
        border-radius: 18px;
        box-shadow: 0 14px 36px rgba(0,0,0,.15);
      }

      .ticketCard h3 {
        margin: 0;
        font-size: 16px;
      }

      .desc {
        font-size: 14px;
        line-height: 1.5;
        margin: 8px 0;
      }

      .status {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        background: rgba(99,102,241,.15);
        color: var(--primary);
      }

      .muted {
        color: var(--muted);
        font-size: 13px;
      }

      .loader {
        height: 3px;
        background: linear-gradient(90deg, var(--primary), transparent);
        animation: load 1s infinite;
        max-width: 1100px;
        margin: 0 auto 16px;
      }

      @keyframes load {
        from { width: 0; }
        to { width: 100%; }
      }
    `}</style>
  );
}

export default DepartmentDashboard;
