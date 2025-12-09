const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const CONFIG_PATH = path.join(__dirname, 'config.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware
const PASSWORD = process.env.ADMIN_PASSWORD || 'Homburg-1';
console.log(`🔒 Admin Password set to: "${PASSWORD}"`);

const authMiddleware = (req, res, next) => {
    const providedPass = req.headers['x-access-password'];
    if (providedPass === PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Protect API routes
app.use('/api', authMiddleware);

// GET /api/config - Read configuration
app.get('/api/config', (req, res) => {
    fs.readFile(CONFIG_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return res.status(500).json({ error: 'Failed to read configuration' });
        }
        try {
            const config = JSON.parse(data);
            res.json(config);
        } catch (parseError) {
            console.error('Error parsing config file:', parseError);
            res.status(500).json({ error: 'Invalid configuration format' });
        }
    });
});

// POST /api/config - Update configuration
app.post('/api/config', (req, res) => {
    const newConfig = req.body;

    // Basic validation implies we just write what we get as per B4 instructions
    fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), (err) => {
        if (err) {
            console.error('Error writing config file:', err);
            return res.status(500).json({ error: 'Failed to save configuration' });
        }
        res.json({ message: 'Configuration saved successfully', config: newConfig });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
