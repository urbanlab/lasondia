# lasondia
## Analyse de musique pour cours de musique

Réalisé lors du workshop IA (2018 - Lyon , France) organisé par : @urbanlab (https://github.com/urbanlab) *+* DSAA Villefontaine
Inspiré par lesondier (http://www.lesondier.com/) et sa sondbox

## Pricipaux contributeurs
- Anthony Angelot (Ecole Centrale Lyon) @aangelot
- Theo Ferreira (Epitech) @theo-hubgrade
- Zoé Paille (DSAA) @Troiscentdeux
- Sébastien Albert (Studio Albert) @DudleySmith
- Victor Lévêque (DSAA)
- Léa Carles (DSAA)
- Angélique Giannini (DSAA)
- Natan Baron-Trocellier (Ecole Centrale Lyon, maintenance post-workshop) @NatanBT

## Description

### Principe
lasondia est un prototype d'application Web permettant:

- **D'enregistrer** un cours de musique en y ajoutant des repères commentés (gommettes).
- **De séparer** les parties parlées du cours des parties musicales, grâce à un algorithme de segmentation/classification de l'enregistrement sonore.
- **De réécouter** le cours en s'aidant d'**outils d'écoute** (gommettes, boucles de lecture, variations de la vitesse de lecture) éditables à la volée.
- De **consulter sa progression** à l'aide d'une interface de type calendrier.

Pour l'instant, l'application est la même pour le professeur et pour les élèves; elle doit à terme être séparée en deux interfaces différentes.

### Etat du prototype
Actuellement, lasondia est un dispositif exposé à l'UrbanLab de la métropole de Lyon. Il se compose:

- *D'un piano* faisant office d'instrument de musique de démonstration.
- *D'un ordinateur* qui fait office de serveur et d'interface élève (on y consulte ses cours et outils d'écoute, ainsi que sa progression).
- *D'une tablette* qui fait office d'interface professeur (on l'utilise pour enregistrer le cours).
- *De projecteurs* contrôlés par un Arduino et permettant de générer une ambiance lumineuse.

La partie Arduino/BoutonLumière du code pourra être laissée de côté pour une reprise de lasondia en-dehors du Lab, et utiliser une tablette pour enregistrer les cours n'est pas nécessaire. En revanche, il est vivement recommandé d'utiliser un micro externe pour les enregistrements.

### Structure du code

#### Architecture logicielle
lasondia est une application Web, utilisant *NodeJS* côté serveur et *HTML/CSS/Javascript(Jquery)* côté client. La communication entre serveur et client est assurée par un serveur binaire *BinaryJS* pour la transmission des flux sonores, et par *socket.io* pour les autres communications.

Côté serveur, la *segmentation* de l'enregistrement sonore est mise en oeuvre par un *programme Python* lancé depuis le code Node.

Enfin, la gestion des lumières est assurée par un code Arduino, lancé à part.

#### Technologies utilisées
lasondia a été développée sous *linux ubuntu 16.04* pour l'ordinateur et *Android* pour la tablette. Elle n'a été conçue que pour fonctionner avec le navigateur **Mozilla Firefox**. On a:

- *Enregistrement du cours*: *Audio Stream* pour la communication du flux musical au serveur (https://github.com/gabrielpoca/browser-pcm-stream/blob/master/public/recorder.js); *p5.js* pour le rendu visuel en direct(https://p5js.org/).
- *Segmentation du cours*: *Python 3.6.5* et bibliothèque *pyAudioAnalysis*
- *Ecoute et édition du cours*: bibliothèque *Peaks.js* (https://github.com/bbc/peaks.js/tree/master)
- *HTML*, *CSS*, *Javascript(Jquery)*, *NodeJS* et *Processing*

#### Organisation du code
- La gestion des lumières est assurée dans les dossiers *root/BoutonLumière* (interface graphique de contrôle) et *root/arduino/SwitchDMX* (code Arduino pour contrôler les projecteurs).
- L'application Web est comprise dans le dossier *root/Node*. Voir le Readme de ce dossier pour plus de détails.
- Les scripts de démarrage et d'arrêt du dispositif sont situés dans le dossier *root/scripts*


### Installation et lancement
Voir le [wiki du projet](https://github.com/urbanlab/lasondia/wiki).
