"use strict";

const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ligaSchema = Schema({
  nombre: String,
  detalle: String,
  administradorLiga: { type: Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Ligas", ligaSchema);
