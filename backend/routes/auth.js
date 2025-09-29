const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


//copyright
//Jamak Gul Be Roger! The pirate king

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "Token error" });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: "Malformed token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err.message); 
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const conn = await pool.getConnection();
  try {
    const [exists] = await conn.query("SELECT id FROM user WHERE email=?", [email]);
    if (exists.length) return res.status(400).json({ message: "Email exists" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      "INSERT INTO users (email,name,password_hash) VALUES (?,?,?)",
      [email, name || "", hash]
    );

    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "Missing fields" });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT password_hash FROM users WHERE id=?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await conn.query("UPDATE users SET password_hash=? WHERE id=?", [hash, req.user.id]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
