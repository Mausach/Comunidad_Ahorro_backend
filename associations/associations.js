// Relaciones entre los modelos
const Usuario = require('../models/Usuario_models');
const Cuota = require('../models/Cuota_models');
const Rendicion = require('../models/Rendicion_models');
const Plan = require('../models/Plan_models');
const Producto = require('../models/Producto_models');
const Clientes = require('../models/Clientes_models');
const Prestamos = require('../models/Prestamos_models');
const Reportes = require('../models/Reportes_models');
const Gastos = require('../models/Gastos_models');
const Accesorios = require('../models/Accesorios_models');
const Venta_directa = require('../models/Venta_directa_models');
const Venta_permutada = require('../models/Venta_permutada_models');
const Servicios = require('../models/Servicios_models');
const Rol = require('../models/Rol_models');
const Entrega_pactada = require('../models/entrega_pactada_models');

// Relación: un usuario tiene un único rol
Usuario.belongsTo(Rol, { foreignKey: 'rolId', as: 'rol' });

// Relación: un cliente puede tener varios planes
Plan.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });

// Relación: un vendedor puede tener varios planes
Plan.belongsTo(Usuario, { foreignKey: 'vendedorId', as: 'vendedor' });

// Relación: un plan tiene muchas cuotas
Plan.hasMany(Cuota, { foreignKey: 'planId', as: 'cuotas' });

// Relación: un plan tiene una entrega pactada
Plan.hasOne(Entrega_pactada, { foreignKey: 'planId', as: 'entrega_pactada' });

// Relación: venta_directa pertenece a un Producto
Venta_directa.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Relación: un cliente puede tener varias compras directas
Venta_directa.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });

// Relación: un vendedor puede tener varias ventas directas
Venta_directa.belongsTo(Usuario, { foreignKey: 'vendedorId', as: 'vendedor' });

// Relación: un plan pertenece a un Producto
Plan.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Relación: un préstamo tiene muchas cuotas
Prestamos.hasMany(Cuota, { foreignKey: 'prestamoId', as: 'cuotas' });

// Relación: un reporte tiene muchos préstamos
Reportes.hasMany(Prestamos, { foreignKey: 'reporteId', as: 'prestamos' });

// Relación: un reporte tiene muchas rendiciones (ver esto y si se puede cambiar a lo mejor no hace falta la relacion)
Reportes.hasMany(Rendicion, { foreignKey: 'reporteId', as: 'rendiciones' });

//un cobrador tiene muchas rendiciones
Usuario.hasMany(Rendicion, { foreignKey: 'cobradorId', as: 'rendiciones' });

// Relación: un reporte tiene muchos planes
Reportes.hasMany(Plan, { foreignKey: 'reporteId', as: 'plan' });

// Relación: un reporte tiene muchos gastos
Reportes.hasMany(Gastos, { foreignKey: 'reporteId', as: 'gastos' });

// Relación: un reporte tiene muchAS VENTAS DE ACC
Reportes.hasMany(Accesorios, { foreignKey: 'reporteId', as: 'accesorios' });

// Relación: un reporte tiene muchAS VENTAS DE SERV
Reportes.hasMany(Servicios, { foreignKey: 'reporteId', as: 'servicios' });

// Relación: un cliente puede tener varios préstamos
Prestamos.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });

// Relación: un vendedor puede tener varios préstamos
Prestamos.belongsTo(Usuario, { foreignKey: 'vendedorId', as: 'vendedor' });

// Relación: un cobrador puede tener varios préstamos
Prestamos.belongsTo(Usuario, { foreignKey: 'cobradorId', as: 'cobrador' });

// Relación: un cliente puede tener varias compras permutadas
Venta_permutada.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });

// Relación: un vendedor puede tener varias ventas permutadas
Venta_permutada.belongsTo(Usuario, { foreignKey: 'vendedorId', as: 'vendedor' });

// Relación: venta permutada pertenece a un Producto
Venta_permutada.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Relación: una venta permutada tiene muchas cuotas retantes
Venta_permutada.hasMany(Cuota, { foreignKey: 'permutadoId', as: 'cuotas' });

// Relación: una cuota pertenece a un Usuario (Cobrador)
Cuota.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relación: cada cuota pertenece a un objeto rendición
Cuota.belongsTo(Rendicion, { foreignKey: 'rendicionId', as: 'rendicion' });

// Relación: venta directa pertenece a un Producto
Accesorios.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Relación: venta directa pertenece a un Producto
Servicios.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

