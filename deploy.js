const fs = require('fs');
const path = require('path');

// Get repository info from command line arguments or use defaults
const args = process.argv.slice(2);
const username = args[0] || 'username';
const repoName = args[1] || 'draggy-analyzer';

// Update package.json with the correct homepage URL
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.homepage = `https://${username}.github.io/${repoName}`;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Updated homepage to: https://${username}.github.io/${repoName}`);
console.log('To deploy, run: npm run deploy');