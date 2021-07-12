"use strict";

const User = require("../models/user.models");
const Liga = require("../models/liga.models");
const Equipo = require("../models/equipo.models");
const Marcador = require("../models/marcador.models");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

//Funciones para usuarios 
function login(req, res) {
  var params = req.body;

  User.findOne({ usuario: params.usuario }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

      if (usuarioEncontrado) {                                               //TRUE || FALSE 
          bcrypt.compare(params.password, usuarioEncontrado.password, (err, passCorrecta) => {
              if (passCorrecta) {
                  if (params.getToken === 'true') {
                      return res.status(200).send({
                          usuarioEncontrado, token: jwt.createToken(usuarioEncontrado)
                      });
                  } else {
                      usuarioEncontrado.password = undefined;
                      return res.status(200).send({ usuarioEncontrado })
                  }
              } else {
                  return res.status(404).send({ mensaje: 'El usuario no se ha podido identificar' })
              }
          })
      } else {
          return res.status(404).send({ mensaje: 'El usuario no ha podido ingresar' })
      }
  })
}
//funcion para registar usuarios normales
function register(req, res) {
  var userModel = new User();
  var params = req.body;

  if (params.usuario && params.email && params.password) {
    userModel.usuario = params.usuario;
    userModel.email = params.email;
    userModel.rol = "rol_Usuario";
    userModel.imagen = params.imagen;
    User.find({
      $or: [{ usuario: userModel.usuario }, { email: userModel.email }],
    }).exec((err, userFound) => {
      if (err) return res.status(500).send({ mesaje: "Error en la petición" });
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
}
//Funcion para obtener la informacion del usuario logueado
function obtenerPerfil(req, res) {

  User.findById(req.usuarios.sub , (err, perfilEncontrado) => {
    if (err)
      return res
        .status(500)
        .send({ mensaje: "Error en la peticion del Usuario" });
    if (!perfilEncontrado)
      return res
        .status(500)
        .send({ mensaje: "Error en obtener los datos del Usuario" });
    return res.status(200).send({ perfilEncontrado });
  });
}
// esta funcion solo sirve para el usuario normal que esta logueado
function editarCuenta(req, res) {
  var params = req.body;

  delete params.rol;
  User.findByIdAndUpdate( req.usuarios.sub, params, { new: true },
    (err, usuarioActualizado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
      if (!usuarioActualizado)
        return res.status(500).send({ mensaje: "No se ha podido actualizar al Usuario" });
      return res.status(200).send({ usuarioActualizado });
    }
  );
}
//esta funcion solo sirve para el usuario normal que esta logueado
function eliminarCuenta(req, res) {
  Liga.findOne({ administradorLiga: req.usuarios.sub }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error interno" });
    if (usuarioEncontrado) {
      return res.status(500).send({mensaje: "No puede elimniarlo porque este tiene una liga activa", });
    } else {
      //verifica si el id que se mando en la ruta coincide con el usuario logueado
        User.findByIdAndDelete(req.usuarios.sub, (err, usuarioEliminado) => {
          if (err)
            return res
              .status(500)
              .send({ mensaje: "Error interno al eliminar usuario" });
          if (!usuarioEliminado)
            return res
              .status(500)
              .send({ mensaje: "No se pudo eliminar el usuario" });
          return res.status(200).send({ usuarioEliminado });
        });
    }
  });
}

//---------------------------------------funciones para ligas----------------------------------------------------------
//esta funcion esta disponible para cualquier tipo de usuario
function agregarLigas(req, res) {
  let params = req.body;
  let ligaModel = new Liga();

  if (params.nombre && params.detalle) {
    ligaModel.nombre = params.nombre;
    ligaModel.detalle = params.detalle;
        Liga.find({
          $or: [{ nombre: ligaModel.nombre }],
        }).exec((err, ligaEncontrado) => {
          if (err)
            return res.status(500).send({ mensaje: "Error interno al buscar liga" });
          if (ligaEncontrado && ligaEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: "La liga ya existe" });
          } else {
            ligaModel.administradorLiga = req.usuarios.sub;
            ligaModel.save((err, ligaAgregado) => {
              if (err)
                return res.status(500).send({mensaje: "Error interno al agregar liga",});
              if (!ligaAgregado)
                return res.status(500).send({ mensaje: "No se ha podido agregar la liga",});
              return res.status(200).send({ ligaAgregado });
            });
          }
        });
      }
}
//esta funcion sirve para ver la ligas creadas por el usuario logueado
function listarLigas(req, res) {
  Liga.find({ administradorLiga: req.usuarios.sub }, (err, ligaEncontrada) => {
    if (err) return res.status(500).send({ mensaje: "Error interno" });
    if (ligaEncontrada) {
      return res.status(200).send({ ligaEncontrada });
    } else {
      return res.status(500).send({
        mensaje: "No tienes ligas asignadas",
      });
    }
  });
}
//editar liga por medio de la liga
function editarLigas(req, res) {
  let idLiga = req.params.idLiga;
  let params = req.body;
  delete params._id;
  delete params.administradorLiga;
  Liga.find(
    { administradorLiga: req.usuarios.sub },
    (err, LigaEncontrado) => {
      if (err)
        return res.status(500).send({ mensaje: "Error interno al compara IDs" });
      if (LigaEncontrado) {
        Liga.findByIdAndUpdate(
          { _id: idLiga }, params,{ new: true },(err, LigaActualizado) => {
            if (err) return res.status(500).send({ mensaje: "Error interno" });
            if (LigaActualizado) {
              return res.status(200).send({ LigaActualizado });
            } else {
              return res.status(500).send({ mensaje: "Error al actualizar" });
            }
          }
        );
      } else {
        return res.status(500).send({ mensaje: "no puedes editar una liga que no es tuya" });
      }
    });
}
//eliminar liga por medio de la id
function eliminarLiga(req, res) {
  let idLiga = req.params.idLiga;

  Liga.find(
    { administradorLiga: req.usuarios.sub },
    (err, LigaEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error interno al compara IDs" });
      if (LigaEncontrado) {
        Liga.findByIdAndDelete(idLiga, (err, ligaEliminado) => {
          if (err) return res.status(500).send({ mensaje: "Error interno al eliminar liga" });
          if (!ligaEliminado){
            return res.status(500).send({ mensaje: "No se pudo eliminar la liga" });
          }
          return res.status(200).send({ ligaEliminado });
        });
      } else {
        return res.status(500).send({ mensaje: "no puede eliminar una liga que no es tuya" });
      }
    }
  );
}
//funcion para obtener una liga por su id
function obtenerLigaId(req, res) {
  var idLiga = req.params.idLiga
  Liga.findById(idLiga, (err, LigaEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion del Usuario' })
      if (!LigaEncontrado) return res.status(500).send({ mensaje: 'Error en obtener los datos del la liga' })
      return res.status(200).send({ LigaEncontrado })
  })
}

