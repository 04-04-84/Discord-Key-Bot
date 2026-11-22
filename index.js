
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

let latestKey = null;

// Roblox API
app.get("/", (req, res) => {
    res.send("Discord Key API is online!");
});

app.get("/key", (req, res) => {
    if (!latestKey) {
        return res.status(404).json({
            success: false,
            error: "No key generated yet"
        });
    }

    res.json({
        success: true,
        key: latestKey
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
});

// Generate a secure random key
function generateKey(length = 30) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let key = "";

    for (let i = 0; i < length; i++) {
        key += chars[crypto.randomInt(chars.length)];
    }

    return key;
}

// Discord bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        let channel = null;

        for (const guild of client.guilds.cache.values()) {
            const channels = await guild.channels.fetch();

            channel = channels.find(c =>
                c &&
                c.name === "key" &&
                c.isTextBased() &&
                typeof c.send === "function"
            );

            if (channel) break;
        }

        if (!channel) {
            console.error("Could not find #key channel!");
            return;
        }

        let previousMessage = null;

        async function sendKey() {
            try {
                const newKey = generateKey(30);
                const message = await channel.send(newKey);

                latestKey = newKey;

                console.log("Generated Key:", latestKey);

                if (previousMessage) {
                    try {
                        await previousMessage.delete();
                    } catch (error) {
                        console.log("Could not delete previous key.");
                    }
                }

                previousMessage = message;
            } catch (error) {
                console.error("Key generation failed:", error);
            }
        }

        await sendKey();

        setInterval(sendKey, 6 * 60 * 60 * 1000);

        console.log("6-hour key generation enabled.");

    } catch (error) {
        console.error("Discord setup error:", error);
    }
});

if (!process.env.TOKEN) {
    console.error("Missing TOKEN environment variable!");
} else {
    client.login(process.env.TOKEN).catch(error => {
        console.error("Discord login failed:", error);
    });
}
