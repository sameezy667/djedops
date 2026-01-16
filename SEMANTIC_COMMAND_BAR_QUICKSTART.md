# Quick Start: Semantic Command Bar Setup

## 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)

## 2. Add API Key to Project

Create a `.env.local` file in the project root:

```bash
# Create the file
touch .env.local

# Or on Windows PowerShell:
New-Item .env.local -ItemType File
```

Add your API key:

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDC6gEpVN8ANU2nxIDMAYZyyIxVpC_QmME
```

**Important**: Replace `AIzaSy...` with your actual API key!

## 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 4. Test the Feature

1. Navigate to `/workflows` page
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
3. Type: `Swap 100 USDC to ETH if price < 2000`
4. Press Enter
5. Watch the magic happen! ✨

## Without API Key (Fallback Mode)

The system will still work without an API key using regex pattern matching:

- ✅ Basic swaps: `Swap X TOKEN to TOKEN`
- ✅ Conditional swaps: `Swap X TOKEN to TOKEN if price < Y`
- ✅ Monitoring: `Monitor PROTOCOL`
- ✅ Arbitrage: `Arbitrage between X and Y`

## Troubleshooting

### API Key Not Working?

1. **Check format**: Key should start with `AIza`
2. **Restart server**: Environment variables load on server start
3. **Check console**: Open browser console (F12) for error messages
4. **Verify file location**: `.env.local` should be in project root

### Still Not Working?

The system automatically falls back to pattern matching. Try these exact commands:

```
Swap 100 USDC to ETH if price < 2000
Monitor Aave and alert if DSI > 0.8
Arbitrage between Uniswap and Curve
```

## Need Help?

- 📖 Full documentation: `SEMANTIC_COMMAND_BAR.md`
- 🔧 Check `lib/intent-engine.ts` for pattern examples
- 💬 Open an issue on GitHub

---

**Ready to build workflows with natural language? Press Cmd+K and start! 🚀**
