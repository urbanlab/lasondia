//-------------------------------------------------------------------------------------------------------------
// Define working variables
//-------------------------------------------------------------------------------------------------------------
var mic, recorder, soundFile;
var gommettes = [];
var gommettesInfos = [];
var gommettesStep = 10;
var nb_gommettes = 0;

var jsonRecord = {}; // new  JSON Object

var gomette1, gomette2, gomette3, gomette4, gomette5, gomette6;

function preload() {
    gomette1 = loadImage('../images/Gommettes/SansOmbre/08.png');
    gomette2 = loadImage('../images/Gommettes/SansOmbre/09.png');
    gomette3 = loadImage('../images/Gommettes/SansOmbre/10.png');
    gomette4 = loadImage('../images/Gommettes/SansOmbre/11.png');
    gomette5 = loadImage('../images/Gommettes/SansOmbre/12.png');
    gomette6 = loadImage('../images/Gommettes/SansOmbre/30.png');
}

var currentTime, startTime, duration;

//-------------------------------------------------------------------------------------------------------------
// Functions used by p5.js (processing for Javascript) to draw the graphical interface 
//-------------------------------------------------------------------------------------------------------------

function setup() {
    // Initialization of the drawing when the page is loaded
    createCanvas(windowWidth, windowHeight);
    background(250);
    fill(0);

    var max = int(width / gommettesStep);
    console.log("Max is : " + max);
    for (i = 0; i < max; i++) {
        addRecord(0);
    }

    currentTime = new Date();
    startTime = new Date();

}

function draw() {
    // This function is called periodically (about 30FPS) in order to draw the graphical interface

    // No background image in the canvas
    background(255);

    // Draw the timeline
    currentTime = Date.now();

    if (record == true) {
        fill(100, 100, 200, 50);
        duration = new Date(currentTime - startTime);
    } else {
        fill(100, 100, 100, 50);
        duration = new Date(currentTime - currentTime);
    }

    addRecord(0);
    drawTimeline();

    // Draw the Timer when recording
    if (record == true) {
        textAlign(CENTER);
        textSize(64);
        text(duration.getMinutes() + ":" + duration.getSeconds() + " " + duration.getMilliseconds(), 0.5 * width, 0.75 * height);
    }

    if (duration.getSeconds() >= 18) {
        document.getElementById("btnStartStop").disabled = false;
    }
}

//-------------------------------------------------------------------------------------------------------------
// functions called by the draw process
//-------------------------------------------------------------------------------------------------------------

function drawTimeline() {
    // Function used in draw(). It draws the time representation of the audio volume, and, when a gommette is
    // added, it represents this gommette under the tieline.
    var len = gommettes.length;
    for (i = 0; i < len; i++) {

        var posX = width - len * gommettesStep + i * gommettesStep;
        var posY = 0.4 * height;

        //console.log("Volume is : ", gommettesVolume[i]);
        var realSize = map(gommettes[i].volume, 0, 0.08, 5, 100, true);
        ellipse(posX, posY, realSize, realSize);

        posX = width - len * gommettesStep + i * gommettesStep;
        posY = 0.5 * height;

        switch (gommettes[i].num) {
            case 1:
                image(gomette1, posX, posY, 25, 40);
                break;
            case 2:
                image(gomette2, posX, posY, 25, 40);
                break;
            case 3:
                image(gomette3, posX, posY, 25, 40);
                break;
            case 4:
                image(gomette4, posX, posY, 25, 40);
                break;
            case 5:
                image(gomette5, posX, posY, 25, 40);
                break;
            case 6:
                image(gomette6, posX, posY, 25, 40);
                break;
            default:
                // No image
        }
    }

}

function addRecord(numGomette) {
    // Get the overall volume (between 0 and 1.0)
    var myVolume;

    if (record == true) {
        myVolume = liveVolume;
    } else {
        myVolume = 0;
    }

    if (liveVolume != undefined) {
        var oneGomette = { volume: myVolume, num: numGomette };
        gommettes.push(oneGomette);
    }

    var len = gommettes.length;
    var max = int(width / gommettesStep);
    if (len >= max) {
        //console.log("Volume is : " + volume);
        gommettes.splice(0, 1);
    }

}

//-------------------------------------------------------------------------------------------------------------
// Function used to add gommettes events.json when the user adds a gommette via a button (see html code)
// Communicates with the express server.
//-------------------------------------------------------------------------------------------------------------

function addGomette(numGomette) {
    // When the user clicks on a gommette button while in record mode, requests the server to add a gommette to events.json
    console.log('Gommette type: ', numGomette)
    console.log('Gommette types are not used now, they should be deleted');

    nb_gommettes += 1;
    var gomette = {
        time: parseFloat(duration.getMinutes()) * 60 + parseFloat(duration.getSeconds()) + parseFloat(duration.getMilliseconds()) / 1000,
        color: 'red',
        editable: false,
        id:  'initial_gommette_' + String(nb_gommettes)
    };

    console.log('Adding gomette, client side', JSON.stringify(gomette));
    addRecord(numGomette);

    socket.emit('recorder/event', gomette);
}


//-------------------------------------------------------------------------------------------------------------
// Behaviour of the record/stop button
//-------------------------------------------------------------------------------------------------------------

function startRecordDisplay() {
    document.getElementById("btnStartStop").disabled = true;
    startTime = Date.now();
}

function stopRecordDisplay() {

}