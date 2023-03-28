const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BlockTEA',
            version: '1.0.0',
        },
    },
    // Path to the API routes
    apis: ['./handlers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;