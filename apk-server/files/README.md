# Fichier APK



Placez votre application Android ici sous le nom **`app.apk`**.



```

apk-server/files/app.apk

```



## Local



```bash

cd apk-server

npm install

npm start

```



Téléchargement : `http://localhost:3080/download`



## Vercel



1. Créer un projet Vercel avec **Root Directory** = `apk-server`

2. Framework : **Other** (Express via `api/index.js`)

3. Déployer : `vercel` depuis ce dossier, ou push Git + import

4. Ajouter `files/app.apk` au déploiement (fichier ignoré par git : l’uploader via [Vercel CLI](https://vercel.com/docs/cli) ou un build step, ou retirer `apk-server/files/*.apk` du `.gitignore` pour le committer)



URL publique : `https://<votre-projet>.vercel.app/download`



## Railway / Heroku (Procfile)



Le `Procfile` lance `npm start`. Définir `PORT` (fourni par la plateforme).


