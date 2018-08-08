#!/bin/bash

PREVIOUS_IP=$1
NEW_IP=$2

cd /home/erasme/lasondia/Node/src
grep -lr --exclude-dir=".git" $PREVIOUS_IP  . | xargs sed -i '' -e "s/$PREVIOUS_IP/$NEW_IP/g"
