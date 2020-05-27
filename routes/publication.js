'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authentificated')

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publications' });

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication)
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications)
api.get('/publications-user/:user/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser)
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication)
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication)
api.post('/upload-file-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadFile)
api.get('/get-file-pub/:id', PublicationController.getFileFile)
api.post('/like/:id', md_auth.ensureAuth,PublicationController.like)
api.post('/dislike/:id', md_auth.ensureAuth, PublicationController.dislike)
module.exports = api;