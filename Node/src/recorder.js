var mic, recorder, soundFile;
var gommettesVolume = [];
var gommettesInfos = [];
var gommettesStep = 10;
var gommettesSize = 200;

var trueRecord = false;

var jsonRecord = {}; // new  JSON Object


function setup() {

  createCanvas(windowWidth, windowHeight);
  background(250);
  fill(0);

  // create an audio in
  //mic = new p5.AudioIn();
  // users must manually enable their browser microphone for recording to work properly!
  //mic.start();

  var max = int(width/gommettesStep);
  console.log("Max is : " + max);
  for (i = 0; i < max; i++) {
    gommettesVolume.push(0);
  }

}

window.setInterval(addRecord, 75);

function addRecord(){
  // Get the overall volume (between 0 and 1.0)
  //var volume = mic.getLevel();
  gommettesVolume.push(volume);

  var len = gommettesVolume.length;
  var max = int(width/gommettesStep);
  if(len >= max){
    //console.log("Volume is : " + volume);
    gommettesVolume.splice(0, 1);
  }

}

function addGomette(numGomette){
  var gomette = {time:new Date(), eventType:numGomette, color:"#FB4807"};
  socket.emit('event', gomette);
}

function draw() {

  background(255);

  //addRecord();

/*
  //console.log("Volume : " + volume);
  if(trueRecord == false && record == true){
    // Tell recorder to record to a p5.SoundFile which we will use for playback
    trueRecord = true;
    recorder.record(soundFile);
  }

  if(trueRecord == true && record == false){
    // stop recorder, and send the result to soundFile
    trueRecord = false;
    recorder.stop();

    console.log(recorder);
  //  saveSound(soundFile); // save file


  }
  */

  if(record == 1 && mic.enabled){
    fill(100, 100, 200, 50);
  }else{
    fill(100, 100, 100, 50);
  }

  var len = gommettesVolume.length;
  for (i = 0; i < len; i++) {
    //console.log("Ellipse " + i);
    ellipse(width - len*gommettesStep + i*gommettesStep, 0.5*height, gommettesSize * gommettesVolume[i], gommettesSize * gommettesVolume[i]);
  }


}
