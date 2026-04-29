const fs = require('fs');

const files = ['src/utils/security.js', 'js/core.js', 'main.js'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Build replacements via char codes to avoid any HTML entity decoding
  const lt   = String.fromCharCode(38, 108, 116, 59);       // <
  const gt   = String.fromCharCode(38, 103, 116, 59);       // >
  const quot = String.fromCharCode(38, 113, 117, 111, 116, 59); // "
  
  // Broken patterns (exactly as they appear in source files)
  const bad1 = ".replace(/</g, '<')";
  const bad2 = ".replace(/>/g, '>')";
  const bad3 = '.replace(/"/g, \'"\')';
  
  // Good patterns
  const good1 = ".replace(/</g, '" + lt + "')";
  const good2 = ".replace(/>/g, '" + gt + "')";
  const good3 = '.replace(/"/g, \'' + quot + '\')';
  
  content = content.split(bad1).join(good1);
  content = content.split(bad2).join(good2);
  content = content.split(bad3).join(good3);
  
  fs.writeFileSync(file, content, 'utf8');
  
  // Verify
  const verify = fs.readFileSync(file, 'utf8');
  const ok1 = verify.includes(good1);
  const ok2 = verify.includes(good2);
  const ok3 = verify.includes(good3);
  console.log(`${file}: lt=${ok1} gt=${ok2} quot=${ok3}`);
}

