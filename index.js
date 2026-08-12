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
  StreamType
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
  COLOR: 0x1687FF,
  WELCOME_BANNER_URL: 'https://cdn.discordapp.com/attachments/1535772685337100431/1536106506506862743/ChatGPT_Image_Aug_9_2026_06_54_02_PM.png',


  // ---------- Rejection Roles ----------
  FIRST_REJECTION_ROLE_ID: '1535767418574602300',

  // ---------- Ticket System ----------
  TICKET_PANEL_CHANNEL_ID: '1536034090082369628',
  TICKET_LOG_CHANNEL_ID: '1536345331736776764',
  TICKET_RATING_CHANNEL_ID: '1536345751947313202',

  // فقط الرولين دول يقدروا يستخدموا أوامر إدارة التذكرة الحساسة
  TICKET_TEAM_ROLE_ID: '1535755153838313542',
  TICKET_MANAGER_ROLE_ID: '1535755234989572226',

  // مستخدمة لعرض/دخول التذاكر كصلاحيات عامة
  TICKET_ADMIN_ROLE_IDS: [
    '1535755153838313542',
    '1535755234989572226'
  ],

  TICKET_TYPES: {
    support: {
      label: 'الدعم الفني', emoji: '🎧',
      categoryId: '1536126952618983535',
      teamRoleIds: ['PUT_SUPPORT_TEAM_ROLE_ID'],
      normalChannelId: '1536824749471301662',
      importantChannelId: '1536824777979985940',
      urgentChannelId: '1536824248553705472'
    },
    monitoring: {
      label: 'الرقابة', emoji: '👁️',
      categoryId: '1536348218659438663',
      teamRoleIds: ['PUT_MONITORING_TEAM_ROLE_ID'],
      normalChannelId: '1536845236225974363',
      importantChannelId: '1536845265971978390',
      urgentChannelId: '1536845288738652191'
    },
    player_complaint: {
      label: 'شكوى ضد لاعب', emoji: '⚠️',
      categoryId: '1536348415494070352',
      teamRoleIds: ['PUT_COMPLAINT_TEAM_ROLE_ID'],
      normalChannelId: '1536845484126371861',
      importantChannelId: '1536845508981555313',
      urgentChannelId: '1536845528946450472'
    },
    appeal: {
      label: 'استئناف', emoji: '🔄',
      categoryId: '1536142385795563662',
      teamRoleIds: ['PUT_APPEAL_TEAM_ROLE_ID'],
      normalChannelId: '1536845709104390225',
      importantChannelId: '1536845727773499444',
      urgentChannelId: '1536845754390413484'
    },
    staff_complaint: {
      label: 'شكوى ضد إداري', emoji: '🚔',
      categoryId: '1536348677268971560',
      teamRoleIds: ['PUT_STAFF_COMPLAINT_TEAM_ROLE_ID'],
      normalChannelId: '1536845900767563888',
      importantChannelId: '1536845924582686860',
      urgentChannelId: '1536845947903025222'
    },
    store: {
      label: 'المتجر', emoji: '🛒',
      categoryId: '1536144785986027521',
      teamRoleIds: ['PUT_STORE_TEAM_ROLE_ID'],
      normalChannelId: '1536846114223816705',
      importantChannelId: '1536846128010502154',
      urgentChannelId: '1536846147983908956'
    },
    compensation: {
      label: 'التعويضات', emoji: '💰',
      categoryId: '1536348299588800592',
      teamRoleIds: ['PUT_COMPENSATION_TEAM_ROLE_ID'],
      normalChannelId: '1536846371829579787',
      importantChannelId: '1536846387860480040',
      urgentChannelId: '1536846411390525520'
    },
    bug: {
      label: 'الإبلاغ عن الأخطاء', emoji: '🐞',
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

  // ---------- Activation decisions ----------
  ACTIVATION_PANEL_CHANNEL_ID: 'PUT_ACTIVATION_PANEL_CHANNEL_ID',
  ACTIVATION_RESULTS_CHANNEL_ID: 'PUT_ACTIVATION_RESULTS_CHANNEL_ID',
  ACTIVATION_ACCEPTED_ROLE_ID: 'PUT_ACTIVATION_ACCEPTED_ROLE_ID',
  ACTIVATION_REVIEWER_ROLE_IDS: [
    'PUT_ACTIVATION_REVIEWER_ROLE_ID'
  ],

  // ---------- Staff / Creator applications ----------
  STAFF_APPLICATION_PANEL_CHANNEL_ID: '1537184130096300062',
  STAFF_APPLICATION_REVIEW_CHANNEL_ID: '1537185220497776710',
  STAFF_PREACCEPTED_ROLE_ID: '1535798962462658651',
  STAFF_INTERVIEW_SCHEDULE_CHANNEL_ID: '1535794320668491807',

  CREATOR_APPLICATION_PANEL_CHANNEL_ID: '1537184038039588895',
  CREATOR_APPLICATION_REVIEW_CHANNEL_ID: '1537186507977261076',
  CREATOR_ACCEPTED_ROLE_ID: '1535770270688874587',

  // ---------- Application ----------
  APPLICATION_QUESTIONS: [
    'ما اسمك؟',
    'كم عمرك؟',
    'ما هو الـ ID الخاص بك في FiveM إن وجد؟',
    'ما خبرتك في الـ Roleplay؟',
    'اشرح لنا معنى RDM.',
    'اشرح لنا معنى VDM.',
    'اشرح لنا معنى NLR.',
    'اشرح لنا معنى Power Gaming.',
    'اشرح لنا معنى Meta Gaming.',
    'لماذا تريد الانضمام إلى Ghost RP؟'
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
    'مرحبا بك في الدعم الفني الخاص بجوست آر بي. يرجى الانتظار قليلا.'
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
  await connectSupportVoice();

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
          'يمكنك التقديم الآن ✅',
          `انتهت مدة منع التقديم في **${CONFIG.SERVER_NAME}** ويمكنك التقديم من جديد.`,
          0x2ECC71
        )
      ]
    });

    await sendLog(
      'انتهاء منع التقديم',
      `<@${userId}> انتهى منعه الأسبوعي وتم تصفير عدد مرات الرفض.`,
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
      .setLabel('التقديم')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await channel.send({
    embeds: [
      embed(
        `${CONFIG.SERVER_NAME} | نظام التقديم`,
        [
          '👻 أهلاً بك في نظام تقديم **Ghost RP**',
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '',
          '📝 اضغط على زر **التقديم** بالأسفل لبدء طلبك.',
          '',
          '📩 سيتم إرسال الأسئلة لك في الخاص سؤالاً بعد سؤال.',
          '',
          '❌ يمكنك إلغاء التقديم في أي وقت بكتابة: `cancel`',
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
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
  if (db.systems?.applications === false) return interaction.reply({content:'⛔ التقديمات متوقفة حالياً.', ephemeral:true});
  const userId = interaction.user.id;
  const rec = getUserRecord(userId);
  const now = Date.now();

  // لو الإدارة شالت رول الرفض الثاني يدويًا، يقدر يقدم فورًا.
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
        `❌ أنت ممنوع من التقديم بسبب رفضك مرتين.\n` +
        `يمكنك التقديم مرة أخرى <t:${unix}:R>.`,
      ephemeral: true
    });
  }

  const existingPendingReview = Object.values(db.applications).some(
    app => app.userId === userId && app.status === 'pending'
  );

  if (rec.activeApplication || db.pendingApplications[userId] || existingPendingReview) {
    return interaction.reply({
      content: '⚠️ لديك تقديم مفتوح بالفعل.',
      ephemeral: true
    });
  }

  let dm;
  try {
    dm = await interaction.user.createDM();
    await dm.send({
      embeds: [
        embed(
          `${CONFIG.SERVER_NAME} | بدء التقديم`,
          [
            '👋 أهلاً وسهلاً بك في **Ghost RP**',
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '',
            '📝 سيتم إرسال أسئلة التقديم لك سؤالاً بعد سؤال.',
            '',
            '📌 جاوب على كل سؤال بوضوح حتى ينتقل البوت للسؤال التالي.',
            '',
            '❌ لو حابب تلغي التقديم اكتب:',
            '`cancel`',
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
          ].join('\n')
        )
      ]
    });
  } catch {
    return interaction.reply({
      content:
        '❌ لا أستطيع إرسال رسالة خاصة لك. فعّل الرسائل الخاصة من أعضاء السيرفر ثم حاول مرة أخرى.',
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
    content: '✅ بدأ التقديم. راجع الخاص.',
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
        `${CONFIG.SERVER_NAME} | التقديم`,
        [
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '',
          `📌 **السؤال ${state.index + 1} من ${CONFIG.APPLICATION_QUESTIONS.length}**`,
          '',
          `❓ ${question}`,
          '',
          `📊 التقدم: **${state.index + 1}/${CONFIG.APPLICATION_QUESTIONS.length}**`,
          '',
          '❌ للإلغاء اكتب: `cancel`',
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
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
          'تم إلغاء التقديم',
          [
            '❌ تم إلغاء تقديمك بنجاح.',
            '',
            'يمكنك بدء تقديم جديد في أي وقت من روم التقديم.',
            '',
            '👻 **Ghost RP**'
          ].join('\n')
        )
      ]
    });

    return true;
  }

  if (!answer) {
    await message.reply('❌ اكتب إجابة قبل الانتقال للسؤال التالي.');
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
          'تعذر إرسال التقديم ❌',
          [
            '❌ حصل خطأ أثناء إرسال التقديم للإدارة.',
            '',
            'يرجى التواصل مع الإدارة أو المحاولة مرة أخرى بعد قليل.',
            '',
            '👻 **Ghost RP**'
          ].join('\n')
        )
      ]
    });

    await sendLog(
      'خطأ في التقديم',
      `تعذر إرسال تقديم <@${userId}> إلى روم المراجعة.`,
      0xE74C3C
    );

    return true;
  }

  await message.reply({
    embeds: [
      embed(
        'تم إرسال التقديم ✅',
        [
          `✅ تم إرسال تقديمك إلى إدارة **${CONFIG.SERVER_NAME}** بنجاح.`,
          '',
          '📋 التقديم الآن تحت المراجعة.',
          '',
          '📩 سيتم إرسال نتيجة القبول أو الرفض لك في الخاص.',
          '',
          'شكراً لتقديمك معنا 👻'
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
    value: answer.slice(0, 1024) || 'بدون إجابة'
  }));

  const reviewEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLOR)
    .setTitle(`${CONFIG.SERVER_NAME} | تقديم جديد`)
    .setDescription(`**المتقدم:** <@${app.userId}>\n**Discord ID:** \`${app.userId}\``)
    .addFields(fields.slice(0, 25))
    .setFooter({ text: `Application ID: ${applicationId}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`app_accept:${applicationId}`)
      .setLabel('قبول')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`app_reject:${applicationId}`)
      .setLabel('رفض')
      .setEmoji('❌')
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

  // DMs for application answers.
  if (message.channel.type === ChannelType.DM) {
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
        content: '❌ حصل خطأ غير متوقع. حاول مرة أخرى.',
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
      content: '❌ ليس لديك صلاحية قبول أو رفض التقديمات.',
      ephemeral: true
    });
  }

  const applicationId = interaction.customId.slice('app_accept:'.length);
  const app = db.applications[applicationId];

  if (!app || app.status !== 'pending') {
    return interaction.reply({
      content: '⚠️ تم اتخاذ قرار في هذا التقديم بالفعل.',
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
        'تم قبولك ✅',
        [
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '🎉 **مبروك! تم قبولك بنجاح**',
          '',
          `✅ تم قبول تقديمك في **${CONFIG.SERVER_NAME}**.`,
          '',
          '🎖️ تمت إضافة رتبة القبول الخاصة بك.',
          '',
          '📌 تأكد من قراءة القوانين قبل بدء اللعب.',
          '',
          'نتمنى لك تجربة ممتعة معنا 👻',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        ].join('\n'),
        0x2ECC71
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0x2ECC71)
    .addFields({
      name: 'النتيجة',
      value: `✅ تم القبول بواسطة <@${interaction.user.id}>`
    });

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'قبول تقديم',
    `**المتقدم:** <@${app.userId}>\n**تم القبول بواسطة:** <@${interaction.user.id}>`,
    0x2ECC71
  );
}

async function openRejectModal(interaction, type) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: '❌ ليس لديك صلاحية قبول أو رفض.',
      ephemeral: true
    });
  }

  const targetId = interaction.customId.split(':').slice(1).join(':');

  if (type === 'application') {
    const app = db.applications[targetId];
    if (!app || app.status !== 'pending') {
      return interaction.reply({
        content: '⚠️ تم اتخاذ قرار في هذا التقديم بالفعل.',
        ephemeral: true
      });
    }
  }

  if (type === 'video') {
    const video = db.videos[targetId];
    if (!video || video.status !== 'pending') {
      return interaction.reply({
        content: '⚠️ تم اتخاذ قرار في هذا الفيديو بالفعل.',
        ephemeral: true
      });
    }
  }

  const modal = new ModalBuilder()
    .setCustomId(`reject_${type}:${targetId}`)
    .setTitle(type === 'application' ? 'سبب رفض التقديم' : 'سبب رفض الفيديو');

  const reason = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('اكتب سبب الرفض')
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
      content: '❌ ليس لديك صلاحية.',
      ephemeral: true
    });
  }

  const applicationId = interaction.customId.slice('reject_application:'.length);
  const app = db.applications[applicationId];
  const reason = interaction.fields.getTextInputValue('reason').trim();

  if (!app || app.status !== 'pending') {
    return interaction.reply({
      content: '⚠️ تم اتخاذ قرار في هذا التقديم بالفعل.',
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
    blockText = '\n⚠️ الرفض الأول.';
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
      `\n⛔ الرفض الثاني. يمكنك التقديم مرة أخرى <t:${Math.floor(blockedUntil / 1000)}:R>.`;
  }

  app.status = 'rejected';
  saveDB();

  await safeDM(app.userId, {
    embeds: [
      embed(
        'تم رفض تقديمك ❌',
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', `📌 السبب: ${reason}`, blockText, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'].filter(Boolean).join('\n'),
        0xE74C3C
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0xE74C3C)
    .addFields(
      {
        name: 'النتيجة',
        value: `❌ تم الرفض بواسطة <@${interaction.user.id}>`
      },
      {
        name: 'سبب الرفض',
        value: reason.slice(0, 1024)
      },
      {
        name: 'عدد مرات الرفض',
        value: `${rec.rejectionCount}`
      }
    );

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'رفض تقديم',
    [
      `**المتقدم:** <@${app.userId}>`,
      `**تم الرفض بواسطة:** <@${interaction.user.id}>`,
      `**السبب:** ${reason}`,
      `**عدد مرات الرفض:** ${rec.rejectionCount}`,
      blockedUntil
        ? `**منع التقديم حتى:** <t:${Math.floor(blockedUntil / 1000)}:F>`
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
      .setLabel('قبول')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`video_reject:${message.id}`)
      .setLabel('رفض')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );

  const reply = await message.reply({
    embeds: [
      embed(
        `${CONFIG.SERVER_NAME} | مراجعة الفيديو`,
        [
          `👤 **صاحب الفيديو:** <@${message.author.id}>`,
          '',
          '🎥 تم استلام الفيديو بنجاح.',
          '',
          '⏳ **الحالة:** في انتظار مراجعة الإدارة.',
          '',
          'سيظهر قرار القبول أو الرفض هنا.'
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
      content: '❌ ليس لديك صلاحية قبول أو رفض الفيديوهات.',
      ephemeral: true
    });
  }

  const messageId = interaction.customId.slice('video_accept:'.length);
  const video = db.videos[messageId];

  if (!video || video.status !== 'pending') {
    return interaction.reply({
      content: '⚠️ تم اتخاذ قرار في هذا الفيديو بالفعل.',
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
        'تم قبول الفيديو ✅',
        [
          '✅ **تم قبول الفيديو الخاص بك**',
          '',
          `تم قبول الفيديو في **${CONFIG.SERVER_NAME}** بنجاح.`,
          '',
          '🎖️ تمت إضافة الرتبة الخاصة بك.',
          '',
          'شكراً لمشاركتك معنا 👻'
        ].join('\n'),
        0x2ECC71
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0x2ECC71)
    .setDescription(`**صاحب الفيديو:** <@${video.userId}>`)
    .addFields({
      name: 'النتيجة',
      value: `✅ تم القبول بواسطة <@${interaction.user.id}>`
    });

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'قبول فيديو',
    `**صاحب الفيديو:** <@${video.userId}>\n**تم القبول بواسطة:** <@${interaction.user.id}>`,
    0x2ECC71
  );
}

async function rejectVideo(interaction) {
  if (!interaction.guild || !isReviewer(interaction.member)) {
    return interaction.reply({
      content: '❌ ليس لديك صلاحية.',
      ephemeral: true
    });
  }

  const messageId = interaction.customId.slice('reject_video:'.length);
  const video = db.videos[messageId];
  const reason = interaction.fields.getTextInputValue('reason').trim();

  if (!video || video.status !== 'pending') {
    return interaction.reply({
      content: '⚠️ تم اتخاذ قرار في هذا الفيديو بالفعل.',
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
        'تم رفض الفيديو ❌',
        [
          '❌ **تم رفض الفيديو الخاص بك**',
          '',
          `تم رفض الفيديو في **${CONFIG.SERVER_NAME}**.`,
          '',
          `📌 **سبب الرفض:** ${reason}`,
          '',
          'يمكنك تعديل المطلوب والمحاولة مرة أخرى.'
        ].join('\n'),
        0xE74C3C
      )
    ]
  });

  const doneEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(0xE74C3C)
    .setDescription(`**صاحب الفيديو:** <@${video.userId}>`)
    .addFields(
      {
        name: 'النتيجة',
        value: `❌ تم الرفض بواسطة <@${interaction.user.id}>`
      },
      {
        name: 'سبب الرفض',
        value: reason.slice(0, 1024)
      }
    );

  await interaction.update({
    embeds: [doneEmbed],
    components: []
  });

  await sendLog(
    'رفض فيديو',
    `**صاحب الفيديو:** <@${video.userId}>\n**تم الرفض بواسطة:** <@${interaction.user.id}>\n**السبب:** ${reason}`,
    0xE74C3C
  );
}

// ==========================================================
// WELCOME + AUTO ROLE
// ==========================================================
client.on(Events.GuildMemberAdd, async member => {
  if (db.systems?.welcome === false) return;
  await safeAddRole(member, CONFIG.DEFAULT_MEMBER_ROLE_ID);

  const ch = await safeFetchChannel(CONFIG.WELCOME_CHANNEL_ID);

  if (ch?.isTextBased()) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('القوانين')
        .setEmoji('📜')
        .setStyle(ButtonStyle.Link)
        .setURL(channelUrl(CONFIG.RULES_CHANNEL_ID)),

      new ButtonBuilder()
        .setLabel('التقديم')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Link)
        .setURL(channelUrl(CONFIG.APPLICATION_PANEL_CHANNEL_ID)),

      new ButtonBuilder()
        .setCustomId('welcome_rating')
        .setLabel('التقييم')
        .setEmoji('⭐')
        .setStyle(ButtonStyle.Primary)
    );

    const welcomeEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLOR)
      .setTitle(`👻 مرحباً بك في ${CONFIG.SERVER_NAME}`)
      .setDescription(
        [
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '',
          `🎉 أهلاً وسهلاً بك يا <@${member.id}>`,
          '',
          `أنت الآن عضو جديد في **${CONFIG.SERVER_NAME}**.`,
          '',
          '📜 اقرأ القوانين جيداً قبل البدء.',
          '',
          '📝 لو حابب تقدم، اضغط على زر **التقديم** بالأسفل.',
          '',
          '⭐ تقدر كمان تبعت تقييمك للسيرفر من زر **التقييم**.',
          '',
          '💙 نتمنى لك وقت ممتع وتجربة Roleplay قوية معنا.',
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        ].join('\n')
      )
      .setImage(CONFIG.WELCOME_BANNER_URL)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `${CONFIG.SERVER_NAME} • Welcome` })
      .setTimestamp();

    await ch.send({
      content: `<@${member.id}>`,
      embeds: [welcomeEmbed],
      components: [row]
    }).catch(() => {});
  }

  await sendLog(
    'عضو جديد',
    [
      `👤 **العضو:** <@${member.id}>`,
      '',
      '✅ دخل السيرفر وتم إعطاؤه الرتبة الافتراضية.',
      '',
      `🆔 **ID:** \`${member.id}\``
    ].join('\n'),
    0x2ECC71
  );
});

