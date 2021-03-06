import interfascia.*;


import dmxP512.*;
import processing.serial.*;

// DMX stuffs ----------------------
DmxP512 dmxOutput;
int universeSize=128;

// MAC PORT
//String DMXPRO_PORT="/dev/tty.usbserial-EN160112";//case matters ! on windows port must be upper cased.
// LINUX PORT
String DMXPRO_PORT="/dev/ttyUSB0";
int DMXPRO_BAUDRATE=115000;

// MAC PORT
//String ARD_PORT="/dev/cu.SLAB_USBtoUART";//case matters ! on windows port must be upper cased.
// LINUX PORT
String ARD_PORT="/dev/ttyUSB1";
int ARD_BAUDRATE=9600;

Serial btnPort;  // Create object from Serial class
char btnValue;      // Data received from the serial port

float realBrightAppart, realBrightCours;
float comdBrightAppart, comdBrightCours;
int sensBrightAppart, sensBrightCours;
float timeAppart, timeCours;
int maxBrightnessA, maxBrightnessS;

GUIController c;
IFTextField tA, tS;
IFLabel lNameA,lValueA;
IFLabel lNameS,lValueS;

void setup() {
  size(600, 400);
  background(255);
  
  // Print serial ports -------------------------
  printArray(Serial.list());
   // I know that the first port in the serial list on my mac
  // is always my  FTDI adaptor, so I open Serial.list()[0].
  // On Windows machines, this generally opens COM1.
  // Open whatever port is the one you're using.
  btnPort = new Serial(this, ARD_PORT, 9600);
  
  dmxOutput=new DmxP512(this,universeSize,false);
  dmxOutput.setupDmxPro(DMXPRO_PORT,DMXPRO_BAUDRATE);
  
  timeCours = millis();
  sensBrightCours = 1;
  maxBrightnessA = 100;
  maxBrightnessS = 100;
  
  c = new GUIController(this);
  tA = new IFTextField("Text Field", 25, 170, 150);
   lNameA = new IFLabel("max. brightness gauche : ", 25, 155);
  lValueA = new IFLabel("", 125, 155);
  
   tS = new IFTextField("Text Field", 25, 215, 195);
lNameS = new IFLabel("max. brightness droite : ", 25, 200);
  lValueS = new IFLabel("", 125, 200);
  
  c.add(tA);
  c.add(tS);
  c.add(lNameA);
  c.add(lValueA);
  c.add(lNameS);
  c.add(lValueS);
  
  tA.addActionListener(this);
  tS.addActionListener(this);
  
}      

void draw() {
  
  background(150);
  fill(230);
  
  lValueA.setLabel(str(maxBrightnessA));
  lValueS.setLabel(str(maxBrightnessS));
  
  if ( btnPort.available() > 0) {  // If data is available,
    changeMode(btnPort.readChar());
  }
  
  // Animation (simple delay based on sum)
  //realBrightCours = 0.75 * realBrightCours + 0.25 * comdBrightCours;
  //realBrightAppart = 0.75 * realBrightAppart + 0.25 * comdBrightAppart;
  float period = 1000;
  // COURS --------------------------------------
  comdBrightCours = (millis() - timeCours) / period;
  if(comdBrightCours >= 1.0){
    comdBrightCours = 1.0;
  }
  if(comdBrightCours <= 0.0){
    comdBrightCours = 0.0;
  }
  if(sensBrightCours == 1){
    realBrightCours = comdBrightCours * maxBrightnessS;
  }  
  if(sensBrightCours == -1){
    realBrightCours = (1.0 - comdBrightCours) * maxBrightnessS;
  }  
  // APPART --------------------------------------
  comdBrightAppart = (millis() - timeAppart) / period;
  if(comdBrightAppart >= 1.0){
    comdBrightAppart = 1.0;
  }
  if(comdBrightAppart <= 0.0){
    comdBrightAppart = 0.0;
  }
  if(sensBrightAppart == 1){
    realBrightAppart = comdBrightAppart * maxBrightnessA;
  }  
  if(sensBrightAppart == -1){
    realBrightAppart = (1.0 - comdBrightAppart) * maxBrightnessA;
  }  
  
  //println("Cours : " + realBrightCours + " , Appart : " + realBrightAppart);
  
  fill(255,0,0, realBrightCours);
  textSize(32);
  textAlign(CENTER);
  text("Salle de Cours", 250, 50);
  triangle(250, 50, 150, 350, 350, 350);
  
  fill(0,255,0, realBrightAppart);
  textSize(32);
  textAlign(CENTER);
  text("Appart", 350, 50);
  triangle(350, 50, 250, 350, 450, 350);
  
  dmxOutput.set(1,int(0.5*realBrightAppart + 0.5*realBrightCours));
  dmxOutput.set(2,int(realBrightAppart));
  dmxOutput.set(3,int(realBrightCours));
  
}

void changeMode(char mode){
  
    //println("New mode : " + mode);
    
    // Mode appart ------
    if(mode == 'A'){
      timeCours = millis();
      timeAppart = millis();
      sensBrightCours = -1;
      sensBrightAppart = 1;
    }
    
    // Mode Cours ------
    if(mode == 'S'){
      timeCours = millis();
      timeAppart = millis();
      sensBrightCours = 1;
      sensBrightAppart = -1;
    }
}

void actionPerformed(GUIEvent e) {
  if (e.getMessage().equals("Completed")) {
    maxBrightnessA = Integer.parseInt(tA.getValue());
    maxBrightnessS = Integer.parseInt(tS.getValue());
  }
}
