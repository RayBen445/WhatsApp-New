/**
 * Text Tools Command Handlers for Cool Shot AI WhatsApp Bot
 */

const logger = require('../utils/logger');

class ToolsHandler {
  constructor(userManager) {
    this.userManager = userManager;
  }

  // Handle /tools command
  async handleTools(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('tools', userId);

    const toolsMessage = `🛠️ *Text Utilities Toolkit*

📝 **Available Tools:**
• /count <text> - Count words and characters
• /reverse <text> - Reverse text
• /upper <text> - Convert to UPPERCASE
• /lower <text> - Convert to lowercase
• /title <text> - Convert To Title Case
• /encode <text> - Base64 encode text
• /decode <text> - Base64 decode text

💡 *Example:* /count Hello World`;

    await sock.sendMessage(userId, { text: toolsMessage });
    logger.command('Tools menu shown', { userId });
  }

  // Handle /count command
  async handleCount(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('count', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /count <text>
Example: /count Hello World` 
      });
      return;
    }

    const text = args.join(' ');
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    const countMessage = `📊 *Text Analysis Results*

📝 **Text:** "${text}"

🔢 **Statistics:**
• Words: ${words}
• Characters: ${chars}
• Characters (no spaces): ${charsNoSpaces}

✨ _Analysis by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: countMessage });
    logger.command('Text counted', { userId, words, chars });
  }

  // Handle /reverse command
  async handleReverse(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('reverse', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /reverse <text>
Example: /reverse Hello World` 
      });
      return;
    }

    const text = args.join(' ');
    const reversed = text.split('').reverse().join('');

    const reverseMessage = `🔄 *Text Reversal*

📝 **Original:** "${text}"
🔄 **Reversed:** "${reversed}"

✨ _Powered by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: reverseMessage });
    logger.command('Text reversed', { userId });
  }

  // Handle /upper command
  async handleUpper(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('upper', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /upper <text>
Example: /upper hello world` 
      });
      return;
    }

    const text = args.join(' ');
    const upperText = text.toUpperCase();

    const upperMessage = `🔤 *UPPERCASE CONVERSION*

📝 **Original:** "${text}"
🔤 **UPPERCASE:** "${upperText}"

✨ _Powered by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: upperMessage });
    logger.command('Text uppercased', { userId });
  }

  // Handle /lower command
  async handleLower(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('lower', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /lower <text>
Example: /lower HELLO WORLD` 
      });
      return;
    }

    const text = args.join(' ');
    const lowerText = text.toLowerCase();

    const lowerMessage = `🔡 *lowercase conversion*

📝 **Original:** "${text}"
🔡 **lowercase:** "${lowerText}"

✨ _Powered by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: lowerMessage });
    logger.command('Text lowercased', { userId });
  }

  // Handle /title command
  async handleTitle(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('title', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /title <text>
Example: /title hello world` 
      });
      return;
    }

    const text = args.join(' ');
    const titleCase = text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );

    const titleMessage = `📄 *Title Case Conversion*

📝 **Original:** "${text}"
📄 **Title Case:** "${titleCase}"

✨ _Powered by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: titleMessage });
    logger.command('Text title cased', { userId });
  }

  // Handle /encode command
  async handleEncode(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('encode', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /encode <text>
Example: /encode Hello World` 
      });
      return;
    }

    const text = args.join(' ');
    
    try {
      const encoded = Buffer.from(text, 'utf8').toString('base64');
      
      const encodeMessage = `🔐 *Base64 Encoding*

📝 **Original:** "${text}"
🔐 **Encoded:** \`${encoded}\`

✨ _Powered by Cool Shot Systems_`;

      await sock.sendMessage(userId, { text: encodeMessage });
      logger.command('Text encoded', { userId });
    } catch (error) {
      await sock.sendMessage(userId, { text: '❌ Encoding failed. Please check your input.' });
      logger.error('Encoding failed', { userId, error: error.message });
    }
  }

  // Handle /decode command
  async handleDecode(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('decode', userId);

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `Usage: /decode <base64_text>
Example: /decode SGVsbG8gV29ybGQ=` 
      });
      return;
    }

    const text = args.join(' ');
    
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf8');
      
      const decodeMessage = `🔓 *Base64 Decoding*

🔐 **Encoded:** \`${text}\`
🔓 **Decoded:** "${decoded}"

✨ _Powered by Cool Shot Systems_`;

      await sock.sendMessage(userId, { text: decodeMessage });
      logger.command('Text decoded', { userId });
    } catch (error) {
      await sock.sendMessage(userId, { text: '❌ Decoding failed. Please provide valid Base64 text.' });
      logger.error('Decoding failed', { userId, error: error.message });
    }
  }
}

module.exports = ToolsHandler;