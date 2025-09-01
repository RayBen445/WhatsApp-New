/**
 * Basic Command Handlers for Cool Shot AI WhatsApp Bot
 * Handles start, help, about, support, and other fundamental commands
 */

const config = require('../config/settings');
const logger = require('../utils/logger');

class BasicCommandHandler {
  constructor(userManager, aiService) {
    this.userManager = userManager;
    this.aiService = aiService;
  }

  // Handle /start command
  async handleStart(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    const user = await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('start', userId);

    const welcomeMessage = `👋 *Hello, I'm Cool Shot AI!*

🤖 Developed by *Cool Shot Systems*, your intelligent assistant is now online!

💡 Ask me anything:
🧮 Math | 💊 Health | 💻 Tech | 🎭 Creativity

🎓 Use /role to switch brain mode
🌐 Use /lang to choose language
🛠️ Use /menu for quick options
🔄 Use /reset to reset settings
🎮 Use /games for fun activities
🆘 Use /support <your message> for support
🚀 Let's go!`;

    await sock.sendMessage(userId, { text: welcomeMessage });
    logger.command('Start command executed', { userId, userName: user.name });
  }

  // Handle /help command
  async handleHelp(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('help', userId);

    const helpMessage = `🆘 *Cool Shot AI Help*

• Use /start to see welcome
• /role to pick your expert mode
• /lang for language
• /about for info
• /reset for a fresh start
• /menu for quick options
• /games for fun activities
• /tools for text utilities
• /stats for bot statistics
• /support <your message> if you need help
• /ping to check bot status`;

    await sock.sendMessage(userId, { text: helpMessage });
    logger.command('Help command executed', { userId });
  }

  // Handle /about command
  async handleAbout(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('about', userId);

    const aboutMessage = `ℹ️ *About Cool Shot AI*

🤖 Developed by *Cool Shot Systems*
💡 Multi-role intelligent assistant powered by AI endpoints
🌐 15+ languages supported
🧠 100+ Knowledge Roles

🎓 Use /role and /lang
🛠️ Use /menu for quick settings
🔄 Use /reset to reset settings
🆘 Use /support <your message> for support`;

    await sock.sendMessage(userId, { text: aboutMessage });
    logger.command('About command executed', { userId });
  }

  // Handle /support command
  async handleSupport(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    const user = await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('support', userId);

    if (args && args.length > 0) {
      // Support message provided
      const supportText = args.join(' ');
      const adminIds = this.userManager.getAdminIds();
      
      // Send to all admins
      for (const adminId of adminIds) {
        const supportMessage = `📩 *New Support Request*

👤 **From:** ${user.name}
🆔 **User ID:** ${user.phoneNumber}

💬 **Message:**
${supportText}`;
        
        await sock.sendMessage(adminId, { text: supportMessage });
      }
      
      await sock.sendMessage(userId, { 
        text: `✅ *Support Request Sent*

📨 Your message has been forwarded to our admin team!
⏰ Expect a response soon.` 
      });
      
      logger.command('Support request sent', { userId, message: supportText });
    } else {
      // Show support info and activate support mode
      this.userManager.setSupportState(userId, true);
      
      const supportMessage = `🆘 *Cool Shot AI Support Center*

💌 *Contact Options:*
• Email: support@coolshotsystems.com
• Quick Help: /support <your message>

⚡ *Response Time:* Our admins respond ASAP!

💡 *Tip:* Be specific about your issue for faster resolution.

📝 *Support Mode Activated:* Your next message will be sent directly to our admin team!`;

      await sock.sendMessage(userId, { text: supportMessage });
      logger.command('Support mode activated', { userId });
    }
  }

  // Handle /ping command
  async handlePing(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('ping', userId);

    await sock.sendMessage(userId, { 
      text: `🏓 *Cool Shot AI Status: ONLINE*

✅ All systems operational!` 
    });
    
    logger.command('Ping command executed', { userId });
  }

  // Handle /reset command
  async handleReset(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('reset', userId);

    this.userManager.resetUserSettings(userId);

    const resetMessage = `🔄 *Settings Reset Complete*

✅ Role: Default (Brain Master)
✅ Language: Default (English)

💡 Use /role and /lang to customize again!`;

    await sock.sendMessage(userId, { text: resetMessage });
    logger.command('Reset command executed', { userId });
  }

