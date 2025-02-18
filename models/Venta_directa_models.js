const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');

const Clientes = require('./Clientes_models');
const Usuario = require('./Usuario_models');
const Producto = require('./Producto_models');


const Venta_directa = sequelize.define('Venta_directa', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre_objeto: { //descripcion de objeto en venta directa
        type: DataTypes.STRING(15), 
        allowNull: false,              
      },

    monto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },


      metodo_de_pago: { 
        type: DataTypes.STRING(60), 
        allowNull: false,              
      },

      fecha_y_hora: {
        type: DataTypes.DATE,
        allowNull: false, 
    },


    objeto_en_venta: { //ej: motomel110-celular
        type: DataTypes.STRING(60), 
        allowNull: false,              
      },



    comision_vendedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    
      
});


 




  Venta_directa.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Venta_directa;