client.on(Events.GuildMemberRemove, async member => {
  await sendLog(
    'خروج عضو',
    `👤 **العضو:** <@${member.id}>\n\n🚪 خرج من السيرفر.\n\n🆔 **ID:** \`${member.id}\``,
    0xE67E22
  );
});

// ==========================================================
// RATINGS
// ==========================================================
async function openRatingModal(interaction) {
  if (db.systems?.ratings === false) return interaction.reply({content:'⛔ التقييمات متوقفة حالياً.', ephemeral:true});
  const modal = new ModalBuilder()
    .setCustomId('rating_modal')
    .setTitle(`${CONFIG.SERVER_NAME} | التقييم`);

  const stars = new TextInputBuilder()
    .setCustomId('stars')
    .setLabel('التقييم من 1 إلى 5')
    .setPlaceholder('مثال: 5')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(1);

  const reason = new TextInputBuilder()
    .setCustomId('rating_reason')
    .setLabel('سبب التقييم')
    .setPlaceholder('اكتب سبب تقييمك...')
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
      content: '❌ التقييم لازم يكون رقم من 1 إلى 5.',
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
          `${CONFIG.SERVER_NAME} | تقييم جديد`,
          [
            `👤 **العضو:** <@${interaction.user.id}>`,
            '',
            `⭐ **التقييم:** ${'⭐'.repeat(stars)} (${stars}/5)`,
            '',
            `📝 **سبب التقييم:** ${reason}`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
          ].join('\n')
        )
      ]
    }).catch(() => {});
  }

  await interaction.reply({
    content: '✅ شكراً! تم إرسال تقييمك.',
    ephemeral: true
  });

  await sendLog(
    'تقييم جديد',
    `**من:** <@${interaction.user.id}>\n**التقييم:** ${stars}/5\n**السبب:** ${reason}`
  );
}

