//-------------------------------------------------------------------------------------------------------------
// Import modules
//-------------------------------------------------------------------------------------------------------------

var tmp = require('tmp'); // Tmp allows to create random file name
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

//-------------------------------------------------------------------------------------------------------------
// Initialize the server's working variables
//-------------------------------------------------------------------------------------------------------------

var records_path = String(process.cwd()).concat('/records/');
var eventsToJson = [];
var recordsToJSON = [];
var records = [];

//-------------------------------------------------------------------------------------------------------------
// Define utility functions
//-------------------------------------------------------------------------------------------------------------

function getSeconds(date) {
  // Convert a hh:mm:ss - formatted date into an amount of seconds
  var a = date.split(':');
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return (seconds);
}

function getSecondsMS(date) {
  // Convert a hh:mm:ss:msms - formatted date into an amount of seconds
    var a = date.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]) + (+a[2]) / 1000;
    return (seconds);
}

function compare_dates(d1, d2) {
  // Compares two dates, d1 and d2, written in the format 'FrenchDay DD/MM/YYYY hh:mm:ss'.
  // Returns 1 if d1 > d2, 0 if d1 == d2, and -1 if d1 < d2.
  if(d1 == d2) {return 0};
  var d1_array = d1.split(' '),
      d1_day = d1_array[1],
      d1_hour = d1_array[2];
  var d2_array = d2.split(' '),
      d2_day = d2_array[1],
      d2_hour = d2_array[2];

  if(d1_day != d2_day) {
    var d1_day_array = d1_day.split('/'),
        d2_day_array = d2_day.split('/');
    var d1_day_value = parseInt(d1_day_array[0]) + 100 * parseInt(d1_day_array[1]) + 10000*parseInt(d1_day_array[2]),
        d2_day_value = parseInt(d2_day_array[0]) + 100 * parseInt(d2_day_array[1]) + 10000*parseInt(d2_day_array[2]);
    return (d1_day_value > d2_day_value) ? 1 : -1;
  } else {
    return (d1_hour > d2_hour) ? 1 : -1;
  }
}


//-------------------------------------------------------------------------------------------------------------
// Define the behaviour of the sockets
//-------------------------------------------------------------------------------------------------------------
io.on('connection', newConnection);

function newConnection(socket){
  // Functions that defines the response of the socket object to the different requests from the client side
  var record_path = null;
  console.log("New socket connection: " + socket.id);

  socket.on('recorder/event', newGommette); // If the client page is the Recorder: add a gommette to the gommette list

  socket.on('home/require_records', function() {
    // If the client page is the home page: sends the dictionnary of the existing records (format : {date:record_path})
    var records_by_date = get_records();
    socket.emit('home/records',records_by_date);
  })

  socket.on('listen_and_edit/require_initialization', function(record_id) {
    // If the client page is the listen/edit page: sends the background segments as well as the last saved gommettes/loop segments
    record_path = './records/' + record_id + '/';
    var data = fetch_initialization_data(record_path);
    var date = data.date,
        gommettes = data.gommettes,
        loops = data.loops,
        segments = data.segments;
    socket.emit('listen_and_edit/initialization_data', {'date': date, 'gommettes': gommettes, 'loops': loops, 'segments': segments});
  });

  socket.on('listen_and_edit/save_annotations', function(data) {
    // If the client page is the listen/edit page: save the gommettes and loop segments
    var save = JSON.stringify(data);
    fs.writeFileSync(record_path + 'events.json', save);
  })
}


function newGommette(gommetteDatas) {
  // Processing of the 'recorder/event' request
  console.log("New gomette : " + JSON.stringify(gommetteDatas));
  eventsToJson.push(gommetteDatas);
}


