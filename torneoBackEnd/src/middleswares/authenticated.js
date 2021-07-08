"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const key = "password";

exports.ensureAuth = function (req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .send({ mensaje: "La peticion no tiene la cabecera de autorizacion" });
  }
  var token = req.headers.authorization.replace(/['"]+/g, "");
  try {
    var payload = jwt.decode(token, key);
    if (payload.exp <= moment().unix) {
      return res.status(401).send({ mensaje: "El token ha expirado" });
    }
  } catch (error) {
    return res.status(404).send({ mensaje: "El token no es valido" });
  }
  req.usuarios = payload;
  next();
};
