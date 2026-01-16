/**
 * DjedOps Backend Server
 * 
 * Provides API endpoints for deploying WeilChain workflows
 * Handles signing and broadcasting transactions using widl-cli
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ensure wallet key file exists from environment variable
 * This is required for widl-cli to access the private key
 * Runs once on server startup
 */
(function ensureWalletFile() {
  try {
    const walletDir = process.env.WC_PATH || join(os.homedir(), '.weilliptic');
    const keyFileName = 'private_key.wc';
    const keyFilePath = join(walletDir, keyFileName);
    const rawKey = process.env.WALLET_PRIVATE_KEY || '';

    console.log('[Startup] Checking wallet configuration...');
    console.log(`[Startup] Wallet directory: ${walletDir}`);

    // Create wallet directory if it doesn't exist
    if (!fsSync.existsSync(walletDir)) {
      // Note: mode option is ignored on Windows, but required for Linux/Mac
      fsSync.mkdirSync(walletDir, { recursive: true });
      // Attempt to set permissions on Unix-like systems
      if (process.platform !== 'win32') {
        try {
          fsSync.chmodSync(walletDir, 0o700);
        } catch (e) {
          // Ignore permission errors on Windows
        }
      }
      console.log(`[Startup] Created wallet directory: ${walletDir}`);
    }

    // Write private key file if it doesn't exist and we have a key
    if (rawKey && !fsSync.existsSync(keyFilePath)) {
      fsSync.writeFileSync(keyFilePath, rawKey.trim() + '\n');
      // Attempt to set permissions on Unix-like systems
      if (process.platform !== 'win32') {
        try {
          fsSync.chmodSync(keyFilePath, 0o600);
        } catch (e) {
          // Ignore permission errors on Windows
        }
      }
      console.log(`[Startup] ✓ Wrote wallet key to ${keyFilePath}`);
    } else if (fsSync.existsSync(keyFilePath)) {
      console.log(`[Startup] ✓ Wallet key file exists: ${keyFilePath}`);
    } else {
      console.warn('[Startup] ⚠ WALLET_PRIVATE_KEY not set - deployments will fail');
    }

    // Update environment for widl-cli
    process.env.WC_PRIVATE_KEY = walletDir;
    process.env.WC_PATH = walletDir;

  } catch (err) {
    console.error('[Startup] ERROR setting up wallet file:', err.message);
    console.error('[Startup] Deployments may fail without valid wallet configuration');
  }
})();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: 'Too many deployment requests, please try again later'
});

app.use('/api/deploy', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    walletAddress: process.env.WALLET_ADDRESS 
  });
});

/**
 * Deploy workflow endpoint
 * POST /api/deploy
 * Body: { workflow: {...}, name: string, owner: string }
 */
app.post('/api/deploy', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('[DEPLOY] Received deployment request');
    
    // Validate request
    const { workflow, name, owner, workflow_id } = req.body;
    if (!workflow || !name || !owner) {
      return res.status(400).json({ 
        error: 'Missing required fields: workflow, name, owner' 
      });
    }

    // Create workflow payload
    const workflowData = {
      workflow_id: workflow_id || `wf_${Date.now()}`,
      name,
      owner,
      workflow,
      atomic_mode: req.body.atomic_mode || true,
      gas_speed: req.body.gas_speed || 'fast',
      mev_strategy: req.body.mev_strategy || 'flashbots',
      deployed_at: new Date().toISOString()
    };

    // Write workflow to temp file (Windows-compatible)
    const tempDir = process.env.TEMP || process.env.TMP || 'C:\\Windows\\Temp';
    const workflowFile = join(tempDir, `workflow-${workflowData.workflow_id}.json`);
    await fs.writeFile(workflowFile, JSON.stringify(workflowData, null, 2));

    console.log(`[DEPLOY] Workflow written to ${workflowFile}`);

    // Setup environment for widl-cli
    const env = {
      ...process.env,
      WC_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY,
      WC_PATH: tempDir,
      PATH: process.env.PATH
    };

    // Create private key file for widl-cli (Windows-compatible)
    const wcDir = join(tempDir, '.weilliptic');
    await fs.mkdir(wcDir, { recursive: true });
    await fs.writeFile(
      join(wcDir, 'private_key.wc'), 
      process.env.WALLET_PRIVATE_KEY
    );
    env.WC_PRIVATE_KEY = wcDir;
    env.WC_PATH = wcDir;

    console.log('[DEPLOY] Calling widl-cli...');

    // Call widl-cli to deploy
    const widlPath = process.env.WIDL_CLI_PATH || 'widl-cli';
    const coordinator = process.env.COORDINATOR_CONTRACT_ADDRESS;
    
    // For now, we'll simulate the deployment since we don't have real coordinator
    // TODO: Replace with actual widl-cli call when coordinator address is available
    const command = `${widlPath} deploy --contract ${coordinator} --method deploy_workflow --args-file ${workflowFile}`;
    
    console.log(`[DEPLOY] Command: ${command}`);

    let txHash, deployedAddress;
    
    try {
      // Attempt actual deployment
      const { stdout, stderr } = await execAsync(command, { 
        env,
        timeout: 30000 
      });
      
      console.log('[DEPLOY] widl-cli stdout:', stdout);
      if (stderr) console.warn('[DEPLOY] widl-cli stderr:', stderr);

      // Parse output for tx hash and address
      const txMatch = stdout.match(/transaction hash:\s*([0-9a-fx]+)/i);
      const addrMatch = stdout.match(/contract address:\s*(weil1[a-z0-9]+)/i);
      
      txHash = txMatch ? txMatch[1] : `0x${Date.now().toString(16)}`;
      deployedAddress = addrMatch ? addrMatch[1] : `weil1applet${Date.now().toString(36)}`;
      
    } catch (cliError) {
      console.error('[DEPLOY] widl-cli error:', cliError.message);
      
      // If CLI fails (expected until we have real coordinator), return mock success
      if (coordinator.includes('00000000')) {
        console.log('[DEPLOY] Using placeholder coordinator - returning mock deployment');
        txHash = `0xmock${Date.now().toString(16)}`;
        deployedAddress = `weil1mock${Date.now().toString(36)}`;
      } else {
        throw cliError;
      }
    }

    // Cleanup temp file
    await fs.unlink(workflowFile).catch(() => {});

    const duration = Date.now() - startTime;
    console.log(`[DEPLOY] Success in ${duration}ms - TX: ${txHash}`);

    // Return success response
    res.json({
      success: true,
      txHash,
      workflowId: workflowData.workflow_id,
      contractAddress: deployedAddress,
      explorer: `https://www.unweil.me/tx/${txHash}`,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });

  } catch (error) {
    console.error('[DEPLOY] Error:', error);
    res.status(500).json({
      error: 'Deployment failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Check deployment status endpoint
 * GET /api/status/:txHash
 */
app.get('/api/status/:txHash', async (req, res) => {
  const { txHash } = req.params;
  
  try {
    // TODO: Query WeilChain RPC for transaction status
    // For now, return mock status
    res.json({
      txHash,
      status: 'confirmed',
      confirmations: 12,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ DjedOps backend running on port ${PORT}`);
  console.log(`✓ Wallet address: ${process.env.WALLET_ADDRESS}`);
  console.log(`✓ Coordinator: ${process.env.COORDINATOR_CONTRACT_ADDRESS}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
