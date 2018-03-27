// Tmp allows to create random file name
var tmp = require('tmp');
tmp.setGracefulCleanup();
var outFile;
var outFolder;

var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var BinaryServer = require('binaryjs').BinaryServer;
var wav = require('wav');

var port = 3700;

var eventsToJson = [];

binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');

  client.on('stream', function(stream, meta) {

    var outFile = outFolder + "/fullRecord.wav";
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
      fs.writeFile(outFolder + '/events.json', JSON.stringify(eventsToJson));
      console.log('wrote to file ' + outFile);
    });
  });
});

// Socket section

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log("New connection: " + socket.id);

  var tmpobj = tmp.dirSync({ template: './records/tmp-XXXXXX' });
  outFolder = tmpobj.name;

  socket.on('event', newGommette);

}

function newGommette(gommetteDatas){
  console.log("New gomette !!!!!!!! : " + JSON.stringify(gommetteDatas));
  eventsToJson.push(gommetteDatas);
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

app.get('/home', function(req, res) {
    res.sendfile(__dirname + '/src/home.html');
});

app.get('/progress', function(req, res) {
    res.sendfile(__dirname + '/src/progress.html');
});

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/src/error404.html');
});


app.listen(8000);

