const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

module.exports = {
    name: "!katil",
    description: "Turnuvaya katılım sağlar.",
    execute(client, msg, args) {
        const mcName = args[0];
        const kitChoice = args[1]?.toLowerCase();

        if (!mcName || !kitChoice) {
            return msg.reply("Kullanım: `!katil <mc_adi> <kit>` veya `!katil <mc_adi> yok`");
        }

        const data = loadJson("data.json");
        const pData = loadJson("participants.json", { players: {} });
        ensureUser(data, msg.author.id);

        if (pData.players && pData.players[mcName]) {
            return msg.reply(`❌ **${mcName}** zaten turnuvaya katılmış!`);
        }

        if (kitChoice === "yok") {
            pData.players[mcName] = "Kitsiz";
        } else {
            if (!data[msg.author.id].kits[kitChoice]) {
                return msg.reply(`❌ Envanterinde **${kitChoice}** kiti bulunmuyor.`);
            }
            data[msg.author.id].kits[kitChoice] -= 1;
            
            // Kit sayısı 0 ise listeden sil
            if (data[msg.author.id].kits[kitChoice] === 0) {
                delete data[msg.author.id].kits[kitChoice];
            }
            
            pData.players[mcName] = kitChoice;
        }

        saveJson("data.json", data);
        saveJson("participants.json", pData);
        msg.reply(`✅ **${mcName}** turnuvaya **${kitChoice === "yok" ? "Kitsiz" : kitChoice}** olarak katıldı.`);
    }
};