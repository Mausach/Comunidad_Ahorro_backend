const bcryptjs = require ('bcrypt')
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario_models");


const crearUsuario = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, email, password, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el email ya está registrado
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Encriptar la contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol,
    });

     //generar nuestro JWT
        //se lo genera en el back y se guardara en el front en el localstorage
        const payload = {
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            
        };

        //7oken expira en 2 hs consul7ar despues
        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

    // Responder con el usuario creado (sin incluir la contraseña)
    res.status(201).json({
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      estado: nuevoUsuario.estado,
      msg: 'el usuario se guardo correctamente',
      token
    });

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Ocurrió un error al crear el usuario.' });
  }
};

//fal7a en el fron7 de admin un modulo para crear rol
const crearRol = async (req, res) => {
    const { nombre, estado } = req.body;

    try {
        // Verifica si el rol ya existe
        let rolExistente = await Rol.findOne({ where: { nombre } });

        if (rolExistente) {
            return res.status(400).json({
                ok: false,
                msg: 'El rol ya existe con ese nombre.',
            });
        }

        // Crea el nuevo rol
        const nuevoRol = await Rol.create({ nombre, estado });

        res.status(201).json({
            ok: true,
            id: nuevoRol.id,
            nombre: nuevoRol.nombre,
            estado: nuevoRol.estado,
            msg: 'El rol se ha guardado correctamente.',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor, contactarse con el administrador.',
        });
    }
};

//cargar es mos7rar

//fal7a fron7
const cargarUsuarios = async (req, res) => {

    try {

        //carga 7odos los usuarios
        const usuarios = await Usuario.findAll();

        res.status(200).json({
            ok: true,
            msg: "usuarios cargados",
            usuarios,

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "contactese con el administrador",
        })
    }
};


//fal7a fron7
const cargar_un_Usuario = async (req, res) => {

    

    try {

        // Supongamos que tenemos el ID del usuario

        let usuario = await Usuario.findByPk(req.params.id); // Utiliza findByPk para buscar un usuario por su ID

    if (usuario) {
        res.status(200).json({
            ok: true,
            msg: "usuarios cargado",
            usuario,

        });
    } else {
      res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado',
      });
    }

    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "contactese con el administrador",
        })
    }
};

//fal7a fron7
const cargar_roles_x_usuario = async (req, res) => {//cuántos roles tiene un usuario

    
    try {

        const usuario = await Usuario.findByPk(req.params.id, {
            include:'roles', // Carga la relación de roles con el nombre del alias de la relacion echa en el usuario-model
          });
      
          if (!usuario) {
            return res.status(404).json({
                ok: false,
                 msg: 'Usuario no encontrado' 
                });
          }
      
          // La propiedad "Roles" contendrá un array de los roles relacionados con el usuario
          const cantidadDeRoles = usuario.roles.length;

          // Mapea los nombres de los roles en un array
    const nombresDeRoles = usuario.roles.map(rol => rol.nombre);
      
          res.status(200).json({

            ok: true,
            msg: "roles del usuario",
            cantidadDeRoles,
            nombresDeRoles 
            });

    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "contactese con el administrador",
        })
    }
};

//fal7a fron7
const cargar_usuario_x_rol = async (req, res) => {//cuántos usuarios tienen un mismo rol

    const rolId = req.params.id; // Supongo que estás pasando el ID del rol en los parámetros de la solicitud

    
    try {

        
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Rol, // Modelo de la relación (Rol)
          as: 'roles', // Alias de la relación en Usuario
          where: { id: rolId }, // Condición para filtrar por ID de rol
        },
      ],
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron usuarios con este rol.',
      });
    }
      
    // La propiedad "roles" contendrá un array de los usuarios relacionados con el rol    
    const cantidadDeUsuarios = usuarios.length;

    // Mapea los nombres de los usuarios en un array
    const nombresDeUsuarios = usuarios.map((usuario) => usuario.nombre);
      
          res.status(200).json({

            ok: true,
            msg: "usuarios con ese rol",
            cantidadDeUsuarios,//devuelve solo la can7idad
            nombresDeUsuarios, //devuelve solo los nombres
            usuarios//devuelve 7odo el obje7o
            });

    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "contactese con el administrador",
        })
    }
};

