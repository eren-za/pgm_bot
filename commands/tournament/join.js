const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");
const { getItemInfo, isValidItem } = require("../../utils/itemManager");

module.exports = {
    name: "!katıl",
    aliases: ["!join", "!katil"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        const mcName = args[0];
        const kitChoice = args[1]?.toLowerCase();

        // 1. Temel Girdi Kontrolü
        if (!mcName || !kitChoice) {
            return msg.reply(`${negative} Kullanım: \`!katıl <mc_adi> <kit_adi>\` veya \`!katıl <mc_adi> yok\``);
        }

        const data = loadJson("data.json");
        // participants.json yapısı pluginine uygun şekilde yükleniyor
        const pData = loadJson("participants.json") || { players: {} };
        if (!pData.players) pData.players = {};

        ensureUser(data, msg.author.id);

        // 2. Çift Kayıt Kontrolü
        if (pData.players[mcName]) {
            return msg.reply(`${negative} **${mcName}** zaten turnuvaya katılmış!`);
        }

        let finalKitName = "Kitsiz";
        let finalEmoji = "🛡️";

        if (kitChoice !== "yok") {
            // 3. Geçerli Kit Kontrolü (Merkezi Sistemden)
            const item = getItemInfo(kitChoice);
            
            if (!item || item.type !== "kit") {
                return msg.reply(`${negative} **${kitChoice}** adında geçerli bir kit bulunamadı.`);
            }

            // 4. Envanter Kontrolü
            const userKits = data[msg.author.id].kits || {};
            if (!userKits[kitChoice] || userKits[kitChoice] <= 0) {
                return msg.reply(`${negative} Envanterinde **${item.emoji} ${item.name}** kiti bulunmuyor.`);
            }

            // Kiti harca
            data[msg.author.id].kits[kitChoice] -= 1;
            if (data[msg.author.id].kits[kitChoice] <= 0) {
                delete data[msg.author.id].kits[kitChoice];
            }

            finalKitName = item.name;
            finalEmoji = item.emoji;
            pData.players[mcName] = kitChoice; // Plugine giden ham veri (örn: 'madenci')
        } else {
            pData.players[mcName] = "yok";
        }

        // Kayıt İşlemleri
        saveJson("data.json", data);
        saveJson("participants.json", pData);

        msg.reply(`${check} **${mcName}** turnuvaya **${finalEmoji} ${finalKitName}** seçimiyle katıldı.`);
    }
};