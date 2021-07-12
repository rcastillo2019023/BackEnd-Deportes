'use strict'

const mongoose = require("mongoose")
const app = require('./app')
const User=require("./src/models/user.models");
const bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/EjemploDB', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('Se encuentra conectado a la base de datos');
 
  app.listen(3000, function () {
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