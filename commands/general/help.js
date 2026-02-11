const { loadText } = require("../../utils/dataManager");

module.exports = {
    name: "!yardım",
    aliases: ["!h", "!help", "!y", "!yardim"],
    description: "Yardım menüsünü gösterir.",
    execute(client, msg, args) {
        const content = loadText("yardim.txt", "Yardım dosyası (data/yardim.txt) bulunamadı.");
        msg.channel.send(content);
    }
};