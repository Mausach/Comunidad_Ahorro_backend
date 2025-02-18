const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Rendicion = sequelize.define('Rendicion', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    monto_rendir: {
        type: DataTypes.INTEGER,//creator,gerencia,admin,supervisor_venta,cobrador,vendedor,cobrador_vendedor
        allowNull: false,
    },


    fecha_y_hora: {
        type: DataTypes.DATE,

    },

    tipo: { //si es un prestamo o plan de algo se aclara con el nombre del plan (ver si no se borra)
        type: DataTypes.STRING(35), 
                   
      },

    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, //no rendido, rendido

    },

    datos_de_cuotas: { //
        type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
        allowNull: true, // Puede ser null si no tienes vendedores aún
        defaultValue: [],
      },



});

Rendicion.sync();


// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Rendicion;