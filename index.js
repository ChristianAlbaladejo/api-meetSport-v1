'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('process.env.MONGODB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Premio oleh");

        // Create server
        app.listen(port,() =>{
            console.log('Server is running in http://localhost:3800');
        });
    })
    .catch(err => console.log(err));

