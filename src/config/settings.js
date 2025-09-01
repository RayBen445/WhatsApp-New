/**
 * Configuration settings for Cool Shot AI WhatsApp Bot
 */

const config = {
  // Bot Settings
  bot: {
    name: 'Cool Shot AI',
    version: '1.0.0',
    developer: 'Cool Shot Systems',
    sessionName: 'coolshot_whatsapp_session'
  },
  
  // Admin Configuration
  admin: {
    // Primary admin WhatsApp number (must include country code)
    primaryAdmin: '2348075614248@s.whatsapp.net',
    adminNumber: '2348075614248'  // Without @s.whatsapp.net for display
  },
  
  // Connection Configuration
  connection: {
    // WhatsApp number to connect the bot to (for pairing code)
    // Can be configured via PHONE_NUMBER environment variable
    phoneNumber: process.env.PHONE_NUMBER || '2349135600014'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  
  // File Storage
  files: {
    users: './data/users.json',
    analytics: './data/analytics.json',
    sessions: './data/auth_info_baileys'
  },
  
  // AI Configuration
  ai: {
    // Primary APIs (GiftedTech)
    primaryAPIs: [
      'https://api.giftedtech.co.ke/api/ai/gpt4o',
      'https://api.giftedtech.co.ke/api/ai/geminiaipro',
      'https://api.giftedtech.co.ke/api/ai/meta-llama',
      'https://api.giftedtech.co.ke/api/ai/copilot',
      'https://api.giftedtech.co.ke/api/ai/ai'
    ],
    // Fallback API
    googleApiKey: process.env.GOOGLE_API_KEY,
    // Default API key for GiftedTech
    defaultApiKey: process.env.AI_API_KEY || 'gifted'
  },
  
  // Default Settings
  defaults: {
    role: 'Brain Master',
    language: 'en',
    timeout: 8000
  },
  
  // Supported Languages
  languages: [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'es', label: '🇪🇸 Spanish' },
    { code: 'de', label: '🇩🇪 German' },
    { code: 'ar', label: '🇸🇦 Arabic' },
    { code: 'hi', label: '🇮🇳 Hindi' },
    { code: 'yo', label: '🇳🇬 Yoruba' },
    { code: 'ig', label: '🇳🇬 Igbo' },
    { code: 'zh', label: '🇨🇳 Chinese' },
    { code: 'ru', label: '🇷🇺 Russian' },
    { code: 'ja', label: '🇯🇵 Japanese' },
    { code: 'pt', label: '🇵🇹 Portuguese' },
    { code: 'it', label: '🇮🇹 Italian' },
    { code: 'tr', label: '🇹🇷 Turkish' },
    { code: 'sw', label: '🇰🇪 Swahili' }
  ],
  
  // Available AI Roles
  roles: [
    'Mathematician', 'Econometician', 'Doctor', 'Brain Master', 'Physicist', 'Chemist', 'Biologist',
    'Engineer', 'Philosopher', 'Psychologist', 'Spiritual Advisor', 'AI Researcher', 'Teacher', 'Professor',
    'Developer', 'Data Scientist', 'Statistician', 'Entrepreneur', 'Journalist', 'History Expert', 'Lawyer',
    'Accountant', 'Investor', 'Startup Mentor', 'UX Designer', 'Therapist', 'Nutritionist', 'Fitness Coach',
    'Poet', 'Author', 'Script Writer', 'Public Speaker', 'Game Developer', 'Ethical Hacker', 'Security Analyst',
    'DevOps Engineer', 'Cloud Expert', 'Geographer', 'Astronomer', 'Political Analyst', 'Environmental Scientist',
    'AI Lawyer', 'Robotics Engineer', 'Medical Researcher', 'Economist', 'Agronomist', 'Anthropologist',
    'Cryptographer', 'Quantum Physicist', 'Visionary', 'Linguist', 'AI Trainer', 'Mobile Developer',
    'Web Developer', 'Data Analyst', 'System Admin', 'Logician', 'Neuroscientist', 'Ecologist', 'Marine Biologist',
    'Meteorologist', 'Cybersecurity Expert', 'Economics Tutor', 'Healthcare Consultant', 'Project Manager',
    'Content Creator', 'SEO Expert', 'Social Media Strategist', 'Pharmacologist', 'Dentist', 'Veterinarian',
    'Music Theorist', 'AI Ethicist', 'Language Tutor', 'Blockchain Developer', 'Geneticist', 'Psychiatrist',
    'UX Researcher', 'Game Designer', 'Legal Advisor', 'Literary Critic', 'Cultural Analyst', 'Civil Engineer',
    'Mechanical Engineer', 'Electrical Engineer', 'AI Psychologist', 'Film Critic', 'Forensic Scientist',
    'Statistic Tutor', 'AI Architect', 'AI Philosopher', 'Hardware Engineer', 'Nutrition Coach', 'Space Scientist',
    'Theologian'
  ]
};

module.exports = config;