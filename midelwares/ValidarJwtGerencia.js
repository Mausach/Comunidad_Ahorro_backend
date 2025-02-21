const jwt = require('jsonwebtoken');

const validarJWTGerencia = (req, res, next) => {//cambiar nombre por que acepta admins tambien
    // Extraer el token del header 'x-token'
    const token = req.header('x-token');

    // Si no se proporciona un token
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición',
        });
    }

    try {
        // Verificar el token con la clave secreta
        const payload = jwt.verify(token, process.env.SECRET_JWT);

        // Verificar que el rol sea 'gerente' o 'admin'
        if (payload.rol !== 'gerente' && 
            payload.rol !== 'cobrador' &&
            payload.rol !== 'vendedor' &&
            payload.rol !== 'admin') {
            return res.status(403).json({  // Código 403 - Forbidden es más adecuado que 404
                ok: false,
                msg: 'No tiene permisos suficientes para acceder a esta ruta.',
            });
        }

        // Si el token es válido y el rol es correcto, pasar los datos a la siguiente función
        req.id = payload.id;
        req.name = payload.name;
        req.rol = payload.rol;
    } catch (error) {
        // Si el token no es válido
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido o expirado.',
        });
    }

    next(); // Llamar a la siguiente función en la cadena de middleware
};

module.exports = {
    validarJWTGerencia,
};