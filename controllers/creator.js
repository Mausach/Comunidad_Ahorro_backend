const Rol = require('../models/Rol_models'); // Asegúrate de usar la ruta correcta al modelo

const crearRol = async (req, res) => {
    const { nombre } = req.body;

    try {
        // Verificar si el rol ya existe
        const existingRol = await Rol.findOne({ where: { nombre } });
        if (existingRol) {
            return res.status(400).json({
                message: 'El rol ya existe.',
            });
        }

        // Crear el nuevo rol
        const newRol = await Rol.create({ nombre });

        return res.status(201).json({
            message: 'Rol creado exitosamente.',
            rol: newRol,
        });
    } catch (error) {
        console.error('Error al crear el rol:', error);
        return res.status(500).json({
            message: 'Hubo un error al crear el rol.',
            error: error.message,
        });
    }
};

module.exports = { crearRol };