const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getItemInfo, isValidItem } = require("../../utils/itemManager");

module.exports = {
    name: "!add",
    aliases: ["!ekle", "!give"],
    description: "Kullanıcılara veya tüm sunucuya birim/eşya ekleme yapar.",
    async execute(client, msg, args) {
        const langCheck = "<:check:1469662282278764638>";
        const langNegative = "<:negativecheck:1469662284224925727>";

        // Yetki Kontrolü
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply(`${langNegative} Bu komut için yetkin yok.`);
        }

        const isEveryone = msg.mentions.everyone || args[0] === "@everyone" || args[0] === "everyone";
        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const targetKey = args[2]?.toLowerCase();

        // Girdi Kontrolü
        if ((!user && !isEveryone) || isNaN(amount) || !targetKey) {
            return msg.reply(`${langNegative} **Doğru Kullanım:** \`!add @user/everyone <miktar> <birim>\``);
        }

        // Merkezi Sistem Kontrolü
        if (!isValidItem(targetKey)) {
            return msg.reply(`${langNegative} **${targetKey}** adında geçerli bir birim/eşya bulunamadı!`);
        }

        const data = loadJson("data.json");
        const item = getItemInfo(targetKey);

        // Hedef Listesini Belirle
        let targetIds = [];
        if (isEveryone) {
            const members = await msg.guild.members.fetch();
            targetIds = members.filter(m => !m.user.bot).map(m => m.user.id);
        } else {
            targetIds = [user.id];
        }

        // Ekleme İşlemi
        targetIds.forEach(id => {
            ensureUser(data, id);
            const p = data[id];

            if (item.type === "currency") {
                // pgmcoin, cevher, elmas gibi doğrudan ana objeye ekle
                p[targetKey] = (p[targetKey] || 0) + amount;
                if (p[targetKey] < 0) p[targetKey] = 0;
            } 
            else if (item.type === "crate") {
                // Kasa ise crates objesine ekle
                if (!p.crates) p.crates = {};
                p.crates[targetKey] = (p.crates[targetKey] || 0) + amount;
                if (p.crates[targetKey] <= 0) delete p.crates[targetKey];
            } 
            else if (item.type === "kit") {
                // Kit ise kits objesine ekle
                if (!p.kits) p.kits = {};
                p.kits[targetKey] = (p.kits[targetKey] || 0) + amount;
                if (p.kits[targetKey] <= 0) delete p.kits[targetKey];
            }
        });

        saveJson("data.json", data);

        const targetDisplayName = isEveryone ? "@everyone" : `**${user.username}**`;
        const actionText = amount >= 0 ? "eklendi" : "çıkarıldı";
        
        msg.reply(`${langCheck} ${targetDisplayName} için **${Math.abs(amount)}** ${item.emoji} **${item.name}** ${actionText}.`);
    }
};