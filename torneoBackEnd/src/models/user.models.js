const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = Schema({
  usuario: String,
  email: String,
  password: String,
  rol: String,
  imagen: String,
});

module.exports = mongoose.model("Users", UserSchema);
