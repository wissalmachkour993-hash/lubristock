/**
 * Serveur Express — téléchargement APK Android
 * Route GET /download : en-têtes pour forcer le téléchargement dans le navigateur.
 *
 * Déploiement :
 * - Vercel : export de l'app via api/index.js (pas de listen)
 * - Procfile / Railway / Heroku : npm start (listen sur PORT)
 */
require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3080;
const HOST = process.env.HOST || "0.0.0.0";
const APK_FILENAME = process.env.APK_FILENAME || "app.apk";
const APK_PATH = path.join(__dirname, "files", APK_FILENAME);

const app = express();

/** En-têtes recommandés pour APK (Chrome / Android). */
function setApkDownloadHeaders(res, fileSize) {
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${APK_FILENAME}"; filename*=UTF-8''${encodeURIComponent(APK_FILENAME)}`
  );
  res.setHeader("Content-Transfer-Encoding", "binary");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (fileSize != null) {
    res.setHeader("Content-Length", String(fileSize));
  }
}

function apkExists() {
  try {
    return fs.statSync(APK_PATH).isFile();
  } catch {
    return false;
  }
}

/** Page d'accueil : redirection immédiate vers /download (déclenche le téléchargement). */
app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Téléchargement LubriOCP</title>
  <meta http-equiv="refresh" content="0;url=/download" />
  <script>window.location.replace("/download");</script>
</head>
<body>
  <p>Redirection vers le téléchargement… <a href="/download">Cliquez ici</a> si rien ne se passe.</p>
</body>
</html>`);
});

/** Téléchargement automatique du fichier APK. */
app.get("/download", (req, res, next) => {
  if (!apkExists()) {
    res.status(404).json({
      error: "APK introuvable",
      message: `Placez le fichier dans apk-server/files/${APK_FILENAME}`,
      path: APK_PATH,
    });
    return;
  }

  const stat = fs.statSync(APK_PATH);
  setApkDownloadHeaders(res, stat.size);

  const stream = fs.createReadStream(APK_PATH);
  stream.on("error", next);
  stream.pipe(res);
});

/** HEAD pour vérifier la disponibilité sans télécharger tout le fichier. */
app.head("/download", (_req, res) => {
  if (!apkExists()) {
    res.status(404).end();
    return;
  }
  const stat = fs.statSync(APK_PATH);
  setApkDownloadHeaders(res, stat.size);
  res.status(200).end();
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    apkPresent: apkExists(),
    apkPath: APK_PATH,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur", message: err.message });
});

/** Démarrage local / Procfile — ignoré sur Vercel (handler serverless). */
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`APK download server: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
    console.log(`  Téléchargement : http://localhost:${PORT}/download`);
    console.log(`  Fichier attendu : ${APK_PATH}`);
    if (!apkExists()) {
      console.warn(`  ⚠ APK manquant — ajoutez files/${APK_FILENAME} avant de déployer.`);
    }
  });
}

module.exports = app;
