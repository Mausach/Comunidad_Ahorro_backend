const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../midelwares/ValidarCampos');
const { crearUsuario } = require('../controllers/admin');



//const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');

const routerAdmin = express.Router();


routerAdmin.post('/new', [// para nuevo US 
  
    check("email", "el email es obligatorio").not().isEmpty(),
    check("password", "la pasword debe ser de minimo 5").isLength({
        min: 5,
    }),
    check("rol", "el rol es obligatorio").not().isEmpty(),
    validarCampos
  ], crearUsuario);






//aclaras que se exporta todo lo trabajado con router
module.exports = routerAdmin;