//----------------------------------------funciones de equipos--------------------------------------------------
//esta funcion esta disponible para cualquier tipo de usuario
function agregarEquipo(req, res) {
  var EquipoModel = new Equipo();
  let params = req.body;
  let idLiga = req.params.idLiga;
  delete params.puntos;
  delete params.partidos

    Equipo.find(
      { Liga: idLiga },
      (err, numeroEquipos) => {
        if (err)
          return res.status(500).send({ mensaje: "Error interno al comparar informacion " });
        if (numeroEquipos && numeroEquipos.length === 10) {

          return res.status(500).send({ mensaje: "Has llegado al numero de equipos permitidos" });
        } else {
          if (params.nombre && params.imagen) {
            Equipo.findOne({ nombre: params.nombre }, (err, teamFind) => {
              if (err) {
                res.status(500).send({ message: 'Error general' })
                console.log(err)
              } else if (teamFind) {
                res.send({ message: 'Nombre de equipo ya en uso' })
              } else {
                Liga.findOne(
                  { administradorLiga: req.usuarios.sub },
                  (err, LigaEncontrado) => {
                    if (err)
                      return res.status(500).send({ mensaje: "Error interno al comparar informacion " });
                    if (LigaEncontrado) {
                      EquipoModel.nombre = params.nombre;
                      EquipoModel.imagen = params.imagen;
                      EquipoModel.golesFavor = 0;
                      EquipoModel.golesContra = 0;
                      EquipoModel.golesDiferencia = 0;
                      EquipoModel.puntos = 0;
                      EquipoModel.partidos = 0;
                      EquipoModel.Liga = idLiga;
                      EquipoModel.save((err, equipoAgregado) => {
                        if (equipoAgregado) {
                          return res.status(200).send({ equipoAgregado });
                        } else {
                          return res.status(500).send({ mensaje: "Error interno al agregar equipo" });
                        }
                      });
                    } else {
                      return res.status(500).send({ mensaje: "Usted no ha creado ninguna liga o no es administrador de la liga" });
                    }
                  });
              }
            })
          } else {
            return res.status(500).send({ mensaje: "ingrese todos los datos requeridos" });
          }
        }
      });
}
//esta funcion sirve para ver la ligas creadas por el usuario logueado
function listarEquipos(req, res){
  let idLiga = req.params.idLiga;
  //verifiacion si la ID del uusario en la ruta coincide con el usuario logueado
  Liga.findById(idLiga, (err, LigaEncontrada) => {
    if (err) return res.status(500).send({ mensaje: "Error interno al buscar liga" });
    console.log(LigaEncontrada)
    if (LigaEncontrada) {
      Equipo.find({ Liga: idLiga }, (err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error interno al buscar equipo" });
        if (equipoEncontrado) {
          return res.status(200).send({ equipoEncontrado });
        } else {
          return res.status(500).send({ mensaje: "No se encontraron equipos" });
        }
      });
    } else {
      return res.status(500).send({ mensaje: "No se encontro la liga " });
    }
  });
}
//editar equipo por medio de la Id
function editarEquipo(req, res) {
  let idLiga = req.params.idLiga;
  let idEquipo = req.params.idEquipo;
  let params = req.body;
  delete params._id;
  delete params.puntos;
  delete params.partidos
  delete params.Liga;

    Equipo.find(
      { Liga: idLiga },
      (err, EquipoEncontrado) => {
        if (err)
          return res.status(500).send({ mensaje: "Error interno al compara IDs" });
        if (EquipoEncontrado) {
          Equipo.findByIdAndUpdate(
            idEquipo ,params,{ new: true },(err, EquipoActualizado) => {
              if (err) return res.status(500).send({ mensaje: "Error interno" });
              if (EquipoActualizado) {
                return res.status(200).send({ EquipoActualizado });
              } else {
                return res.status(500).send({ mensaje: "Error al actualizar" });
              }
            });
        }
      });
} 
//eliminar equipo por medio de la id
function eliminarEquipo(req, res) {
  let idEquipo = req.params.idEquipo;
  let idLiga = req.params.idLiga;

    Equipo.find(
      { Liga: idLiga },
      (err, EquipoEncontrado) => {
        if (err)
          return res
            .status(500)
            .send({ mensaje: "Error interno al compara IDs" });
        if (EquipoEncontrado) {
          //verifica si el id que se mando en la ruta coincide con el usuario logueado
          Equipo.findByIdAndDelete(idEquipo, (err, EquipoEliminado) => {
            if (err)
              return res
                .status(500)
                .send({ mensaje: "Error interno al eliminar liga" });
            if (!EquipoEliminado)
              return res
                .status(500)
                .send({ mensaje: "No se pudo eliminar la liga" });
            return res.status(200).send({ EquipoEliminado });
          });
        } else {
          return res
            .status(500)
            .send({ mensaje: "no existe el equipo" });
        }
      });
}
//esta funcion sirve para ver la ligas creadas por el usuario logueado

