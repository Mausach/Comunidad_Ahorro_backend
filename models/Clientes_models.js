const sequelize = require('../database/config');
const { DataTypes } = require('sequelize');


const Clientes = sequelize.define('Clientes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  apellido: {
    type: DataTypes.STRING(25),
    allowNull: false,
    
  },
  nombre: {
    type: DataTypes.STRING(25),
    allowNull: false,
    
  },
  direccion_comersial: {
    type: DataTypes.STRING(65),
    
    
  },
  direccion_hogar: {
    type: DataTypes.STRING(65),
    allowNull: false,
    
  },
  dni: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },
  cuil: {
    type: DataTypes.STRING(11),
    allowNull: true,
    unique: true,
  },
  tarjeta: {
    type: DataTypes.STRING(25),
    
  },
  email: {
    type: DataTypes.STRING(35),
    allowNull: false,
    unique: true,
  },
  numero_telefono: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
  },
  numero_telefono_2: {
    type: DataTypes.STRING(12),
    
    unique: true,
  },

  apellido_familiar: {
    type: DataTypes.STRING(25),
    allowNull: false,
    
  },
  
  nombre_familiar: {
    type: DataTypes.STRING(25),
    allowNull: false,
    
  },

  situacion_veraz: {
    type: DataTypes.INTEGER,
    
  },
  numero_cliente: {
    type: DataTypes.STRING,
    unique: true, // Asegura que el numero_cliente sea único
    allowNull: false,
  },
});




// Sincroniza el modelo con la base de datos (esto crea la tabla si no existe)
Clientes.sync();


module.exports = Clientes;