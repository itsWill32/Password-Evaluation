const express = require('express');
const cors = require('cors');
const PasswordValidator = require('./passwordValidator');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const validator = new PasswordValidator();

validator.loadDictionary()
    .then(() => {
        console.log('Servidor listo para validar contraseñas');
    })
    .catch(error => {
        console.error('Error al cargar el diccionario:', error);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.json({
        endpoints: {
            validate: 'POST /api/validate'
        }
    });
});

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