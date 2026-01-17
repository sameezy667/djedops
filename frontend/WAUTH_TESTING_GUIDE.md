# WAuth Integration Testing Guide

## ✅ What I've Done

1. **Created useWAuth Hook** - [lib/hooks/useWAuth.ts](lib/hooks/useWAuth.ts)
   - Detects `window.weilliptic` injection
   - Manages connection state
   - Auto-reconnects on page refresh
   - Error handling

2. **Created WAuthConnect Button** - [components/WAuthConnect.tsx](components/WAuthConnect.tsx)
   - Cyan-themed button (different from green Nautilus)
   - Shows "CONNECT WAUTH" when disconnected
   - Shows "WEIL: 2832e1a6...6b482a" when connected
   - Pulse indicator when connected

3. **Updated Dashboard** - [app/page.tsx](app/page.tsx)
   - Added WAuth button next to Nautilus wallet button
   - Import added

4. **Updated Config** - [lib/weil-config.ts](lib/weil-config.ts)
   - Changed to `weilliptic-testnet-1`
   - Updated RPC URLs for testnet

---

## 🧪 HOW TO TEST IN BROWSER

### Step 1: Start Dev Server
```powershell
cd "c:\Visual Studio Code\DjedOPS"
npm run dev
```

### Step 2: Open Browser Console (F12)

Navigate to: `http://localhost:3000`

### Step 3: Check WAuth Detection

**In browser console, type:**
```javascript
// Check if wallet is injected
console.log('window.weilliptic:', window.weilliptic);

// If found, check structure
if (window.weilliptic) {
  console.log('Has contracts.execute:', typeof window.weilliptic.contracts?.execute);
  console.log('Account:', window.weilliptic.account);
  console.log('GetAddress method:', window.weilliptic.getAddress);
}
```

**Expected output if wallet is detected:**
```
window.weilliptic: {contracts: {...}, account: {...}, ...}
Has contracts.execute: 'function'
Account: {address: '2832e1a6...'}
```

---

## 🎯 BROWSER TESTING STEPS

### Test 1: Button Appears
1. Open `http://localhost:3000`
2. Look at top-right header
3. **You should see TWO wallet buttons:**
   - **Green button:** "CONNECT WALLET" (Nautilus - for Ergo)
   - **Cyan button:** "CONNECT WAUTH" (WAuth - for Weil)

### Test 2: Click WAuth Button
1. Click "CONNECT WAUTH" button
2. **If wallet is detected:** Button should change to "WEIL: 2832e1a6...6b482a"
3. **If wallet NOT detected:** Red error message: "WAuth extension not found..."

### Test 3: Check Console Logs
1. Open browser console (F12)
2. Click "CONNECT WAUTH"
3. **Expected logs:**
   ```
   [WeilSDK] Detected wallet at window.weilliptic
   [WAuth] Connected: 2832e1a6...6b482a
   ```

### Test 4: Reconnection on Refresh
1. Connect wallet (button shows address)
2. Refresh page (F5)
3. **Expected:** Button automatically shows connected state again

### Test 5: Disconnect
1. Click connected button (shows address)
2. **Expected:** Button changes back to "CONNECT WAUTH"

---

## 🐛 TROUBLESHOOTING

### Issue: "WAuth extension not found"

**Diagnosis in console:**
```javascript
// Check all possible injection points
console.log({
  weilWallet: window.weilWallet,
  weillipticWallet: window.weillipticWallet,
  weil: window.weil,
  weilliptic: window.weilliptic,
  weillipticNested: window.weilliptic?.wallet
});
```

**If ALL are undefined:**
- WAuth extension may not be installed properly
- Try restarting browser
- Check Chrome Extensions page: `chrome://extensions/`
- Ensure WAuth is enabled

**If found at different location:**
- Note the actual injection point
- Tell me and I'll update the detection code

### Issue: Wallet detected but address not showing

**Diagnosis in console:**
```javascript
// Try to get address manually
const wallet = window.weilliptic;

// Try method 1
if (wallet.getAddress) {
  wallet.getAddress().then(addr => console.log('Address via getAddress:', addr));
}

// Try method 2
if (wallet.account?.address) {
  console.log('Address via account.address:', wallet.account.address);
}

// Check what methods are available
console.log('Available methods:', Object.keys(wallet));
```

### Issue: contracts.execute not found

**Diagnosis:**
```javascript
console.log('Wallet structure:', window.weilliptic);
console.log('Contracts object:', window.weilliptic.contracts);
console.log('Execute method:', window.weilliptic.contracts?.execute);
```

**If structure is different than expected:**
- Screenshot the console output
- Share with me so I can update the code

---

## 📝 WHAT TO TELL ME

After testing, let me know:

1. **Does the cyan "CONNECT WAUTH" button appear?** (Yes/No + screenshot)
2. **Does it connect successfully?** (Yes/No)
3. **Does it show your address?** (Yes/No - should show "WEIL: 2832e1a6...6b482a")
4. **Console output from Step 3 above** (Copy-paste the output)
5. **Any error messages?** (Screenshot)

---

## 🚀 NEXT STEPS (After Testing)

Once connection works, we can:

1. **Deploy Workflow to Weil Chain** - Use your connected wallet to deploy smart contracts
2. **Execute Bridge Transactions** - Test cross-chain asset transfer
3. **Query Contract Status** - Read data from deployed contracts
4. **Transaction History** - Display your Weil Chain transactions

All the backend code is already ready in [lib/weil-sdk-wrapper.ts](lib/weil-sdk-wrapper.ts)!

---

## 🎨 VISUAL DESIGN

**Nautilus Button (Green):**
```
┌─────────────────────┐
│ ● CONNECT WALLET    │  ← Green (#39FF14)
└─────────────────────┘
```

**WAuth Button (Cyan):**
```
┌─────────────────────┐
│ ● CONNECT WAUTH     │  ← Cyan (#22D3EE)
└─────────────────────┘
```

When connected:
```
┌─────────────────────┐
│ ● WEIL: 2832e1...2a │  ← Pulsing cyan dot
└─────────────────────┘
```
