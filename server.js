var express = require('express'); 
var app = express(); 
var port = process.env.PORT || 4200; 
var morgan = require('morgan');
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var router = express.Router(); 
var appRoutes = require('./app/routes/api')(router); 
var path = require('path');
var passport = require('passport'); 
var social = require('./app/passport/passport')(app, passport); 
var homeRoutes = require('./app/routes/homeApi')(router);
var postnewsApi = require('./app/routes/postnewsApi')(router);
var adminApi = require('./app/routes/adminApi')(router);


// app.use(function(req, res, next) { 
//     res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
//     res.header("Access-Control-Allow-Origin", "http://localhost");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
app.use(morgan('dev')); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/public')); 
app.use('/api', appRoutes);
app.use('/api', homeRoutes);
app.use('/api', postnewsApi);
app.use('/api', adminApi);


mongoose.connect('mongodb://localhost:27017/tutorial', function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err); 
    } else {
        console.log('Successfully connected to MongoDB'); 
    }
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html')); 
});

// Start Server
app.listen(port, function() {
    console.log('Running the server on port ' + port); 
});