// ==========================================================
// SUPPORT VOICE
// ==========================================================
let supportConnection = null;
let supportPlayer = null;
let supportQueue = Promise.resolve();

async function connectSupportVoice() {
  try {
    const guild =
      client.guilds.cache.get(CONFIG.GUILD_ID) ||
      await client.guilds.fetch(CONFIG.GUILD_ID).catch(() => null);

    if (!guild) return;

    const channel = await guild.channels.fetch(CONFIG.SUPPORT_VOICE_CHANNEL_ID).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;

    if (supportConnection) {
      try {
        await entersState(supportConnection, VoiceConnectionStatus.Ready, 5000);
        return;
      } catch {
        try { supportConnection.destroy(); } catch {}
        supportConnection = null;
      }
    }

    supportConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    supportConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        try {
          await Promise.race([
            entersState(supportConnection, VoiceConnectionStatus.Signalling, 5000),
            entersState(supportConnection, VoiceConnectionStatus.Connecting, 5000)
          ]);
        } catch {
          try { supportConnection.destroy(); } catch {}
          supportConnection = null;
        }
      }
    });

    await entersState(supportConnection, VoiceConnectionStatus.Ready, 20_000);

    supportPlayer = createAudioPlayer();
    supportConnection.subscribe(supportPlayer);

    console.log('Connected to support voice channel.');
  } catch (err) {
    console.error('Support voice connection error:', err.message);
  }
}

