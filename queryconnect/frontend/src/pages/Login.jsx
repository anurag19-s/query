import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/register" : "/api/login";
      const payload = isRegister
        ? { email, password, name }
        : { email, password };

      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (isRegister) {
        setIsRegister(false);
        setName("");
      } else {
        setSuccess(true);

        setTimeout(() => {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);

          if (res.data.user.role === "student") navigate("/student");
          else if (res.data.user.role === "department") navigate("/department");
          else navigate("/admin");
        }, 700);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={styles.glow}
      />

      <AnimatePresence mode="wait">
        {!success && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={styles.card}
          >
            <h1 style={styles.title}>QueryConnect</h1>
            <p style={styles.subtitle}>
              {isRegister ? "Create your account" : "Welcome back"}
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <AnimatePresence>
                {isRegister && (
                  <motion.input
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={styles.input}
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
              </AnimatePresence>

              <input
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />

              <input
                style={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <div style={styles.error}>{error}</div>}

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                disabled={loading}
                type="submit"
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </motion.button>
            </form>

            <div style={styles.switch}>
              <span
                tabIndex={0}
                onClick={() => setIsRegister(!isRegister)}
                onKeyDown={(e) =>
                  e.key === "Enter" && setIsRegister(!isRegister)
                }
              >
                {isRegister ? "Already have an account?" : "Create account"}
              </span>

              <span
                tabIndex={0}
                onClick={() => navigate("/guest")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/guest")}
              >
                Continue as guest
              </span>
            </div>

            <div
              style={styles.testToggle}
              tabIndex={0}
              onClick={() => setShowTests(!showTests)}
              onKeyDown={(e) => e.key === "Enter" && setShowTests(!showTests)}
            >
              {showTests ? "Hide test accounts" : "Show test accounts"}
            </div>

            <AnimatePresence>
              {showTests && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={styles.infoBox}
                >
                  <p>Student: ankush.mahadole.mca25@mespune.in</p>
                  <p>IT Dept: it@mespune.in</p>
                  <p>Admin: admin@mespune.in</p>
                  <p style={{ opacity: 0.6 }}>Password: 123456</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={styles.success}
          >
            Signing you in…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at top, #2b2f3a, #0b0d12)",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: "520px",
    height: "520px",
    background: "radial-gradient(circle, rgba(124,58,237,0.35), transparent)",
    filter: "blur(90px)",
  },

  card: {
    width: "380px",
    padding: "30px",
    borderRadius: "22px",
    background: "rgba(18,20,28,0.92)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
    zIndex: 2,
  },

  title: {
    textAlign: "center",
    color: "#c4b5fd",
    fontSize: "28px",
    fontWeight: 700,
    margin: 0,
  },

  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
    marginBottom: "22px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    background: "#0f1117",
    border: "1px solid #1f2430",
    color: "#e5e7eb",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    marginTop: "6px",
    padding: "12px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  error: {
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "12px",
  },

  switch: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#a78bfa",
    cursor: "pointer",
  },

  testToggle: {
    marginTop: "16px",
    fontSize: "12px",
    textAlign: "center",
    color: "#9ca3af",
    cursor: "pointer",
  },

  infoBox: {
    marginTop: "12px",
    padding: "10px",
    borderRadius: "10px",
    background: "#0f1117",
    fontSize: "12px",
    color: "#9ca3af",
  },

  success: {
    color: "#c4b5fd",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default Login;
