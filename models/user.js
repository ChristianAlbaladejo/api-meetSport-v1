'use strict'

var mongoose = require('mongoose');
var Schema = mongoose;

var UserSchema = Schema({
    name: string,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
});

module.exports = mongoose.model('User', UserSchema);