const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Emojiler
const EMOJIS = {
    pgmcoin: "<:pgmcoin:1469015534493368442>",
    ruby: "<:ruby:1469015535911178280>",
    diamond: "<:diamond:1469015532836491274>",
    crystal: "<:crystal:1469015530760569058>",
    kit: "<:kit:1469016921478266880>",
    cuzdan: "<:cuzdan:1469017634950480097>",
    canta: "<:canta:1469018374930698240>"
};

module.exports = {
    name: "!envanter",
    aliases: ["!inv", "!canta", "!profile", "!e"],
    description: "Kullanıcının bakiyesini ve kitlerini gösterir.",
    execute(client, msg, args) {
        const user = msg.mentions.users.first() || msg.author;
        const data = loadJson("data.json");
        
        ensureUser(data, user.id);
        saveJson("data.json", data);

        const p = data[user.id];

        // Kit listesi: Boşsa uyarı, doluysa alt alta sırala
        const kitList = Object.entries(p.kits).length > 0
            ? Object.entries(p.kits)
                .map(([k, v]) => `> ${EMOJIS.kit} **${k.toUpperCase()}** • \`${v} Adet\``)
                .join("\n")
            : "> _Çantanızda hiç kit bulunmuyor._";

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) // Koyu gri (Discord Dark Mode uyumlu)
            .setAuthor({ name: `${user.username} • Oyuncu Profili`, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 })) // Avatarı netleştirdik
            .setDescription(`## ${EMOJIS.cuzdan} Hesap Özeti\nKullanıcının anlık varlık durumu aşağıdadır.`) // Büyük Başlık
            .addFields(
                { 
                    name: "━━━━━━━━━━━━━━━━━━━━━", 
                    value: `\n${EMOJIS.pgmcoin} **PGM Coin** \n# ${p.pgmcoin}\n`, // "#" ile sayıyı dev yaptık
                    inline: true 
                },
                { 
                    name: "━━━━━━━━━━━━━━━━━━━━━", 
                    value: `\n${EMOJIS.ruby} **Ruby** \n# ${p.ruby}\n`,
                    inline: true 
                },
                { 
                    name: "━━━━━━━━━━━━━━━━━━━━━", // Boşluk yaratmak için
                    value: `**Diğer Değerli Madenler**\n` +
                           `${EMOJIS.diamond} **Elmas:** \`${p.diamond}\`\n` +
                           `${EMOJIS.crystal} **Kristal:** \`${p.crystal}\``, 
                    inline: false 
                },
                { 
                    name: `\n${EMOJIS.canta} SAHİP OLUNAN KİTLER`, 
                    value: `\`\`\`fix\n${kitList.replace(/> /g, "")}\n\`\`\``, // Kod bloğu içine alarak genişlettik
                    inline: false 
                }
            )
            // BURASI ÖNEMLİ: Büyük görsel ekleyerek embed'i uzatıyoruz.
            // Buraya sunucuna özel bir banner linki koymalısın.
            .setImage("[https://media.discordapp.net/attachments/1079052924194787378/1148644535354085446/standard_2.gif?width=800&height=200](https://media.discordapp.net/attachments/1079052924194787378/1148644535354085446/standard_2.gif?width=800&height=200)") 
            .setFooter({ text: "PGM Economy System • 2024", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    }
};