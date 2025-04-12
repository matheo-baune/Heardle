const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Guess IT',
            version: '1.0.0',
            description: 'API simplied using Spotify-API'
        }
    },
    apis: ['./*.js'] // Chemin vers les fichiers contenant les routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
