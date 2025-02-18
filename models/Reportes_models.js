const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');
const Prestamos = require('./Prestamos_models');
const Rendicion = require('./Rendicion_models');
const Plan = require('./Plan_models');
const Gastos = require('./Gastos_models');


const Reportes = sequelize.define('Reportes', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      fecha_inicio_periodo: {//inicia periodo bigente de un mes
        type: DataTypes.DATE,
        allowNull: false, 

    },
    fecha_fin_periodo: {//finaliza periodo bigente de un mes
        type: DataTypes.DATE,
        allowNull: false, 

    },

    tipo: { //se debenc crear uno por producto (nombre del producto) (incluye prestamo)
        type: DataTypes.STRING(35), 
                      
      },

      total_ganancias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0, 
    },
    total_perdidas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },


    total_gastos: {//se pone 0 en casod e no haber
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },

    total_a_cobrar_dia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },

    total_vendido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    total_suscripciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    total: { //ver bien despues esto a que hace referencia pero podria a ser como una caja o capital
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },

    total_a_prestar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    
    objetivo_ventas_plan: { //para planes cuantos se quiere vender
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    total_prestado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    total_a_cobrar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
   
    //para esto relaciono rendicion para sacar al corador y de prestamos saco al vendedor y asi calcular lo que le corresponde
    total_sueldos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    porcentaje_ganancias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    porcentaje_perdida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    porcentaje_a_cobrar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    porcentaje_a_pagar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },
    porcentaje_gastos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,  
    },

    porcentajes_anteriores: { //guardaremos todos los porcentajes anteriores para comparar
        type: DataTypes.JSON, // Tipo JSON para guardar un arreglo de objetos
        // Puede ser null si no existen porcentajes anteriores
      },

     
      
});





Reportes.sync();


// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Reportes;