async function speakSupportGreeting() {
  if (db.systems?.voice === false) return;
  supportQueue = supportQueue.then(async () => {
    try {
      if (!supportConnection || !supportPlayer) {
        await connectSupportVoice();
      }

      if (!supportPlayer) return;

      const url = googleTTS.getAudioUrl(CONFIG.SUPPORT_GREETING_TEXT, {
        lang: 'ar',
        slow: false,
        host: 'https://translate.google.com'
      });

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (!response.ok || !response.body) {
        throw new Error(`TTS HTTP ${response.status}`);
      }

      const stream = Readable.fromWeb(response.body);

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
      });

      supportPlayer.play(resource);

      await entersState(supportPlayer, AudioPlayerStatus.Playing, 15_000)
        .catch(() => {});

      await entersState(supportPlayer, AudioPlayerStatus.Idle, 60_000)
        .catch(() => {});
    } catch (err) {
      console.error('Support TTS error:', err.message);
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
    'دخول الدعم الفني',
    `🎧 **العضو:** <@${newState.id}>\n\n✅ دخل روم الدعم الفني.\n\n⏳ يرجى انتظار أحد أفراد الدعم.`
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
      `<@${message.author.id}> ممنوع المنشن الجماعي.`
    );

    await sendLog(
      'حماية | Mass Mention',
      `<@${member.id}> حاول عمل منشن جماعي في <#${message.channel.id}>.`,
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
      `<@${message.author.id}> روابط دعوات Discord ممنوعة.`
    );

    await sendLog(
      'حماية | Discord Invite',
      `<@${member.id}> أرسل دعوة Discord في <#${message.channel.id}>.`,
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
      `<@${message.author.id}> الروابط غير مسموح بها هنا.`
    );

    await sendLog(
      'حماية | Link',
      `<@${member.id}> أرسل رابطاً في <#${message.channel.id}>.`,
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
      `<@${message.author.id}> تم إيقافك مؤقتاً بسبب السبام.`
    );

    await sendLog(
      'حماية | Spam',
      `<@${member.id}> تم عمل Timeout له بسبب السبام في <#${message.channel.id}>.`,
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
        `<@${message.author.id}> قلل استخدام الحروف الكبيرة.`
      );

      await sendLog(
        'حماية | Caps',
        `<@${member.id}> تم حذف رسالة Caps في <#${message.channel.id}>.`,
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
    'حذف رسالة',
    [
      `**العضو:** ${message.author ? `<@${message.author.id}>` : 'غير معروف'}`,
      `**الروم:** <#${message.channel.id}>`,
      `**المحتوى:** ${message.content?.slice(0, 1000) || 'غير متاح'}`
    ].join('\n'),
    0xE74C3C
  );
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  await sendLog(
    'تعديل رسالة',
    [
      `**العضو:** <@${newMessage.author.id}>`,
      `**الروم:** <#${newMessage.channel.id}>`,
      `**قبل:** ${oldMessage.content?.slice(0, 500) || 'غير متاح'}`,
      `**بعد:** ${newMessage.content?.slice(0, 500) || 'غير متاح'}`
    ].join('\n'),
    0xF1C40F
  );
});

client.on(Events.GuildBanAdd, async ban => {
  await sendLog(
    'حظر عضو',
    `<@${ban.user.id}> تم حظره من السيرفر.`,
    0xE74C3C
  );
});

client.on(Events.GuildBanRemove, async ban => {
  await sendLog(
    'فك حظر عضو',
    `<@${ban.user.id}> تم فك الحظر عنه.`,
    0x2ECC71
  );
});

client.on(Events.ChannelCreate, async channel => {
  await sendLog(
    'إنشاء روم',
    `تم إنشاء الروم: <#${channel.id}>`
  );
});

client.on(Events.ChannelDelete, async channel => {
  await sendLog(
    'حذف روم',
    `تم حذف روم: **${channel.name}** (\`${channel.id}\`)`,
    0xE74C3C
  );
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  if (oldChannel.name === newChannel.name) return;

  await sendLog(
    'تعديل روم',
    `تم تغيير اسم الروم من **${oldChannel.name}** إلى **${newChannel.name}**.`
  );
});

