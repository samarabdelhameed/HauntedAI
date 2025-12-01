// Manual Test Script for Authentication
// Run this after starting the API server

const { ethers } = require('ethers');

async function testAuthentication() {
  console.log('🧪 Testing HauntedAI Authentication\n');

  // Create a test wallet
  const wallet = ethers.Wallet.createRandom();
  console.log('✅ Created test wallet:');
  console.log('   Address:', wallet.address);
  console.log('   Private Key:', wallet.privateKey.substring(0, 20) + '...\n');

  // Create message to sign
  const message = 'Sign this message to authenticate with HauntedAI';
  console.log('📝 Message to sign:', message, '\n');

  // Sign the message
  const signature = await wallet.signMessage(message);
  console.log('✅ Signature created:');
  console.log('   ', signature.substring(0, 50) + '...\n');

  // Verify signature locally
  const recoveredAddress = ethers.verifyMessage(message, signature);
  console.log('✅ Signature verification:');
  console.log('   Original:', wallet.address);
  console.log('   Recovered:', recoveredAddress);
  console.log('   Match:', recoveredAddress === wallet.address, '\n');

  // Prepare login request
  const loginData = {
    walletAddress: wallet.address,
    message: message,
    signature: signature,
  };

  console.log('📦 Login Request Data:');
  console.log(JSON.stringify(loginData, null, 2), '\n');

  console.log('🚀 To test with real API:');
  console.log('1. Start the API server: npm run dev');
  console.log('2. Send POST request to: http://localhost:3001/api/v1/auth/login');
  console.log('3. Use the login data above as request body\n');

  console.log('📋 cURL command:');
  console.log(`curl -X POST http://localhost:3001/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginData)}'`);

  return loginData;
}

// Run the test
testAuthentication()
  .then((data) => {
    console.log('\n✅ Test data generated successfully!');
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
  });
