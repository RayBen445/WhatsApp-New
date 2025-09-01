/**
 * Admin Command Handlers for Cool Shot AI WhatsApp Bot
 * Handles admin panel, user management, broadcasting, and analytics
 */

const config = require('../config/settings');
const logger = require('../utils/logger');

class AdminCommandHandler {
  constructor(userManager, aiService) {
    this.userManager = userManager;
    this.aiService = aiService;
  }

  // Handle /admin command
  async handleAdmin(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    const user = await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('admin', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { 
        text: `⛔️ *Access Denied*

🛡️ This command is reserved for administrators only.` 
      });
      return;
    }

    const adminMessage = `🛡️ *Admin Control Panel*

✨ Welcome to the administrative dashboard!

📊 **Available Commands:**
• */adminstats* - View system statistics
• */broadcast <message>* - Send message to all users
• */users* - View registered users
• */promote <number>* - Promote user to admin
• */demote <number>* - Demote admin user
• */activity* - View user activity
• */apistatus* - Check AI API status
• */commands* - Command usage statistics
• */topusers* - Most active users

${this.userManager.isPrimaryAdmin(userId) ? '👑 *Primary Admin:* Full access to all features' : '🛡️ *Admin:* Limited management features'}`;

    await sock.sendMessage(userId, { text: adminMessage });
    logger.admin('Admin panel accessed', { userId, isAdmin: true });
  }

  // Handle /admininfo command
  async handleAdminInfo(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    const user = await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('admininfo', userId);

    const isCurrentUserAdmin = this.userManager.isAdmin(userId);
    const adminUsers = this.userManager.getAdminUsers();
    const stats = this.userManager.getUserStats();

    let message = `🛡️ *Admin System Info*

👤 Your ID: ${user.phoneNumber}
📛 Name: ${user.name}
⚡ Admin Status: ${isCurrentUserAdmin ? '✅ Admin' : '❌ Not Admin'}
👥 Total Admins: ${adminUsers.length}
👥 Total Users: ${stats.totalUsers}

`;

    if (!isCurrentUserAdmin) {
      message += `📋 *How to become admin:*
Contact the primary admin (${config.admin.adminNumber}) to promote you using /promote ${user.phoneNumber}`;
    } else {
      message += `🎉 You have admin privileges!
${this.userManager.isPrimaryAdmin(userId) ? '👑 You are the primary admin with full rights.' : '🛡️ You are a regular admin.'}`;
    }

    await sock.sendMessage(userId, { text: message });
    logger.admin('Admin info requested', { userId, isAdmin: isCurrentUserAdmin });
  }

  // Handle /adminstats command
  async handleAdminStats(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('adminstats', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    const stats = this.userManager.getUserStats();
    const uptime = this.userManager.getUptime();
    const topCommands = this.userManager.getTopCommands(5);

    let statsMessage = `📊 *System Statistics*

⏰ **Bot Uptime:** ${uptime.days}d ${uptime.hours}h
👥 **Total Users:** ${stats.totalUsers}
🛡️ **Administrators:** ${stats.totalAdmins}
🎯 **Active Today:** ${stats.activeToday}
💬 **Total Messages:** ${stats.totalMessages}
⚡ **Total Commands:** ${stats.totalCommands}

🏆 **Top Commands:**
`;

    topCommands.forEach(([command, count], index) => {
      const percentage = ((count / stats.totalCommands) * 100).toFixed(1);
      statsMessage += `${index + 1}. /${command} - ${count} uses (${percentage}%)\n`;
    });

    statsMessage += `\n✨ _Admin Statistics by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: statsMessage });
    logger.admin('Admin stats viewed', { userId });
  }

  // Handle /broadcast command
  async handleBroadcast(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    const user = await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('broadcast', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    if (!args || args.length === 0) {
      await sock.sendMessage(userId, { 
        text: `📢 *Broadcast System*

💡 To send a message to all users:
/broadcast <your message>

📤 Your message will be delivered to all registered users.

*Example:* /broadcast Hello everyone! Cool Shot AI has been updated.` 
      });
      return;
    }

    const broadcastMessage = args.join(' ');
    const allUserIds = this.userManager.getAllUserIds();
    
    const message = `📢 *Admin Broadcast*

👤 **From:** ${user.name}

💬 **Message:**
${broadcastMessage}`;

    let successCount = 0;
    let failCount = 0;

    for (const targetUserId of allUserIds) {
      try {
        await sock.sendMessage(targetUserId, { text: message });
        successCount++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failCount++;
        logger.error('Broadcast failed for user', { targetUserId, error: error.message });
      }
    }

    await sock.sendMessage(userId, { 
      text: `✅ *Broadcast Complete*

📤 Successfully sent to: ${successCount} users
❌ Failed to send to: ${failCount} users
🎯 Total attempted: ${allUserIds.length} users` 
    });

    logger.admin('Broadcast completed', { 
      userId, 
      success: successCount, 
      failed: failCount, 
      total: allUserIds.length 
    });
  }

  // Handle /users command
  async handleUsers(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('users', userId);

    if (!this.userManager.isPrimaryAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ Only the primary admin can view the user list.' });
      return;
    }

    const allUsers = Object.values(this.userManager.users);
    const adminUsers = allUsers.filter(user => user.isAdmin);
    const regularUsers = allUsers.filter(user => !user.isAdmin);

    let message = `👥 *User Database* (${allUsers.length} users)

🛡️ **Admins (${adminUsers.length}):**
`;

    adminUsers.forEach((user, index) => {
      const isPrimary = this.userManager.isPrimaryAdmin(user.id) ? ' 👑' : '';
      message += `${index + 1}. ${user.name} (${user.phoneNumber})${isPrimary}\n`;
    });

    message += `\n👤 **Regular Users (showing first 15 of ${regularUsers.length}):**\n`;
    
    regularUsers.slice(0, 15).forEach((user, index) => {
      message += `${index + 1}. ${user.name} (${user.phoneNumber})\n`;
    });

    if (regularUsers.length > 15) {
      message += `... and ${regularUsers.length - 15} more users\n`;
    }

    message += `\n💡 Use /promote <phone_number> to promote a user to admin`;
    message += `\n💡 Use /demote <phone_number> to demote an admin`;

    await sock.sendMessage(userId, { text: message });
    logger.admin('User list viewed', { userId });
  }

  // Handle /promote command
  async handlePromote(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('promote', userId);

    if (!this.userManager.isPrimaryAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ Only the primary admin can promote users.' });
      return;
    }

    if (!args || args.length !== 1) {
      await sock.sendMessage(userId, { 
        text: `Usage: /promote <phone_number>
Example: /promote 2349012345678` 
      });
      return;
    }

    const targetPhone = args[0];
    const targetUserId = `${targetPhone}@s.whatsapp.net`;
    
    const result = await this.userManager.promoteToAdmin(targetUserId, userId);
    
    if (result.success) {
      const user = this.userManager.users[targetUserId];
      const userName = user ? user.name : 'Unknown User';
      
      await sock.sendMessage(userId, { 
        text: `✅ ${userName} (${targetPhone}) has been promoted to admin!` 
      });
      
      // Notify the promoted user
      try {
        await sock.sendMessage(targetUserId, { 
          text: '🎉 Congratulations! You have been promoted to admin by the primary admin.' 
        });
      } catch (error) {
        logger.warn('Could not notify promoted user', { targetUserId });
      }
      
      logger.admin('User promoted', { promotedBy: userId, promoted: targetUserId });
    } else {
      await sock.sendMessage(userId, { text: `❌ ${result.error}` });
    }
  }

  // Handle /demote command
  async handleDemote(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('demote', userId);

    if (!this.userManager.isPrimaryAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ Only the primary admin can demote users.' });
      return;
    }

    if (!args || args.length !== 1) {
      await sock.sendMessage(userId, { 
        text: `Usage: /demote <phone_number>
Example: /demote 2349012345678` 
      });
      return;
    }

    const targetPhone = args[0];
    const targetUserId = `${targetPhone}@s.whatsapp.net`;
    
    const result = await this.userManager.demoteAdmin(targetUserId, userId);
    
    if (result.success) {
      const user = this.userManager.users[targetUserId];
      const userName = user ? user.name : 'Unknown User';
      
      await sock.sendMessage(userId, { 
        text: `✅ ${userName} (${targetPhone}) has been demoted from admin.` 
      });
      
      // Notify the demoted user
      try {
        await sock.sendMessage(targetUserId, { 
          text: '📉 You have been demoted from admin by the primary admin.' 
        });
      } catch (error) {
        logger.warn('Could not notify demoted user', { targetUserId });
      }
      
      logger.admin('User demoted', { demotedBy: userId, demoted: targetUserId });
    } else {
      await sock.sendMessage(userId, { text: `❌ ${result.error}` });
    }
  }

  // Handle /apistatus command
  async handleAPIStatus(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('apistatus', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    await sock.sendMessage(userId, { text: '🔧 Checking API status... Please wait.' });

    try {
      const apiStatus = await this.aiService.getAPIStatus();
      
      let message = `🔧 *AI API Status Dashboard*

🎯 **Primary APIs (${config.ai.primaryAPIs.length}):**
`;

      apiStatus.primary.forEach((api, index) => {
        const statusIcon = api.status === 'online' ? '✅' : '❌';
        message += `${index + 1}. ${api.name} ${statusIcon} ${api.status}\n`;
      });

      message += `\n🤖 **Fallback API:**\n`;
      if (apiStatus.fallback) {
        const statusIcon = apiStatus.fallback.status === 'online' ? '✅' : 
                          apiStatus.fallback.status === 'not_configured' ? '⚠️' : '❌';
        message += `${statusIcon} ${apiStatus.fallback.name} - ${apiStatus.fallback.status}\n`;
      }

      message += `\n📊 **API Flow:**
1. Try all ${config.ai.primaryAPIs.length} primary APIs sequentially
2. If all fail, use Google Gemini fallback
3. If still no response, show enhanced error message

🛡️ **Brand Protection:**
• All responses maintain Cool Shot AI identity
• Comprehensive text replacement ensures consistency
• No external provider names leak through

✨ _Cool Shot Systems API Management_`;

      await sock.sendMessage(userId, { text: message });
      
    } catch (error) {
      await sock.sendMessage(userId, { text: '❌ Failed to check API status. Please try again later.' });
      logger.error('API status check failed', { error: error.message });
    }
  }

  // Handle /commands command (command statistics)
  async handleCommands(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('commands', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    const stats = this.userManager.getUserStats();
    const topCommands = this.userManager.getTopCommands(15);

    let message = `⚡ *Command Usage Statistics*

📊 **Total Commands Executed:** ${stats.totalCommands}

🏆 **Top Commands:**
`;

    topCommands.forEach(([command, count], index) => {
      const percentage = ((count / stats.totalCommands) * 100).toFixed(1);
      message += `${index + 1}. /${command} - ${count} uses (${percentage}%)\n`;
    });

    if (topCommands.length === 0) {
      message += `No command data available yet.`;
    }

    message += `\n✨ _Analytics by Cool Shot Systems_`;

    await sock.sendMessage(userId, { text: message });
    logger.admin('Command stats viewed', { userId });
  }

  // Handle /topusers command
  async handleTopUsers(sock, messageInfo) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('topusers', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    const mostActiveUsers = this.userManager.getMostActiveUsers(10);

    let message = `👑 *Most Active Users*

`;

    mostActiveUsers.forEach((entry, index) => {
      const isAdminBadge = entry.user.isAdmin ? ' 🛡️' : '';
      message += `${index + 1}. ${entry.user.name} (${entry.user.phoneNumber})${isAdminBadge}
   💬 ${entry.messages} msgs | ⚡ ${entry.commands} cmds | 🎯 ${entry.total} total

`;
    });

    if (mostActiveUsers.length === 0) {
      message += `No user activity data available yet.`;
    } else {
      message += `✨ _Rankings by Cool Shot Systems_`;
    }

    await sock.sendMessage(userId, { text: message });
    logger.admin('Top users viewed', { userId });
  }

  // Handle /activity command
  async handleActivity(sock, messageInfo, args) {
    const userId = messageInfo.key.remoteJid;
    await this.userManager.updateUser(messageInfo);
    await this.userManager.trackCommand('activity', userId);

    if (!this.userManager.isAdmin(userId)) {
      await sock.sendMessage(userId, { text: '⛔️ *Access Denied* - Admins only!' });
      return;
    }

    if (args && args.length > 0) {
      // Show specific user activity
      const targetPhone = args[0];
      const targetUserId = `${targetPhone}@s.whatsapp.net`;
      const user = this.userManager.users[targetUserId];
      
      if (!user) {
        await sock.sendMessage(userId, { text: '❌ User not found in database.' });
        return;
      }
      
      const activity = this.userManager.analytics.userActivity[targetUserId] || { commands: 0, messages: 0 };
      const totalActivity = activity.messages + activity.commands;
      
      const activityMessage = `👤 *User Activity Report*

📛 **Name:** ${user.name}
🆔 **Phone:** ${user.phoneNumber}
🛡️ **Admin:** ${user.isAdmin ? '✅ Yes' : '❌ No'}

📊 **Activity Stats:**
💬 Messages: ${activity.messages}
⚡ Commands: ${activity.commands}
🎯 Total: ${totalActivity}

📅 **Dates:**
🆕 First Seen: ${new Date(user.firstSeen).toLocaleDateString()}
👁️ Last Seen: ${new Date(user.lastSeen).toLocaleDateString()}

📝 **Notes:** ${user.notes || 'No notes'}`;

      await sock.sendMessage(userId, { text: activityMessage });
      
    } else {
      // Show general activity overview
      const mostActiveUsers = this.userManager.getMostActiveUsers(10);
      
      let message = `📈 *Recent User Activity*

👑 **Most Active Users (Top 10):**

`;

      mostActiveUsers.forEach((entry, index) => {
        const isAdminBadge = entry.user.isAdmin ? ' 🛡️' : '';
        message += `${index + 1}. ${entry.user.name}${isAdminBadge}
   ${entry.user.phoneNumber} | 🎯 ${entry.total} interactions

`;
      });
      
      message += `💡 Use /activity <phone_number> for detailed user stats`;
      
      await sock.sendMessage(userId, { text: message });
    }
    
    logger.admin('Activity viewed', { userId });
  }
}

module.exports = AdminCommandHandler;