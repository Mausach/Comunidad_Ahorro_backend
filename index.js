const express = require('express');
const sequelize = require('./database/config');
require('dotenv').config();
// Importar archivo de relaciones
require('./associations/associations');  // Asegúrate de que la ruta sea correcta
const cors = require("cors");
const app = express();
const fs = require('fs');
const path = require('path');


// Lista de orígenes permitidos
/*

const allowedOrigins = [
  process.env.DOM_LOCAL,      // Origen local
  process.env.DOM_URL,        // Origen de producción (Vercel)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Si no hay origen (ej. Postman) o el origen está en la lista permitida, permite la solicitud
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No está permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token'],
  credentials: true,  // Si usas autenticación con cookies o tokens
};

// Configuración de CORS
app.use(cors(corsOptions));


*/


// Lista de orígenes permitidos, que tomamos desde las variables de entorno

//cors
app.use(cors());

//directorio publico
app.use(express.static('public'));

//lectura y parseo del body
app.use(express.json());

// Carga automática de todos los modelos
const modelsPath = path.join(__dirname, 'models'); // crea una ruta completa a la carpeta models
fs.readdirSync(modelsPath).forEach(file => {       //Lee los archivos dentro de la carpeta models
  if (file.endsWith('.js') || file.endsWith('.ts')) {  // Filtrar solo los archivos que son archivos JavaScript (.js) o TypeScript (.ts) Asegúrate de que solo se requieran archivos relevantes
    require(path.join(modelsPath, file));         // importa cada archivo de modelo dentro de la carpeta models
  }
});


//*************************Rutas*************************

//ruta para los creadores
app.use("/creator",require('./routes/creator'))

//ruta para gerencia
app.use("/geren",require('./routes/geren'))

//para los estudios contables o usuarios en general
app.use("/auth",require('./routes/auth'))

//para el admin
//app.use("/admin",require('./routes/admin'))

//*************************Rutas*************************


// Probar la conexión a la base de datos
/*

sequelize
  .authenticate()
  .then(() => console.log('Conexión exitosa a la base de datos.'))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    console.log('Modelos y relaciones sincronizados exitosamente.');
    app.listen(process.env.PORT || 3000, () => {  // Llamar al servidor
      console.log(`Server corriendo en el puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar o sincronizar con la base de datos:', err);
    process.exit(1);
  });

*/


  // Conexión a la base de datos
sequelize.authenticate()
.then(() => console.log('Conexión exitosa a la base de datos.'))
.then(() => sequelize.sync({ alter: true }))
.then(() => {
  console.log('Modelos y relaciones sincronizados exitosamente.');
  // Configuración del servidor para que escuche en la IP 0.0.0.0 para permitir accesos desde otros dispositivos
  app.listen(process.env.PORT || 4005, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT || 4005}`);
  });
})
.catch((err) => {
  console.error('Error al conectar o sincronizar con la base de datos:', err);
  process.exit(1);
});

  

  // Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});









