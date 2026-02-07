const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!set",
    aliases: ["!ayarla", "!sabitle"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply(`${negative} Bu komut için yetkin yok.`);
        }

        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        if (!user || isNaN(amount) || !target) {
            return msg.reply(`${negative} Kullanım: \`!set @user <miktar> <birim>\``);
        }

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        const loot = loadJson("loot.json");
        const info = getLang(target);
        
        ensureUser(data, user.id);

        if (CURRENCIES.includes(target)) {
            data[user.id][target] = amount < 0 ? 0 : amount;
            saveJson("data.json", data);
            msg.reply(`${check} **${user.username}** kullanıcısının **${info.emoji} ${info.name}** miktarı **${data[user.id][target]}** olarak ayarlandı.`);
        }
        else if (loot[target]) {
            if (!data[user.id].crates) data[user.id].crates = {};
            if (amount <= 0) {
                delete data[user.id].crates[target];
                msg.reply(`${check} **${user.username}** kullanıcısının **${info.emoji} ${info.name}** eşyaları sıfırlandı.`);
            } else {
                data[user.id].crates[target] = amount;
                msg.reply(`${check} **${user.username}** kullanıcısının **${info.emoji} ${info.name}** miktarı **${amount}** olarak ayarlandı.`);
            }
            saveJson("data.json", data);
        }
        else if (market[target]) {
            if (!data[user.id].kits) data[user.id].kits = {};
            if (amount <= 0) {
                delete data[user.id].kits[target];
                msg.reply(`${check} **${user.username}** kullanıcısının **${info.emoji} ${info.name}** eşyaları sıfırlandı.`);
            } else {
                data[user.id].kits[target] = amount;
                msg.reply(`${check} **${user.username}** kullanıcısının **${info.emoji} ${info.name}** miktarı **${amount}** olarak ayarlandı.`);
            }
            saveJson("data.json", data);
        }
        else {
            msg.reply(`${negative} **${target}** adında geçerli bir birim bulunamadı.`);
        }
    }
};