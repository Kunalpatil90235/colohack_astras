import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

// 0. Auth Endpoint: Login/Signup by Email
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    try {
        // Simple magic link style login: find or create
        let user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (!user) {
            const info = db.prepare(`INSERT INTO users (email) VALUES (?)`).run(email);
            user = { id: info.lastInsertRowid, email };
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get All Entries (Scoped by user_id)
app.get('/api/entries', (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });
    
    try {
        const rows = db.prepare(`SELECT * FROM entries WHERE user_id = ? ORDER BY timestamp DESC`).all(user_id);
        const entries = rows.map(r => ({
            ...r,
            items: r.items_json ? JSON.parse(r.items_json) : [],
            expenses: r.expenses_json ? JSON.parse(r.expenses_json) : []
        }));
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Post New Entry (Scoped by user_id)
app.post('/api/entries', (req, res) => {
    const { user_id, rawText, totalEarnings, totalExpenses, items, expenses, timestamp } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const info = db.prepare(`
            INSERT INTO entries (user_id, rawText, totalEarnings, totalExpenses, items_json, expenses_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(user_id, rawText, totalEarnings, totalExpenses, JSON.stringify(items), JSON.stringify(expenses), timestamp);
        
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete Entry (Scoped by user_id)
app.delete('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        db.prepare(`DELETE FROM entries WHERE id = ? AND user_id = ?`).run(id, user_id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Stocks (Scoped by user_id)
app.get('/api/stocks', (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        // Ensure default items exist for this user if they don't have any
        const count = db.prepare(`SELECT COUNT(*) as count FROM inventory WHERE user_id = ?`).get(user_id).count;
        if (count === 0) {
            const defaults = [
                ['Samosa', 200, 'pcs'],
                ['Chai', 300, 'cups'],
                ['Vada Pav', 150, 'pcs']
            ];
            const insert = db.prepare(`INSERT INTO inventory (user_id, name, target_qty, unit) VALUES (?, ?, ?, ?)`);
            defaults.forEach(d => insert.run(user_id, ...d));
        }

        const stocks = db.prepare(`
            SELECT name, target_qty, current_qty, unit 
            FROM inventory 
            WHERE user_id = ?
            ORDER BY name ASC
        `).all(user_id);
        
        res.json(stocks.map(s => ({
            ...s,
            needed: Math.max(0, s.target_qty - s.current_qty)
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Vani Backend running on http://localhost:${PORT}`);
});
