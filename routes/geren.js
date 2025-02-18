const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../midelwares/ValidarCampos');
const { crearUsuario, cargarUsuarios, inhabilitarUsuario, cargarRoles,
  editarUsuario, habilitarUsuario, cargarEstructuraPrestamo, cargarProductos,
  crearProducto, editarProducto, inhabilitarProducto, habilitarProducto,
  cargarClientes, crearCliente,
  editarCliente,
  crearPrestamoNuevoCliente,
  cargarReportes,
  crearReporte,
  cargarUsuariosCobrador,
  editarReporte,
  crearPlanNuevoCliente,
  crearVentaDirNuevoCliente,
  crearVentaPermutadaNuevoCliente, 
  crearVentaServicioYreporte,
  crearVentaAccesoriosYreporte,
  RegGastosYreporte,
  obtenerProductosClienteCuotas,
  cargarCuotasHoy,
  cobroCuotaRendicion,
  cargarCuotaPagaPorEntregaPactada,
  cargarPlanesConCuotasPagadas,
  crearEquipoVentas,
  editarEquipoVentas,
  cargarEquiposVentas,
  eliminarEquipoVentas,
  cargarRendiciones} = require('../controllers/geren');
const { validarJWTGerencia } = require('../midelwares/ValidarJwtGerencia');




//const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');

const routerGeren = express.Router();

//nuevo usuario
routerGeren.post(
  '/new', validarJWTGerencia,
  [
    check('nombres', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('direccion', 'La dirección es obligatoria').not().isEmpty(),
    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }),
    check('email', 'El email debe ser válido').isEmail(),
    check('numero_telefono', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('fecha_ingreso', 'La fecha de ingreso es obligatoria').not().isEmpty(),
    check('nombre_de_usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('contraseña', 'La contraseña debe tener al menos 5 caracteres').isLength({ min: 5 }),
    check('rolId', 'El rol es obligatorio').not().isEmpty(),
    validarCampos,
  ],
  crearUsuario
);
//nuevo producto
routerGeren.post(
  '/new-product',
  validarJWTGerencia,
  [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),

    validarCampos
  ],
  crearProducto
);
//nuevo plan con cliente o cliente existente
routerGeren.post(
  '/new-plan-client',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }).isNumeric(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearPlanNuevoCliente
);
//nuevo prestamo con cliente o cliente existente
routerGeren.post(
  '/new-pre-client',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [

    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }).isNumeric(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearPrestamoNuevoCliente
);

//nueva venta permutada con cliente nuevo o existente
routerGeren.post(
  '/new-permuta',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }).isNumeric(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearVentaPermutadaNuevoCliente
);
//nueva venta directa nuevo cliente o existente
routerGeren.post(
  '/new-vtaDir',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }).isNumeric(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearVentaDirNuevoCliente
);

