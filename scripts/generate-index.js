import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('.output/public');
const manifestFile = path.resolve('.output/server/_tanstack-start-manifest_v-2C5mspTw.mjs');

if (!fs.existsSync(publicDir)) {
  console.error('Error: .output/public directory does not exist. Run a production build first.');
  process.exit(1);
}

// 1. Locate css styles sheet dynamically under assets/
let cssFile = '';
const assetsDir = path.join(publicDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const stylesFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  if (stylesFile) {
    cssFile = `/assets/${stylesFile}`;
  }
}

// 2. Resolve target bundle script entry dynamically from start manifest
let entryScript = '';
if (fs.existsSync(manifestFile)) {
  const content = fs.readFileSync(manifestFile, 'utf8');
  const match = content.match(/"src":\s*"([^"]+)"/);
  if (match && match[1]) {
    entryScript = match[1];
  }
}

if (!entryScript) {
  console.log('Warning: Could not extract entrypoint from manifest. Falling back to directory scan.');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const indexJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
    if (indexJs) {
      entryScript = `/assets/${indexJs}`;
    }
  }
}

if (!entryScript) {
  console.error('Error: Could not determine index entry bundle script path.');
  process.exit(1);
}

console.log(`Resolved Client SPA Assets:`);
console.log(`  CSS: ${cssFile || 'None'}`);
console.log(`  JS:  ${entryScript}`);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Amman Distributors</title>
    ${cssFile ? `<link rel="stylesheet" href="${cssFile}">` : ''}
</head>
<body class="bg-background">
    <div id="app"></div>
    <script type="module" src="${entryScript}"></script>
</body>
</html>`;

const targetHtml = path.join(publicDir, 'index.html');
fs.writeFileSync(targetHtml, htmlContent, 'utf8');

if (!fs.existsSync(targetHtml)) {
  console.error('Error: Failed to write index.html inside .output/public.');
  process.exit(1);
}

console.log('Successfully generated Capacitor-compatible entrypoint index.html.');
