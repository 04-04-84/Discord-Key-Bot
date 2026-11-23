
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

let latestKey = null;
let rotationRunning = false;

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

function generateKey(length = 30) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let key = "";

    for (let i = 0; i < length; i++) {
        key += chars[crypto.randomInt(chars.length)];
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

        console.log(`Found channel: #${channel.name}`);

        async function deleteAllMessages() {
            let before = undefined;

            while (true) {
                const messages = await channel.messages.fetch({
                    limit: 100,
                    before
                });

                if (messages.size === 0) break;

                const oldestMessage = messages.last();

                const recentMessages = messages.filter(
                    message =>
                        Date.now() - message.createdTimestamp <
                        14 * 24 * 60 * 60 * 1000
                );

                const oldMessages = messages.filter(
                    message =>
                        Date.now() - message.createdTimestamp >=
                        14 * 24 * 60 * 60 * 1000
                );

                if (recentMessages.size > 0) {
                    await channel.bulkDelete(recentMessages, true);
                }

                for (const message of oldMessages.values()) {
                    await message.delete();
                }

                before = oldestMessage.id;

                if (messages.size < 100) break;
            }
        }

        async function sendKey() {
            if (rotationRunning) return;

            rotationRunning = true;

            try {
                console.log("Deleting previous messages...");

                await deleteAllMessages();

                const newKey = generateKey(30);

                await channel.send(newKey);

                latestKey = newKey;

                console.log("Generated new key:", latestKey);

            } catch (error) {
                console.error("Key generation failed:", error);
            } finally {
                rotationRunning = false;
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
