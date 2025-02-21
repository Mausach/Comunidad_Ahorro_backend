const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');





const Venta_permutada = sequelize.define('Venta_permutada', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombre: { //descripcion como permuta, plan moto o celulares
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  objeto_recibido: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  valor_obj_recibido: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  objeto_entregado: { //ej: motomel110-celular
    type: DataTypes.STRING(60),
    allowNull: false,
  },

  monto_adicional_recibido: {//en todo caso que se coloque 0 si no hay monto adicional
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  cant_cuotas_restantes: {//dependiendo del plan se calculan las nuevas cuotas y lo mismo que el monto adicional que se coloque 0 si no!
    type: DataTypes.INTEGER,
    allowNull: false,
  },


  comision_vendedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  fecha_realizado: {//ingreso al plan
    type: DataTypes.DATE,
    allowNull: false,
  },

  estado: { //caducado-pendienteo bigente-canselado
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'pendiente'
  },

  conducta_cliente: { //al dia, canselado:(termino de pagar),refinanciado:(se le refinancia las cuotas),atrasado:(debe meses),cobro judicial(ya debe aprox un mes)
    type: DataTypes.STRING(35),
    allowNull: false,
    defaultValue: 'al dia',
  },



});




Venta_permutada.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Venta_permutada;