var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/src/home.html');
});

app.get('/record', function(req, res) {
    res.sendfile(__dirname + '/src/record.html');
});

app.get('/analysis', function(req, res) {
    res.sendfile(__dirname + '/src/analysis.html');
});

app.get('/home', function(req, res) {
    res.sendfile(__dirname + '/src/home.html');
});

app.get('/progress', function(req, res) {
    res.sendfile(__dirname + '/src/progress.html');
});

app.get('/*', function(req, res) {
    res.sendfile(__dirname + '/src/error404.html');
});

app.listen(8000);