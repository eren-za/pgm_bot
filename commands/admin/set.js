const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!set",
    aliases: ["!ayarla", "!sabitle"],
    description: "Kullanıcının bakiyesini, kasasını veya eşyasını direkt ayarlar.",
    execute(client, msg, args) {
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply("❌ Bu komut için yetkin yok.");
        }

        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        if (!user || isNaN(amount) || !target) {
            return msg.reply("Kullanım: `!set @user <yeni_miktar> <birim_adi/kasa_adi/kit_adi>`");
        }

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        const loot = loadJson("loot.json");
        
        ensureUser(data, user.id);

        // --- A) PARA BİRİMİ ---
        if (CURRENCIES.includes(target)) {
            data[user.id][target] = amount;
            if (data[user.id][target] < 0) data[user.id][target] = 0;

            saveJson("data.json", data);
            msg.reply(`✅ ${user.username} kullanıcısının **${target}** bakiyesi **${amount}** olarak ayarlandı.`);
        }
        
        // --- B) KASA İŞLEMİ (YENİ) ---
        else if (loot[target]) {
            if (!data[user.id].crates) data[user.id].crates = {};

            if (amount <= 0) {
                delete data[user.id].crates[target];
                msg.reply(`✅ ${user.username} kullanıcısının **${target}** kasaları silindi.`);
            } else {
                data[user.id].crates[target] = amount;
                msg.reply(`✅ ${user.username} kullanıcısının **${target}** kasa sayısı **${amount}** adet olarak ayarlandı.`);
            }
            saveJson("data.json", data);
        }

        // --- C) KİT İŞLEMİ ---
        else if (market[target]) {
            if (amount <= 0) {
                delete data[user.id].kits[target];
                msg.reply(`✅ ${user.username} kullanıcısının **${target}** kiti silindi.`);
            } else {
                data[user.id].kits[target] = amount;
                msg.reply(`✅ ${user.username} kullanıcısının **${target}** miktarı **${amount}** adet olarak ayarlandı.`);
            }
            saveJson("data.json", data);
        }

        // --- D) HATA ---
        else {
            msg.reply(`❌ **${target}** adında geçerli bir para birimi, kasa veya kit bulunamadı!`);
        }
    }
};