'use strict'

var express = require('express');
var bodyParser =  require('body-parser');

var app = express();

// load routes
var user_routes = require('./routes/user');
var follows_routes = require('./routes/follows');

// middlewars
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors

// routes

app.use('/api', user_routes)
app.use('/api', follows_routes)


// export
module.exports = app;