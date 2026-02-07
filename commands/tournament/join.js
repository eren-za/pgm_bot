const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

module.exports = {
    name: "!katil",
    aliases: ["!join","!kayit"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;

        const mcName = args[0];
        const kitChoice = args[1]?.toLowerCase();

        if (!mcName || !kitChoice) {
            return msg.reply(`${negative} Kullanım: \`!katil <mc_adi> <kit_adi>\` veya \`!katil <mc_adi> yok\``);
        }

        const data = loadJson("data.json");
        const pData = loadJson("participants.json", { players: {} });
        ensureUser(data, msg.author.id);

        if (pData.players && pData.players[mcName]) {
            return msg.reply(`${negative} **${mcName}** zaten turnuvaya katılmış!`);
        }

        if (kitChoice === "yok") {
            pData.players[mcName] = "Kitsiz";
        } else {
            const kitInfo = getLang(kitChoice);
            
            if (!data[msg.author.id].kits || !data[msg.author.id].kits[kitChoice]) {
                return msg.reply(`${negative} Envanterinde **${kitInfo.emoji} ${kitInfo.name}** kiti bulunmuyor.`);
            }

            data[msg.author.id].kits[kitChoice] -= 1;
            if (data[msg.author.id].kits[kitChoice] <= 0) {
                delete data[msg.author.id].kits[kitChoice];
            }
            
            pData.players[mcName] = kitChoice;
        }

        saveJson("data.json", data);
        saveJson("participants.json", pData);

        const finalKitInfo = kitChoice === "yok" ? { name: "Kitsiz", emoji: "🛡️" } : getLang(kitChoice);
        msg.reply(`${check} **${mcName}** turnuvaya **${finalKitInfo.emoji} ${finalKitInfo.name}** olarak katıldı.`);
    }
};