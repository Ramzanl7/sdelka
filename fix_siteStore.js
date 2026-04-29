const fs = require('fs');
const path = 'c:/Users/administrator/Desktop/www/src/data/siteStore.js';
let content = fs.readFileSync(path, 'utf-8');

const broken = `  SUPPORT_TICKET_STATUS_RESOLVED,\n\n  currentUser: 'currentUser',\n  theme: 'theme',\n});\n\nconst STORE_LISTENERS = new Set();`;

const fixed = `  SUPPORT_TICKET_STATUS_RESOLVED,\n  SUPPORT_TICKET_STATUS_WAITING_USER,\n};\n\nexport const STORAGE_KEYS = Object.freeze({\n  users: 'users',\n  requests: 'requests',\n  offers: 'offers',\n  ratings: 'ratings',\n  supportTickets: 'supportTickets',\n  products: 'products',\n  currentUser: 'currentUser',\n  theme: 'theme',\n});\n\nconst STORE_LISTENERS = new Set();`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Fixed!');
} else {
  const altBroken = broken.replace(/\n/g, '\r\n');
  if (content.includes(altBroken)) {
    content = content.replace(altBroken, fixed);
    fs.writeFileSync(path, content, 'utf-8');
    console.log('Fixed with CRLF!');
  } else {
    console.log('Pattern not found - attempting rough fix');
    // Rough fallback
    content = content.replace(/SUPPORT_TICKET_STATUS_RESOLVED,\s*currentUser:\s*'currentUser',\s*theme:\s*'theme',\s*\}\);\s*const STORE_LISTENERS/s, 
      `SUPPORT_TICKET_STATUS_RESOLVED,\n  SUPPORT_TICKET_STATUS_WAITING_USER,\n};\n\nexport const STORAGE_KEYS = Object.freeze({\n  users: 'users',\n  requests: 'requests',\n  offers: 'offers',\n  ratings: 'ratings',\n  supportTickets: 'supportTickets',\n  products: 'products',\n  currentUser: 'currentUser',\n  theme: 'theme',\n});\n\nconst STORE_LISTENERS`);
    fs.writeFileSync(path, content, 'utf-8');
    console.log('Rough fix applied');
  }
}
