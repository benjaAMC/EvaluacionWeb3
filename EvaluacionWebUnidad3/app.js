const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de multer para el manejo de archivos
const upload = multer({ dest: 'imagenes/' });

// Conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_f1'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Conexión exitosa a la base de datos.');
});

// Middleware para parsear el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos de la carpeta 'imagenes'
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Ruta para servir el formulario HTML
app.use(express.static(path.join(__dirname, 'pagina_principal')));


// Ruta para iniciar sesión
app.post('/iniciar_sesion', (req, res) => {
    const { correo, contraseña } = req.body;
    const sql = 'SELECT rol FROM usuarios WHERE correo = ? AND contraseña = ?';
    connection.query(sql, [correo, contraseña], (err, result) => {
        if (err) {
            console.error('Error al iniciar sesión', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        if (result.length > 0) {
            const rol = result[0].rol;
            if (rol === 1) {
                res.redirect('/listarUsuarios.html');
            } else if (rol === 2) {
                res.redirect('/articulos.html');
            }
        } else {
            res.status(401).send('Correo o contraseña incorrectos');
        }
    });
});


app.post('/subir_imagenes', upload.single('imagen'), (req, res) => {
    const { nombre, descripcion } = req.body;
    const imagen = req.file.filename;
    const query = 'INSERT INTO imagenes (nombre, descripcion, imagen) VALUES (?, ?, ?)';
    connection.query(query, [nombre, descripcion, imagen], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});


app.get('/imagenes', (req, res) => {
    const query = 'SELECT nombre, descripcion, imagen FROM imagenes';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al obtener los datos de la base de datos.');
            return;
        }
        res.json(results);
    });
});




app.post('/guardar_usuario', (req, res) => {
    const { nombre, apellido, edad, fecha_nacimiento, direccion, contraseña, verificacionContraseña } = req.body;
    const sql = 'INSERT INTO clientes (NOMBRE, APELLIDO, EDAD, FECHA, DIRECCION, CLAVE, VALIDACIONCLAVE) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, apellido, edad, fecha_nacimiento, direccion, contraseña, verificacionContraseña], (err, result) => {
        if (err) throw err;
        console.log('Usuario insertado correctamente.');
        res.redirect('/');
    });
});

app.get('/usuarios', (req, res) => {
    const sql = 'SELECT IDCLIENTE, NOMBRE, APELLIDO, EDAD FROM clientes';
    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(rows);
    });
});

// Ruta para obtener los detalles de un usuario (tabla clientes)
app.get('/usuarios/:IDCLIENTE', (req, res) => {
    const { IDCLIENTE } = req.params;
    const sql = 'SELECT * FROM clientes WHERE IDCLIENTE = ?';
    connection.query(sql, [IDCLIENTE], (err, result) => {
        if (err) {
            console.error('Error al obtener los detalles del usuario:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Usuario no encontrado');
            return;
        }
        res.json(result[0]);
    });
});

// Ruta para eliminar un usuario (tabla clientes)
app.delete('/eliminar_usuario/:IDCLIENTE', (req, res) => {
    const { IDCLIENTE } = req.params;
    const sql = 'DELETE FROM clientes WHERE IDCLIENTE = ?';
    connection.query(sql, [IDCLIENTE], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        console.log('Usuario eliminado correctamente.');
        res.sendStatus(200);
    });
});

app.post('/modificar_usuario', (req, res) => {
    const { IDCLIENTE, nombre, apellido, edad, fecha_nacimiento, direccion, contraseña, verificacionContraseña } = req.body;
    const sql = 'UPDATE clientes SET NOMBRE = ?, APELLIDO = ?, EDAD = ?, FECHA = ?, DIRECCION = ?, CLAVE = ?, VALIDACIONCLAVE = ? WHERE IDCLIENTE = ?';
    connection.query(sql, [nombre, apellido, edad, fecha_nacimiento, direccion, contraseña, verificacionContraseña, IDCLIENTE], (err, result) => {
        if (err) {
            console.error('Error al modificar el usuario:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        console.log('Usuario modificado correctamente.');
        res.redirect('/listarUsuarios.html');
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
