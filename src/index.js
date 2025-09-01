/**
 * Cool Shot AI WhatsApp Bot
 * Multi-role intelligent assistant powered by AI endpoints
 * Ported from Telegram to WhatsApp using Baileys
 * 
 * Author: Cool Shot Systems
 * Admin: 2348075614248
 */

const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const express = require('express');
const cors = require('cors');

// Import our modules
const config = require('./config/settings');
const logger = require('./utils/logger');
const UserManager = require('./utils/userManager');
const AIService = require('./utils/aiService');
const BasicCommandHandler = require('./handlers/basicCommands');
const AdminCommandHandler = require('./handlers/adminCommands');
const GamesHandler = require('./handlers/gamesHandler');
const ToolsHandler = require('./handlers/toolsHandler');

class CoolShotWhatsAppBot {
  constructor() {
    this.sock = null;
    
    // Initialize managers and handlers
    this.userManager = new UserManager();
    this.aiService = new AIService();
    this.basicHandler = new BasicCommandHandler(this.userManager, this.aiService);
    this.adminHandler = new AdminCommandHandler(this.userManager, this.aiService);
    this.gamesHandler = new GamesHandler(this.userManager);
    this.toolsHandler = new ToolsHandler(this.userManager);
    
    // Set up express server for health check
    this.app = express();
    this.setupHealthServer();
  }

