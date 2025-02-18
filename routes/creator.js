const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../midelwares/ValidarCampos');
const { crearRol } = require('../controllers/creator');


const routerCreator = express.Router();

//En producción, si el sistema es nuevo y vacío, considera ejecutarlo manualmente o a través de una interfaz administrativa tambien para la creacion de usuarios.


routerCreator .post('/new_rol', [// para crear un nuevo rol ver si se puede mejorar poniendo mas controles o limitaciones.
  
    check("nombre", "el nombre del rol es obligatorio").not().isEmpty(),
    validarCampos
  ], crearRol );



//aclaras que se exporta todo lo trabajado con router
module.exports = routerCreator ;