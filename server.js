const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const supabase = require('./config/db.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Application Middleware Ingestion Matrix
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Link primary web interface presentation layer asset folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core Routing Multiplexer Configurations
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Global API Fallback Diagnostics Endpoint
app.get('/api/health', (req, res) => {
    return res.status(200).json({
        status: "online",
        timestamp: new Date().toISOString(),
        node_version: process.version
    });
});

// Absolute Fallback Catch-All Single Page Application (SPA) Router Handler
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// App Engine Initialization Loop
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` TS TECH PARK SYSTEM CORE ENGINE ONLINE ON NETWORK PORT: ${PORT} `);
    console.log(` Operational Context State: [${process.env.NODE_ENV || 'production'}] `);
    console.log(`================================================================`);
});