const editarUsuario = async (req, res) => {
    //aqui va la logica de editar producto

    try {

        let usuario = await Usuario.findByPk(req.body.id); // Utiliza findByPk para buscar un usuario por su ID

        if (!usuario) {
            res.status(404).json({
                ok: false,
                msg: "No existe ningun usuario con este Id",
                usuario,
            });
        }


        
        await usuario.update(req.body);//edi7a con 7odo el bodi es decir 7odos los campos de la 7abla


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

const cambiarRolUsuario = async (req, res) => {
    try {
      const { userId, newRoleId } = req.body; // envías el ID del usuario y el ID del nuevo rol en la solicitud con esos nombres de variables userId, newRoleId
  
      // Encuentra el usuario por su ID
      const usuario = await Usuario.findByPk(userId);
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }
  
      // Encuentra el nuevo rol por su ID
      const nuevoRol = await Rol.findByPk(newRoleId);
  
      if (!nuevoRol) {
        return res.status(404).json({
          ok: false,
          msg: 'Nuevo rol no encontrado',
        });
      }
  
      // Actualiza la relación de roles para el usuario
      await usuario.setRoles([nuevoRol]);
  
      res.status(200).json({
        ok: true,
        msg: 'Rol del usuario actualizado correctamente',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: 'Error al cambiar el rol del usuario. Contacta al administrador',
      });
    }
};
  
const asignarNuevoRol = async (req, res) => {
    const { userId, newRoleId } = req.body; // envías el ID del usuario y el ID del nuevo rol en la solicitud con esos nombres de variables userId, newRoleId
  
    try {
      // Encuentra el usuario por su ID
      const usuario = await Usuario.findByPk(userId);
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: "Usuario no encontrado",
        });
      }
  
      // Encuentra el nuevo rol por su ID
      const nuevoRol = await Rol.findByPk(newRoleId);
  
      if (!nuevoRol) {
        return res.status(404).json({
          ok: false,
          msg: "Rol no encontrado",
        });
      }
  
      // Asigna el nuevo rol al usuario usando la relación muchos a muchos
      await usuario.addRoles(nuevoRol);
  
      res.status(200).json({
        ok: true,
        msg: `Rol ${nuevoRol.nombre} asignado al usuario ${usuario.nombre}`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Error al asignar el rol al usuario",
      });
    }
};

const eliminarRolDeUsuario = async (req, res) => {
    try {
      const usId = req.params.usId; // ID del usuario
      const rolId = req.params.rolId; // ID del rol que deseas eliminar
  
      // Encuentra el usuario por su ID
      const usuario = await Usuario.findByPk(usId);
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }
  
      // Encuentra el rol por su ID
      const rol = await Rol.findByPk(rolId);
  
      if (!rol) {
        return res.status(404).json({
          ok: false,
          msg: 'Rol no encontrado',
        });
      }
  
      // Utiliza el método removeRole para eliminar el rol del usuario
      await usuario.removeRoles(rol);
  
      res.status(200).json({
        ok: true,
        msg: 'Rol eliminado del usuario',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: 'Error al eliminar el rol del usuario',
      });
    }
  };
  
/*
const eliminarProducto = async (req, res) => {

    //aqui va la logica de eliminar producto

    try {
        const productoEliminar = await Producto.findById(req.params.id);

        if (!productoEliminar) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un producto con este ID',
            });
        }

        await Producto.findByIdAndDelete(req.params.id);

        res.status(200).json({
            ok: true,
            msg: 'Producto Eliminado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};
*/

/*
const confirmarPedido = async (req, res) => {
    try {
        const pedidoConfirmar = await Pedido.findById(req.body._id);

        if (!pedidoConfirmar) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun Producto con este Id',
            });
        }

        pedidoConfirmar.estado = 'Realizado';

        await pedidoConfirmar.save();

        res.status(200).json({
            ok: true,
            msg: 'pedido confirmado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};
*/

/*
const inhabilitarUsuario = async (req, res) => {

    try {
        const usuarioInactivo = await Usuario.findById(req.body._id);

        if (!usuarioInactivo) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este Id',
            });
        }

        usuarioInactivo.estado = 'Inactivo';

        await usuarioInactivo.save();

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
*/

/*
const cargarProducto = async (req, res) => {

    try {

        //el find sirve para recorrer en la base de dato todos los productos llevandose des esquema importado
        const productos = await Producto.find();

        res.status(200).json({
            ok: true,
            msg: "productos cargados",
            productos,

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "contactese con el administrador",
        })
    }

};
*/

/*
const cargarProducto_Aleatorio = async (req, res) => {

    try {

        //el find sirve para recorrer en la base de dato todos los productos llevandose des esquema importado
        const productos = await Producto.aggregate([{ $sample: { size: 3 } }]);

        res.status(200).json({
            ok: true,
            msg: "productos cargados",
            productos,

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "contactese con el administrador",
        })
    }
};
*/



/*
const cargarPedidos = async (req, res) => {

    try {

        //el find sirve para recorrer en la base de dato todos los productos llevandose des esquema importado
        const pedidos = await Pedido.find();

        res.status(200).json({
            ok: true,
            msg: "pedidos cargados",
            pedidos,

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "contactese con el administrador",
        })
    }

};
*/

module.exports = {
    crearUsuario,
    //cargarPedidos,
    //confirmarPedido,
    //inhabilitarUsuario,
    //cargarProducto_Aleatorio
};