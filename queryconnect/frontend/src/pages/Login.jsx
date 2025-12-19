import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [showTests, setShowTests] = useState(false);
  const [dark, setDark] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegister ? "/api/register" : "/api/login";
      const payload = isRegister
        ? { email, password, name }
        : { email, password };
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (isRegister) {
        alert("Registration successful! Please login.");
        setIsRegister(false);
        setName("");
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);

        if (res.data.user.role === "student") navigate("/student");
        else if (res.data.user.role === "department") navigate("/department");
        else navigate("/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong"
      );
    }
  };

  const renderField = (
    label,
    value,
    setValue,
    type = "text",
    showToggle = false,
    index = 0
  ) => {
    const hasValue = value.length > 0;

    return (
      <motion.div
        style={{ marginBottom: 16, width: "100%" }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            style={{
              width: "100%",
              height: 42,
              padding: "5px 5px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
              background: dark ? "rgba(255,255,255,0.05)" : "#f2f2f5",
              boxShadow: dark
                ? "inset 0 1px 3px rgba(255,255,255,0.1)"
                : "inset 0 1px 3px rgba(0,0,0,0.05)",
              fontSize: 14,
              outline: "none",
              transition: "all 0.3s ease",
              textAlign: "center",
            }}
            onFocus={(e) =>
              (e.target.style.boxShadow = dark
                ? "0 0 0 2px rgba(27,60,83,0.5)"
                : "0 0 0 2px rgba(27,60,83,0.2)")
            }
            onBlur={(e) =>
              (e.target.style.boxShadow = dark
                ? "inset 0 1px 3px rgba(255,255,255,0.1)"
                : "inset 0 1px 3px rgba(0,0,0,0.05)")
            }
          />
          <label
            style={{
              position: "absolute",
              left: 16,
              top: hasValue ? -8 : "50%",
              fontSize: hasValue ? 12 : 14,
              color: hasValue ? "#1B3C53" : "#64748b",
              transform: hasValue ? "translateY(0)" : "translateY(-50%)",
              transition: "all 0.2s ease",
              background: dark ? "#020617" : "#ffffff",
              padding: "0 4px",
              pointerEvents: "none",
            }}
          >
            {label}
          </label>
          {showToggle && (
            <button
              type="button"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#1B3C53",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      style={{
        ...styles.page,
        background: dark ? "#0f172a" : "#E3E3E3",
      }}
    >
      <motion.div
        style={{
          ...styles.card,
          background: dark ? "#020617" : "#ffffff",
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: dark
            ? "0 20px 40px rgba(255,255,255,0.05)"
            : "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={styles.themeToggle} onClick={() => setDark(!dark)}>
          {dark ? "Light Mode" : "Dark Mode"}
        </div>

        <h1 style={{ ...styles.title, color: dark ? "#e5e7eb" : "#1B3C53" }}>
          QueryConnect
        </h1>

        <p style={{ ...styles.subtitle, color: dark ? "#94a3b8" : "#456882" }}>
          {isRegister ? "Create Account" : "Welcome back!"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister &&
            renderField("Full Name", name, setName, "text", false, 0)}
          {renderField("Email", email, setEmail, "email", false, 1)}
          {renderField(
            "Password",
            password,
            setPassword,
            showPassword ? "text" : "password",
            true,
            2
          )}

          {error && <div style={styles.error}>{error}</div>}

          <motion.button
            style={styles.button}
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isRegister ? "Register" : "Login"}
          </motion.button>
        </form>

        <p style={styles.text}>
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <span
            style={styles.link}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setName("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>

        <p style={styles.text}>
          Or{" "}
          <span style={styles.link} onClick={() => navigate("/guest")}>
            continue as guest
          </span>
        </p>

        <p style={styles.testToggle} onClick={() => setShowTests(!showTests)}>
          {showTests ? "Hide test accounts" : "Show test accounts"}
        </p>

        {showTests && (
          <motion.div
            style={styles.testBox}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p>Student: ankush.mahadole.mca25@mespune.in</p>
            <p>IT Dept: it@mespune.in</p>
            <p>Academics: academics@mespune.in</p>
            <p>Admin: admin@mespune.in</p>
            <p>Password: 123456</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'SF Pro', 'Segoe UI', sans-serif",
    position: "relative",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: "28px 24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    position: "relative",
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 18,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 999,
    border: "none",
    background: "#1B3C53",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(27,60,83,0.2)",
    transition: "all 0.2s ease",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 8,
    borderRadius: 10,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  text: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#456882",
  },
  link: {
    color: "#1B3C53",
    fontWeight: 600,
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  testToggle: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 11,
    color: "#1B3C53",
    cursor: "pointer",
  },
  testBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "#f9fafb",
    fontSize: 11,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  themeToggle: {
    position: "absolute",
    top: 12,
    right: 16,
    fontSize: 12,
    cursor: "pointer",
    color: "#64748b",
  },
};

export default Login;
