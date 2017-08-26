var express = require('express');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var rfs = require('rotating-file-stream');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var Raven = require('raven');
Raven.config('https://3ca3b6b5199e44c8bb402161f0079cee:6894613ae05d42febde0ddf6032bc2bc@sentry.io/182038').install();
var conf = require('./conf');


conf.MONGOOSE(mongoose);


conf.MW(app, express, morgan, path, fs, rfs, cors);


conf.ROUTES(app);
//require('./routes/socket')(io);


server.listen(conf.PORT);
console.log('Server running on ' + conf.IP + ':' + conf.PORT);
