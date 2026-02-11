const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");
const { getItemInfo, getItemsByType } = require("../../utils/itemManager");

const COOLDOWN = 6 * 60 * 60 * 1000;

module.exports = {
    name: "!günlük",
    aliases: ["!gunluk", "!daily"],
    async execute(client, msg, args) {
        const data = loadJson("data.json");
        const loot = loadJson("loot.json");
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;
        const userId = msg.author.id;

        ensureUser(data, userId);
        const p = data[userId];
        const now = Date.now();

        // Bekleme Süresi Kontrolü
        if (p.lastDaily && (now - p.lastDaily) < COOLDOWN) {
            const remaining = COOLDOWN - (now - p.lastDaily);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

            return msg.reply(`${negative} **Ödülünü zaten aldın!** Yeniden almana **${hours} saat ${minutes} dakika** var.`);
        }

        const dailyLoot = loot["daily"];
        if (!dailyLoot) return msg.reply(`${negative} Günlük ödül tablosu bulunamadı.`);
        
        let rewards = [];

        dailyLoot.forEach(reward => {
            if ((Math.random() * 100) <= reward.chance) {
                const amount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
                
                if (reward.type === "currency") {
                    const info = getItemInfo(reward.name);
                    
                    // Güvenlik Kontrolü: info null ise hatayı yakala
                    if (!info) {
                        console.error(`⚠️ PGM HATA: items.json içinde '${reward.name}' birimi bulunamadı!`);
                        return; 
                    }

                    p[reward.name] = (p[reward.name] || 0) + amount;
                    rewards.push(`## ${info.emoji} +${amount} ${info.name}`);
                } 
                else if (reward.type === "random_kit") {
                    const allKits = Object.keys(getItemsByType("kit"));
                    if (allKits.length === 0) return;

                    const kitName = allKits[Math.floor(Math.random() * allKits.length)];
                    const kitInfo = getItemInfo(kitName);
                    
                    if (!kitInfo) return;

                    if (!p.kits) p.kits = {};
                    p.kits[kitName] = (p.kits[kitName] || 0) + amount;
                    rewards.push(`## ${kitInfo.emoji} +${amount} ${kitInfo.name} Kiti`);
                }
                else if (reward.type === "crate") {
                    const info = getItemInfo(reward.name);
                    
                    if (!info) {
                        console.error(`⚠️ PGM HATA: items.json içinde '${reward.name}' kasası bulunamadı!`);
                        return;
                    }

                    if (!p.crates) p.crates = {};
                    p.crates[reward.name] = (p.crates[reward.name] || 0) + amount;
                    rewards.push(`## ${info.emoji} +${amount} ${info.name}`);
                }
            }
        });

        p.lastDaily = now;
        saveJson("data.json", data);

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setAuthor({ name: `${msg.author.username} • Günlük Ödül`, iconURL: msg.author.displayAvatarURL() })
            .setDescription(rewards.length > 0 ? `${check} Tebrikler! Ödüllerin hesabına eklendi:\n\n${rewards.join("\n")}` : "Şansına bugün hiçbir ödül isabet etmedi...")
            .setFooter({ text: "PGM Günlük Sistem" })
            .setTimestamp();

        msg.reply({ embeds: [embed] });
    }
};