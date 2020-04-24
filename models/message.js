'use strict'

var mongoose = require('mongoose');
var Schema = mongoose;

var MesageSchema = Schema({
    text: String,
    created_at: String,
    emmiter: { type: Schema.ObjectId, ref: 'User' },
    receiver: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Message', MesageSchema);