client.on(Events.RoleCreate, async role => {
  await sendLog(
    'إنشاء رتبة',
    `تم إنشاء رتبة: <@&${role.id}>`
  );
});

client.on(Events.RoleDelete, async role => {
  await sendLog(
    'حذف رتبة',
    `تم حذف رتبة: **${role.name}** (\`${role.id}\`)`,
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
      'إضافة رتبة لعضو',
      `<@${newMember.id}> حصل على: ${added.map(r => `<@&${r.id}>`).join(', ')}`
    );
  }

  if (removed.size) {
    await sendLog(
      'إزالة رتبة من عضو',
      `<@${newMember.id}> تم إزالة: ${removed.map(r => `<@&${r.id}>`).join(', ')}`,
      0xE67E22
    );
  }

  if (oldMember.nickname !== newMember.nickname) {
    await sendLog(
      'تغيير Nickname',
      `<@${newMember.id}>\n**قبل:** ${oldMember.nickname || oldMember.user.username}\n**بعد:** ${newMember.nickname || newMember.user.username}`
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

// الأزرار الحساسة: فريق التذاكر + مسؤول التذاكر فقط.
function ticketManagementStaff(member) {
  if (!member) return false;
  return [CONFIG.TICKET_TEAM_ROLE_ID, CONFIG.TICKET_MANAGER_ROLE_ID]
    .filter(hasRealId)
    .some(id => member.roles.cache.has(id));
}

function priorityData(priority) {
  return {
    normal: { label:'عادي', emoji:'🟢', color:0x2ECC71 },
    important: { label:'هام', emoji:'🟡', color:0xF1C40F },
    urgent: { label:'ضروري', emoji:'🔴', color:0xE74C3C }
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
      new ButtonBuilder().setCustomId('ticket_type:support').setLabel('الدعم الفني').setEmoji('🎧').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:monitoring').setLabel('الرقابة').setEmoji('👁️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:player_complaint').setLabel('شكوى ضد لاعب').setEmoji('⚠️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:appeal').setLabel('استئناف').setEmoji('🔄').setStyle(ButtonStyle.Primary)
    );
    const r2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_type:staff_complaint').setLabel('شكوى ضد إداري').setEmoji('🚔').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:store').setLabel('المتجر').setEmoji('🛒').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:compensation').setLabel('التعويضات').setEmoji('💰').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_type:bug').setLabel('الإبلاغ عن الأخطاء').setEmoji('🐞').setStyle(ButtonStyle.Primary)
    );
    await ticketCh.send({embeds:[embed('🎫 نظام التذاكر','اختر نوع التذكرة، وبعدها اختار **عادي / هام / ضروري**.')],components:[r1,r2]});
  }

  const control = await safeFetchChannel(CONFIG.CONTROL_PANEL_CHANNEL_ID);
  if (control?.isTextBased() && !(await panelExists(control,'sys:tickets'))) {
    const r1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('sys:tickets').setLabel('التذاكر').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:applications').setLabel('التقديمات').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:welcome').setLabel('الترحيب').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:protection').setLabel('الحماية').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:ratings').setLabel('التقييم').setStyle(ButtonStyle.Primary)
    );
    const r2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('sys:videos').setLabel('الفيديوهات').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys:voice').setLabel('فويس الدعم').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sys_status').setLabel('الحالة').setEmoji('📊').setStyle(ButtonStyle.Secondary)
    );
    await control.send({embeds:[embed('⚙️ لوحة التحكم','تشغيل وإيقاف أنظمة البوت.')],components:[r1,r2]});
  }

  const sendCh = await safeFetchChannel(CONFIG.BOT_SEND_PANEL_CHANNEL_ID);
  if (sendCh?.isTextBased() && !(await panelExists(sendCh,'bot_send'))) {
    await sendCh.send({embeds:[embed('📨 إرسال عن طريق البوت','حدد الاتشانل والرسالة.')],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('bot_send').setLabel('إرسال رسالة').setEmoji('📨').setStyle(ButtonStyle.Primary))
    ]});
  }

  const activation = await safeFetchChannel(CONFIG.ACTIVATION_PANEL_CHANNEL_ID);
  if (activation?.isTextBased() && !(await panelExists(activation,'activation_accept'))) {
    await activation.send({embeds:[embed('✅❌ تقديمات التفعيل','حدد الشخص بالمنشن أو الـID.')],components:[
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('activation_accept').setLabel('قبول').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('activation_reject').setLabel('رفض').setStyle(ButtonStyle.Danger)
      )
    ]});
  }

  const staff = await safeFetchChannel(CONFIG.STAFF_APPLICATION_PANEL_CHANNEL_ID);
  if (staff?.isTextBased() && !(await panelExists(staff,'staff_apply'))) {
    await staff.send({embeds:[embed('🛡️ تقديم الإدارة','اضغط لفتح نموذج تقديم الإدارة.')],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('staff_apply').setLabel('تقديم إدارة').setStyle(ButtonStyle.Primary))
    ]});
  }

  const creator = await safeFetchChannel(CONFIG.CREATOR_APPLICATION_PANEL_CHANNEL_ID);
  if (creator?.isTextBased() && !(await panelExists(creator,'creator_apply'))) {
    await creator.send({embeds:[embed('🎥 تقديم صانع محتوى','اضغط لفتح نموذج التقديم.')],components:[
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('creator_apply').setLabel('تقديم صانع محتوى').setStyle(ButtonStyle.Primary))
    ]});
  }
}

client.once(Events.ClientReady, async ()=>{
  await postAdvancedPanels();
  setInterval(checkTicketWarnings, 60*1000);
});

async function choosePriority(interaction, typeKey) {
  if (db.systems?.tickets === false) return interaction.reply({content:'⛔ التذاكر متوقفة.',ephemeral:true});
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  if (!cfg) return;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:normal`).setLabel('عادي').setEmoji('🟢').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:important`).setLabel('هام').setEmoji('🟡').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_priority:${typeKey}:urgent`).setLabel('ضروري').setEmoji('🔴').setStyle(ButtonStyle.Danger)
  );
  await interaction.reply({embeds:[embed(`${cfg.emoji} ${cfg.label}`,'اختر الأولوية:')],components:[row],ephemeral:true});
}

async function ticketProblemModal(interaction,typeKey,priority) {
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  const modal = new ModalBuilder().setCustomId(`ticket_create:${typeKey}:${priority}`).setTitle(`${cfg.label} - ${priorityData(priority).label}`);
  const problem = new TextInputBuilder().setCustomId('problem').setLabel('اكتب المشكلة').setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(5).setMaxLength(1500);
  modal.addComponents(new ActionRowBuilder().addComponents(problem));
  await interaction.showModal(modal);
}

function ticketRows(num) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim:${num}`).setLabel('استلام').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_add_user:${num}`).setLabel('إضافة شخص').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_add_staff:${num}`).setLabel('إضافة إداري').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_warn:${num}`).setLabel('تنبيه 24 ساعة').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`ticket_close:${num}`).setLabel('إغلاق').setStyle(ButtonStyle.Danger)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket_reopen:${num}`).setLabel('إعادة فتح').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_copy:${num}`).setLabel('نسخ').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket_delete:${num}`).setLabel('مسح').setStyle(ButtonStyle.Danger)
    )
  ];
}

