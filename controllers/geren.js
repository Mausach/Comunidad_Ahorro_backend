const bcryptjs = require('bcrypt')
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');
const sequelize = require('../database/config');
const Usuario = require('../models/Usuario_models');
const Rol = require('../models/Rol_models'); // Asegúrate de tener el modelo de roles configurado correctamente
const Producto = require('../models/Producto_models');
const Clientes = require('../models/Clientes_models');
const Reportes = require('../models/Reportes_models');
const Prestamos = require('../models/Prestamos_models');
const Cuota = require('../models/Cuota_models');
const Plan = require('../models/Plan_models');
const Venta_directa = require('../models/Venta_directa_models');
const Venta_permutada = require('../models/Venta_permutada_models');
const Servicios = require('../models/Servicios_models');
const Accesorios = require('../models/Accesorios_models');
const Gastos = require('../models/Gastos_models');
const Rendicion = require('../models/Rendicion_models');
const Equipo_ventas = require('../models/Equipo_ventas_models');


//crea un usuario
const crearUsuario = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      nombres,
      apellido,
      direccion,
      dni,
      cuil,
      email,
      numero_telefono,
      numero_telefono_2,
      apellido_familiar,
      nombre_familiar,
      fecha_ingreso,
      fecha_despido_renuncia,
      estado_acceso,
      estado_rendimiento,
      monotributo,
      objetivo,
      sueldo,
      nombre_de_usuario,
      contraseña,
      rolId,
    } = req.body;

    // Validaciones básicas
    if (!nombre_de_usuario || !email || !contraseña || !rolId) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el email ya está registrado
    const condiciones = {
      [Op.or]: [
        { email },
        { dni },
        { cuil },
        { numero_telefono }
      ]
    };

    // Verificar si existe un usuario con alguno de los campos duplicados
    const existeUsuario = await Usuario.findOne({ where: condiciones });

    if (existeUsuario) {
      const camposDuplicados = [];

      if (existeUsuario.email === email) {
        camposDuplicados.push('email');
      }
      if (existeUsuario.dni === dni) {
        camposDuplicados.push('DNI');
      }
      if (existeUsuario.cuil === cuil) {
        camposDuplicados.push('CUIL');
      }
      if (existeUsuario.numero_telefono === numero_telefono) {
        camposDuplicados.push('número de teléfono');
      }

      return res.status(400).json({
        ok: false,
        msg: `Uno o más campos ya están registrados: ${camposDuplicados.join(', ')}.`,
        camposDuplicados,
      });
    }

    // Encriptar la contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(contraseña, salt);

    // Verificar si el rol existe
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: 'El rol especificado no existe',
      });
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombres,
      apellido,
      direccion,
      dni, //control de dni unico
      cuil, //lo mismo para el cuil
      email, //lo mismo para email
      numero_telefono, //controlar tambn
      numero_telefono_2, //tambien
      apellido_familiar,
      nombre_familiar,
      fecha_ingreso,
      fecha_despido_renuncia,
      estado_acceso,
      estado_rendimiento,
      monotributo,
      objetivo,
      sueldo,
      nombre_de_usuario,
      contraseña: hashedPassword,
      rolId,
    });

    //generar nuestro JWT
    //se lo genera en el back y se guardara en el front en el localstorage
    const payload = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      nombre_de_usuario: nuevoUsuario.nombre_de_usuario
    };

    //7oken expira en 2 hs consul7ar despues
    const token = jwt.sign(payload, process.env.SECRET_JWT, {
      expiresIn: "2h",
    });

    // Responder con el usuario creado (sin incluir la contraseña)
    res.status(201).json({
      id: nuevoUsuario.id,
      nombre_de_usuario: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rolId,
      estado: nuevoUsuario.estado_acceso,
      msg: 'el usuario se guardo correctamente',
      token
    });

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Ocurrió un error al crear el usuario.' });
  }
};

