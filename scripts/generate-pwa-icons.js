/**
 * Génère les PNG PWA (192, 512, maskable) à partir de public/icon.svg.
 * Usage: node scripts/generate-pwa-icons.js
 */
const fs = require('fs')
const path = require('path')

async function main() {
  const sharp = require('sharp')
  const root = path.join(__dirname, '..')
  const svgPath = path.join(root, 'public', 'icon.svg')
  const outDir = path.join(root, 'public', 'icons')

  if (!fs.existsSync(svgPath)) {
    console.error('Missing public/icon.svg')
    process.exit(1)
  }
  fs.mkdirSync(outDir, { recursive: true })

  const src = () => sharp(svgPath, { density: 300 })

  await src().resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'))
  await src().resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'))

  // Icône maskable : marge intérieure pour éviter le rognage sur Android
  const maskSize = 512
  const inner = Math.round(maskSize * 0.82)
  const pad = Math.floor((maskSize - inner) / 2)
  await src()
    .resize(inner, inner)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 15, g: 23, b: 42, alpha: 1 },
    })
    .png()
    .toFile(path.join(outDir, 'icon-maskable-512.png'))

  console.log('PWA icons written to public/icons/')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
