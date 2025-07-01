import { findUserByEmail } from './backend/api/shared-storage.js';

const email = process.argv[2];

async function main() {
  if (!email) {
    console.error('Please provide an email as an argument.');
    process.exit(1);
  }
  try {
    const user = await findUserByEmail(email);
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 