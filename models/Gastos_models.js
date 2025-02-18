const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');



const Gastos = sequelize.define('Gastos', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      descripcion_gasto: { //espesifica el gasto
        type: DataTypes.STRING, 
        allowNull: false,              
      },

      Monto_gasto: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: false, 
    },
        
      
});



Gastos.sync();


// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Gastos;