async function createTicket(interaction,typeKey,priority) {
  const cfg = CONFIG.TICKET_TYPES[typeKey];
  const p = priorityData(priority);
  const problem = interaction.fields.getTextInputValue('problem').trim();

  const open = Object.values(db.tickets).find(t=>t.ownerId===interaction.user.id && t.type===typeKey && t.status!=='deleted');
  if (open) return interaction.reply({content:`⚠️ عندك تذكرة من النوع ده: <#${open.channelId}>`,ephemeral:true});

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
    embeds:[embed(`${cfg.emoji} تذكرة #${num}`,`**النوع:** ${cfg.label}\n**الأولوية:** ${p.emoji} ${p.label}\n**صاحب التذكرة:** <@${interaction.user.id}>\n\n**المشكلة:**\n${problem}`,p.color)],
    components:ticketRows(num)
  });

  await interaction.reply({content:`✅ تم فتح التذكرة: ${ch}`,ephemeral:true});

  const notifyId = priority==='normal'?cfg.normalChannelId:(priority==='important'?cfg.importantChannelId:cfg.urgentChannelId);
  const notify = await safeFetchChannel(notifyId);
  if (notify?.isTextBased()) {
    await notify.send({
      content:cfg.teamRoleIds.filter(hasRealId).map(id=>`<@&${id}>`).join(' '),
      embeds:[embed(`${p.emoji} ${p.label} | ${cfg.label}`,`تذكرة #${num}\nصاحبها: <@${interaction.user.id}>`,p.color)],
      components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('دخول التذكرة').setStyle(ButtonStyle.Link).setURL(ch.url))]
    });
  }
  await ticketLog('فتح تذكرة',`#${num} | ${cfg.label} | ${p.label}\n<@${interaction.user.id}>`);
}

async function ticketMemberModal(interaction,ticket,staffOnly=false) {
  const allowed = staffOnly ? ticketManagementStaff(interaction.member) : ticketStaff(interaction.member,ticket);
  if (!allowed) return interaction.reply({content:'❌ ليس لديك صلاحية لهذا الإجراء.',ephemeral:true});
  const modal = new ModalBuilder().setCustomId(`${staffOnly?'ticket_staff_submit':'ticket_user_submit'}:${ticket.number}`).setTitle(staffOnly?'إضافة إداري':'إضافة شخص');
  const user = new TextInputBuilder().setCustomId('user').setLabel('منشن الشخص أو Discord ID').setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(user));
  await interaction.showModal(modal);
}

async function addTicketMember(interaction,ticket,staffOnly=false) {
  const allowed = staffOnly ? ticketManagementStaff(interaction.member) : ticketStaff(interaction.member,ticket);
  if (!allowed) return interaction.reply({content:'❌ ليس لديك صلاحية لهذا الإجراء.',ephemeral:true});
  const id=extractId(interaction.fields.getTextInputValue('user'));
  const member=id?await interaction.guild.members.fetch(id).catch(()=>null):null;
  if (!member) return interaction.reply({content:'❌ الشخص لازم يكون موجود في السيرفر.',ephemeral:true});
  if (staffOnly && !ticketStaff(member,ticket)) return interaction.reply({content:'❌ الشخص مش من فريق التذكرة.',ephemeral:true});
  await interaction.channel.permissionOverwrites.edit(member.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,AttachFiles:true});
  if (!ticket.addedUsers.includes(member.id)) ticket.addedUsers.push(member.id);
  if (staffOnly && !ticket.claimedBy.includes(member.id)) ticket.claimedBy.push(member.id);
  saveDB();
  await interaction.reply({content:`✅ تمت إضافة <@${member.id}>.`});
}

async function closeTicketNow(interaction,ticket,reason='تم الإغلاق بواسطة الإدارة') {
  if (!ticketManagementStaff(interaction.member)) return interaction.reply({content:'❌ فريق التذاكر أو مسؤول التذاكر فقط.',ephemeral:true});
  ticket.status='closed'; ticket.warningDeadline=0; ticket.closeReason=reason; saveDB();
  await interaction.channel.permissionOverwrites.edit(ticket.ownerId,{ViewChannel:false,SendMessages:false}).catch(()=>{});
  await interaction.reply({content:`🔒 تم إغلاق التذكرة.\nالسبب: ${reason}`});
  await safeDM(ticket.ownerId,{
    embeds:[embed('🔒 تم إغلاق التذكرة',`#${ticket.number} | ${CONFIG.TICKET_TYPES[ticket.type].label}\nالسبب: ${reason}`)],
    components:[new ActionRowBuilder().addComponents(
      ...[1,2,3,4,5].map(n=>new ButtonBuilder().setCustomId(`ticket_rate:${ticket.number}:${n}`).setLabel(`${n} ⭐`).setStyle(ButtonStyle.Secondary))
    )]
  });
  await ticketLog('إغلاق تذكرة',`#${ticket.number}\nبواسطة <@${interaction.user.id}>\nالسبب: ${reason}`,0xE74C3C);
}

async function reopenTicketNow(interaction,ticket) {
  if (!ticketManagementStaff(interaction.member)) return interaction.reply({content:'❌ فريق التذاكر أو مسؤول التذاكر فقط.',ephemeral:true});
  ticket.status='open'; ticket.warningDeadline=0; saveDB();
  await interaction.channel.permissionOverwrites.edit(ticket.ownerId,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true});
  await interaction.reply({content:'♻️ تم إعادة فتح التذكرة.'});
  await safeDM(ticket.ownerId,{embeds:[embed('♻️ إعادة فتح التذكرة',`تم إعادة فتح تذكرتك #${ticket.number}.`)]});
}

async function ticketTranscript(interaction,ticket) {
  if (!ticketManagementStaff(interaction.member)) return interaction.reply({content:'❌ فريق التذاكر أو مسؤول التذاكر فقط.',ephemeral:true});
  let arr=[],before;
  for(let i=0;i<10;i++){
    const batch=await interaction.channel.messages.fetch({limit:100,before}).catch(()=>null);
    if(!batch?.size) break;
    arr.push(...batch.values()); before=batch.last().id;
    if(batch.size<100) break;
  }
  arr.sort((a,b)=>a.createdTimestamp-b.createdTimestamp);
  const txt=arr.map(m=>`[${new Date(m.createdTimestamp).toISOString()}] ${m.author?.tag||'Unknown'}: ${m.content||'[Embed/Attachment]'}`).join('\n');
  const file=new AttachmentBuilder(Buffer.from(txt,'utf8'),{name:`ticket-${ticket.number}.txt`});
  await interaction.reply({content:'📋 نسخة التذكرة:',files:[file],ephemeral:true});
}

