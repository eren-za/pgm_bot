const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

const EMOJIS = {
    bronzkasa: "<:bronzkasa:1469400728442245347>",
    gumuskasa: "<:gumuskasa:1469400730589724828>",
    altinkasa: "<:altinkasa:1469400726043361443>",
    kit: "<:kit:1469016921478266880>",
    ruby: "<:ruby:1469015535911178280>",
    pgmcoin: "<:pgmcoin:1469015534493368442>",
    diamond: "<:diamond:1469015532836491274>",
    crystal: "<:crystal:1469015530760569058>"
};

const DISPLAY_NAMES = {
    pgmcoin: "PGM Coin",
    ruby: "Yakut",
    diamond: "Elmas",
    crystal: "Kristal"
};

function formatName(type, name) {
    if (type === "currency") return DISPLAY_NAMES[name] || name.toUpperCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function pickWeighted(pool) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const item of pool) {
        if (randomNum < item.weight) return item;
        randomNum -= item.weight;
    }
    return pool[0];
}

module.exports = {
    name: "!kasa",
    aliases: ["!open", "!kasaac"],
    description: "Envanterindeki kasayı açar (Eşyalar birleştirilir).",
    execute(client, msg, args) {
        const crateType = args[0]?.toLowerCase();
        if (!crateType || !EMOJIS[crateType]) return msg.reply("Kullanım: `!kasa <kasa_adi>`");

        const data = loadJson("data.json");
        const lootConfig = loadJson("loot.json");
        ensureUser(data, msg.author.id);

        const userCrates = data[msg.author.id].crates;
        if (!userCrates[crateType] || userCrates[crateType] <= 0) {
            return msg.reply(`❌ Envanterinde hiç **${EMOJIS[crateType]} ${crateType}** yok!`);
        }

        const crateData = lootConfig[crateType];
        if (!crateData) return msg.reply("❌ Ganimet tablosu bulunamadı.");

        // Kasayı düş
        data[msg.author.id].crates[crateType] -= 1;
        if (data[msg.author.id].crates[crateType] <= 0) delete data[msg.author.id].crates[crateType];

        let rollResults = {}; // Sonuçları burada toplayacağız

        let rollCount = crateData.rolls || 1;

        // Ödülleri Belirle
        for (let i = 0; i < rollCount; i++) {
            const drop = pickWeighted(crateData.pool);
            const key = `${drop.type}_${drop.name}`;

            if (!rollResults[key]) {
                rollResults[key] = { ...drop, totalAmount: 0 };
            }

            if (drop.type === "currency") {
                const amount = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
                rollResults[key].totalAmount += amount;
            } else if (drop.type === "kit") {
                rollResults[key].totalAmount += (drop.amount || 1);
            }
        }

        // Veritabanına işle ve mesaj hazırla
        let rewardLines = [];
        for (const key in rollResults) {
            const res = rollResults[key];
            if (res.type === "currency") {
                data[msg.author.id][res.name] += res.totalAmount;
                rewardLines.push(`## ${EMOJIS[res.name] || "💰"} +${res.totalAmount} ${formatName(res.type, res.name)}`);
            } else if (res.type === "kit") {
                data[msg.author.id].kits[res.name] = (data[msg.author.id].kits[res.name] || 0) + res.totalAmount;
                rewardLines.push(`## ${EMOJIS.kit} +${res.totalAmount} ${formatName(res.type, res.name)} Kiti`);
            }
        }

        saveJson("data.json", data);

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`${EMOJIS[crateType]} Kasa Açıldı!`)
            .setDescription(`**${msg.author.username}** kasayı açtı! İşte çıkanlar:\n\n` + rewardLines.join("\n"))
            .setFooter({ text: "PGM Loot System", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        msg.reply({ embeds: [embed] });
    }
};