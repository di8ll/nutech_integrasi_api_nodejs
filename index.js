const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Routes
const apiRoutes = require('./routes/api');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('🚀 Nutech API is running!');
});

app.use('/api', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
