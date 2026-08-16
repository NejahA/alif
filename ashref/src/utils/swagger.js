const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ashref API',
      version: '1.0.0',
      description: 'A complete backend API with authentication, file uploads, and more',
      contact: {
        name: 'ashref Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: process.env.PROD_URL || 'https://api.ashref.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.',
        },
      },
    },
  },
  apis: [
    './src/routes/authRoutes.js',
    './src/routes/uploadRoutes.js',
    './src/index.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, { explorer: true }));

module.exports = router;
