const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario_models');
const Rol = require('../models/Rol_models');

const loginUsuario = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Buscar al usuario por email o nombre de usuario, incluyendo el rol
    let user = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUsername },
          { nombre_de_usuario: emailOrUsername },
        ],
      },
      include: {
        model: Rol,  // Asegúrate de que esté incluida la relación con Rol
        attributes: ['nombre'],  // Cargar el nombre del rol
        as: 'rol',  // Usa el alias 'rol' según la relación definida
      },
    });

    // Si no se encuentra el usuario, devolver error
    if (!user) {
      return res.status(400).json({
        ok: false,
        msg: 'Credenciales inválidas: email o nombre de usuario no válidos.',
      });
    }

    // Validar la contraseña
    const validarPassword = bcryptjs.compareSync(password, user.contraseña);
    if (!validarPassword) {
      return res.status(400).json({
        ok: false,
        msg: 'Credenciales inválidas: contraseña no válida.',
      });
    }

    // Verificar estado del usuario
    if (user.estado_acceso !== true) {
      return res.status(400).json({
        ok: false,
        msg: 'Usted está inhabilitado. Por favor contacte al administrador.',
      });
    }

    // Obtener el nombre del rol desde la relación
    const rolNombre = user.rol.nombre;

    // Generar el token JWT con el nombre del rol
    const payload = {
      id: user.id,
      email: user.email,
      rol: rolNombre, // Asignar el nombre del rol en el payload
    };

    const token = jwt.sign(payload, process.env.SECRET_JWT, {
      expiresIn: '2h',
    });

    // Respuesta exitosa
    res.status(200).json({
      ok: true,
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      nombre_de_usuario: user.nombre_de_usuario,
      rol: rolNombre,  // Incluir el nombre del rol en la respuesta
      token,
      msg: 'El usuario se ha logueado exitosamente.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Por favor contacte al administrador.',
    });
  }
};

module.exports = {
  loginUsuario,
};