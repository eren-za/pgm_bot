const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");
const { getItemInfo, isValidItem, getItemsByType } = require("../../utils/itemManager");

module.exports = {
    name: "!kasa",
    aliases: ["!open", "!kasaac", "!kasaaç", "!kasaç"],
    execute(client, msg, args) {
        const crateType = args[0]?.toLowerCase();
        const negative = getLang("negative").emoji;

        // 1. Girdi ve Geçerlilik Kontrolü
        if (!crateType || !isValidItem(crateType)) {
            return msg.reply(`${negative} Kullanım: \`!kasa <kasa_adi>\``);
        }

        const info = getItemInfo(crateType);
        const data = loadJson("data.json");
        const lootTable = loadJson("loot.json");
        
        ensureUser(data, msg.author.id);
        const p = data[msg.author.id];

        // 2. Envanter Kontrolü
        if (!p.crates || !p.crates[crateType] || p.crates[crateType] <= 0) {
            return msg.reply(`${negative} Envanterinde hiç **${info.emoji} ${info.name}** yok! Kasa almak için \`!market\``);
        }

        // 3. Ganimet Tablosu Kontrolü
        const possibleLoot = lootTable[crateType];
        if (!possibleLoot) {
            return msg.reply(`${negative} Bu kasa için ganimet ayarları bulunamadı.`);
        }

        // Kasayı eksilt
        p.crates[crateType] -= 1;
        if (p.crates[crateType] <= 0) delete p.crates[crateType];

        let rewards = [];

        // 4. Şans ve Ödül Hesaplama
        possibleLoot.forEach(item => {
            const roll = Math.random() * 100;

            if (roll <= item.chance) {
                const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                
                if (item.type === "currency") {
                    const rewardInfo = getItemInfo(item.name);
                    p[item.name] = (p[item.name] || 0) + amount;
                    rewards.push(`## ${rewardInfo.emoji} +${amount} ${rewardInfo.name}`);
                } 
                else if (item.type === "random_kit") {
                    // Kitleri dinamik olarak çek
                    const allKits = Object.keys(getItemsByType("kit"));
                    const kitName = allKits[Math.floor(Math.random() * allKits.length)];
                    const kitInfo = getItemInfo(kitName);
                    
                    if (!p.kits) p.kits = {};
                    p.kits[kitName] = (p.kits[kitName] || 0) + amount;
                    rewards.push(`## ${kitInfo.emoji} +${amount} ${kitInfo.name} Kiti`);
                }
                else if (item.type === "crate") {
                    const rewardInfo = getItemInfo(item.name);
                    if (!p.crates) p.crates = {};
                    p.crates[item.name] = (p.crates[item.name] || 0) + amount;
                    rewards.push(`## ${rewardInfo.emoji} +${amount} ${rewardInfo.name}`);
                }
            }
        });

        saveJson("data.json", data);

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`${info.emoji} ${info.name} Açıldı!`)
            .setDescription(`**${msg.author.username}** kasayı açtı! İşte çıkanlar:\n\n` + (rewards.length > 0 ? rewards.join("\n") : "### _Maalesef boş çıktı..._"))
            .setFooter({ text: "PGM Loot System" })
            .setTimestamp();

        msg.reply({ embeds: [embed] });
    }
};