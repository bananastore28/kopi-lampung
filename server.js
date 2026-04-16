const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3456;
const ROOT = path.join(__dirname);

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT));
app.use(session({
    secret: 'lingkaran-setan-2026-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 jam
}));

// ============ DATABASE SETUP (better-sqlite3) ============
const dataDir = path.join(__dirname, '.data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const dbPath = path.join(dataDir, 'database.db');

const db = new Database(dbPath);
console.log('✅ Database SQLite terhubung:', dbPath);

// Buat tabel jika belum ada
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        pesan TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);

// Seed admin default jika belum ada
const existingAdmin = db.prepare(`SELECT id FROM admins WHERE username = 'lingkaransetan'`).get();
if (!existingAdmin) {
    db.prepare(`INSERT INTO admins (username, password) VALUES (?, ?)`).run('lingkaransetan', 'setan2026');
    console.log('✅ Admin default dibuat: lingkaransetan / setan2026');
}

// ============ PUBLIC API ROUTES ============

// GET semua pesan (terbaru dulu, max 50)
app.get('/api/messages', (req, res) => {
    try {
        const rows = db.prepare(`SELECT id, nama, pesan, created_at FROM messages ORDER BY created_at DESC LIMIT 50`).all();
        res.json({ messages: rows });
    } catch (err) {
        res.status(500).json({ error: 'Gagal memuat pesan.' });
    }
});

// POST pesan baru
app.post('/api/messages', (req, res) => {
    const { nama, pesan } = req.body;
    if (!nama || !pesan || nama.trim() === '' || pesan.trim() === '') {
        return res.status(400).json({ error: 'Nama dan pesan tidak boleh kosong.' });
    }
    try {
        const result = db.prepare(`INSERT INTO messages (nama, pesan) VALUES (?, ?)`).run(nama.trim(), pesan.trim());
        res.json({ success: true, id: result.lastInsertRowid, message: 'Pesan berhasil dikirim!' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal menyimpan pesan.' });
    }
});

// ============ ADMIN API ROUTES ============

// Middleware cek autentikasi admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.adminLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'Akses ditolak. Silakan login.' });
    }
}

// POST login admin
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const row = db.prepare(`SELECT id FROM admins WHERE username = ? AND password = ?`).get(username, password);
        if (!row) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }
        req.session.adminLoggedIn = true;
        req.session.adminUsername = username;
        res.json({ success: true, message: 'Login berhasil!' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
});

// GET semua pesan (admin, tanpa batas)
app.get('/api/admin/messages', requireAdmin, (req, res) => {
    try {
        const rows = db.prepare(`SELECT * FROM messages ORDER BY created_at DESC`).all();
        res.json({ messages: rows });
    } catch (err) {
        res.status(500).json({ error: 'Gagal memuat data.' });
    }
});

// DELETE pesan oleh admin
app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    try {
        db.prepare(`DELETE FROM messages WHERE id = ?`).run(req.params.id);
        res.json({ success: true, message: `Pesan #${req.params.id} berhasil dihapus.` });
    } catch (err) {
        res.status(500).json({ error: 'Gagal menghapus pesan.' });
    }
});

// GET status admin (untuk cek sesi dari dashboard)
app.get('/api/admin/status', requireAdmin, (req, res) => {
    res.json({ loggedIn: true, username: req.session.adminUsername });
});

// POST logout admin
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ============ PAGE ROUTES ============
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/founders', (req, res) => res.sendFile(path.join(ROOT, 'founders.html')));
app.get('/experience', (req, res) => res.sendFile(path.join(ROOT, 'experience.html')));
app.get('/connect', (req, res) => res.sendFile(path.join(ROOT, 'connect.html')));
app.get('/login', (req, res) => res.sendFile(path.join(ROOT, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(ROOT, 'dashboard.html')));

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`\n🔥 LINGKARAN SETAN SERVER NYALA!`);
    console.log(`🌐 Buka di browser: http://localhost:${PORT}`);
    console.log(`🔐 Admin Login:     http://localhost:${PORT}/login`);
    console.log(`📊 Dashboard:       http://localhost:${PORT}/dashboard\n`);
});
