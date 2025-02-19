const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Plan = sequelize.define('Plan', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombre: { //descripcion como plan-moto, plan-electrodomestico etc
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  interes_agregado: {//ver si se queda o se borra
    type: DataTypes.INTEGER,

  },

  objeto_venta: { //ej: motomel110-licuadora-aireacondicionado-etc
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  comision_vendedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  cuotas_entrega_pactada: { //cuotas en las que la entrega pactada es efectiva ej: 3,5,7,9 y 12
    type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
    allowNull: true, // Puede ser null si no tienes vendedores aún
    defaultValue: [],
  },
 

  cantidad_cuotas: { //posiblemente el plan sea a 12 cuotas!
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  fecha_realizado: {//ingreso al plan
    type: DataTypes.DATE,
    allowNull: false,
  },

  suscripcion_inicial: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  numero_de_contraro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  conducta_cliente: { //al dia, canselado:(termino de pagar),refinanciado:(se le refinancia las cuotas),atrasado:(debe meses),cobro judicial(ya debe aprox un mes)
    type: DataTypes.STRING(35),
    allowNull: false,
    defaultValue: 'al dia', 
  },

  estado: { //caducado-pendienteo bigente-canselado
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue:'pendiente'
  },


});

Plan.sync();

// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Plan;