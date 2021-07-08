"use strict";

const express = require("express");
const adminController = require("../controllers/admin.controller");

var authentication = require("../middleswares/authenticated");

var api = express.Router();

//rutas para admins

//rutas para crud usuarios
api.post(
  "/registerAdmin",
  authentication.ensureAuth,
  adminController.registerAdmin
);
api.delete(
  "/eliminarUsuario/:idUsuario",
  authentication.ensureAuth,
  adminController.eliminarUsuario
);
api.put(
  "/editarUsuario/:idUsuario",
  authentication.ensureAuth,
  adminController.editarUsuarios
);
api.get(
  "/obtenerUsuarios",
  adminController.obtenerUsuarios
);

api.get('/obtenerUsuarioId/:idUsuario', adminController.obtenerUsuarioId);

//rutas crud ligas

api.get(
  "/listarLigasAdmin",
  authentication.ensureAuth,
  adminController.listarLigasAdmin
);

api.put(
  "/editarLigaAdmin/:idLiga",
  authentication.ensureAuth,
  adminController.editarLigasAdmin
);
api.delete(
  "/eliminarLigaAdmin/:idLiga",
  authentication.ensureAuth,
  adminController.eliminarLigaAdmin
);
module.exports = api;
