const { loadText } = require("../../utils/dataManager");

module.exports = {
    name: "!yardim",
    aliases: ["!h", "!help", "!y", "!pgm"],
    description: "Yardım menüsünü gösterir.",
    execute(client, msg, args) {
        const content = loadText("yardim.txt", "Yardım dosyası (data/yardim.txt) bulunamadı.");
        msg.channel.send(content);
    }
};