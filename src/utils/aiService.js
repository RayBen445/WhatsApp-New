/**
 * AI Service for Cool Shot AI WhatsApp Bot
 * Handles API calls to GiftedTech and Google Gemini APIs
 */

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/settings');
const logger = require('./logger');

class AIService {
  constructor() {
    // Initialize Google Gemini API if available
    this.geminiAI = null;
    if (config.ai.googleApiKey) {
      try {
        this.geminiAI = new GoogleGenerativeAI(config.ai.googleApiKey);
        logger.ai('Google Gemini API initialized as fallback');
      } catch (error) {
        logger.error('Failed to initialize Google Gemini API', { error: error.message });
      }
    }
  }

  // Main method to get AI response
  async getResponse(prompt, role, language) {
    let response = null;
    
    // Try primary APIs first
    for (const apiUrl of config.ai.primaryAPIs) {
      try {
        response = await this.callPrimaryAPI(apiUrl, prompt, role, language);
        if (response) {
          logger.ai('Primary API response successful', { apiUrl: this.getAPIName(apiUrl) });
          break;
        }
      } catch (error) {
        logger.error('Primary API failed', { 
          apiUrl: this.getAPIName(apiUrl), 
          error: error.message 
        });
      }
    }
    
    // If all primary APIs failed, try Google Gemini
    if (!response && this.geminiAI) {
      try {
        logger.ai('Trying Google Gemini API as fallback...');
        response = await this.callGeminiAPI(prompt, role, language);
        if (response) {
          logger.ai('Google Gemini API response successful');
        }
      } catch (error) {
        logger.error('Google Gemini API failed', { error: error.message });
      }
    }
    
    // If still no response, return error message
    if (!response) {
      logger.warn('All AI APIs failed to provide response');
      return this.getErrorResponse(role, language);
    }
    
    return this.formatResponse(response, role, language);
  }

  // Call primary API (GiftedTech)
  async callPrimaryAPI(url, prompt, role, language) {
    try {
      const { data } = await axios.get(url, {
        params: {
          apikey: config.ai.defaultApiKey,
          q: `${role}: ${prompt}`,
          lang: language
        },
        timeout: config.defaults.timeout
      });

      if (data.result && data.result.trim()) {
        return this.cleanResponse(data.result);
      }
      
      return null;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // Call Google Gemini API as fallback
  async callGeminiAPI(prompt, role, language) {
    if (!this.geminiAI) {
      throw new Error('Google Gemini API not configured');
    }
    
    try {
      const model = this.geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Create comprehensive prompt that maintains Cool Shot AI identity
      const systemPrompt = `You are Cool Shot AI, an intelligent assistant developed by Cool Shot Systems. 
You are currently operating in ${role} mode. Respond in a helpful, professional manner.
Your name is Cool Shot AI and you were created by Cool Shot Systems.
Never mention Google, Gemini, or any other AI provider names.
Always maintain the Cool Shot AI identity and branding.

User Query: ${prompt}`;
      
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (text && text.trim()) {
        return this.cleanResponse(text);
      }
      
      throw new Error('Empty response from Gemini');
    } catch (error) {
      throw new Error(`Google Gemini API error: ${error.message}`);
    }
  }

  // Clean and brand response text
  cleanResponse(text) {
    return text
      // Replace competitor branding with Cool Shot AI
      .replace(/Prof-Tech MVAI|Gifted\s*AI|ChatGPT|GiftedTech|OpenAI/gi, 'Cool Shot AI')
      .replace(/Google|Gemini|Bard/gi, 'Cool Shot AI')
      .replace(/Cool Shot Designs\/Tech/gi, 'Cool Shot Systems')
      
      // Replace generic AI responses
      .replace(/I[''`]?m an AI (language model|assistant)/gi, "I'm Cool Shot AI, your intelligent assistant")
      .replace(/I was (created|developed|made|built) by (Google|OpenAI|.*?)[\.\n]/gi, "I was created by Cool Shot Systems.\n")
      .replace(/Google AI|Google's AI|Gemini AI|OpenAI/gi, "Cool Shot AI")
      .replace(/I'm here to help/gi, "I'm Cool Shot AI, here to help")
      
      // Clean up quotes
      .replace(/[""]/g, '"')
      .trim();
  }

  // Format the final response with branding
  formatResponse(content, role, language) {
    const time = new Date().toLocaleTimeString('en-NG', { 
      timeZone: 'Africa/Lagos', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const langLabel = config.languages.find(l => l.code === language)?.label || '🇬🇧 English';
    const roleLabel = config.roles.includes(role) ? role : config.defaults.role;
    
    return `🤖 *Cool Shot AI* | *${roleLabel}*
🌐 ${langLabel} | ⏰ ${time}

${content}

✨ _Powered by Cool Shot Systems_`;
  }

  // Get error response when all APIs fail
  getErrorResponse(role, language) {
    const time = new Date().toLocaleTimeString('en-NG', { 
      timeZone: 'Africa/Lagos', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const langLabel = config.languages.find(l => l.code === language)?.label || '🇬🇧 English';
    const roleLabel = config.roles.includes(role) ? role : config.defaults.role;
    
    return `🤖 *Cool Shot AI* | *${roleLabel}*
🌐 ${langLabel} | ⏰ ${time}

⚠️ I'm currently experiencing technical difficulties with my AI processing. Please try again in a moment!

💡 In the meantime, you can:
• Use /games for entertainment
• Use /tools for text utilities
• Use /help for command list

✨ _Cool Shot Systems - Always here to help_`;
  }

  // Get API name from URL for logging
  getAPIName(url) {
    if (url.includes('gpt4o')) return 'GPT-4o';
    if (url.includes('geminiaipro')) return 'Gemini Pro';
    if (url.includes('meta-llama')) return 'Meta Llama';
    if (url.includes('copilot')) return 'Copilot';
    return 'GiftedTech AI';
  }

  // Get API status for admin dashboard
  async getAPIStatus() {
    const status = {
      primary: [],
      fallback: null,
      timestamp: new Date().toISOString()
    };
    
    // Check primary APIs
    for (const url of config.ai.primaryAPIs) {
      const apiName = this.getAPIName(url);
      try {
        // Quick test call
        await axios.get(url, {
          params: {
            apikey: config.ai.defaultApiKey,
            q: 'test',
            lang: 'en'
          },
          timeout: 5000
        });
        status.primary.push({ name: apiName, status: 'online' });
      } catch (error) {
        status.primary.push({ name: apiName, status: 'offline', error: error.message });
      }
    }
    
    // Check Google Gemini
    if (this.geminiAI) {
      try {
        const model = this.geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent('test');
        status.fallback = { name: 'Google Gemini', status: 'online' };
      } catch (error) {
        status.fallback = { name: 'Google Gemini', status: 'offline', error: error.message };
      }
    } else {
      status.fallback = { name: 'Google Gemini', status: 'not_configured' };
    }
    
    return status;
  }
}

module.exports = AIService;