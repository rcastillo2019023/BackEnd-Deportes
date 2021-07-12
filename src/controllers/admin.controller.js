"use strict";

const User = require("../models/user.models");
const Liga = require("../models/liga.models");
const Equipo = require("../models/equipo.models");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

//funciones solo para admins
//registrar Admins
function registerAdmin(req, res) {
  var userModel = new User();
  var params = req.body;
  if (req.usuarios.rol === "rol_Admin") {
    if (params.usuario && params.email && params.password) {
      userModel.usuario = params.usuario;
      userModel.email = params.email;
      userModel.rol = "rol_Admin";
      userModel.imagen = params.imagen;
      User.find({
        $or: [{ usuario: userModel.usuario }, { email: userModel.email }],
      }).exec((err, userFound) => {
        if (err)
          return res.status(500).send({ mesaje: "Error en la petición" });
        if (userFound && userFound.length >= 1) {
          return res.status(500).send({ mesaje: "El usuario ya existe" });
        } else {
          bcrypt.hash(params.password, null, null, (err, encryptpass) => {
            userModel.password = encryptpass;
            userModel.save((err, saveUser) => {
              if (saveUser) {
                res.status(200).send(saveUser);
              }
            });
          });
        }
      });
    }
  } else {
    return res
      .status(500)
      .send({ mesaje: "No tienes los permisos necesarios" });
  }
}

//funcion para editar Usuarios
function editarUsuarios(req, res) {
  let usuarioID = req.params.idUsuario;
  let params = req.body;
  delete params._id;
  delete params.password;

  if (req.usuarios.rol === "rol_Admin") {
    User.findById(usuarioID, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error interno" });
      if (usuarioEncontrado) {
        User.findByIdAndUpdate(
          { _id: usuarioID },
          params,
          { new: true },
          (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensaje: "Error interno" });
            if (usuarioActualizado) {
              return res.status(200).send({ usuarioActualizado });
            } 
          }
        );
      }
    });
  } else {
    return res.status(500).send({ mensaje: "No tienes los permisos requeridos" });
  }
}
//funciond de admin para eliminar usuarios a menos de que sean administradores
function eliminarUsuario(req, res) {
  let usuarioID = req.params.idUsuario;
  if (req.usuarios.rol === "rol_Admin") {
    Liga.findOne({administradorLiga: usuarioID}, (err, usuarioEncontrado) => {
      console.log(usuarioEncontrado)
      if (err) return res.status(500).send({ mensaje: "Error interno" });
      if (usuarioEncontrado) {
        return res.status(500).send({
          mensaje: "No puede eliminar porque tiene una liga activa",
        });
      } else {
        User.findByIdAndDelete(usuarioID, (err, usuarioEliminado) => {
          if (err) return res.status(500).send({ mensaje: "Error interno" });
          if (usuarioEliminado) {
            return res.status(200).send({ usuarioEliminado });
          }
        });
      }
    });
  } else {
    return res
      .status(500)
      .send({ mensaje: "no tiene los permisos requeridos" });
  }
}
//funcion que solo este habilitado para administradores
function obtenerUsuarios(req, res) {
  
    User.find((err, usuariosEncontrados) => {
      if (err)
        return res
          .status(500)
          .send({ mensaje: "Error en la peticion de Obtener Usuarios" });
      if (!usuariosEncontrados){
        return res.status(500).send({ mensaje: "Error en la consulta de Usuarios" });
      }
      
      return res.status(200).send({ usuariosEncontrados });
});

}


//esta funcion sirve para ver la ligas creadas por el usuario logueado
function listarLigasAdmin(req, res) {
  let idUsuario = req.params.idUsuario;

  //verifiacion si la ID del uusario en la ruta coincide con el usuario logueado
  if (req.usuarios.rol === "rol_Admin") {
    Liga.findById(idUsuario,(err, ligaEncontrada) => {
      if (err) return res.status(500).send({ mensaje: "Error interno" });
      if (ligaEncontrada) {
        return res.status(500).send({ ligaEncontrada });
      } else {
        return res.status(500).send({
          mensaje: "No tienes ligas asignadas",
        });
      }
    });
  } else {
    return res.status(500).send({
      mensaje: "no tienen permisos requeridos",
    });
  }
}
//editar liga

function editarLigasAdmin(req, res) {
  let idLiga = req.params.idLiga;
  let params = req.body;
  delete params._id;
  delete params.administradorLiga;
  if (req.usuarios.rol === "rol_Admin") {
    Liga.findOne(
      idLiga,
      (err, LigaEncontrado) => {
        if (err)
          return res
            .status(500)
            .send({ mensaje: "Error interno al compara IDs" });
        if (LigaEncontrado._id === idLiga) {
          Liga.findByIdAndUpdate(
            { _id: idLiga },
            params,
            { new: true },
            (err, LigaActualizado) => {
              if (err) return res.status(500).send({ mensaje: "Error interno" });
              if (LigaActualizado) {
                return res.status(200).send({ LigaActualizado });
              } else {
                return res.status(500).send({ mensaje: "Error al actualizar" });
              }
            }
          );
        } else {
          return res
            .status(500)
            .send({ mensaje: "no puedes editar una liga que no es tuya" });
        }
      }
    );
  } else {
    return res.status(500).send({
      mensaje: "no tienen permisos requeridos",
    });
  }
}
//eliminar liga para usuarios
function eliminarLigaAdmin(req, res) {
  let idLiga = req.params.idLiga;
  if (req.usuarios.rol === "rol_Admin") {
    Liga.findOne(
      idLiga, (err, LigaEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error interno al compara IDs" });
        if (LigaEncontrado._id === idLiga) {
          //verifica si el id que se mando en la ruta coincide con el usuario logueado
          Liga.findByIdAndDelete(idLiga, (err, ligaEliminado) => {
            if (err)
              return res.status(500).send({ mensaje: "Error interno al eliminar liga" });
            if (!ligaEliminado)
              return res.status(500).send({ mensaje: "No se pudo eliminar la liga" });
            return res.status(200).send({ ligaEliminado });
          });
        } else {
          return res.status(500).send({ mensaje: "no puede eliminar una liga que no es tuya" });
        }
      });
  } else {
    return res.status(500).send({
      mensaje: "no tienen permisos requeridos",
    });
  }
}

function obtenerUsuarioId(req, res) {
  var idUsuario = req.params.idUsuario
  User.findById(idUsuario, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion del Usuario' })
      if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error en obtener los datos del Usuario' })
      console.log(usuarioEncontrado.email);
      return res.status(200).send({ usuarioEncontrado })
  })
}


module.exports = {
  registerAdmin,
  eliminarUsuario,
  editarUsuarios,
  obtenerUsuarios,
  listarLigasAdmin,
  editarLigasAdmin,
  eliminarLigaAdmin,
  obtenerUsuarioId,
};
