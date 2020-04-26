'use strict'

var express = require('express');
var FollowsController = require('../controllers/follow');
var api = express.Router();
var md_auth = require('../middlewares/authentificated');

api.post('/follow', md_auth.ensureAuth, FollowsController.saveFollow);
api.delete('/deleteFollow/:id', md_auth.ensureAuth, FollowsController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowsController.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowsController.getFollowedUsers);
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowsController.getMyfollows);

module.exports = api;