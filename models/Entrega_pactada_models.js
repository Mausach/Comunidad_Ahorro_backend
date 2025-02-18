const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');

const Entrega_pactada = sequelize.define('Entrega_pactada', {
  
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, //efectuada, no efectuada
    
  },

  monto_recibido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,    
  },

  Objeto_entregado: {
    type: DataTypes.STRING(35), 
    allowNull: false,              
  },

  fecha_entregada: {
    type: DataTypes.DATE,
    allowNull: false,
  },

});

// Sincroniza el modelo con la base de datos (esto crea la tabla si no existe)
Entrega_pactada.sync();

module.exports = Entrega_pactada;