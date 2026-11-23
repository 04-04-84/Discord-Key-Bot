
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
                typeof c.send === "function" &&
                c.messages
            );

            if (channel) break;
        }

        if (!channel) {
            console.error("Could not find #key channel!");
            return;
        }

        console.log(`Found channel: #${channel.name}`);

        async function deleteAllMessages() {
            console.log("Deleting previous messages...");

            let before = undefined;
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;

            while (true) {
                const messages = await channel.messages.fetch({
                    limit: 100,
                    ...(before ? { before } : {})
                });

                if (messages.size === 0) {
                    break;
                }

                before = messages.last().id;

                const recentMessages = messages.filter(message =>
                    Date.now() - message.createdTimestamp < fourteenDays
                );

                const oldMessages = messages.filter(message =>
                    Date.now() - message.createdTimestamp >= fourteenDays
                );

                if (recentMessages.size > 0) {
                    await channel.bulkDelete(recentMessages, true);
                }

                for (const message of oldMessages.values()) {
                    await message.delete();
                }

                if (messages.size < 100) {
                    break;
                }
            }

            console.log("Finished deleting previous messages.");
        }

        async function sendKey() {
            if (rotationRunning) {
                return;
            }

            rotationRunning = true;

            try {
                try {
                    await deleteAllMessages();
                } catch (error) {
                    console.error("Message deletion failed:", error);
                }

                const newKey = generateKey(30);

                await channel.send(newKey);

                latestKey = newKey;

                console.log("New key generated successfully.");
                console.log("Key rotation completed.");

            } catch (error) {
                console.error("Key generation failed:", error);
            } finally {
                rotationRunning = false;
            }
        }

        await sendKey();

        setInterval(() => {
            sendKey();
        }, 30 * 1000);

        console.log("30-second key generation enabled.");

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
