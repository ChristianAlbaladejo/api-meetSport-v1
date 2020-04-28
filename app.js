'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// load routes
var user_routes = require('./routes/user');
var follows_routes = require('./routes/follows');
var publication_routes = require('./routes/publication')
var message_routes = require('./routes/message');

// middlewars
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors
// configure http headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});


// routes

app.use('/api', user_routes)
app.use('/api', follows_routes)
app.use('/api', publication_routes)
app.use('/api', message_routes)


// export
module.exports = app;