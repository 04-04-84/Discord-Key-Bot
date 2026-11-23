
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

// Generate a random 30-character key
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

        console.log(`Found channel: #${channel.name}`);

        async function sendKey() {
            try {
                console.log("Deleting previous messages...");

                // Delete all messages in batches of up to 100.
                // Discord cannot bulk-delete messages older than 14 days.
                let messages;

                do {
                    messages = await channel.messages.fetch({
                        limit: 100
                    });

                    const recentMessages = messages.filter(
                        message =>
                            Date.now() - message.createdTimestamp <
                            14 * 24 * 60 * 60 * 1000
                    );

                    if (recentMessages.size > 0) {
                        await channel.bulkDelete(recentMessages, true);
                    }

                    // Stop if there are no more messages to fetch.
                    if (messages.size < 100) break;

                    // Stop if all fetched messages are too old.
                    if (recentMessages.size === 0) break;

                } while (messages.size === 100);

                // Generate and post the new key
                const newKey = generateKey(30);
                await channel.send(newKey);

                // Update the API key
                latestKey = newKey;

                console.log("Generated Key:", latestKey);

            } catch (error) {
                console.error("Key generation failed:", error);
            }
        }

        // Generate the first key immediately
        await sendKey();

        // Generate a new key every 6 hours
        setInterval(sendKey, 6 * 60 * 60 * 1000);

        console.log("6-hour key generation enabled.");

    } catch (error) {
        console.error("Discord setup error:", error);
    }
});

// Log in to Discord
if (!process.env.TOKEN) {
    console.error("Missing TOKEN environment variable!");
} else {
    client.login(process.env.TOKEN).catch(error => {
        console.error("Discord login failed:", error);
    });
}
