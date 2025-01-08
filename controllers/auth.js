const bcryptjs = require ('bcrypt')
const jwt = require("jsonwebtoken");
const Usuario = require('../models/Usuario_models');


const loginUsuario = async (req, res) => {


    const { email, password } = req.body;

    try {

        let user = await Usuario.findOne({
            where: { email: email } // Utiliza el objeto where para especificar el filtro
        });

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: "email no valido"
            })
        }

        const validarpassword = bcryptjs.compareSync(password, user.password);

        if (!validarpassword) {
            return res.status(400).json({
                ok: false,
                msg: 'contraseña validas'
            });
        }

        if (user.estado != true) {
            return res.status(400).json({
                ok: false,
                msg: 'usted esta inhabilitado, contactese con el administrador'
            });
        } //inhabilil de momen7o para ver despues como lo manejamos por diferencias de modelo
        
        

        //generar nuestro JWT
        const payload = { //pueden cambiar los da7os despues
            id: user.id,
            email: user.email,
            rol: user.rol, // agarro el primer rol de los roles que 7iene
        };

        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

        res.status(200).json({
            ok: true,
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,// agarro el primer rol de los roles que 7iene
            token,
            msg: 'el usario se logueo',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "por favor contactarse con el administrador"
        })
    }
}


module.exports = {
    loginUsuario,
 
};