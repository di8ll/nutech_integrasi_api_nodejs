const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const apiRouter = require('./routes/api');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Load swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Konfigurasi tambahan untuk Swagger UI
const swaggerOptions = {
  explorer: true, // Memungkinkan pencarian endpoint
  customSiteTitle: "Nutech Integrasi API Documentation", // Judul custom
  customCss: '.swagger-ui .topbar { display: none }', // Menghilangkan topbar default
  customfavIcon: '/assets/favicon.ico', // Icon custom
  swaggerOptions: {
    docExpansion: 'list', // Dokumen awalnya collapsed (none/list/full)
    filter: true, // Menampilkan fitur filter
    persistAuthorization: true, // Menyimpan authorization saat refresh
    displayRequestDuration: true, // Menampilkan durasi request
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRouter);

// Serve static files untuk favicon (opsional)
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Swagger UI dengan konfigurasi
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument, swaggerOptions, {
    // Opsi tambahan untuk UI
    customSiteTitle: swaggerOptions.customSiteTitle,
    customfavIcon: swaggerOptions.customfavIcon
  })
);

// Route khusus untuk mendapatkan file swagger.json (opsional)
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;