function get_records() {
  // Processing of the 'home/require_records' request
  var record_dates = [];
  var valid_records = [];
  var records = fs.readdirSync(records_path);
  var record_folders = records.map((folderName) => records_path + folderName);
  record_folders.forEach(function(path, index) {
    var record_id = records[index];
    var segments_path = path +  '/fullRecord_voices.json';
    var date_path = path + '/date.json';
    if(fs.existsSync(segments_path) && fs.existsSync(date_path)) {
      var date = fs.readFileSync(date_path, 'utf8');
      date = JSON.parse(date).date;
      valid_records.push(record_id);
      record_dates.push(date);
    };
  });
  var chronological_order = record_dates.map((date, index) => index);  // We order the dta by recording date
  chronological_order = chronological_order.sort((index1, index2) => compare_dates(record_dates[index1], record_dates[index2]));
  record_dates = record_dates.map((date, index) => record_dates[chronological_order[index]]);
  valid_records = valid_records.map((record, index) => valid_records[chronological_order[index]])

  var result = {};
  record_dates.forEach((date, index) => {result[date] = valid_records[index]});
  return result;
}


function fetch_initialization_data(record_path) {
  // Processing of the 'listen_and_edit/require_initialization' request
  var dateFile_content = fs.readFileSync(record_path + 'date.json', 'utf8');
  var date = JSON.parse(dateFile_content).date;

  var annotation_content = fs.readFileSync(record_path + 'events.json', 'utf8');
  var events = JSON.parse(annotation_content);
  var gommettes = events.gommettes;
  var loops = events.loops;

  var segmentFile_content = fs.readFileSync(record_path + 'fullRecord_voices.json', 'utf8');
  var periods = JSON.parse(segmentFile_content);
  var segments = [];
  periods.forEach((period, index) => {
    var new_bg_segment = {
        startTime: getSeconds(period.time),
        endTime: getSeconds(period.end_time),
        editable: false,
        color: period.music ? '#195C84' : '#1FB671',  
        id: 'static_' + String(index)
    }
    segments.push(new_bg_segment);
  });
  var data = {'date': date, 'gommettes': gommettes, 'loops':loops, 'segments': segments};
  return data;
}

//-------------------------------------------------------------------------------------------------------------
// Define a binary server, used for audio acquisition (Recorder client page).
// In this binary server, once the audio stream is closed, the data is sent to the Google Speech Python client script
// to be classified as voice or as music.
//-------------------------------------------------------------------------------------------------------------

binaryServer = BinaryServer({port: 9001});
binaryServer.on('connection', function(client) {
    console.log('new connection on stream server');

    client.on('stream', function(stream, meta) {

        // Erase gommetttes
        eventsToJson = [];

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
            sampleRate: 44100,
            bitDepth: 16
        });

        console.log('new stream');
        stream.pipe(fileWriter);


        stream.on('end', function() {
            console.log("End record.");
            // Write wav file
            fileWriter.end();
            console.log('wrote to file ' + outFile);

            // Write JSON Events
            var initial_annotations = {'gommettes': eventsToJson, 'loops':[]};
            fs.writeFileSync(outFolder + '/events.json', JSON.stringify(initial_annotations));
            console.log('Full JSON written : ' + JSON.stringify(eventsToJson));

            var PythonShell = require('python-shell');
            var options = {
              scriptPath: __dirname + '/python_code',
              args: ['fullRecord.wav',outFolder]
            };
            PythonShell.run('speechtotext.py',options, function (err,results) {
              if(err) console.log('error', err);
              console.log('results: %j', results);
            });
        });
    });
});

//-------------------------------------------------------------------------------------------------------------
// Define the public ressources which are served and the path to access to them.
//-------------------------------------------------------------------------------------------------------------

app.use('/src', express.static(__dirname + '/src'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/records', express.static(__dirname + '/records'));

//-------------------------------------------------------------------------------------------------------------
// Define the routing system
//-------------------------------------------------------------------------------------------------------------

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/src/home/home.html');
});

app.get('/record', function(req, res) {
    res.sendFile(__dirname + '/src/record/record.html');
});

app.get('/analysis', function(req, res) {
    res.sendFile(__dirname + '/src/analysis/analysis.html');
});

app.get('/progress', function(req, res) {
    res.sendFile(__dirname + '/src/progress/progress.html');
});

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/src/all_pages/error404.html');
});

//-------------------------------------------------------------------------------------------------------------
// Start listening on port 8000
//-------------------------------------------------------------------------------------------------------------

http.listen(8000, function(){
  console.log('port 8000')
});