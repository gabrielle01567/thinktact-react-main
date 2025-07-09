#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 USPTO API Key Environment Setup\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists!');
  console.log('Current contents:');
  console.log('─'.repeat(50));
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('─'.repeat(50));
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nDo you want to add/update the USPTO API key? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      promptForApiKey();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  promptForApiKey();
}

function promptForApiKey() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nEnter your USPTO API key: ', (apiKey) => {
    if (!apiKey.trim()) {
      console.log('❌ API key cannot be empty. Setup cancelled.');
      rl.close();
      return;
    }
    
    // Create or update .env file
    let envContent = '';
    
    if (envExists) {
      // Read existing content
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if VITE_USPTO_API_KEY already exists
      if (envContent.includes('VITE_USPTO_API_KEY=')) {
        // Update existing line
        envContent = envContent.replace(
          /VITE_USPTO_API_KEY=.*/g,
          `VITE_USPTO_API_KEY=${apiKey.trim()}`
        );
      } else {
        // Add new line
        envContent += `\n# USPTO API Configuration\nVITE_USPTO_API_KEY=${apiKey.trim()}\n`;
      }
    } else {
      // Create new .env file
      envContent = `# Environment Variables for Patent Buddy\n\n# USPTO API Configuration\nVITE_USPTO_API_KEY=${apiKey.trim()}\n\n# Add other environment variables here as needed\n`;
    }
    
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ .env file created/updated successfully!');
      console.log('📁 Location:', envPath);
      console.log('\n🔑 Your USPTO API key has been saved as an environment variable.');
      console.log('🚀 Restart your development server to use the new API key.');
      console.log('\n💡 The API key will be automatically loaded when you start the app.');
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
    }
    
    rl.close();
  });
} 