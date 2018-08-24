## Application Web lasondia

### Composition

Ce dossier comporte:

- Le code du serveur NodeJS: **demo.js**
- Les différents enregistrements sonores de l'application, complétés par des fichiers d'indications: **records**
- Les ressources utilisées par l'application côté client: **fonts, images, src**
- Le code Python utilisé pour la segmentation: **python_code**
- Un script bash permettant de modifier les adresses IPs dans le code lorsque l'adresse IP du serveur change: **adapt_IP.sh**

### Organisation du code source de l'application côté client
L'application se compose de 4 pages:

- **home** est la page d'accueil de l'application. Elle permet de sélectionner un enregistrement à consulter. Les codes CSS et Javascript de la page sont inclus dans son fichier html.
- **progress** est une maquette de page Web, figurant une interface de suivi visuel de la progression de l'élève utilisateur. Elle n'est pas très importante, et ses codes CSS et Javascript sont également inclus dans sa page html.
- **analysis** est la page dans laquelle l'élève consulte/interagit avec l'enregistrement de son cours de musique. Elle fait appel à la bibliothèque *peaks.js*, située dans les node-modules (à changer, il n'est pas pertinent qu'une bibliothèque Front s'y trouve).
- **record** est la page d'enregistrement des cours. Utilisant un serveur binaire et p5.js, son code Javascript est plus complexe et s'organise en 3 fichiers:
   1. *create_button.js* permet de générer des éléments du DOM (boutons de la page) via Javascript pour compléter la page.
   2. *sketch.js* comprend le code p5.js, et permet de représenter l'interface graphique (canevas) de la page. Il gère aussi l'ajout de gommettes dans l'enregistrement, lorsque le professeur appuie sur les boutons associés.
   3. stream_server.js comprend (dans une closure) le code permettant d'écouter le micro et de transférer le flux audio ainsi obtenu au serveur, en continu.
- **all_pages** comprend les codes appliqués aux quatre pages:
   1. *style.css* est la feuille de style comprenant les éléments de style communs à toutes les pages.
   2. Les fichiers *navbar* permettent d'afficher la barre de navigation à gauche sur toutes les pages de l'application, grâce au script *navbar_loader.js* (inséré à la fin de chaque fichier html)
   3. *error404.html* est la page qui s'affiche en cas d'erreur d'URL.
   4. *socket.io.js* permet à chaque page d'ouvrir un socket et de communiquer avec le serveur.

### Organisation des enregistrements
A chaque enregistrement correspond un dossier de nom aléatoire compris dans le dossier **records**. Ce dossier comprend:

- **fullRecord.wav**: l'enregistrement sonore du cours.
- **date.json**: la date de l'enregistrement (permet à l'utilisateur de le repérer).
- **segments.json**: les résultats de la segmentation. Il s'agit d'une partition de l'enregistrement en segments \[startTime, endTime\], et à chaque segment est associé une classe: *silence*, *speech* ou *music*.
- **events.json**: les différentes gommettes et boucles de lectures utilisées lors de l'écoute/l'édition du cours. Ce fichier est initialisé avec les gommettes posées pendant le cours par le professeur; puis il est modifié lors de l'édition des gommettes et boucles de lecture pour sauvegarder les modifications apportées.

### Organisation du code Python
Voir le Readme du dossier python_code.

### Utilisation du script adapt_IP.sh
1. Rendre ce fichier exécutable: `chmod +x ./adapt_IP.sh`
2. Relever l'adresse IP utilisée dans le code côté client, par exemple dans *src/all_pages/navbar.html* . Soit *prev_IP* cette adresse IP.
2. Relever l'adresse IP de l'ordinateur: `ifconfig` . Soit *new_IP* cette adresse IP.
3. Entrer: `./adapt_IP.sh prev_IP new_IP`
4. L'adresse IP de votre ordinateur est bien utilisée dans tout le code du client HTML. Sous réserve que tous les appareils utilisés se trouvent sur le même réseau Internet, l'application devrait fonctionner.
