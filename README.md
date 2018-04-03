# lasondia
## Sound Analysis for Music Teachers

Made for IA Workshop (2018 - Lyon , France) organized by : @urbanlab (https://github.com/urbanlab) *+* DSAA Villefontaine

Inspired by lesondier (http://www.lesondier.com/) and its sondbox

### Main contributors
- Anthony Angelot (Ecole Centrale Lyon) @aangelot
- Theo Ferreira (Epitech) @theo-hubgrade
- Zoé Paille (DSAA) @Troiscentdeux
- Sébastien Albert (Studio Albert) @DudleySmith

### Basic Steps and features
- Recording music lessons while teacher can augment with notes
- Automatic commenting system
- Separation between the musical parts and the spoken parts
- Web page available for students

### Google API set up
- Create an account on google cloud platform
- Create a project with the speech to text API (or choose the "lasondia project") and get a google credentials key
(name it googlecredentials.json and save it under /home/erasme/lasondia/Node/)
- Set up the google environment (cf google help)

### Tech used, shopping list
- P5.js for nice live visualisation
- audio stream inspired (from https://github.com/gabrielpoca/browser-pcm-stream/blob/master/public/recorder.js)
- Python (wave library)
- Google Speech To Text API
- Microphones
- Android tablet
- Peaks.js
- Nodejs server
- Processing
- Front end (HTML5, CSS3)

### Relatives Issues
https://github.com/processing/p5.js/issues/2726#issuecomment-375837110

### Start it
- Start ligth switch by typing the folowing command :
- /usr/share/processing/processing-3.3.7/processing ./BoutonLumiere/BoutonLumiere.pde
- Then click on the start button and verify that the ligths are working properly
- Then enter the following :
- export GOOGLE_APPLICATION_CREDENTIALS="/home/erasme/lasondia/Node/googlecredentials.json"
- Verify IP address for the sockets
- Finally start the server with this command in the Node directory :
- node demo.js
- Be careful : go to the server with mozilla firefox (chrome and explorer won't work)
- Be careful : the analysis of a one minute record can last more than 20 seconds
