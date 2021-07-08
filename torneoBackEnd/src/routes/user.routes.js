"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");

var authentication = require("../middleswares/authenticated");

var api = express.Router();
//rutras generales
api.post("/register", userController.register);
api.post("/login", userController.login);
api.get(
  "/perfil/:idUsuario",
  authentication.ensureAuth,
  userController.obtenerPerfil
);
api.put(
  "/editarCuenta/:idUsuario",
  authentication.ensureAuth,
  userController.editarCuenta
);
api.delete(
  "/eliminarCuenta/:idUsuario",
  authentication.ensureAuth,
  userController.eliminarCuenta
);



//rutas sobre ligas
api.post(
  "/agregarLiga/:idUsuario",
  authentication.ensureAuth,
  userController.agregarLigas
);
api.get(
  "/listarLigas",
  authentication.ensureAuth,
  userController.listarLigas
);
api.put(
  "/editarLiga/:idLiga",
  authentication.ensureAuth,
  userController.editarLigas
);
api.delete(
  "/eliminarLiga/:idLiga",
  authentication.ensureAuth,
  userController.eliminarLiga
);
//rutas sobre
api.post(
  "/agregarEquipos/:idLiga/:idUsuario",
  authentication.ensureAuth,
  userController.agregarEquipo
);

api.get(
  "/listarEquiposPorLiga/:idLiga",
  authentication.ensureAuth,
  userController.listarEquiposPorLiga
);

api.put(
  "/editarEquipo/:idEquipo/:idLiga/:idUsuario",
  authentication.ensureAuth,
  userController.editarEquipo
);
api.delete(
  "/eliminarEquipo/:idEquipo/:idLiga/:idUsuario",
  authentication.ensureAuth,
  userController.eliminarEquipo
);

api.post(
  "/agregarEquipos/:idUsuario/:idEquipo1/:idEquipo2",
  authentication.ensureAuth,
  userController.agregarEquipo
);

module.exports = api;
