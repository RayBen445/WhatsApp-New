# Cool Shot AI - WhatsApp Bot

A multi-role intelligent assistant WhatsApp bot powered by AI endpoints with support for 15+ languages and 100+ knowledge roles. Ported from the Prof-Tech MVAI Telegram bot with full WhatsApp integration using Baileys.

## Features

🤖 **Multi-Role AI Assistant** - Choose from 100+ expert roles (Mathematician, Doctor, Developer, etc.)  
🌍 **15+ Language Support** - Communicate in your preferred language  
🔗 **Dual Login Support** - Connect via QR code OR pairing code - your choice!  
📊 **Advanced Analytics** - User activity tracking and statistics  
🛡️ **Admin System** - Comprehensive admin panel with user management  
📢 **Broadcast Messaging** - Send messages to all users  
🆘 **Support System** - Built-in support ticket system  
🎮 **Games & Entertainment** - Dice, coin flip, 8-ball, jokes, quotes  
🛠️ **Text Utilities** - Count, reverse, encode/decode, case conversion  
📈 **Real-time Statistics** - Bot usage analytics and monitoring  

## Admin System

The bot recognizes **2348075614248** as the primary admin with full management privileges.

### Admin Features
- 🛡️ Admin panel access via `/admin` command
- 👥 User management (promote/demote admins)
- 📢 Broadcast messages to all users
- 📊 View detailed analytics and statistics
- 🔧 API status monitoring
- 🆘 Handle support requests
- 📈 User activity reports

### Admin Commands
- `/admin` - Access admin control panel
- `/admininfo` - Check admin status and system information
- `/adminstats` - View comprehensive system statistics
- `/broadcast <message>` - Send message to all users
- `/users` - View all registered users (primary admin only)
- `/promote <phone_number>` - Promote user to admin (primary admin only)
- `/demote <phone_number>` - Demote admin user (primary admin only)
- `/apistatus` - Check AI API status
- `/commands` - View command usage statistics
- `/topusers` - View most active users
- `/activity [phone_number]` - View user activity reports

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- WhatsApp account for bot linking
- Internet connection

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RayBen445/WhatsApp-New.git
   cd WhatsApp-New
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (optional)
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

5. **Link WhatsApp Account - TWO METHODS AVAILABLE**

   When you start the bot, you'll see both login options in the terminal:

   **Method 1: QR Code (Recommended)**
   - A QR code will be displayed in the terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code from your terminal

   **Method 2: Pairing Code**
   - A pairing code will be generated and displayed in the terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device" → "Link with phone number instead"  
   - Enter the pairing code from the terminal

   💡 **You can use EITHER method** - both will work seamlessly!

### Katabump Deployment

This bot is optimized for **Katabump** deployment with zero configuration required and **dual login support** (QR code + pairing code).

#### Quick Deploy to Katabump

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Cool Shot AI WhatsApp Bot ready for deployment"
   git push origin main
   ```

2. **Deploy on Katabump**
   - Connect your GitHub repository to Katabump
   - The bot will automatically deploy with these settings:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Port:** Auto-detected (3000 by default)
   - No additional configuration needed!

3. **Link WhatsApp Account - DUAL LOGIN SUPPORT**

   The bot supports both QR code and pairing code methods:

   **QR Code Method (Recommended):**
   - Check Katabump deployment logs
   - A QR code will be displayed in the logs
   - Scan the QR code with WhatsApp on your phone

   **Pairing Code Method:**
   - Check Katabump deployment logs for the pairing code
   - Use the pairing code to link your WhatsApp account
   - Go to WhatsApp → Settings → Linked Devices → Link with phone number

   The bot will send a confirmation message when connected

#### Environment Variables (Optional)

Set these in Katabump dashboard if needed:

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_API_KEY` | GiftedTech API key | `gifted` (free tier) |
| `GOOGLE_API_KEY` | Google Gemini fallback API | Not required |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging level | `info` |

## API Configuration

### Primary APIs (GiftedTech)
The bot uses multiple GiftedTech AI endpoints for optimal performance:
- GPT-4o
- Gemini Pro  
- Meta Llama
- Copilot
- General AI

