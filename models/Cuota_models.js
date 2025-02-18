const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');
const Usuario = require('./Usuario_models');
const Rendicion = require('./Rendicion_models');

const Cuota = sequelize.define('Cuota', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  numero_cuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  monto_cuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  
  metodo_pago: {
    type: DataTypes.STRING(18),
    allowNull: false,
    defaultValue:''
  },

  comentario: {
    type: DataTypes.STRING(100),
    
  },

  fecha_cobro: { //fecha que le corresponde pagar
    type: DataTypes.DATE,
    allowNull: false,

  },
  fecha_cobrada: { //fecha en ñla que finalmente paga el cliente
    type: DataTypes.DATE,
    

  },
  estado: { //pago-pendiente(cuando paga algo o se atrasa pero si paga)-no pagado(cuando no quiere pagar)impago(es base comoa rrancan todas las cuotas)
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue:'inpago'
  },


});



// Sincroniza el modelo con la base de datos (esto crea la tabla si no existe)
Cuota.sync();

module.exports = Cuota;