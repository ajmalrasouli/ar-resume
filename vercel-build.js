const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), '.vercel_build_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy all files to the output directory
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all files except node_modules and .git
fs.readdirSync(process.cwd())
  .filter(item => !['node_modules', '.git', '.vercel'].includes(item))
  .forEach(item => {
    copyRecursiveSync(
      path.join(process.cwd(), item),
      path.join(outputDir, 'static', item)
    );
  });

// Create the Vercel output configuration
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/api/ai/(?<path>.*)', dest: '/api/ai/$path' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};

// Write the configuration
fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify(config, null, 2)
);

console.log('Build completed successfully!');
