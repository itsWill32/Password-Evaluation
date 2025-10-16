const express = require('express');
const cors = require('cors');
const PasswordValidator = require('./passwordValidator');
const { specs, swaggerUi } = require('./swagger');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 👇 Agregar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Validación de Contraseñas"
}));

const validator = new PasswordValidator();

validator.loadDictionary()
    .then(() => {
        console.log('Servidor listo para validar contraseñas');
        console.log(`Documentación disponible en: http://localhost:${PORT}/api-docs`);
    })
    .catch(error => {
        console.error('Error al cargar el diccionario:', error);
        process.exit(1);
    });


 
app.get('/', (req, res) => {
    res.json({
        endpoints: {
            validate: 'POST /api/validate',
            documentation: 'GET /api-docs'
        }
    });
});

/**
 * @swagger
 * /api/validate:
 *   post:
 *     summary: Validar seguridad de una contraseña
 *     tags: [Validación]
 *     description: |
 *       Evalúa la fortaleza de una contraseña basándose en múltiples criterios:
 *       - Cálculo de entropía según el conjunto de caracteres usado
 *       - Verificación contra diccionario de 1 millón de contraseñas comunes
 *       - Estimación de tiempo de crackeo (asumiendo 10^11 intentos/segundo)
 *       - Categorización de fuerza (Muy Débil, Débil, Media, Fuerte, Muy Fuerte)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: La contraseña a evaluar
 *                 example: "MiContraseña123!"
 *           examples:
 *             contraseña_debil:
 *               summary: Contraseña débil (en diccionario)
 *               value:
 *                 password: "123456"
 *             contraseña_media:
 *               summary: Contraseña media
 *               value:
 *                 password: "Password123"
 *             contraseña_fuerte:
 *               summary: Contraseña fuerte
 *               value:
 *                 password: "MiC0ntr@señ@S3gur@2024!"
 *     responses:
 *       200:
 *         description: Análisis exitoso de la contraseña
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 password_length:
 *                   type: integer
 *                   description: Longitud de la contraseña
 *                   example: 16
 *                 entropy:
 *                   type: number
 *                   description: Entropía de la contraseña en bits
 *                   example: 95.27
 *                 in_dictionary:
 *                   type: boolean
 *                   description: Indica si la contraseña está en el diccionario de contraseñas comunes
 *                   example: false
 *                 strength:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [Muy Débil, Débil, Media, Fuerte, Muy Fuerte]
 *                       description: Categoría de fuerza de la contraseña
 *                       example: "Fuerte"
 *                     score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 5
 *                       description: Puntuación numérica de 0 a 5
 *                       example: 4
 *                     message:
 *                       type: string
 *                       description: Mensaje descriptivo (solo si está en diccionario)
 *                       example: "Esta contraseña está en el diccionario"
 *                 crack_time:
 *                   type: object
 *                   properties:
 *                     seconds:
 *                       type: number
 *                       description: Tiempo estimado en segundos (puede ser notación científica para valores grandes)
 *                       example: 1584.23
 *                     readable:
 *                       type: string
 *                       description: Tiempo estimado en formato legible
 *                       example: "26.40 minutos"
 *             examples:
 *               contraseña_en_diccionario:
 *                 summary: Contraseña común (en diccionario)
 *                 value:
 *                   password_length: 6
 *                   entropy: 31.00
 *                   in_dictionary: true
 *                   strength:
 *                     category: "Muy Débil"
 *                     score: 0
 *                     message: "Esta contraseña está en el diccionario"
 *                   crack_time:
 *                     seconds: 0.00001
 *                     readable: "Instantáneo (Esta en el diccionario)"
 *               contraseña_fuerte:
 *                 summary: Contraseña fuerte y segura
 *                 value:
 *                   password_length: 20
 *                   entropy: 130.00
 *                   in_dictionary: false
 *                   strength:
 *                     category: "Muy Fuerte"
 *                     score: 5
 *                   crack_time:
 *                     seconds: "1.54e+26"
 *                     readable: "Más de mil millones de años"
 *       400:
 *         description: Petición inválida - Falta el campo password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No puede estar vacío"
 */
app.post('/api/validate', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            error: 'No puede estar vacío'
        });
    }
    
    const result = validator.validate(password);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});