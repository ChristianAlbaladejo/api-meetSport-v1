'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;
const config = require('./config')


mongoose.Promise = global.Promise;
mongoose.connect(config.db, {
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

