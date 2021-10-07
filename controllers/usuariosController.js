const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email')
exports.formCrearCuenta = (req, res, next) => {
    res.render('crearCuenta', {
        nombrePagina : 'Crear cuenta de UpTask'
    });
}

exports.formIniciarSesion = (req, res, next) => {
    const { error } = res.locals.mensajes;

    //console.log(error);
    res.render('iniciarSesion', {
        nombrePagina : 'Iniciar sesión en UpTask',
        error
    });
}

exports.crearCuenta = async (req, res) => {
    //Leer los datos
    const { email, password } = req.body;

    try {
        //Crear el usuario
        await Usuarios.create({
            email, 
            password
        });

        //Crear una URL de confirmación
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        //Crear el objeto de usuario
        const usuario = {
            email
        }

        //Enviar EMail
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirm your account of UpTask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        }); 

        //Redirigir al usuario
        req.flash('correcto','Se ha enviado un correo de confirmación a tu cuenta de correo electrónico registrada.')
        res.redirect('/iniciar-sesion')
    } catch (error) {
        console.log(error);
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina : 'Crear cuenta de UpTask',
            email,
            password
        })
    }
}

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion');
    })
}

exports.formEstablecerPassword = (req, res) => {
    res.render('restablecer', {
        nombrePagina: 'Restablece tu contraseña'
    })
}

//Cambiar el estado de una cuenta
exports.confirmarCuenta = async(req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    //Si no existe el usuario
    if(!usuario){
        req.flash('error','No válido.');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto','Cuenta activada correctamente.');
    res.redirect('/iniciar-sesion');
}