//funcion para obtener una liga por su id
function obtenerEquipoId(req, res) {
  var idEquipo = req.params.idEquipo
  Equipo.findById(idEquipo, (err, equipoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion del Usuario' })
      if (!equipoEncontrado) {return res.status(500).send({ mensaje: 'Error en obtener los datos del Equipo' })
  }else{
      return res.status(200).send({ equipoEncontrado })
  }
  })
}


function marcador(req, res) {
  var marcador = new Marcador();
  var params = req.body;
  var Equipo1 = req.params.idEquipo1;
  var Equipo2 = req.params.idEquipo2;
  
    Equipo.findById(Equipo1, (err, equipoEncontrado1) => {
      if (err) {
        res.status(500).send({ message: 'Error' })
      } else if (equipoEncontrado1) {
        Equipo.findById(Equipo2, (err, equipoEncontrado2) => {
          if (err) {
            res.status(500).send({ message: 'Error' })
          } else if (equipoEncontrado2) {

            if (params.jornada && params.goles1 && params.goles2) {

              if (params.goles1 < 0 || params.goles2 < 0 || params.jornada < 0) {
                res.status(500).send({ message: 'Ingrese datos mayores o iguales a 0' })
              } else {
                marcador.jornada = params.jornada;
                marcador.goles1 = params.goles1;
                marcador.goles2 = params.goles2;
                marcador.equipo1 = Equipo1;
                marcador.equipo2 = Equipo2;

                var diferencia1 = marcador.goles1 - marcador.goles2;
                var diferencia2 = marcador.goles2 - marcador.goles1;
                var puntos1;
                var puntos2;

                if (marcador.goles1 > marcador.goles2) {
                  puntos1 = 3;
                  puntos2 = 0;
                } else if (marcador.goles1 < marcador.goles2) {
                  puntos2 = 3;
                  puntos1 = 0;
                } else {
                  puntos1 = 1;
                  puntos2 = 1;
                }

                marcador.save((err, marcadorGuardado) => {
                  if (err) {
                    res.status(500).send({ message: 'Error general' })
                  } else if (marcadorGuardado) {
                    Equipo.findByIdAndUpdate(Equipo1, { $inc: { golesFavor: marcador.goles1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo1, { $inc: { golesContra: marcador.goles2 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo2, { $inc: { golesFavor: marcador.goles2 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo2, { $inc: { golesContra: marcador.goles1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo1, { $inc: { partidos: 1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo2, { $inc: { partidos: 1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo1, { $inc: { golesDiferencia: diferencia1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo2, { $inc: { golesDiferencia: diferencia2 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo1, { $inc: { puntos: puntos1 } }, { new: true }, (err, aumento) => {
                    })

                    Equipo.findByIdAndUpdate(Equipo2, { $inc: { puntos: puntos2 } }, { new: true }, (err, aumento) => {
                    })

                    res.send({ message: 'resultados guardados con exito', marcadorGuardado })

                  } else {
                    res.status(500).send({ message: 'No se puedo guardar el marcador' })
                  }
                })
              }
            } else {
              res.send({ message: 'ingrese los datos solicitados' })
            }
          } else {
            res.status(500).send({ message: 'No existe el equipo ' })
          }
        })

      } else {
        res.status(500).send({ message: 'No se encuentra el equipo ' })
      }
    })
}




module.exports = {
  register,
  login,
  obtenerPerfil,
  editarCuenta,
  eliminarCuenta,
  agregarLigas,
  listarLigas,
  editarLigas,
  eliminarLiga,
  agregarEquipo,
  listarEquipos,
  editarEquipo,
  eliminarEquipo,
  obtenerLigaId,
  obtenerEquipoId,
  marcador
};
