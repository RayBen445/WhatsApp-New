/**
 * User Management System for Cool Shot AI WhatsApp Bot
 * Handles user data persistence, admin management, and analytics
 */

const fs = require('fs-extra');
const config = require('../config/settings');
const logger = require('./logger');

class UserManager {
  constructor() {
    this.users = {}; // { userId: userData }
    this.analytics = {
      botStartTime: new Date().toISOString(),
      commandStats: {},
      dailyStats: {},
      userActivity: {},
      totalMessages: 0,
      totalCommands: 0
    };
    this.userRoles = {}; // { userId: role }
    this.userLanguages = {}; // { userId: language }
    this.supportState = {}; // { userId: boolean }
    this.userIds = new Set(); // Track all user IDs for broadcast
  }

  // Initialize user management system
  async initialize() {
    try {
      await this.loadUsers();
      await this.loadAnalytics();
      await this.ensureAdminSetup();
      logger.system('User management system initialized', { 
        userCount: Object.keys(this.users).length,
        adminCount: this.getAdminUsers().length
      });
    } catch (error) {
      logger.error('Failed to initialize user management', { error: error.message });
      throw error;
    }
  }

  // Load users from file
  async loadUsers() {
    try {
      if (await fs.pathExists(config.files.users)) {
        this.users = await fs.readJson(config.files.users);
        logger.system(`Loaded ${Object.keys(this.users).length} users from storage`);
      }
    } catch (error) {
      logger.error('Error loading users', { error: error.message });
    }
  }

  // Save users to file
  async saveUsers() {
    try {
      await fs.ensureDir('./data');
      await fs.writeJson(config.files.users, this.users, { spaces: 2 });
    } catch (error) {
      logger.error('Error saving users', { error: error.message });
    }
  }

  // Load analytics from file
  async loadAnalytics() {
    try {
      if (await fs.pathExists(config.files.analytics)) {
        const stored = await fs.readJson(config.files.analytics);
        this.analytics = { ...this.analytics, ...stored };
        logger.system('Analytics data loaded');
      }
    } catch (error) {
      logger.error('Error loading analytics', { error: error.message });
    }
  }

  // Save analytics to file
  async saveAnalytics() {
    try {
      await fs.ensureDir('./data');
      await fs.writeJson(config.files.analytics, this.analytics, { spaces: 2 });
    } catch (error) {
      logger.error('Error saving analytics', { error: error.message });
    }
  }

  // Ensure primary admin is set up
  async ensureAdminSetup() {
    const adminId = config.admin.primaryAdmin;
    
    if (!this.users[adminId]) {
      this.users[adminId] = {
        id: adminId,
        phoneNumber: config.admin.adminNumber,
        name: 'Admin',
        isAdmin: true,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        messageCount: 0,
        commandCount: 0,
        notes: 'Primary Admin - Cool Shot AI Owner'
      };
      await this.saveUsers();
      logger.admin('Primary admin initialized', { adminId });
    } else if (!this.users[adminId].isAdmin) {
      this.users[adminId].isAdmin = true;
      await this.saveUsers();
      logger.admin('Admin status restored', { adminId });
    }
  }

  // Update user information
  async updateUser(messageInfo) {
    const userId = messageInfo.remoteJid;
    const now = new Date().toISOString();
    
    // Initialize user if not exists
    if (!this.users[userId]) {
      this.users[userId] = {
        id: userId,
        phoneNumber: messageInfo.remoteJid.split('@')[0],
        name: messageInfo.pushName || messageInfo.participant?.split('@')[0] || 'Unknown',
        isAdmin: false,
        firstSeen: now,
        lastSeen: now,
        messageCount: 0,
        commandCount: 0,
        notes: ''
      };
      
      logger.user('New user registered', {
        userId,
        name: this.users[userId].name,
        phoneNumber: this.users[userId].phoneNumber
      });
    } else {
      // Update existing user info
      this.users[userId].name = messageInfo.pushName || this.users[userId].name;
      this.users[userId].lastSeen = now;
    }
    
    this.userIds.add(userId);
    await this.saveUsers();
    
    return this.users[userId];
  }

  // Track command usage
  async trackCommand(command, userId) {
    this.analytics.totalCommands++;
    if (!this.analytics.commandStats[command]) {
      this.analytics.commandStats[command] = 0;
    }
    this.analytics.commandStats[command]++;
    
    // Track user activity
    if (!this.analytics.userActivity[userId]) {
      this.analytics.userActivity[userId] = { commands: 0, messages: 0 };
    }
    this.analytics.userActivity[userId].commands++;
    
    // Update user command count
    if (this.users[userId]) {
      this.users[userId].commandCount++;
    }
    
    await this.saveAnalytics();
    await this.saveUsers();
    
    logger.command(`Command executed: ${command}`, { userId, command });
  }

