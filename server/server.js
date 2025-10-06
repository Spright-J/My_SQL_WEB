import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import cors from 'cors';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 443;
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));


// Ensure ./database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dbDir);
    },
    filename: function (req, file, cb) {
        // Use original file name
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());

// 1. Upload a database file and return its table names
app.post('/v1/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const dbPath = path.join(dbDir, req.file.filename);

    // Open the uploaded SQLite database
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to open database file.' });
        }
    });

    db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
        [],
        (err, rows) => {
            db.close();
            if (err) {
                return res.status(500).json({ error: 'Failed to read tables from database.' });
            }
            const tableNames = rows.map(row => row.name);
            res.json({ fileName: req.file.filename, tables: tableNames });
        }
    );
});

// 2. Run SQL statements on a given database file
app.post('/v1/api/query', (req, res) => {
    const { fileName, table } = req.body;
    if (!fileName || !table) {
        return res.status(400).json({ error: 'fileName and table are required.' });
    }
    const dbPath = path.join(dbDir, fileName);

    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ error: 'Database file not found.' });
    }

    // Basic table name validation: only allow alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        return res.status(400).json({ error: 'Invalid table name.' });
    }

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to open database file.' });
        }
    });

    const sql = `SELECT * FROM "${table}"`;

    db.all(sql, [], (err, rows) => {
        db.close();
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ result: rows });
    });
});

app.post('/v1/api/customQuery', (req, res) => {
    const { fileName, query } = req.body;
    if (!fileName || !query) {
        return res.status(400).json({ error: 'fileName and query are required.' });
    }
    const dbPath = path.join(dbDir, fileName);

    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ error: 'Database file not found.' });
    }

    // Basic query validation: only allow SELECT statements for safety
    const trimmedQuery = query.trim();
    if (!/^select\s+/i.test(trimmedQuery)) {
        return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
    }

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to open database file.' });
        }
    });

    db.all(trimmedQuery, [], (err, rows) => {
        db.close();
        if (err || !rows || rows.length === 0) {
            return res.status(400).json({ error: 'Query failed or returned no results.' });
        }
        res.json({ result: rows });
    });
});

app.get('/v1/api/existingFiles', (req, res) => {
    const existingDir = path.join(__dirname, 'database', 'existing');
    fs.readdir(existingDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read existing files directory.' });
        }
        // Optionally filter only files (not directories)
        const fileList = files.filter(file => {
            const filePath = path.join(existingDir, file);
            return fs.statSync(filePath).isFile();
        });
        res.json({ files: fileList });
    });
});


app.get('/v1/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'API server is running.' });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../public')));

// Handle React routing, return all requests to React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// SSL Certificate paths
const SSL_KEY_PATH = path.join(__dirname, '../ssl/server.key');
const SSL_CERT_PATH = path.join(__dirname, '../ssl/server.crt');

// Check if SSL certificates exist
const sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
};

// Start the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
});