const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) process.env.FFMPEG_PATH = ffmpegPath;

const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  StreamType,
  getVoiceConnection
} = require('@discordjs/voice');

// ==========================================================
//              GHOST RP - PUT ALL IDS HERE
// ==========================================================
const CONFIG = {
  TOKEN: process.env.DISCORD_TOKEN,

  GUILD_ID: '1535754836061065318',

  // ---------- Channels ----------
  APPLICATION_PANEL_CHANNEL_ID: '1535782011841683576',
  APPLICATION_RESULTS_CHANNEL_ID: '1535792428068372500',
  VIDEO_CHANNEL_ID: '1535784708657651763',
  WELCOME_CHANNEL_ID: '1535772685337100431',
  RULES_CHANNEL_ID: '1535773187676315688',
  RATINGS_CHANNEL_ID: '1536098931728064664',
  SUPPORT_VOICE_CHANNEL_ID: '1536099298721140756',
  LOG_CHANNEL_ID: '1536099473124757564',

  // ---------- Roles ----------
  DEFAULT_MEMBER_ROLE_ID: '1535763946596728902',
  ACCEPTED_APPLICATION_ROLE_ID: '1535767262580047923',
  ACCEPTED_VIDEO_ROLE_ID: '1535764584152043601',
  SECOND_REJECTION_ROLE_ID: '1535767499000512632',

  // ONLY these 2 roles can accept/reject applications and videos
  REVIEWER_ROLE_IDS: [
    '1535756001352093696',
    '1535755748297146398'
  ],

  // These roles bypass automatic protection
  PROTECTION_BYPASS_ROLE_IDS: [
    '1535754877882474557',
    '1535755333572763798',
    '1535754908261941350'
  ],

  SERVER_NAME: 'Ghost RP',

  // ---------- Auto Roles ----------
  // Ø§ÙØ¨ÙØª ÙØ¹Ø·Ù Ø§ÙØ±ÙÙÙÙ Ø¯ÙÙ ØªÙÙØ§Ø¦ÙØ§Ù ÙØ£Ù Ø´Ø®Øµ ÙØ¯Ø®Ù Ø§ÙØ³ÙØ±ÙØ±.
  AUTO_JOIN_ROLE_IDS: [
    'PUT_FIRST_AUTO_ROLE_ID',
    'PUT_SECOND_AUTO_ROLE_ID'
  ],
  COLOR: 0x1687FF,
  WELCOME_BANNER_URL: 'https://cdn.discordapp.com/attachments/1535772685337100431/1536106506506862743/ChatGPT_Image_Aug_9_2026_06_54_02_PM.png',


  // ---------- Rejection Roles ----------
  FIRST_REJECTION_ROLE_ID: '1535767418574602300',

  // ---------- Ticket System ----------
  TICKET_PANEL_CHANNEL_ID: '1536034090082369628',
  TICKET_LOG_CHANNEL_ID: '1536345331736776764',
  TICKET_RATING_CHANNEL_ID: '1536345751947313202',

  // ÙÙØ· Ø§ÙØ±ÙÙÙÙ Ø¯ÙÙ ÙÙØ¯Ø±ÙØ§ ÙØ³ØªØ®Ø¯ÙÙØ§ Ø£ÙØ§ÙØ± Ø¥Ø¯Ø§Ø±Ø© Ø§ÙØªØ°ÙØ±Ø© Ø§ÙØ­Ø³Ø§Ø³Ø©
  TICKET_TEAM_ROLE_ID: '1535755153838313542',
  TICKET_MANAGER_ROLE_ID: '1535755234989572226',

  // ÙØ³ØªØ®Ø¯ÙØ© ÙØ¹Ø±Ø¶/Ø¯Ø®ÙÙ Ø§ÙØªØ°Ø§ÙØ± ÙØµÙØ§Ø­ÙØ§Øª Ø¹Ø§ÙØ©
  TICKET_ADMIN_ROLE_IDS: [
    '1535755153838313542',
    '1535755234989572226'
  ],

  // ÙÙØ· Ø§ÙÙ 3 Ø±ÙÙØ§Øª Ø¯ÙÙ ÙØ¸ÙØ± ÙÙÙ/ÙØ³ØªØ®Ø¯ÙÙØ§ ÙÙØ­Ø© ÙØ§ Ø¨Ø¹Ø¯ Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø©:
  // ÙØ³Ø­ - Ø­ÙØ¸ - Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­
  TICKET_CLOSED_ACTION_ROLE_IDS: [
    'PUT_CLOSED_TICKET_ROLE_1_ID',
    'PUT_CLOSED_TICKET_ROLE_2_ID',
    'PUT_CLOSED_TICKET_ROLE_3_ID'
  ],

  TICKET_TYPES: {
    support: {
      label: 'Ø§ÙØ¯Ø¹Ù Ø§ÙÙÙÙ', emoji: 'ð§',
      categoryId: '1536126952618983535',
      teamRoleIds: ['PUT_SUPPORT_TEAM_ROLE_ID'],
      normalChannelId: '1536824749471301662',
      importantChannelId: '1536824777979985940',
      urgentChannelId: '1536824248553705472'
    },
    monitoring: {
      label: 'Ø§ÙØ±ÙØ§Ø¨Ø©', emoji: 'ðï¸',
      categoryId: '1536348218659438663',
      teamRoleIds: ['PUT_MONITORING_TEAM_ROLE_ID'],
      normalChannelId: '1536845236225974363',
      importantChannelId: '1536845265971978390',
      urgentChannelId: '1536845288738652191'
    },
    player_complaint: {
      label: 'Ø´ÙÙÙ Ø¶Ø¯ ÙØ§Ø¹Ø¨', emoji: 'â ï¸',
      categoryId: '1536348415494070352',
      teamRoleIds: ['PUT_COMPLAINT_TEAM_ROLE_ID'],
      normalChannelId: '1536845484126371861',
      importantChannelId: '1536845508981555313',
      urgentChannelId: '1536845528946450472'
    },
    appeal: {
      label: 'Ø§Ø³ØªØ¦ÙØ§Ù', emoji: 'ð',
      categoryId: '1536142385795563662',
      teamRoleIds: ['PUT_APPEAL_TEAM_ROLE_ID'],
      normalChannelId: '1536845709104390225',
      importantChannelId: '1536845727773499444',
      urgentChannelId: '1536845754390413484'
    },
    staff_complaint: {
      label: 'Ø´ÙÙÙ Ø¶Ø¯ Ø¥Ø¯Ø§Ø±Ù', emoji: 'ð',
      categoryId: '1536348677268971560',
      teamRoleIds: ['PUT_STAFF_COMPLAINT_TEAM_ROLE_ID'],
      normalChannelId: '1536845900767563888',
      importantChannelId: '1536845924582686860',
      urgentChannelId: '1536845947903025222'
    },
    store: {
      label: 'Ø§ÙÙØªØ¬Ø±', emoji: 'ð',
      categoryId: '1536144785986027521',
      teamRoleIds: ['PUT_STORE_TEAM_ROLE_ID'],
      normalChannelId: '1536846114223816705',
      importantChannelId: '1536846128010502154',
      urgentChannelId: '1536846147983908956'
    },
    compensation: {
      label: 'Ø§ÙØªØ¹ÙÙØ¶Ø§Øª', emoji: 'ð°',
      categoryId: '1536348299588800592',
      teamRoleIds: ['PUT_COMPENSATION_TEAM_ROLE_ID'],
      normalChannelId: '1536846371829579787',
      importantChannelId: '1536846387860480040',
      urgentChannelId: '1536846411390525520'
    },
    bug: {
      label: 'Ø§ÙØ¥Ø¨ÙØ§Øº Ø¹Ù Ø§ÙØ£Ø®Ø·Ø§Ø¡', emoji: 'ð',
      categoryId: '1536342904631595139',
      teamRoleIds: ['PUT_BUG_TEAM_ROLE_ID'],
      normalChannelId: '1536844960194764880',
      importantChannelId: '1536844787812933652',
      urgentChannelId: '1536844814048563270'
    }
  },

  // ---------- Control / Send panels ----------
  CONTROL_PANEL_CHANNEL_ID: '1536347609164161034',
  BOT_SEND_PANEL_CHANNEL_ID: '1536347609164161034',
  CONTROL_ROLE_IDS: [
    '1535754877882474557',
    '1535755333572763798'
  ],

  // ---------- Manual Accept / Reject Panel ----------
  DECISION_PANEL_CHANNEL_ID: 'PUT_DECISION_PANEL_CHANNEL_ID',
  DECISION_RESULTS_CHANNEL_ID: 'PUT_DECISION_RESULTS_CHANNEL_ID',
  DECISION_REVIEWER_ROLE_IDS: [
    'PUT_DECISION_REVIEWER_ROLE_ID'
  ],

  // ---------- Staff / Creator applications ----------
  STAFF_APPLICATION_PANEL_CHANNEL_ID: '1537184130096300062',
  STAFF_APPLICATION_REVIEW_CHANNEL_ID: '1537185220497776710',
  STAFF_PREACCEPTED_ROLE_ID: '1535798962462658651',
  STAFF_INTERVIEW_SCHEDULE_CHANNEL_ID: '1535794320668491807',
  // Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ© Ø¨Ø¹Ø¯ Ø§ÙÙØ¨ÙÙ Ø§ÙÙØ¨Ø¯Ø¦Ù ÙÙØ¥Ø¯Ø§Ø±Ø©
  STAFF_SECOND_STAGE_CHANNEL_ID: 'PUT_STAFF_SECOND_STAGE_CHANNEL_ID',
  STAFF_FINAL_ACCEPTED_ROLE_ID: 'PUT_STAFF_FINAL_ACCEPTED_ROLE_ID',

  // ---------- Monitoring applications ----------
  MONITORING_APPLICATION_PANEL_CHANNEL_ID: 'PUT_MONITORING_APPLICATION_PANEL_CHANNEL_ID',
  MONITORING_APPLICATION_REVIEW_CHANNEL_ID: 'PUT_MONITORING_APPLICATION_REVIEW_CHANNEL_ID',
  MONITORING_PREACCEPTED_ROLE_ID: 'PUT_MONITORING_PREACCEPTED_ROLE_ID',
  MONITORING_SECOND_STAGE_CHANNEL_ID: 'PUT_MONITORING_SECOND_STAGE_CHANNEL_ID',
  MONITORING_FINAL_ACCEPTED_ROLE_ID: 'PUT_MONITORING_FINAL_ACCEPTED_ROLE_ID',

  CREATOR_APPLICATION_PANEL_CHANNEL_ID: '1537184038039588895',
  CREATOR_APPLICATION_REVIEW_CHANNEL_ID: '1537186507977261076',
  CREATOR_ACCEPTED_ROLE_ID: '1535770270688874587',

  // ---------- Staff / Creator DM application questions ----------
  STAFF_APPLICATION_QUESTIONS: [
    'ÙØ§ Ø§Ø³ÙÙØ',
    'ÙÙ Ø¹ÙØ±ÙØ',
    'ÙØ§ ÙÙ Discord ID Ø§ÙØ®Ø§Øµ Ø¨ÙØ',
    'ÙØ§ ÙÙ FiveM ID Ø§ÙØ®Ø§Øµ Ø¨ÙØ',
    'ÙÙØ° ÙØªÙ ÙØ£ÙØª ØªÙØ¹Ø¨ RoleplayØ',
    'ÙÙ Ø³Ø¨Ù ÙÙ Ø§ÙØ¹ÙÙ ÙØ¥Ø¯Ø§Ø±ÙØ ÙØ¥Ø°Ø§ ÙØ¹ÙØ Ø§Ø°ÙØ± Ø®Ø¨Ø±ØªÙ.',
    'ÙØ§ ÙÙ Ø®Ø¨Ø±ØªÙ ÙÙ Ø§ÙØªØ¹Ø§ÙÙ ÙØ¹ ÙØ´Ø§ÙÙ Ø§ÙÙØ§Ø¹Ø¨ÙÙØ',
    'ÙÙÙ ØªØªØµØ±Ù Ø¥Ø°Ø§ ÙØ§Ù ÙØ§Ø¹Ø¨ Ø¨ÙØ®Ø§ÙÙØ© Ø§ÙÙÙØ§ÙÙÙ Ø£ÙØ§ÙÙØ',
    'ÙÙÙ ØªØªØµØ±Ù Ø¥Ø°Ø§ Ø­ØµÙ Ø®ÙØ§Ù Ø¨ÙÙÙ ÙØ¨ÙÙ Ø¥Ø¯Ø§Ø±Ù Ø¢Ø®Ø±Ø',
    'ÙÙ Ø³Ø§Ø¹Ø© ØªØ³ØªØ·ÙØ¹ Ø§ÙØªÙØ§Ø¬Ø¯ ÙÙÙÙØ§ÙØ',
    'ÙØ§ Ø§ÙØ£ÙÙØ§Øª Ø§ÙØªÙ ØªÙÙÙ ÙØªØ§Ø­Ø§Ù ÙÙÙØ§ ØºØ§ÙØ¨Ø§ÙØ',
    'ÙÙØ§Ø°Ø§ ØªØ±ÙØ¯ Ø§ÙØ§ÙØ¶ÙØ§Ù Ø¥ÙÙ Ø¥Ø¯Ø§Ø±Ø© Ghost RPØ',
    'ÙØ§Ø°Ø§ ØªØ³ØªØ·ÙØ¹ Ø£Ù ØªØ¶ÙÙ ÙÙØ±ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©Ø',
    'ÙÙ ÙØ±Ø£Øª ÙÙØ§ÙÙÙ Ø§ÙØ³ÙØ±ÙØ± ÙÙØ³ØªØ¹Ø¯ ÙÙØ§ÙØªØ²Ø§Ù Ø¨ÙØ§Ø'
  ],

  MONITORING_APPLICATION_QUESTIONS: [
    'ÙØ§ Ø§Ø³ÙÙØ',
    'ÙÙ Ø¹ÙØ±ÙØ',
    'ÙØ§ ÙÙ Discord ID Ø§ÙØ®Ø§Øµ Ø¨ÙØ',
    'ÙØ§ ÙÙ FiveM ID Ø§ÙØ®Ø§Øµ Ø¨ÙØ',
    'ÙÙØ° ÙØªÙ ÙØ£ÙØª ØªÙØ¹Ø¨ RoleplayØ',
    'ÙÙ Ø³Ø¨Ù ÙÙ Ø§ÙØ¹ÙÙ ÙÙ Ø§ÙØ±ÙØ§Ø¨Ø©Ø ÙØ¥Ø°Ø§ ÙØ¹ÙØ Ø§Ø°ÙØ± Ø®Ø¨Ø±ØªÙ.',
    'ÙØ§ ÙØ¹ÙÙ RDMØ',
    'ÙØ§ ÙØ¹ÙÙ VDMØ',
    'ÙØ§ ÙØ¹ÙÙ Meta GamingØ',
    'ÙÙÙ ØªØªØµØ±Ù ÙÙ Ø´Ø§ÙØ¯Øª ÙØ®Ø§ÙÙØ© ÙÙÙ ØªÙÙ ÙØªØ£ÙØ¯Ø§Ù ÙÙÙØ§Ø',
    'ÙÙÙ ØªØªØ¹Ø§ÙÙ ÙØ¹ Ø¨ÙØ§Øº Ø¶Ø¯ ÙØ§Ø¹Ø¨Ø',
    'ÙÙ Ø³Ø§Ø¹Ø© ØªØ³ØªØ·ÙØ¹ Ø§ÙØªÙØ§Ø¬Ø¯ ÙÙÙÙØ§ÙØ',
    'ÙØ§ Ø§ÙØ£ÙÙØ§Øª Ø§ÙØªÙ ØªÙÙÙ ÙØªØ§Ø­Ø§Ù ÙÙÙØ§Ø',
    'ÙÙØ§Ø°Ø§ ØªØ±ÙØ¯ Ø§ÙØ§ÙØ¶ÙØ§Ù Ø¥ÙÙ ÙØ±ÙÙ Ø§ÙØ±ÙØ§Ø¨Ø© ÙÙ Ghost RPØ'
  ],

  CREATOR_APPLICATION_QUESTIONS: [
    'ÙØ§ Ø§Ø³ÙÙØ',
    'ÙÙ Ø¹ÙØ±ÙØ',
    'ÙØ§ ÙÙ Discord ID Ø§ÙØ®Ø§Øµ Ø¨ÙØ',
    'ÙØ§ Ø§Ø³Ù ÙÙØ§ØªÙ Ø£Ù Ø­Ø³Ø§Ø¨ÙØ',
    'ÙÙ Ø¹Ø¯Ø¯ Ø§ÙÙØªØ§Ø¨Ø¹ÙÙ (Followers) ÙØ¯ÙÙØ',
    'Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§ÙÙÙØ§Ø© Ø£Ù Ø§ÙØ­Ø³Ø§Ø¨.',
    'ÙØ§ ÙÙØ¹ Ø§ÙÙØ­ØªÙÙ Ø§ÙØ°Ù ØªÙØ¯ÙÙØ',
    'ÙÙ ÙØ±Ø© ØªÙØ´Ø± Ø£Ù ØªØ¹ÙÙ Ø¨Ø« ÙÙ Ø§ÙØ£Ø³Ø¨ÙØ¹Ø',
    'ÙÙ Ø³Ø¨Ù ÙÙ ØµÙØ§Ø¹Ø© ÙØ­ØªÙÙ ÙØ³ÙØ±ÙØ±Ø§Øª RoleplayØ',
    'ÙÙØ§Ø°Ø§ ØªØ±ÙØ¯ Ø£Ù ØªØµØ¨Ø­ ØµØ§ÙØ¹ ÙØ­ØªÙÙ ÙÙ Ghost RPØ'
  ],

  // ---------- Application ----------
  APPLICATION_QUESTIONS: [
    'ÙØ§ Ø§Ø³ÙÙØ',
    'ÙÙ Ø¹ÙØ±ÙØ',
    'ÙØ§ ÙÙ Ø§ÙÙ ID Ø§ÙØ®Ø§Øµ Ø¨Ù ÙÙ FiveM Ø¥Ù ÙØ¬Ø¯Ø',
    'ÙØ§ Ø®Ø¨Ø±ØªÙ ÙÙ Ø§ÙÙ RoleplayØ',
    'Ø§Ø´Ø±Ø­ ÙÙØ§ ÙØ¹ÙÙ RDM.',
    'Ø§Ø´Ø±Ø­ ÙÙØ§ ÙØ¹ÙÙ VDM.',
    'Ø§Ø´Ø±Ø­ ÙÙØ§ ÙØ¹ÙÙ NLR.',
    'Ø§Ø´Ø±Ø­ ÙÙØ§ ÙØ¹ÙÙ Power Gaming.',
    'Ø§Ø´Ø±Ø­ ÙÙØ§ ÙØ¹ÙÙ Meta Gaming.',
    'ÙÙØ§Ø°Ø§ ØªØ±ÙØ¯ Ø§ÙØ§ÙØ¶ÙØ§Ù Ø¥ÙÙ Ghost RPØ'
  ],

  SECOND_REJECTION_BLOCK_DAYS: 7,

  // ---------- Protection ----------
  PROTECTION: {
    ENABLED: true,

    MAX_MENTIONS_PER_MESSAGE: 5,
    SPAM_MESSAGE_LIMIT: 6,
    SPAM_WINDOW_MS: 7000,
    SPAM_TIMEOUT_MS: 5 * 60 * 1000,
    MASS_MENTION_TIMEOUT_MS: 10 * 60 * 1000,

    BLOCK_DISCORD_INVITES: true,
    BLOCK_LINKS: false, // Change to true if you want all normal links blocked too.

    CAPS_ENABLED: true,
    CAPS_PERCENT_LIMIT: 80,
    CAPS_MIN_LENGTH: 12
  },

  SUPPORT_GREETING_TEXT:
    'ÙØ±Ø­Ø¨Ø§ Ø¨Ù ÙÙ Ø§ÙØ¯Ø¹Ù Ø§ÙÙÙÙ Ø§ÙØ®Ø§Øµ Ø¨Ø¬ÙØ³Øª Ø¢Ø± Ø¨Ù. ÙØ±Ø¬Ù Ø§ÙØ§ÙØªØ¸Ø§Ø± ÙÙÙÙØ§.',

  SUPPORT_GREETING_MEDIA_URL:
    'https://cdn.discordapp.com/attachments/1536347609164161034/1537199367503478905/20260812-2041-08.2038923.mp4?ex=6a7e2bf8&is=6a7cda78&hm=967c73ad0f0eac026765e8883bd7c40fcd277674a74d5e261576e12db7e1d6d0&'
};

