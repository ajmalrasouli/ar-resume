const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const staticDir = path.join(__dirname, 'static');
const vercelOutputDir = path.join(__dirname, '.vercel_build_output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');

// Create directories if they don't exist
[vercelOutputDir, vercelStaticDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy static files
function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src)) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(childItem => {
        copyRecursiveSync(
          path.join(src, childItem),
          path.join(dest, childItem)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  // Silently skip if file doesn't exist
}

// Copy static directory if it exists
if (fs.existsSync(staticDir)) {
  copyRecursiveSync(staticDir, vercelStaticDir);
}

// Copy individual files that should be in the root
const filesToCopy = [
  '.gitattributes',
  'index.html',
  '404.html',
  'favicon.ico'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(vercelStaticDir, file);
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
  }
});

// Create a basic config file if it doesn't exist
const configPath = path.join(vercelOutputDir, 'config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      version: 2,
      buildCommand: 'npm run build',
      outputDirectory: '.vercel_build_output/static'
    })
  );
}