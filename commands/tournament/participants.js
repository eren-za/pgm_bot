const { loadJson } = require("../../utils/dataManager");

module.exports = {
    name: "!part",
    description: "Turnuva katılımcılarını listeler.",
    execute(client, msg, args) {
        const pData = loadJson("participants.json", { players: {} });
        const players = pData.players || {};
        
        const list = Object.entries(players)
            .map(([name, kit]) => `• **${name}**: ${kit}`)
            .join("\n") || "Henüz katılım yok.";
        
        msg.channel.send(`**🏆 Turnuva Katılımcıları**\n${list}`);
    }
};