  // Handle /stats command
  async handleStats(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('stats', userId);

    const stats = this.userManager.getUserStats();
    const uptime = this.userManager.getUptime();
    const userRole = this.userManager.getUserRole(userId);
    const userLang = this.userManager.getUserLanguage(userId);
    const langLabel = config.languages.find(l => l.code === userLang)?.label || '🇬🇧 English';

    const statsMessage = `📊 *Cool Shot AI Statistics*

⏰ **Bot Uptime:** ${uptime.days}d ${uptime.hours}h
👥 **Total Users:** ${stats.totalUsers}
🛡️ **Administrators:** ${stats.totalAdmins}
🎯 **Active Today:** ${stats.activeToday}
💬 **Total Messages:** ${stats.totalMessages}
⚡ **Total Commands:** ${stats.totalCommands}

👤 **Your Settings:**
🧠 Role: ${userRole}
🌐 Language: ${langLabel}

✨ _Powered by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: statsMessage });
    logger.command('Stats command executed', { userId });
  }

  // Handle /menu command (quick options)
  async handleMenu(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('menu', userId);

    const menuMessage = `⚙️ *Quick Settings Menu*

🚀 Choose an option:

🧠 */role* - Choose your expert role
🌍 */lang* - Select your language
ℹ️ */about* - About Cool Shot AI
🔄 */reset* - Reset your settings
🆘 */support* - Get support help
🛡️ */admin* - Admin panel (admins only)
🎮 */games* - Games & fun activities
🛠️ */tools* - Text utilities
📊 */stats* - Bot statistics
🏓 */ping* - System status
📚 */help* - Help guide`;

    await sock.sendMessage(userId, { text: menuMessage });
    logger.command('Menu command executed', { userId });
  }

  // Handle role selection
  async handleRole(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('role', userId);

    if (args && args.length > 0) {
      // Role provided as argument
      const requestedRole = args.join(' ');
      const role = config.roles.find(r => r.toLowerCase() === requestedRole.toLowerCase());
      
      if (role) {
        this.userManager.setUserRole(userId, role);
        await sock.sendMessage(userId, { 
          text: `🧠 *Role Updated Successfully*

✅ Your new expert role: *${role}*

🚀 AI responses will now be tailored to this expertise!` 
        });
        logger.command('Role set via argument', { userId, role });
      } else {
        await sock.sendMessage(userId, { 
          text: `❌ Role "${requestedRole}" not found. Use /role to see available roles.` 
        });
      }
    } else {
      // Show available roles (first 20)
      const rolesList = config.roles.slice(0, 20).map((role, index) => 
        `${index + 1}. ${role}`
      ).join('\n');
      
      const rolesMessage = `🧠 *Choose Your Expert Role*

💡 Available roles (first 20):

${rolesList}

... and ${config.roles.length - 20} more roles.

📝 *Usage:* /role <role name>
*Example:* /role Doctor`;

      await sock.sendMessage(userId, { text: rolesMessage });
      logger.command('Role list shown', { userId });
    }
  }

  // Handle language selection
  async handleLanguage(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('lang', userId);

    if (args && args.length > 0) {
      // Language provided as argument
      const requestedLang = args[0].toLowerCase();
      const language = config.languages.find(l => 
        l.code.toLowerCase() === requestedLang || 
        l.label.toLowerCase().includes(requestedLang)
      );
      
      if (language) {
        this.userManager.setUserLanguage(userId, language.code);
        await sock.sendMessage(userId, { 
          text: `🌍 *Language Updated Successfully*

✅ Your new language: ${language.label}

🗣️ AI responses will now be in your selected language!` 
        });
        logger.command('Language set via argument', { userId, language: language.code });
      } else {
        await sock.sendMessage(userId, { 
          text: `❌ Language "${requestedLang}" not found. Use /lang to see available languages.` 
        });
      }
    } else {
      // Show available languages
      const langsList = config.languages.map((lang, index) => 
        `${index + 1}. ${lang.label} (${lang.code})`
      ).join('\n');
      
      const languagesMessage = `🌍 *Choose Your Language*

🗣️ Available languages:

${langsList}

📝 *Usage:* /lang <language code>
*Example:* /lang es (for Spanish)`;

      await sock.sendMessage(userId, { text: languagesMessage });
      logger.command('Language list shown', { userId });
    }
  }
}

module.exports = BasicCommandHandler;