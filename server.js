require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/courses', require('./routes/courses.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/forum', require('./routes/forum.routes'));
app.use('/api/live', require('./routes/live.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TS Tech Park API running on http://localhost:${PORT}`));
