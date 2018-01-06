const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema =new mongoose.Schema({
    username: {type:String, required: true, unique: true},
    password: {type:String, default: ''},
    email: {type:String, required: true, unique: true},
    profilePic: {type: String, default: 'https://i.pinimg.com/originals/7c/c7/a6/7cc7a630624d20f7797cb4c8e93c09c1.png'},
    facebook: {type: String, default: ''},
    fbTokens: Array,
    google: {type: String, default: ''},
    googleTokens: Array,
});

userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}


userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}


userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);