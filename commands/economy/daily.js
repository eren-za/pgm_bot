const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Emojiler
const EMOJIS = {
    pgmcoin: "<:pgmcoin:1469015534493368442>",
    ruby: "<:ruby:1469015535911178280>",
    time: "⏳"
};

// 24 Saat (Milisaniye cinsinden)
const COOLDOWN = 24 * 60 * 60 * 1000; 

module.exports = {
    name: "!daily",
    aliases: ["!gunluk""],
    description: "Günlük rastgele ödülünü toplarsın (24 saatte bir).",
    execute(client, msg, args) {
        const user = msg.author;
        const data = loadJson("data.json");
        
        ensureUser(data, user.id);

        const p = data[user.id];
        const now = Date.now();

        // 1. ZAMAN KONTROLÜ
        // Eğer daha önce almışsa ve 24 saat geçmemişse
        if (p.lastDaily && (now - p.lastDaily) < COOLDOWN) {
            const remaining = COOLDOWN - (now - p.lastDaily);
            
            // Kalan süreyi saat ve dakikaya çevir
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245) // Kırmızı
                .setDescription(`${EMOJIS.time} **Günlük ödülünü zaten aldın!**\nYeniden alabilmek için beklemen gereken süre:\n**${hours} saat, ${minutes} dakika**`);
            
            return msg.reply({ embeds: [errorEmbed] });
        }

        // 2. RASTGELE ÖDÜL HESAPLAMA
        
        // PGM Coin: 2 ile 7 arasında rastgele
        // Mantık: Math.random() * (Max - Min + 1) + Min
        const randomCoin = Math.floor(Math.random() * (7 - 2 + 1)) + 2;

        // Yakut: 0 ile 1 arasında (Yani %50 şansla ya gelir ya gelmez)
        const randomRuby = Math.floor(Math.random() * 2);

        // 3. VERİLERİ GÜNCELLEME
        p.pgmcoin += randomCoin;
        p.ruby += randomRuby;
        p.lastDaily = now; // Şu anki zamanı kaydet

        saveJson("data.json", data);

        // 4. BAŞARILI MESAJI
        // Mesajı Yakut çıkıp çıkmamasına göre süsleyelim
        let rewardText = `${EMOJIS.pgmcoin} **+${randomCoin} PGM Coin**`;
        
        if (randomRuby > 0) {
            rewardText += `\n${EMOJIS.ruby} **+${randomRuby} Yakut** (Şanslı günündesin!)`;
        }

        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287) // Yeşil
            .setAuthor({ name: "Günlük Ödül Toplandı!", iconURL: user.displayAvatarURL() })
            .setDescription(`Tebrikler <@${user.id}>, bugünkü günlük ödülünü aldın!\n\n${rewardText}`)
            .setFooter({ text: "Yarın tekrar gelmeyi unutma!" })
            .setTimestamp();

        msg.reply({ embeds: [successEmbed] });
    }
};