const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = 3456;
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

// ============ DATABASE SETUP (SQLite) ============
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Gagal membuka database:', err.message);
    } else {
        console.log('✅ Database SQLite terhubung.');
    }
});

// Buat tabel jika belum ada
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        pesan TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Seed admin default jika belum ada
    db.get(`SELECT id FROM admins WHERE username = 'lingkaransetan'`, (err, row) => {
        if (!row) {
            db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`,
                ['lingkaransetan', 'setan2026'],
                (err) => {
                    if (!err) console.log('✅ Admin default dibuat: lingkaransetan / setan2026');
                }
            );
        }
    });
});

// ============ PUBLIC API ROUTES ============

// GET semua pesan (terbaru dulu, max 50)
app.get('/api/messages', (req, res) => {
    db.all(`SELECT id, nama, pesan, created_at FROM messages ORDER BY created_at DESC LIMIT 50`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal memuat pesan.' });
        }
        res.json({ messages: rows });
    });
});

// POST pesan baru
app.post('/api/messages', (req, res) => {
    const { nama, pesan } = req.body;
    if (!nama || !pesan || nama.trim() === '' || pesan.trim() === '') {
        return res.status(400).json({ error: 'Nama dan pesan tidak boleh kosong.' });
    }
    db.run(`INSERT INTO messages (nama, pesan) VALUES (?, ?)`, [nama.trim(), pesan.trim()], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Gagal menyimpan pesan.' });
        }
        res.json({ success: true, id: this.lastID, message: 'Pesan berhasil dikirim!' });
    });
});

// ============ ADMIN API ROUTES ============

// POST login admin
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT id FROM admins WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err || !row) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }
        req.session.adminLoggedIn = true;
        req.session.adminUsername = username;
        res.json({ success: true, message: 'Login berhasil!' });
    });
});

// Middleware cek autentikasi admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.adminLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'Akses ditolak. Silakan login.' });
    }
}

// GET semua pesan (admin, tanpa batas)
app.get('/api/admin/messages', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM messages ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Gagal memuat data.' });
        res.json({ messages: rows });
    });
});

// DELETE pesan oleh admin
app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM messages WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Gagal menghapus pesan.' });
        res.json({ success: true, message: `Pesan #${id} berhasil dihapus.` });
    });
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
app.get('/login', (req, res) => res.sendFile(path.join(ROOT, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(ROOT, 'dashboard.html')));

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`\n🔥 LINGKARAN SETAN SERVER NYALA!`);
    console.log(`🌐 Buka di browser: http://localhost:${PORT}`);
    console.log(`🔐 Admin Login:     http://localhost:${PORT}/login`);
    console.log(`📊 Dashboard:       http://localhost:${PORT}/dashboard`);
    console.log(`\n🎯 API Endpoints:`);
    console.log(`   GET  /api/messages`);
    console.log(`   POST /api/messages`);
    console.log(`   POST /api/admin/login`);
    console.log(`   GET  /api/admin/messages`);
    console.log(`   DELETE /api/admin/messages/:id\n`);
});
