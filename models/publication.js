'use strict'

var mongoose = require('mongoose');
var Schema = mongoose;

var PublicationSchema = Schema({
    text: string,
    file: String,
    crated_at: String,
    user: { type: Schema.ObjectId, ref: 'User'},
    location: String
});

module.exports = mongoose.model('Publication', PublicationSchema);