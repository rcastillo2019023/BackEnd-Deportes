"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");

var authentication = require("../middleswares/authenticated");

var api = express.Router();
//rutras generales
api.post("/register", userController.register);
api.post("/login", userController.login);
api.get(
  "/perfil",
  authentication.ensureAuth,
  userController.obtenerPerfil
);
api.put(
  "/editarCuenta",
  authentication.ensureAuth,
  userController.editarCuenta
);
api.delete(
  "/eliminarCuenta",
  authentication.ensureAuth,
  userController.eliminarCuenta
);

//rutas sobre ligas
api.post(
  "/agregarLiga",
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

api.get('/obtenerLigaId/:idLiga', userController.obtenerLigaId)
//rutas sobre
api.post(
  "/agregarEquipos/:idLiga",
  authentication.ensureAuth,
  userController.agregarEquipo
);

api.get(
  "/listarEquipos/:idLiga",
  userController.listarEquipos
);

api.put(
  "/editarEquipo/:idEquipo/:idLiga",
  authentication.ensureAuth,
  userController.editarEquipo
);
api.delete(
  "/eliminarEquipo/:idEquipo/:idLiga",
  authentication.ensureAuth,
  userController.eliminarEquipo
);
api.get('/obtenerEquipoId/:idEquipo', userController.obtenerEquipoId)

// puntos 
api.post(
  "/marcador/:idEquipo1/:idEquipo2",
  authentication.ensureAuth,
  userController.marcador
);

module.exports = api;