async function warnTicket24(interaction,ticket) {
  if (!ticketManagementStaff(interaction.member)) return interaction.reply({content:'❌ فريق التذاكر أو مسؤول التذاكر فقط.',ephemeral:true});
  ticket.warningDeadline=Date.now()+24*60*60*1000; saveDB();
  await interaction.reply({content:`<@${ticket.ownerId}> ⚠️ لو مفيش رد خلال 24 ساعة التذكرة هتتقفل تلقائي.`});
  await safeDM(ticket.ownerId,{embeds:[embed('⚠️ تنبيه تذكرة',`تذكرتك #${ticket.number} تحتاج رد خلال 24 ساعة.`)]});
}

async function checkTicketWarnings() {
  const guild=client.guilds.cache.get(CONFIG.GUILD_ID);
  if(!guild) return;
  for(const t of Object.values(db.tickets||{})){
    if(t.status!=='open'||!t.warningDeadline||t.warningDeadline>Date.now()) continue;
    const ch=await guild.channels.fetch(t.channelId).catch(()=>null);
    if(!ch) continue;
    t.status='closed'; t.warningDeadline=0; t.closeReason='عدم التفاعل خلال 24 ساعة'; saveDB();
    await ch.permissionOverwrites.edit(t.ownerId,{ViewChannel:false,SendMessages:false}).catch(()=>{});
    await ch.send({content:'🔒 تم الإغلاق تلقائياً بسبب عدم التفاعل خلال 24 ساعة.'}).catch(()=>{});
    await safeDM(t.ownerId,{embeds:[embed('🔒 تم إغلاق التذكرة',`#${t.number}\nالسبب: عدم التفاعل خلال 24 ساعة.`)]});
    await ticketLog('إغلاق تلقائي',`#${t.number} - عدم التفاعل 24 ساعة`,0xE74C3C);
  }
}

// أمر !say داخل التذكرة: الأمر يختفي والبوت يبعت النص
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

async function activationModal(interaction,accept) {
  if(!hasAnyRole(interaction.member,[...CONFIG.ACTIVATION_REVIEWER_ROLE_IDS,...CONFIG.CONTROL_ROLE_IDS])) return interaction.reply({content:'❌ ليس لديك صلاحية.',ephemeral:true});
  const modal=new ModalBuilder().setCustomId(accept?'activation_accept_submit':'activation_reject_submit').setTitle(accept?'قبول تفعيل':'رفض تفعيل');
  modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user').setLabel('منشن الشخص أو ID').setStyle(TextInputStyle.Short).setRequired(true)));
  if(!accept) modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('سبب الرفض').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(800)));
  await interaction.showModal(modal);
}

async function activationSubmit(interaction,accept) {
  const id=extractId(interaction.fields.getTextInputValue('user'));
  const member=id?await interaction.guild.members.fetch(id).catch(()=>null):null;
  if(!member) return interaction.reply({content:'❌ الشخص غير موجود.',ephemeral:true});
  const reason=accept?'':interaction.fields.getTextInputValue('reason').trim();
  if(accept) await safeAddRole(member,CONFIG.ACTIVATION_ACCEPTED_ROLE_ID);
  await safeDM(id,{embeds:[embed(accept?'✅ تم قبول التفعيل':'❌ تم رفض التفعيل',accept?'تم قبولك في التفعيل.':`السبب: ${reason}`,accept?0x2ECC71:0xE74C3C)]});
  const results=await safeFetchChannel(CONFIG.ACTIVATION_RESULTS_CHANNEL_ID);
  if(results?.isTextBased()) await results.send({embeds:[embed(accept?'✅ قبول تفعيل':'❌ رفض تفعيل',`الشخص: <@${id}>\nبواسطة: <@${interaction.user.id}>${reason?`\nالسبب: ${reason}`:''}`,accept?0x2ECC71:0xE74C3C)]});
  await interaction.reply({content:'✅ تم إرسال القرار.',ephemeral:true});
}

async function simpleApplyModal(interaction,kind) {
  const modal=new ModalBuilder().setCustomId(`${kind}_apply_submit`).setTitle(kind==='staff'?'تقديم إدارة':'تقديم صانع محتوى');
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('age').setLabel('العمر').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('experience').setLabel('الخبرة').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('سبب التقديم').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))
  );
  await interaction.showModal(modal);
}

async function simpleApplySubmit(interaction,kind) {
  const data={id:`${kind}-${interaction.user.id}-${Date.now()}`,userId:interaction.user.id,age:interaction.fields.getTextInputValue('age'),experience:interaction.fields.getTextInputValue('experience'),reason:interaction.fields.getTextInputValue('reason'),status:'pending'};
  const store=kind==='staff'?db.staffApplications:db.creatorApplications;
  store[data.id]=data; saveDB();
  const reviewId=kind==='staff'?CONFIG.STAFF_APPLICATION_REVIEW_CHANNEL_ID:CONFIG.CREATOR_APPLICATION_REVIEW_CHANNEL_ID;
  const ch=await safeFetchChannel(reviewId);
  if(!ch?.isTextBased()) return interaction.reply({content:'❌ روم المراجعة غير مضبوط.',ephemeral:true});
  await ch.send({embeds:[embed(kind==='staff'?'🛡️ تقديم إدارة':'🎥 تقديم صانع محتوى',`المتقدم: <@${data.userId}>\nالعمر: ${data.age}\n\nالخبرة: ${data.experience}\n\nالسبب: ${data.reason}`)],components:[
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`${kind}_accept:${data.id}`).setLabel('قبول').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`${kind}_reject:${data.id}`).setLabel('رفض').setStyle(ButtonStyle.Danger)
    )
  ]});
  await interaction.reply({content:'✅ تم إرسال التقديم.',ephemeral:true});
}

async function decideSimple(interaction,kind,accept) {
  if(!isReviewer(interaction.member)&&!isControl(interaction.member)) return interaction.reply({content:'❌ ليس لديك صلاحية.',ephemeral:true});
  const id=interaction.customId.split(':').slice(1).join(':');
  const store=kind==='staff'?db.staffApplications:db.creatorApplications;
  const data=store[id];
  if(!data||data.status!=='pending') return interaction.reply({content:'⚠️ تم اتخاذ قرار بالفعل.',ephemeral:true});
  data.status=accept?'accepted':'rejected'; data.reviewedBy=interaction.user.id; saveDB();
  if(accept){
    const m=await interaction.guild.members.fetch(data.userId).catch(()=>null);
    if(m) await safeAddRole(m,kind==='staff'?CONFIG.STAFF_PREACCEPTED_ROLE_ID:CONFIG.CREATOR_ACCEPTED_ROLE_ID);
  }
  const msg=kind==='staff'&&accept?`تم قبولك مبدئياً. مواعيد المقابلة: ${channelUrl(CONFIG.STAFF_INTERVIEW_SCHEDULE_CHANNEL_ID)}`:(accept?'تم قبولك وتمت إضافة الرتبة.':'تم رفض التقديم.');
  await safeDM(data.userId,{embeds:[embed(accept?'✅ تم القبول':'❌ تم الرفض',msg,accept?0x2ECC71:0xE74C3C)]});
  const e=EmbedBuilder.from(interaction.message.embeds[0]).setColor(accept?0x2ECC71:0xE74C3C).addFields({name:'القرار',value:`${accept?'✅ قبول':'❌ رفض'} بواسطة <@${interaction.user.id}>`});
  await interaction.update({embeds:[e],components:[]});
}

