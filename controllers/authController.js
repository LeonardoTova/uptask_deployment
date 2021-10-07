const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Credenciales obligatorias.'
});

// Función para revisar si el usuario está loggeado
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuarioe stá autenticado, adelante
    if(req.isAuthenticated()) {
        return next();
    }
    //Si el usuario no está autenticado, regresar al formulario1
    return res.redirect('/iniciar-sesion');
}

exports.enviarToken = async (req, res) => {
    //Verificar si la cuenta existe
    const { email } = req.body
    const usuario = await Usuarios.findOne({where: { email }})

    //Si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta.')
        res.redirect('/restablecer');
    }

    //Si el usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;
    
    //Guardar en la base de datos
    await usuario.save();

    //URL de restablecer
    const resetUrl = `http://${req.headers.host}/restablecer/${usuario.token}`;

    //envía el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'restablecer-password'
    }); 

    //terminar la acción
    req.flash('correcto', 'Se envío un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
    //console.log(resetUrl);
}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //Si no encuentra al usuario
    if(!usuario) {
        req.flash('error', 'Credenciales invalidas.');
        res.redirect('/restablecer');
    }

    //Formulario para generar nuevo password
    res.render('resetPassword', {
        nombrePagina: 'Restablecer contraseña'
    })
    //console.log(usuario);
    
}

exports.actualizarPassword = async (req, res) => {
    //Verifica el token valido y tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    //Verificamos si el usuario existe
    if(!usuario) {
        req.flash('error', 'Credenciales invalidas.');
        res.redirect('/restablecer');
    }

    //Hashear el password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10) ); 
    usuario.token = null;
    usuario.expiracion = null;

    //Guardar el nuevo password
    await usuario.save();   

    req.flash('correcto', 'Tu contraseña se ha modificado correctamente.')
    res.redirect('/iniciar-sesion');

    console.log(usuario);
}