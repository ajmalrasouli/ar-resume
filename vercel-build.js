const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = process.cwd();
const outputDir = path.join(process.cwd(), '.vercel_build_output', 'static');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to copy files
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItem => {
      if (childItem !== 'node_modules' && childItem !== '.git') {
        copyRecursiveSync(
          path.join(src, childItem),
          path.join(dest, childItem)
        );
      }
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all files except node_modules and .git
copyRecursiveSync(sourceDir, outputDir);

// Create vercel.json configuration
const vercelConfig = {
  version: 2,
  buildCommand: 'npm run build',
  outputDirectory: '.vercel_build_output/static'
};

// Write vercel.json
fs.writeFileSync(
  path.join(process.cwd(), '.vercel_build_output', 'config.json'),
  JSON.stringify(vercelConfig, null, 2)
);

console.log('Build completed successfully!');