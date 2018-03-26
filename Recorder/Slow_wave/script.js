var mic;

var arr = [];
var timestamps = [];

var button;

function toggleMic() {
    if (mic.getLevel() > 0) {
        mic.stop();
    } else {
        mic.start();
    }
}

function setup() {
    createCanvas(windowWidth, 300);
    button = createButton('toggle');
    button.mousePressed(toggleMic);
    mic = new p5.AudioIn();
    mic.start();
}

function draw() {
    background(0, 0, 255);
    var vol = mic.getLevel();
    var currentdate = new Date();
    arr.push(vol);
    timestamps.push(currentdate);
    //currY = map(vol, 0, 1, height / 2, 0)
    //translate(0, height / 2 - currY)
    stroke(255);
    noFill();
    beginShape();
    for (let i = 0; i < arr.length; i++) {
        var y = map(arr[i], 0, 1, height / 2, 0);
        vertex(i, y);
    }
    endShape();

    if (arr.length > width - 10) {
        arr.splice(0, 1);
    }

    stroke(255, 0, 0);
    line(arr.length, 0, arr.length, height);
}