  // Set up health check server
  setupHealthServer() {
    this.app.use(cors());
    this.app.use(express.json());
    
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'online',
        bot: config.bot.name,
        version: config.bot.version,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });
    
    this.app.get('/ping', (req, res) => {
      res.send('🏓 Cool Shot AI WhatsApp Bot is alive!');
    });
    
    // Start server
    this.app.listen(config.server.port, config.server.host, () => {
      logger.system(`Health server running on ${config.server.host}:${config.server.port}`);
    });
  }

  // Initialize the bot
  async initialize() {
    try {
      logger.system('Initializing Cool Shot AI WhatsApp Bot...');
      
      // Initialize user management
      await this.userManager.initialize();
      
      // Start WhatsApp connection
      await this.startWhatsApp();
      
      logger.system('Cool Shot AI WhatsApp Bot initialized successfully!');
    } catch (error) {
      logger.error('Failed to initialize bot', { error: error.message });
      throw error;
    }
  }

  // Start WhatsApp connection
  async startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.files.sessions);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    logger.system('Using WA version', { version, isLatest });

    this.sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // We'll use pairing code instead
      auth: state,
      browser: ['Cool Shot AI', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: true
    });

    // Save authentication state
    this.sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.system('Connection closed', { shouldReconnect });
        
        if (shouldReconnect) {
          setTimeout(() => this.startWhatsApp(), 3000);
        }
      } else if (connection === 'connecting') {
        logger.system('Connecting to WhatsApp...');
        
        // Generate pairing code when connecting for the first time
        if (!this.sock.authState.creds.registered) {
          try {
            // Wait a bit for the connection to stabilize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const phoneNumber = config.connection.phoneNumber; // Connection phone number
            const pairingCode = await this.sock.requestPairingCode(phoneNumber);
            
            logger.auth('Pairing Code Generated', { 
              phoneNumber, 
              pairingCode,
              instructions: 'Open WhatsApp > Linked Devices > Link a Device > Enter this code'
            });
            
            console.log('\n🔗 PAIRING CODE:', pairingCode);
            console.log('📱 Phone Number:', phoneNumber);
            console.log('📋 Instructions:');
            console.log('   1. Open WhatsApp on your phone');
            console.log('   2. Go to Settings > Linked Devices');
            console.log('   3. Tap "Link a Device"');
            console.log('   4. Tap "Link with phone number instead"');
            console.log('   5. Enter the pairing code above\n');
          } catch (error) {
            logger.error('Failed to generate pairing code', { error: error.message });
          }
        }
      } else if (connection === 'open') {
        logger.auth('WhatsApp connection established successfully!');
        
        // Send startup notification to admin
        try {
          await this.sock.sendMessage(config.admin.primaryAdmin, {
            text: `🚀 *Cool Shot AI is Online!*

✅ WhatsApp connection established
🤖 Bot version: ${config.bot.version}
⏰ Started at: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}

Ready to assist users! 🎉`
          });
        } catch (error) {
          logger.warn('Could not send startup notification to admin');
        }
      }
    });

    // Handle incoming messages
    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        await this.handleMessage(message);
      }
    });

    // Handle message updates (read receipts, etc.)
    this.sock.ev.on('messages.update', (updates) => {
      for (const update of updates) {
        logger.system('Message update', { 
          messageId: update.key.id,
          updates: Object.keys(update)
        });
      }
    });
  }

  // Handle incoming messages
  async handleMessage(message) {
    try {
      // Skip if message is from ourselves or invalid
      if (message.key.fromMe || !message.message) return;
      
      // Skip broadcasts
      if (isJidBroadcast(message.key.remoteJid)) {
        return;
      }
      
      // For group messages, only respond when tagged/mentioned
      if (isJidGroup(message.key.remoteJid)) {
        const messageText = this.extractMessageText(message);
        const botNumber = config.connection.phoneNumber;
        
        // Check if bot is mentioned/tagged in the message
        if (!messageText || !messageText.includes(`@${botNumber}`)) {
          return; // Skip group messages where bot is not tagged
        }
      }

      const messageText = this.extractMessageText(message);
      if (!messageText) return;

      const messageInfo = {
        key: message.key,
        remoteJid: message.key.remoteJid,
        pushName: message.pushName,
        participant: message.key.participant
      };

      // Update user info and track message
      await this.userManager.updateUser(messageInfo);
      await this.userManager.trackMessage(message.key.remoteJid);

      // Handle support state (user in support mode)
      if (this.userManager.getSupportState(message.key.remoteJid)) {
        await this.handleSupportMessage(message.key.remoteJid, messageText);
        return;
      }

      // Handle commands
      if (messageText.startsWith('/')) {
        await this.handleCommand(messageInfo, messageText);
      } else {
        // Handle regular chat (AI response)
        await this.handleAIChat(messageInfo, messageText);
      }

    } catch (error) {
      logger.error('Error handling message', { error: error.message });
    }
  }

  // Extract text content from message
  extractMessageText(message) {
    if (message.message?.conversation) {
      return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
      return message.message.videoMessage.caption;
    }
    return null;
  }

  // Handle support messages
  async handleSupportMessage(userId, messageText) {
    this.userManager.setSupportState(userId, false); // Reset state
    
    const user = this.userManager.users[userId];
    const adminIds = this.userManager.getAdminIds();
    
    // Forward to all admins
    for (const adminId of adminIds) {
      await this.sock.sendMessage(adminId, {
        text: `📩 *New Support Request*

👤 **From:** ${user.name}
🆔 **User:** ${user.phoneNumber}

💬 **Message:**
${messageText}`
      });
    }
    
    await this.sock.sendMessage(userId, {
      text: `✅ *Support Request Sent*

📨 Your message has been forwarded to our admin team!
⏰ Expect a response soon.`
    });
    
    logger.command('Support message processed', { userId, message: messageText });
  }

  // Handle AI chat responses
  async handleAIChat(messageInfo, messageText) {
    const userId = messageInfo.key.remoteJid;
    const role = this.userManager.getUserRole(userId);
    const language = this.userManager.getUserLanguage(userId);

    try {
      // Send typing indicator
      await this.sock.sendPresenceUpdate('composing', userId);
      
      // Get AI response
      const response = await this.aiService.getResponse(messageText, role, language);
      
      // Send response
      await this.sock.sendMessage(userId, { text: response });
      
      logger.ai('AI response sent', { userId, role, language });
    } catch (error) {
      logger.error('AI chat error', { userId, error: error.message });
      
      // Send error message
      await this.sock.sendMessage(userId, {
        text: `🤖 *Cool Shot AI*

⚠️ I'm currently experiencing technical difficulties. Please try again in a moment!

💡 Use /help for available commands.

✨ _Cool Shot Systems - Always here to help_`
      });
    } finally {
      // Clear typing indicator
      await this.sock.sendPresenceUpdate('paused', userId);
    }
  }

  // Handle commands
  async handleCommand(messageInfo, messageText) {
    const [command, ...args] = messageText.slice(1).split(' ');
    const commandLower = command.toLowerCase();

    try {
      switch (commandLower) {
        // Basic commands
        case 'start':
          await this.basicHandler.handleStart(this.sock, messageInfo);
          break;
        case 'help':
          await this.basicHandler.handleHelp(this.sock, messageInfo);
          break;
        case 'about':
          await this.basicHandler.handleAbout(this.sock, messageInfo);
          break;
        case 'support':
          await this.basicHandler.handleSupport(this.sock, messageInfo, args);
          break;
        case 'ping':
          await this.basicHandler.handlePing(this.sock, messageInfo);
          break;
        case 'reset':
          await this.basicHandler.handleReset(this.sock, messageInfo);
          break;
        case 'stats':
          await this.basicHandler.handleStats(this.sock, messageInfo);
          break;
        case 'menu':
          await this.basicHandler.handleMenu(this.sock, messageInfo);
          break;
        case 'role':
          await this.basicHandler.handleRole(this.sock, messageInfo, args);
          break;
        case 'lang':
        case 'language':
          await this.basicHandler.handleLanguage(this.sock, messageInfo, args);
          break;

        // Admin commands
        case 'admin':
          await this.adminHandler.handleAdmin(this.sock, messageInfo);
          break;
        case 'admininfo':
          await this.adminHandler.handleAdminInfo(this.sock, messageInfo);
          break;
        case 'adminstats':
          await this.adminHandler.handleAdminStats(this.sock, messageInfo);
          break;
        case 'broadcast':
          await this.adminHandler.handleBroadcast(this.sock, messageInfo, args);
          break;
        case 'users':
          await this.adminHandler.handleUsers(this.sock, messageInfo);
          break;
        case 'promote':
          await this.adminHandler.handlePromote(this.sock, messageInfo, args);
          break;
        case 'demote':
          await this.adminHandler.handleDemote(this.sock, messageInfo, args);
          break;
        case 'apistatus':
          await this.adminHandler.handleAPIStatus(this.sock, messageInfo);
          break;
        case 'commands':
          await this.adminHandler.handleCommands(this.sock, messageInfo);
          break;
        case 'topusers':
          await this.adminHandler.handleTopUsers(this.sock, messageInfo);
          break;
        case 'activity':
          await this.adminHandler.handleActivity(this.sock, messageInfo, args);
          break;

        // Games commands
        case 'games':
          await this.gamesHandler.handleGames(this.sock, messageInfo);
          break;
        case 'dice':
          await this.gamesHandler.handleDice(this.sock, messageInfo);
          break;
        case 'coin':
          await this.gamesHandler.handleCoin(this.sock, messageInfo);
          break;
        case 'number':
          await this.gamesHandler.handleNumber(this.sock, messageInfo);
          break;
        case '8ball':
          await this.gamesHandler.handle8Ball(this.sock, messageInfo, args);
          break;
        case 'quote':
          await this.gamesHandler.handleQuote(this.sock, messageInfo);
          break;
        case 'joke':
          await this.gamesHandler.handleJoke(this.sock, messageInfo);
          break;
        case 'fact':
          await this.gamesHandler.handleFact(this.sock, messageInfo);
          break;

        // Tools commands
        case 'tools':
          await this.toolsHandler.handleTools(this.sock, messageInfo);
          break;
        case 'count':
          await this.toolsHandler.handleCount(this.sock, messageInfo, args);
          break;
        case 'reverse':
          await this.toolsHandler.handleReverse(this.sock, messageInfo, args);
          break;
        case 'upper':
          await this.toolsHandler.handleUpper(this.sock, messageInfo, args);
          break;
        case 'lower':
          await this.toolsHandler.handleLower(this.sock, messageInfo, args);
          break;
        case 'title':
          await this.toolsHandler.handleTitle(this.sock, messageInfo, args);
          break;
        case 'encode':
          await this.toolsHandler.handleEncode(this.sock, messageInfo, args);
          break;
        case 'decode':
          await this.toolsHandler.handleDecode(this.sock, messageInfo, args);
          break;

        default:
          await this.handleUnknownCommand(messageInfo, command);
          break;
      }
    } catch (error) {
      logger.error('Command execution error', { command: commandLower, error: error.message });
      await this.sock.sendMessage(messageInfo.key.remoteJid, {
        text: `❌ Error executing command /${commandLower}. Please try again later.`
      });
    }
  }

  // Handle unknown commands
  async handleUnknownCommand(messageInfo, command) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('unknown', userId);

    const unknownMessage = `❓ *Unknown Command*

The command \`/${command}\` is not recognized.

🆘 *Available Commands:*
• /help - View all commands
• /about - Learn about Cool Shot AI
• /menu - Quick action menu
• /games - Fun activities
• /tools - Text utilities
• /start - Welcome message

💡 *Tip:* Use /help to see the complete command list!`;

    await this.sock.sendMessage(userId, { text: unknownMessage });
    logger.command('Unknown command executed', { userId, command });
  }

  // Graceful shutdown
  async shutdown() {
    logger.system('Shutting down Cool Shot AI...');
    
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (error) {
        logger.error('Error during logout', { error: error.message });
      }
    }
    
    process.exit(0);
  }
}

// Create and start bot
const bot = new CoolShotWhatsAppBot();

// Handle process signals
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Start the bot
bot.initialize().catch(error => {
  logger.error('Failed to start bot', { error: error.message });
  process.exit(1);
});

module.exports = CoolShotWhatsAppBot;