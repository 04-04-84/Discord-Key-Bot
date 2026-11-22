const { Client, GatewayIntentBits } = require("discord.js");

let latestKey = "";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    console.log(
        "MESSAGE:",
        message.channel.name,
        "|",
        message.content
    );

    if (message.channel.name === "key") {
        latestKey = message.content;
        console.log("Latest Key:", latestKey);
    }
});

client.login(process.env.TOKEN);