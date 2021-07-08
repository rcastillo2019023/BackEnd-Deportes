'use strict'

const mongoose = require("mongoose")
const User=require("./src/models/user.models");
const bcrypt = require("bcrypt-nodejs");
const app = require('./app')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://BackDB:BackDB@backend.j2rom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('Se encuentra conectado a la base de datos');
 
  app.listen(process.env.PORT || 3000, function () {
    console.log('El servidor esta arrancando en el puerto: 3000'); 
    var userModel = new User();

        User.find({$or: [
            {usuario: "ADMIN"}
        ]}).exec((err, userFound)=>{
            if(err) console.log("Error en la petición");

            if(userFound && userFound.length>=1){
                console.log("Ya existe un administrador");
            }else {
                userModel.usuario = "ADMIN";
                userModel.password = "deportes123"
                userModel.rol = "rol_Admin";
                bcrypt.hash("deportes123", null, null, (err,encryptpass)=>{
                    userModel.password=encryptpass;
                    userModel.save((err,saveUser)=>{
                        if(saveUser){
                            console.log("El usuario admin a sido creado")
                        }
                    })
                })
            }
        })
  })

}).catch(err => console.log(err))