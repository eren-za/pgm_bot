const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

const CURRENCIES = ["pgmcoin", "cevher"];

module.exports = {
    name: "!send",
    aliases: ["!gonder", "!transfer", "!yolla"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        const recipient = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        if (!recipient || isNaN(amount) || !target || amount <= 0) {
            return msg.reply(`${negative} Kullanım: \`!send @kullanici <miktar> <birim>\``);
        }

        if (recipient.id === msg.author.id) {
            return msg.reply(`${negative} Kendine gönderim yapamazsın.`);
        }

        if (recipient.bot) {
            return msg.reply(`${negative} Botlara gönderim yapamazsın.`);
        }

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        const loot = loadJson("loot.json");
        const info = getLang(target);
        
        ensureUser(data, msg.author.id);
        ensureUser(data, recipient.id);

        const senderData = data[msg.author.id];
        const recipientData = data[recipient.id];

        if (CURRENCIES.includes(target)) {
            if ((senderData[target] || 0) < amount) {
                return msg.reply(`${negative} Yeterli **${info.emoji} ${info.name}** bakiyen yok!`);
            }

            senderData[target] -= amount;
            recipientData[target] = (recipientData[target] || 0) + amount;

            saveJson("data.json", data);
            msg.reply(`${check} **${recipient.username}** kişisine **${amount} ${info.emoji} ${info.name}** gönderildi.`);
        } 
        else if (loot[target]) {
            if (!senderData.crates || !senderData.crates[target] || senderData.crates[target] < amount) {
                return msg.reply(`${negative} Envanterinde yeterli **${info.emoji} ${info.name}** yok!`);
            }

            senderData.crates[target] -= amount;
            if (senderData.crates[target] <= 0) delete senderData.crates[target];

            if (!recipientData.crates) recipientData.crates = {};
            recipientData.crates[target] = (recipientData.crates[target] || 0) + amount;

            saveJson("data.json", data);
            msg.reply(`${check} **${recipient.username}** kişisine **${amount} adet ${info.emoji} ${info.name}** gönderildi.`);
        }
        else if (market[target]) {
            if (!senderData.kits || !senderData.kits[target] || senderData.kits[target] < amount) {
                return msg.reply(`${negative} Envanterinde yeterli **${info.emoji} ${info.name}** kiti yok!`);
            }

            senderData.kits[target] -= amount;
            if (senderData.kits[target] <= 0) delete senderData.kits[target];

            if (!recipientData.kits) recipientData.kits = {};
            recipientData.kits[target] = (recipientData.kits[target] || 0) + amount;

            saveJson("data.json", data);
            msg.reply(`${check} **${recipient.username}** kişisine **${amount} adet ${info.emoji} ${info.name}** transfer edildi.`);
        } 
        else {
            msg.reply(`${negative} **${target}** adında geçerli bir birim bulunamadı.`);
        }
    }
};