  // Track message
  async trackMessage(userId) {
    this.analytics.totalMessages++;
    if (!this.analytics.userActivity[userId]) {
      this.analytics.userActivity[userId] = { commands: 0, messages: 0 };
    }
    this.analytics.userActivity[userId].messages++;
    
    // Update user message count
    if (this.users[userId]) {
      this.users[userId].messageCount++;
    }
    
    await this.saveAnalytics();
    await this.saveUsers();
  }

  // Check if user is admin
  isAdmin(userId) {
    return this.users[userId] && this.users[userId].isAdmin;
  }

  // Check if user is primary admin
  isPrimaryAdmin(userId) {
    return userId === config.admin.primaryAdmin;
  }

  // Get all admin users
  getAdminUsers() {
    return Object.values(this.users).filter(user => user.isAdmin);
  }

  // Get admin IDs for broadcasting
  getAdminIds() {
    return this.getAdminUsers().map(user => user.id);
  }

  // Get all user IDs for broadcasting
  getAllUserIds() {
    return Array.from(this.userIds);
  }

  // Promote user to admin (primary admin only)
  async promoteToAdmin(userId, promotedBy) {
    if (!this.isPrimaryAdmin(promotedBy)) {
      return { success: false, error: 'Only the primary admin can promote users' };
    }
    
    if (!this.users[userId]) {
      return { success: false, error: 'User not found in database' };
    }
    
    if (this.users[userId].isAdmin) {
      return { success: false, error: 'User is already an admin' };
    }
    
    this.users[userId].isAdmin = true;
    await this.saveUsers();
    logger.admin('User promoted to admin', { userId, promotedBy });
    return { success: true };
  }

  // Demote admin user (primary admin only, cannot demote self)
  async demoteAdmin(userId, demotedBy) {
    if (!this.isPrimaryAdmin(demotedBy)) {
      return { success: false, error: 'Only the primary admin can demote users' };
    }
    
    if (this.isPrimaryAdmin(userId)) {
      return { success: false, error: 'Primary admin cannot be demoted' };
    }
    
    if (!this.users[userId] || !this.users[userId].isAdmin) {
      return { success: false, error: 'User is not an admin' };
    }
    
    this.users[userId].isAdmin = false;
    await this.saveUsers();
    logger.admin('Admin demoted', { userId, demotedBy });
    return { success: true };
  }

  // Get user role
  getUserRole(userId) {
    return this.userRoles[userId] || config.defaults.role;
  }

  // Set user role
  setUserRole(userId, role) {
    this.userRoles[userId] = role;
  }

  // Get user language
  getUserLanguage(userId) {
    return this.userLanguages[userId] || config.defaults.language;
  }

  // Set user language
  setUserLanguage(userId, language) {
    this.userLanguages[userId] = language;
  }

  // Get support state
  getSupportState(userId) {
    return this.supportState[userId] || false;
  }

  // Set support state
  setSupportState(userId, state) {
    this.supportState[userId] = state;
  }

  // Reset user settings
  resetUserSettings(userId) {
    delete this.userRoles[userId];
    delete this.userLanguages[userId];
  }

  // Get user statistics
  getUserStats() {
    const totalUsers = Object.keys(this.users).length;
    const totalAdmins = this.getAdminUsers().length;
    const activeToday = Object.values(this.users).filter(user => {
      const lastSeen = new Date(user.lastSeen);
      const today = new Date();
      return lastSeen.toDateString() === today.toDateString();
    }).length;

    return {
      totalUsers,
      totalAdmins,
      activeToday,
      totalMessages: this.analytics.totalMessages,
      totalCommands: this.analytics.totalCommands
    };
  }

  // Get uptime in days and hours
  getUptime() {
    const uptime = Math.floor((Date.now() - new Date(this.analytics.botStartTime)) / (1000 * 60 * 60));
    const days = Math.floor(uptime / 24);
    const hours = uptime % 24;
    return { days, hours, total: uptime };
  }

  // Get top commands
  getTopCommands(limit = 10) {
    return Object.entries(this.analytics.commandStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  }

  // Get most active users
  getMostActiveUsers(limit = 10) {
    return Object.entries(this.analytics.userActivity)
      .map(([userId, activity]) => ({
        user: this.users[userId],
        total: activity.messages + activity.commands,
        messages: activity.messages,
        commands: activity.commands
      }))
      .filter(entry => entry.user)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }
}

module.exports = UserManager;