### Fallback API (Google Gemini)
If all primary APIs fail, the bot can use Google Gemini as backup:
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `GOOGLE_API_KEY` environment variable

## User Commands

### Basic Commands
- `/start` - Welcome message and bot introduction
- `/help` - Complete list of available commands
- `/about` - Information about Cool Shot AI
- `/menu` - Quick settings menu with all options
- `/ping` - Check bot status and connectivity

### AI & Customization
- `/role [role_name]` - Choose your AI expert role
- `/lang [language_code]` - Select your preferred language  
- `/reset` - Reset all your settings to default
- `/stats` - View bot statistics and your settings

### Games & Fun
- `/games` - View all available games
- `/dice` - Roll a dice (1-6)
- `/coin` - Flip a coin (heads/tails)
- `/number` - Generate random number (1-100)
- `/8ball <question>` - Magic 8-ball predictions
- `/quote` - Get inspirational quotes
- `/joke` - Random jokes
- `/fact` - Interesting fun facts

### Text Utilities  
- `/tools` - View all text tools
- `/count <text>` - Count words and characters
- `/reverse <text>` - Reverse text
- `/upper <text>` - Convert to UPPERCASE
- `/lower <text>` - Convert to lowercase
- `/title <text>` - Convert To Title Case
- `/encode <text>` - Base64 encode text
- `/decode <text>` - Base64 decode text

### Support
- `/support [message]` - Send support request to admins

## AI Roles Available

Choose from 100+ expert roles including:

**STEM:** Mathematician, Physicist, Chemist, Biologist, Engineer, Data Scientist, AI Researcher  
**Medical:** Doctor, Psychiatrist, Nutritionist, Pharmacologist, Dentist, Veterinarian  
**Tech:** Developer, Cybersecurity Expert, DevOps Engineer, System Admin, UX Designer  
**Business:** Entrepreneur, Investor, Project Manager, Legal Advisor, Accountant  
**Creative:** Author, Poet, Designer, Music Theorist, Film Critic, Content Creator  
**Education:** Teacher, Professor, Tutor, Language Tutor, AI Trainer  

## Supported Languages

🇬🇧 English • 🇫🇷 French • 🇪🇸 Spanish • 🇩🇪 German • 🇸🇦 Arabic • 🇮🇳 Hindi  
🇳🇬 Yoruba • 🇳🇬 Igbo • 🇨🇳 Chinese • 🇷🇺 Russian • 🇯🇵 Japanese • 🇵🇹 Portuguese  
🇮🇹 Italian • 🇹🇷 Turkish • 🇰🇪 Swahili

## Architecture

```
src/
├── config/
│   └── settings.js          # Bot configuration
├── handlers/
│   ├── basicCommands.js     # Basic command handlers
│   ├── adminCommands.js     # Admin command handlers  
│   ├── gamesHandler.js      # Games and fun commands
│   └── toolsHandler.js      # Text utility commands
├── utils/
│   ├── logger.js            # Logging system
│   ├── userManager.js       # User data management
│   └── aiService.js         # AI API integration
└── index.js                 # Main bot application
```

## Health Check

The bot includes a health check endpoint for monitoring:
- `GET /health` - JSON health status
- `GET /ping` - Simple ping response

## Logging

Comprehensive logging system with multiple levels:
- **System:** Bot lifecycle events
- **Auth:** Authentication and connections  
- **Command:** Command executions
- **AI:** AI API interactions
- **Admin:** Administrative actions
- **User:** User management events

Logs are stored in `./logs/` directory.

## Data Storage

- **User Data:** `./data/users.json` - Persistent user information
- **Analytics:** `./data/analytics.json` - Bot usage statistics  
- **Session:** `./data/auth_info_baileys/` - WhatsApp session data

## Contributing

This bot was ported from the Prof-Tech MVAI Telegram bot. For contributions or admin access, contact:

📧 **Email:** support@coolshotsystems.com  
📱 **WhatsApp:** +234 807 561 4248  
🛡️ **Admin:** RayBen445

## License

ISC License - Cool Shot Systems

---

**Cool Shot AI** - Intelligent WhatsApp Assistant  
*Developed by Cool Shot Systems* 🚀