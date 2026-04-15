require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import all routes
const authRoutes = require('./routes/auth.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const alertRoutes = require('./routes/alerts.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ 
    origin: ["http://localhost:5173", "https://sgyawali990.github.io"],
    credentials: true 
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ ok: true, message: "InvQ API is live" }));

// Register Routes
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/alerts', alertRoutes);

module.exports = app;