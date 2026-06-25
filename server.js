const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Operations Layer Routing
const endpointsModule = require('./routes/api');
app.use('/api', endpointsModule);

app.listen(PORT, () => {
  console.log(`TS Tech Park Enterprise Cluster operating smoothly on port ${PORT}`);
});

module.exports = app;
