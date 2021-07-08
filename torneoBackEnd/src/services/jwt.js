"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const key = "password";

exports.createToken = function (usuarios) {
  var payload = {
    sub: usuarios._id,
    usuario: usuarios.usuario,
    rol: usuarios.rol,
    iat: moment().unix(),
    exp: moment().day(90, "days").unix(),
  };
  return jwt.encode(payload, key);
};
