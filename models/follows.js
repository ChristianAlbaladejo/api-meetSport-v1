'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowsSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    followed: { type: Schema.ObjectId, ref: 'User' }
});
FollowsSchema.static.eliminar = function (object, cb) {

    Follow.find(object).remove(cb);

}

module.exports = mongoose.model('Follow', FollowsSchema);