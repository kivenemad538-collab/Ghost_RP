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

  GUILD_ID: 'PUT_GUILD_ID_HERE',

  // ---------- Channels ----------
  APPLICATION_PANEL_CHANNEL_ID: 'PUT_APPLICATION_PANEL_CHANNEL_ID',
  APPLICATION_RESULTS_CHANNEL_ID: 'PUT_APPLICATION_RESULTS_CHANNEL_ID',
  VIDEO_CHANNEL_ID: 'PUT_VIDEO_CHANNEL_ID',
  WELCOME_CHANNEL_ID: 'PUT_WELCOME_CHANNEL_ID',
  RULES_CHANNEL_ID: 'PUT_RULES_CHANNEL_ID',
  RATINGS_CHANNEL_ID: 'PUT_RATINGS_CHANNEL_ID',
  SUPPORT_VOICE_CHANNEL_ID: 'PUT_SUPPORT_VOICE_CHANNEL_ID',
  LOG_CHANNEL_ID: 'PUT_LOG_CHANNEL_ID',

  // ---------- Roles ----------
  DEFAULT_MEMBER_ROLE_ID: 'PUT_DEFAULT_MEMBER_ROLE_ID',
  ACCEPTED_APPLICATION_ROLE_ID: 'PUT_ACCEPTED_APPLICATION_ROLE_ID',
  ACCEPTED_VIDEO_ROLE_ID: 'PUT_ACCEPTED_VIDEO_ROLE_ID',
  SECOND_REJECTION_ROLE_ID: 'PUT_SECOND_REJECTION_ROLE_ID',

  // ONLY these 2 roles can accept/reject applications and videos
  REVIEWER_ROLE_IDS: [
    'PUT_REVIEWER_ROLE_1_ID',
    'PUT_REVIEWER_ROLE_2_ID'
  ],

  // These roles bypass automatic protection
  PROTECTION_BYPASS_ROLE_IDS: [
    'PUT_OWNER_OR_HIGH_STAFF_ROLE_ID'
  ],

  SERVER_NAME: 'Ghost RP',
  COLOR: 0x1687FF,

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
      ratings: parsed.ratings || []
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
          'اضغط على زر **التقديم** وسيبدأ البوت بسؤالك في الخاص.',
          '',
          'سيتم إرسال سؤال واحد بعد إجابتك على السؤال السابق.',
          'لإلغاء التقديم في أي وقت اكتب بالخاص: **cancel**'
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
  const userId = interaction.user.id;
  const rec = getUserRecord(userId);
  const now = Date.now();

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
          `أهلاً بك. سيتم إرسال الأسئلة واحداً واحداً.\nللإلغاء اكتب **cancel**.`
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
        `**السؤال ${state.index + 1}/${CONFIG.APPLICATION_QUESTIONS.length}:**\n${question}\n\nللإلغاء اكتب **cancel**.`
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
          'تم إلغاء تقديمك بنجاح. يمكنك التقديم مرة أخرى لاحقاً.'
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
          'حصل خطأ في إرسال التقديم للإدارة. تواصل مع الإدارة وحاول مرة أخرى.'
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
        `تم إرسال تقديمك إلى إدارة **${CONFIG.SERVER_NAME}** للمراجعة.\nسيتم إرسال النتيجة لك في الخاص.`,
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
        `مبروك! تم قبول تقديمك في **${CONFIG.SERVER_NAME}**.\nتمت إضافة رتبة القبول لك.`,
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

  if (rec.rejectionCount >= 2) {
    blockedUntil =
      Date.now() +
      CONFIG.SECOND_REJECTION_BLOCK_DAYS * 24 * 60 * 60 * 1000;

    rec.blockedUntil = blockedUntil;

    const member = await interaction.guild.members.fetch(app.userId).catch(() => null);
    if (member) await safeAddRole(member, CONFIG.SECOND_REJECTION_ROLE_ID);

    blockText =
      `\n\n⛔ بسبب رفضك مرتين، لن تستطيع التقديم لمدة ` +
      `**${CONFIG.SECOND_REJECTION_BLOCK_DAYS} أيام**.\n` +
      `يمكنك التقديم مرة أخرى <t:${Math.floor(blockedUntil / 1000)}:R>.`;
  }

  app.status = 'rejected';
  saveDB();

  await safeDM(app.userId, {
    embeds: [
      embed(
        'تم رفض تقديمك ❌',
        `تم رفض تقديمك في **${CONFIG.SERVER_NAME}**.\n\n**السبب:** ${reason}${blockText}`,
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
        `**صاحب الفيديو:** <@${message.author.id}>\n**الحالة:** في انتظار قرار الإدارة.`
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
        `تم قبول الفيديو الخاص بك في **${CONFIG.SERVER_NAME}** وتمت إضافة الرتبة لك.`,
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
        `تم رفض الفيديو الخاص بك في **${CONFIG.SERVER_NAME}**.\n\n**السبب:** ${reason}`,
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

    await ch.send({
      content: `<@${member.id}>`,
      embeds: [
        embed(
          `أهلاً بك في ${CONFIG.SERVER_NAME} 👻`,
          [
            `نورت السيرفر يا <@${member.id}>!`,
            '',
            'استخدم الأزرار بالأسفل للوصول إلى القوانين والتقديم أو إرسال تقييمك.'
          ].join('\n')
        )
      ],
      components: [row]
    }).catch(() => {});
  }

  await sendLog(
    'عضو جديد',
    `<@${member.id}> دخل السيرفر وتم إعطاؤه الرتبة الافتراضية.`,
    0x2ECC71
  );
});

client.on(Events.GuildMemberRemove, async member => {
  await sendLog(
    'خروج عضو',
    `<@${member.id}> خرج من السيرفر.`,
    0xE67E22
  );
});

// ==========================================================
// RATINGS
// ==========================================================
async function openRatingModal(interaction) {
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
            `**العضو:** <@${interaction.user.id}>`,
            `**التقييم:** ${'⭐'.repeat(stars)} (${stars}/5)`,
            `**السبب:** ${reason}`
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
    `<@${newState.id}> دخل روم الدعم الفني.`
  );
});

// ==========================================================
// PROTECTION
// ==========================================================
async function runProtection(message) {
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
