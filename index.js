const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, Attachmenconst fs = require('fs');
const path = require('path');
const BOT_TOKEN = 'MTUxMzg3OTEzNTc1ODQ1MDY4OQ.GPIrhg.waimzxCG-Y9u0FDLgUg2HhQT8Mfx68Qc0-Ijzconst CLIENT_ID = '1513879135758450689';
const ADMIN_USER = 'saolal';
const TIMER = {
 posadi: 5 * 60 * 60 * 1000,
 posadii: 2.5 * 60 * 60 * 1000,
 posadiilegala: 2.5 * 60 * 60 * 1000,
};
const DB_FILE = path.join(__dirname, 'data', 'evidencija.json');
const LOGO = path.join(__dirname, 'assets', 'logo.png');
function loadDB() {
 if (!fs.existsSync(DB_FILE)) return {};
 try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
 catch { return {}; }
}
function saveDB(data) {
 fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
 fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
function recordSadnja(userId, username, commandName) {
 const db = loadDB();
 if (!db[userId]) db[userId] = { username, ukupno: 0, posadi: 0, posadii: 0, posadiilegala:  db[userId].username = username;
 db[userId].ukupno = (db[userId].ukupno || 0) + 1;
 db[userId][commandName] = (db[userId][commandName] || 0) + 1;
 saveDB(db);
}
function buildProgressBar(percent) {
 const total = 10;
 const filled = Math.round((percent / 100) * total);
 const bar = ' '.repeat(filled) + ' '.repeat(total - filled);
 return bar;
}
function formatTimeLeft(ms) {
 if (ms <= 0) return '0m';
 const h = Math.floor(ms / 3600000);
 const m = Math.floor((ms % 3600000) / 60000);
 if (h > 0) return `${h}h ${m}m`;
 return `${m}m`;
}
function buildEmbed(tag, percent, msLeft, username) {
 const boja = tag === 'posadiilegala' ? 0x8B0000 : 0x2d6a2d;
 const bar = buildProgressBar(percent);
 const timeStr = formatTimeLeft(msLeft);
 const naslov = tag === 'posadiilegala'
 ? ' Rast biljaka — Legala'
 : ` Rast biljaka za ${username}`;
 return new EmbedBuilder()
 .setColor(boja)
 .setTitle(naslov)
 .setDescription(`Biljke rastu... `)
 .addFields(
 { name: 'Napredak', value: `${bar} **${percent.toFixed(1)}%**` },
 { name: 'Preostalo vrijeme', value: `**${timeStr}**` },
 )
 .setThumbnail('attachment://logo.png')
 .setFooter({ text: `Tuljan Farmer | Uživaj u sadnji!`, iconURL: 'attachment://logo.png' } .setTimestamp();
}
const client = new Client({
 intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const commands = [
 new SlashCommandBuilder().setName('posadi').setDescription('Pokreni sadnju (5h timer, počin new SlashCommandBuilder().setName('posadii').setDescription('Pokreni posadii sadnju (2.5h t new SlashCommandBuilder().setName('posadiilegala').setDescription('Pokreni legala sadnju (2 new SlashCommandBuilder().setName('evidencijasadnji').setDescription('Prikaži leaderboard —].map(c => c.toJSON());
async function registerCommands() {
 const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
 try {
 console.log(' Registrujem slash komande...');
 await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
 console.log(' Komande registrovane!');
 } catch (err) {
 console.error(' Greška:', err);
 }
}
async function pokrenniTimer(interaction, tag) {
 const { user, member } = interaction;
 const displayName = member?.displayName || user.username;
 const trajanje = TIMER[tag];
 const startTime = Date.now();
 const endTime = startTime + trajanje;
 const startPct = 60.1;
 const file = new AttachmentBuilder(LOGO, { name: 'logo.png' });
 const embed = buildEmbed(tag, startPct, trajanje, displayName);
 await interaction.reply({ embeds: [embed], files: [file] });
 const msg = await interaction.fetchReply();
 recordSadnja(user.id, displayName, tag);
 const UPDATE_INTERVAL = 5 * 60 * 1000;
 const interval = setInterval(async () => {
 const now = Date.now();
 const elapsed = now - startTime;
 const msLeft = endTime - now;
 if (msLeft <= 0) {
 clearInterval(interval);
 return;
 }
 const progress = elapsed / trajanje;
 const percent = startPct + (100 - startPct) * progress;
 try {
 const updatedFile = new AttachmentBuilder(LOGO, { name: 'logo.png' });
 const updatedEmbed = buildEmbed(tag, percent, msLeft, displayName);
 await msg.edit({ embeds: [updatedEmbed], files: [updatedFile] });
 } catch (err) {
 console.error('Edit greška:', err.message);
 }
 }, UPDATE_INTERVAL);
 setTimeout(async () => {
 clearInterval(interval);
 try {
 const doneFile = new AttachmentBuilder(LOGO, { name: 'logo.png' });
 const doneEmbed = buildEmbed(tag, 100, 0, displayName)
 .setTitle(' Sadnja završena!')
 .setDescription(`${displayName} — biljke su gotove! `)
 .setColor(0x4caf50);
 await msg.edit({ embeds: [doneEmbed], files: [doneFile] });
 } catch {}
 try {
 const dmFile = new AttachmentBuilder(LOGO, { name: 'logo.png' });
 const dmEmbed = new EmbedBuilder()
 .setColor(0x4caf50)
 .setTitle(' Sadnja završena!')
 .setDescription(`Hej <@${user.id}>! \n\nTvoja \`/${tag}\` sadnja je **gotova**.\nVr .setThumbnail('attachment://logo.png')
 .setFooter({ text: 'Tuljan Farmer', iconURL: 'attachment://logo.png' })
 .setTimestamp();
 const dm = await user.createDM();
 await dm.send({ embeds: [dmEmbed], files: [dmFile] });
 } catch {
 try {
 await interaction.followUp({ content: `<@${user.id}> Tvoja \`/${tag}\` sadnja je g } catch {}
 }
 }, trajanje);
}
client.on('interactionCreate', async (interaction) => {
 if (!interaction.isChatInputCommand()) return;
 const { commandName, user, member } = interaction;
 const displayName = member?.displayName || user.username;
 if (['posadi', 'posadii', 'posadiilegala'].includes(commandName)) {
 await pokrenniTimer(interaction, commandName);
 return;
 }
 if (commandName === 'evidencijasadnji') {
 const db = loadDB();
 const unosi = Object.values(db);
 if (unosi.length === 0) {
 await interaction.reply({ content: ' Nema još zabeleženih sadnji.', ephemeral: true } return;
 }
 unosi.sort((a, b) => (b.ukupno || 0) - (a.ukupno || 0));
 const medalje = [' ', ' ', ' '];
 const rows = unosi.slice(0, 20).map((u, i) => {
 const medal = medalje[i] || `**${i + 1}.**`;
 const ps = u.posadi || 0;
 const ps2 = u.posadii || 0;
 const leg = u.posadiilegala || 0;
 return `${medal} **${u.username}** — ukupno: \`${u.ukupno}\` *(posadi: ${ps} | posadii });
 const file = new AttachmentBuilder(LOGO, { name: 'logo.png' });
 const embed = new EmbedBuilder()
 .setColor(0x8B6914)
 .setTitle(' Evidencija Sadnji — Leaderboard')
 .setDescription(rows.join('\n'))
 .setThumbnail('attachment://logo.png')
 .setFooter({ text: 'Tuljan Farmer', iconURL: 'attachment://logo.png' })
 .setTimestamp();
 await interaction.reply({ embeds: [embed], files: [file] });
 }
});
client.once('ready', () => {
 console.log(` Tuljan Farmer bot online kao ${client.user.tag}`);
 client.user.setActivity('/posadi ', { type: 0 });
});
registerCommands();
client.login(BOT_TOKEN)
