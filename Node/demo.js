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
var recordsToJSON = [];
var records = [];

// Socket section
io.on('connection', newConnection);

function newConnection(socket){
  console.log("New socket connection: " + socket.id);
  socket.on('event', newGommette);
//  socket.on('recordList', sendRecordList);
  socket.on('askRecord', function(data) {
    sendRecordList();

    var recordId = data.recordSlug.substr(1,data.recordSlug.length);
    console.log(recordId);



  });

  sendRecordList();

  socket.emit('recordList', { recordList: records });
}

function newGommette(gommetteDatas) {
    console.log("New gomette !!!!!!!! : " + JSON.stringify(gommetteDatas));
    eventsToJson.push(gommetteDatas);
}

function sendRecordList(){
  // Lire le répertoire
  recordsToJSON = []
	var liste_dates = []
	// Lire le répertoire
	const testFolder = String(process.cwd()).concat('/records/');
	const fs = require('fs');
	var liste_files = fs.readdirSync(testFolder);
	for (var i = 0 ; i < liste_files.length ; i++) {
		var res = testFolder.concat(String(liste_files[0]));
	  var stats = fs.statSync(res);
		var mtime = stats.mtime;
	  liste_dates.push(mtime);
	};

	var liste = [liste_files, liste_dates];
	recordsToJSON = JSON.stringify(liste);
	records = liste;
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
            var PythonShell = require('python-shell');
            var options = {
              scriptPath: __dirname + '/python_code',
              args: ['fullRecord.wav',outFolder]
            };
            PythonShell.run('speechtotext.py',options, function (err,results) {
              console.log('results: %j', results);
            });
        });
    });
});

app.use('/src', express.static(__dirname + '/src'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/records', express.static(__dirname + '/records'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/src/home.html');
});

app.get('/record', function(req, res) {
    res.sendFile(__dirname + '/src/record.html');
});

app.get('/analysis', function(req, res) {
    res.sendFile(__dirname + '/src/analysis.html');
});
//
// app.get('/analysis/:recordslug', function(req, res) {
//     res.sendFile(__dirname + '/src/analysis.html'); // ?record='+req.params.recordslug
// });

app.get('/progress', function(req, res) {
    res.sendfile(__dirname + '/src/progress.html');
});

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/src/error404.html');
});

app.listen(8000)
