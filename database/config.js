const fs = require('fs');
require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');

// Verifica el valor de las variables de entorno
//console.log('BASENAME:', process.env.BASENAME);
//console.log('BASEUSER:', process.env.BASEUSER);
//console.log('BASEPASS:', process.env.BASEPASS);
//console.log('HOST:', process.env.HOST);
//console.log('DATABASEDIALECT:', process.env.DATABASEDIALECT);

// Ruta al archivo del certificado CA





// URL de conexión proporcionada por aiven
//const databaseUrl=process.env.DB_URL;


/*
  // Configuración de conexión a la base de datos URL de render
const sequelize = new Sequelize(
  //process.env.BASENAME,
  //process.env.BASEUSER,
  //process.env.BASEPASS,
  databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Habilita SSL
        rejectUnauthorized: true, // Evita errores de "self signed certificate"
        ca: fs.readFileSync(caCertPath).toString(), // Usa el certificado CA
      },
    },
    define: {
      freezeTableName: true,
      timestamps: false,
    },
});
*/


//config para base en aiven
const caPath = path.join(__dirname, 'ca.pem'); // Ajusta la ruta


const sequelize = new Sequelize({
  database: process.env.BASENAME_NUB,
  username: process.env.BASEUSER_NUB,
  password: process.env.BASEPASS_NUB,
  host: process.env.HOST_NUB,
  port:  process.env.PORT_NUB, // Asegúrate de que es el puerto correcto
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true, // ⚠️ Evita errores con certificados auto-firmados
      ca: fs.readFileSync(caPath).toString(), // Cargar el certificado CA
    }
  },
  logging: false, // Desactiva logs en consola
});


/*
  // Configuración de conexión a la base de datos LOCAL
const sequelize = new Sequelize(
  process.env.BASENAME,
  process.env.BASEUSER,
  process.env.BASEPASS, { //esos da7os deberian es7ar en el env
  host: process.env.HOST, // El host de tu servidor PostgreSQL
  dialect: process.env.DATABASEDIALECT, // El dialecto de la base de datos (en este caso, PostgreSQL)
  define: {
    freezeTableName: true, // Deshabilita la búsqueda automática de nombres de tablas
    timestamps: false, // Si no necesitas marcas de tiempo  
  },
  
});
*/


  

// Exporta la instancia de Sequelize configurada
module.exports = sequelize;