// ==========================================================
// DATA STORE
// Railway: mount a persistent Volume at /data
// ==========================================================
const DATA_DIR = fs.existsSync('/data') ? '/data' : __dirname;
const DB_FILE = path.join(DATA_DIR, 'ghostbot.json');

function emptyDB() {
  return {
    users: {},
    applications: {},
    pendingApplications: {},
    videos: {},
    ratings: [],
    tickets: {},
    ticketCounter: 0,
    ticketRatings: [],
    systems: {
      tickets: true,
      applications: true,
      welcome: true,
      protection: true,
      ratings: true,
      videos: true,
      voice: true
    },
    staffApplications: {},
    creatorApplications: {},
    panelMessageId: null
  };
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return emptyDB();

    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return {
      ...emptyDB(),
      ...parsed,
      users: parsed.users || {},
      applications: parsed.applications || {},
      pendingApplications: parsed.pendingApplications || {},
      videos: parsed.videos || {},
      ratings: parsed.ratings || [],
      tickets: parsed.tickets || {},
      ticketCounter: parsed.ticketCounter || 0,
      ticketRatings: parsed.ticketRatings || [],
      systems: {
        tickets: true,
        applications: true,
        welcome: true,
        protection: true,
        ratings: true,
        videos: true,
        voice: true,
        ...(parsed.systems || {})
      },
      staffApplications: parsed.staffApplications || {},
      creatorApplications: parsed.creatorApplications || {}
    };
  } catch (err) {
    console.error('Database load error:', err.message);
    return emptyDB();
  }
}

let db = loadDB();

function saveDB() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const temp = `${DB_FILE}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(temp, DB_FILE);
  } catch (err) {
    console.error('Database save error:', err.message);
  }
}

function getUserRecord(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      rejectionCount: 0,
      blockedUntil: 0,
      activeApplication: false
    };
    saveDB();
  }
  return db.users[userId];
}

// ==========================================================
// CLIENT
// ==========================================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ]
});

const spamTracker = new Map();
const greetedUsers = new Map();
const specialDmApplications = new Map();
// MULTI_APPLICATION_NOTE: ÙÙ ÙØ³ØªØ®Ø¯Ù ÙÙ Ø­Ø§ÙØ© ØªÙØ¯ÙÙ ÙØ³ØªÙÙØ©Ø ÙØ°ÙÙ Ø¹Ø¯Ø© Ø£Ø´Ø®Ø§Øµ ÙÙØ¯Ø±ÙØ§ ÙÙØ¯ÙÙØ§ ÙÙ ÙÙØ³ Ø§ÙÙÙØª.



function embed(title, description, color = CONFIG.COLOR) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: CONFIG.SERVER_NAME })
    .setTimestamp();
}

function channelUrl(channelId) {
  return `https://discord.com/channels/${CONFIG.GUILD_ID}/${channelId}`;
}

function hasRealId(value) {
  return typeof value === 'string' && value.length > 5 && !value.startsWith('PUT_');
}

function isReviewer(member) {
  return !!member && CONFIG.REVIEWER_ROLE_IDS.some(id => member.roles.cache.has(id));
}

function protectionBypass(member) {
  if (!member) return true;
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return CONFIG.PROTECTION_BYPASS_ROLE_IDS.some(id => member.roles.cache.has(id));
}

async function safeFetchChannel(id) {
  if (!hasRealId(id)) return null;
  return client.channels.fetch(id).catch(() => null);
}

async function sendLog(title, description, color = CONFIG.COLOR) {
  const ch = await safeFetchChannel(CONFIG.LOG_CHANNEL_ID);
  if (!ch?.isTextBased()) return;
  await ch.send({ embeds: [embed(title, description, color)] }).catch(() => {});
}

async function safeDM(userId, payload) {
  try {
    const user = await client.users.fetch(userId);
    await user.send(payload);
    return true;
  } catch {
    return false;
  }
}

async function safeAddRole(member, roleId) {
  if (!member || !hasRealId(roleId)) return false;
  try {
    await member.roles.add(roleId);
    return true;
  } catch {
    return false;
  }
}

async function safeRemoveRole(member, roleId) {
  if (!member || !hasRealId(roleId)) return false;
  try {
    if (member.roles.cache.has(roleId)) await member.roles.remove(roleId);
    return true;
  } catch {
    return false;
  }
}

// ==========================================================
// STARTUP
// ==========================================================
client.once(Events.ClientReady, async () => {
  console.log(`Ghost RP bot logged in as ${client.user.tag}`);
  client.user.setActivity(CONFIG.SERVER_NAME);

  reconcileApplicationState();
  await ensureApplicationPanel();

  setInterval(releaseExpiredSecondRejections, 60 * 1000);
});

function reconcileApplicationState() {
  // Fix stale activeApplication flags after Railway restart.
  let changed = false;

  for (const [userId, rec] of Object.entries(db.users)) {
    const hasPendingDM = !!db.pendingApplications[userId];

    const hasPendingReview = Object.values(db.applications).some(
      app => app.userId === userId && app.status === 'pending'
    );

    const shouldBeActive = hasPendingDM || hasPendingReview;

    if (rec.activeApplication !== shouldBeActive) {
      rec.activeApplication = shouldBeActive;
      changed = true;
    }
  }

  if (changed) saveDB();
}

async function releaseExpiredSecondRejections() {
  const now = Date.now();
  const guild = client.guilds.cache.get(CONFIG.GUILD_ID) ||
    await client.guilds.fetch(CONFIG.GUILD_ID).catch(() => null);

  let changed = false;

  for (const [userId, rec] of Object.entries(db.users)) {
    if (!rec.blockedUntil || rec.blockedUntil > now) continue;

    rec.blockedUntil = 0;
    rec.rejectionCount = 0;
    changed = true;

    if (guild) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) await safeRemoveRole(member, CONFIG.SECOND_REJECTION_ROLE_ID);
    await safeRemoveRole(member, CONFIG.FIRST_REJECTION_ROLE_ID);
    }

    await safeDM(userId, {
      embeds: [
        embed(
          'ÙÙÙÙÙ Ø§ÙØªÙØ¯ÙÙ Ø§ÙØ¢Ù â',
          `Ø§ÙØªÙØª ÙØ¯Ø© ÙÙØ¹ Ø§ÙØªÙØ¯ÙÙ ÙÙ **${CONFIG.SERVER_NAME}** ÙÙÙÙÙÙ Ø§ÙØªÙØ¯ÙÙ ÙÙ Ø¬Ø¯ÙØ¯.`,
          0x2ECC71
        )
      ]
    });

    await sendLog(
      'Ø§ÙØªÙØ§Ø¡ ÙÙØ¹ Ø§ÙØªÙØ¯ÙÙ',
      `<@${userId}> Ø§ÙØªÙÙ ÙÙØ¹Ù Ø§ÙØ£Ø³Ø¨ÙØ¹Ù ÙØªÙ ØªØµÙÙØ± Ø¹Ø¯Ø¯ ÙØ±Ø§Øª Ø§ÙØ±ÙØ¶.`,
      0x2ECC71
    );
  }

  if (changed) saveDB();
}

// ==========================================================
// APPLICATION PANEL
// ==========================================================
async function ensureApplicationPanel() {
  const channel = await safeFetchChannel(CONFIG.APPLICATION_PANEL_CHANNEL_ID);
  if (!channel?.isTextBased()) return;

  if (db.panelMessageId) {
    const existing = await channel.messages.fetch(db.panelMessageId).catch(() => null);
    if (existing) return;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('application_start')
      .setLabel('Ø§ÙØªÙØ¯ÙÙ')
      .setEmoji('ð')
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await channel.send({
    embeds: [
      embed(
        `${CONFIG.SERVER_NAME} | ÙØ¸Ø§Ù Ø§ÙØªÙØ¯ÙÙ`,
        [
          'ð» Ø£ÙÙØ§Ù Ø¨Ù ÙÙ ÙØ¸Ø§Ù ØªÙØ¯ÙÙ **Ghost RP**',
          '',
          'ââââââââââââââââââââââââââââââââââââââââ',
          '',
          'ð Ø§Ø¶ØºØ· Ø¹ÙÙ Ø²Ø± **Ø§ÙØªÙØ¯ÙÙ** Ø¨Ø§ÙØ£Ø³ÙÙ ÙØ¨Ø¯Ø¡ Ø·ÙØ¨Ù.',
          '',
          'ð© Ø³ÙØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙØ£Ø³Ø¦ÙØ© ÙÙ ÙÙ Ø§ÙØ®Ø§Øµ Ø³Ø¤Ø§ÙØ§Ù Ø¨Ø¹Ø¯ Ø³Ø¤Ø§Ù.',
          '',
          'â ÙÙÙÙÙ Ø¥ÙØºØ§Ø¡ Ø§ÙØªÙØ¯ÙÙ ÙÙ Ø£Ù ÙÙØª Ø¨ÙØªØ§Ø¨Ø©: `cancel`',
          '',
          'ââââââââââââââââââââââââââââââââ'
        ].join('\n')
      )
    ],
    components: [row]
  }).catch(() => null);

  if (msg) {
    db.panelMessageId = msg.id;
    saveDB();
  }
}

// ==========================================================
// APPLICATION FLOW
// ==========================================================
async function startApplication(interaction) {
  if (db.systems?.applications === false) return interaction.reply({content:'â Ø§ÙØªÙØ¯ÙÙØ§Øª ÙØªÙÙÙØ© Ø­Ø§ÙÙØ§Ù.', ephemeral:true});
  const userId = interaction.user.id;
  const rec = getUserRecord(userId);
  const now = Date.now();

  // ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø© Ø´Ø§ÙØª Ø±ÙÙ Ø§ÙØ±ÙØ¶ Ø§ÙØ«Ø§ÙÙ ÙØ¯ÙÙÙØ§Ø ÙÙØ¯Ø± ÙÙØ¯Ù ÙÙØ±ÙØ§.
  if (rec.blockedUntil > now && interaction.guild && hasRealId(CONFIG.SECOND_REJECTION_ROLE_ID)) {
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (member && !member.roles.cache.has(CONFIG.SECOND_REJECTION_ROLE_ID)) {
      rec.blockedUntil = 0;
      rec.rejectionCount = 0;
      await safeRemoveRole(member, CONFIG.FIRST_REJECTION_ROLE_ID);
      saveDB();
    }
  }

  if (rec.blockedUntil > now) {
    const unix = Math.floor(rec.blockedUntil / 1000);
    return interaction.reply({
      content:
        `â Ø£ÙØª ÙÙÙÙØ¹ ÙÙ Ø§ÙØªÙØ¯ÙÙ Ø¨Ø³Ø¨Ø¨ Ø±ÙØ¶Ù ÙØ±ØªÙÙ.\n` +
        `ÙÙÙÙÙ Ø§ÙØªÙØ¯ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù <t:${unix}:R>.`,
      ephemeral: true
    });
  }

  const existingPendingReview = Object.values(db.applications).some(
    app => app.userId === userId && app.status === 'pending'
  );

  if (rec.activeApplication || db.pendingApplications[userId] || existingPendingReview) {
    return interaction.reply({
      content: 'â ï¸ ÙØ¯ÙÙ ØªÙØ¯ÙÙ ÙÙØªÙØ­ Ø¨Ø§ÙÙØ¹Ù.',
      ephemeral: true
    });
  }

  let dm;
  try {
    dm = await interaction.user.createDM();
    await dm.send({
      embeds: [
        embed(
          `${CONFIG.SERVER_NAME} | Ø¨Ø¯Ø¡ Ø§ÙØªÙØ¯ÙÙ`,
          [
            'ð Ø£ÙÙØ§Ù ÙØ³ÙÙØ§Ù Ø¨Ù ÙÙ **Ghost RP**',
            '',
            'ââââââââââââââââââââââââââââââââââââââââ',
            '',
            'ð Ø³ÙØªÙ Ø¥Ø±Ø³Ø§Ù Ø£Ø³Ø¦ÙØ© Ø§ÙØªÙØ¯ÙÙ ÙÙ Ø³Ø¤Ø§ÙØ§Ù Ø¨Ø¹Ø¯ Ø³Ø¤Ø§Ù.',
            '',
            'ð Ø¬Ø§ÙØ¨ Ø¹ÙÙ ÙÙ Ø³Ø¤Ø§Ù Ø¨ÙØ¶ÙØ­ Ø­ØªÙ ÙÙØªÙÙ Ø§ÙØ¨ÙØª ÙÙØ³Ø¤Ø§Ù Ø§ÙØªØ§ÙÙ.',
            '',
            'â ÙÙ Ø­Ø§Ø¨Ø¨ ØªÙØºÙ Ø§ÙØªÙØ¯ÙÙ Ø§ÙØªØ¨:',
            '`cancel`',
            '',
            'ââââââââââââââââââââââââââââââââ'
          ].join('\n')
        )
      ]
    });
  } catch {
    return interaction.reply({
      content:
        'â ÙØ§ Ø£Ø³ØªØ·ÙØ¹ Ø¥Ø±Ø³Ø§Ù Ø±Ø³Ø§ÙØ© Ø®Ø§ØµØ© ÙÙ. ÙØ¹ÙÙ Ø§ÙØ±Ø³Ø§Ø¦Ù Ø§ÙØ®Ø§ØµØ© ÙÙ Ø£Ø¹Ø¶Ø§Ø¡ Ø§ÙØ³ÙØ±ÙØ± Ø«Ù Ø­Ø§ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù.',
      ephemeral: true
    });
  }

  db.pendingApplications[userId] = {
    index: 0,
    answers: [],
    startedAt: Date.now()
  };

  rec.activeApplication = true;
  saveDB();

  await interaction.reply({
    content: 'â Ø¨Ø¯Ø£ Ø§ÙØªÙØ¯ÙÙ. Ø±Ø§Ø¬Ø¹ Ø§ÙØ®Ø§Øµ.',
    ephemeral: true
  });

  await askNextQuestion(userId);
}

async function askNextQuestion(userId) {
  const state = db.pendingApplications[userId];
  if (!state) return;

  const question = CONFIG.APPLICATION_QUESTIONS[state.index];
  if (!question) return;

  await safeDM(userId, {
    embeds: [
      embed(
        `${CONFIG.SERVER_NAME} | Ø§ÙØªÙØ¯ÙÙ`,
        [
          'ââââââââââââââââââââââââââââââââ',
          '',
          `ð **Ø§ÙØ³Ø¤Ø§Ù ${state.index + 1} ÙÙ ${CONFIG.APPLICATION_QUESTIONS.length}**`,
          '',
          `â ${question}`,
          '',
          `ð Ø§ÙØªÙØ¯Ù: **${state.index + 1}/${CONFIG.APPLICATION_QUESTIONS.length}**`,
          '',
          'â ÙÙØ¥ÙØºØ§Ø¡ Ø§ÙØªØ¨: `cancel`',
          '',
          'ââââââââââââââââââââââââââââââââ'
        ].join('\n')
      )
    ]
  });
}

async function handleApplicationDM(message) {
  const userId = message.author.id;
  const state = db.pendingApplications[userId];
  if (!state) return false;

  const answer = message.content.trim();

  if (answer.toLowerCase() === 'cancel') {
    delete db.pendingApplications[userId];

    const rec = getUserRecord(userId);
    rec.activeApplication = false;

    saveDB();

    await message.reply({
      embeds: [
        embed(
          'ØªÙ Ø¥ÙØºØ§Ø¡ Ø§ÙØªÙØ¯ÙÙ',
          [
            'â ØªÙ Ø¥ÙØºØ§Ø¡ ØªÙØ¯ÙÙÙ Ø¨ÙØ¬Ø§Ø­.',
            '',
            'ÙÙÙÙÙ Ø¨Ø¯Ø¡ ØªÙØ¯ÙÙ Ø¬Ø¯ÙØ¯ ÙÙ Ø£Ù ÙÙØª ÙÙ Ø±ÙÙ Ø§ÙØªÙØ¯ÙÙ.',
            '',
            'ð» **Ghost RP**'
          ].join('\n')
        )
      ]
    });

    return true;
  }

  if (!answer) {
    await message.reply('â Ø§ÙØªØ¨ Ø¥Ø¬Ø§Ø¨Ø© ÙØ¨Ù Ø§ÙØ§ÙØªÙØ§Ù ÙÙØ³Ø¤Ø§Ù Ø§ÙØªØ§ÙÙ.');
    return true;
  }

  state.answers.push(answer.slice(0, 1500));
  state.index += 1;
  saveDB();

  if (state.index < CONFIG.APPLICATION_QUESTIONS.length) {
    await askNextQuestion(userId);
    return true;
  }

  const applicationId = `${userId}-${Date.now()}`;

  db.applications[applicationId] = {
    userId,
    answers: state.answers,
    status: 'pending',
    createdAt: Date.now(),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    reviewMessageId: null
  };

  delete db.pendingApplications[userId];
  saveDB();

  const sent = await sendApplicationForReview(applicationId);

  if (!sent) {
    // Don't leave the user permanently locked if admin review channel is broken.
    db.applications[applicationId].status = 'delivery_failed';
    getUserRecord(userId).activeApplication = false;
    saveDB();

    await message.reply({
      embeds: [
        embed(
          'ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ â',
          [
            'â Ø­ØµÙ Ø®Ø·Ø£ Ø£Ø«ÙØ§Ø¡ Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ ÙÙØ¥Ø¯Ø§Ø±Ø©.',
            '',
            'ÙØ±Ø¬Ù Ø§ÙØªÙØ§ØµÙ ÙØ¹ Ø§ÙØ¥Ø¯Ø§Ø±Ø© Ø£Ù Ø§ÙÙØ­Ø§ÙÙØ© ÙØ±Ø© Ø£Ø®Ø±Ù Ø¨Ø¹Ø¯ ÙÙÙÙ.',
            '',
            'ð» **Ghost RP**'
          ].join('\n')
        )
      ]
    });

    await sendLog(
      'Ø®Ø·Ø£ ÙÙ Ø§ÙØªÙØ¯ÙÙ',
      `ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù ØªÙØ¯ÙÙ <@${userId}> Ø¥ÙÙ Ø±ÙÙ Ø§ÙÙØ±Ø§Ø¬Ø¹Ø©.`,
      0xE74C3C
    );

    return true;
  }

  await message.reply({
    embeds: [
      embed(
        'ØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ â',
        [
          `â ØªÙ Ø¥Ø±Ø³Ø§Ù ØªÙØ¯ÙÙÙ Ø¥ÙÙ Ø¥Ø¯Ø§Ø±Ø© **${CONFIG.SERVER_NAME}** Ø¨ÙØ¬Ø§Ø­.`,
          '',
          'ð Ø§ÙØªÙØ¯ÙÙ Ø§ÙØ¢Ù ØªØ­Øª Ø§ÙÙØ±Ø§Ø¬Ø¹Ø©.',
          '',
          'ð© Ø³ÙØªÙ Ø¥Ø±Ø³Ø§Ù ÙØªÙØ¬Ø© Ø§ÙÙØ¨ÙÙ Ø£Ù Ø§ÙØ±ÙØ¶ ÙÙ ÙÙ Ø§ÙØ®Ø§Øµ.',
          '',
          'Ø´ÙØ±Ø§Ù ÙØªÙØ¯ÙÙÙ ÙØ¹ÙØ§ ð»'
        ].join('\n'),
        0x2ECC71
      )
    ]
  });

  return true;
}

async function sendApplicationForReview(applicationId) {
  const app = db.applications[applicationId];
  if (!app) return false;

  const channel = await safeFetchChannel(CONFIG.APPLICATION_RESULTS_CHANNEL_ID);
  if (!channel?.isTextBased()) return false;

  const fields = app.answers.map((answer, i) => ({
    name: `${i + 1}. ${CONFIG.APPLICATION_QUESTIONS[i]}`,
    value: answer.slice(0, 1024) || 'Ø¨Ø¯ÙÙ Ø¥Ø¬Ø§Ø¨Ø©'
  }));

  const reviewEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLOR)
    .setTitle(`${CONFIG.SERVER_NAME} | ØªÙØ¯ÙÙ Ø¬Ø¯ÙØ¯`)
    .setDescription(`**Ø§ÙÙØªÙØ¯Ù:** <@${app.userId}>\n**Discord ID:** \`${app.userId}\``)
    .addFields(fields.slice(0, 25))
    .setFooter({ text: `Application ID: ${applicationId}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`app_accept:${applicationId}`)
      .setLabel('ÙØ¨ÙÙ')
      .setEmoji('â')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`app_reject:${applicationId}`)
      .setLabel('Ø±ÙØ¶')
      .setEmoji('â')
      .setStyle(ButtonStyle.Danger)
  );

  const sent = await channel.send({
    embeds: [reviewEmbed],
    components: [row]
  }).catch(() => null);

  if (!sent) return false;

  app.reviewMessageId = sent.id;
  saveDB();
  return true;
}

// ==========================================================
// MESSAGE HANDLER
// ==========================================================
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  // DMs for Staff / Creator applications.
  // ÙÙÙ: ÙÙØ­Øµ ØªÙØ¯ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©/ØµØ§ÙØ¹ Ø§ÙÙØ­ØªÙÙ ÙØ¨Ù ØªÙØ¯ÙÙ Ø§ÙØ³ÙØ±ÙØ± Ø§ÙØ¹Ø§Ø¯Ù.
  if (message.channel.type === ChannelType.DM) {
    const specialState = specialDmApplications.get(message.author.id);

    if (specialState) {
      const answer = (message.content || '').trim();

      if (answer.toLowerCase() === 'cancel') {
        specialDmApplications.delete(message.author.id);
        await message.reply('â ØªÙ Ø¥ÙØºØ§Ø¡ Ø§ÙØªÙØ¯ÙÙ.');
        return;
      }

      // ØµØ§ÙØ¹ Ø§ÙÙØ­ØªÙÙ ÙØ§Ø²Ù ÙØ®ØªØ§Ø± Kick / YouTube / TikTok ÙÙ Ø§ÙØ²Ø±Ø§ÙØ± Ø§ÙØ£ÙÙ.
      if (specialState.kind === 'creator' && !specialState.platform) {
        await message.reply('â ï¸ Ø§Ø®ØªØ§Ø± ÙÙØ¹ Ø§ÙØ¨Ø±ÙØ§ÙØ¬ ÙÙ Ø§ÙØ²Ø±Ø§ÙØ± Ø§ÙØ£ÙÙ: Kick / YouTube / TikTok.');
        return;
      }

      if (!answer) return;

      specialState.answers.push(answer);
      specialState.index += 1;
      specialDmApplications.set(message.author.id, specialState);

      await sendSpecialDmQuestion(message.author.id);
      return;
    }

    // ÙÙ ÙÙÙØ´ ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø©/ØµØ§ÙØ¹ ÙØ­ØªÙÙØ ÙÙØ­Øµ ØªÙØ¯ÙÙ Ø§ÙØ³ÙØ±ÙØ± Ø§ÙØ¹Ø§Ø¯Ù.
    await handleApplicationDM(message);
    return;
  }

  if (!message.guild) return;

  // Run protection before other message-based systems.
  const blocked = await runProtection(message);
  if (blocked) return;

  // Video review.
  if (message.channel.id === CONFIG.VIDEO_CHANNEL_ID) {
    await handleVideoSubmission(message);
  }
});

// ==========================================================
// INTERACTIONS
// ==========================================================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'application_start') {
        return startApplication(interaction);
      }

      if (interaction.customId === 'welcome_rating') {
        return openRatingModal(interaction);
      }

      if (interaction.customId.startsWith('app_accept:')) {
        return acceptApplication(interaction);
      }

      if (interaction.customId.startsWith('app_reject:')) {
        return openRejectModal(interaction, 'application');
      }

      if (interaction.customId.startsWith('video_accept:')) {
        return acceptVideo(interaction);
      }

      if (interaction.customId.startsWith('video_reject:')) {
        return openRejectModal(interaction, 'video');
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('reject_application:')) {
        return rejectApplication(interaction);
      }

      if (interaction.customId.startsWith('reject_video:')) {
        return rejectVideo(interaction);
      }

      if (interaction.customId === 'rating_modal') {
        return submitRating(interaction);
      }
    }
  } catch (err) {
    console.error('Interaction error:', err);

    if (interaction.isRepliable()) {
      const payload = {
        content: 'â Ø­ØµÙ Ø®Ø·Ø£ ØºÙØ± ÙØªÙÙØ¹. Ø­Ø§ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù.',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  }
});

// ==========================================================
// APPLICATION REVIEW
// ==========================================================
async function acceptApplication(interaction) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: 'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ© ÙØ¨ÙÙ Ø£Ù Ø±ÙØ¶ Ø§ÙØªÙØ¯ÙÙØ§Øª.',
      ephemeral: true
    });
  }

  const applicationId = interaction.customId.slice('app_accept:'.length);
  const app = db.applications[applicationId];

  if (!app || app.status !== 'pending') {
    return interaction.reply({
      content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙØªÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
      ephemeral: true
    });
  }

  // Mark first to prevent double clicks from two reviewers.
  app.status = 'processing_accept';
  app.reviewedBy = interaction.user.id;
  app.reviewedAt = Date.now();
  saveDB();

  const member = await interaction.guild.members.fetch(app.userId).catch(() => null);

  if (member) {
    await safeAddRole(member, CONFIG.ACCEPTED_APPLICATION_ROLE_ID);
    await safeRemoveRole(member, CONFIG.SECOND_REJECTION_ROLE_ID);
  }

  const rec = getUserRecord(app.userId);
  rec.activeApplication = false;
  rec.rejectionCount = 0;
  rec.blockedUntil = 0;

  app.status = 'accepted';
  saveDB();

  await safeDM(app.userId, {
    embeds: [
      embed(
        'ØªÙ ÙØ¨ÙÙÙ â',
        [
          'ââââââââââââââââââââââââââââââââââââââââ',
          'ð **ÙØ¨Ø±ÙÙ! ØªÙ ÙØ¨ÙÙÙ Ø¨ÙØ¬Ø§Ø­**',
          '',
          `â ØªÙ ÙØ¨ÙÙ ØªÙØ¯ÙÙÙ ÙÙ **${CONFIG.SERVER_NAME}**.`,
          '',
          'ðï¸ ØªÙØª Ø¥Ø¶Ø§ÙØ© Ø±ØªØ¨Ø© Ø§ÙÙØ¨ÙÙ Ø§ÙØ®Ø§ØµØ© Ø¨Ù.',
          '',
          'ð ØªØ£ÙØ¯ ÙÙ ÙØ±Ø§Ø¡Ø© Ø§ÙÙÙØ§ÙÙÙ ÙØ¨Ù Ø¨Ø¯Ø¡ Ø§ÙÙØ¹Ø¨.',
          '',
          'ÙØªÙÙÙ ÙÙ ØªØ¬Ø±Ø¨Ø© ÙÙØªØ¹Ø© ÙØ¹ÙØ§ ð»',
          'ââââââââââââââââââââââââââââââââââââââââ'
        ].join('\n'),
        0x2ECC71
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0x2ECC71)
    .addFields({
      name: 'Ø§ÙÙØªÙØ¬Ø©',
      value: `â ØªÙ Ø§ÙÙØ¨ÙÙ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`
    });

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'ÙØ¨ÙÙ ØªÙØ¯ÙÙ',
    `**Ø§ÙÙØªÙØ¯Ù:** <@${app.userId}>\n**ØªÙ Ø§ÙÙØ¨ÙÙ Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
    0x2ECC71
  );
}

async function openRejectModal(interaction, type) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: 'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ© ÙØ¨ÙÙ Ø£Ù Ø±ÙØ¶.',
      ephemeral: true
    });
  }

  const targetId = interaction.customId.split(':').slice(1).join(':');

  if (type === 'application') {
    const app = db.applications[targetId];
    if (!app || app.status !== 'pending') {
      return interaction.reply({
        content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙØªÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
        ephemeral: true
      });
    }
  }

  if (type === 'video') {
    const video = db.videos[targetId];
    if (!video || video.status !== 'pending') {
      return interaction.reply({
        content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙÙÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
        ephemeral: true
      });
    }
  }

  const modal = new ModalBuilder()
    .setCustomId(`reject_${type}:${targetId}`)
    .setTitle(type === 'application' ? 'Ø³Ø¨Ø¨ Ø±ÙØ¶ Ø§ÙØªÙØ¯ÙÙ' : 'Ø³Ø¨Ø¨ Ø±ÙØ¶ Ø§ÙÙÙØ¯ÙÙ');

  const reason = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Ø§ÙØªØ¨ Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(800);

  modal.addComponents(
    new ActionRowBuilder().addComponents(reason)
  );

  await interaction.showModal(modal);
}