//nueva venta de servicios
routerGeren.post(
  '/new-vta-serv',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('servicio', 'El servicio es obligatorio').notEmpty(),
    check('monto', 'El monto es obligatorio').not().isEmpty(),
    check('vendedor', 'El vendedor es obligatorio').notEmpty(),
    check('metodoPago', 'El método de pago es obligatorio').notEmpty(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearVentaServicioYreporte
);

//nueva venta accesorios
routerGeren.post(
  '/new-vta-acc',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('accesorio', 'El accesorio es obligatorio').notEmpty(),
    check('monto', 'El monto es obligatorio').notEmpty(),
    check('vendedor', 'El vendedor es obligatorio').notEmpty(),
    check('metodoPago', 'El método de pago es obligatorio').notEmpty(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  crearVentaAccesoriosYreporte
);

//nueva gasto
routerGeren.post(
  '/new-reg-gasto',
  validarJWTGerencia, // Validación de JWT para asegurar que el usuario tiene permisos
  [
    check('monto', 'El monto es obligatorio ').notEmpty(),
    check('descripcion', 'La descripción es obligatoria').notEmpty(),

    validarCampos, // Middleware para validar los campos de entrada
  ],
  RegGastosYreporte
);
// 📌 Ruta para crear un equipo de ventas
routerGeren.post(
  "/new-equipo-venta",
  validarJWTGerencia, // Middleware para verificar el JWT
  [
      check("nombre_equipo", "El nombre del equipo es obligatorio").not().isEmpty(),
      check("id_supervisor", "El ID del supervisor es obligatorio").isInt(),
      check("vendedores", "Los vendedores deben ser un array válido").isArray(),
      validarCampos, // Middleware para validar los errores
  ],
  crearEquipoVentas
);


//editar producto o plan
routerGeren.put(
  '/edit-product',
  validarJWTGerencia,
  [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),

    validarCampos
  ],
  editarProducto
);
//editar usuario
routerGeren.put(
  '/edit-user', validarJWTGerencia,
  [
    check('nombres', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('direccion', 'La dirección es obligatoria').not().isEmpty(),
    check('dni', 'El DNI es obligatorio y debe tener 8 caracteres').isLength({ min: 8, max: 8 }),
    check('email', 'El email debe ser válido').isEmail(),
    check('numero_telefono', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('fecha_ingreso', 'La fecha de ingreso es obligatoria').not().isEmpty(),
    check('nombre_de_usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('contraseña', 'La contraseña debe tener al menos 5 caracteres').isLength({ min: 5 }).optional(),
    check('rolId', 'El rol es obligatorio').not().isEmpty(),
    validarCampos,
  ],
  editarUsuario
);
//editar cliente
routerGeren.put(
  '/edit-cliente',
  validarJWTGerencia,
  [
    // Validaciones para los campos del cliente
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('direccion_hogar', 'La dirección del hogar es obligatoria').not().isEmpty(),
    check('dni', 'El DNI debe ser un número').isNumeric(),
    check('situacion_veraz', 'La situación veraz es obligatoria').isInt({ min: 0, max: 6 }),
    check('email', 'El email no es válido').isEmail(),
    check('numero_telefono', 'El número de teléfono es obligatorio').not().isEmpty(),
    check('nombre_familiar', 'El nombre del familiar es obligatorio').not().isEmpty(),
    check('apellido_familiar', 'El apellido del familiar es obligatorio').not().isEmpty(),
    validarCampos,
  ],
  editarCliente
);
//editar reporte
routerGeren.put(
  '/edit-reporte',
  validarJWTGerencia,
  [
    validarCampos
  ],
  editarReporte
);
//editar cuota y crear rendicion
routerGeren.put(
  '/edit-cuota-rend',
  validarJWTGerencia,
  [
    check('estado', 'El estado es obligatorio').not().isEmpty(),
    validarCampos
  ],
  cobroCuotaRendicion
);
// 📌 Ruta para editar un equipo de ventas
routerGeren.put(
  "/edit-equip-venta",
  validarJWTGerencia,
  [
      check("id", "El ID del equipo es obligatorio y debe ser un número").isInt(),
      check("nombre_equipo", "El nombre del equipo es obligatorio").optional().not().isEmpty(),
      check("id_supervisor", "El ID del supervisor debe ser un número").optional().isInt(),
      check("vendedores", "Los vendedores deben ser un array válido").optional().isArray(),
      validarCampos,
  ],
  editarEquipoVentas
);

routerGeren.put('/Deshabilitar', validarJWTGerencia, inhabilitarUsuario);

routerGeren.put('/Habilitar', validarJWTGerencia, habilitarUsuario);

routerGeren.put('/Deshabilitar_prod', validarJWTGerencia, inhabilitarProducto);//estadod el producto

routerGeren.put('/Habilitar_prod', validarJWTGerencia, habilitarProducto);//estado del producto



routerGeren.get('/usuarios', validarJWTGerencia, cargarUsuarios); // Ruta para cargar usuarios

routerGeren.get('/cobradores', validarJWTGerencia, cargarUsuariosCobrador); // Ruta para cargar usuarios cobradores

routerGeren.get('/productos-cliente/:clienteId',validarJWTGerencia, obtenerProductosClienteCuotas); // Definir la ruta para obtener los productos y sus cuotas de un cliente

routerGeren.get('/rendiciones',validarJWTGerencia, cargarRendiciones); // Ruta para cargar el objeto prestamo

routerGeren.get("/equipos-venta", validarJWTGerencia, cargarEquiposVentas); // 📌 Ruta para obtener todos los equipos de ventas con información del supervisor

routerGeren.get('/cuotasHoy', validarJWTGerencia, cargarCuotasHoy); // cuotas hoy

routerGeren.get('/entregasPactadas', validarJWTGerencia, cargarPlanesConCuotasPagadas); // cuotas para entrega pactada

routerGeren.get('/Productos', validarJWTGerencia, cargarProductos); // Ruta para cargar los planes

routerGeren.get('/Reportes', validarJWTGerencia, cargarReportes); // Ruta para cargar los planes

routerGeren.get('/clientes', validarJWTGerencia, cargarClientes); // Ruta para cargar los clientes

routerGeren.get('/roles', validarJWTGerencia, cargarRoles);//carga los roles




routerGeren.delete("/delete-equipo-venta/:id", eliminarEquipoVentas);


//aclaras que se exporta todo lo trabajado con router
module.exports = routerGeren;