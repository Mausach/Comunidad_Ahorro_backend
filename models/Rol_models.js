const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');



const Rol = sequelize.define('Rol', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(17),//creator,gerencia,admin,supervisor_venta,cobrador,vendedor,cobrador_vendedor
        allowNull: false,
        unique: true,
      },
});





Rol.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Rol;