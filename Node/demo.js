// Tmp allows to create random file name
var tmp = require('tmp');
tmp.setGracefulCleanup();

var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var BinaryServer = require('binaryjs').BinaryServer;
var wav = require('wav');

var port = 3700;

binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');


  client.on('stream', function(stream, meta) {

    var tmpobj = tmp.dirSync({ template: './records/tmp-XXXXXX' });
    var outFile = tmpobj.name + "/fullRecord.wav";
    //console.log('Future file : ' , outfile);

    var fileWriter = new wav.FileWriter(outFile, {
      channels: 1,
      sampleRate: 48000,
      bitDepth: 16
    });

    console.log('new stream');
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
      console.log('wrote to file ' + outFile);
    });
  });
});

// Socket section

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log("New connection: " + socket.id);
}

app.use('/src', express.static(__dirname + '/src'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/src/home.html');
});

app.get('/record', function(req, res) {
  res.sendFile(__dirname + '/src/record.html');
});

app.get('/analysis', function(req, res) {
  res.sendFile(__dirname + '/src/analysis.html');
});

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/src/error404.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
