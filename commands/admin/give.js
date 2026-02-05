const { PermissionFlagsBits } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Geçerli Para Birimleri
const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!give",
    aliases: ["!ver", "!set", "!ayarla"],
    description: "Admin para veya eşya verme komutu.",
    execute(client, msg, args) {
        // 1. Yetki Kontrolü
        if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return msg.reply("❌ Bu komut için yetkin yok.");
        }

        const user = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase();

        // 2. Argüman Kontrolü
        if (!user || isNaN(amount) || !target) {
            return msg.reply("Kullanım: `!give @user <miktar> <pgmcoin/ruby/kit_adi>`");
        }

        const data = loadJson("data.json");
        const market = loadJson("market.json"); // Market verisini yüklüyoruz
        
        ensureUser(data, user.id);

        // 3. İŞLEM MANTIĞI
        if (CURRENCIES.includes(target)) {
            // A) Para Birimi Verme
            data[user.id][target] += amount;
            saveJson("data.json", data);
            msg.reply(`✅ ${user.username} kullanıcısına **${amount} ${target}** eklendi.`);

        } else {
            // B) Kit Verme (KORUMA BURADA)
            
            // Eğer markette böyle bir ürün yoksa HATA VER
            if (!market[target]) {
                return msg.reply(`❌ **${target}** adında geçerli bir kit bulunamadı!\nSadece markette tanımlı olan kitleri verebilirsin.`);
            }

            // Kit geçerliyse ver
            data[user.id].kits[target] = (data[user.id].kits[target] || 0) + amount;

            // Eğer miktar eksi girildiyse ve 0'ın altına düştüyse sil
            if (data[user.id].kits[target] <= 0) {
                delete data[user.id].kits[target];
            }

            saveJson("data.json", data);
            msg.reply(`✅ ${user.username} kullanıcısına **${amount} adet ${target}** kiti verildi.`);
        }
    }
};