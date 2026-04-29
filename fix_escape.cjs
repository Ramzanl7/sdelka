const fs = require('fs');

const files = [
  'c:/Users/administrator/Desktop/www/src/utils/security.js',
  'c:/Users/administrator/Desktop/www/js/core.js'
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(`.replace(/</g, '<')`, `.replace(/</g, '<')`);
  c = c.replace(`.replace(/>/g, '>')`, `.replace(/>/g, '>')`);
  c = c.replace(`.replace(/"/g, '"')`, `.replace(/"/g, '"')`);
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
}
