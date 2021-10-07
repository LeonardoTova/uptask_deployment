const  express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//Extraer valores de variables.env
require('dotenv').config({ path: 'variables.env'});

//Helpers con algunas funciones
const helpers = require('./helpers');

//Crear la conexión a la BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(() => console.log('La conexión a la base de datos fue exitosa'))
    .catch(error => console.log(error));
     
//crear una aplicacion de Express
const app = express();

//Dondecargar los archivos estaticos
app.use(express.static('public'));

// Habilitar PUG
app.set('view engine', 'pug');

//Habilitar bodyParser para leer datos del formulario
app.use(bodyParser.urlencoded({extended: true}));

// Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

//Agregar flash messages
app.use(flash());

app.use(cookieParser());

//Sesiones
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar vardump a la aplicación
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});

app.use('/', routes());

//nodo para inicializar el servidor


require('./handlers/email');

//Servidor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port , host, () => {
    console.log('El servidor está funcionando.');
});