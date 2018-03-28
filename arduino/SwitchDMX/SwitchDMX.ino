const int  buttonPin = 2;     // crée un identifiant pour la broche utilisée avec le bouton poussoir

boolean room = false;
int buttonState = 0;         //Variable pour l'état actuel du bouton poussoir
int lastButtonState = 0;     // Variable pour l'état précédent du bouton poussoir

void setup() {
  pinMode(buttonPin, INPUT);
  Serial.begin(9600);
}


void loop() {
  buttonState = digitalRead(buttonPin);

  // compare l'état actuel du bouton poussoir à l'état précédent mémorisé
  if (buttonState != lastButtonState) {
    // Front montant
    if (buttonState == HIGH) {
      switchLight();
    }
    else { 
      // Front descendant
      // Rien a faire
    }
    //mémorise l'état courant du bouton poussoir
    //pour les prochains passages dans la boucle loop
    lastButtonState = buttonState;
    delay(200); //debounce button
  }
}

void switchLight(){
  if(room){
    Serial.println("Allumage Appartement");
    room = false;
  } else {
    Serial.println("Allumage Salle de cours");
    room = true;
  }
}

