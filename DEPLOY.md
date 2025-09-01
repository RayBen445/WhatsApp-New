# Cool Shot AI WhatsApp Bot - Katabump Deployment Guide

## Automatic Deployment

This bot is optimized for **Katabump** deployment with zero configuration needed.

### Deploy Steps:

1. **Connect Repository**
   - Link your GitHub repository to Katabump
   - Select the `main` branch

2. **Auto-Configuration**
   - Build Command: `npm install` (detected automatically)
   - Start Command: `npm start` (from package.json)
   - Port: `3000` (auto-detected from server)

3. **Environment Variables (Optional)**
   - `AI_API_KEY`: Set to your GiftedTech key, or leave as default `gifted`
   - `GOOGLE_API_KEY`: Add Google Gemini key for fallback (optional)
   - `LOG_LEVEL`: Set to `info` or `error` for production

4. **WhatsApp Linking**
   - After deployment, check logs for pairing code
   - Use the code to link your WhatsApp account
   - Bot will send confirmation when connected

### Health Check
- The bot includes health endpoints at `/health` and `/ping`
- Katabump can monitor these for uptime

### File Structure Required
```
WhatsApp-New/
├── package.json         ✅ Build & start scripts
├── src/
│   ├── index.js        ✅ Main bot entry point  
│   ├── config/         ✅ Configuration
│   ├── handlers/       ✅ Command handlers
│   └── utils/          ✅ Core utilities
├── .env.example        ✅ Environment template
├── .gitignore          ✅ Git ignore rules
└── README.md           ✅ Documentation
```

### Production Notes
- Session data persists in `./data/auth_info_baileys/`
- User data stored in `./data/users.json`
- Analytics data in `./data/analytics.json`
- Logs written to `./logs/` directory
- All data directories created automatically

**Ready for one-click Katabump deployment!** 🚀