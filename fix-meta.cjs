const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules' && !item.name.startsWith('.')) {
      getAllHtmlFiles(fullPath, files);
    } else if (item.isFile() && item.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllHtmlFiles('.');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const originalContent = content;

  // Remove X-Frame-Options meta
  content = content.replace(/\s*<meta\s+http-equiv=["']X-Frame-Options["']\s+content=["']DENY["']\s*>/gi, '');

  // Remove X-Content-Type-Options meta
  content = content.replace(/\s*<meta\s+http-equiv=["']X-Content-Type-Options["']\s+content=["']nosniff["']\s*>/gi, '');

  // Replace Referrer-Policy http-equiv with name="referrer"
  content = content.replace(
    /<meta\s+http-equiv=["']Referrer-Policy["']\s+content=["']([^"']+)["']\s*>/gi,
    '<meta name="referrer" content="$1">'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed:', file);
    changedCount++;
  }
}

console.log(`Done. Fixed ${changedCount} files.`);

