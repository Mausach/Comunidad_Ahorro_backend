const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');




const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombres: {
    type: DataTypes.STRING(25),
    allowNull: false,

  },

  apellido: {
    type: DataTypes.STRING(25),
    allowNull: false,

  },

  direccion: {
    type: DataTypes.STRING(65),
    allowNull: false,
  },

  dni: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },

  cuil: {
    type: DataTypes.STRING(11),

    unique: true,
  },

  email: {
    type: DataTypes.STRING(35),
    allowNull: false,
    unique: true,
  },

  numero_telefono: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
  },

  numero_telefono_2: {
    type: DataTypes.STRING(12),
   
    unique: true,
  },

  apellido_familiar: {
    type: DataTypes.STRING(25),
    

  },

  nombre_familiar: {
    type: DataTypes.STRING(25),
    

  },

  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false
  },

  fecha_despido_renuncia: {
    type: DataTypes.DATE,

  },

  estado_acceso: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

  estado_rendimiento: {
    type: DataTypes.STRING(20),

  },

  monotributo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  objetivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,

  },

  sueldo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  nombre_de_usuario: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },

  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  //rol

});




// Sincroniza el modelo con la base de datos (esto crea la tabla si no existe)
Usuario.sync();


module.exports = Usuario;