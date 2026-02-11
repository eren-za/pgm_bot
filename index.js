process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [HATA] Yakalanamayan Reddetme:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ [HATA] Beklenmedik İstisna:', err);
});

require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers 
    ]
});

client.commands = new Collection();

// Komut Yükleme İşlemi
const commandFolders = fs.readdirSync("./commands");

console.log('📂 Komutlar yükleniyor...');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        
        // Ana komutu kaydet
        client.commands.set(command.name, command);
        
        // Alternatif isimleri (aliases) kaydet
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => client.commands.set(alias, command));
        }
    }
}
console.log('✅ Tüm komutlar başarıyla belleğe alındı.');

// "ready" uyarısını çözmek için "clientReady" kullanıyoruz
client.once("clientReady", (c) => {
    console.log(`\n---------------------------------`);
    console.log(`🚀 PGM BOT Çevrimiçi!`);
    console.log(`🤖 Bot: ${c.user.tag}`);
    console.log(`📅 Tarih: ${new Date().toLocaleString('tr-TR')}`);
    console.log(`---------------------------------\n`);
    
    client.user.setPresence({
        activities: [{ 
            name: 'custom', 
            type: ActivityType.Custom, 
            state: '🛠️ "!yardim" // PGM BOT v0.38.1' 
        }],
        status: 'online',
    });
});

client.on("messageCreate", async (msg) => {
    // Botları ve DM mesajlarını yoksay
    if (msg.author.bot || !msg.guild) return;

    // Mesajın komut olup olmadığını kontrol et (Örn: ! ile başlıyorsa)
    if (!msg.content.startsWith("!")) return;

    const args = msg.content.slice(1).trim().split(/\s+/);
    const commandName = "!" + args.shift()?.toLowerCase();

    // Komutu bul
    const command = client.commands.get(commandName);
    if (!command) return;

    // Komut kullanım logu (Kimin ne kullandığını terminalde gör)
    console.log(`[KOMUT] ${msg.author.tag}: ${commandName} ${args.join(" ")}`);

    try {
        await command.execute(client, msg, args);
    } catch (error) {
        console.error(`❌ Komut Hatası (${commandName}):`, error);
        msg.reply("Bu komutu çalıştırırken sistemsel bir hata oluştu. Lütfen geliştiriciye bildirin.");
    }
});

client.login(process.env.TOKEN);