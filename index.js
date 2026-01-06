import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import Pino from "pino";

const PREFIX = ".";
const OWNER_NUMBER = "242069709368@s.whatsapp.net";
const BOT_NAME = "DarkSpider_Anya";
const PAIRING_CODE = "EMERAUDE";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  // ===== PAIRING CODE =====
  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PAIRING_CODE);
        console.log("📲 CODE DE PAIRING :", code);
      } catch (e) {
        console.log("❌ PAIRING ERROR", e);
      }
    }, 3000);
  }

  // ===== MESSAGES =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    // 🔒 MODE PRIVÉ SEULEMENT
    if (from.endsWith("@g.us")) return;

    const sender = msg.key.participant || from;

    // 👑 OWNER ONLY
    if (sender !== OWNER_NUMBER) {
      await sock.sendMessage(from, {
        text: "⛔ Bot privé.\nOwner uniquement.\n\nPowered by Dark Émeraude"
      });
      return;
    }

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(PREFIX)) return;

    const command = text.slice(1).trim().toLowerCase();

    // ===== COMMANDES DE BASE =====

    if (command === "ping") {
      await sock.sendMessage(from, {
        text: "💓 Pong !\n\nPowered by Dark Émeraude"
      });
    }

    if (command === "alive") {
      await sock.sendMessage(from, {
        text: `🕷️🍓 ${BOT_NAME} est en ligne.\n\nPowered by Dark Émeraude`
      });
    }

    if (command === "menu") {
      const menu = `
╭🕷️🍓 DARK SPIDER GIRL 🍓🕷️
│ Dev : Dark Émeraude
│ Bot : ${BOT_NAME}
│ Prefix : .
│ Mode : Privé
╰━━━━━━━━━━━━━━━━━━━━━━━╯

🕷️ GENERAL
.ping
.alive
.menu

🖤 Powered by Dark Émeraude
`;

      await sock.sendMessage(from, { text: menu });
    }
  });

  // ===== CONNEXION =====
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("🕷️🍓 DarkSpider_Anya CONNECTÉE");
    }
  });
}

startBot();
