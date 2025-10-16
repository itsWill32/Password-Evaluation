const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Validación de Contraseñas',
            version: '1.0.0',
            description: 'API para evaluar la fortaleza y seguridad de contraseñas. Calcula entropía, verifica contra un diccionario de 1 millón de contraseñas comunes, y estima el tiempo de crackeo.',
            contact: {
                name: 'William',
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        tags: [
            {
                name: 'Validación',
                description: 'Endpoints para validar contraseñas'
            }
        ]
    },
    apis: ['./server.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = {
    specs,
    swaggerUi
};