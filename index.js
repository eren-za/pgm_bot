process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err);
});

require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // !add everyone veya üye sayısını çekmek için bu GEREKLİDİR.
    ]
});

client.commands = new Collection();

// Komut Yükleme İşlemi (Geliştirilmiş)
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
        console.log(`✅ Yüklendi: ${command.name}`);
    }
}

// "clientReady" HATALIDIR, v14'te "ready" kullanılır.
client.once("ready", () => {
    console.log(`\n🚀 PGM BOT Çevrimiçi!`);
    console.log(`🤖 Bot Tagı: ${client.user.tag}`);
    
    client.user.setPresence({
        activities: [{ 
            name: 'custom', 
            type: ActivityType.Custom, 
            state: '🛠️ "!yardim" | PGM BOT v1.0' 
        }],
        status: 'idle',
    });
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    // Mesaj içeriğini parçalara ayır
    const args = msg.content.trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    // Komutu bul
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(client, msg, args);
    } catch (error) {
        console.error(`❌ Komut Hatası (${commandName}):`, error);
        msg.reply("Bu komutu çalıştırırken sistemsel bir hata oluştu.");
    }
});

client.login(process.env.TOKEN);