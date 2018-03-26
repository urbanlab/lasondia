var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();

// Socket section
// var socket = require('socket.io');
// var io = socket(server);
// io.sockets.on('connection', newConnection);
// function newConnection(socket){
//     console.log("New connection: " + socket.id);
// }

app.use('/src', express.static(__dirname + '/src'));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/src/home.html');
});

app.get('/record', function(req, res) {
    res.sendfile(__dirname + '/src/record.html');
});

app.get('/analysis', function(req, res) {
    res.sendfile(__dirname + '/src/analysis.html');
});

app.get('/*', function(req, res) {
    res.sendfile(__dirname + '/src/error404.html');
});

app.listen(3000);
