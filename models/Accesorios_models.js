const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');



const Accesorios = sequelize.define('Accesorios', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre_accesorio: { //descripcion de objeto en venta directa
        type: DataTypes.STRING(15), 
        allowNull: false,              
      },

    monto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },

    nombre_vendedor: { //descripcion de objeto en venta directa
        type: DataTypes.STRING(25), 
        allowNull: false,              
      },

      metodo_de_pago: { //descripcion como permuta
        type: DataTypes.STRING(60), 
        allowNull: false,              
      },

      fecha_y_hora: {
        type: DataTypes.DATE,
        allowNull: false, 
    },
  
});

 


  Accesorios.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Accesorios;