async function rejectApplication(interaction) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: 'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',
      ephemeral: true
    });
  }

  const applicationId = interaction.customId.slice('reject_application:'.length);
  const app = db.applications[applicationId];
  const reason = interaction.fields.getTextInputValue('reason').trim();

  if (!app || app.status !== 'pending') {
    return interaction.reply({
      content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙØªÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
      ephemeral: true
    });
  }

  app.status = 'processing_reject';
  app.reviewedBy = interaction.user.id;
  app.reviewedAt = Date.now();
  app.rejectionReason = reason;
  saveDB();

  const rec = getUserRecord(app.userId);
  rec.activeApplication = false;
  rec.rejectionCount = (rec.rejectionCount || 0) + 1;

  let blockText = '';
  let blockedUntil = 0;

  const rejectedMember = await interaction.guild.members.fetch(app.userId).catch(() => null);

  if (rec.rejectionCount === 1) {
    if (rejectedMember) {
      await safeAddRole(rejectedMember, CONFIG.FIRST_REJECTION_ROLE_ID);
      await safeRemoveRole(rejectedMember, CONFIG.SECOND_REJECTION_ROLE_ID);
    }
    blockText = '\nâ ï¸ Ø§ÙØ±ÙØ¶ Ø§ÙØ£ÙÙ.';
  }

  if (rec.rejectionCount >= 2) {
    blockedUntil =
      Date.now() +
      CONFIG.SECOND_REJECTION_BLOCK_DAYS * 24 * 60 * 60 * 1000;

    rec.blockedUntil = blockedUntil;

    if (rejectedMember) {
      await safeRemoveRole(rejectedMember, CONFIG.FIRST_REJECTION_ROLE_ID);
      await safeAddRole(rejectedMember, CONFIG.SECOND_REJECTION_ROLE_ID);
    }

    blockText =
      `\nâ Ø§ÙØ±ÙØ¶ Ø§ÙØ«Ø§ÙÙ. ÙÙÙÙÙ Ø§ÙØªÙØ¯ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù <t:${Math.floor(blockedUntil / 1000)}:R>.`;
  }

  app.status = 'rejected';
  saveDB();

  await safeDM(app.userId, {
    embeds: [
      embed(
        'ØªÙ Ø±ÙØ¶ ØªÙØ¯ÙÙÙ â',
        ['ââââââââââââââââââââââââââââââââââââââââ', `ð Ø§ÙØ³Ø¨Ø¨: ${reason}`, blockText, 'ââââââââââââââââââââââââââââââââââââââââ'].filter(Boolean).join('\n'),
        0xE74C3C
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0xE74C3C)
    .addFields(
      {
        name: 'Ø§ÙÙØªÙØ¬Ø©',
        value: `â ØªÙ Ø§ÙØ±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`
      },
      {
        name: 'Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶',
        value: reason.slice(0, 1024)
      },
      {
        name: 'Ø¹Ø¯Ø¯ ÙØ±Ø§Øª Ø§ÙØ±ÙØ¶',
        value: `${rec.rejectionCount}`
      }
    );

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'Ø±ÙØ¶ ØªÙØ¯ÙÙ',
    [
      `**Ø§ÙÙØªÙØ¯Ù:** <@${app.userId}>`,
      `**ØªÙ Ø§ÙØ±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
      `**Ø§ÙØ³Ø¨Ø¨:** ${reason}`,
      `**Ø¹Ø¯Ø¯ ÙØ±Ø§Øª Ø§ÙØ±ÙØ¶:** ${rec.rejectionCount}`,
      blockedUntil
        ? `**ÙÙØ¹ Ø§ÙØªÙØ¯ÙÙ Ø­ØªÙ:** <t:${Math.floor(blockedUntil / 1000)}:F>`
        : ''
    ].filter(Boolean).join('\n'),
    0xE74C3C
  );
}

// ==========================================================
// VIDEO REVIEW
// ==========================================================
function isVideoAttachment(attachment) {
  const type = attachment.contentType || '';
  const name = attachment.name || '';

  return type.startsWith('video/') ||
    /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(name);
}

async function handleVideoSubmission(message) {
  if (db.systems?.videos === false) return;
  const hasVideo = message.attachments.some(isVideoAttachment);
  if (!hasVideo) return;

  // Prevent duplicate review message for the same video message.
  if (db.videos[message.id]) return;

  db.videos[message.id] = {
    messageId: message.id,
    userId: message.author.id,
    status: 'pending',
    createdAt: Date.now(),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    reviewReplyId: null
  };
  saveDB();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`video_accept:${message.id}`)
      .setLabel('ÙØ¨ÙÙ')
      .setEmoji('â')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`video_reject:${message.id}`)
      .setLabel('Ø±ÙØ¶')
      .setEmoji('â')
      .setStyle(ButtonStyle.Danger)
  );

  const reply = await message.reply({
    embeds: [
      embed(
        `${CONFIG.SERVER_NAME} | ÙØ±Ø§Ø¬Ø¹Ø© Ø§ÙÙÙØ¯ÙÙ`,
        [
          `ð¤ **ØµØ§Ø­Ø¨ Ø§ÙÙÙØ¯ÙÙ:** <@${message.author.id}>`,
          '',
          'ð¥ ØªÙ Ø§Ø³ØªÙØ§Ù Ø§ÙÙÙØ¯ÙÙ Ø¨ÙØ¬Ø§Ø­.',
          '',
          'â³ **Ø§ÙØ­Ø§ÙØ©:** ÙÙ Ø§ÙØªØ¸Ø§Ø± ÙØ±Ø§Ø¬Ø¹Ø© Ø§ÙØ¥Ø¯Ø§Ø±Ø©.',
          '',
          'Ø³ÙØ¸ÙØ± ÙØ±Ø§Ø± Ø§ÙÙØ¨ÙÙ Ø£Ù Ø§ÙØ±ÙØ¶ ÙÙØ§.'
        ].join('\n')
      )
    ],
    components: [row]
  }).catch(() => null);

  if (reply) {
    db.videos[message.id].reviewReplyId = reply.id;
    saveDB();
  }
}

async function acceptVideo(interaction) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: 'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ© ÙØ¨ÙÙ Ø£Ù Ø±ÙØ¶ Ø§ÙÙÙØ¯ÙÙÙØ§Øª.',
      ephemeral: true
    });
  }

  const messageId = interaction.customId.slice('video_accept:'.length);
  const video = db.videos[messageId];

  if (!video || video.status !== 'pending') {
    return interaction.reply({
      content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙÙÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
      ephemeral: true
    });
  }

  video.status = 'processing_accept';
  video.reviewedBy = interaction.user.id;
  video.reviewedAt = Date.now();
  saveDB();

  const member = await interaction.guild.members.fetch(video.userId).catch(() => null);
  if (member) await safeAddRole(member, CONFIG.ACCEPTED_VIDEO_ROLE_ID);

  video.status = 'accepted';
  saveDB();

  await safeDM(video.userId, {
    embeds: [
      embed(
        'ØªÙ ÙØ¨ÙÙ Ø§ÙÙÙØ¯ÙÙ â',
        [
          'â **ØªÙ ÙØ¨ÙÙ Ø§ÙÙÙØ¯ÙÙ Ø§ÙØ®Ø§Øµ Ø¨Ù**',
          '',
          `ØªÙ ÙØ¨ÙÙ Ø§ÙÙÙØ¯ÙÙ ÙÙ **${CONFIG.SERVER_NAME}** Ø¨ÙØ¬Ø§Ø­.`,
          '',
          'ðï¸ ØªÙØª Ø¥Ø¶Ø§ÙØ© Ø§ÙØ±ØªØ¨Ø© Ø§ÙØ®Ø§ØµØ© Ø¨Ù.',
          '',
          'Ø´ÙØ±Ø§Ù ÙÙØ´Ø§Ø±ÙØªÙ ÙØ¹ÙØ§ ð»'
        ].join('\n'),
        0x2ECC71
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0x2ECC71)
    .setDescription(`**ØµØ§Ø­Ø¨ Ø§ÙÙÙØ¯ÙÙ:** <@${video.userId}>`)
    .addFields({
      name: 'Ø§ÙÙØªÙØ¬Ø©',
      value: `â ØªÙ Ø§ÙÙØ¨ÙÙ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`
    });

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'ÙØ¨ÙÙ ÙÙØ¯ÙÙ',
    `**ØµØ§Ø­Ø¨ Ø§ÙÙÙØ¯ÙÙ:** <@${video.userId}>\n**ØªÙ Ø§ÙÙØ¨ÙÙ Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
    0x2ECC71
  );
}

async function rejectVideo(interaction) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: 'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',
      ephemeral: true
    });
  }

  const messageId = interaction.customId.slice('reject_video:'.length);
  const video = db.videos[messageId];
  const reason = interaction.fields.getTextInputValue('reason').trim();

  if (!video || video.status !== 'pending') {
    return interaction.reply({
      content: 'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙÙÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',
      ephemeral: true
    });
  }

  video.status = 'rejected';
  video.reviewedBy = interaction.user.id;
  video.reviewedAt = Date.now();
  video.rejectionReason = reason;
  saveDB();

  await safeDM(video.userId, {
    embeds: [
      embed(
        'ØªÙ Ø±ÙØ¶ Ø§ÙÙÙØ¯ÙÙ â',
        [
          'â **ØªÙ Ø±ÙØ¶ Ø§ÙÙÙØ¯ÙÙ Ø§ÙØ®Ø§Øµ Ø¨Ù**',
          '',
          `ØªÙ Ø±ÙØ¶ Ø§ÙÙÙØ¯ÙÙ ÙÙ **${CONFIG.SERVER_NAME}**.`,
          '',
          `ð **Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶:** ${reason}`,
          '',
          'ÙÙÙÙÙ ØªØ¹Ø¯ÙÙ Ø§ÙÙØ·ÙÙØ¨ ÙØ§ÙÙØ­Ø§ÙÙØ© ÙØ±Ø© Ø£Ø®Ø±Ù.'
        ].join('\n'),
        0xE74C3C
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0xE74C3C)
    .setDescription(`**ØµØ§Ø­Ø¨ Ø§ÙÙÙØ¯ÙÙ:** <@${video.userId}>`)
    .addFields(
      {
        name: 'Ø§ÙÙØªÙØ¬Ø©',
        value: `â ØªÙ Ø§ÙØ±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`
      },
      {
        name: 'Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶',
        value: reason.slice(0, 1024)
      }
    );

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'Ø±ÙØ¶ ÙÙØ¯ÙÙ',
    `**ØµØ§Ø­Ø¨ Ø§ÙÙÙØ¯ÙÙ:** <@${video.userId}>\n**ØªÙ Ø§ÙØ±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>\n**Ø§ÙØ³Ø¨Ø¨:** ${reason}`,
    0xE74C3C
  );
}

// ==========================================================
// WELCOME + AUTO ROLE
// ==========================================================
client.on(Events.GuildMemberAdd, async member => {
  // Ø¥Ø¹Ø·Ø§Ø¡ Ø±ÙÙÙÙ ØªÙÙØ§Ø¦ÙØ§Ù Ø¹ÙØ¯ Ø¯Ø®ÙÙ Ø§ÙØ¹Ø¶Ù.
  for (const roleId of CONFIG.AUTO_JOIN_ROLE_IDS || []) {
    if (!hasRealId(roleId)) continue;
    await safeAddRole(member, roleId);
  }


  if (db.systems?.welcome === false) return;
  await safeAddRole(member, CONFIG.DEFAULT_MEMBER_ROLE_ID);

  const ch = await safeFetchChannel(CONFIG.WELCOME_CHANNEL_ID);

  if (ch?.isTextBased()) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Ø§ÙÙÙØ§ÙÙÙ')
        .setEmoji('ð')
        .setStyle(ButtonStyle.Link)
        .setURL(channelUrl(CONFIG.RULES_CHANNEL_ID)),

      new ButtonBuilder()
        .setLabel('Ø§ÙØªÙØ¯ÙÙ')
        .setEmoji('ð')
        .setStyle(ButtonStyle.Link)
        .setURL(channelUrl(CONFIG.APPLICATION_PANEL_CHANNEL_ID)),

      new ButtonBuilder()
        .setCustomId('welcome_rating')
        .setLabel('Ø§ÙØªÙÙÙÙ')
        .setEmoji('â­')
        .setStyle(ButtonStyle.Primary)
    );

    const welcomeEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(`ð» ÙØ±Ø­Ø¨Ø§Ù Ø¨Ù ÙÙ ${CONFIG.SERVER_NAME}`)
      .setDescription(
        [
          'ââââââââââââââââââââââââââââââââââââ',
          '',
          `ð Ø£ÙÙØ§Ù ÙØ³ÙÙØ§Ù Ø¨Ù ÙØ§ <@${member.id}>`,
          '',
          `Ø£ÙØª Ø§ÙØ¢Ù Ø¹Ø¶Ù Ø¬Ø¯ÙØ¯ ÙÙ **${CONFIG.SERVER_NAME}**.`,
          '',
          'ð Ø§ÙØ±Ø£ Ø§ÙÙÙØ§ÙÙÙ Ø¬ÙØ¯Ø§Ù ÙØ¨Ù Ø§ÙØ¨Ø¯Ø¡.',
          '',
          'ð ÙÙ Ø­Ø§Ø¨Ø¨ ØªÙØ¯ÙØ Ø§Ø¶ØºØ· Ø¹ÙÙ Ø²Ø± **Ø§ÙØªÙØ¯ÙÙ** Ø¨Ø§ÙØ£Ø³ÙÙ.',
          '',
          'â­ ØªÙØ¯Ø± ÙÙØ§Ù ØªØ¨Ø¹Øª ØªÙÙÙÙÙ ÙÙØ³ÙØ±ÙØ± ÙÙ Ø²Ø± **Ø§ÙØªÙÙÙÙ**.',
          '',
          'ð ÙØªÙÙÙ ÙÙ ÙÙØª ÙÙØªØ¹ ÙØªØ¬Ø±Ø¨Ø© Roleplay ÙÙÙØ© ÙØ¹ÙØ§.',
          '',
          'ââââââââââââââââââââââââââââââââââââ'
        ].join('\n')
      )
      .setImage(CONFIG.WELCOME_BANNER_URL)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `${CONFIG.SERVER_NAME} â¢ Welcome` })
      .setTimestamp();

    await ch.send({
      content: `<@${member.id}>`,
      embeds: [welcomeEmbed],
      components: [row]
    }).catch(() => {});
  }

  await sendLog(
    'Ø¹Ø¶Ù Ø¬Ø¯ÙØ¯',
    [
      `ð¤ **Ø§ÙØ¹Ø¶Ù:** <@${member.id}>`,
      '',
      'â Ø¯Ø®Ù Ø§ÙØ³ÙØ±ÙØ± ÙØªÙ Ø¥Ø¹Ø·Ø§Ø¤Ù Ø§ÙØ±ØªØ¨Ø© Ø§ÙØ§ÙØªØ±Ø§Ø¶ÙØ©.',
      '',
      `ð **ID:** \`${member.id}\``
    ].join('\n'),
    0x2ECC71
  );
});

