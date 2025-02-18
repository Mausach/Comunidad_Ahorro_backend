const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Equipo_ventas = sequelize.define('Equipo_ventas', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombre_equipo: { //nombre del equipo 
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  id_supervisor: {
    type: DataTypes.INTEGER,

  },
  vendedores: { //puedo tener solo los ids o mas datos es a conveniencia
    type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
    allowNull: true, // Puede ser null si no tienes vendedores aún
  },

});


Equipo_ventas.sync();


// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Equipo_ventas;