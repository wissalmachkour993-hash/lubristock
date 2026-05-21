const fs = require("fs");
const path = require("path");

/**
 * GET/HEAD /api/download — sert public/app.apk avec les en-têtes adaptés au téléchargement Android.
 */
module.exports = function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "public", "app.apk");

  let stat;
  try {
    stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return res.status(404).json({
        error: "APK introuvable",
        message: "Placez app.apk dans le dossier public/",
      });
    }
  } catch {
    return res.status(404).json({
      error: "APK introuvable",
      message: "Placez app.apk dans le dossier public/",
    });
  }

  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="app.apk"; filename*=UTF-8\'\'app.apk'
  );
  res.setHeader("Content-Length", String(stat.size));
  res.setHeader("Content-Transfer-Encoding", "binary");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: "Lecture du fichier impossible", message: err.message });
    } else {
      res.end();
    }
  });
  stream.pipe(res);
};
