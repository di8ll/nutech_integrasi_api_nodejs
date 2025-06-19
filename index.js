const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const apiRoutes = require('./routes/api'); // ⬅️ Import router
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('🚀 Nutech API is running!');
});

app.use('/api', apiRoutes); // ⬅️ Pasang semua route-mu di /api

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
