var mic, recorder, soundFile;
var gommettes = [];
var gommettesInfos = [];
var gommettesStep = 10;

var trueRecord = false;

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
  drawTimeline();
  drawGommettes();
}

function drawTimeline(){
  var len = gommettes.length;
  for (i = 0; i < len; i++) {

    var posX = width - len*gommettesStep + i*gommettesStep;
    var posY = 0.5*height;

    //console.log("Volume is : ", gommettesVolume[i]);
    var realSize = map(gommettes[i].volume, 0, 0.01, 5, 200, true);
    ellipse(posX, posY, realSize, realSize);
  }
}

function drawGommettes(){

  var len = gommettes.length;

  for (i = 0; i < len; i++) {

    var posX = width - len*gommettesStep + i*gommettesStep;
    var posY = 0.75*height;


    switch (gommettes[i].num) {
      case 1:
      image(gomette1, posX, posY, 25, 25);
      break;
      case 2:
      image(gomette2, posX, posY, 25, 25);
      break;
      case 3:
      image(gomette3, posX, posY, 25, 25);
      break;
      case 4:
      image(gomette4, posX, posY, 25, 25);
      break;
      case 5:
      image(gomette5, posX, posY, 25, 25);
      break;
      case 6:
      image(gomette6, posX, posY, 25, 25);
      break;
      default:
      // No image
    }
  }
}