// Crear equipo de ventas
const crearEquipoVentas = async (req, res) => {
  try {
    const { nombre_equipo, id_supervisor, vendedores } = req.body;

    if (!nombre_equipo || !id_supervisor || !Array.isArray(vendedores)) {
      return res.status(400).json({
         ok: false,
        msg: "Datos incompletos o incorrectos"
         
      });
    }

    // Verificar si el supervisor ya pertenece a otro equipo
    const supervisorExistente = await Equipo_ventas.findOne({ 
      where: { id_supervisor }
    });

    if (supervisorExistente) {
      return res.status(400).json({ 
        ok: false,
        msg: "El supervisor ya pertenece a otro equipo" });
    }

    // Verificar si alguno de los vendedores ya pertenece a otro equipo
    const vendedoresExistentes = await Equipo_ventas.findOne({
      where: {
        vendedores: {
          [Op.contains]: vendedores // Verificar si algún vendedor ya está en el arreglo
        }
      }
    });

    if (vendedoresExistentes) {
      return res.status(400).json({ 
         ok: false,
        msg:"Uno o más vendedores ya pertenecen a otro equipo" });
    }

    // Crear el equipo de ventas
    const equipo = await Equipo_ventas.create({
      nombre_equipo,
      id_supervisor,
      vendedores: JSON.stringify(vendedores) // Guardar como JSON en la BD
    });

    return res.status(201).json({ message: "Equipo creado exitosamente", equipo });
  } catch (error) {
    console.error("Error al crear el equipo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const editarEquipoVentas = async (req, res) => {
  try {
    const { id, nombre_equipo, id_supervisor, vendedores } = req.body;

    const equipo = await Equipo_ventas.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    equipo.nombre_equipo = nombre_equipo || equipo.nombre_equipo;
    equipo.id_supervisor = id_supervisor || equipo.id_supervisor;
    equipo.vendedores = JSON.stringify(vendedores) || equipo.vendedores;

    await equipo.save();

    return res.status(200).json({ message: "Equipo actualizado", equipo });
  } catch (error) {
    console.error("Error al editar el equipo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const cargarEquiposVentas = async (req, res) => {
  try {
    // Obtener los equipos sin incluir la relación con Usuario
    const equipos = await Equipo_ventas.findAll({
      attributes: ["id", "nombre_equipo", "id_supervisor", "vendedores"], // Solo traer los campos necesarios
    });

    // Obtener los supervisores manualmente
    const supervisoresIds = equipos.map((equipo) => equipo.id_supervisor);
    const supervisores = await Usuario.findAll({
      where: { id: supervisoresIds },
      attributes: ["id", "nombres", "apellido"],
    });

    // Convertir la lista de supervisores en un objeto para acceso rápido
    const supervisoresMap = {};
    supervisores.forEach((sup) => {
      supervisoresMap[sup.id] = { id: sup.id, nombres: sup.nombres, apellido: sup.apellido };
    });

    // Formatear la respuesta
    const equiposFormateados = equipos.map((equipo) => {
      // Verificar si vendedores es una cadena JSON o ya es un objeto/array
      const vendedores =
        typeof equipo.vendedores === "string" ? JSON.parse(equipo.vendedores) : equipo.vendedores;

      return {
        id: equipo.id,
        nombre_equipo: equipo.nombre_equipo,
        id_supervisor: equipo.id_supervisor,
        supervisor: supervisoresMap[equipo.id_supervisor] || null, // Asignar supervisor si existe
        vendedores: vendedores, // Usar el valor ya parseado o el objeto/array directamente
      };
    });

    res.status(200).json({
      ok: true,
      msg: "Equipos cargados exitosamente.",
      equipos: equiposFormateados,
    });
  } catch (error) {
    console.error("Error al obtener los equipos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarEquipoVentas = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await Equipo_ventas.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    await equipo.destroy();

    return res.status(200).json({ message: "Equipo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el equipo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


//************************************** METODO PARA CREAR PRESTAMO CON CLIENTE PRESTAMO Y CUOTA **************************************************/

const crearPrestamoNuevoCliente = async (req, res) => {
  const {
    apellido,
    nombre,
    direccion_comersial,
    direccion_hogar,
    dni,
    cuil,
    tarjeta,
    email,
    numero_telefono,
    apellido_familiar,
    nombre_familiar,
    situacion_veraz,

    //ahora podemos enviar nombre DATOS DEL PRESTAMO
    nombrePres,
    monto_prestado,
    interes_agregado,
    tipo,
    cantidad_tipo,

    vendedorId,
    cobradorId,
    reporteId,

    esNuevoCliente,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {
    let cliente

    // Paso 1: Crear o buscar cliente utilizando la transacción
    if (esNuevoCliente) {
      cliente = await crearCliente(req.body, transaction);
    } else {
      cliente = await Clientes.findOne({ where: { dni }, transaction });
      //prestamo con cliente ya existente!
      if (!cliente) {
        throw new Error('El cliente no existe. Verifique el DNI proporcionado.');
      }
    }

    // Paso 2: Crear préstamo o plan
    let prestamoPlan;


    prestamoPlan = await crearPrestamo(req.body, cliente.id, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!prestamoPlan) {
      throw new Error('No se pudo crear el préstamo , Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (prestamoPlan) {
      await crearCuotasPrestamo(req.body, prestamoPlan.id, transaction);

      // Paso 4: Actualizar el reporte
      await actualizarReporteNuevoPrestamo(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      cliente: cliente,

    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

// Función para crear préstamo
const crearPrestamo = async (data, clienteId, transaction) => {
  const { monto_prestado, interes_agregado, tipo, cantidad_tipo, nombrePres } = data;
  console.log(data);

  const montoPrestado = parseInt(data.monto_prestado);
  const interesAgregado = parseInt(data.interes_agregado);
  const cantidadTipo = parseInt(data.cantidad_tipo);
  const vendedorId = parseInt(data.vendedorId);
  const cobradorId = parseInt(data.cobradorId);
  const reporteId = parseInt(data.reporteId);

  if (!montoPrestado || !interesAgregado || !tipo || !cantidadTipo) {
    throw new Error("Faltan datos obligatorios para crear el préstamo.");
  }

  // 1. Buscar préstamos activos del cliente
  const prestamosCliente = await Prestamos.findAll({
    where: { clienteId },
    order: [["fecha_realizado", "DESC"]], // Ordenamos del más reciente al más antiguo
  });

  // 2. Si el cliente tiene algún préstamo activo
  const prestamoActivo = prestamosCliente.find((p) => p.estado === "pendiente");
  const prestamoCaducado = prestamosCliente.find((p) => p.estado === "caducado");



  if (prestamoCaducado) {
    throw new Error("No se puede otorgar un préstamo, el cliente tiene un préstamo caducado.");
  }
  //los controles son al ultimo prestamo otorgado
  if (prestamoActivo) {
    // Verificar la instancia del cliente
    if (["atrasado", "refinanciado", "cobro judicial"].includes(prestamoActivo.instancia_cliente)) {
      throw new Error(
        "No se puede otorgar un préstamo, el cliente tiene pagos pendientes o en proceso judicial."
      );
    }
  }

  // 3. Verificar si ya existe un préstamo duplicado
  const fechaActual = new Date(); // Fecha actual para comparar
  const prestamoDuplicado = await Prestamos.findOne({
    where: {
      clienteId,
      monto_prestado: montoPrestado,
      interes_agregado: interesAgregado,
      tipo,
      cantidad_tipo: cantidadTipo,
      fecha_realizado: fechaActual, // Comparar con la fecha actual
    },
    transaction,
  });

  if (prestamoDuplicado) {
    throw new Error("Ya existe un préstamo con los mismos datos y fecha.");
  }

  // 4. Calcular cuotas
  const montos = calcularMontoCuota(
    montoPrestado,
    interesAgregado,
    cantidadTipo
  );

  // 5. Crear préstamo
  const prestamo = await Prestamos.create(
    {
      clienteId,
      nombre: nombrePres,
      monto_prestado: montoPrestado,
      interes_agregado: interesAgregado,
      suscripcion_inicial: montos.montoCuota,
      tipo,
      cantidad_tipo: cantidadTipo,
      fecha_realizado: new Date(),
      estado: "pendiente", // Se establece como pendiente al inicio
      instancia_cliente: "al dia", // Se inicia como al día
      vendedorId,
      cobradorId,
      reporteId,
    },
    { transaction }
  );

  return prestamo;
};

//actualiza los datos del reporte correspondientes podria funcionar tambien para planes , hay que hacer calculos correctos todabia y actualizar lo mas posible
const actualizarReporteNuevoPrestamo = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const montoPrestado = parseInt(data.monto_prestado);
    const interesAgregado = parseInt(data.interes_agregado);
    const cantidadTipo = parseInt(data.cantidad_tipo); //CANTIDAD DE CUOTAS
    const vendedorId = parseInt(data.vendedorId);
    const cobradorId = parseInt(data.cobradorId);
    const reporteId = parseInt(data.reporteId);

    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el prestamo*/

    //porcentaje a cobrar
    //porcentaje a pagar o sueldos

    const montos = calcularMontoCuota(montoPrestado, interesAgregado, cantidadTipo);



    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }

    // Validar que el total a prestar sea mayor o igual al monto prestado
    if (reporte.total_a_prestar < montoPrestado) {
      throw new Error('No Hay fondos suficientes para el prestamo');
    }

    await reporte.update(
      {
        total_a_prestar: (reporte.total_a_prestar) - montoPrestado,
        total_vendido: (reporte.total_vendido || 0) + 1,
        total_prestado: (reporte.total_prestado || 0) + montoPrestado,
        total_suscripciones: (reporte.total_suscripciones || 0) + montos.montoCuota,//hace referencia al valor de la primera cuota
        total_a_cobrar: (reporte.total_a_cobrar || 0) + montos.totalPagar,//se suma todo lo que se ah prestado mas el interes
        total_sueldos: (reporte.total_sueldos || 0) + montos.montoCuota,//se suma a lo que hay que pagar o pagado ya el monto de la cuota al vender 
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

//crear cuotas
const crearCuotasPrestamo = async (data, planCuotasId, transaction) => {
  try {
    // Validar el tipo de entidad y su ID
    if (!planCuotasId) {
      throw new Error(' ID inválido. No se puede continuar.');
    }

    // Desestructurar los datos relevantes
    const {
      monto_prestado,
      interes_agregado,
      cantidad_tipo, // Cantidad de cuotas
      cobradorId,
    } = data;

    // Validar datos obligatorios
    if (!monto_prestado || !interes_agregado || !cantidad_tipo || !cobradorId) {
      throw new Error('Datos insuficientes para generar las cuotas.');
    }

    // Calcular montos y fechas
    const montos = calcularMontoCuota(
      parseInt(monto_prestado),
      parseInt(interes_agregado),
      parseInt(cantidad_tipo)
    );
    const fechasCobro = calcularFechasCuotas(parseInt(cantidad_tipo), data.tipo);

    // Crear cuotas según el tipo de entidad
    const cuotas = [];
    for (let i = 0; i < parseInt(cantidad_tipo); i++) {
      const nuevaCuota = await Cuota.create(
        {
          numero_cuota: i + 1,
          prestamoId: planCuotasId, // Dinámicamente asigna el ID de la entidad
          monto_cuota: montos.montoCuota,
          fecha_cobro: fechasCobro[i],
          usuarioId: parseInt(cobradorId),
          estado: 'inpago',
        },
        { transaction }
      );
      cuotas.push(nuevaCuota);
    }

    return cuotas;
  } catch (error) {
    throw new Error(error.message || 'Error al crear las cuotas');
  }
};

const calcularMontoCuota = (montoPrestado, interes, cantidadCuotas) => {
  // Calcular el total a pagar y redondear hacia adelante
  const totalPagar = Math.ceil(montoPrestado + (montoPrestado * (interes / 100)));

  // Calcular el monto de la cuota y redondear hacia adelante
  const montoCuota = Math.ceil(totalPagar / cantidadCuotas);

  return {
    totalPagar,
    montoCuota,
  };
};


/**************************************************** FIN DE LOS METODOS PARA PRESTAMOS *******************************************************/



//crea un cliente
const crearCliente = async (datosCliente, transaction) => {
  const {
    apellido,
    nombre,
    direccion_comersial,
    direccion_hogar,
    dni,
    cuil,
    tarjeta,
    email,
    numero_telefono,
    apellido_familiar,
    nombre_familiar,
    situacion_veraz,
  } = datosCliente;

  try {
    // Validar los campos obligatorios
    if (
      !apellido ||
      !nombre ||
      !direccion_hogar ||
      !dni ||
      !email ||
      !numero_telefono ||
      !apellido_familiar ||
      !nombre_familiar
    ) {
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    // Validar situacion_veraz
    const situacionVerazParsed = parseInt(situacion_veraz, 10);
    if (isNaN(situacionVerazParsed) || situacionVerazParsed < 1 || situacionVerazParsed > 6) {
      throw new Error('La situación veraz debe estar entre 1 y 6');
    }

    // Verificar si ya existe un cliente con el mismo DNI
    const clienteExistente = await Clientes.findOne({ where: { dni }, transaction });
    if (clienteExistente) {
      throw new Error('Ya existe un cliente con ese DNI.');
    }

    // Obtener el último cliente y calcular el numero_cliente
    const ultimoCliente = await Clientes.findOne({ order: [['id', 'DESC']], transaction });
    const nuevoNumeroCliente = ultimoCliente
      ? `${String(ultimoCliente.id + 1).padStart(6, '0')}`
      : '000001';

    // Crear el nuevo cliente dentro de la transacción
    const nuevoCliente = await Clientes.create(
      {
        apellido,
        nombre,
        direccion_comersial,
        direccion_hogar,
        dni,
        cuil,
        tarjeta,
        email,
        numero_telefono,
        apellido_familiar,
        nombre_familiar,
        situacion_veraz: situacionVerazParsed,
        numero_cliente: nuevoNumeroCliente,
      },
      { transaction }
    );

    return nuevoCliente;
  } catch (error) {
    throw new Error(error.message || 'Error al crear el cliente');
  }
};
//calcula fechas
const calcularFechasCuotas = (cantidadCuotas, tipoFrecuencia) => {
  const fechas = [];
  const unDiaEnMs = 24 * 60 * 60 * 1000; // Milisegundos en un día
  let intervaloDias;

  // Determinar el intervalo según el tipo de frecuencia
  switch (tipoFrecuencia.toLowerCase()) {
    case 'diario':
      intervaloDias = 1;
      break;
    case 'semanal':
      intervaloDias = 7;
      break;
    case 'quincenal':
      intervaloDias = 15;
      break;
    case 'mensual':
      intervaloDias = 30; // Aproximado a 30 días
      break;
    default:
      throw new Error('Tipo de frecuencia inválido');
  }

  // Si no se proporciona fecha de inicio, usar la fecha actual del sistema
  let fechaActual = new Date();

  for (let i = 0; i < cantidadCuotas; i++) {
    // Calcular la siguiente fecha
    fechaActual = new Date(fechaActual.getTime() + intervaloDias * unDiaEnMs);

    // Si cae en domingo, mover al lunes siguiente
    while (fechaActual.getDay() === 0) { // 0 representa domingo
      fechaActual = new Date(fechaActual.getTime() + unDiaEnMs);
    }

    // Agregar la fecha al array
    fechas.push(new Date(fechaActual));
  }

  return fechas;
};




//************************************** METODO PARA CREAR PLAN CON CLIENTE REPORTE Y CUOTA **************************************************/

const crearPlanNuevoCliente = async (req, res) => {
  const {
    apellido,
    nombre,
    direccion_comersial,
    direccion_hogar,
    dni,
    cuil,
    tarjeta,
    email,
    numero_telefono,
    apellido_familiar,
    nombre_familiar,
    situacion_veraz,

    //datos de los planes
    nombrePlan,
    objeto_venta,
    cantidad_cuotas,
    numero_de_contraro,
    suscripcion_inicial,
    monto_cuota,
    productoId,

    vendedorId,
    cobradorId,
    reporteId,

    esNuevoCliente,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {
    let cliente

    // Paso 1: Crear o buscar cliente utilizando la transacción
    if (esNuevoCliente) {
      cliente = await crearCliente(req.body, transaction);
    } else {
      cliente = await Clientes.findOne({ where: { dni }, transaction });
      //prestamo con cliente ya existente!
      if (!cliente) {
        throw new Error('El cliente no existe. Verifique el DNI proporcionado.');
      }
    }

    // Paso 2: Crear préstamo o plan
    let Plan;



    Plan = await crearPlan(req.body, cliente.id, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!Plan) {
      throw new Error('No se pudo crear el plan, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (Plan) {
      await crearCuotasPlan(req.body, Plan.id, transaction);

      // Paso 4: Actualizar el reporte
      await actualizarReporteNuevoPlan(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      cliente: cliente,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

//actualiza los datos del reporte correspondientes podria funcionar tambien para planes , hay que hacer calculos correctos todabia y actualizar lo mas posible
const actualizarReporteNuevoPlan = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const cantidad_Cuotas = parseInt(data.cantidad_cuotas);
    const monto_Cuota = parseInt(data.monto_cuota);
    const suscripcion_Inicial = parseInt(data.suscripcion_inicial);
    const cobradorId = parseInt(data.cobradorId);
    const vendedorId = parseInt(data.vendedorId);
    const reporteId = parseInt(data.reporteId);

    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el plan*/

    //porcentaje a cobrar
    //porcentaje a pagar o sueldos

    const monto_a_cobrar = (monto_Cuota * cantidad_Cuotas);



    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }


    await reporte.update(
      {

        total_vendido: (reporte.total_vendido || 0) + 1,
        total_suscripciones: (reporte.total_suscripciones || 0) + suscripcion_Inicial,//hace referencia al valor de la primera cuota
        total_a_cobrar: (reporte.total_a_cobrar || 0) + monto_a_cobrar,//se suma todo lo que se ah prestado mas el interes
        total_sueldos: (reporte.total_sueldos || 0) + suscripcion_Inicial,//se suma a lo que hay que pagar o pagado ya el monto de la cuota al vender 
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

// Función para crear plan
const crearPlan = async (data, clienteId, transaction) => {
  const {
    nombre,
    objeto_venta,
    cantidad_cuotas,
    numero_de_contraro,
    monto_cuota,
    suscripcion_inicial,
    vendedorId,
    reporteId,
    productoId,
  } = data;

  if (!nombre || !cantidad_cuotas || !numero_de_contraro || !monto_cuota || !suscripcion_inicial || !vendedorId || !reporteId || !productoId) {
    throw new Error('Faltan datos obligatorios para crear el plan.');
  }

  const cantidad_Cuotas = parseInt(cantidad_cuotas);
  const numero_de_Contraro = parseInt(numero_de_contraro);
  const monto_Cuota = parseInt(monto_cuota);
  const suscripcion_Inicial = parseInt(suscripcion_inicial);
  const VendedorId = parseInt(vendedorId);
  const cobradorId = parseInt(data.cobradorId);
  const ReporteId = parseInt(reporteId);

  // 1. Buscar planes activos del cliente
  const planesCliente = await Plan.findAll({
    where: { clienteId },
    order: [["fecha_realizado", "DESC"]], // Ordenamos del más reciente al más antiguo
  });

  // 2. Si el cliente tiene algún préstamo activo
  const planActivo = planesCliente.find((p) => p.estado === "pendiente");


  //los controles son al ultimo prestamo otorgado
  if (planActivo) {
    // Verificar la instancia del cliente
    if (["atrasado", "refinanciado", "cobro judicial"].includes(planActivo.conducta_cliente)) {
      throw new Error(
        "No se puede otorgar un plan, el cliente tiene pagos pendientes o en proceso judicial."
      );
    }
  }


  // 3. Verificar si ya existe un préstamo duplicado
  const fechaActual = new Date(); // Fecha actual para comparar
  const planDuplicado = await Plan.findOne({
    where: {
      clienteId,
      objeto_venta,
      cantidad_cuotas: cantidad_Cuotas,
      numero_de_contraro: numero_de_Contraro,
      fecha_realizado: fechaActual, // Comparar con la fecha actual
      suscripcion_inicial: suscripcion_Inicial,
    },
    transaction,
  });

  if (planDuplicado) {
    throw new Error("Ya existe un préstamo con los mismos datos y fecha.");
  }

  // Obtener el producto para extraer cuotas_entrega_pactada
  const producto = await Producto.findByPk(productoId, { transaction });

  if (!producto) {
    throw new Error('Producto no encontrado.');
  }

  const cuotas_entrega_pactada = producto.cuotas_entrega_pactada; // Asumiendo que el campo es cuotas_entrega_pactada



  const plan = await Plan.create(
    {

      nombre: producto.nombre,
      objeto_venta,
      cantidad_cuotas: cantidad_Cuotas,
      numero_de_contraro: numero_de_Contraro,
      comision_vendedor: monto_Cuota, //es la primera cuota pero hay que averiguar si hay que hacer algun calculo
      cuotas_entrega_pactada,
      fecha_realizado: new Date(),
      suscripcion_inicial: suscripcion_Inicial,

      clienteId,
      vendedorId: VendedorId,
      reporteId: ReporteId,
      productoId,

    },
    { transaction }
  );

  return plan;
};
//crear cuotas
const crearCuotasPlan = async (data, planCuotasId, transaction) => {
  try {
    // Validar el tipo de entidad y su ID
    if (!planCuotasId) {
      throw new Error('ID inválido. No se puede continuar.');
    }

    const cantidad_Cuotas = parseInt(data.cantidad_cuotas);
    const numero_de_Contraro = parseInt(data.numero_de_contraro);
    const monto_Cuota = parseInt(data.monto_cuota);
    const suscripcion_Inicial = parseInt(data.suscripcion_inicial);
    const VendedorId = parseInt(data.vendedorId);
    const cobradorId = parseInt(data.cobradorId);
    const ReporteId = parseInt(data.reporteId);



    // Validar datos obligatorios
    if (!data.monto_cuota || !data.cantidad_cuotas || !cobradorId || !data.tipo) {
      throw new Error('Datos insuficientes para generar las cuotas.');
    }


    const fechasCobro = calcularFechasCuotas(parseInt(data.cantidad_cuotas), data.tipo);

    // Crear cuotas según el tipo de entidad
    const cuotas = [];
    for (let i = 0; i < parseInt(data.cantidad_cuotas); i++) {
      const nuevaCuota = await Cuota.create(
        {
          numero_cuota: i + 1,
          planId: planCuotasId, // Dinámicamente asigna el ID de la entidad
          monto_cuota: monto_Cuota,
          fecha_cobro: fechasCobro[i],
          usuarioId: parseInt(cobradorId),
          estado: 'inpago',
        },
        { transaction }
      );
      cuotas.push(nuevaCuota);
    }

    return cuotas;
  } catch (error) {
    throw new Error(error.message || 'Error al crear las cuotas');
  }
};

/**************************************************** FIN DE LOS METODOS PARA PLAN *******************************************************/


/************************************** METODO PARA CREAR VENTA PERMUTADA CON CLIENTE REPORTE Y CUOTA **************************************************/

const crearVentaPermutadaNuevoCliente = async (req, res) => {
  const {
    apellido,
    nombre,
    direccion_comersial,
    direccion_hogar,
    dni,
    cuil,
    tarjeta,
    email,
    numero_telefono,
    apellido_familiar,
    nombre_familiar,
    situacion_veraz,

    //datos permutado
    nombrePer,
    objeto_recibido,
    valor_obj_recibido,
    objeto_entregado,
    monto_adicional_recibido,
    cant_cuotas_restantes,
    monto_cuota,
    productoId,
    tipo,

    //id de quien manda la venta
    vendedorId,
    cobradorId,
    reporteId,


    esNuevoCliente,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {
    let cliente

    // Paso 1: Crear o buscar cliente utilizando la transacción
    if (esNuevoCliente) {
      cliente = await crearCliente(req.body, transaction);
    } else {
      cliente = await Clientes.findOne({ where: { dni }, transaction });
      //prestamo con cliente ya existente!
      if (!cliente) {
        throw new Error('El cliente no existe. Verifique el DNI proporcionado.');
      }
    }

    // Paso 2: Crear préstamo o plan
    let Plan;


    Plan = await crearVentaPermutada(req.body, cliente.id, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!Plan) {
      throw new Error('No se pudo crear el plan, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (Plan) {
      console.log('Cuotas restantes:', Plan.cant_cuotas_restantes);
      if (Plan.cant_cuotas_restantes !== 0) {
        console.log("Ejecutando creación de cuotas...");
        await crearCuotasPermutado(req.body, Plan.id, transaction);
        console.log("Cuotas creadas exitosamente.");
      }


      // Paso 4: Actualizar el reporte
      await actualizarReporteVentaPermutada(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      cliente: cliente,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

//actualiza los datos del reporte correspondientes podria funcionar tambien para planes , hay que hacer calculos correctos todabia y actualizar lo mas posible
const actualizarReporteVentaPermutada = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const Valor_obj_recibido = parseInt(data.valor_obj_recibido);
    const Monto_adicional_recibido = parseInt(data.monto_adicional_recibido);
    const monto_Cuota = parseInt(data.monto_cuota);
    const Cant_cuotas_restantes = parseInt(data.cant_cuotas_restantes);
    const cobradorId = parseInt(data.cobradorId);
    const vendedorId = parseInt(data.vendedorId);
    const reporteId = parseInt(data.reporteId);



    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el plan*/

    //porcentaje a cobrar
    //porcentaje a pagar o sueldos

    const monto_a_cobrar = (monto_Cuota * Cant_cuotas_restantes);

    const comision = (Valor_obj_recibido + Monto_adicional_recibido) * 0.05; // 0.5% de comisión



    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }


    await reporte.update(
      {
        total: (reporte.total || 0) + Monto_adicional_recibido, //total termina siendo como lo que se tiene como el capital
        total_vendido: (reporte.total_vendido || 0) + 1,

        total_a_cobrar: (reporte.total_a_cobrar || 0) + monto_a_cobrar,//se suma todo lo que se ah prestado mas el interes
        total_sueldos: (reporte.total_sueldos || 0) + comision,//se suma a lo que hay que pagar o pagado ya el monto de la cuota al vender 
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

// Función para crear plan
const crearVentaPermutada = async (data, clienteId, transaction) => {
  const {
    nombrePer,
    objeto_recibido,
    valor_obj_recibido,
    objeto_entregado,
    monto_adicional_recibido,
    cant_cuotas_restantes,
    monto_cuota,
    productoId,
    tipo,

    //id de quien manda la venta
    vendedorId,
    reporteId,
  } = data;

  if (!nombrePer || !objeto_recibido || !valor_obj_recibido || !objeto_entregado || !vendedorId || !reporteId || !productoId) {
    throw new Error('Faltan datos obligatorios para crear el plan.');
  }

  const Valor_obj_recibido = parseInt(valor_obj_recibido);
  const Monto_adicional_recibido = parseInt(monto_adicional_recibido);
  const monto_Cuota = parseInt(monto_cuota);
  const Cant_cuotas_restantes = parseInt(cant_cuotas_restantes);
  const VendedorId = parseInt(vendedorId);
  const cobradorId = parseInt(data.cobradorId);
  const ReporteId = parseInt(reporteId);

  if (cant_cuotas_restantes != 0) {

    // 1. Buscar ventas permutadas activos del cliente
    const permutaCliente = await Venta_permutada.findAll({
      where: { clienteId },
      order: [["fecha_realizado", "DESC"]], // Ordenamos del más reciente al más antiguo
    });

    // 2. Si el cliente tiene algúna venta permutada activa
    const permutaActivo = permutaCliente.find((p) => p.estado === "pendiente");


    //los controles son al ultimo venta permutada otorgado
    if (permutaActivo) {
      // Verificar la instancia del cliente
      if (["atrasado", "refinanciado", "cobro judicial"].includes(permutaActivo.conducta_cliente)) {
        throw new Error(
          "No se puede otorgar un plan, el cliente tiene pagos pendientes o en proceso judicial."
        );
      }
    }


  }

  // 3. Verificar si ya existe un préstamo duplicado
  const fechaActual = new Date(); // Fecha actual para comparar
  const permutaDuplicado = await Venta_permutada.findOne({
    where: {
      clienteId,
      objeto_recibido,
      valor_obj_recibido: Valor_obj_recibido,
      objeto_entregado,
      fecha_realizado: fechaActual, // Comparar con la fecha actual
    },
    transaction,
  });

  if (permutaDuplicado) {
    throw new Error("Ya existe un préstamo con los mismos datos y fecha.");
  }


  const comision = (Valor_obj_recibido + Monto_adicional_recibido) * 0.05; // 0.5% de comisión

  const plan = await Venta_permutada.create(
    {

      nombre: nombrePer,
      objeto_recibido,
      valor_obj_recibido: Valor_obj_recibido,
      objeto_entregado,
      monto_adicional_recibido: Monto_adicional_recibido, //es la primera cuota pero hay que averiguar si hay que hacer algun calculo
      cant_cuotas_restantes: Cant_cuotas_restantes,
      comision_vendedor: comision,
      fecha_realizado: new Date(),


      clienteId,
      vendedorId: VendedorId,
      productoId,

    },
    { transaction }
  );

  return plan;
};
//crear cuotas
const crearCuotasPermutado = async (data, planCuotasId, transaction) => {
  try {
    // Validar el tipo de entidad y su ID
    if (!planCuotasId) {
      throw new Error('ID inválido. No se puede continuar.');
    }

    const cantidad_Cuotas = parseInt(data.cant_cuotas_restantes);
    const numero_de_Contraro = parseInt(data.numero_de_contraro);
    const monto_Cuota = parseInt(data.monto_cuota);
    const suscripcion_Inicial = parseInt(data.suscripcion_inicial);
    const VendedorId = parseInt(data.vendedorId);
    const cobradorId = parseInt(data.cobradorId);
    const ReporteId = parseInt(data.reporteId);



    // Validar datos obligatorios
    if (!data.monto_cuota || !data.cant_cuotas_restantes || !cobradorId || !data.tipo) {
      throw new Error('Datos insuficientes para generar las cuotas.');
    }


    const fechasCobro = calcularFechasCuotas(parseInt(data.cant_cuotas_restantes), data.tipo);

    // Crear cuotas según el tipo de entidad
    const cuotas = [];
    for (let i = 0; i < parseInt(data.cant_cuotas_restantes); i++) {
      const nuevaCuota = await Cuota.create(
        {
          numero_cuota: i + 1,
          permutadoId: planCuotasId, // Dinámicamente asigna el ID de la entidad
          monto_cuota: monto_Cuota,
          fecha_cobro: fechasCobro[i],
          usuarioId: parseInt(cobradorId),
          estado: 'inpago',
        },
        { transaction }
      );
      cuotas.push(nuevaCuota);
    }

    return cuotas;
  } catch (error) {
    throw new Error(error.message || 'Error al crear las cuotas');
  }
};


/**************************************************** FIN DE LOS METODOS PARA VENTA PERMUTADA *******************************************************/




//************************************** METODO PARA REGISTRAR VENTA DIRECTA **************************************************/

const crearVentaDirNuevoCliente = async (req, res) => {
  const {
    apellido,
    nombre,
    direccion_comersial,
    direccion_hogar,
    dni,
    cuil,
    tarjeta,
    email,
    numero_telefono,
    apellido_familiar,
    nombre_familiar,
    situacion_veraz,

    //datos venta directa
    nombreProd,
    objeto_en_venta,
    monto,
    metodoPago,
    productoId,

    //id de quien manda la venta
    vendedorId,
    reporteId,//cobrador

    esNuevoCliente,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {
    let cliente

    // Paso 1: Crear o buscar cliente utilizando la transacción
    if (esNuevoCliente) {
      cliente = await crearCliente(req.body, transaction);
    } else {
      cliente = await Clientes.findOne({ where: { dni }, transaction });
      //prestamo con cliente ya existente!
      if (!cliente) {
        throw new Error('El cliente no existe. Verifique el DNI proporcionado.');
      }
    }

    // Paso 2: Crear préstamo o plan
    let vtadir;



    vtadir = await crearVentaDir(req.body, cliente.id, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!vtadir) {
      throw new Error('No se pudo crear el plan, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (vtadir) {

      // Paso 4: Actualizar el reporte
      await actualizarReporteVentaDir(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      cliente: cliente,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

//actualiza los datos del reporte correspondientes podria funcionar tambien para planes , hay que hacer calculos correctos todabia y actualizar lo mas posible
const actualizarReporteVentaDir = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const cantidad_Cuotas = parseInt(data.cantidad_cuotas);
    const monto_Cuota = parseInt(data.monto_cuota);
    const suscripcion_Inicial = parseInt(data.suscripcion_inicial);
    const cobradorId = parseInt(data.cobradorId);

    const vendedorId = parseInt(data.vendedorId);
    const reporteId = parseInt(data.reporteId);







    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el plan*/


    //porcentaje a cobrar
    //porcentaje a pagar o sueldos

    const monto_venta = parseInt(data.monto);
    const comision = monto_venta * 0.005; // 0.5% de comisión


    const totalObtenido = monto_venta - comision;
    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }


    await reporte.update(
      {

        total_vendido: (reporte.total_vendido || 0) + 1,
        total: (reporte.total || 0) + totalObtenido, //total termina siendo como lo que se tiene como el capital
        total_sueldos: (reporte.total_sueldos || 0) + comision,
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

// Función para crear plan
const crearVentaDir = async (data, clienteId, transaction) => {
  const {
    //datos venta directa
    nombreProd,
    objeto_en_venta,
    monto,
    metodoPago,
    //id de quien manda la venta
    vendedorId,
    reporteId,//cobrador
    productoId
  } = data;

  if (!nombreProd || !objeto_en_venta || !monto || !metodoPago || !vendedorId || !reporteId || !productoId) {
    throw new Error('Faltan datos obligatorios para registrar la venta.');
  }

  const monto_venta = parseInt(monto);
  const comision = monto_venta * 0.05; // 0.5% de comisión

  const VendedorId = parseInt(vendedorId);
  const ReporteId = parseInt(reporteId);


  const plan = await Venta_directa.create(
    {

      nombre_objeto: nombreProd,
      monto: monto_venta,
      metodo_de_pago: metodoPago,
      fecha_y_hora: new Date(),
      objeto_en_venta: objeto_en_venta,
      comision_vendedor: comision,

      clienteId,
      vendedorId: VendedorId,
      reporteId: ReporteId,
      productoId,

    },
    { transaction }
  );

  return plan;
};

/**************************************************** FIN DE LOS METODOS PARA VENTA DIRECTA *******************************************************/


/**********************************crear producto con su reporte************************************************ */

//crea un nuevo producto
const crearProducto = async (req, res) => {
  const {
    nombre,
    descripcion,
    venta_directa_bandera,
    venta_permutada_bandera,
    accesorio_bandera,
    servicio_bandera,
    plan_bandera,
    plan_descripcion,
    cantidad_cuotas_plan,
    monto_cuotas_plan,
    entrega_pactada_bandera,
    cuotas_entrega_pactada,
    prestamo_bandera,
    tipo_cobranza_prestamo,
    monto_max_prestar,
    objetivo_ventas
  } = req.body;

  try {
    // Crear el nuevo producto
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      venta_directa_bandera,
      venta_permutada_bandera,
      accesorio_bandera,
      servicio_bandera,
      plan_bandera,
      plan_descripcion,
      cantidad_cuotas_plan,
      monto_cuotas_plan,
      entrega_pactada_bandera,
      cuotas_entrega_pactada,
      prestamo_bandera,
      tipo_cobranza_prestamo,
      monto_max_prestar,
      objetivo_ventas
    });

    // Guardar el producto en la base de datos
    await nuevoProducto.save();

    // Generar el reporte del producto creado
    const reporteProducto = await crearReporteProducto(nuevoProducto);

    return res.status(201).json({
      ok: true,
      msg: 'Producto creado exitosamente',
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear el producto',
    });
  }
};

// Función para generar un reporte de un producto específico
const crearReporteProducto = async (producto) => {
  try {
    //analizar si no conbiene poner aqui si es tipo plan o prestamo
    const reporte = await Reportes.create({
      fecha_inicio_periodo: new Date(),
      fecha_fin_periodo: new Date(),
      tipo: producto.nombre,
      total_ganancias: 0,
      total_perdidas: 0,
      total_gastos: 0,
      total_a_cobrar_dia: 0,
      total_vendido: 0,
      total_suscripciones: 0,
      total: 0,
      total_a_prestar: 0,//este valor se pide en reportes editar
      objetivo_ventas_plan: 0,//al igual que este
      total_prestado: 0,
      total_a_cobrar: 0,
      total_sueldos: 0,
      porcentaje_ganancias: 0,
      porcentaje_perdida: 0,
      porcentaje_a_cobrar: 0,
      porcentaje_a_pagar: 0,
      porcentaje_gastos: 0,
      porcentajes_anteriores: {},
    });

    return reporte;
  } catch (error) {
    console.error('Error al crear el reporte:', error);
    throw error; // Relanzamos el error para manejarlo en la función principal
  }
};

const editarReporte = async (req, res) => {
  try {
    let reporte = await Reportes.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!reporte) {
      return res.status(404).json({
        ok: false,
        msg: "No existe ningun reporte con este Id",
        producto,
      });
    }

    await reporte.update(req.body); // Actualiza todos los campos de la tabla, incluido la contraseña si está presente

    res.status(200).json({
      ok: true,
      msg: 'reporte editado',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

/************************************************************************************************************** */


//************************************** METODO PARA REGISTRAR VENTA SERVICIOS Y ACTUALIZAR REPORTE **************************************************/

const crearVentaServicioYreporte = async (req, res) => {
  const {
    productoId,
    reporteId,
    servicio,
    monto,
    vendedor,
    metodoPago,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {

    // Paso 2: Crear préstamo o plan
    let vtadir;


    vtadir = await crearVentaServicio(req.body, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!vtadir) {
      throw new Error('No se pudo registrar la venta del servicio, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (vtadir) {

      // Paso 4: Actualizar el reporte
      await actualizarReporteAccesorioServicios(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Venta registrada exitosamente',
      sercicio: vtadir,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

// Función para crear plan
const crearVentaServicio = async (data, transaction) => {
  const {
    productoId,
    reporteId,
    servicio,
    monto,
    vendedor,
    metodoPago,
  } = data;

  if (!servicio || !monto || !metodoPago || !vendedor || !reporteId || !productoId) {
    throw new Error('Faltan datos obligatorios para registrar la venta.');
  }

  const monto_venta = parseInt(monto);
  const comision = monto_venta * 0.05; // 0.5% de comisión

  const VendedorId = parseInt(vendedor);
  const ReporteId = parseInt(reporteId);


  const plan = await Servicios.create(
    {

      nombre_servicio: servicio,
      monto: monto_venta,
      nombre_vendedor: vendedor,
      metodo_de_pago: metodoPago,
      fecha_y_hora: new Date(),

      //vendedorId: VendedorId,//se lo podria calcular automaticamente
      reporteId: ReporteId,
      productoId,

    },
    { transaction }
  );

  return plan;
};

/**************************************************** FIN DE LOS METODOS PARA VENTA SERVICIOS *******************************************************/

const actualizarReporteAccesorioServicios = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const monto = parseInt(data.monto);
    const reporteId = parseInt(data.reporteId);







    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el plan*/


    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    //const comision = monto * 0.005; // 0.5% de comisión


    //const totalObtenido= monto_venta - comision;
    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }


    await reporte.update(
      {


        total: (reporte.total || 0) + monto, //total termina siendo como lo que se tiene como el capital
        // total_sueldos: (reporte.total_sueldos || 0) + comision,
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

//************************************** METODO PARA REGISTRAR VENTA ACCESORIOS Y ACTUALIZAR REPORTE **************************************************/

const crearVentaAccesoriosYreporte = async (req, res) => {
  const {
    productoId,
    reporteId,
    accesorio,
    monto,
    vendedor,
    metodoPago,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {

    // Paso 2: Crear préstamo o plan
    let vtadir;


    vtadir = await crearVentaAccesorio(req.body, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!vtadir) {
      throw new Error('No se pudo registrar la venta del servicio, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (vtadir) {

      // Paso 4: Actualizar el reporte
      await actualizarReporteAccesorioServicios(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      acc: vtadir,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

// Función para crear plan
const crearVentaAccesorio = async (data, transaction) => {
  const {
    productoId,
    reporteId,
    accesorio,
    monto,
    vendedor,
    metodoPago,
  } = data;

  if (!accesorio || !monto || !metodoPago || !vendedor || !reporteId || !productoId) {
    throw new Error('Faltan datos obligatorios para registrar la venta.');
  }

  const monto_venta = parseInt(monto);
  const comision = monto_venta * 0.05; // 0.5% de comisión

  const VendedorId = parseInt(vendedor);
  const ReporteId = parseInt(reporteId);


  const plan = await Accesorios.create(
    {

      nombre_accesorio: accesorio,
      monto: monto_venta,
      nombre_vendedor: vendedor,
      metodo_de_pago: metodoPago,
      fecha_y_hora: new Date(),

      //vendedorId: VendedorId,//se lo podria calcular automaticamente
      reporteId: ReporteId,
      productoId,

    },
    { transaction }
  );

  return plan;
};

/**************************************************** FIN DE LOS METODOS PARA VENTA ACCESORIOS *******************************************************/

//************************************** METODO PARA REGISTRAR GASTOS Y ACTUALIZAR REPORTE **************************************************/

const RegGastosYreporte = async (req, res) => {
  const {
    reporteId,
    monto,
    descripcion

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {

    // Paso 2: Crear préstamo o plan
    let vtadir;


    vtadir = await crearGastos(req.body, transaction);


    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!vtadir) {
      throw new Error('No se pudo registrar la venta del servicio, Operación cancelada.');
    }

    //paso 3 crear cuotas
    if (vtadir) {

      // Paso 4: Actualizar el reporte
      await actualizarReporteGastos(req.body, transaction);
    } else {
      // Verificar si el planCuotas se creó correctamente
      throw new Error('El plan de cuotas no pudo ser creado. Operación cancelada.');

    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cliente creado exitosamente',
      gastos: vtadir,
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al crear el cliente',
    });
  }
};

//actualiza los datos del reporte correspondientes podria funcionar tambien para planes , hay que hacer calculos correctos todabia y actualizar lo mas posible
const actualizarReporteGastos = async (data, transaction) => {
  try {
    const { monto_prestado, interes_agregado } = data;

    const monto = parseInt(data.monto);
    const reporteId = parseInt(data.reporteId);







    // Validación de que reporteId existe y es un número válido
    if (isNaN(reporteId)) {
      throw new Error('No se proporcionó un ID de reporte para actualizar.');
    }

    //total gastos(aparte)
    //total a cobrar al dia (cuando se carga el periodo y ver si es un dato fijo en la db)
    //total (nos e todabia no se usa pero se podria utilizar para capital)
    //porcentaje gastos
    //porcentaje anteriores(quisas al cargar)

    /*se calcula al cobrar las cuotas o rendicion*/
    //total ganancias (cuando se supera el monto que se presto)
    //total perdida (cuando no se pagan las cuotas definitivamente)
    //total a cobrar
    //total sueldos
    //porcentaje de ganancia
    //porcentaje perdida
    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    /*se calcula al crear el plan*/


    //porcentaje a cobrar
    //porcentaje a pagar o sueldos


    //const comision = monto * 0.005; // 0.5% de comisión


    //const totalObtenido= monto_venta - comision;
    // Actualizar el reporte
    const reporte = await Reportes.findOne({ where: { id: reporteId }, transaction });


    if (!reporte) {
      throw new Error('Reporte no encontrado.');
    }


    await reporte.update(
      {

        total_gastos: (reporte.total || 0) + monto, //total termina siendo como lo que se tiene como el capital
        // total_sueldos: (reporte.total_sueldos || 0) + comision,
      },
      { transaction }
    );

    return reporte;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

// Función para crear plan
const crearGastos = async (data, clienteId, transaction) => {
  const {
    reporteId,
    monto,
    descripcion,
  } = data;

  if (!descripcion || !monto || !reporteId) {
    throw new Error('Faltan datos obligatorios para registrar el gasto.');
  }

  const monto_gasto = parseInt(monto);
  const ReporteId = parseInt(reporteId);


  const plan = await Gastos.create(
    {

      descripcion_gasto: descripcion,
      Monto_gasto: monto_gasto,
      fecha: new Date(),

      //vendedorId: VendedorId,//se lo podria calcular automaticamente
      reporteId: ReporteId,

    },
    { transaction }
  );

  return plan;
};

/**************************************************** FIN DE LOS METODOS PARA GASTOS *******************************************************/

//************************************** METODO PARA COBRANZA DE CUOTAS Y CREACION DE RENDICION **************************************************/

const cobroCuotaRendicion = async (req, res) => {
  const {
    cuotaId,
    cat,
    reporteId,
    estado,
    cobradoId,
    comentario,
    metodoPago,
    monto_cobrado,
    fecha_cobro,
    nombrecli,
    apecli,
    nombreProd,
    productId,

  } = req.body

  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {

    // Paso 2: Crear préstamo o plan
    let cuota;
    
    cuota = await cobroCuota(req.body, transaction);
    console.log('cuota despues de realizar cobro', cuota)

    // Asegúrate de manejar el caso donde no se pudo crear ninguna entidad
    if (!cuota) {
      throw new Error('No se pudo registrar la venta del servicio, Operación cancelada.');
    }

    //verficar estado prestamo-plan-ventapermutada
     await actualizarEstadosConductas(cat, productId,cuota, transaction);

     
    //paso 3 crear cuotas
    if (cuota.estado === 'pago' || (cuota.estado === 'pendiente' && monto_cobrado != 0)) {
      // Buscar si ya existe una rendición con el mismo cobradorId y estado "pendiente"
      console.log('Buscando rendición con:', { cobradorId: cobradoId, estado: false });

      let rendicionExistente = await Rendicion.findOne({
        where: {
          cobradorId: cobradoId,
          estado: false
        }
      });
      
      
      console.log('Rendición encontrada:', rendicionExistente);
      if (rendicionExistente) {
        // Si existe y está pendiente, actualizar la rendición
        await actualizarRendicion(rendicionExistente.id, req.body,cuota, transaction);
      } else {
        // Si no existe una rendición pendiente, crear una nueva
        await crearRendicion(req.body, cuota,cobradoId, transaction);
      }
    }
    // Aquí puedes incluir otros pasos, como crear un plan o cuotas, usando la misma transacción.
    // Ejemplo:
    // const plan = await crearPlan(nuevoCliente.id, datosPlan, transaction);

    // Si todo salió bien, confirmamos la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cuota actualizada exitosamente',
      cuota
      // plan,
    });
  } catch (error) {
    // Si ocurre un error, revertimos la transacción
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message || 'Error al actualizar cuota',
    });
  }
};

const cobroCuota = async (data, transaction) => {
  try {
    const { cat, productId } = data;

    const montoCobrado = parseInt(data.monto_cobrado);
    const cuotaId = parseInt(data.cuotaId);

    // Validación de que reporteId existe y es un número válido
    if (!cuotaId || isNaN(cuotaId)) {
      throw new Error("El ID de la cuota es inválido o no fue proporcionado.");
    }

    //const comision = monto * 0.005; // 0.5% de comisión

    //const totalObtenido= monto_venta - comision;
    // FALTA METODO PARA VER DE NO PAGAR UNA CUOTA INCORRECTA
    const cuota = await Cuota.findOne({ where: { id: cuotaId }, transaction });
    

    if (!cuota) {
      throw new Error('Cuota no encontrada.');
    }

     // Verificar que no se esté cobrando en desorden
     await validarOrdenCuotas(cat, productId, cuota, transaction);
  

    // Obtener el saldo pendiente actual
    const saldoPendiente = parseFloat(cuota.monto_cuota); // Suponiendo que cuota.monto es el total de la cuota
    let nuevoSaldo = saldoPendiente;

    if (montoCobrado > saldoPendiente) {
      throw new Error("El monto ingresado supero al monto de la cuota.");
    }


    // Si el monto cobrado es menor al total de la cuota, actualizar saldo pero mantener estado pendiente
    if (data.estado === "pendiente" && montoCobrado < saldoPendiente) {

      nuevoSaldo = saldoPendiente - montoCobrado; // Calcular el saldo restante
      
    }

    if (montoCobrado === saldoPendiente && data.estado!=="no pago") {
      data.estado = "pago"
    }

    await cuota.update(
      {
        metodo_pago: data.metodoPago,
        comentario: data.comentario,
        estado: data.estado,
        monto_cuota: nuevoSaldo,
        fecha_cobrada: data.estado === "pago" ? new Date() : cuota.fecha_cobrada, // Si se paga todo, actualizar fecha de cobro
        fecha_cobro: data.estado === "pendiente" ? new Date(`${data.fecha_cobro}T00:00:00`) : cuota.fecha_cobro,
        //falta calculo por si paga alogo de la cuota
      },
      { transaction }
    );

    return cuota;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el reporte del préstamo.');
  }
};

const validarOrdenCuotas = async (cat, productId, cuotaActual, transaction) => {
  let filtro = {};

  // Determinar el campo adecuado según la categoría
  switch (cat) {
    case "Préstamo":
      filtro.prestamoId = productId;
      break;
    case "Plan":
      filtro.planId = productId;
      break;
    case "Venta Permutada":
      filtro.permutadoId = productId;
      break;
    default:
      throw new Error("Categoría no válida: " + cat);
  }

  // Obtener todas las cuotas anteriores a la actual
  const cuotasAnteriores = await Cuota.findAll({
    where: {
      ...filtro,
      numero_cuota: { [Op.lt]: cuotaActual.numero_cuota }, // Cuotas con número menor
      estado: "inpago" // Solo cuotas que aún no se han pagado
    },
    transaction
  });

  // Verificar si hay alguna cuota anterior que no esté pagada
  const cuotaImpaga = cuotasAnteriores.find(c => c.estado === "inpago");

  if (cuotaImpaga) {
    throw new Error(`No se puede cobrar la cuota ${cuotaActual.numero_cuota} porque la cuota ${cuotaImpaga.numero_cuota} aún está en estado 'inpago'.`);
  }
};

const crearRendicion = async (data, cuota,cobradoId, transaction) => {
  if (!cuota || !data.metodoPago || !data.nombrecli || !data.apecli || !data.cat || !data.nombreProd) {
    throw new Error('Faltan datos obligatorios para crear la rendición.');
  }

  // Asegurarnos de usar el campo correcto
  const montoCocuota = parseInt(cuota.monto_cuota);  // Aquí corregido

  let monto = 0;

  if (cuota.estado === 'pago') {
    monto = parseInt(cuota.monto_cuota);  // Aquí corregido
  } else {
    monto = parseInt(data.monto_cobrado); // en caso de que el estado de cuota sea pendiente
    
  }

  console.log('Monto de cuota:', cuota.monto_cuota); // Depuración

  if (isNaN(monto)) {
    throw new Error(`Error: El monto calculado es NaN. monto_cuota: ${cuota.monto_cuota}, monto_cobrado: ${data.monto_cobrado}`);
  }

  const rend = await Rendicion.create(
    {
      monto_rendir: monto,
      datos_de_cuotas: [
        {
          numero_cuota: cuota.numero_cuota,
          monto: monto,  // Aquí corregido
          cliente: `${data.nombrecli} ${data.apecli}`,
          metodo_pago: data.metodoPago,
          categoria: data.cat,
          nombre: data.nombreProd,
          reporteId:data.reporteId
        }
      ],
      cobradorId: cobradoId,
    },
    { transaction }
  );

  return rend;
};

const actualizarRendicion = async (rendicionId, data, cuota, transaction) => {
  try {
    const rendId = parseInt(rendicionId);

    // Validación de que reporteId existe y es un número válido
    if (isNaN(rendId)) {
      throw new Error('No se proporcionó un ID de reporte válido para actualizar.');
    }

    const rend = await Rendicion.findOne({ where: { id: rendId }, transaction });

    if (!rend) {
      throw new Error('Reporte no encontrado.');
    }

    console.log('nombre cliente :', data.nombrecli,data.apecli,data.cat,data.nombreprod)

    if (!cuota || !data.nombrecli || !data.apecli || !data.cat || !data.nombreProd) {
      throw new Error('Faltan datos obligatorios para actualizar la rendición.');
    }

    let monto = 0;

    // Validar si cuota.monto_Cuota y data.monto_cobrado son números válidos
    const montoCuota = parseInt(cuota.monto_cuota);
    const montoCobrado = parseInt(data.monto_cobrado);

    if (cuota.estado === 'pago') {
      monto = montoCuota;
    } else {
      monto = montoCobrado || 0;
    }

    if (isNaN(monto) || monto < 0) {
      throw new Error('El monto a rendir no es válido.');
    }

    await rend.update(
      {
        monto_rendir: (rend.monto_rendir || 0) + monto,
        datos_de_cuotas: [
          ...(rend.datos_de_cuotas || []), // Mantiene las cuotas anteriores
          {
            numero_cuota: cuota.numero_cuota,
            monto: montoCuota,
            cliente: `${data.nombrecli} ${data.apecli}`,
            metodo_pago: data.metodoPago,
            categoria: data.cat,
            nombre: data.nombreprod,
            reporteId:data.reporteId
          }
        ]
      },
      { transaction }
    );

    return rend;
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar la rendición.');
  }
};

const actualizarEstadosConductas = async (cat, productId,cuota, transaction) => {
  try {
      // ✅ Validar categoría y obtener las cuotas
      const cuotas = await obtenerCuotasPorCategoria(cat, productId, transaction);
      console.log("🔍 Cuotas encontradas:", cuotas.length);
  
      if (!cuotas || cuotas.length === 0) {
        throw new Error("No se encontraron cuotas para este producto.");
      }
  
      // 📊 Contar cuotas según su estado
      const cuotasPagadas = cuotas.filter(cuota => cuota.estado === "pago").length;
      const cuotasNoPagadas = cuotas.filter(cuota => cuota.estado === "no pago").length;
  
      console.log("🔹 Cuotas pagadas:", cuotasPagadas);
      console.log("🔹 Cuotas no pagadas:", cuotasNoPagadas);
  
      // 🔄 Determinar nuevo estado y nueva conducta
      let nuevoEstado;
      let nuevaConducta;
  
      // Encontrar el número de la última cuota en la BD
const maxNumeroCuota = Math.max(...cuotas.map(c => c.numero_cuota));

      // Verificar si la última cuota se ha pagado (en este ciclo de transacción)
      const ultimaCuota = cuotas[cuotas.length - 1];
      if (cuota.estado === "pago" && cuota.numero_cuota === cuotas.length) {
        console.log(cuota.numero_cuota, cuotas.length)
        nuevoEstado = "cancelado";
        nuevaConducta = "al dia";
      } else if (cuotasNoPagadas >= 14) {//lo mismo 14 pero podriamos ver otro metodo para verificar mejor el tiempo
        nuevoEstado = "caducado";
        nuevaConducta = "cobro judicial";
      } else if (cuotasNoPagadas >= 2) { //le bajaria a uno asi el sistema detecta 2 por que en transaccion no detecta la actual 
        nuevoEstado = "pendiente";
        nuevaConducta = "atrasado";
      } else {
        nuevoEstado = "pendiente";
        nuevaConducta = "al dia";
      }

    console.log("🔹 Nuevo estado:", nuevoEstado);
    console.log("🔹 Nueva conducta:", nuevaConducta);

    // 🔄 Llamar al método de actualización dependiendo de la categoría
    let producto;

    switch (cat) {
      case "Préstamo":
        // Llamar a la función de actualización para el préstamo
        producto = await actualizarPrestamo(productId, nuevoEstado, nuevaConducta, transaction);
        console.log("Reporte actualizado:", producto);
        break;
      
      case "Plan":
        // Aquí actualizas el plan (si existe la lógica para ello)
        producto = await actualizarPlan(productId, nuevoEstado, nuevaConducta, transaction);
        console.log("Reporte actualizado:", producto);
        break;
      
      case "Venta Permutada":
        producto = await actualizarVentaPermutada(productId, nuevoEstado, nuevaConducta, transaction);
        console.log("Reporte actualizado:", producto);
        break;

      default:
        throw new Error("❌ Categoría no válida: " + cat);
    }

    if (!producto) {
      throw new Error('❌ No se encontró el producto');
    }

    console.log("🔹 Campo a actualizar:", nuevaConducta);
    return producto;  // Retorna el producto actualizado

  } catch (error) {
    console.error("❌ Error al actualizar el estado:", error.message);
    throw new Error("Error al actualizar el estado: " + error.message);
  }
};

const actualizarPrestamo = async (productId, nuevoEstado, nuevaConducta, transaction) => {
  try {
    const prodId = parseInt(productId);

    if (isNaN(prodId)) {
      throw new Error('No se proporcionó un ID de préstamo válido para actualizar.');
    }

    if (!nuevoEstado || !nuevaConducta) {
      throw new Error('Estado o conducta no pueden estar vacíos.');
    }

    console.log('productId recibido:', productId);
console.log('prodId convertido:', prodId);

    const pres = await  Prestamos.findOne({ where: { id: productId }, transaction });

    if (!pres) {
      throw new Error('Reporte no encontrado.');
    }

    await pres.update(
      {
        instancia_cliente: nuevaConducta,
        estado: nuevoEstado
      },
      { transaction }
    );

    return pres;
  } catch (error) {
    throw new Error(`Error al actualizar el reporte del préstamo: ${error.message}`);
  }
};

const actualizarPlan = async (productId, nuevoEstado, nuevaConducta, transaction) => {
  try {
    const prodId = parseInt(productId);

    if (isNaN(prodId)) {
      throw new Error('No se proporcionó un ID de préstamo válido para actualizar.');
    }

    if (!nuevoEstado || !nuevaConducta) {
      throw new Error('Estado o conducta no pueden estar vacíos.');
    }

    console.log('productId recibido:', productId);
console.log('prodId convertido:', prodId);

    const pres = await  Plan.findOne({ where: { id: productId }, transaction });

    if (!pres) {
      throw new Error('Reporte no encontrado.');
    }

    await pres.update(
      {
        conducta_cliente: nuevaConducta,
        estado: nuevoEstado
      },
      { transaction }
    );

    return pres;
  } catch (error) {
    throw new Error(`Error al actualizar el reporte del préstamo: ${error.message}`);
  }
};

const actualizarVentaPermutada = async (productId, nuevoEstado, nuevaConducta, transaction) => {
  try {
    const prodId = parseInt(productId);

    if (isNaN(prodId)) {
      throw new Error('No se proporcionó un ID de préstamo válido para actualizar.');
    }

    if (!nuevoEstado || !nuevaConducta) {
      throw new Error('Estado o conducta no pueden estar vacíos.');
    }

    console.log('productId recibido:', productId);
console.log('prodId convertido:', prodId);

    const pres = await  Venta_permutada.findOne({ where: { id: productId }, transaction });

    if (!pres) {
      throw new Error('Reporte no encontrado.');
    }

    await pres.update(
      {
        conducta_cliente: nuevaConducta,
        estado: nuevoEstado
      },
      { transaction }
    );

    return pres;
  } catch (error) {
    throw new Error(`Error al actualizar el reporte del préstamo: ${error.message}`);
  }
};

const obtenerCuotasPorCategoria = async (cat, productId, transaction) => {
  try {
      let whereCondition = {};

      switch (cat) {
          case "Préstamo":
              whereCondition.prestamoId = productId;
              break;
          case "Plan":
              whereCondition.planId = productId;
              break;
          case "Venta Permutada":
              whereCondition.permutadoId = productId;
              break;
          default:
              throw new Error("Categoría no válida");
      }

      const cuotas = await Cuota.findAll({
          where: whereCondition
          
      },
      { transaction });

      if (!cuotas.length) {
          console.warn(`⚠️ No se encontraron cuotas para ${cat} con ID ${productId}`);
          return [];
      }

      return cuotas;
  } catch (error) {
      console.error("❌ Error al obtener las cuotas:", error);
      throw error;
  }
};

/**************************************************** FIN DE LOS METODOS PARA COBRANZA DE CUOTAS *******************************************************/


/**************************************************** COBRO RENDICION Y ACTUALIZACION REPORTE *******************************************************/

//confirmar rendicion
const confirmararRendicion = async (req, res) => {
  try {
    // Buscar la rendición por su ID
    let rendicion = await Rendicion.findByPk(req.body.id); // Ajusta según el ORM

    // Verificar si la rendición existe
    if (!rendicion) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe ninguna rendición con este ID',
      });
    }

    // Verificar si ya está habilitada
    if (rendicion.estado) {
      return res.status(400).json({
        ok: false,
        msg: 'La rendición ya ha sido habilitada anteriormente.',
      });
    }
    console.log("id de la rendicion",req.body.id)

    // Agrupar cuotas por reporteId
    const reportesMap = {};

rendicion.datos_de_cuotas.forEach((cuota) => {
    const { reporteId, monto } = cuota;

    if (!reporteId || isNaN(Number(reporteId))) {
        console.error("Error: reporteId inválido en cuota", cuota);
        return;
    }

    if (!reportesMap[reporteId]) {
        reportesMap[reporteId] = {
            totalCobrado: 0,
            totalACobrar: 0,
        };
    }

    reportesMap[reporteId].totalCobrado += monto;
    reportesMap[reporteId].totalACobrar += monto;
});

// Actualizar cada reporte en la base de datos
for (const reporteId in reportesMap) {
    const reporteIdNum = Number(reporteId);
    
    if (isNaN(reporteIdNum)) {
        console.error("Error: reporteId no es un número válido", reporteId);
        continue;
    }

    console.log(`Actualizando Reporte ID: ${reporteIdNum} - total_a_cobrar: ${reportesMap[reporteId].totalACobrar}, total: ${reportesMap[reporteId].totalCobrado}`);

    await Reportes.update(
        {
            total_a_cobrar: sequelize.literal(`total_a_cobrar - ${reportesMap[reporteId]?.totalACobrar || 0}`),
            total: sequelize.literal(`total + ${reportesMap[reporteId]?.totalCobrado || 0}`)
        },
        { where: { id: reporteIdNum } }
    );
}

    // Habilitar la rendición
    rendicion.estado = true;
    rendicion.fecha_y_hora = new Date().toISOString().split('T')[0]; // Guarda solo la fecha en formato YYYY-MM-DD
    await rendicion.save();

    res.status(200).json({
      ok: true,
      msg: 'Rendición habilitada y reportes actualizados correctamente.',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};

/*************************************************** FIN COBRO RENDICION Y ACTUALIZACION REPORTE **************************************************/


//editar datos cliente
const editarCliente = async (req, res) => {
  try {
    let cliente = await Clientes.findByPk(req.body.id); // Utiliza findByPk para buscar un cliente por su ID

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        msg: "No existe ningun cliente con este Id",
        cliente,
      });
    }

    await cliente.update(req.body);

    res.status(200).json({
      ok: true,
      msg: 'cliente editado',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

const editarUsuario = async (req, res) => {
  try {
    let usuario = await Usuario.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "No existe ningun usuario con este Id",
        usuario,
      });
    }

    // Solo actualizar la contraseña si se proporciona
    if (req.body.contraseña) {
      // Aquí deberías encriptar la nueva contraseña antes de actualizarla
      req.body.contraseña = await bcryptjs.hash(req.body.contraseña, 10);
    }

    await usuario.update(req.body); // Actualiza todos los campos de la tabla, incluido la contraseña si está presente

    res.status(200).json({
      ok: true,
      msg: 'usuario editado',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};


const editarProducto = async (req, res) => {
  try {
    let producto = await Producto.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!producto) {
      return res.status(404).json({
        ok: false,
        msg: "No existe ningun producto con este Id",
        producto,
      });
    }

    await producto.update(req.body); // Actualiza todos los campos de la tabla, incluido la contraseña si está presente

    res.status(200).json({
      ok: true,
      msg: 'producto editado',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

//quita acceso a empleados
const inhabilitarProducto = async (req, res) => {

  try {
    let productoActivo = await Producto.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!productoActivo) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe ningun producto con este Id',
      });
    }

    productoActivo.estado_producto = false;

    await productoActivo.save();

    res.status(200).json({
      ok: true,
      msg: 'producto inactivo',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

//quita acceso a empleados
const habilitarProducto = async (req, res) => {

  try {
    //const usuarioInactivo = await Usuario.findById(req.body.id);
    let productoInactivo = await Producto.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!productoInactivo) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe ningun producto con este Id',
      });
    }

    productoInactivo.estado_producto = true;

    await productoInactivo.save();

    res.status(200).json({
      ok: true,
      msg: 'producto nuevamente activo',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

//cargara todos los usuarios (empleados) de la DB
const cargarUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios excepto los que tienen rol "creator"
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Rol, // Incluye información del rol asociado
          as: 'rol', // Usa el alias definido en la relación
          attributes: ['nombre'], // Solo incluye el nombre del rol
          where: {
            nombre: { [Op.ne]: 'creator' }, // Excluye los roles con el nombre "creator"
          },
        },
      ],
      attributes: { exclude: ['contraseña'] }, // Excluye la contraseña de los resultados
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron usuarios registrados.',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'Usuarios cargados exitosamente.',
      usuarios,
    });
  } catch (error) {
    console.error('Error al cargar los usuarios:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los usuarios. Contacte al administrador.',
    });
  }
};

// Cargará solo los usuarios con el rol "cobrador" (ID de rol: 6)
const cargarUsuariosCobrador = async (req, res) => {
  try {
    // Obtener solo los usuarios con ID de rol 6
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Rol, // Incluye información del rol asociado
          as: 'rol', // Usa el alias definido en la relación
          attributes: ['nombre'], // Solo incluye el nombre del rol
          where: {
            id: 6, // Filtra por el ID de rol igual a 6
          },
        },
      ],
      attributes: { exclude: ['contraseña'] }, // Excluye la contraseña de los resultados
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron usuarios con el rol de cobrador.',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'Usuarios cobradores cargados exitosamente.',
      usuarios,
    });
  } catch (error) {
    console.error('Error al cargar los usuarios cobradores:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los usuarios cobradores. Contacte al administrador.',
    });
  }
};

//cargara todos los usuarios (empleados) de la DB
const cargarClientes = async (req, res) => {
  try {
    // Obtener todos los productos con sus atributos completos
    const clientes = await Clientes.findAll();

    if (!clientes || clientes === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron clientes registrados.',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'clientes cargados exitosamente.',
      clientes,
    });
  } catch (error) {
    console.error('Error al cargar los clientes:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los productos. Contacte al administrador.',
    });
  }
};


const cargarRoles = async (req, res) => {
  try {
    // Obtener todos los roles excepto el rol "creator"
    const roles = await Rol.findAll({
      where: {
        nombre: { [Op.ne]: 'creator' }, // Excluye el rol "creator"
      },
      attributes: ['id', 'nombre'], // Incluye solo los atributos necesarios
    });

    if (!roles || roles.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron roles registrados.',
      });
    }

    // Si el usuario tiene rol 'admin', excluimos el rol 'gerente'
    const userRole = req.rol; // Aquí obtienes el rol del usuario desde la autenticación

    if (userRole === 'admin') {
      // Excluir el rol "gerente" de los roles
      const filteredRoles = roles.filter(role => role.nombre !== 'gerente');
      return res.status(200).json({
        ok: true,
        msg: 'Roles cargados exitosamente.',
        roles: filteredRoles,
      });
    }

    // Si no es admin, devolver todos los roles
    res.status(200).json({
      ok: true,
      msg: 'Roles cargados exitosamente.',
      roles,
    });

  } catch (error) {
    console.error('Error al cargar los roles:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los roles. Contacte al administrador.',
    });
  }
};


//quita acceso a empleados
const inhabilitarUsuario = async (req, res) => {

  try {
    let usuarioActivo = await Usuario.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!usuarioActivo) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe ningun usuario con este Id',
      });
    }

    usuarioActivo.estado_acceso = false;

    await usuarioActivo.save();

    res.status(200).json({
      ok: true,
      msg: 'usuario deshabilitado',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

//quita acceso a empleados
const habilitarUsuario = async (req, res) => {

  try {
    //const usuarioInactivo = await Usuario.findById(req.body.id);
    let usuarioInactivo = await Usuario.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

    if (!usuarioInactivo) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe ningun usuario con este Id',
      });
    }

    usuarioInactivo.estado_acceso = true;

    await usuarioInactivo.save();

    res.status(200).json({
      ok: true,
      msg: 'usuario nuevamente activo',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'hable con el administrador',
    });
  }
};

// Cargar todos los productos
const cargarProductos = async (req, res) => {
  try {
    // Obtener todos los productos con sus atributos completos
    const productos = await Producto.findAll();

    if (!productos || productos.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron productos registrados.',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'Productos cargados exitosamente.',
      productos,
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los productos. Contacte al administrador.',
    });
  }
};

// Cargar todos los Reportes
const cargarReportes = async (req, res) => {
  try {
    // Obtener todos los productos con sus atributos completos
    const reportes = await Reportes.findAll();

    if (!reportes || reportes.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron reportes registrados.',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'reportes cargados exitosamente.',
      reportes,
    });
  } catch (error) {
    console.error('Error al cargar los reportes:', error);
    res.status(500).json({
      ok: false,
      msg: 'Ocurrió un error al cargar los reportes. Contacte al administrador.',
    });
  }
};
//carga las rendiciones que haya 
const cargarRendiciones = async (req, res) => {
  try {
    // Obtener todas las rendiciones de la base de datos
    const rendiciones = await Rendicion.findAll();

    // Si no se encontraron rendiciones, devolver un mensaje
    if (!rendiciones || rendiciones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron rendiciones.' });
    }

    // Por cada rendición, buscar el usuario relacionado (cobrador)
    for (let rendicion of rendiciones) {
      const cobrador = await Usuario.findOne({
        where: { id: rendicion.cobradorId }, // Buscar al cobrador por ID
        attributes: ['nombres', 'apellido'] // Campos que queremos obtener del cobrador
      });

      // Si encontramos un cobrador, agregar sus datos a la rendición
      if (cobrador) {
        rendicion.dataValues.cobrador = cobrador; // Agregar el objeto cobrador a la rendición
      }
    }

    // Devolver directamente las rendiciones sin envolverlas en un objeto
    return res.status(200).json(rendiciones); // Cambio aquí
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener rendiciones:', error);
    return res.status(500).json({ error: 'Error al obtener las rendiciones.' });
  }
};


const obtenerProductosClienteCuotas = async (req, res) => {
  try {
    const { clienteId } = req.params;

    // 1. Buscar todos los productos del cliente
    const prestamos = await Prestamos.findAll({ where: { clienteId } });
    const planes = await Plan.findAll({ where: { clienteId } });
    const ventasPermutadas = await Venta_permutada.findAll({ where: { clienteId } });
    const ventasDirectas = await Venta_directa.findAll({ where: { clienteId } }); // No tiene cuotas

    // 2. Obtener IDs de los productos encontrados
    const prestamosIds = prestamos.map(p => p.id);
    const planesIds = planes.map(p => p.id);
    const ventasPermutadasIds = ventasPermutadas.map(vp => vp.id);

    // 3. Buscar cuotas relacionadas con esos productos
    const cuotas = await Cuota.findAll({
      where: {
        // Buscar cuotas que tengan prestamoId, planId o ventaPermutadaId
        [Op.or]: [
          { prestamoId: prestamosIds.length ? prestamosIds : null },
          { planId: planesIds.length ? planesIds : null },
          { permutadoId: ventasPermutadasIds.length ? ventasPermutadasIds : null }
        ]
      }
    });

    // 4. Agrupar cuotas por producto
    const cuotasPorProducto = cuotas.reduce((acc, cuota) => {
      const key = cuota.prestamoId || cuota.planId || cuota.ventaPermutadaId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(cuota);
      return acc;
    }, {});

    // 5. Construir la respuesta final (usaremos cat para categoria)
    const productos = [
      ...prestamos.map(prestamo => ({
        cat: 'Préstamo',
        ...prestamo.toJSON(),
        cuotas: cuotasPorProducto[prestamo.id] || []
      })),
      ...planes.map(plan => ({
        cat: 'Plan',
        ...plan.toJSON(),
        cuotas: cuotasPorProducto[plan.id] || []
      })),
      ...ventasPermutadas.map(venta => ({
        cat: 'Venta Permutada',
        ...venta.toJSON(),
        cuotas: cuotasPorProducto[venta.id] || []
      })),
      ...ventasDirectas.map(venta => ({
        cat: 'Venta Directa',
        ...venta.toJSON() // No tiene cuotas
      }))
    ];

    if (!productos.length) {
      return res.status(404).json({ ok: false, msg: 'El cliente no tiene productos' });
    }

    return res.status(200).json({ ok: true, productos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener productos del cliente' });
  }
};

// Cargar todas las cuotas con fecha de hoy
const cargarCuotasHoy = async (req, res) => {
  try {
    // Obtener fecha de hoy desde las 00:00 hasta las 23:59:59
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día

    const finHoy = new Date(hoy);
    finHoy.setHours(23, 59, 59, 999); // Fin del día

    // Buscar cuotas con fecha de cobro hoy y que no estén pagadas
    const cuotas = await Cuota.findAll({
      where: {
        fecha_cobro: {
          [Op.gte]: hoy, // Desde las 00:00 de hoy
          [Op.lte]: finHoy, // Hasta las 23:59 de hoy
        },
        estado: { [Op.not]: "pago" }, // Excluir cuotas ya pagadas
      },
    });

    if (!cuotas || cuotas.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No hay cuotas a cobrar hoy.",
      });
    }

    // Promesas para obtener los objetos relacionados (Plan, Préstamo, Venta Permutada)
    const cuotasConDetalles = await Promise.all(cuotas.map(async (cuota) => {
      let clienteId;
      let cat = ''; //categoria de cuotas
      let objetoRelacionado = null;
      let cliente = null;
      // Verificar si la cuota está asociada con un plan, préstamo o venta permutada
      if (cuota.planId) {
        cat = 'Plan';
        objetoRelacionado = await Plan.findOne({ where: { id: cuota.planId } });
      } else if (cuota.prestamoId) {
        cat = 'Préstamo';
        objetoRelacionado = await Prestamos.findOne({ where: { id: cuota.prestamoId } });
      } else if (cuota.permutadoId) {
        cat = 'Venta Permutada';
        objetoRelacionado = await Venta_permutada.findOne({ where: { id: cuota.permutadoId } });
      }

      // Verificar si el objetoRelacionado existe y devolver el detalle
      if (objetoRelacionado) {

        clienteId = objetoRelacionado.clienteId; // Suponiendo que el objetoRelacionado tiene el campo clienteId

        // Buscar el cliente por clientId
        cliente = await Clientes.findOne({ where: { id: clienteId } });


      } else {
        console.log(`No se encontró clienteId para la cuota ${cuota.id} (${tipoCuota})`);
      }

      return {
        cuota: cuota, // Aquí estás devolviendo toda la cuota directamente
        cat,
        objetoRelacionado,
        cliente,
      };
    }));

    // Respuesta con las cuotas y sus detalles
    res.status(200).json({
      ok: true,
      msg: "Cuotas del día cargadas exitosamente.",
      cuotas: cuotasConDetalles, // Devolvemos las cuotas con los detalles del cliente y el objeto relacionado
    });
  } catch (error) {
    console.error("Error al cargar las cuotas:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener las cuotas. Contacte al administrador.",
    });
  }
};


//carga los datos de una entrega pactada
const cargarPlanesConCuotasPagadas = async (req, res) => {
  try {
    const planes = await Plan.findAll({
      include: [
        {
          model: Cuota,
          as: 'cuotas',
          where: { estado: 'pago' },
          required: false,
        },
        {
          model: Clientes,
          as: 'cliente',
        },
      ],
    });

    const planesFiltrados = planes.filter(plan => {
      const cuotasPagadas = plan.cuotas || [];
      const cuotasEntregaNumeros = plan.cuotas_entrega_pactada.map(Number); // Convertir a números

      // Extraer solo los números de las cuotas pagadas
      const numerosCuotasPagadas = cuotasPagadas.map(cuota => Number(cuota.numero_cuota));

      // Verificar si el cliente ha alcanzado una cuota pactada exacta
      for (const cuotaPactada of cuotasEntregaNumeros) {
        if (numerosCuotasPagadas.includes(cuotaPactada)) {
          // Si hay una cuota pagada que coincide exactamente con la pactada
          // Verificamos que no tenga pagos adicionales no pactados
          const pagosExtras = numerosCuotasPagadas.some(n => n > cuotaPactada && !cuotasEntregaNumeros.includes(n));
          
          if (!pagosExtras) {
            return true; // Se muestra el plan
          }
        }
      }
      
      return false;
    });

    // Asegurar que solo se incluyan las cuotas pactadas pagadas
    const resultados = planesFiltrados.map(plan => {
      return {
        cliente: plan.cliente, // Datos del cliente
        cuotas: plan.cuotas.filter(cuota => 
          // Comparación corregida
          plan.cuotas_entrega_pactada.includes(cuota.numero_cuota.toString())
        ), // Solo cuotas pactadas pagadas
        plan: { // Datos del plan
          id: plan.id,
          cuotas_entrega_pactada: plan.cuotas_entrega_pactada,
          monto_total: plan.monto_total,
          duracion_meses: plan.duracion_meses
        }
      };
    });

    res.json({ resultados });

  } catch (error) {
    console.error('Error al obtener los planes:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

//carga prestamos o planes para reporte
const cargarProductosPorCategoria2 = async (req, res) => {
  try {
    const { cat } = req.params; // Se obtiene la categoría (préstamos o planes)

    // Dependiendo de la categoría, cargamos los productos correspondientes
    let productos;
    if (cat === 'Préstamo') {
      productos = await Prestamos.findAll({
        include: [
          {
            model: Cuota,
            as: 'cuotas',
            required: false,
          },
          {
            model: Clientes,
            as: 'cliente',
          },
        ],
      });
    } else if (cat === 'Plan') {
      productos = await Plan.findAll({
        include: [
          {
            model: Cuota,
            as: 'cuotas',
            required: false,
          },
          {
            model: Clientes,
            as: 'cliente',
          },
        ],
      });
    } else {
      return res.status(400).json({ msg: 'Categoría inválida' });
    }

    // Procesamos los datos y los organizamos para la respuesta
    const resultados = productos.map(producto => {
      return {
        cliente: producto.cliente, // Datos del cliente
        cuotas: producto.cuotas,   // Cuotas asociadas al producto
        producto: {               // Datos del producto (préstamo o plan)
          id: producto.id,
          nombre: producto.nombre,
          fecha_realizado: producto.fecha_realizado,
          estado:producto.estado,
          sit_cliente: producto.instancia_cliente || producto.conducta_cliente,
          monto_prestado: producto.monto_prestado || 0,
          cat: cat,   // Categoría para referencia (prestamo o plan)
        },
      };
    });

    res.json({ resultados });

  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

const cargarProductosPorCategoria = async (req, res) => {
  try {
    const { cat } = req.params; // Se obtiene la categoría (préstamos o planes)

    // Dependiendo de la categoría, cargamos los productos correspondientes
    let productos;
    if (cat === 'Préstamo') {
      productos = await Prestamos.findAll({
        include: [
          {
            model: Cuota,
            as: 'cuotas',
            required: false,
          },
          {
            model: Clientes,
            as: 'cliente',
          },
        ],
      });
    } else if (cat === 'Plan') {
      productos = await Plan.findAll({
        include: [
          {
            model: Cuota,
            as: 'cuotas',
            required: false,
          },
          {
            model: Clientes,
            as: 'cliente',
          },
        ],
      });
    } else {
      return res.status(400).json({ msg: 'Categoría inválida' });
    }

    // Procesamos los datos y los organizamos para la respuesta
    const resultados = productos.map(producto => {
      // Filtrar cuotas por estado
      const cuotasPagadas = producto.cuotas.filter(cuota => cuota.estado === 'pago');
      const cuotasNoPagadas = producto.cuotas.filter(cuota => cuota.estado !== 'pago');

      // Calcular montos
      const totalCobrado = cuotasPagadas.reduce((total, cuota) => total + cuota.monto_cuota, 0);
      const totalACobrar = producto.cuotas.reduce((total, cuota) => total + cuota.monto_cuota, 0);
      const perdidas = cuotasNoPagadas.reduce((total, cuota) => total + cuota.monto_cuota, 0);

      // Calcular ganancias según la categoría
      let ganancias;
      if (cat === 'Préstamo') {
        ganancias = totalCobrado > producto.monto_prestado ? totalCobrado - producto.monto_prestado : 0;
      } else if (cat === 'Plan') {
        ganancias = totalCobrado;
      }

      // Estructura de respuesta
      return {
        cliente: producto.cliente, // Datos del cliente
        cuotas: producto.cuotas,   // Cuotas asociadas al producto
        producto: {               // Datos del producto (préstamo o plan)
          id: producto.id,
          nombre: producto.nombre,
          fecha_realizado: producto.fecha_realizado,
          estado: producto.estado,
          sit_cliente: producto.instancia_cliente || producto.conducta_cliente,
          monto_prestado: cat === 'Préstamo' ? producto.monto_prestado : null, // Solo para préstamos
          cat: cat,   // Categoría para referencia (prestamo o plan)
          ganancias,
          perdidas,
          total_cobrado: totalCobrado,
          total_prestado: cat === 'Préstamo' ? producto.monto_prestado : null, // Solo para préstamos
          total_a_cobrar: totalACobrar,
        },
      };
    });

    res.json({ resultados });

  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};


module.exports = {
  crearUsuario,
  cargarUsuarios,
  editarUsuario,
  inhabilitarUsuario,
  habilitarUsuario,
  cargarRoles,
  cargarProductos,
  editarReporte,
  crearProducto,
  editarProducto,
  inhabilitarProducto,
  habilitarProducto,
  cargarClientes,
  editarCliente,
  cargarReportes,
  crearPrestamoNuevoCliente,
  crearPlanNuevoCliente,
  crearVentaDirNuevoCliente,
  crearVentaPermutadaNuevoCliente,
  crearVentaServicioYreporte,
  crearVentaAccesoriosYreporte,
  RegGastosYreporte,
  obtenerProductosClienteCuotas,
  cargarCuotasHoy,
  cobroCuotaRendicion,
  cargarPlanesConCuotasPagadas,
  cargarUsuariosCobrador,
  crearEquipoVentas,
  editarEquipoVentas,
  cargarEquiposVentas,
  eliminarEquipoVentas,
  cargarRendiciones,
  confirmararRendicion,
  cargarProductosPorCategoria

};