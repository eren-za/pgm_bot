const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

const AVAILABLE_KITS = ["madenci", "nisanci", "demirci"];
const COOLDOWN = 6 * 60 * 60 * 1000;

module.exports = {
    name: "!daily",
    aliases: ["!gunluk"],
    async execute(client, msg, args) {
        const data = loadJson("data.json");
        const loot = loadJson("loot.json");
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;
        const userId = msg.author.id;

        ensureUser(data, userId);
        const p = data[userId];
        const now = Date.now();

        if (p.lastDaily && (now - p.lastDaily) < COOLDOWN) {
            const remaining = COOLDOWN - (now - p.lastDaily);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

            return msg.reply(`${negative} **Ödülünü zaten aldın!** Yeniden almana **${hours} saat ${minutes} dakika** var.`);
        }

        const dailyLoot = loot["daily"];
        let rewards = [];

        dailyLoot.forEach(item => {
            if ((Math.random() * 100) <= item.chance) {
                const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                const info = getLang(item.name);

                if (item.type === "currency") {
                    p[item.name] += amount;
                    rewards.push(`## ${info.emoji} +${amount} ${info.name}`);
                } 
                else if (item.type === "random_kit") {
                    const kitName = AVAILABLE_KITS[Math.floor(Math.random() * AVAILABLE_KITS.length)];
                    const kitInfo = getLang(kitName);
                    p.kits[kitName] = (p.kits[kitName] || 0) + amount;
                    rewards.push(`## ${kitInfo.emoji} +${amount} ${kitInfo.name} Kiti`);
                }
                else if (item.type === "crate") {
                    p.crates[item.name] = (p.crates[item.name] || 0) + amount;
                    rewards.push(`## ${info.emoji} +${amount} ${info.name}`);
                }
            }
        });

        p.lastDaily = now;
        saveJson("data.json", data);

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setAuthor({ name: "Günlük Ödül!", iconURL: msg.author.displayAvatarURL() })
            .setDescription(rewards.length > 0 ? `${check} Ödüller eklendi:\n\n${rewards.join("\n")}` : "Şansına bugün bir şey çıkmadı.");

        msg.reply({ embeds: [embed] });
    }
};