client.on(Events.GuildMemberRemove, async member => {
  await sendLog(
    'Ø®Ø±ÙØ¬ Ø¹Ø¶Ù',
    `ð¤ **Ø§ÙØ¹Ø¶Ù:** <@${member.id}>\n\nðª Ø®Ø±Ø¬ ÙÙ Ø§ÙØ³ÙØ±ÙØ±.\n\nð **ID:** \`${member.id}\``,
    0xE67E22
  );
});

// ==========================================================
// RATINGS
// ==========================================================
async function openRatingModal(interaction) {
  if (db.systems?.ratings === false) return interaction.reply({content:'â Ø§ÙØªÙÙÙÙØ§Øª ÙØªÙÙÙØ© Ø­Ø§ÙÙØ§Ù.', ephemeral:true});
  const modal = new ModalBuilder()
    .setCustomId('rating_modal')
    .setTitle(`${CONFIG.SERVER_NAME} | Ø§ÙØªÙÙÙÙ`);

  const stars = new TextInputBuilder()
    .setCustomId('stars')
    .setLabel('Ø§ÙØªÙÙÙÙ ÙÙ 1 Ø¥ÙÙ 5')
    .setPlaceholder('ÙØ«Ø§Ù: 5')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(1);

  const reason = new TextInputBuilder()
    .setCustomId('rating_reason')
    .setLabel('Ø³Ø¨Ø¨ Ø§ÙØªÙÙÙÙ')
    .setPlaceholder('Ø§ÙØªØ¨ Ø³Ø¨Ø¨ ØªÙÙÙÙÙ...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder().addComponents(stars),
    new ActionRowBuilder().addComponents(reason)
  );

  await interaction.showModal(modal);
}

async function submitRating(interaction) {
  const starsRaw = interaction.fields.getTextInputValue('stars').trim();
  const reason = interaction.fields.getTextInputValue('rating_reason').trim();
  const stars = Number(starsRaw);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return interaction.reply({
      content: 'â Ø§ÙØªÙÙÙÙ ÙØ§Ø²Ù ÙÙÙÙ Ø±ÙÙ ÙÙ 1 Ø¥ÙÙ 5.',
      ephemeral: true
    });
  }

  db.ratings.push({
    userId: interaction.user.id,
    stars,
    reason,
    createdAt: Date.now()
  });

  // Keep the JSON from growing forever.
  if (db.ratings.length > 5000) {
    db.ratings = db.ratings.slice(-5000);
  }

  saveDB();

  const ch = await safeFetchChannel(CONFIG.RATINGS_CHANNEL_ID);

  if (ch?.isTextBased()) {
    await ch.send({
      embeds: [
        embed(
          `${CONFIG.SERVER_NAME} | ØªÙÙÙÙ Ø¬Ø¯ÙØ¯`,
          [
            `ð¤ **Ø§ÙØ¹Ø¶Ù:** <@${interaction.user.id}>`,
            '',
            `â­ **Ø§ÙØªÙÙÙÙ:** ${'â­'.repeat(stars)} (${stars}/5)`,
            '',
            `ð **Ø³Ø¨Ø¨ Ø§ÙØªÙÙÙÙ:** ${reason}`,
            '',
            'ââââââââââââââââââââââââââââââââ'
          ].join('\n')
        )
      ]
    }).catch(() => {});
  }

  await interaction.reply({
    content: 'â Ø´ÙØ±Ø§Ù! ØªÙ Ø¥Ø±Ø³Ø§Ù ØªÙÙÙÙÙ.',
    ephemeral: true
  });

  await sendLog(
    'ØªÙÙÙÙ Ø¬Ø¯ÙØ¯',
    `**ÙÙ:** <@${interaction.user.id}>\n**Ø§ÙØªÙÙÙÙ:** ${stars}/5\n**Ø§ÙØ³Ø¨Ø¨:** ${reason}`
  );
}

// ==========================================================
// SUPPORT VOICE
// ==========================================================
let supportConnection = null;
let supportPlayer = null;
let supportQueue = Promise.resolve();

async function connectSupportVoice() {
  const guild =
    client.guilds.cache.get(CONFIG.GUILD_ID) ||
    await client.guilds.fetch(CONFIG.GUILD_ID).catch(() => null);

  if (!guild) throw new Error('Guild not found.');

  const channel = await guild.channels.fetch(CONFIG.SUPPORT_VOICE_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isVoiceBased()) {
    throw new Error('Support voice channel not found or is not voice based.');
  }

  // Reuse the current connection when possible.
  let existing = getVoiceConnection(guild.id);
  if (existing && existing.state.status !== VoiceConnectionStatus.Destroyed) {
    supportConnection = existing;

    try {
      if (existing.state.status !== VoiceConnectionStatus.Ready) {
        await entersState(existing, VoiceConnectionStatus.Ready, 15_000);
      }

      if (!supportPlayer) {
        supportPlayer = createAudioPlayer();
        supportConnection.subscribe(supportPlayer);
      }

      return supportConnection;
    } catch {
      try { existing.destroy(); } catch {}
      supportConnection = null;
      supportPlayer = null;
    }
  }

  console.log('Connecting Ghost RP bot to support voice...');

  supportConnection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false
  });

  supportConnection.on('error', err => {
    console.error('Support voice connection event error:', err);
  });

  supportConnection.on('stateChange', (oldState, newState) => {
    console.log(`Support voice state: ${oldState.status} -> ${newState.status}`);
  });

  try {
    await entersState(supportConnection, VoiceConnectionStatus.Ready, 30_000);
  } catch (err) {
    console.error('Support voice could not become Ready:', err);
    try { supportConnection.destroy(); } catch {}
    supportConnection = null;
    supportPlayer = null;
    throw err;
  }

  supportPlayer = createAudioPlayer();
  supportPlayer.on('error', err => {
    console.error('Support audio player error:', err);
  });

  supportConnection.subscribe(supportPlayer);
  console.log('Connected to support voice channel successfully.');
  return supportConnection;
}

