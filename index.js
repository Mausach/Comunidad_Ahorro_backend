const express = require('express')
//const { dbConeccion } = require('./dataBase/config');
const sequelize = require('./database/config');
require('dotenv').config();
const cors= require("cors");
const app= express();

//llamar al servidor
app.listen(process.env.PORT, ()=>{
    console.log(`server corriendo en ${process.env.PORT}`)
})

//base de datos
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
//dbConeccion();


// Sincroniza tus modelos con la base de datos para que las 7ablas que no exis7en se creen
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada con éxito.');
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  })

//cors
app.use(cors());

//directorio publico
app.use(express.static('public'));

//lectura y parseo del body
app.use(express.json());



//para los estudios contables o usuarios en general
app.use("/auth",require('./routes/auth'))

//para el admin
app.use("/admin",require('./routes/admin'))

//para el sindicato
//app.use("/sindicato",require('./routes/sindicato'))

//para el sindicato
//app.use("/est-cont",require('./routes/est_cont'))

//para la tienda en este caso de menus
//app.use("/tienda",require('./routes/tienda'))

//para aplicar mercadopago
//app.use("/payment",require('./routes/payment'))


//app.listen(process.env.PORT),()=>{
  //  console.log('server corriendo en puerto 4k');
//};