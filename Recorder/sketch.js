var mic, recorder, soundFile;
var gommettesVolume = [];
var gommettesStep = 10;
var gommettesSize = 200;

var trueRecord = false;

function setup() {
  
  createCanvas(windowWidth, windowHeight);
  background(250);
  fill(0);

  // create an audio in
  mic = new p5.AudioIn();
  // users must manually enable their browser microphone for recording to work properly!
  mic.start();
  
  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile('mySound.wav');

  var len = gommettesVolume.length;
  for (i = 0; i < len; i++) {
    gommettesVolume[i] = 0;
  }
  
}

function draw() {
  
  background(250);
  
  // Get the overall volume (between 0 and 1.0)
  var volume = mic.getLevel();
  gommettesVolume.push(volume);
  
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
    saveSound(soundFile); // save file
    
  }

  if(record == 1 && mic.enabled){
    fill(100, 100, 200, 50);
  }else{
    fill(100, 100, 100, 50);  
  }
  
  var len = gommettesVolume.length;
  for (i = 0; i < len; i++) {
    ellipse(width - len*gommettesStep + i*gommettesStep, 0.5*height, gommettesSize * gommettesVolume[i], gommettesSize * gommettesVolume[i]);
  }
  
  
}