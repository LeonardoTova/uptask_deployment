const express = require('express');
const router = express.Router();

//Importar express validator
const { body } = require('express-validator/check');

//Importar el controlador
const proyectosController = require('../controllers/proyectosController');
const tareasController = require('../controllers/tareasController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = function() {
    //ruta para el home
    router.get('/', 
        authController.usuarioAutenticado,
        proyectosController.proyectosHome
    );
    router.get('/nuevo-proyecto', 
        authController.usuarioAutenticado,
        proyectosController.formularioProyecto    
    );
    router.post('/nuevo-proyecto/',
        authController.usuarioAutenticado, 
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.nuevoProyecto
    );

    //Listar proyectos

    router.get('/proyectos/:url', 
        authController.usuarioAutenticado,
        proyectosController.proyectoPorUrl
    );

    //Actualizar el proyecto
    router.get('/proyecto/editar/:id', 
        authController.usuarioAutenticado,
        proyectosController.formularioEditar
    );

    router.post('/nuevo-proyecto/:id',
        authController.usuarioAutenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.actualizarProyecto
    );

    //Eliminar proyecto

    router.delete('/proyectos/:url', 
        authController.usuarioAutenticado,
        proyectosController.eliminarProyecto
    );

    //Tareas
    router.post('/proyectos/:url', 
        authController.usuarioAutenticado,
        tareasController.agregarTarea
    );

    //Actualizar tarea
    router.patch('/tareas/:id', 
        authController.usuarioAutenticado,
        tareasController.cambiarEstadoTarea
    );

    //Eliminar tarea
    router.delete('/tareas/:id', 
        authController.usuarioAutenticado,
        tareasController.eliminarTarea
    );
 
    //Crear cuenta de usuario
    router.get('/crear-cuenta', 
        usuariosController.formCrearCuenta
    );
    router.post('/crear-cuenta', 
        usuariosController.crearCuenta
    );
    router.get('/confirmar/:correo', 
        usuariosController.confirmarCuenta
    );

    //Iniciar sesi??n
    router.get('/iniciar-sesion', 
        usuariosController.formIniciarSesion
    );
    router.post('/iniciar-sesion', 
        authController.autenticarUsuario
    );

    //Cerrar sesi??n
    router.get('/cerrar-sesion', usuariosController.cerrarSesion);

    //Restablecer contrase??a
    router.get('/restablecer', usuariosController.formEstablecerPassword);
    router.post('/restablecer', authController.enviarToken);
    router.get('/restablecer/:token', authController.validarToken);
    router.post('/restablecer/:token', authController.actualizarPassword);

    return router;
}
  