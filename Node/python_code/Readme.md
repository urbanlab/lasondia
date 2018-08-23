### Code Python ###

Le programme **segmentation.py** permet de segmenter un enregistrement audio en différentes parties correspondant soit à des silences, soit à de la voix humaine, soit à de la musique. Il repose sur le module **pyAudioAnalysis** de Python, qui se trouve dans le répertoire principal (ce module datant de 2015, des fonctions qu'il utilise ont depuis été dépréciées et il a fallu modifier certaines lignes de code; ne pas le télécharger directement depuis sa page Github).

Le document **svmSM** (pour SVM Speech Music) est un objet Pickle; il s'agit du classificateur utilisé pour la segmentation (hors détection de silences). Il fonctionne de pair avec **svmSMMEANS**, qui contient les hyperparamètres du modèle (i.e. les résultats de l'entraînement du modèle). pyAudioAnalysis va automatiquement utiliser svmSMMEANS lorsque svmSM est chargé, c'est pourquoi il ne faut jamais séparer et/ou renommer ces documents.

Le classificateur utilisé est fourni de base avec le module pyAudioAnalysis: il peut être trouvé dans le dossier *./pyAudioAnalysis, dans *pyAudioAnalysis/data*. Dans ce même dossier on peut trouver le fichier d'entraînement du modèle *svmSM.arff*.

Pour aller plus loin et construire des classifieurs plus évolués, utiliser la documentation présente dans le wiki [https://github.com/tyiannak/pyAudioAnalysis/wiki/5.-Segmentation] .

**Important:** pyAudioAnalysis est un module réalisé en 2015. Certaines des fonctions/façons de coder qu'il utilise ont été depuis dépréciées puis supprimées. Au cours du projet lasondia, nous avons modifié le code du module pour corriger les erreurs qui sont apparues. Par conséquent, la version du module à utiliser est **celle qui se trouve dans ce dossier et non celle qui se trouve sur le Github de pyAudioAnalysis**. 
