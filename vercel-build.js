const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = process.cwd();
const outputDir = path.join(process.cwd(), 'build');

// Create output directory if it doesn't exist
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Files and directories to exclude
const excludeDirs = ['node_modules', '.git', '.vercel', '.github', 'build', 'api'];
const excludeFiles = ['.env', 'vercel-build.js', '*.md', '*.mdx', '*.log'];

// Function to check if a path should be excluded
function shouldExclude(filePath) {
  const relativePath = path.relative(sourceDir, filePath);
  const fileName = path.basename(filePath);
  
  // Always include files in the root directory
  if (path.dirname(relativePath) === '.') {
    return false;
  }

  return excludeDirs.some(dir => 
    relativePath === dir || 
    relativePath.startsWith(dir + path.sep)
  ) || excludeFiles.some(file => 
    relativePath === file || 
    relativePath.endsWith(path.sep + file) ||
    fileName === file.replace('*', '')
  );
}

// Function to copy files
function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItem => {
      const srcPath = path.join(src, childItem);
      const destPath = path.join(dest, childItem);
      
      if (!shouldExclude(srcPath)) {
        copyRecursiveSync(srcPath, destPath);
      }
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Starting build...');

// Copy all files except excluded ones
copyRecursiveSync(sourceDir, outputDir);

// Create a simple index.html if it doesn't exist
const indexPath = path.join(outputDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Resume</title>
      </head>
      <body>
        <h1>Welcome to My Resume</h1>
        <p>This is a placeholder. Your resume content will be served here.</p>
      </body>
    </html>
  `);
}

console.log('Build completed successfully! Output directory:', outputDir);