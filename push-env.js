const fs = require('fs');
const { execSync } = require('child_process');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  if (line && !line.trim().startsWith('//') && line.includes('=')) {
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^"|"$/g, '');
    try {
      console.log(`Pushing ${key.trim()} to Production...`);
      execSync(`npx vercel env add ${key.trim()} production`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch(e) {
      console.log(`Failed to push ${key.trim()}`);
    }
  }
});
