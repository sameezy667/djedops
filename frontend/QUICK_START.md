# WeilChain Applet Protocol - Quick Start

## 🚀 Installation

```bash
# Install dependencies (includes @weilliptic/weil-sdk)
npm install

# Copy environment template
cp .env.example .env.local
```

## ⚙️ Configuration

Edit `.env.local`:

```env
# WeilChain Sentinel RPC
NEXT_PUBLIC_WEIL_SENTINEL_ENDPOINT=https://sentinel.unweil.me

# Registry contract address (deploy first, then paste here)
NEXT_PUBLIC_WEIL_REGISTRY_CONTRACT=

# Deployer private key (for contract deployment only)
WEIL_DEPLOYER_PRIVATE_KEY=
```

## 📦 Contract Deployment

### Option 1: Full Deployment (Requires Rust)

```bash
# 1. Compile WASM contract
cd contracts/applet-registry
cargo build --target wasm32-unknown-unknown --release

# 2. Generate WIDL interface
# (Follow WeilChain WIDL compiler instructions)

# 3. Deploy to WeilChain
npm run deploy:registry
```

### Option 2: Demo Mode (No Contract Required)

```env
# In .env.local
NEXT_PUBLIC_MOCK_CONTRACT=true
```

## 🌐 Run Development Server

```bash
npm run dev
```

Visit:
- **Marketplace Hub:** http://localhost:3000/marketplace
- **DjedOPS Applet:** http://localhost:3000/applet/djedops
- **Original DjedOPS:** http://localhost:3000 (legacy)

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📱 User Flow

1. **Install WeilWallet** (https://weilchain.io/wallet)
2. **Connect** wallet from marketplace
3. **Browse** registered applets
4. **Launch** DjedOPS (free access)
5. **Monitor** Djed protocol with WeilChain wallet connected

## 🏗️ Architecture

```
/app
  /marketplace          → Main hub (applet listing)
  /applet/djedops      → DjedOPS as applet
  /page.tsx            → Original DjedOPS (legacy)

/components
  /AppletMarketplace.tsx → Marketplace UI

/contracts
  /applet-registry/     → WASM contract + WIDL

/lib
  /weil-sdk.ts         → WeilChain SDK wrapper
  /hooks/useWeilWallet.ts → React hooks

/scripts
  /deploy-registry.ts   → Deployment script
```

## 🎯 Hackathon Demo Checklist

- [ ] WeilWallet extension installed
- [ ] `.env.local` configured
- [ ] Contract deployed OR mock mode enabled
- [ ] Marketplace loads at `/marketplace`
- [ ] DjedOPS visible in applet grid
- [ ] Launch button works
- [ ] Wallet connection displays in applet
- [ ] Demo video recorded

## 🐛 Troubleshooting

**"WeilWallet not found"**
→ Install browser extension from https://weilchain.io/wallet

**"Registry contract not configured"**
→ Either deploy contract OR enable `NEXT_PUBLIC_MOCK_CONTRACT=true`

**"Failed to load applets"**
→ Check Sentinel endpoint is correct and accessible

**"Wallet connection failed"**
→ Unlock WeilWallet extension and try again

## 📚 Documentation

- [Full Pivot Guide](HACKATHON_PIVOT_GUIDE.md)
- [Contract README](contracts/applet-registry/README.md)
- [WeilChain SDK Docs](https://github.com/weilliptic-public/wadk.git)

## 📞 Support

- WeilChain: https://weilchain.io
- DjedOPS: (Your contact info)
- Issues: (Your GitHub issues)

---

**Ready to win the hackathon! 🏆**
