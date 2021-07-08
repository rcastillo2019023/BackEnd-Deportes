"use strict";

const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var equipoSchema = Schema({
  nombre: String,
  imagen: String,
  golesFavor:Number,
  golesContra:Number,
  golesDiferencia:Number,
  puntos: Number,
  partidos: Number,
  Liga: { type: Schema.Types.ObjectId, ref: "Ligas" },
});

module.exports = mongoose.model("Equipo", equipoSchema);
