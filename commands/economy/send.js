const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Para birimleri listesi
const CURRENCIES = ["pgmcoin", "ruby", "diamond", "crystal"];

module.exports = {
    name: "!send",
    aliases: ["!gonder", "!transfer"],
    description: "Başka bir kullanıcıya para veya kit gönderir.",
    execute(client, msg, args) {
        // 1. KULLANIM KONTROLLERİ
        const recipient = msg.mentions.users.first();
        const amount = parseInt(args[1]);
        const target = args[2]?.toLowerCase(); // Gönderilecek şeyin adı (pgmcoin veya kit adı)

        if (!recipient || isNaN(amount) || !target || amount <= 0) {
            return msg.reply("Kullanım: `!send @kullanici <miktar> <pgmcoin/ruby/kit_adi>`\nÖrnek: `!send @Ahmet 100 pgmcoin`");
        }

        if (recipient.id === msg.author.id) {
            return msg.reply("❌ Kendine gönderim yapamazsın.");
        }

        if (recipient.bot) {
            return msg.reply("❌ Botlara gönderim yapamazsın.");
        }

        // 2. VERİLERİ YÜKLE
        const data = loadJson("data.json");
        const market = loadJson("market.json");
        
        ensureUser(data, msg.author.id); // Gönderen
        ensureUser(data, recipient.id);  // Alan

        const senderData = data[msg.author.id];
        const recipientData = data[recipient.id];

        // 3. İŞLEM MANTIĞI
        if (CURRENCIES.includes(target)) {
            // A) PARA GÖNDERME
            
            // Bakiye Yeterli mi?
            if (senderData[target] < amount) {
                return msg.reply(`❌ Yeterli **${target}** bakiyen yok! \nSenin Bakiyen: ${senderData[target]}`);
            }

            // İşlem
            senderData[target] -= amount;
            recipientData[target] += amount;

            saveJson("data.json", data);
            msg.reply(`✅ **${recipient.username}** kişisine başarıyla **${amount} ${target}** gönderildi.\nKalan Bakiyen: ${senderData[target]} ${target}`);

        } else {
            // B) KİT GÖNDERME

            // Kit Markette Var mı? (Güvenlik)
            if (!market[target]) {
                return msg.reply(`❌ **${target}** adında geçerli bir kit bulunamadı.`);
            }

            // Gönderende Kit Var mı?
            const senderKitCount = senderData.kits[target] || 0;
            if (senderKitCount < amount) {
                return msg.reply(`❌ Envanterinde yeterli sayıda **${target}** kiti yok! \nSende Olan: ${senderKitCount}`);
            }

            // İşlem: Gönderenden Düş
            senderData.kits[target] -= amount;
            if (senderData.kits[target] <= 0) {
                delete senderData.kits[target];
            }

            // İşlem: Alıcıya Ekle
            recipientData.kits[target] = (recipientData.kits[target] || 0) + amount;

            saveJson("data.json", data);
            msg.reply(`📦 **${recipient.username}** kişisine başarıyla **${amount} adet ${target}** kiti transfer edildi.`);
        }
    }
};