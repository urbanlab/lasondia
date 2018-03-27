var mic, recorder, soundFile;
var gommettes = [];
var gommettesInfos = [];
var gommettesStep = 10;

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
    addRecord(0);
  }

}

//window.setInterval(addRecord, 25);

function addRecord(numGomette){
  // Get the overall volume (between 0 and 1.0)
  var myVolume;

  if(record == true){
    myVolume = liveVolume;
  }else{
    myVolume = 0;
  }

  if(liveVolume != undefined){
    var oneGomette = {volume:myVolume, num:numGomette};
    gommettes.push(oneGomette);
  }

  var len = gommettes.length;
  var max = int(width/gommettesStep);
  if(len >= max){
    //console.log("Volume is : " + volume);
    gommettes.splice(0, 1);
  }

}

function addGomette(numGomette){
  var gomette = {time:new Date(), eventType:numGomette, color:"#FB4807"};
  addRecord(numGomette);
  socket.emit('event', gomette);
}

function draw() {

  background(255);

  if(record == true){
    fill(100, 100, 200, 50);
  }else{
    fill(100, 100, 100, 50);
  }

  addRecord(0);

  var len = gommettes.length;
  for (i = 0; i < len; i++) {
    //console.log("Volume is : ", gommettesVolume[i]);
    var realSize = map(gommettes[i].volume, 0, 0.01, 5, 200, true);
    ellipse(width - len*gommettesStep + i*gommettesStep, 0.5*height, realSize, realSize);

    if(gommettes[i].num != 0){
        ellipse(width - len*gommettesStep + i*gommettesStep, 0.5*height + 50, 25, 25);
    }
  }


}
