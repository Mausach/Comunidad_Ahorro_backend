const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Dato_vendedores = sequelize.define('Dato_vendedores', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    //lo hacemos para caducos ya en nuestra DB o posibles clientes nuevos
    //solo guardad : nombre y apellido , direccion1 direccion 2 telefono1 y telefono2
    clientes: {
        type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
        allowNull: true, // Puede ser null si no tienes clientes aún
      },

    fecha_y_hora_habiles: {
        type: DataTypes.DATE,

    },

    id_supervisor: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

});




Dato_vendedores.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Dato_vendedores;