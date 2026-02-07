const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

const AVAILABLE_KITS = ["madenci", "nisanci", "demirci"];

module.exports = {
    name: "!kasa",
    aliases: ["!open", "!kasaac"],
    execute(client, msg, args) {
        const crateType = args[0]?.toLowerCase();
        const info = getLang(crateType);
        const negative = getLang("negative").emoji;

        if (!crateType) {
            return msg.reply(`${negative} Kullanım: \`!kasa <kasa_adi>\``);
        }

        const data = loadJson("data.json");
        const lootTable = loadJson("loot.json");
        
        ensureUser(data, msg.author.id);

        const userCrates = data[msg.author.id].crates;

        if (!userCrates[crateType] || userCrates[crateType] <= 0) {
            return msg.reply(`${negative} Envanterinde hiç **${info.emoji} ${info.name}** yok!`);
        }

        const possibleLoot = lootTable[crateType];
        if (!possibleLoot) {
            return msg.reply(`${negative} Bu kasa için ganimet ayarları bulunamadı.`);
        }

        data[msg.author.id].crates[crateType] -= 1;
        if (data[msg.author.id].crates[crateType] <= 0) delete data[msg.author.id].crates[crateType];

        let rewards = [];

        possibleLoot.forEach(item => {
            const roll = Math.random() * 100;

            if (roll <= item.chance) {
                const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;

                if (item.type === "currency") {
                    data[msg.author.id][item.name] = (data[msg.author.id][item.name] || 0) + amount;
                    const rewardInfo = getLang(item.name);
                    rewards.push(`## ${rewardInfo.emoji} +${amount} ${rewardInfo.name}`);
                } 
                else if (item.type === "random_kit") {
                    const kitName = AVAILABLE_KITS[Math.floor(Math.random() * AVAILABLE_KITS.length)];
                    const kitInfo = getLang(kitName);
                    
                    if (!data[msg.author.id].kits) data[msg.author.id].kits = {};
                    data[msg.author.id].kits[kitName] = (data[msg.author.id].kits[kitName] || 0) + amount;

                    rewards.push(`## ${kitInfo.emoji} +${amount} ${kitInfo.name} Kiti`);
                }
                else if (item.type === "crate") {
                    if (!data[msg.author.id].crates) data[msg.author.id].crates = {};
                    data[msg.author.id].crates[item.name] = (data[msg.author.id].crates[item.name] || 0) + amount;
                    
                    const rewardInfo = getLang(item.name);
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