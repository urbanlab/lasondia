function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

var recordId = window.location.hash.substr(1, window.location.hash.length);

var data
var music_checked = true
var voice_checked = true
var label_checked = true
var p

//recordId = "record-ZdUPkj";
var path = "/records/"+recordId+"/";

function loadedSound() {
  initialize_peaks();
}

readTextFile(path+"fullRecord_voices.json", function(text) {
    data = JSON.parse(text);
    $('#create_audio').html("<audio onloadeddata=\"loadedSound()\" preload=\"true\" controls id=\"audio\"><source src=\"" + path + "fullRecord.wav\" id=\"audio_source\" type=\"audio/wav\"></audio><script src=\"/node_modules/peaks.js/peaks.js\"></script>");
    //$('#create_audio').html("<audio onloadeddata=\"loadedSound()\" controls autoplay id=\"audio\"><source src=\"" + path + "fullRecord.wav\" id=\"audio_source\" type=\"audio/wav\"></audio><script src=\"/node_modules/peaks.js/peaks.js\"></script>");
});

readTextFile(path + "date.json", function(text) {
  var date = JSON.parse(text).date;
  var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var frenchDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  var french = frenchDays[days.indexOf(date.substr(0, 3))];
  $('#title').html("Cours du " + french + " " + date.substr(4, date.length));
});

function getSeconds(date) {
    var a = date.split(':');
    //var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) + (+a[3]) / 1000;
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return (seconds);
}

function getSecondsMS(date) {
    var a = date.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]) + (+a[2]) / 1000;
    return (seconds);
}

var gommettes = []
readTextFile(path + "events.json", function(text) {
  var gom = JSON.parse(text);
  for (i in gom) {

    gommettes.push({
      time: getSecondsMS(gom[i].time),
      editable: false,
      color: "#ff0000",
      labelText: ""
    });
  }
});

function zoomOut() {
  p.zoom.zoomOut();
}

function zoomIn() {
  p.zoom.zoomIn();
}

function initialize_peaks() {
    setTimeout(() => {
        (function(Peaks) {

            var tab_segments = [];
            var tab_seg = [];
            for (i in data) {
                tab_segments.push({
                    startTime: getSeconds(data[i].time),
                    endTime: getSeconds(data[i].end_time),
                    editable: false,
                    color: data[i].music ? '#195C84' : '#1FB671',
                    labelText: data[i].music ? '' : data[i].voice,
                    segmentInMarker: data[i].music ? '#195C84' : '#1FB671',
                    segmentOutMarker: data[i].music ? '#195C84' : '#1FB671'
                });
            }
            var j = 0;
            for (i = 0; i < tab_segments.length; i += 1) {
                if (i == 0) {
                    tab_seg.push(tab_segments[i]);
                } else {
                    if (data[i].music && data[i - 1].music) {
                        tab_seg[j].endTime = tab_segments[i].endTime;
                        tab_seg[j].labelText += ' ' + tab_segments[i].labelText;
                    } else {
                        tab_seg.push(tab_segments[i]);
                        j += 1;
                    }
                }
            }
            var myAudioContext = new AudioContext();
            var options = {
                container: document.getElementById('peaks-container'),
                mediaElement: document.querySelector('audio'),
                audioContext: myAudioContext,
                zoomLevels: [512, 1024, 2048, 4096],
                // Colour for the zoomed in waveform
                zoomWaveformColor: 'rgba(0, 225, 128, 1)',
                // Colour for the overview waveform
                overviewWaveformColor: 'rgba(0,0,0,0.2)',
                // Colour for the overview waveform rectangle
                // that shows what the zoom view shows
                overviewHighlightRectangleColor: 'grey',
                // Colour for the in marker of segments
                inMarkerColor: '#a0a0a0',
                // Colour for the out marker of segments
                outMarkerColor: '#a0a0a0',
                // Colour of the play head
                playheadColor: 'rgba(0, 0, 0, 1)',
                // Colour of the play head text
                playheadTextColor: '#aaa',
                // Colour of the axis gridlines
                axisGridlineColor: '#ccc',
                // Colour of the axis labels
                axisLabelColor: '#aaa',
                // Zoom view adapter to use. Valid adapters are:
                // 'animated' (default) and 'static'
                zoomAdapter: 'animated',
                // Array of initial segment objects with startTime and
                // endTime in seconds and a boolean for editable.
                // See below.
                segments: [{
                    startTime: 120.5,
                    endTime: 140.2,
                    editable: false,
                    color: "#ff0000",
                    labelText: "My label"
                }, {
                    startTime: 220,
                    endTime: 240,
                    editable: false,
                    color: "#00ff00",
                    labelText: "My Second label"
                }],

                // Array of initial point objects
                points: [{
                    time: 150,
                    editable: false,
                    color: "#00ff00",
                    labelText: "A point"
                }, {
                    time: 160,
                    editable: false,
                    color: "#00ff00",
                    labelText: "Another point"
                }]
            }
            p = Peaks.init({
                container: options.container,
                mediaElement: options.mediaElement,
                audioContext: options.audioContext,
                zoomLevels: options.zoomLevels,
                segments: tab_seg,
                zoomAdapter: options.zoomAdapter,
                playheadColor: options.playheadColor,
                points: gommettes
            });

            p.on('peaks.ready', function() {
                // do something when the waveform is displayed and ready
            });

            p.on('zoom.update', function(before, after) {
              console.log(before);
              console.log(after);
            });
        })(peaks);
    }, 50);
}

function toggleMusic() {
    music_checked = !music_checked;
}

function toggleVoice() {
    voice_checked = !voice_checked;
}

function toggleLabel() {
    label_checked = !label_checked;
}
