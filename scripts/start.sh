#!/bin/bash

WORK_DIR="/home/erasme/lasondia"
PATH=$PATH:/usr/share/processing/processing-3.3.7

# Démmarage de processing : gestion du switch lumière
nohup processing-java  --sketch=$WORK_DIR/BoutonLumiere --run --present > /tmp/BoutonLumiere.log & 
sleep 2

# demarrage du serveur node
cd $WORK_DIR/Node
nohup node demo.js > /tmp/node.log &
sleep 2

# Lancer FireFox sur le bon lien
firefox http://localhost:8000/

