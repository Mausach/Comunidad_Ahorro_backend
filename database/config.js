require('dotenv').config();

const { Sequelize } = require('sequelize');

/*
// URL de conexión proporcionada por Render
const databaseUrl=process.env.RENDER_DB_URL;

  // Configuración de conexión a la base de datos
const sequelize = new Sequelize(
  //process.env.BASENAME,
  //process.env.BASEUSER,
  //process.env.BASEPASS,
  databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Habilita SSL
        rejectUnauthorized: false, // Evita errores de "self signed certificate"
      },
    },
    define: {
      freezeTableName: true,
      timestamps: false,
    },
});
*/

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


/*
const dbConeccion = async () => {
  // Prueba de conexión a la base de datos
sequelize
.authenticate()
.then(() => {
  console.log('Conexión a la base de datos establecida con éxito.');
})
.catch((error) => {
  console.error('Error al conectar con la base de datos:', error);
  //aqui va la coneccion a la DB local
});

}
*/


  

// Exporta la instancia de Sequelize configurada
module.exports = sequelize;