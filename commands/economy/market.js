const { loadText } = require("../../utils/dataManager");

module.exports = {
    name: "!market",
    aliases: ["!shop"],
    description: "Marketteki ürünleri listeler.",
    execute(client, msg, args) {
        const content = loadText("market.txt");
        msg.channel.send(content);
    }
};