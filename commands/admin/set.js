const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getItemInfo, isValidItem } = require("../../utils/itemManager");
const { getLang } = require("../../utils/formatter");

module.exports = {
    name: "!set",
    aliases: ["!ayarla"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        // Yetki Kontrolü
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply(`${negative} Bu komut için yetkin yok.`);
        }

        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const targetKey = args[2]?.toLowerCase();

        // Girdi Kontrolü
        if (!user || isNaN(amount) || !targetKey) {
            return msg.reply(`${negative} Kullanım: \`!set @user <miktar> <birim>\``);
        }

        // Merkezi Sistem Kontrolü
        if (!isValidItem(targetKey)) {
            return msg.reply(`${negative} **${targetKey}** adında geçerli bir birim/eşya bulunamadı.`);
        }

        const data = loadJson("data.json");
        const item = getItemInfo(targetKey);
        
        ensureUser(data, user.id);
        const p = data[user.id];

        // Eşya Tipine Göre Ayarlama İşlemi
        if (item.type === "currency") {
            // Cüzdan birimi ayarlama
            p[targetKey] = amount < 0 ? 0 : amount;
        } 
        else if (item.type === "crate") {
            // Kasa ayarlama
            if (!p.crates) p.crates = {};
            if (amount <= 0) {
                delete p.crates[targetKey];
            } else {
                p.crates[targetKey] = amount;
            }
        } 
        else if (item.type === "kit") {
            // Kit ayarlama
            if (!p.kits) p.kits = {};
            if (amount <= 0) {
                delete p.kits[targetKey];
            } else {
                p.kits[targetKey] = amount;
            }
        }

        saveJson("data.json", data);

        // Bilgilendirme Mesajı
        if (amount <= 0 && item.type !== "currency") {
            msg.reply(`${check} **${user.username}** kullanıcısının **${item.emoji} ${item.name}** eşyaları sıfırlandı.`);
        } else {
            msg.reply(`${check} **${user.username}** kullanıcısının **${item.emoji} ${item.name}** miktarı **${amount}** olarak ayarlandı.`);
        }
    }
};