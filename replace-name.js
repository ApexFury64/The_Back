const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css') || filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace specific phrases first to prevent duplication
    content = content.replace(/TechWing AI Tutor/gi, 'AI Tutor');
    content = content.replace(/Techwing AI Tutor/gi, 'AI Tutor');
    content = content.replace(/TechWing AI/gi, 'AI Tutor');
    content = content.replace(/Techwing AI/gi, 'AI Tutor');
    content = content.replace(/TechWing/gi, 'AI Tutor');
    content = content.replace(/Techwing/gi, 'AI Tutor');
    content = content.replace(/super@techwing\.com/gi, 'super@techwing.com'); // Restore email if it changed
    content = content.replace(/super@AI Tutor\.com/gi, 'super@techwing.com'); // Fix accidental email replace
    content = content.replace(/arjun@techwing\.com/gi, 'arjun@techwing.com');
    content = content.replace(/arjun@AI Tutor\.com/gi, 'arjun@techwing.com');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
