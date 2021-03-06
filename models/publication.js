'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = Schema({
    text: String,
    image: String,
    created_at: String,
    date: String,
    user: { type: Schema.ObjectId, ref: 'User' },
    like: [String],
    location: String
});

module.exports = mongoose.model('Publication', PublicationSchema);