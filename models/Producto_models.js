const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');




const Producto = sequelize.define('Producto', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    venta_directa_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    prestamo_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    tipo_cobranza_prestamo: { //si se cobraria diario , semanal , quinsenal , mensual
        type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
        allowNull: true, // Puede ser null si no tienes vendedores aún
        defaultValue: [],
      },

    
    monto_max_prestar: { //posiblemente el plan sea a 12 cuotas!
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },  

    venta_permutada_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    accesorio_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    servicio_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    plan_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    plan_descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:''
    },

    objetivo_ventas: { //ELIMINAR
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },


    cantidad_cuotas_plan: { //posiblemente el plan sea a 12 cuotas!
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },

    monto_cuotas_plan: { //
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },

    entrega_pactada_bandera: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },

    cuotas_entrega_pactada: { //cuotas en las que la entrega pactada es efectiva ej: 3,5,7,9 y 12
        type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
        allowNull: true, // Puede ser null si no tienes vendedores aún
        defaultValue: [],
      },

      estado_producto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:true//para activo
    },


      
});


Producto.sync();



// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Producto;