async function speakSupportGreeting() {
  if (db.systems?.voice === false) return;

  supportQueue = supportQueue.then(async () => {
    try {
      if (!supportConnection || !supportPlayer || supportConnection.state.status !== VoiceConnectionStatus.Ready) {
        await connectSupportVoice();
      }

      if (!supportConnection || !supportPlayer) {
        throw new Error('Voice connection/player is not ready.');
      }

      const mediaFile = path.join(DATA_DIR, 'ghost-support-greeting.mp4');

      // Download the AI-voice video once, then reuse the local file.
      if (!fs.existsSync(mediaFile) || fs.statSync(mediaFile).size < 1000) {
        console.log('Downloading Ghost RP support greeting media...');
        const response = await fetch(CONFIG.SUPPORT_GREETING_MEDIA_URL, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) {
          throw new Error(`Greeting media HTTP ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(mediaFile, buffer);
        console.log(`Support greeting media saved: ${buffer.length} bytes`);
      }

      const resource = createAudioResource(mediaFile, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });

      if (resource.volume) resource.volume.setVolume(1.0);

      supportPlayer.play(resource);
      await entersState(supportPlayer, AudioPlayerStatus.Playing, 20_000);
      console.log('Ghost RP support greeting is playing.');

      await entersState(supportPlayer, AudioPlayerStatus.Idle, 120_000).catch(() => {});
    } catch (err) {
      console.error('Support media greeting error:', err.message);
    }
  });

  return supportQueue;
}

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const joinedSupport =
    newState.channelId === CONFIG.SUPPORT_VOICE_CHANNEL_ID &&
    oldState.channelId !== CONFIG.SUPPORT_VOICE_CHANNEL_ID &&
    !newState.member?.user.bot;

  if (!joinedSupport) return;

  const last = greetedUsers.get(newState.id) || 0;
  if (Date.now() - last < 20_000) return;

  greetedUsers.set(newState.id, Date.now());

  await speakSupportGreeting();

  await sendLog(
    'Ø¯Ø®ÙÙ Ø§ÙØ¯Ø¹Ù Ø§ÙÙÙÙ',
    `ð§ **Ø§ÙØ¹Ø¶Ù:** <@${newState.id}>\n\nâ Ø¯Ø®Ù Ø±ÙÙ Ø§ÙØ¯Ø¹Ù Ø§ÙÙÙÙ.\n\nâ³ ÙØ±Ø¬Ù Ø§ÙØªØ¸Ø§Ø± Ø£Ø­Ø¯ Ø£ÙØ±Ø§Ø¯ Ø§ÙØ¯Ø¹Ù.`
  );
});

// ==========================================================
// PROTECTION
// ==========================================================
async function runProtection(message) {
  if (db.systems?.protection === false) return false;
  if (!CONFIG.PROTECTION.ENABLED) return false;

  const member = message.member;
  if (!member || protectionBypass(member)) return false;

  const content = message.content || '';

  // Mass mentions / @everyone / @here
  const mentionCount =
    message.mentions.users.size +
    message.mentions.roles.size;

  if (
    mentionCount > CONFIG.PROTECTION.MAX_MENTIONS_PER_MESSAGE ||
    message.mentions.everyone
  ) {
    await message.delete().catch(() => {});
    await timeoutMember(
      member,
      CONFIG.PROTECTION.MASS_MENTION_TIMEOUT_MS,
      'Ghost RP Anti Mass Mention'
    );

    await warnTemporarily(
      message.channel,
      `<@${message.author.id}> ÙÙÙÙØ¹ Ø§ÙÙÙØ´Ù Ø§ÙØ¬ÙØ§Ø¹Ù.`
    );

    await sendLog(
      'Ø­ÙØ§ÙØ© | Mass Mention',
      `<@${member.id}> Ø­Ø§ÙÙ Ø¹ÙÙ ÙÙØ´Ù Ø¬ÙØ§Ø¹Ù ÙÙ <#${message.channel.id}>.`,
      0xE74C3C
    );

    return true;
  }

  // Discord invites
  if (
    CONFIG.PROTECTION.BLOCK_DISCORD_INVITES &&
    /(discord\.gg\/|discord(?:app)?\.com\/invite\/)[A-Za-z0-9-]+/i.test(content)
  ) {
    await message.delete().catch(() => {});

    await warnTemporarily(
      message.channel,
      `<@${message.author.id}> Ø±ÙØ§Ø¨Ø· Ø¯Ø¹ÙØ§Øª Discord ÙÙÙÙØ¹Ø©.`
    );

    await sendLog(
      'Ø­ÙØ§ÙØ© | Discord Invite',
      `<@${member.id}> Ø£Ø±Ø³Ù Ø¯Ø¹ÙØ© Discord ÙÙ <#${message.channel.id}>.`,
      0xE74C3C
    );

    return true;
  }

  // All links (optional)
  if (
    CONFIG.PROTECTION.BLOCK_LINKS &&
    /https?:\/\/\S+|www\.\S+/i.test(content)
  ) {
    await message.delete().catch(() => {});

    await warnTemporarily(
      message.channel,
      `<@${message.author.id}> Ø§ÙØ±ÙØ§Ø¨Ø· ØºÙØ± ÙØ³ÙÙØ­ Ø¨ÙØ§ ÙÙØ§.`
    );

    await sendLog(
      'Ø­ÙØ§ÙØ© | Link',
      `<@${member.id}> Ø£Ø±Ø³Ù Ø±Ø§Ø¨Ø·Ø§Ù ÙÙ <#${message.channel.id}>.`,
      0xE74C3C
    );

    return true;
  }

  // Spam
  const now = Date.now();
  const current = spamTracker.get(message.author.id) || [];
  const recent = current.filter(
    timestamp => now - timestamp < CONFIG.PROTECTION.SPAM_WINDOW_MS
  );

  recent.push(now);
  spamTracker.set(message.author.id, recent);

  if (recent.length >= CONFIG.PROTECTION.SPAM_MESSAGE_LIMIT) {
    spamTracker.set(message.author.id, []);

    await message.delete().catch(() => {});
    await timeoutMember(
      member,
      CONFIG.PROTECTION.SPAM_TIMEOUT_MS,
      'Ghost RP Anti Spam'
    );

    await warnTemporarily(
      message.channel,
      `<@${message.author.id}> ØªÙ Ø¥ÙÙØ§ÙÙ ÙØ¤ÙØªØ§Ù Ø¨Ø³Ø¨Ø¨ Ø§ÙØ³Ø¨Ø§Ù.`
    );

    await sendLog(
      'Ø­ÙØ§ÙØ© | Spam',
      `<@${member.id}> ØªÙ Ø¹ÙÙ Timeout ÙÙ Ø¨Ø³Ø¨Ø¨ Ø§ÙØ³Ø¨Ø§Ù ÙÙ <#${message.channel.id}>.`,
      0xE74C3C
    );

    return true;
  }

  // Excessive caps
  if (CONFIG.PROTECTION.CAPS_ENABLED) {
    const letters = content.match(/[A-Za-z]/g) || [];
    const uppers = content.match(/[A-Z]/g) || [];

    if (
      letters.length >= CONFIG.PROTECTION.CAPS_MIN_LENGTH &&
      (uppers.length / letters.length) * 100 >= CONFIG.PROTECTION.CAPS_PERCENT_LIMIT
    ) {
      await message.delete().catch(() => {});

      await warnTemporarily(
        message.channel,
        `<@${message.author.id}> ÙÙÙ Ø§Ø³ØªØ®Ø¯Ø§Ù Ø§ÙØ­Ø±ÙÙ Ø§ÙÙØ¨ÙØ±Ø©.`
      );

      await sendLog(
        'Ø­ÙØ§ÙØ© | Caps',
        `<@${member.id}> ØªÙ Ø­Ø°Ù Ø±Ø³Ø§ÙØ© Caps ÙÙ <#${message.channel.id}>.`,
        0xE67E22
      );

      return true;
    }
  }

  return false;
}

async function warnTemporarily(channel, content) {
  if (!channel?.isTextBased()) return;

  const warning = await channel.send({ content }).catch(() => null);
  if (warning) {
    setTimeout(() => warning.delete().catch(() => {}), 5000);
  }
}

async function timeoutMember(member, duration, reason) {
  try {
    if (member.moderatable) {
      await member.timeout(duration, reason);
    }
  } catch {}
}

// ==========================================================
// LOGS
// ==========================================================
client.on(Events.MessageDelete, async message => {
  if (!message.guild || message.author?.bot) return;

  await sendLog(
    'Ø­Ø°Ù Ø±Ø³Ø§ÙØ©',
    [
      `**Ø§ÙØ¹Ø¶Ù:** ${message.author ? `<@${message.author.id}>` : 'ØºÙØ± ÙØ¹Ø±ÙÙ'}`,
      `**Ø§ÙØ±ÙÙ:** <#${message.channel.id}>`,
      `**Ø§ÙÙØ­ØªÙÙ:** ${message.content?.slice(0, 1000) || 'ØºÙØ± ÙØªØ§Ø­'}`
    ].join('\n'),
    0xE74C3C
  );
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  await sendLog(
    'ØªØ¹Ø¯ÙÙ Ø±Ø³Ø§ÙØ©',
    [
      `**Ø§ÙØ¹Ø¶Ù:** <@${newMessage.author.id}>`,
      `**Ø§ÙØ±ÙÙ:** <#${newMessage.channel.id}>`,
      `**ÙØ¨Ù:** ${oldMessage.content?.slice(0, 500) || 'ØºÙØ± ÙØªØ§Ø­'}`,
      `**Ø¨Ø¹Ø¯:** ${newMessage.content?.slice(0, 500) || 'ØºÙØ± ÙØªØ§Ø­'}`
    ].join('\n'),
    0xF1C40F
  );
});

client.on(Events.GuildBanAdd, async ban => {
  await sendLog(
    'Ø­Ø¸Ø± Ø¹Ø¶Ù',
    `<@${ban.user.id}> ØªÙ Ø­Ø¸Ø±Ù ÙÙ Ø§ÙØ³ÙØ±ÙØ±.`,
    0xE74C3C
  );
});

client.on(Events.GuildBanRemove, async ban => {
  await sendLog(
    'ÙÙ Ø­Ø¸Ø± Ø¹Ø¶Ù',
    `<@${ban.user.id}> ØªÙ ÙÙ Ø§ÙØ­Ø¸Ø± Ø¹ÙÙ.`,
    0x2ECC71
  );
});

client.on(Events.ChannelCreate, async channel => {
  await sendLog(
    'Ø¥ÙØ´Ø§Ø¡ Ø±ÙÙ',
    `ØªÙ Ø¥ÙØ´Ø§Ø¡ Ø§ÙØ±ÙÙ: <#${channel.id}>`
  );
});

client.on(Events.ChannelDelete, async channel => {
  await sendLog(
    'Ø­Ø°Ù Ø±ÙÙ',
    `ØªÙ Ø­Ø°Ù Ø±ÙÙ: **${channel.name}** (\`${channel.id}\`)`,
    0xE74C3C
  );
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  if (oldChannel.name === newChannel.name) return;

  await sendLog(
    'ØªØ¹Ø¯ÙÙ Ø±ÙÙ',
    `ØªÙ ØªØºÙÙØ± Ø§Ø³Ù Ø§ÙØ±ÙÙ ÙÙ **${oldChannel.name}** Ø¥ÙÙ **${newChannel.name}**.`
  );
});

client.on(Events.RoleCreate, async role => {
  await sendLog(
    'Ø¥ÙØ´Ø§Ø¡ Ø±ØªØ¨Ø©',
    `ØªÙ Ø¥ÙØ´Ø§Ø¡ Ø±ØªØ¨Ø©: <@&${role.id}>`
  );
});

client.on(Events.RoleDelete, async role => {
  await sendLog(
    'Ø­Ø°Ù Ø±ØªØ¨Ø©',
    `ØªÙ Ø­Ø°Ù Ø±ØªØ¨Ø©: **${role.name}** (\`${role.id}\`)`,
    0xE74C3C
  );
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const added = newRoles.filter(role => !oldRoles.has(role.id));
  const removed = oldRoles.filter(role => !newRoles.has(role.id));

  if (added.size) {
    await sendLog(
      'Ø¥Ø¶Ø§ÙØ© Ø±ØªØ¨Ø© ÙØ¹Ø¶Ù',
      `<@${newMember.id}> Ø­ØµÙ Ø¹ÙÙ: ${added.map(r => `<@&${r.id}>`).join(', ')}`
    );
  }

  if (removed.size) {
    await sendLog(
      'Ø¥Ø²Ø§ÙØ© Ø±ØªØ¨Ø© ÙÙ Ø¹Ø¶Ù',
      `<@${newMember.id}> ØªÙ Ø¥Ø²Ø§ÙØ©: ${removed.map(r => `<@&${r.id}>`).join(', ')}`,
      0xE67E22
    );
  }

  if (oldMember.nickname !== newMember.nickname) {
    await sendLog(
      'ØªØºÙÙØ± Nickname',
      `<@${newMember.id}>\n**ÙØ¨Ù:** ${oldMember.nickname || oldMember.user.username}\n**Ø¨Ø¹Ø¯:** ${newMember.nickname || newMember.user.username}`
    );
  }
});


// ==========================================================
//        ADVANCED TICKETS / PANELS / CONTROL - GHOST RP
// ==========================================================
function hasAnyRole(member, ids = []) {
  if (!member) return false;
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return ids.filter(hasRealId).some(id => member.roles.cache.has(id));
}

function isControl(member) {
  return hasAnyRole(member, CONFIG.CONTROL_ROLE_IDS);
}

function ticketFromChannel(id) {
  return Object.values(db.tickets || {}).find(t => t.channelId === id);
}

function ticketStaff(member, ticket) {
  const cfg = CONFIG.TICKET_TYPES[ticket?.type];
  return hasAnyRole(member, [...(cfg?.teamRoleIds || []), ...CONFIG.TICKET_ADMIN_ROLE_IDS, ...CONFIG.CONTROL_ROLE_IDS]);
}

// Ø§ÙØ£Ø²Ø±Ø§Ø± Ø§ÙØ­Ø³Ø§Ø³Ø©: ÙØ±ÙÙ Ø§ÙØªØ°Ø§ÙØ± + ÙØ³Ø¤ÙÙ Ø§ÙØªØ°Ø§ÙØ± ÙÙØ·.
function ticketManagementStaff(member) {
  if (!member) return false;
  return [CONFIG.TICKET_TEAM_ROLE_ID, CONFIG.TICKET_MANAGER_ROLE_ID]
    .filter(hasRealId)
    .some(id => member.roles.cache.has(id));
}

function priorityData(priority) {
  return {
    normal: { label:'Ø¹Ø§Ø¯Ù', emoji:'ð¢', color:0x2ECC71 },
    important: { label:'ÙØ§Ù', emoji:'ð¡', color:0xF1C40F },
    urgent: { label:'Ø¶Ø±ÙØ±Ù', emoji:'ð´', color:0xE74C3C }
  }[priority];
}

function extractId(v='') {
  const m = String(v).match(/\d{15,22}/);
  return m ? m[0] : null;
}

async function ticketLog(title, body, color=CONFIG.COLOR) {
  const ch = await safeFetchChannel(CONFIG.TICKET_LOG_CHANNEL_ID);
  if (ch?.isTextBased()) await ch.send({embeds:[embed(title, body, color)]}).catch(()=>{});
}

async function panelExists(ch, customId) {
  const msgs = await ch.messages.fetch({limit:50}).catch(()=>null);
  return !!msgs?.some(m => m.author.id === client.user.id &&
    m.components.some(r => r.components.some(c => c.customId === customId)));
}

async function postAdvancedPanels() {
  const ticketCh = await safeFetchChannel(CONFIG.TICKET_PANEL_CHANNEL_ID);
  if (ticketCh?.isTextBased() && !(await panelExists(ticketCh,'ticket_type:support'))) {
    const r1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_type:support').setLabel('Ø§ÙØ¯Ø¹Ù Ø§ÙÙÙÙ').setEmoji('ð§').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:monitoring').setLabel('Ø§ÙØ±ÙØ§Ø¨Ø©').setEmoji('ðï¸').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:player_complaint').setLabel('Ø´ÙÙÙ Ø¶Ø¯ ÙØ§Ø¹Ø¨').setEmoji('â ï¸').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:appeal').setLabel('Ø§Ø³ØªØ¦ÙØ§Ù').setEmoji('ð').setStyle(ButtonStyle.Primary)
    );
    const r2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_type:staff_complaint').setLabel('Ø´ÙÙÙ Ø¶Ø¯ Ø¥Ø¯Ø§Ø±Ù').setEmoji('ð').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:store').setLabel('Ø§ÙÙØªØ¬Ø±').setEmoji('ð').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:compensation').setLabel('Ø§ÙØªØ¹ÙÙØ¶Ø§Øª').setEmoji('ð°').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:bug').setLabel('Ø§ÙØ¥Ø¨ÙØ§Øº Ø¹Ù Ø§ÙØ£Ø®Ø·Ø§Ø¡').setEmoji('ð').setStyle(ButtonStyle.Primary)
    );
    await ticketCh.send({embeds:[embed('ð« ÙØ¸Ø§Ù Ø§ÙØªØ°Ø§ÙØ±','Ø§Ø®ØªØ± ÙÙØ¹ Ø§ÙØªØ°ÙØ±Ø©Ø ÙØ¨Ø¹Ø¯ÙØ§ Ø§Ø®ØªØ§Ø± **Ø¹Ø§Ø¯Ù / ÙØ§Ù / Ø¶Ø±ÙØ±Ù**.')],components:[r1,r2]});
  }

  const control = await safeFetchChannel(CONFIG.CONTROL_PANEL_CHANNEL_ID);
  if (control?.isTextBased() && !(await panelExists(control,'sys:tickets'))) {
    const r1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('sys:tickets').setLabel('Ø§ÙØªØ°Ø§ÙØ±').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:applications').setLabel('Ø§ÙØªÙØ¯ÙÙØ§Øª').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:welcome').setLabel('Ø§ÙØªØ±Ø­ÙØ¨').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:protection').setLabel('Ø§ÙØ­ÙØ§ÙØ©').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:ratings').setLabel('Ø§ÙØªÙÙÙÙ').setStyle(ButtonStyle.Primary)
    );
    const r2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('sys:videos').setLabel('Ø§ÙÙÙØ¯ÙÙÙØ§Øª').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:voice').setLabel('ÙÙÙØ³ Ø§ÙØ¯Ø¹Ù').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys_status').setLabel('Ø§ÙØ­Ø§ÙØ©').setEmoji('ð').setStyle(ButtonStyle.Secondary)
    );
    await control.send({embeds:[embed('âï¸ ÙÙØ­Ø© Ø§ÙØªØ­ÙÙ','ØªØ´ØºÙÙ ÙØ¥ÙÙØ§Ù Ø£ÙØ¸ÙØ© Ø§ÙØ¨ÙØª.')],components:[r1,r2]});
  }

  const sendCh = await safeFetchChannel(CONFIG.BOT_SEND_PANEL_CHANNEL_ID);
  if (sendCh?.isTextBased() && !(await panelExists(sendCh,'bot_send'))) {
    await sendCh.send({embeds:[embed('ð¨ Ø¥Ø±Ø³Ø§Ù Ø¹Ù Ø·Ø±ÙÙ Ø§ÙØ¨ÙØª','Ø­Ø¯Ø¯ Ø§ÙØ§ØªØ´Ø§ÙÙ ÙØ§ÙØ±Ø³Ø§ÙØ©.')],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('bot_send').setLabel('Ø¥Ø±Ø³Ø§Ù Ø±Ø³Ø§ÙØ©').setEmoji('ð¨').setStyle(ButtonStyle.Primary))
    ]});
  }

  const decision = await safeFetchChannel(CONFIG.DECISION_PANEL_CHANNEL_ID);
  if (decision?.isTextBased() && !(await panelExists(decision,'decision_accept'))) {
    const decisionEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle('ââ ÙØ¨ÙÙ / Ø±ÙØ¶')
      .setDescription([
        'ââââââââââââââââââââââââââââââââââââââââ',
        '',
        'Ø§Ø®ØªØ§Ø± **ÙØ¨ÙÙ** Ø£Ù **Ø±ÙØ¶** ÙÙ Ø§ÙØ£Ø²Ø±Ø§Ø± Ø¨Ø§ÙØ£Ø³ÙÙ.',
        '',
        'Ø¨Ø¹Ø¯ÙØ§ Ø§ÙØªØ¨ Discord ID Ø§ÙØ®Ø§Øµ Ø¨Ø§ÙØ´Ø®Øµ.',
        '',
        'ÙÙ Ø§ÙØ±ÙØ¶ ÙÙØ·ÙØ¨ ÙÙÙ Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶.',
        '',
        'ââââââââââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({ text: CONFIG.SERVER_NAME })
      .setTimestamp();

    await decision.send({
      embeds:[decisionEmbed],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('decision_accept').setLabel('ÙØ¨ÙÙ').setEmoji('â').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('decision_reject').setLabel('Ø±ÙØ¶').setEmoji('â').setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }

  const staff = await safeFetchChannel(CONFIG.STAFF_APPLICATION_PANEL_CHANNEL_ID);
  if (staff?.isTextBased() && !(await panelExists(staff,'staff_apply'))) {
    const staffPanelEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle('ð¡ï¸ ØªÙØ¯ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©')
      .setDescription([
        'ââââââââââââââââââââââââââââââââââââââââ',
        '',
        'Ø§Ø¶ØºØ· Ø¹ÙÙ Ø²Ø± **ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø©** ÙÙØªØ­ ÙÙÙØ°Ø¬ Ø§ÙØªÙØ¯ÙÙ.',
        '',
        'Ø¨Ø¹Ø¯ Ø§ÙØ¥Ø±Ø³Ø§Ù Ø³ÙØªÙ ÙØ±Ø§Ø¬Ø¹Ø© ØªÙØ¯ÙÙÙ ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©.',
        '',
        'ââââââââââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({ text: CONFIG.SERVER_NAME })
      .setTimestamp();

    await staff.send({embeds:[staffPanelEmbed],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('staff_apply').setLabel('ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø©').setStyle(ButtonStyle.Primary))
    ]});
  }

  const monitoring = await safeFetchChannel(CONFIG.MONITORING_APPLICATION_PANEL_CHANNEL_ID);
  if (monitoring?.isTextBased() && !(await panelExists(monitoring,'monitoring_apply'))) {
    const monitoringPanelEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle('ðï¸ ØªÙØ¯ÙÙ Ø§ÙØ±ÙØ§Ø¨Ø©')
      .setDescription([
        'ââââââââââââââââââââââââââââââââ',
        '',
        'ÙÙ Ø­Ø§Ø¨Ø¨ ØªÙØ¶Ù ÙÙØ±ÙÙ Ø§ÙØ±ÙØ§Ø¨Ø© Ø§Ø¶ØºØ· Ø¹ÙÙ Ø§ÙØ²Ø± Ø¨Ø§ÙØ£Ø³ÙÙ.',
        '',
        'Ø§ÙØ£Ø³Ø¦ÙØ© ÙØªÙØµÙÙ ÙÙ Ø§ÙØ®Ø§Øµ Ø³Ø¤Ø§Ù Ø¨Ø³Ø¤Ø§Ù.',
        '',
        'ââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({ text: CONFIG.SERVER_NAME })
      .setTimestamp();

    await monitoring.send({
      embeds:[monitoringPanelEmbed],
      components:[new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('monitoring_apply')
          .setLabel('ØªÙØ¯ÙÙ Ø±ÙØ§Ø¨Ø©')
          .setStyle(ButtonStyle.Primary)
      )]
    });
  }

  const creator = await safeFetchChannel(CONFIG.CREATOR_APPLICATION_PANEL_CHANNEL_ID);
  if (creator?.isTextBased() && !(await panelExists(creator,'creator_apply'))) {
    const creatorPanelEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle('ð¥ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ')
      .setDescription([
        'ââââââââââââââââââââââââââââââââââââââââ',
        '',
        'Ø§Ø¶ØºØ· Ø¹ÙÙ Ø²Ø± **ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ** ÙÙØªØ­ ÙÙÙØ°Ø¬ Ø§ÙØªÙØ¯ÙÙ.',
        '',
        'Ø¨Ø¹Ø¯ Ø§ÙØ¥Ø±Ø³Ø§Ù Ø³ÙØªÙ ÙØ±Ø§Ø¬Ø¹Ø© ØªÙØ¯ÙÙÙ ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©.',
        '',
        'ââââââââââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({ text: CONFIG.SERVER_NAME })
      .setTimestamp();

    await creator.send({embeds:[creatorPanelEmbed],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('creator_apply').setLabel('ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ').setStyle(ButtonStyle.Primary))
    ]});
  }
}

client.once(Events.ClientReady, async ()=>{
  await postAdvancedPanels();
  setInterval(checkTicketWarnings, 60*1000);
});

async function choosePriority(interaction, typeKey) {
  if (db.systems?.tickets === false) return interaction.reply({content:'â Ø§ÙØªØ°Ø§ÙØ± ÙØªÙÙÙØ©.',ephemeral:true});
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  if (!cfg) return;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:normal`).setLabel('Ø¹Ø§Ø¯Ù').setEmoji('ð¢').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:important`).setLabel('ÙØ§Ù').setEmoji('ð¡').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:urgent`).setLabel('Ø¶Ø±ÙØ±Ù').setEmoji('ð´').setStyle(ButtonStyle.Danger)
  );
  await interaction.reply({embeds:[embed(`${cfg.emoji} ${cfg.label}`,'Ø§Ø®ØªØ± Ø§ÙØ£ÙÙÙÙØ©:')],components:[row],ephemeral:true});
}

async function ticketProblemModal(interaction,typeKey,priority) {
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  const modal = new ModalBuilder().setCustomId(`ticket_create:${typeKey}:${priority}`).setTitle(`${cfg.label} - ${priorityData(priority).label}`);
  const problem = new TextInputBuilder().setCustomId('problem').setLabel('Ø§ÙØªØ¨ Ø§ÙÙØ´ÙÙØ©').setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(5).setMaxLength(1500);
  modal.addComponents(new ActionRowBuilder().addComponents(problem));
  await interaction.showModal(modal);
}

function ticketRows(num) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim:${num}`).setLabel('Ø§Ø³ØªÙØ§Ù').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_add_user:${num}`).setLabel('Ø¥Ø¶Ø§ÙØ© Ø´Ø®Øµ').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_add_staff:${num}`).setLabel('Ø¥Ø¶Ø§ÙØ© Ø¥Ø¯Ø§Ø±Ù').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_warn:${num}`).setLabel('ØªÙØ¨ÙÙ 24 Ø³Ø§Ø¹Ø©').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`ticket_close:${num}`).setLabel('Ø¥ØºÙØ§Ù').setStyle(ButtonStyle.Danger)
    )
  ];
}

function closedTicketRows(num) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket_save:${num}`).setLabel('Ø­ÙØ¸ Ø§ÙØªØ°ÙØ±Ø©').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_reopen:${num}`).setLabel('Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_delete:${num}`).setLabel('ÙØ³Ø­ Ø§ÙØªØ°ÙØ±Ø©').setStyle(ButtonStyle.Danger)
    )
  ];
}

function closedTicketActionStaff(member){
  return hasAnyRole(member, CONFIG.TICKET_CLOSED_ACTION_ROLE_IDS || []);
}

function formatTicketTime(ms){
  if(!ms) return 'ØºÙØ± ÙØ­Ø¯Ø¯';
  return `<t:${Math.floor(ms/1000)}:F>`;
}

