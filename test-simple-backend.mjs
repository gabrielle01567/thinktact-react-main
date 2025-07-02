import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-50jgrva73-gabrielle-shands-projects.vercel.app';

async function testSimple() {
  console.log('Testing new backend URL...');
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data.substring(0, 100));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSimple(); 