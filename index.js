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

    const sendKey = async () => {
        try {
            const messages = await channel.messages.fetch({
                limit: 100
            });

            await channel.bulkDelete(messages, true);

            latestKey = generateKey(30);

            await channel.send(latestKey);

            console.log("Generated Key:", latestKey);
        } catch (error) {
            console.error(error);
        }
    };

    await sendKey();

    setInterval(
        sendKey,
        6 * 60 * 60 * 1000
    );
});

client.login(process.env.TOKEN);