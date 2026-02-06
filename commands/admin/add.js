const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!add",
    aliases: ["!ekle", "!ver"],
    description: "Kullanıcılara veya tüm sunucuya ekleme yapar.",
    async execute(client, msg, args) {
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply("❌ Bu komut için yetkin yok.");
        }

        const isEveryone = msg.mentions.everyone || args[0] === "@everyone" || args[0] === "everyone";
        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        if ((!user && !isEveryone) || isNaN(amount) || !target) {
            return msg.reply("Kullanım: `!add @user/<@everyone> <miktar> <birim>`");
        }

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        const loot = loadJson("loot.json");

        let targetIds = [];

        if (isEveryone) {
            const members = await msg.guild.members.fetch();
            targetIds = members.filter(m => !m.user.bot).map(m => m.user.id);
        } else {
            targetIds = [user.id];
        }

        let isValidTarget = false;
        if (CURRENCIES.includes(target) || loot[target] || market[target]) {
            isValidTarget = true;
        }

        if (!isValidTarget) {
            return msg.reply(`❌ **${target}** adında geçerli bir para birimi, kasa veya kit bulunamadı!`);
        }

        targetIds.forEach(id => {
            ensureUser(data, id);

            if (CURRENCIES.includes(target)) {
                data[id][target] += amount;
                if (data[id][target] < 0) data[id][target] = 0;
            } 
            else if (loot[target]) {
                if (!data[id].crates) data[id].crates = {};
                data[id].crates[target] = (data[id].crates[target] || 0) + amount;
                if (data[id].crates[target] <= 0) delete data[id].crates[target];
            } 
            else if (market[target]) {
                if (!data[id].kits) data[id].kits = {};
                data[id].kits[target] = (data[id].kits[target] || 0) + amount;
                if (data[id].kits[target] <= 0) delete data[id].kits[target];
            }
        });

        saveJson("data.json", data);
        msg.reply(`✅ **${isEveryone ? "Sunucudaki Tüm Üyelere" : user.username}** için işlem başarıyla uygulandı.`);
    }
};