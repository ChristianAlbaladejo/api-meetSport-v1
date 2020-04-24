'use strict'

var express = require('express');
var bodyParser =  require('body-parser');

var app = express();

// load routes

// middlewars
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors

// routes

app.get('/pruebas', (req,res)=>{
    res.status(200).send({
        message: 'Primera prueba'
    })
});


// export
module.exports = app;