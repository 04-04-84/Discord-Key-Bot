const { Client, GatewayIntentBits } = require("discord.js");

let latestKey = "";

function generateKey(length = 30) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let key = "";

    for (let i = 0; i < length; i++) {
        key += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return key;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const channel = client.channels.cache.find(
        c => c.name === "key"
    );

    if (!channel) {
        console.log("Could not find #key channel");
        return;
    }

    const sendKey = () => {
        latestKey = generateKey(30);

        channel.send(latestKey);

        console.log("Generated Key:", latestKey);
    };

    sendKey();

    setInterval(sendKey, 60 * 1000);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    console.log(
        "MESSAGE:",
        message.channel.name,
        "|",
        message.content
    );
});

client.login(process.env.TOKEN);