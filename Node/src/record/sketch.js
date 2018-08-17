//-------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
// Here we define the behaviour of the p5.js application using the preload(), setup() and draw() functions.
// We also define the actions of the add-a-gommette buttons and the recording-on/off button.
// This script focuses on user interface and vizualization: the recording of the sound stream is handled
// in record_stream_server.js, and the only interaction with the server here is sending a gommette when a
// gommette button is clicked.
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------
// Define the interface's variables
//--------------------------------------------------------------------------------------------------------------

// Variables used for representing the timeline
var gommette_icons;
var gommette_line;
var volume_line;
var timeline_step = 10;
var timeline_size;
var y_volume;
var y_gommettes;

// Variables used for adding a gommette
var chosen_gommette = null;
var nb_gommettes = 0;

// Variable that indicates if the audio is being recorded
var recording = false;

//--------------------------------------------------------------------------------------------------------------
// Define the drawing functions. See the p5.js documentation.
//--------------------------------------------------------------------------------------------------------------

function preload() {
	// This function executes before the canvas is loaded. For each gommette, we
	// load the corresponding image to be able to draw it on the timeline
	gommette_icons = gommettes.map((gom) => loadImage(gom.image_src));
}

function setup() {
	// This function is executed after preload; it is the function that first draws
	// the canevas. Here we draw the canevas and its empty background, and we initialize
	// the state variables used for representing the timeline.
    createCanvas(windowWidth, windowHeight);
    background(250);
    fill(0);

    timeline_size = int(windowWidth / timeline_step);
    volume_line = new Array(timeline_size).fill(null);
    gommette_line = new Array(timeline_size).fill(null);

    y_volume = 0.4 * windowHeight;
    y_gommettes = 0.445 * windowHeight; 
}

function draw() {
	// This function is periodically called to create the next frame of the visualization and draw it.
	// To draw the timeline, we have a list, volume_line; when using the micro in record mode the last
	// measure is added to the canevas' right (first element of volume_line) as a circle and then moved
	// to the left of the canvas at a regular pace (the measure's index is in volume_line is incremented
	// each frame). Finally when the cicle reaches the left of the canevas (last index of the list) it is
	// destroyed. We process the same way to add gommettes to the canvas and move them to the left when
	// a gommette button is clicked. We also draw the current recording time when in recording mode.
	background(255);
	currentTime = Date.now();

	// Update the timeline
	if(recording) {
        duration = new Date(currentTime - startTime);
		update_timeline_contents(true);
        fill(100, 100, 200, 50); // while recording, the timeline appears in blue
	} else {
		update_timeline_contents(false);
        fill(100, 100, 100, 50); // while not recording, it appears in grey
	}
	for(var i = 0; i < timeline_size; i++) {
		var x = windowWidth - i * timeline_step;
		if(volume_line[i] != null) {
			var volume_size = map(volume_line[i], 0, 0.08, 5, 100, true);  // converts a volume value from 0 to 0.08 to an ellipse size from 5 to 100. Any volume > 0.08 will be converted to 100.
	        ellipse(x, y_volume, volume_size, volume_size);
		}
		if(gommette_line[i] != null) {
			var gommette_icon = gommette_icons[gommette_line[i]];
			image(gommette_icon, x, y_gommettes, 50, 80);
		}
	};

	// If in recording mode, display the current recording time
    if (recording) {
        textAlign(CENTER);
        textSize(64);
        text(duration.getMinutes() + ":" + duration.getSeconds() + " " + duration.getMilliseconds(), 0.5 * width, 0.75 * height);
        if (duration.getSeconds() >= min_record_length) {
        	$("#btnStartStop").attr('disabled', false);
    	};
    }
}

function update_timeline_contents(is_recording) {
	// This function updates volume_line and gommette_line each frame. See draw().
	// Note: while recording, even a volume of 0 will be represented by a circle.
	// We use the null value in no-recording mode only, so that no circle will be drawn at all.
	var volume;
	var gommette;
	if(is_recording) {
		volume = (liveVolume != undefined) ? liveVolume : 0; // liveVolume is defined in recorderWav.js, it is the current audio volume. This is the only variable from recorderWav.js that we use here (we use it here because monitoring the microphone twice would be pointless). If liveVolume is undefined, then we consider the volume to be 0.
		gommette = chosen_gommette;
		chosen_gommette = null; // Prevents a gommette from being added several times to the timeline
	} else {
		volume = null;
		gommette = null;
	};

	for(var i=timeline_size - 1; i > 0; i--) {
		volume_line[i] = volume_line[i - 1];
		gommette_line[i] = gommette_line[i - 1];
	};
	volume_line[0] = volume;
	gommette_line[0] = gommette;
}

//--------------------------------------------------------------------------------------------------------------
// Define the behaviour of the clickable buttons.
//--------------------------------------------------------------------------------------------------------------

function add_gommette(gommette_identifier) {
	// Function that is called when a gommette is clicked at the bottom of the screen.

	// Display the chosen gommette at the current time on the timeline
	chosen_gommette = gommette_identifier;
	var gommette = gommettes[gommette_identifier];
	// Format and send the chosen gommette to the server
	var gommette_to_emit = {
        time: parseFloat(duration.getMinutes()) * 60 + parseFloat(duration.getSeconds()) + parseFloat(duration.getMilliseconds()) / 1000,
        color: 'red',
        editable: false,
        labelText: gommette.comment,
        id:  'initial_gommette_' + String(nb_gommettes)
	};
	nb_gommettes ++;
	socket.emit('recorder/event', gommette_to_emit);
}

function start_recording_for_interface() {
	// UI part of the function that is called when the recording button is switched on.
	// Activates recording mode and disables the button for min_record_length seconds.
	recording = true;
	startTime = Date.now();
	$("#btnStartStop").attr('disabled', true);
}

function stop_recording_for_interface() {
	// UI part of the function that is called when the recording button is switched off.
	// Disables recording mode.
	recording = false;
	chosen_gommette = null;
}