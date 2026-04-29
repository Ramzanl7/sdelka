const fs = require('fs');
const path = 'c:/Users/administrator/Desktop/www/main.js';
let content = fs.readFileSync(path, 'utf8');

// Находим и заменяем повреждённый блок password-toggle
const badBlock = `    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const passwordFieldWrapper = this.closest('.password-field');
            if (!passwordFieldWrapper) return;
            const passwordField = passwordFieldWrapper.querySelector('input');
            if (!passwordField) return;
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';
            this.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    });
    updateSupportPanel();`;

const goodBlock = `    updateSupportPanel();
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const passwordFieldWrapper = this.closest('.password-field');
            if (!passwordFieldWrapper) return;
            const passwordField = passwordFieldWrapper.querySelector('input');
            if (!passwordField) return;
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';
            this.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    });`;

if (content.includes(badBlock)) {
  content = content.replace(badBlock, goodBlock);
  fs.writeFileSync(path, content);
  console.log('Fixed password-toggle block successfully.');
} else {
  console.log('Expected block not found. Checking context...');
  const idx = content.indexOf("password-toggle");
  if (idx >= 0) {
    console.log('Found at index', idx);
    console.log(content.substring(idx - 100, idx + 400));
  } else {
    console.log('password-toggle not found at all');
  }
}

