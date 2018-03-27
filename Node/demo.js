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

// Socket section
io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log("New socket connection: " + socket.id);
  socket.on('event', newGommette);
  socket.on('recordList', sendRecordList);
}

function newGommette(gommetteDatas) {
    console.log("New gomette !!!!!!!! : " + JSON.stringify(gommetteDatas));
    eventsToJson.push(gommetteDatas);
}

function sendRecordList(){
  // Lire le répertoire
  // Constituer le JSON
  // Envoyer le JSON
}

binaryServer = BinaryServer({port: 9001});
binaryServer.on('connection', function(client) {
    console.log('new connection on stream server');

    client.on('stream', function(stream, meta) {

        // New directory with any new stream
        var tmpobj = tmp.dirSync({ template: './records/record-XXXXXX' });
        outFolder = tmpobj.name;
        var outFile = outFolder + "/fullRecord.wav";
        tmpobj = tmp.fileSync(outFile);
        tmpobj.removeCallback();
        //
        console.log('Creation new file : ', outFile);

        var fileWriter = new wav.FileWriter(outFile, {
            channels: 1,
            sampleRate: 48000,
            bitDepth: 16
        });

        console.log('new stream');
        stream.pipe(fileWriter);

        stream.on('end', function() {
            console.log("End record.");
            // Write wav file
            fileWriter.end();
            // Write JSON Events
            fs.writeFile(outFolder + '/events.json', JSON.stringify(eventsToJson));
            console.log('wrote to file ' + outFile);
        });
    });
});

app.use('/src', express.static(__dirname + '/src'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/images', express.static(__dirname + '/images'));

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