async function createTicket(interaction,typeKey,priority) {
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  const p = priorityData(priority);
  const problem = interaction.fields.getTextInputValue('problem').trim();

  const open = Object.values(db.tickets).find(t=>t.ownerId===interaction.user.id && t.type===typeKey && t.status!=='deleted');
  if (open) return interaction.reply({content:`â ï¸ Ø¹ÙØ¯Ù ØªØ°ÙØ±Ø© ÙÙ Ø§ÙÙÙØ¹ Ø¯Ù: <#${open.channelId}>`,ephemeral:true});

  db.ticketCounter++;
  const num = String(db.ticketCounter).padStart(4,'0');
  const overwrites = [
    {id:interaction.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
    {id:interaction.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]}
  ];
  for (const id of [...cfg.teamRoleIds,...CONFIG.TICKET_ADMIN_ROLE_IDS,...CONFIG.CONTROL_ROLE_IDS]) {
    if (hasRealId(id)) overwrites.push({id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles,PermissionFlagsBits.ManageMessages]});
  }

  const ch = await interaction.guild.channels.create({
    name:`ticket-${num}`,
    type:ChannelType.GuildText,
    parent:hasRealId(cfg.categoryId)?cfg.categoryId:null,
    permissionOverwrites:overwrites
  });

  db.tickets[num]={number:num,channelId:ch.id,ownerId:interaction.user.id,type:typeKey,priority,problem,status:'open',claimedBy:[],addedUsers:[],createdAt:Date.now(),warningDeadline:0};
  saveDB();

  await ch.send({
    content:`<@${interaction.user.id}> ${cfg.teamRoleIds.filter(hasRealId).map(id=>`<@&${id}>`).join(' ')}`,
    embeds:[embed(`${cfg.emoji} ØªØ°ÙØ±Ø© #${num}`,`**Ø§ÙÙÙØ¹:** ${cfg.label}\n**Ø§ÙØ£ÙÙÙÙØ©:** ${p.emoji} ${p.label}\n**ØµØ§Ø­Ø¨ Ø§ÙØªØ°ÙØ±Ø©:** <@${interaction.user.id}>\n\n**Ø§ÙÙØ´ÙÙØ©:**\n${problem}`,p.color)],
    components:ticketRows(num)
  });

  await interaction.reply({content:`â ØªÙ ÙØªØ­ Ø§ÙØªØ°ÙØ±Ø©: ${ch}`,ephemeral:true});

  const notifyId = priority==='normal'?cfg.normalChannelId:(priority==='important'?cfg.importantChannelId:cfg.urgentChannelId);
  const notify = await safeFetchChannel(notifyId);
  if (notify?.isTextBased()) {
    await notify.send({
      content:cfg.teamRoleIds.filter(hasRealId).map(id=>`<@&${id}>`).join(' '),
      embeds:[embed(`${p.emoji} ${p.label} | ${cfg.label}`,`ØªØ°ÙØ±Ø© #${num}\nØµØ§Ø­Ø¨ÙØ§: <@${interaction.user.id}>`,p.color)],
      components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Ø¯Ø®ÙÙ Ø§ÙØªØ°ÙØ±Ø©').setStyle(ButtonStyle.Link).setURL(ch.url))]
    });
  }
  await ticketLog('ÙØªØ­ ØªØ°ÙØ±Ø©',`#${num} | ${cfg.label} | ${p.label}\n<@${interaction.user.id}>`);
}

async function ticketMemberModal(interaction,ticket,staffOnly=false) {
  const allowed = staffOnly ? ticketManagementStaff(interaction.member) : ticketStaff(interaction.member,ticket);
  if (!allowed) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ© ÙÙØ°Ø§ Ø§ÙØ¥Ø¬Ø±Ø§Ø¡.',ephemeral:true});
  const modal = new ModalBuilder().setCustomId(`${staffOnly?'ticket_staff_submit':'ticket_user_submit'}:${ticket.number}`).setTitle(staffOnly?'Ø¥Ø¶Ø§ÙØ© Ø¥Ø¯Ø§Ø±Ù':'Ø¥Ø¶Ø§ÙØ© Ø´Ø®Øµ');
  const user = new TextInputBuilder().setCustomId('user').setLabel('ÙÙØ´Ù Ø§ÙØ´Ø®Øµ Ø£Ù Discord ID').setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(user));
  await interaction.showModal(modal);
}

async function addTicketMember(interaction,ticket,staffOnly=false) {
  const allowed = staffOnly ? ticketManagementStaff(interaction.member) : ticketStaff(interaction.member,ticket);
  if (!allowed) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ© ÙÙØ°Ø§ Ø§ÙØ¥Ø¬Ø±Ø§Ø¡.',ephemeral:true});
  const id=extractId(interaction.fields.getTextInputValue('user'));
  const member=id?await interaction.guild.members.fetch(id).catch(()=>null):null;
  if (!member) return interaction.reply({content:'â Ø§ÙØ´Ø®Øµ ÙØ§Ø²Ù ÙÙÙÙ ÙÙØ¬ÙØ¯ ÙÙ Ø§ÙØ³ÙØ±ÙØ±.',ephemeral:true});
  if (staffOnly && !ticketStaff(member,ticket)) return interaction.reply({content:'â Ø§ÙØ´Ø®Øµ ÙØ´ ÙÙ ÙØ±ÙÙ Ø§ÙØªØ°ÙØ±Ø©.',ephemeral:true});
  await interaction.channel.permissionOverwrites.edit(member.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,AttachFiles:true});
  if (!ticket.addedUsers.includes(member.id)) ticket.addedUsers.push(member.id);
  if (staffOnly && !ticket.claimedBy.includes(member.id)) ticket.claimedBy.push(member.id);
  saveDB();
  await interaction.reply({content:`â ØªÙØª Ø¥Ø¶Ø§ÙØ© <@${member.id}>.`});
}

async function ticketCloseModal(interaction,ticket){
  if(!ticketManagementStaff(interaction.member)) {
    return interaction.reply({content:'â ÙØ±ÙÙ Ø§ÙØªØ°Ø§ÙØ± Ø£Ù ÙØ³Ø¤ÙÙ Ø§ÙØªØ°Ø§ÙØ± ÙÙØ·.',ephemeral:true});
  }
  if(!ticket || ticket.status!=='open') {
    return interaction.reply({content:'â ï¸ Ø§ÙØªØ°ÙØ±Ø© ÙØ´ ÙÙØªÙØ­Ø©.',ephemeral:true});
  }

  const modal=new ModalBuilder()
    .setCustomId(`ticket_close_submit:${ticket.number}`)
    .setTitle(`Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø© #${ticket.number}`);

  modal.addComponents(new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Ø³Ø¨Ø¨ Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø©')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(2)
      .setMaxLength(800)
  ));
  await interaction.showModal(modal);
}

async function closeTicketNow(interaction,ticket,reason){
  if(!ticketManagementStaff(interaction.member)) {
    return interaction.reply({content:'â ÙØ±ÙÙ Ø§ÙØªØ°Ø§ÙØ± Ø£Ù ÙØ³Ø¤ÙÙ Ø§ÙØªØ°Ø§ÙØ± ÙÙØ·.',ephemeral:true});
  }
  if(!ticket || ticket.status!=='open') {
    return interaction.reply({content:'â ï¸ Ø§ÙØªØ°ÙØ±Ø© ØªÙ Ø¥ØºÙØ§ÙÙØ§ Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});
  }

  const cfg=CONFIG.TICKET_TYPES[ticket.type];
  const closedAt=Date.now();
  ticket.status='closed';
  ticket.warningDeadline=0;
  ticket.closeReason=reason;
  ticket.closedBy=interaction.user.id;
  ticket.closedAt=closedAt;
  saveDB();

  // Ø¨Ø¹Ø¯ Ø§ÙØ¥ØºÙØ§Ù ØµØ§Ø­Ø¨ Ø§ÙØªØ°ÙØ±Ø© ÙØ£Ù Ø´Ø®Øµ ÙØ¶Ø§Ù ÙØ§ ÙÙØ¯Ø± ÙØ´ÙÙÙØ§.
  await interaction.channel.permissionOverwrites.edit(ticket.ownerId,{ViewChannel:false,SendMessages:false}).catch(()=>{});
  for(const id of ticket.addedUsers||[]){
    await interaction.channel.permissionOverwrites.edit(id,{ViewChannel:false,SendMessages:false}).catch(()=>{});
  }

  // ÙÙØ· Ø§ÙØ±ÙÙØ§Øª Ø§ÙØ«ÙØ§Ø«Ø© Ø§ÙØ®Ø§ØµØ© Ø¨ÙØ§ Ø¨Ø¹Ø¯ Ø§ÙØ¥ØºÙØ§Ù + Ø±ÙÙØ§Øª Ø§ÙØ¥Ø¯Ø§Ø±Ø© ØªÙØ¯Ø± ØªØ´ÙÙ Ø§ÙÙÙØ§Ø©.
  for(const roleId of CONFIG.TICKET_CLOSED_ACTION_ROLE_IDS||[]){
    if(hasRealId(roleId)){
      await interaction.channel.permissionOverwrites.edit(roleId,{
        ViewChannel:true,SendMessages:true,ReadMessageHistory:true,ManageMessages:true
      }).catch(()=>{});
    }
  }

  const closeEmbed=new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle(`ð ØªÙ Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø© #${ticket.number}`)
    .setDescription([
      'ââââââââââââââââââââââââââââââââ','',
      `ð¤ **ØµØ§Ø­Ø¨ Ø§ÙØªØ°ÙØ±Ø©:** <@${ticket.ownerId}>`,
      `ð« **Ø§Ø³Ù Ø§ÙØªØ°ÙØ±Ø©:** ${interaction.channel.name}`,
      `ð **Ø§ÙÙÙØ¹:** ${cfg.label}`,
      `ð® **Ø§ÙØ¥ØºÙØ§Ù Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
      `ð **Ø³Ø¨Ø¨ Ø§ÙØ¥ØºÙØ§Ù:** ${reason}`,
      `ð **Ø§ÙØªÙÙÙØª:** ${formatTicketTime(closedAt)}`,
      '','ââââââââââââââââââââââââââââââââ'
    ].join('\n'))
    .setFooter({text:CONFIG.SERVER_NAME})
    .setTimestamp();

  await interaction.reply({
    embeds:[closeEmbed],
    components:closedTicketRows(ticket.number)
  });

  await safeDM(ticket.ownerId,{
    embeds:[new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('ð ØªÙ Ø¥ØºÙØ§Ù ØªØ°ÙØ±ØªÙ')
      .setDescription([
        `ð« **Ø§Ø³Ù Ø§ÙØªØ°ÙØ±Ø©:** ticket-${ticket.number}`,
        `ð **Ø§ÙÙÙØ¹:** ${cfg.label}`,
        `ð® **Ø£ØºÙÙØª Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
        `ð **Ø³Ø¨Ø¨ Ø§ÙØ¥ØºÙØ§Ù:** ${reason}`,
        `ð **Ø§ÙØªÙÙÙØª:** ${formatTicketTime(closedAt)}`,
        '',
        'â­ ÙÙÙÙÙ ØªÙÙÙÙ Ø§ÙØªØ°ÙØ±Ø© ÙÙ Ø§ÙØ£Ø²Ø±Ø§Ø± Ø¨Ø§ÙØ£Ø³ÙÙ.'
      ].join('\n'))
      .setFooter({text:CONFIG.SERVER_NAME})
      .setTimestamp()],
    components:[new ActionRowBuilder().addComponents(
      ...[1,2,3,4,5].map(n=>new ButtonBuilder()
        .setCustomId(`ticket_rate:${ticket.number}:${n}`)
        .setLabel(`${n} â­`)
        .setStyle(ButtonStyle.Secondary))
    )]
  });

  await ticketLog(
    'ð Ø¥ØºÙØ§Ù ØªØ°ÙØ±Ø©',
    [
      `**Ø§ÙØªØ°ÙØ±Ø©:** #${ticket.number}`,
      `**Ø§ÙØ§Ø³Ù:** ${interaction.channel.name}`,
      `**Ø§ÙØ´Ø®Øµ:** <@${ticket.ownerId}>`,
      `**Ø§ÙÙÙØ¹:** ${cfg.label}`,
      `**Ø§ÙØ¥ØºÙØ§Ù Ø¨ÙØ§Ø³Ø·Ø©:** <@${interaction.user.id}>`,
      `**Ø§ÙØ³Ø¨Ø¨:** ${reason}`,
      `**Ø§ÙØªÙÙÙØª:** ${formatTicketTime(closedAt)}`
    ].join('\n'),
    0xE74C3C
  );
}

async function reopenTicketNow(interaction,ticket) {
  if(!closedTicketActionStaff(interaction.member)) {
    return interaction.reply({content:'â Ø§ÙØ±ÙÙØ§Øª Ø§ÙÙØ­Ø¯Ø¯Ø© ÙÙØ§ Ø¨Ø¹Ø¯ Ø§ÙØ¥ØºÙØ§Ù ÙÙØ·.',ephemeral:true});
  }
  if(!ticket || ticket.status!=='closed') {
    return interaction.reply({content:'â ï¸ Ø§ÙØªØ°ÙØ±Ø© ÙÙØ³Øª ÙØºÙÙØ©.',ephemeral:true});
  }

  ticket.status='open';
  ticket.warningDeadline=0;
  ticket.reopenedBy=interaction.user.id;
  ticket.reopenedAt=Date.now();
  saveDB();

  await interaction.channel.permissionOverwrites.edit(ticket.ownerId,{
    ViewChannel:true,SendMessages:true,ReadMessageHistory:true,AttachFiles:true
  }).catch(()=>{});

  const e=new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`â»ï¸ ØªÙ Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§ÙØªØ°ÙØ±Ø© #${ticket.number}`)
    .setDescription([
      `ð¤ ØµØ§Ø­Ø¨ Ø§ÙØªØ°ÙØ±Ø©: <@${ticket.ownerId}>`,
      `ð® Ø£Ø¹Ø§Ø¯ ÙØªØ­ÙØ§: <@${interaction.user.id}>`,
      `ð Ø§ÙØªÙÙÙØª: ${formatTicketTime(ticket.reopenedAt)}`
    ].join('\n'))
    .setTimestamp();

  await interaction.update({embeds:[e],components:ticketRows(ticket.number)});
  await safeDM(ticket.ownerId,{embeds:[embed('â»ï¸ Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§ÙØªØ°ÙØ±Ø©',`ØªÙ Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ ØªØ°ÙØ±ØªÙ #${ticket.number} ÙÙÙÙÙÙ Ø±Ø¤ÙØªÙØ§ ÙØ§ÙØ±Ø¯ ÙÙÙØ§ Ø§ÙØ¢Ù.`,0x2ECC71)]});
  await ticketLog('â»ï¸ Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ ØªØ°ÙØ±Ø©',`#${ticket.number}\nØµØ§Ø­Ø¨ÙØ§: <@${ticket.ownerId}>\nØ¨ÙØ§Ø³Ø·Ø©: <@${interaction.user.id}>\nØ§ÙØªÙÙÙØª: ${formatTicketTime(ticket.reopenedAt)}`,0x2ECC71);
}

async function buildTicketTranscript(channel,ticket){
  let arr=[],before;
  for(let i=0;i<10;i++){
    const batch=await channel.messages.fetch({limit:100,before}).catch(()=>null);
    if(!batch?.size) break;
    arr.push(...batch.values());
    before=batch.last().id;
    if(batch.size<100) break;
  }
  arr.sort((a,b)=>a.createdTimestamp-b.createdTimestamp);
  return arr.map(m=>{
    const attachments=[...m.attachments.values()].map(a=>a.url).join(' ');
    return `[${new Date(m.createdTimestamp).toISOString()}] ${m.author?.tag||'Unknown'}: ${m.content||'[Embed/Attachment]'} ${attachments}`.trim();
  }).join('\n');
}

async function saveClosedTicket(interaction,ticket){
  if(!closedTicketActionStaff(interaction.member)) {
    return interaction.reply({content:'â Ø§ÙØ±ÙÙØ§Øª Ø§ÙÙØ­Ø¯Ø¯Ø© ÙÙØ§ Ø¨Ø¹Ø¯ Ø§ÙØ¥ØºÙØ§Ù ÙÙØ·.',ephemeral:true});
  }
  if(!ticket || ticket.status!=='closed') {
    return interaction.reply({content:'â ï¸ ÙØ§Ø²Ù Ø§ÙØªØ°ÙØ±Ø© ØªÙÙÙ ÙØºÙÙØ© Ø§ÙØ£ÙÙ.',ephemeral:true});
  }

  await interaction.deferReply({ephemeral:true});
  const txt=await buildTicketTranscript(interaction.channel,ticket);
  const file=new AttachmentBuilder(Buffer.from(txt||'No messages','utf8'),{name:`ticket-${ticket.number}.txt`});
  const log=await safeFetchChannel(CONFIG.TICKET_LOG_CHANNEL_ID);

  if(log?.isTextBased()){
    await log.send({
      embeds:[embed(
        'ð¾ Ø­ÙØ¸ ØªØ°ÙØ±Ø©',
        `#${ticket.number}\nØµØ§Ø­Ø¨ÙØ§: <@${ticket.ownerId}>\nØ§ÙÙÙØ¹: ${CONFIG.TICKET_TYPES[ticket.type].label}\nØ­ÙØ¸ Ø¨ÙØ§Ø³Ø·Ø©: <@${interaction.user.id}>`
      )],
      files:[file]
    });
  }

  ticket.savedBy=interaction.user.id;
  ticket.savedAt=Date.now();
  saveDB();
  await interaction.editReply({content:'ð¾ ØªÙ Ø­ÙØ¸ ÙØ³Ø®Ø© Ø§ÙØªØ°ÙØ±Ø© ÙÙ ÙÙØ¬Ø§Øª Ø§ÙØªØ°Ø§ÙØ±.'});
}

async function ticketTranscript(interaction,ticket) {
  // Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§ÙØ¯Ø§ÙØ© ÙÙØªÙØ§ÙÙ ÙØ¹ Ø£Ù ÙÙØ¯ ÙØ¯ÙÙØ ÙØ§ÙØ­ÙØ¸ Ø¨Ø¹Ø¯ Ø§ÙØ¥ØºÙØ§Ù ÙÙØ·.
  return saveClosedTicket(interaction,ticket);
}

async function warnTicket24(interaction,ticket) {
  if (!ticketManagementStaff(interaction.member)) return interaction.reply({content:'â ÙØ±ÙÙ Ø§ÙØªØ°Ø§ÙØ± Ø£Ù ÙØ³Ø¤ÙÙ Ø§ÙØªØ°Ø§ÙØ± ÙÙØ·.',ephemeral:true});
  ticket.warningDeadline=Date.now()+24*60*60*1000; saveDB();
  await interaction.reply({content:`<@${ticket.ownerId}> â ï¸ ÙÙ ÙÙÙØ´ Ø±Ø¯ Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø© Ø§ÙØªØ°ÙØ±Ø© ÙØªØªÙÙÙ ØªÙÙØ§Ø¦Ù.`});
  await safeDM(ticket.ownerId,{embeds:[embed('â ï¸ ØªÙØ¨ÙÙ ØªØ°ÙØ±Ø©',`ØªØ°ÙØ±ØªÙ #${ticket.number} ØªØ­ØªØ§Ø¬ Ø±Ø¯ Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©.`)]});
}

