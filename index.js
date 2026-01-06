
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import Pino from "pino";
import ytdl from "ytdl-core";
import ytSearch from "yt-search";

const PREFIX = ".";
const OWNER = "50948595759@s.whatsapp.net";
const BOT_NAME = "DarkSpider_Anya";
const PAIRING_CODE = "EMERAUDE";
const POWERED = "\n\nPowered by Dark Émeraude";

const quotes = [
  "🕷️ Cute face, dark soul.",
  "🍓 Même l’ombre peut être douce.",
  "🌙 La nuit protège les âmes sincères.",
  "🖤 Spider girl veille en silence."
];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  // 🔑 PAIRING
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

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    if (from.endsWith("@g.us")) return; // 🔒 privé only

    const sender = msg.key.participant || from;
    if (sender !== OWNER) {
      await sock.sendMessage(from, {
        text: "⛔ Bot privé.\nOwner uniquement." + POWERED
      });
      return;
    }

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(PREFIX)) return;

    const args = text.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== COMMANDES =====

    if (command === "ping") {
      await sock.sendMessage(from, { text: "💓 Pong !" + POWERED });
    }

    if (command === "alive") {
      await sock.sendMessage(from, {
        text: `🕷️ ${BOT_NAME} est en ligne.` + POWERED
      });
    }

    if (command === "quote") {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      await sock.sendMessage(from, { text
