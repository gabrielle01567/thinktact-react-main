import fs from 'fs';
import path from 'path';

// Script to update backend URL in frontend services
const NEW_BACKEND_URL = process.argv[2];

if (!NEW_BACKEND_URL) {
  console.log('❌ Please provide the new backend URL as an argument');
  console.log('Usage: node update-backend-url.js "https://your-new-backend-url.com"');
  process.exit(1);
}

console.log('🔄 Updating backend URL to:', NEW_BACKEND_URL);

const filesToUpdate = [
  'src/services/authService.js',
  'src/services/analysisService.js'
];

function updateFile(filePath) {
  try {
    console.log(`📝 Updating ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update the default backend URL
    const oldPattern = /this\.baseUrl = import\.meta\.env\.VITE_BACKEND_URL \|\| '([^']+)'/;
    const newAuthService = content.replace(oldPattern, `this.baseUrl = import.meta.env.VITE_BACKEND_URL || '${NEW_BACKEND_URL}'`);
    
    const oldAnalysisPattern = /const API_BASE_URL = import\.meta\.env\.VITE_BACKEND_URL \|\| '([^']+)'/;
    const newAnalysisService = newAnalysisPattern ? newAnalysisService.replace(oldAnalysisPattern, `const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '${NEW_BACKEND_URL}'`) : content;
    
    // Write the updated content
    fs.writeFileSync(filePath, newAuthService || newAnalysisService);
    
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all files
filesToUpdate.forEach(updateFile);

console.log('\n🎉 Backend URL update completed!');
console.log('\nNext steps:');
console.log('1. Commit and push the changes:');
console.log('   git add .');
console.log('   git commit -m "Update backend URL to new deployment"');
console.log('   git push');
console.log('\n2. Or set the environment variable in your frontend deployment:');
console.log(`   VITE_BACKEND_URL=${NEW_BACKEND_URL}`);
console.log('\n3. Test the login with:');
console.log('   Email: alex.hawke54@gmail.com');
console.log('   Password: admin123'); 