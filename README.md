# lasondia
## Analyse de musique pour cours de musique

Réalisé lors du workshop IA (2018 - Lyon , France) organisé par : @urbanlab (https://github.com/urbanlab) *+* DSAA Villefontaine

Inspiré par lesondier (http://www.lesondier.com/) et sa sondbox

### Pricipaux contributeurs
- Anthony Angelot (Ecole Centrale Lyon) @aangelot
- Theo Ferreira (Epitech) @theo-hubgrade
- Zoé Paille (DSAA) @Troiscentdeux
- Sébastien Albert (Studio Albert) @DudleySmith
- Victor Lévêque (DSAA)
- Léa Carles (DSAA)
- Angélique Giannini (DSAA)

### Fonctionnalités basiques
- Enregistrement du cours de musique que le professeur peut augmenter avec des gommettes (repères)
- Système de speech to text automatique
- Séparation entre les parties parlées du cours et les parties musicales
- page web disponibles pour accéder aux cours pour les élèves

### Google API installation
- Créer un compte sur la plateforme google cloud
- Créer un projet utilisant l'API speech to text (ou choisir le projet lasondia si accessible) et obtenir une clé google credentials
(la nommer googlecredentials.json et la sauvegarder sous /home/erasme/lasondia/Node/)
- Configurer l'environnement google cloud SDK (cf google help)

### Technos utilisées
- P5.js Pour un bon rendu visuel en direct
- Inspiré par l'audio stream (https://github.com/gabrielpoca/browser-pcm-stream/blob/master/public/recorder.js)
- Python
- Google Speech To Text API
- Microphones
- Android tablette
- Peaks.js
- Nodejs serveur
- Processing
- Front end (HTML5, CSS3)

### Erreurs relatives
https://github.com/processing/p5.js/issues/2726#issuecomment-375837110

### Lancement
- Lancer le switcher de lumière en entrant la commande suivante dans la racine du dépôt (lasondia) :
- /usr/share/processing/processing-3.3.7/processing ./BoutonLumiere/BoutonLumiere.pde
- Ensuite cliquer sur le bouton de lancement et vérifier que les lumières fonctionnent correctement
- Puis taper ceci :
- export GOOGLE_APPLICATION_CREDENTIALS="/home/erasme/lasondia/Node/googlecredentials.json"
- Verifier l'adresse IP pour les sockets du serveur Node
- Enfin lancer le serveur avec la commande suivante à entrer depuis le dossier "Node" :
- node demo.js
- Attention : Utiliser mozilla firefox pour aller sur la plateforme (chrome et explorer ne fonctionneront pas)
- Attention : L'analyse d'un fichier son d'une minute peut prendre plus que 20 secondes

[EN version]
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