async function checkTicketWarnings() {
  const guild=client.guilds.cache.get(CONFIG.GUILD_ID);
  if(!guild) return;
  for(const t of Object.values(db.tickets||{})){
    if(t.status!=='open'||!t.warningDeadline||t.warningDeadline>Date.now()) continue;
    const ch=await guild.channels.fetch(t.channelId).catch(()=>null);
    if(!ch) continue;
    t.status='closed'; t.warningDeadline=0; t.closeReason='Ø¹Ø¯Ù Ø§ÙØªÙØ§Ø¹Ù Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©'; t.closedBy=client.user.id; t.closedAt=Date.now(); saveDB();
    await ch.permissionOverwrites.edit(t.ownerId,{ViewChannel:false,SendMessages:false}).catch(()=>{});
    for(const roleId of CONFIG.TICKET_CLOSED_ACTION_ROLE_IDS||[]){
      if(hasRealId(roleId)) await ch.permissionOverwrites.edit(roleId,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,ManageMessages:true}).catch(()=>{});
    }
    await ch.send({
      embeds:[new EmbedBuilder().setColor(0xE74C3C).setTitle(`ð ØªÙ Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø© #${t.number}`).setDescription([
        `ð¤ **ØµØ§Ø­Ø¨ Ø§ÙØªØ°ÙØ±Ø©:** <@${t.ownerId}>`,
        `ð **Ø§ÙÙÙØ¹:** ${CONFIG.TICKET_TYPES[t.type].label}`,
        `ð® **Ø§ÙØ¥ØºÙØ§Ù Ø¨ÙØ§Ø³Ø·Ø©:** Ø§ÙØ¨ÙØª ØªÙÙØ§Ø¦ÙØ§Ù`,
        `ð **Ø§ÙØ³Ø¨Ø¨:** Ø¹Ø¯Ù Ø§ÙØªÙØ§Ø¹Ù Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©`,
        `ð **Ø§ÙØªÙÙÙØª:** ${formatTicketTime(t.closedAt)}`
      ].join('\n')).setTimestamp()],
      components:closedTicketRows(t.number)
    }).catch(()=>{});
    await safeDM(t.ownerId,{embeds:[embed('ð ØªÙ Ø¥ØºÙØ§Ù Ø§ÙØªØ°ÙØ±Ø©',`#${t.number}\nØ§ÙÙÙØ¹: ${CONFIG.TICKET_TYPES[t.type].label}\nØ§ÙØ³Ø¨Ø¨: Ø¹Ø¯Ù Ø§ÙØªÙØ§Ø¹Ù Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©.`)]});
    await ticketLog('Ø¥ØºÙØ§Ù ØªÙÙØ§Ø¦Ù',`#${t.number}\nØ§ÙØ´Ø®Øµ: <@${t.ownerId}>\nØ§ÙÙÙØ¹: ${CONFIG.TICKET_TYPES[t.type].label}\nØ§ÙØ³Ø¨Ø¨: Ø¹Ø¯Ù Ø§ÙØªÙØ§Ø¹Ù 24 Ø³Ø§Ø¹Ø©\nØ§ÙØªÙÙÙØª: ${formatTicketTime(t.closedAt)}`,0xE74C3C);
  }
}

// Ø£ÙØ± !say Ø¯Ø§Ø®Ù Ø§ÙØªØ°ÙØ±Ø©: Ø§ÙØ£ÙØ± ÙØ®ØªÙÙ ÙØ§ÙØ¨ÙØª ÙØ¨Ø¹Øª Ø§ÙÙØµ
client.on(Events.MessageCreate, async message=>{
  if(!message.guild||message.author.bot) return;
  const t=ticketFromChannel(message.channel.id);
  if(!t) return;
  if(message.author.id===t.ownerId && t.warningDeadline){ t.warningDeadline=0; saveDB(); }
  if(!message.content.startsWith('!say ')) return;
  if(!ticketStaff(message.member,t)) return;
  const body=message.content.slice(5).trim();
  await message.delete().catch(()=>{});
  if(body) await message.channel.send({content:body});
});

async function decisionModal(interaction, accept) {
  if (!hasAnyRole(interaction.member, [...CONFIG.DECISION_REVIEWER_ROLE_IDS, ...CONFIG.CONTROL_ROLE_IDS])) {
    return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  }

  const modal = new ModalBuilder()
    .setCustomId(accept ? 'decision_accept_submit' : 'decision_reject_submit')
    .setTitle(accept ? 'ÙØ¨ÙÙ Ø´Ø®Øµ' : 'Ø±ÙØ¶ Ø´Ø®Øµ');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('user')
        .setLabel('Discord ID Ø§ÙØ®Ø§Øµ Ø¨Ø§ÙØ´Ø®Øµ')
        .setPlaceholder('123456789012345678')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    )
  );

  if (!accept) {
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('reason')
          .setLabel('Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(800)
      )
    );
  }

  await interaction.showModal(modal);
}

async function decisionSubmit(interaction, accept) {
  if (!hasAnyRole(interaction.member, [...CONFIG.DECISION_REVIEWER_ROLE_IDS, ...CONFIG.CONTROL_ROLE_IDS])) {
    return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  }

  const id = extractId(interaction.fields.getTextInputValue('user'));
  const member = id ? await interaction.guild.members.fetch(id).catch(()=>null) : null;

  if (!member) {
    return interaction.reply({content:'â Ø§ÙÙ ID ØºÙØ± ØµØ­ÙØ­ Ø£Ù Ø§ÙØ´Ø®Øµ ÙØ´ ÙÙØ¬ÙØ¯ ÙÙ Ø§ÙØ³ÙØ±ÙØ±.',ephemeral:true});
  }

  const reason = accept ? '' : interaction.fields.getTextInputValue('reason').trim();

  await safeDM(id, {
    embeds:[new EmbedBuilder()
      .setColor(accept ? 0x2ECC71 : 0xE74C3C)
      .setTitle(accept ? 'â ØªÙ ÙØ¨ÙÙÙ' : 'â ØªÙ Ø±ÙØ¶Ù')
      .setDescription(
        accept
          ? ['ââââââââââââââââââââââââââââââââââââââââ','',`ØªÙ ÙØ¨ÙÙÙ ÙÙ **${CONFIG.SERVER_NAME}**.`,'','ââââââââââââââââââââââââââââââââââââââââ'].join('\n')
          : ['ââââââââââââââââââââââââââââââââââââââââ','',`ØªÙ Ø±ÙØ¶Ù ÙÙ **${CONFIG.SERVER_NAME}**.`,'',`ð Ø§ÙØ³Ø¨Ø¨: ${reason}`,'','ââââââââââââââââââââââââââââââââââââââââ'].join('\n')
      )
      .setFooter({ text: CONFIG.SERVER_NAME })
      .setTimestamp()]
  });

  const results = await safeFetchChannel(CONFIG.DECISION_RESULTS_CHANNEL_ID);
  if (results?.isTextBased()) {
    await results.send({
      embeds:[new EmbedBuilder()
        .setColor(accept ? 0x2ECC71 : 0xE74C3C)
        .setTitle(accept ? 'â ÙØ¨ÙÙ' : 'â Ø±ÙØ¶')
        .setDescription([
          'ââââââââââââââââââââââââââââââââââââââââ',
          '',
          `Ø§ÙØ´Ø®Øµ: <@${id}>`,
          '',
          `Ø¨ÙØ§Ø³Ø·Ø©: <@${interaction.user.id}>`,
          ...(reason ? ['', `ð Ø§ÙØ³Ø¨Ø¨: ${reason}`] : []),
          '',
          'ââââââââââââââââââââââââââââââââââââââââ'
        ].join('\n'))
        .setFooter({ text: CONFIG.SERVER_NAME })
        .setTimestamp()]
    });
  }

  await interaction.reply({content:'â ØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙÙØ±Ø§Ø± ÙÙØ´Ø®Øµ ÙÙ Ø§ÙØ®Ø§Øµ.',ephemeral:true});
}

function specialApplicationInfo(kind) {
  if (kind === 'staff') {
    return {
      title: 'ð¡ï¸ ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø© Ghost RP',
      questionTitle: 'ð¡ï¸ ØªÙØ¯ÙÙ Ø§ÙØ¥Ø¯Ø§Ø±Ø©',
      questions: CONFIG.STAFF_APPLICATION_QUESTIONS,
      reviewId: CONFIG.STAFF_APPLICATION_REVIEW_CHANNEL_ID
    };
  }
  if (kind === 'monitoring') {
    return {
      title: 'ðï¸ ØªÙØ¯ÙÙ Ø±ÙØ§Ø¨Ø© Ghost RP',
      questionTitle: 'ðï¸ ØªÙØ¯ÙÙ Ø§ÙØ±ÙØ§Ø¨Ø©',
      questions: CONFIG.MONITORING_APPLICATION_QUESTIONS,
      reviewId: CONFIG.MONITORING_APPLICATION_REVIEW_CHANNEL_ID
    };
  }
  return {
    title: 'ð¥ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ Ghost RP',
    questionTitle: 'ð¥ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ',
    questions: CONFIG.CREATOR_APPLICATION_QUESTIONS,
    reviewId: CONFIG.CREATOR_APPLICATION_REVIEW_CHANNEL_ID
  };
}

async function startSpecialDmApplication(interaction, kind) {
  const info = specialApplicationInfo(kind);

  if (specialDmApplications.has(interaction.user.id)) {
    return interaction.reply({content:'â ï¸ Ø¹ÙØ¯Ù ØªÙØ¯ÙÙ Ø´ØºØ§Ù Ø¨Ø§ÙÙØ¹Ù ÙÙ Ø§ÙØ®Ø§Øµ.', ephemeral:true});
  }

  const dm = await interaction.user.createDM().catch(()=>null);
  if (!dm) {
    return interaction.reply({content:'â Ø§ÙØªØ­ Ø§ÙØ±Ø³Ø§Ø¦Ù Ø§ÙØ®Ø§ØµØ© Ø«Ù Ø­Ø§ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù.', ephemeral:true});
  }

  specialDmApplications.set(interaction.user.id, {
    kind,
    index: 0,
    answers: [],
    platform: null
  });

  await interaction.reply({content:'â ØªÙ Ø¨Ø¯Ø¡ Ø§ÙØªÙØ¯ÙÙ. Ø±Ø§Ø¬Ø¹ Ø§ÙØ®Ø§Øµ.', ephemeral:true});

  await dm.send({
    embeds:[new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(info.title)
      .setDescription([
        'ââââââââââââââââââââââââââââââââ',
        '',
        'Ø³ÙØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙØ£Ø³Ø¦ÙØ© ÙÙ ÙØ§Ø­Ø¯Ø§Ù ÙØ§Ø­Ø¯Ø§Ù.',
        '',
        'ÙÙØ¥ÙØºØ§Ø¡ ÙÙ Ø£Ù ÙÙØª Ø§ÙØªØ¨: `cancel`',
        '',
        'ââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({text:CONFIG.SERVER_NAME})
      .setTimestamp()]
  });

  if (kind === 'creator') {
    await dm.send({
      embeds:[embed('ð¬ ÙÙØ¹ Ø§ÙØ¨Ø±ÙØ§ÙØ¬','Ø§Ø®ØªØ± Ø§ÙÙÙØµØ© Ø§ÙØªÙ ØªØµÙØ¹ Ø¹ÙÙÙØ§ Ø§ÙÙØ­ØªÙÙ:')],
      components:[new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('creator_platform:kick').setLabel('Kick').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('creator_platform:youtube').setLabel('YouTube').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('creator_platform:tiktok').setLabel('TikTok').setStyle(ButtonStyle.Primary)
      )]
    });
    return;
  }

  await sendSpecialDmQuestion(interaction.user.id);
}

async function selectCreatorPlatform(interaction, platform) {
  const state = specialDmApplications.get(interaction.user.id);
  if (!state || state.kind !== 'creator') {
    return interaction.reply({content:'â ï¸ ÙÙÙØ´ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ Ø´ØºØ§Ù Ø­Ø§ÙÙØ§Ù.', ephemeral:true});
  }

  const names = {kick:'Kick', youtube:'YouTube', tiktok:'TikTok'};
  if (!names[platform]) return;

  state.platform = names[platform];
  specialDmApplications.set(interaction.user.id,state);

  await interaction.update({
    embeds:[embed('â ØªÙ Ø§Ø®ØªÙØ§Ø± Ø§ÙØ¨Ø±ÙØ§ÙØ¬',`Ø§ÙØ¨Ø±ÙØ§ÙØ¬: **${names[platform]}**`)],
    components:[]
  });

  await sendSpecialDmQuestion(interaction.user.id);
}

async function sendSpecialDmQuestion(userId) {
  const state = specialDmApplications.get(userId);
  if (!state) return;

  const info = specialApplicationInfo(state.kind);
  const questions = info.questions;

  if (state.index >= questions.length) {
    return finishSpecialDmApplication(userId);
  }

  await safeDM(userId,{
    embeds:[new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(info.questionTitle)
      .setDescription([
        'ââââââââââââââââââââââââââââââââ',
        '',
        `**Ø§ÙØ³Ø¤Ø§Ù ${state.index + 1}/${questions.length}**`,
        '',
        questions[state.index],
        '',
        'ÙÙØ¥ÙØºØ§Ø¡ Ø§ÙØªØ¨: `cancel`',
        '',
        'ââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({text:CONFIG.SERVER_NAME})
    ]
  });
}

async function finishSpecialDmApplication(userId) {
  const state = specialDmApplications.get(userId);
  if (!state) return;

  specialDmApplications.delete(userId);

  const info = specialApplicationInfo(state.kind);
  const review = await safeFetchChannel(info.reviewId);
  const questions = info.questions;

  if (!review?.isTextBased()) {
    await safeDM(userId,{embeds:[embed('â ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ','Ø±ÙÙ ÙØ±Ø§Ø¬Ø¹Ø© Ø§ÙØªÙØ¯ÙÙ ØºÙØ± ÙØ¶Ø¨ÙØ·.',0xE74C3C)]});
    return;
  }

  const applicationId = `${state.kind}-${userId}-${Date.now()}`;
  const data = {
    id:applicationId,
    userId,
    kind:state.kind,
    platform:state.platform || null,
    answers:[...state.answers],
    status:'pending',
    createdAt:Date.now(),
    reviewedBy:null,
    reviewedAt:null,
    rejectionReason:null
  };

  if (state.kind === 'staff') db.staffApplications[applicationId] = data;
  else if (state.kind === 'monitoring') {
    if (!db.monitoringApplications) db.monitoringApplications = {};
    db.monitoringApplications[applicationId] = data;
  } else db.creatorApplications[applicationId] = data;
  saveDB();

  const fields = [];
  if (state.kind === 'creator') fields.push({name:'ð¬ Ø§ÙØ¨Ø±ÙØ§ÙØ¬',value:state.platform || 'ØºÙØ± ÙØ­Ø¯Ø¯'});
  for (let i=0;i<questions.length;i++) {
    fields.push({
      name:`${i+1}. ${questions[i]}`.slice(0,256),
      value:(state.answers[i] || 'Ø¨Ø¯ÙÙ Ø¥Ø¬Ø§Ø¨Ø©').slice(0,1024)
    });
  }

  const chunks=[];
  for(let i=0;i<fields.length;i+=20) chunks.push(fields.slice(i,i+20));

  for(let i=0;i<chunks.length;i++){
    const title =
      state.kind === 'staff' ? 'ð¡ï¸ ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø© Ø¬Ø¯ÙØ¯' :
      state.kind === 'monitoring' ? 'ðï¸ ØªÙØ¯ÙÙ Ø±ÙØ§Ø¨Ø© Ø¬Ø¯ÙØ¯' :
      'ð¥ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ Ø¬Ø¯ÙØ¯';

    const e=new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(title)
      .setDescription(i===0?[
        'ââââââââââââââââââââââââââââââââ','',
        `ð¤ Ø§ÙÙØªÙØ¯Ù: <@${userId}>`,
        `ð Discord ID: \`${userId}\``,
        '','ââââââââââââââââââââââââââââââââ'
      ].join('\n'):`ð ØªÙÙÙØ© Ø¥Ø¬Ø§Ø¨Ø§Øª <@${userId}>`)
      .addFields(chunks[i])
      .setFooter({text:`Application ID: ${applicationId}`})
      .setTimestamp();

    const payload={embeds:[e]};
    if(i===chunks.length-1){
      payload.components=[new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`${state.kind}_accept:${applicationId}`).setLabel('ÙØ¨ÙÙ ÙØ¨Ø¯Ø¦Ù').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`${state.kind}_reject:${applicationId}`).setLabel('Ø±ÙØ¶').setStyle(ButtonStyle.Danger)
      )];
    }
    await review.send(payload);
  }

  await safeDM(userId,{embeds:[embed('â ØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ',`ØªÙ Ø¥Ø±Ø³Ø§Ù ØªÙØ¯ÙÙÙ ÙÙÙØ±Ø§Ø¬Ø¹Ø© ÙÙ **${CONFIG.SERVER_NAME}**.`,0x2ECC71)]});
}

async function simpleApplyModal(interaction,kind) {
  const modal=new ModalBuilder().setCustomId(`${kind}_apply_submit`).setTitle(kind==='staff'?'ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø©':'ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ');
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('age').setLabel('Ø§ÙØ¹ÙØ±').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('experience').setLabel('Ø§ÙØ®Ø¨Ø±Ø©').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Ø³Ø¨Ø¨ Ø§ÙØªÙØ¯ÙÙ').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))
  );
  await interaction.showModal(modal);
}

async function simpleApplySubmit(interaction,kind) {
  const data={id:`${kind}-${interaction.user.id}-${Date.now()}`,userId:interaction.user.id,age:interaction.fields.getTextInputValue('age'),experience:interaction.fields.getTextInputValue('experience'),reason:interaction.fields.getTextInputValue('reason'),status:'pending'};
  const store=kind==='staff'?db.staffApplications:db.creatorApplications;
  store[data.id]=data; saveDB();
  const reviewId=kind==='staff'?CONFIG.STAFF_APPLICATION_REVIEW_CHANNEL_ID:CONFIG.CREATOR_APPLICATION_REVIEW_CHANNEL_ID;
  const ch=await safeFetchChannel(reviewId);
  if(!ch?.isTextBased()) return interaction.reply({content:'â Ø±ÙÙ Ø§ÙÙØ±Ø§Ø¬Ø¹Ø© ØºÙØ± ÙØ¶Ø¨ÙØ·.',ephemeral:true});
  await ch.send({embeds:[embed(kind==='staff'?'ð¡ï¸ ØªÙØ¯ÙÙ Ø¥Ø¯Ø§Ø±Ø©':'ð¥ ØªÙØ¯ÙÙ ØµØ§ÙØ¹ ÙØ­ØªÙÙ',`Ø§ÙÙØªÙØ¯Ù: <@${data.userId}>\nØ§ÙØ¹ÙØ±: ${data.age}\n\nØ§ÙØ®Ø¨Ø±Ø©: ${data.experience}\n\nØ§ÙØ³Ø¨Ø¨: ${data.reason}`)],components:[
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`${kind}_accept:${data.id}`).setLabel('ÙØ¨ÙÙ').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`${kind}_reject:${data.id}`).setLabel('Ø±ÙØ¶').setStyle(ButtonStyle.Danger)
    )
  ]});
  await interaction.reply({content:'â ØªÙ Ø¥Ø±Ø³Ø§Ù Ø§ÙØªÙØ¯ÙÙ.',ephemeral:true});
}

function canReviewSpecialApplication(member) {
  return isReviewer(member) || isControl(member);
}

function applicationStore(kind) {
  if (kind === 'staff') return db.staffApplications;
  if (kind === 'monitoring') {
    if (!db.monitoringApplications) db.monitoringApplications = {};
    return db.monitoringApplications;
  }
  return db.creatorApplications;
}

