"usestrict"

//Variables globales
const express=require("express");
const app =express();
const bodyParser=require("body-parser");
const cors=require("cors");

//Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cabeceras
app.use(cors());

//Importación rutas  
const user_Routes=require("./src/routes/user.routes");
const admin_Routes=require("./src/routes/admin.routes");


//Cargar Rutas 
app.use("/api", user_Routes);
app.use("/api", admin_Routes);


//Exportar
module.exports=app;
