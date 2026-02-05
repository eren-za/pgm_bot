const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Güncel para birimleri listesi
const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!give",
    aliases: ["!ver", "!set", "!ayarla"],
    description: "Admin para veya eşya verme komutu.",
    execute(client, msg, args) {
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply("❌ Bu komut için yetkin yok.");
        }

        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        if (!user || isNaN(amount) || !target) {
            return msg.reply("Kullanım: `!give @user <miktar> <pgmcoin/ruby/diamond/crystal/kit_adi>`");
        }

        const data = loadJson("data.json");
        ensureUser(data, user.id);

        if (CURRENCIES.includes(target)) {
            // Para birimi ekle
            data[user.id][target] += amount;
        } else {
            // Kit ekle
            data[user.id].kits[target] = (data[user.id].kits[target] || 0) + amount;
            if (data[user.id].kits[target] <= 0) delete data[user.id].kits[target];
        }

        saveJson("data.json", data);
        msg.reply(`✅ ${user.username} kullanıcısına **${amount} ${target}** başarıyla tanımlandı.`);
    }
};