async function botSendModal(interaction) {
  if(!isControl(interaction.member)) return interaction.reply({content:'❌ الإدارة العليا فقط.',ephemeral:true});
  const modal=new ModalBuilder().setCustomId('bot_send_submit').setTitle('إرسال عن طريق البوت');
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('channel').setLabel('منشن الاتشانل أو Channel ID').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('message').setLabel('الرسالة').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(2000))
  );
  await interaction.showModal(modal);
}

async function botSendSubmit(interaction) {
  const id=extractId(interaction.fields.getTextInputValue('channel'));
  const ch=await safeFetchChannel(id);
  if(!ch?.isTextBased()) return interaction.reply({content:'❌ الاتشانل غير صحيح.',ephemeral:true});
  await ch.send({content:interaction.fields.getTextInputValue('message')});
  await interaction.reply({content:'✅ تم الإرسال.',ephemeral:true});
}

async function toggleSystem(interaction,name) {
  if(!isControl(interaction.member)) return interaction.reply({content:'❌ الإدارة العليا فقط.',ephemeral:true});
  db.systems[name]=!db.systems[name]; saveDB();
  await interaction.reply({content:`${db.systems[name]?'✅ تم تشغيل':'⛔ تم إيقاف'} **${name}**.`,ephemeral:true});
}

client.on(Events.InteractionCreate,async interaction=>{
  try{
    if(interaction.isButton()){
      const id=interaction.customId;
      if(id.startsWith('ticket_type:')) return choosePriority(interaction,id.split(':')[1]);
      if(id.startsWith('ticket_priority:')){const [,t,p]=id.split(':');return ticketProblemModal(interaction,t,p);}
      if(id.startsWith('ticket_claim:')){const t=db.tickets[id.split(':')[1]];if(!ticketManagementStaff(interaction.member,t))return interaction.reply({content:'❌ للإدارة فقط.',ephemeral:true});if(!t.claimedBy.includes(interaction.user.id))t.claimedBy.push(interaction.user.id);saveDB();return interaction.reply({content:`✅ استلم التذكرة <@${interaction.user.id}>.`});}
      if(id.startsWith('ticket_add_user:')) return ticketMemberModal(interaction,db.tickets[id.split(':')[1]],false);
      if(id.startsWith('ticket_add_staff:')) return ticketMemberModal(interaction,db.tickets[id.split(':')[1]],true);
      if(id.startsWith('ticket_warn:')) return warnTicket24(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_close:')) return closeTicketNow(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_reopen:')) return reopenTicketNow(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_copy:')) return ticketTranscript(interaction,db.tickets[id.split(':')[1]]);
      if(id.startsWith('ticket_delete:')){const t=db.tickets[id.split(':')[1]];if(!ticketManagementStaff(interaction.member))return interaction.reply({content:'❌ فريق التذاكر أو مسؤول التذاكر فقط.',ephemeral:true});await interaction.reply({content:'🗑️ سيتم المسح خلال 5 ثواني.'});t.status='deleted';saveDB();return setTimeout(()=>interaction.channel.delete().catch(()=>{}),5000);}
      if(id.startsWith('ticket_rate:')){const [,num,stars]=id.split(':');const modal=new ModalBuilder().setCustomId(`ticket_rating_submit:${num}:${stars}`).setTitle(`تقييم ${stars}/5`);modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('سبب التقييم').setStyle(TextInputStyle.Paragraph).setRequired(true)));return interaction.showModal(modal);}
      if(id.startsWith('sys:')) return toggleSystem(interaction,id.split(':')[1]);
      if(id==='sys_status'){if(!isControl(interaction.member))return interaction.reply({content:'❌ الإدارة العليا فقط.',ephemeral:true});return interaction.reply({embeds:[embed('📊 حالة الأنظمة',Object.entries(db.systems).map(([k,v])=>`${v?'✅':'⛔'} ${k}`).join('\n'))],ephemeral:true});}
      if(id==='bot_send') return botSendModal(interaction);
      if(id==='activation_accept') return activationModal(interaction,true);
      if(id==='activation_reject') return activationModal(interaction,false);
      if(id==='staff_apply') return simpleApplyModal(interaction,'staff');
      if(id==='creator_apply') return simpleApplyModal(interaction,'creator');
      if(id.startsWith('staff_accept:')) return decideSimple(interaction,'staff',true);
      if(id.startsWith('staff_reject:')) return decideSimple(interaction,'staff',false);
      if(id.startsWith('creator_accept:')) return decideSimple(interaction,'creator',true);
      if(id.startsWith('creator_reject:')) return decideSimple(interaction,'creator',false);
    }
    if(interaction.isModalSubmit()){
      const id=interaction.customId;
      if(id.startsWith('ticket_create:')){const [,t,p]=id.split(':');return createTicket(interaction,t,p);}
      if(id.startsWith('ticket_user_submit:')) return addTicketMember(interaction,db.tickets[id.split(':')[1]],false);
      if(id.startsWith('ticket_staff_submit:')) return addTicketMember(interaction,db.tickets[id.split(':')[1]],true);
      if(id.startsWith('ticket_rating_submit:')){const [,num,stars]=id.split(':');const t=db.tickets[num];if(!t||t.ownerId!==interaction.user.id)return interaction.reply({content:'❌ غير مسموح.',ephemeral:true});const reason=interaction.fields.getTextInputValue('reason');db.ticketRatings.push({num,userId:interaction.user.id,type:t.type,stars:Number(stars),reason,at:Date.now()});saveDB();const ch=await safeFetchChannel(CONFIG.TICKET_RATING_CHANNEL_ID);if(ch?.isTextBased())await ch.send({embeds:[embed('⭐ تقييم تذكرة',`#${num} | ${CONFIG.TICKET_TYPES[t.type].label}\n<@${interaction.user.id}>\n${'⭐'.repeat(Number(stars))}\nالسبب: ${reason}`)]});return interaction.reply({content:'✅ شكراً على التقييم.',ephemeral:true});}
      if(id==='activation_accept_submit') return activationSubmit(interaction,true);
      if(id==='activation_reject_submit') return activationSubmit(interaction,false);
      if(id==='staff_apply_submit') return simpleApplySubmit(interaction,'staff');
      if(id==='creator_apply_submit') return simpleApplySubmit(interaction,'creator');
      if(id==='bot_send_submit') return botSendSubmit(interaction);
    }
  }catch(err){console.error('Advanced system error:',err);if(interaction.isRepliable()&&!interaction.replied&&!interaction.deferred)await interaction.reply({content:'❌ حصل خطأ.',ephemeral:true}).catch(()=>{});}
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
  console.error('DISCORD_TOKEN is missing. Add it in Railway Variables.');
  process.exit(1);
}

client.login(CONFIG.TOKEN);
