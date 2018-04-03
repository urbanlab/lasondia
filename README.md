# lasondia
## Sound Analysis for Music Teachers

Made for IA Workshop (2018 - Lyon , France) organized by : @urbanlab (https://github.com/urbanlab) *+* DSAA Villefontaine

https://trello.com/b/G2sJqr9v/workshop-dsaa-iapublic

Inspired by lesondier (http://www.lesondier.com/) and its sondbox

### Main contributors :
- Anthony Angelot (Ecole Centrale Lyon) @aangelot
- Theo Ferreira (Epitech) @theo-hubgrade
- Zoé Paille (DSAA) @Troiscentdeux
- Sébastien Albert (Studio Albert) @DudleySmith

### Basic Steps and features
- Recording music lessons while teacher can augment with notes
- Automatic commenting system
- Separation between the musical parts and the spoken parts
- Web page available for students

### How to use it ?
- Create an account on google cloud platform
- Create a project with the speech to text API and get a google credentials key
- Set up the google environment
- Select an enregistrement on the home page and see the results of our analysis

### Tech used, shopping list
- P5.js for nice live visualisation
- audio stream inspired (from https://github.com/gabrielpoca/browser-pcm-stream/blob/master/public/recorder.js)
- Python (wave library)
- Google Speech To Text
- Microphones
- Android tablet

### Relatives Issues :
https://github.com/processing/p5.js/issues/2726#issuecomment-375837110

### Start it :
- Start ligth switch by typing the folowing command :
- /usr/share/processing/processing-3.3.7/processing ./BoutonLumiere/BoutonLumiere.pde
- Then click on the start button and verify that the ligths are working properly
- Then enter the following :
- export GOOGLE_APPLICATION_CREDENTIALS="./Node/googlecredentials.json"
- Verify IP address for the sockets
- Finally start the server with this command :
- node ./Node/demo.js
