const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Usuario = sequelize.define('Usuario',{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "cobrador", //tipos de usuarios para el proyecto: administrador,supervisor,encargado,cobrador,vendedor!
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
} );



// Sincroniza el modelo con la base de datos (esto crea la tabla si no existe)
Usuario.sync();


module.exports = Usuario;