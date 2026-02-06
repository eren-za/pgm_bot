const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Emojiler
const EMOJIS = {
    pgmcoin: "<:pgmcoin:1469015534493368442>",
    ruby: "<:ruby:1469015535911178280>",
    bronzkasa: "<:bronzkasa:1469400728442245347>",
    gumuskasa: "<:gumuskasa:1469400730589724828>",
    altinkasa: "<:altinkasa:1469400726043361443>",
    time: "⏳"
};

const DISPLAY_NAMES = {
    pgmcoin: "PGM Coin",
    ruby: "Yakut",
    bronzkasa: "Bronz Kasa",
    gumuskasa: "Gümüş Kasa"
};

const COOLDOWN = 6 * 60 * 60 * 1000; // 6 Saat

// İsim Formatlama
function formatName(name) {
    return DISPLAY_NAMES[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

module.exports = {
    name: "!daily",
    aliases: ["!gunluk", "!maas"],
    description: "Günlük ödüllerini toplarsın (Yapılandırılabilir Loot).",
    execute(client, msg, args) {
        const user = msg.author;
        let data = loadJson("data.json");
        const dailyLoot = loadJson("daily_loot.json"); // Loot dosyasını yükle
        
        ensureUser(data, user.id);

        const now = Date.now();
        const lastDaily = data[user.id].lastDaily || 0;

        // 1. ZAMAN KONTROLÜ
        if ((now - lastDaily) < COOLDOWN) {
            const remaining = COOLDOWN - (now - lastDaily);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setDescription(`${EMOJIS.time} **Ödülünü zaten aldın!**\nYeniden alabilmek için beklemen gereken süre:\n**${hours} saat, ${minutes} dakika**`);
            
            return msg.reply({ embeds: [errorEmbed] });
        }

        // 2. ÖDÜLLERİ HESAPLA
        if (!dailyLoot || dailyLoot.length === 0) {
            return msg.reply("❌ Günlük ödül listesi (daily_loot.json) bulunamadı veya boş.");
        }

        let rewards = []; // Kazanılanları burada tutacağız

        dailyLoot.forEach(item => {
            // Şans Faktörü (0 ile 100 arası rastgele sayı)
            const roll = Math.random() * 100;

            if (roll <= item.chance) {
                // Şans tuttu, ödülü ver
                if (item.type === "currency") {
                    // Min-Max arası rastgele miktar
                    const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                    
                    // Veriye Ekle
                    data[user.id][item.name] = (data[user.id][item.name] || 0) + amount;
                    
                    // Listeye Ekle
                    const emoji = EMOJIS[item.name] || "💰";
                    rewards.push(`## ${emoji} +${amount} ${formatName(item.name)}`);
                } 
                else if (item.type === "crate") {
                    // Sabit miktar
                    const amount = item.amount || 1;
                    
                    if (!data[user.id].crates) data[user.id].crates = {};
                    data[user.id].crates[item.name] = (data[user.id].crates[item.name] || 0) + amount;

                    // Listeye Ekle
                    const emoji = EMOJIS[item.name] || "📦";
                    rewards.push(`## ${emoji} +${amount} ${formatName(item.name)}`);
                }
            }
        });

        // 3. VERİLERİ KAYDET
        data[user.id].lastDaily = now;
        saveJson("data.json", data);

        // 4. SONUÇ MESAJI
        const description = rewards.length > 0 
            ? `Tebrikler <@${user.id}>, 6 saatlik ödüllerin hesabına yattı!\n\n${rewards.join("\n")}`
            : `Bugün şanssız günündesin <@${user.id}>, hiç ödül çıkmadı... (İhtimal çok düşük ama oldu)`;

        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287) // Yeşil
            .setAuthor({ name: "Günlük Ödül Toplandı!", iconURL: user.displayAvatarURL() })
            .setDescription(description)
            .setFooter({ text: "Bir sonraki ödül için 6 saat sonra bekleriz!" })
            .setTimestamp();

        msg.reply({ embeds: [successEmbed] });
    }
};