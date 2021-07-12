'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var marcadorSchema = Schema({
    jornada: Number,
    goles1: Number,
    goles2: Number,
    equipo1: {type: Schema.ObjectId, ref:'Equipo'},
    equipo2: {type: Schema.ObjectId, ref:'Equipo'}
})

module.exports = mongoose.model('Marcador', marcadorSchema);