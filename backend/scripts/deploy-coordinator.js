/**
 * Deploy Coordinator Contract (Node.js)
 * 
 * Cross-platform deployment script that works on Windows, Mac, and Linux.
 * This is a FREE alternative to using Render Shell.
 * 
 * Usage:
 *   node scripts/deploy-coordinator.js
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('==================================================');
console.log('🚀 Deploying Workflow Coordinator Contract');
console.log('==================================================\n');

// Check widl-cli
console.log('📋 Checking prerequisites...');
try {
  const version = execSync('widl-cli --version', { encoding: 'utf8' });
  console.log(`✓ widl-cli found: ${version.trim()}`);
} catch (error) {
  console.error('❌ ERROR: widl-cli not found!');
  console.error('\nPlease install widl-cli first:');
  console.error('  Windows: https://install.unweil.me/widl-cli-windows.zip');
  console.error('  Mac/Linux: curl -sSL https://install.unweil.me | bash');
  process.exit(1);
}

// Check environment variables
if (!process.env.WALLET_PRIVATE_KEY) {
  console.error('❌ ERROR: WALLET_PRIVATE_KEY not set in .env file');
  process.exit(1);
}

if (!process.env.WALLET_ADDRESS) {
  console.error('❌ ERROR: WALLET_ADDRESS not set in .env file');
  process.exit(1);
}

console.log(`✓ Wallet configured: ${process.env.WALLET_ADDRESS}`);

// Check contract file
const contractPath = join(__dirname, '..', 'contracts', 'coordinator.weil');
if (!existsSync(contractPath)) {
  console.error(`❌ ERROR: Contract file not found: ${contractPath}`);
  process.exit(1);
}

console.log(`✓ Contract file found: ${contractPath}\n`);

// Compile contract
console.log('📦 Compiling contract...');
const compiledPath = join(__dirname, '..', 'contracts', 'coordinator.wasm');

try {
  execSync(`widl-cli compile "${contractPath}" -o "${compiledPath}"`, {
    stdio: 'inherit'
  });
  console.log('✓ Contract compiled successfully\n');
} catch (error) {
  console.error('❌ Compilation failed!');
  process.exit(1);
}

// Deploy contract
console.log('🌐 Deploying to WeilChain...');
const rpcUrl = process.env.WEIL_RPC_URL || 'https://sentinel.unweil.me';
console.log(`   Network: ${rpcUrl}`);
console.log(`   From: ${process.env.WALLET_ADDRESS}\n`);

try {
  const output = execSync(
    `widl-cli deploy "${compiledPath}" --from "${process.env.WALLET_ADDRESS}" --gas auto --rpc "${rpcUrl}"`,
    { encoding: 'utf8' }
  );

  console.log(output);

  // Extract contract address
  const addressMatch = output.match(/contract address:\s*(weil1[a-z0-9]+)/i);
  
  if (addressMatch) {
    const contractAddress = addressMatch[1];
    
    console.log('\n==================================================');
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
    console.log('==================================================\n');
    console.log(`Contract Address: ${contractAddress}\n`);
    
    // Save to file
    const contractsDir = join(__dirname, '..', 'contracts');
    if (!existsSync(contractsDir)) {
      mkdirSync(contractsDir, { recursive: true });
    }
    writeFileSync(
      join(contractsDir, 'deployed-address.txt'),
      contractAddress
    );
    console.log('✓ Address saved to: contracts/deployed-address.txt\n');
    
    console.log('🔧 Next Steps:');
    console.log('1. Go to Render Dashboard → Your Backend Service');
    console.log('2. Click "Environment" tab');
    console.log('3. Update COORDINATOR_CONTRACT_ADDRESS with:');
    console.log(`   ${contractAddress}`);
    console.log('4. Click "Save Changes"');
    console.log('5. Wait for Render to redeploy (~2 minutes)\n');
    console.log('After that, your workflows will deploy for REAL! 🎉');
    console.log('==================================================');
    
  } else {
    console.log('\n⚠️  Could not parse contract address from output.');
    console.log('Please manually extract it from the output above.');
  }

} catch (error) {
  console.error('❌ Deployment failed!');
  console.error(error.message);
  process.exit(1);
}
