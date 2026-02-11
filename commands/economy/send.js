const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");
const { getItemInfo, isValidItem, isTradeable } = require("../../utils/itemManager");

module.exports = {
    name: "!gönder",
    aliases: ["!gonder", "!transfer", "!send"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        const recipient = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const targetKey = args[2]?.toLowerCase();

        // 1. Temel Girdi Kontrolleri
        if (!recipient || isNaN(amount) || !targetKey || amount <= 0) {
            return msg.reply(`${negative} Kullanım: \`!gönder @kullanici <miktar> <birim>\``);
        }

        if (recipient.id === msg.author.id) {
            return msg.reply(`${negative} Kendine gönderim yapamazsın.`);
        }

        if (recipient.bot) {
            return msg.reply(`${negative} Botlara gönderim yapamazsın.`);
        }

        // 2. Merkezi Sistem Kontrolü
        if (!isValidItem(targetKey)) {
            return msg.reply(`${negative} **${targetKey}** adında geçerli bir birim bulunamadı.`);
        }

        if (!isTradeable(targetKey)) {
            return msg.reply(`${negative} **${targetKey}** birimi başkasına transfer edilemez.`);
        }

        const data = loadJson("data.json");
        const item = getItemInfo(targetKey);
        
        ensureUser(data, msg.author.id);
        ensureUser(data, recipient.id);

        const sender = data[msg.author.id];
        const receiver = data[recipient.id];

        // 3. Eşya Türüne Göre Transfer Mantığı
        if (item.type === "currency") {
            // Para Birimi Transferi
            if ((sender[targetKey] || 0) < amount) {
                return msg.reply(`${negative} Yeterli **${item.emoji} ${item.name}** bakiyen yok!`);
            }
            sender[targetKey] -= amount;
            receiver[targetKey] = (receiver[targetKey] || 0) + amount;
        } 
        else if (item.type === "crate") {
            // Kasa Transferi
            if (!sender.crates || !sender.crates[targetKey] || sender.crates[targetKey] < amount) {
                return msg.reply(`${negative} Envanterinde yeterli **${item.emoji} ${item.name}** yok!`);
            }
            sender.crates[targetKey] -= amount;
            if (sender.crates[targetKey] <= 0) delete sender.crates[targetKey];

            if (!receiver.crates) receiver.crates = {};
            receiver.crates[targetKey] = (receiver.crates[targetKey] || 0) + amount;
        } 
        else if (item.type === "kit") {
            // Kit Transferi
            if (!sender.kits || !sender.kits[targetKey] || sender.kits[targetKey] < amount) {
                return msg.reply(`${negative} Envanterinde yeterli **${item.emoji} ${item.name}** kiti yok!`);
            }
            sender.kits[targetKey] -= amount;
            if (sender.kits[targetKey] <= 0) delete sender.kits[targetKey];

            if (!receiver.kits) receiver.kits = {};
            receiver.kits[targetKey] = (receiver.kits[targetKey] || 0) + amount;
        }

        saveJson("data.json", data);

        // 4. Onay Mesajı
        const unitLabel = item.type === "currency" ? "" : " adet";
        msg.reply(`${check} **${recipient.username}** kişisine **${amount}${unitLabel} ${item.emoji} ${item.name}** transfer edildi.`);
    }
};