async function postSecondStageApplication(guild, kind, data) {
  if (!['staff','monitoring'].includes(kind)) return;

  const channelId = kind === 'staff'
    ? CONFIG.STAFF_SECOND_STAGE_CHANNEL_ID
    : CONFIG.MONITORING_SECOND_STAGE_CHANNEL_ID;

  const ch = await safeFetchChannel(channelId);
  if (!ch?.isTextBased()) return;

  await ch.send({
    embeds:[new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(kind === 'staff' ? 'ð¡ï¸ Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ© | Ø§ÙØ¥Ø¯Ø§Ø±Ø©' : 'ðï¸ Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ© | Ø§ÙØ±ÙØ§Ø¨Ø©')
      .setDescription([
        'ââââââââââââââââââââââââââââââââ','',
        `ð¤ Ø§ÙÙØªÙØ¯Ù: <@${data.userId}>`,
        `ð ID: \`${data.userId}\``,
        '',
        'ØªÙ ÙØ¨ÙÙÙ ÙØ¨Ø¯Ø¦ÙØ§Ù. Ø­Ø¯Ø¯ ÙØªÙØ¬Ø© Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©.',
        '','ââââââââââââââââââââââââââââââââ'
      ].join('\n'))
      .setFooter({text:CONFIG.SERVER_NAME})
      .setTimestamp()],
    components:[new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`second_accept:${kind}:${data.id}`).setLabel('ÙØ¨ÙÙ ÙÙØ§Ø¦Ù').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`second_reject:${kind}:${data.id}`).setLabel('Ø±ÙØ¶').setStyle(ButtonStyle.Danger)
    )]
  });
}

async function acceptSpecialApplication(interaction, kind) {
  if (!canReviewSpecialApplication(interaction.member)) {
    return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  }

  const applicationId=interaction.customId.split(':').slice(1).join(':');
  const store=applicationStore(kind);
  const data=store[applicationId];

  if(!data || data.status!=='pending'){
    return interaction.reply({content:'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± ÙÙ ÙØ°Ø§ Ø§ÙØªÙØ¯ÙÙ Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});
  }

  data.status = ['staff','monitoring'].includes(kind) ? 'second_stage' : 'accepted';
  data.reviewedBy=interaction.user.id;
  data.reviewedAt=Date.now();
  saveDB();

  const member=await interaction.guild.members.fetch(data.userId).catch(()=>null);
  if(member){
    if(kind==='staff') await safeAddRole(member,CONFIG.STAFF_PREACCEPTED_ROLE_ID);
    if(kind==='monitoring') await safeAddRole(member,CONFIG.MONITORING_PREACCEPTED_ROLE_ID);
    if(kind==='creator') await safeAddRole(member,CONFIG.CREATOR_ACCEPTED_ROLE_ID);
  }

  if(['staff','monitoring'].includes(kind)){
    await postSecondStageApplication(interaction.guild,kind,data);
    await safeDM(data.userId,{embeds:[embed(
      'â ØªÙ Ø§ÙÙØ¨ÙÙ Ø§ÙÙØ¨Ø¯Ø¦Ù',
      `ØªÙ ÙØ¨ÙÙÙ ÙÙ Ø§ÙØ®Ø·ÙØ© Ø§ÙØ£ÙÙÙ ÙÙ ØªÙØ¯ÙÙ ${kind==='staff'?'Ø§ÙØ¥Ø¯Ø§Ø±Ø©':'Ø§ÙØ±ÙØ§Ø¨Ø©'}.\nØ§ÙØªØ¸Ø± ÙØªÙØ¬Ø© Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©.`,
      0x2ECC71
    )]});
  }else{
    await safeDM(data.userId,{embeds:[embed('â ØªÙ ÙØ¨ÙÙ Ø§ÙØªÙØ¯ÙÙ','ØªÙ ÙØ¨ÙÙÙ ÙØµØ§ÙØ¹ ÙØ­ØªÙÙ ÙØªÙØª Ø¥Ø¶Ø§ÙØ© Ø§ÙØ±ØªØ¨Ø©.',0x2ECC71)]});
  }

  const e=EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0x2ECC71)
    .addFields({name:'Ø§ÙÙØ±Ø§Ø±',value:`â ${['staff','monitoring'].includes(kind)?'ÙØ¨ÙÙ ÙØ¨Ø¯Ø¦Ù - ØªÙ Ø§ÙØ¥Ø±Ø³Ø§Ù ÙÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©':'ÙØ¨ÙÙ'} Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`});

  await interaction.update({embeds:[e],components:[]});
}

async function openSpecialRejectModal(interaction,kind){
  if(!canReviewSpecialApplication(interaction.member)) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  const applicationId=interaction.customId.split(':').slice(1).join(':');
  const data=applicationStore(kind)[applicationId];
  if(!data || data.status!=='pending') return interaction.reply({content:'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});

  const modal=new ModalBuilder().setCustomId(`${kind}_reject_submit:${applicationId}`).setTitle('Ø±ÙØ¶ Ø§ÙØªÙØ¯ÙÙ');
  modal.addComponents(new ActionRowBuilder().addComponents(
    new TextInputBuilder().setCustomId('reason').setLabel('Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(800)
  ));
  await interaction.showModal(modal);
}

async function rejectSpecialApplication(interaction,kind){
  if(!canReviewSpecialApplication(interaction.member)) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  const applicationId=interaction.customId.split(':').slice(1).join(':');
  const data=applicationStore(kind)[applicationId];
  const reason=interaction.fields.getTextInputValue('reason').trim();
  if(!data || data.status!=='pending') return interaction.reply({content:'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});

  data.status='rejected'; data.reviewedBy=interaction.user.id; data.reviewedAt=Date.now(); data.rejectionReason=reason; saveDB();
  await safeDM(data.userId,{embeds:[embed('â ØªÙ Ø±ÙØ¶ Ø§ÙØªÙØ¯ÙÙ',`ð Ø§ÙØ³Ø¨Ø¨: ${reason}`,0xE74C3C)]});

  const e=EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C).addFields(
    {name:'Ø§ÙÙØ±Ø§Ø±',value:`â ØªÙ Ø§ÙØ±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`},
    {name:'Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶',value:reason.slice(0,1024)}
  );
  await interaction.update({embeds:[e],components:[]});
}

async function secondStageDecision(interaction,kind,accept){
  if(!canReviewSpecialApplication(interaction.member)) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  const applicationId=interaction.customId.split(':').slice(2).join(':');
  const data=applicationStore(kind)[applicationId];
  if(!data || data.status!=='second_stage') return interaction.reply({content:'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ© Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});

  if(!accept){
    const modal=new ModalBuilder().setCustomId(`second_reject_submit:${kind}:${applicationId}`).setTitle('Ø±ÙØ¶ Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('reason').setLabel('Ø³Ø¨Ø¨ Ø§ÙØ±ÙØ¶').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(800)
    ));
    return interaction.showModal(modal);
  }

  data.status='accepted'; data.finalReviewedBy=interaction.user.id; data.finalReviewedAt=Date.now(); saveDB();
  const member=await interaction.guild.members.fetch(data.userId).catch(()=>null);
  if(member){
    await safeAddRole(member,kind==='staff'?CONFIG.STAFF_FINAL_ACCEPTED_ROLE_ID:CONFIG.MONITORING_FINAL_ACCEPTED_ROLE_ID);
  }
  await safeDM(data.userId,{embeds:[embed('â ØªÙ Ø§ÙÙØ¨ÙÙ Ø§ÙÙÙØ§Ø¦Ù',`ØªÙ ÙØ¨ÙÙÙ ÙÙØ§Ø¦ÙØ§Ù ÙÙ ${kind==='staff'?'Ø§ÙØ¥Ø¯Ø§Ø±Ø©':'Ø§ÙØ±ÙØ§Ø¨Ø©'} ÙÙ **${CONFIG.SERVER_NAME}**.`,0x2ECC71)]});
  const e=EmbedBuilder.from(interaction.message.embeds[0]).setColor(0x2ECC71).addFields({name:'ÙØªÙØ¬Ø© Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©',value:`â ÙØ¨ÙÙ ÙÙØ§Ø¦Ù Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`});
  await interaction.update({embeds:[e],components:[]});
}

async function secondStageRejectSubmit(interaction,kind){
  if(!canReviewSpecialApplication(interaction.member)) return interaction.reply({content:'â ÙÙØ³ ÙØ¯ÙÙ ØµÙØ§Ø­ÙØ©.',ephemeral:true});
  const applicationId=interaction.customId.split(':').slice(2).join(':');
  const data=applicationStore(kind)[applicationId];
  const reason=interaction.fields.getTextInputValue('reason').trim();
  if(!data || data.status!=='second_stage') return interaction.reply({content:'â ï¸ ØªÙ Ø§ØªØ®Ø§Ø° ÙØ±Ø§Ø± Ø¨Ø§ÙÙØ¹Ù.',ephemeral:true});

  data.status='rejected_second_stage'; data.finalReviewedBy=interaction.user.id; data.finalReviewedAt=Date.now(); data.rejectionReason=reason; saveDB();
  await safeDM(data.userId,{embeds:[embed('â ÙÙ ÙØªÙ Ø§ÙÙØ¨ÙÙ ÙÙ Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©',`ð Ø§ÙØ³Ø¨Ø¨: ${reason}`,0xE74C3C)]});
  const e=EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C).addFields(
    {name:'ÙØªÙØ¬Ø© Ø§ÙØ®Ø·ÙØ© Ø§ÙØ«Ø§ÙÙØ©',value:`â Ø±ÙØ¶ Ø¨ÙØ§Ø³Ø·Ø© <@${interaction.user.id}>`},
    {name:'Ø§ÙØ³Ø¨Ø¨',value:reason.slice(0,1024)}
  );
  await interaction.update({embeds:[e],components:[]});
}

async function botSendModal(interaction) {
  if(!isControl(interaction.member)) return interaction.reply({content:'â Ø§ÙØ¥Ø¯Ø§Ø±Ø© Ø§ÙØ¹ÙÙØ§ ÙÙØ·.',ephemeral:true});
  const modal=new ModalBuilder().setCustomId('bot_send_submit').setTitle('Ø¥Ø±Ø³Ø§Ù Ø¹Ù Ø·Ø±ÙÙ Ø§ÙØ¨ÙØª');
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('channel').setLabel('ÙÙØ´Ù Ø§ÙØ§ØªØ´Ø§ÙÙ Ø£Ù Channel ID').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('message').setLabel('Ø§ÙØ±Ø³Ø§ÙØ©').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(2000))
  );
  await interaction.showModal(modal);
}

async function botSendSubmit(interaction) {
  const id=extractId(interaction.fields.getTextInputValue('channel'));
  const ch=await safeFetchChannel(id);
  if(!ch?.isTextBased()) return interaction.reply({content:'â Ø§ÙØ§ØªØ´Ø§ÙÙ ØºÙØ± ØµØ­ÙØ­.',ephemeral:true});
  await ch.send({content:interaction.fields.getTextInputValue('message')});
  await interaction.reply({content:'â ØªÙ Ø§ÙØ¥Ø±Ø³Ø§Ù.',ephemeral:true});
}

async function toggleSystem(interaction,name) {
  if(!isControl(interaction.member)) return interaction.reply({content:'â Ø§ÙØ¥Ø¯Ø§Ø±Ø© Ø§ÙØ¹ÙÙØ§ ÙÙØ·.',ephemeral:true});
  db.systems[name]=!db.systems[name]; saveDB();
  await interaction.reply({content:`${db.systems[name]?'â ØªÙ ØªØ´ØºÙÙ':'â ØªÙ Ø¥ÙÙØ§Ù'} **${name}**.`,ephemeral:true});
}

client.on(Events.InteractionCreate,async interaction=>{
  try{
    if(interaction.isButton()){
      const id=interaction.customId;
      if(id.startsWith('ticket_type:')) return choosePriority(interaction,id.split(':')[1]);
      if(id.startsWith('ticket_priority:')){const [,t,p]=id.split(':');return ticketProblemModal(interaction,t,p);}
      if(id.startsWith('ticket_claim:')){const t=db.tickets[id.split(':')[1]];if(!ticketManagementStaff(interaction.member,t))return interaction.reply({content:'â ÙÙØ¥Ø¯Ø§Ø±Ø© ÙÙØ·.',ephemeral:true});if(!t.claimedBy.includes(interaction.user.id))t.claimedBy.push(interaction.user.id);saveDB();return interaction.reply({content:`â Ø§Ø³ØªÙÙ Ø§ÙØªØ°ÙØ±Ø© <@${interaction.user.id}>.`});}
      if(id.startsWith('ticket_add_user:')) return ticketMemberModal(interaction,db.tickets[id.split(':')[1]],false);
      if(id.startsWith('ticket_add_staff:')) return ticketMemberModal(interaction,db.tickets[id.split(':')[1]],true);
      if(id.startsWith('ticket_warn:')) return warnTicket24(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_close:')) return ticketCloseModal(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_reopen:')) return reopenTicketNow(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_copy:')) return saveClosedTicket(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_save:')) return saveClosedTicket(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_delete:')){const t=db.tickets[id.split(':')[1]];if(!closedTicketActionStaff(interaction.member))return interaction.reply({content:'â Ø§ÙØ±ÙÙØ§Øª Ø§ÙØ«ÙØ§Ø«Ø© Ø§ÙÙØ­Ø¯Ø¯Ø© ÙÙØ·.',ephemeral:true});if(!t||t.status!=='closed')return interaction.reply({content:'â ï¸ ÙØ§Ø²Ù Ø§ÙØªØ°ÙØ±Ø© ØªÙÙÙ ÙØºÙÙØ© Ø§ÙØ£ÙÙ.',ephemeral:true});await interaction.reply({content:'ðï¸ Ø³ÙØªÙ ÙØ³Ø­ Ø§ÙØªØ°ÙØ±Ø© Ø®ÙØ§Ù 5 Ø«ÙØ§ÙÙ.'});t.status='deleted';t.deletedBy=interaction.user.id;t.deletedAt=Date.now();saveDB();await ticketLog('ðï¸ ÙØ³Ø­ ØªØ°ÙØ±Ø©',`#${t.number}\nØ§ÙØ´Ø®Øµ: <@${t.ownerId}>\nØ¨ÙØ§Ø³Ø·Ø©: <@${interaction.user.id}>\nØ§ÙØªÙÙÙØª: ${formatTicketTime(t.deletedAt)}`,0xE74C3C);return setTimeout(()=>interaction.channel.delete().catch(()=>{}),5000);}
      if(id.startsWith('ticket_rate:')){const [,num,stars]=id.split(':');const modal=new ModalBuilder().setCustomId(`ticket_rating_submit:${num}:${stars}`).setTitle(`ØªÙÙÙÙ ${stars}/5`);modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Ø³Ø¨Ø¨ Ø§ÙØªÙÙÙÙ').setStyle(TextInputStyle.Paragraph).setRequired(true)));return interaction.showModal(modal);}
      if(id.startsWith('sys:')) return toggleSystem(interaction,id.split(':')[1]);
      if(id==='sys_status'){if(!isControl(interaction.member))return interaction.reply({content:'â Ø§ÙØ¥Ø¯Ø§Ø±Ø© Ø§ÙØ¹ÙÙØ§ ÙÙØ·.',ephemeral:true});return interaction.reply({embeds:[embed('ð Ø­Ø§ÙØ© Ø§ÙØ£ÙØ¸ÙØ©',Object.entries(db.systems).map(([k,v])=>`${v?'â':'â'} ${k}`).join('\n'))],ephemeral:true});}
      if(id==='bot_send') return botSendModal(interaction);
      if(id==='decision_accept') return decisionModal(interaction,true);
      if(id==='decision_reject') return decisionModal(interaction,false);
      if(id.startsWith('creator_platform:')) return selectCreatorPlatform(interaction,id.split(':')[1]);
      if(id==='staff_apply') return startSpecialDmApplication(interaction,'staff');
      if(id==='monitoring_apply') return startSpecialDmApplication(interaction,'monitoring');
      if(id==='creator_apply') return startSpecialDmApplication(interaction,'creator');
      if(id.startsWith('staff_accept:')) return acceptSpecialApplication(interaction,'staff');
      if(id.startsWith('staff_reject:')) return openSpecialRejectModal(interaction,'staff');
      if(id.startsWith('monitoring_accept:')) return acceptSpecialApplication(interaction,'monitoring');
      if(id.startsWith('monitoring_reject:')) return openSpecialRejectModal(interaction,'monitoring');
      if(id.startsWith('second_accept:')){const [,kind]=id.split(':');return secondStageDecision(interaction,kind,true);}
      if(id.startsWith('second_reject:')){const [,kind]=id.split(':');return secondStageDecision(interaction,kind,false);}
      if(id.startsWith('creator_accept:')) return acceptSpecialApplication(interaction,'creator');
      if(id.startsWith('creator_reject:')) return openSpecialRejectModal(interaction,'creator');
    }
    if(interaction.isModalSubmit()){
      const id=interaction.customId;
      if(id.startsWith('ticket_create:')){const [,t,p]=id.split(':');return createTicket(interaction,t,p);}
      if(id.startsWith('ticket_user_submit:')) return addTicketMember(interaction,db.tickets[id.split(':')[1]],false);
      if(id.startsWith('ticket_staff_submit:')) return addTicketMember(interaction,db.tickets[id.split(':')[1]],true);
      if(id.startsWith('ticket_close_submit:')){const num=id.split(':')[1];return closeTicketNow(interaction,db.tickets[num],interaction.fields.getTextInputValue('reason').trim());}
      if(id.startsWith('ticket_rating_submit:')){const [,num,stars]=id.split(':');const t=db.tickets[num];if(!t||t.ownerId!==interaction.user.id)return interaction.reply({content:'â ØºÙØ± ÙØ³ÙÙØ­.',ephemeral:true});const reason=interaction.fields.getTextInputValue('reason');db.ticketRatings.push({num,userId:interaction.user.id,type:t.type,stars:Number(stars),reason,at:Date.now()});saveDB();const ch=await safeFetchChannel(CONFIG.TICKET_RATING_CHANNEL_ID);if(ch?.isTextBased())await ch.send({embeds:[embed('â­ ØªÙÙÙÙ ØªØ°ÙØ±Ø©',`#${num} | ${CONFIG.TICKET_TYPES[t.type].label}\n<@${interaction.user.id}>\n${'â­'.repeat(Number(stars))}\nØ§ÙØ³Ø¨Ø¨: ${reason}`)]});return interaction.reply({content:'â Ø´ÙØ±Ø§Ù Ø¹ÙÙ Ø§ÙØªÙÙÙÙ.',ephemeral:true});}
      if(id==='decision_accept_submit') return decisionSubmit(interaction,true);
      if(id==='decision_reject_submit') return decisionSubmit(interaction,false);
      if(id.startsWith('staff_reject_submit:')) return rejectSpecialApplication(interaction,'staff');
      if(id.startsWith('monitoring_reject_submit:')) return rejectSpecialApplication(interaction,'monitoring');
      if(id.startsWith('second_reject_submit:')){const [,kind]=id.split(':');return secondStageRejectSubmit(interaction,kind);}
      if(id.startsWith('creator_reject_submit:')) return rejectSpecialApplication(interaction,'creator');
      if(id==='bot_send_submit') return botSendSubmit(interaction);
    }
  }catch(err){console.error('Advanced system error:',err);if(interaction.isRepliable()&&!interaction.replied&&!interaction.deferred)await interaction.reply({content:'â Ø­ØµÙ Ø®Ø·Ø£.',ephemeral:true}).catch(()=>{});}
});


// ==========================================================
// ERROR HANDLING
// ==========================================================
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});

if (!CONFIG.TOKEN) {
  console.error('DISCORD_TO
