const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');
const Clientes = require('./Clientes_models');
const Usuario = require('./Usuario_models');
const Cuota = require('./Cuota_models');



const Prestamos = sequelize.define('Prestamos', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      monto_prestado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    nombre: { 
        type: DataTypes.STRING(35), 
        allowNull: false,
        defaultValue:'Prestamo'              
      },

    interes_agregado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },


    suscripcion_inicial: { //se deberia calcular sola
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    tipo: { //en la teoria manejamos solo 4 dia,semana,quinsena,mes
        type: DataTypes.STRING(35), 
        allowNull: false,              
      },

    cantidad_tipo: { //tantidad de dias semanas quinsenas o meses
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    fecha_realizado: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    instancia_cliente: { //al dia,atrasado, canselado:(termino de pagar),refinanciado:(se le refinancia las cuotas),cobro judicial(ya debe aprox un mes o meses)
        type: DataTypes.STRING(35), 
        allowNull: false, 
        defaultValue: 'al dia',             
      },

      estado: { //caducado-pendiente o bigente-canselado
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue:'pendiente'
      },

      
});



Prestamos.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Prestamos;